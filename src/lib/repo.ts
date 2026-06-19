import { getDB, type PhotoRecord } from "@/lib/db/dexie";
import { compressImage } from "@/lib/image/compress";
import { createInspection, buildItems } from "@/lib/factory";
import { uid } from "@/lib/utils";
import { scheduleSync } from "@/lib/sync/syncEngine";
import { addTombstone, removeTombstone } from "@/lib/sync/tombstones";
import type {
  GlobalNotes,
  Inspection,
  InspectionItem,
  PhotoMeta,
  QuickCapture,
  Timeline,
  Vehicle,
} from "@/types";

function touch(insp: Inspection): Inspection {
  insp.updatedAt = Date.now();
  insp.dirty = true;
  return insp;
}

export async function listInspections(): Promise<Inspection[]> {
  const db = getDB();
  return db.inspections.orderBy("updatedAt").reverse().toArray();
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  return getDB().inspections.get(id);
}

export async function putInspection(insp: Inspection): Promise<void> {
  await getDB().inspections.put(insp);
  scheduleSync();
}

export async function createAndSaveInspection(
  vehicle: Vehicle
): Promise<Inspection> {
  const insp = createInspection(vehicle);
  await getDB().inspections.put(insp);
  scheduleSync();
  return insp;
}

export async function saveSampleInspection(
  insp: Inspection
): Promise<Inspection> {
  await getDB().inspections.put(insp);
  scheduleSync();
  return insp;
}

/**
 * Ensure an inspection contains every check from the current config. Existing
 * inspections were generated with whatever config existed at creation time, so
 * this merges in any newly-added checks (as PENDING) without touching existing
 * statuses/notes/photos.
 */
export async function reconcileItems(inspectionId: string): Promise<void> {
  const db = getDB();
  const insp = await db.inspections.get(inspectionId);
  if (!insp) return;
  const existing = new Set(insp.items.map((i) => i.id));
  const missing = buildItems().filter((it) => !existing.has(it.id));
  if (missing.length === 0) return;
  insp.items = [...insp.items, ...missing];
  touch(insp);
  await db.inspections.put(insp);
  scheduleSync();
}

export async function deleteInspection(id: string): Promise<void> {
  const db = getDB();
  await db.transaction("rw", db.inspections, db.photos, async () => {
    await db.inspections.delete(id);
    await db.photos.where("inspectionId").equals(id).delete();
  });

  // Tombstone so the cloud pull can't re-hydrate it before the server delete
  // lands (e.g. while offline).
  addTombstone(id);

  try {
    const res = await fetch(`/api/inspections/${id}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      // persisted === false means no DB configured → nothing to re-pull anyway.
      removeTombstone(id);
      void data;
    }
  } catch {
    // Offline: keep the tombstone; the next sync will flush the delete.
  }
}

async function mutate(
  inspectionId: string,
  fn: (insp: Inspection) => void
): Promise<Inspection | undefined> {
  const db = getDB();
  const insp = await db.inspections.get(inspectionId);
  if (!insp) return undefined;
  fn(insp);
  touch(insp);
  await db.inspections.put(insp);
  scheduleSync();
  return insp;
}

export async function updateItem(
  inspectionId: string,
  itemId: string,
  patch: Partial<InspectionItem>
) {
  return mutate(inspectionId, (insp) => {
    const it = insp.items.find((i) => i.id === itemId);
    if (it) Object.assign(it, patch, { timestamp: Date.now() });
  });
}

export async function setGlobalNotes(
  inspectionId: string,
  notes: Partial<GlobalNotes>
) {
  return mutate(inspectionId, (insp) => {
    insp.globalNotes = { ...insp.globalNotes, ...notes };
  });
}

export async function setTimeline(
  inspectionId: string,
  timeline: Partial<Timeline>
) {
  return mutate(inspectionId, (insp) => {
    insp.timeline = { ...insp.timeline, ...timeline };
  });
}

export async function setStatus(
  inspectionId: string,
  status: Inspection["status"]
) {
  return mutate(inspectionId, (insp) => {
    insp.status = status;
    if (status === "COMPLETED" && !insp.timeline.finishedAt) {
      insp.timeline.finishedAt = Date.now();
    }
  });
}

// ---- Quick capture ----

export async function addQuickCapture(
  inspectionId: string,
  note: string,
  photoIds: string[]
) {
  const qc: QuickCapture = {
    id: uid("qc"),
    note,
    photoIds,
    createdAt: Date.now(),
  };
  await mutate(inspectionId, (insp) => {
    insp.quickCaptureNotes = [qc, ...(insp.quickCaptureNotes ?? [])];
  });
  return qc;
}

export async function assignQuickCapture(
  inspectionId: string,
  quickId: string,
  itemId: string
) {
  return mutate(inspectionId, (insp) => {
    const qc = insp.quickCaptureNotes.find((q) => q.id === quickId);
    const item = insp.items.find((i) => i.id === itemId);
    if (qc && item) {
      qc.assignedItemId = itemId;
      item.photoIds = Array.from(new Set([...item.photoIds, ...qc.photoIds]));
      if (qc.note && !item.notes) item.notes = qc.note;
      if (item.status === "PENDING") item.status = "FAIL";
      item.timestamp = Date.now();
    }
  });
}

// ---- Photos ----

export async function addPhoto(
  inspectionId: string,
  kind: PhotoMeta["kind"],
  refKey: string | undefined,
  file: File | Blob,
  caption?: string
): Promise<PhotoRecord> {
  const db = getDB();
  const { blob, width, height } = await compressImage(file);
  const record: PhotoRecord = {
    id: uid("ph"),
    inspectionId,
    kind,
    refKey,
    caption,
    width,
    height,
    blob,
    createdAt: Date.now(),
    synced: false,
  };
  await db.photos.put(record);

  // Link to checklist item when applicable.
  if (kind === "item" && refKey) {
    await mutate(inspectionId, (insp) => {
      const it = insp.items.find((i) => i.id === refKey);
      if (it && !it.photoIds.includes(record.id)) it.photoIds.push(record.id);
    });
  } else {
    // bump inspection updatedAt so lists reflect new evidence/quick photos
    await mutate(inspectionId, () => {});
  }
  scheduleSync();
  return record;
}

export async function deletePhoto(photoId: string): Promise<void> {
  const db = getDB();
  const photo = await db.photos.get(photoId);
  await db.photos.delete(photoId);
  if (photo) {
    await mutate(photo.inspectionId, (insp) => {
      for (const it of insp.items) {
        it.photoIds = it.photoIds.filter((p) => p !== photoId);
      }
      for (const qc of insp.quickCaptureNotes) {
        qc.photoIds = qc.photoIds.filter((p) => p !== photoId);
      }
    });
  }
  scheduleSync();
}

export async function getPhoto(photoId: string): Promise<PhotoRecord | undefined> {
  return getDB().photos.get(photoId);
}

export async function getPhotos(inspectionId: string): Promise<PhotoRecord[]> {
  return getDB()
    .photos.where("inspectionId")
    .equals(inspectionId)
    .toArray();
}

export async function getPhotosByIds(ids: string[]): Promise<PhotoRecord[]> {
  if (!ids.length) return [];
  return getDB().photos.bulkGet(ids).then((r) => r.filter(Boolean) as PhotoRecord[]);
}
