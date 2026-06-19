"use client";

import { getDB } from "@/lib/db/dexie";
import { blobToDataUrl, dataUrlToBlob } from "@/lib/image/compress";
import { scheduleSync } from "@/lib/sync/syncEngine";
import { uid } from "@/lib/utils";
import type { Inspection, InspectionBundle, PhotoTransport } from "@/types";

const BUNDLE_VERSION = 1;

export async function buildBundle(
  inspectionId: string
): Promise<InspectionBundle | null> {
  const db = getDB();
  const inspection = await db.inspections.get(inspectionId);
  if (!inspection) return null;

  const photoRecords = await db.photos
    .where("inspectionId")
    .equals(inspectionId)
    .toArray();

  const photos: PhotoTransport[] = [];
  for (const p of photoRecords) {
    const { blob, ...meta } = p;
    photos.push({ ...meta, dataUrl: await blobToDataUrl(blob) });
  }

  return {
    version: BUNDLE_VERSION,
    exportedAt: Date.now(),
    inspection,
    photos,
  };
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportInspection(inspectionId: string): Promise<boolean> {
  const bundle = await buildBundle(inspectionId);
  if (!bundle) return false;
  const v = bundle.inspection.vehicle;
  const safe = `${v.make}-${v.model}-${v.vin || "vehicle"}`
    .replace(/[^a-z0-9-]+/gi, "-")
    .toLowerCase();
  download(`perp-${safe}.json`, JSON.stringify(bundle, null, 2));
  return true;
}

/** Import a bundle, assigning fresh ids to avoid clobbering existing data. */
export async function importInspection(file: File): Promise<string> {
  const text = await file.text();
  const bundle = JSON.parse(text) as InspectionBundle;
  if (!bundle?.inspection) throw new Error("Invalid backup file");

  const db = getDB();
  const newInspId = uid("insp");
  const now = Date.now();

  // Remap photo ids.
  const photoIdMap = new Map<string, string>();
  for (const p of bundle.photos ?? []) {
    photoIdMap.set(p.id, uid("ph"));
  }

  const inspection: Inspection = {
    ...bundle.inspection,
    id: newInspId,
    items: bundle.inspection.items.map((it) => ({
      ...it,
      photoIds: it.photoIds.map((pid) => photoIdMap.get(pid) ?? pid),
    })),
    quickCaptureNotes: (bundle.inspection.quickCaptureNotes ?? []).map((q) => ({
      ...q,
      photoIds: q.photoIds.map((pid) => photoIdMap.get(pid) ?? pid),
    })),
    createdAt: bundle.inspection.createdAt ?? now,
    updatedAt: now,
    dirty: true,
    syncedAt: undefined,
  };

  await db.transaction("rw", db.inspections, db.photos, async () => {
    await db.inspections.put(inspection);
    for (const p of bundle.photos ?? []) {
      const { dataUrl, ...meta } = p;
      await db.photos.put({
        ...meta,
        id: photoIdMap.get(p.id) ?? uid("ph"),
        inspectionId: newInspId,
        synced: false,
        serverPath: undefined,
        blob: dataUrlToBlob(dataUrl),
      });
    }
  });

  scheduleSync();
  return newInspId;
}
