"use client";

import { getDB, type PerpDB } from "@/lib/db/dexie";
import { getTombstones, removeTombstone } from "@/lib/sync/tombstones";
import type { Inspection } from "@/types";

type SyncState = {
  online: boolean;
  syncing: boolean;
  lastSyncedAt: number | null;
  configured: boolean | null;
  pending: number;
  error: string | null;
};

type Listener = (s: SyncState) => void;

const state: SyncState = {
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  syncing: false,
  lastSyncedAt: null,
  configured: null,
  pending: 0,
  error: null,
};

const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l({ ...state });
}

export function subscribeSync(l: Listener): () => void {
  listeners.add(l);
  l({ ...state });
  return () => listeners.delete(l);
}

export function getSyncState(): SyncState {
  return { ...state };
}

let debounce: ReturnType<typeof setTimeout> | null = null;

/** Request a sync soon (debounced). Safe to call after every mutation. */
export function scheduleSync(delay = 1200) {
  if (typeof window === "undefined") return;
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    void pushPending();
  }, delay);
}

async function checkConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    state.configured = Boolean(data.configured);
    return state.configured;
  } catch {
    state.configured = false;
    return false;
  }
}

async function countPending(): Promise<number> {
  const db = getDB();
  // Photos are local-only (never synced), so only inspection docs count.
  state.pending = await db.inspections.filter((i) => i.dirty).count();
  return state.pending;
}

export async function pushPending(): Promise<void> {
  if (typeof window === "undefined") return;
  if (state.syncing) return;
  if (!navigator.onLine) {
    state.online = false;
    emit();
    return;
  }
  state.online = true;
  state.syncing = true;
  state.error = null;
  emit();

  try {
    const configured = await checkConfigured();
    await countPending();
    if (!configured) {
      // Offline-only mode: nothing to push, keep records dirty for later.
      state.syncing = false;
      emit();
      return;
    }

    const db = getDB();

    // 1) Push local changes up.
    const dirty = await db.inspections.filter((i) => i.dirty).toArray();
    for (const insp of dirty) {
      await syncInspection(insp);
    }

    // 2) Pull remote inspections down (hydrates a fresh origin/device).
    await pullFromServer(db);

    state.lastSyncedAt = Date.now();
    await countPending();
  } catch (err) {
    state.error = err instanceof Error ? err.message : "Sync failed";
  } finally {
    state.syncing = false;
    emit();
  }
}

async function syncInspection(insp: Inspection) {
  const db = getDB();

  // Photos are intentionally NOT uploaded — they live only in IndexedDB on the
  // capturing device. Only the inspection record (text/metadata) is synced.
  const res = await fetch("/api/inspections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insp),
  });
  if (!res.ok) throw new Error(`Inspection sync failed (${res.status})`);

  await db.inspections.update(insp.id, {
    dirty: false,
    syncedAt: Date.now(),
  });
}

const toNum = (v: unknown): number => {
  if (typeof v === "number") return v;
  const n = new Date(v as string).getTime();
  return Number.isNaN(n) ? 0 : n;
};

function mapInspection(doc: any, id: string, updatedAt: number): Inspection {
  return {
    id,
    vehicle: doc.vehicle ?? {},
    status: doc.status ?? "IN_PROGRESS",
    items: Array.isArray(doc.items) ? doc.items : [],
    globalNotes: doc.globalNotes ?? {
      dealerFeedback: "",
      negotiationNotes: "",
      pendingCommitments: "",
      additionalObservations: "",
    },
    timeline: doc.timeline ?? {},
    quickCaptureNotes: Array.isArray(doc.quickCaptureNotes)
      ? doc.quickCaptureNotes
      : [],
    createdAt: toNum(doc.createdAt) || updatedAt,
    updatedAt,
    dirty: false,
    syncedAt: Date.now(),
  };
}

/** Fetch inspections (and their photos) from MongoDB into the local store. */
async function pullFromServer(db: PerpDB) {
  const res = await fetch("/api/inspections", { cache: "no-store" });
  if (!res.ok) return;
  const data = await res.json();
  if (data.configured === false) return;
  const remotes: any[] = Array.isArray(data.inspections)
    ? data.inspections
    : [];

  const tombstoned = new Set(getTombstones());
  const remoteIds = new Set<string>();

  for (const doc of remotes) {
    const id: string | undefined = doc._id ?? doc.id;
    if (!id) continue;
    remoteIds.add(id);

    // Locally-deleted: don't re-add — instead flush the delete to the server.
    if (tombstoned.has(id)) {
      try {
        const del = await fetch(`/api/inspections/${id}`, { method: "DELETE" });
        if (del.ok) removeTombstone(id);
      } catch {
        // stay tombstoned; retry next sync
      }
      continue;
    }

    const local = await db.inspections.get(id);
    if (local?.dirty) continue; // never clobber unsynced local edits
    const remoteUpdated = toNum(doc.updatedAt);
    if (local && toNum(local.updatedAt) >= remoteUpdated) continue;

    await db.inspections.put(mapInspection(doc, id, remoteUpdated));
    // Photos are local-only — nothing to pull from the server.
  }

  // Server is authoritative: remove local inspections that were already synced
  // but no longer exist on the server (i.e. deleted on another port/device).
  // Dirty (unsynced) records are kept — they haven't been pushed yet.
  const locals = await db.inspections.toArray();
  for (const local of locals) {
    if (local.dirty) continue;
    if (remoteIds.has(local.id)) continue;
    await db.transaction("rw", db.inspections, db.photos, async () => {
      await db.inspections.delete(local.id);
      await db.photos.where("inspectionId").equals(local.id).delete();
    });
  }

  // Drop tombstones for inspections that no longer exist on the server.
  for (const id of tombstoned) {
    if (!remoteIds.has(id)) removeTombstone(id);
  }
}

let initialized = false;

/** Wire up online/offline + background sync. Call once on app mount. */
export function initSync() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  window.addEventListener("online", () => {
    state.online = true;
    emit();
    void pushPending();
  });
  window.addEventListener("offline", () => {
    state.online = false;
    emit();
  });

  // Hydrate from the cloud + push local changes shortly after load.
  scheduleSync(1000);
}
