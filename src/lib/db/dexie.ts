import Dexie, { type Table } from "dexie";
import type { Inspection, PhotoMeta, Settings } from "@/types";

/** Photo record as stored in IndexedDB — metadata plus the binary blob. */
export interface PhotoRecord extends PhotoMeta {
  blob: Blob;
}

export class PerpDB extends Dexie {
  inspections!: Table<Inspection, string>;
  photos!: Table<PhotoRecord, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super("perp-db");
    this.version(1).stores({
      // Indexed fields only; full objects are stored regardless.
      inspections: "id, status, updatedAt, dirty",
      photos: "id, inspectionId, kind, refKey, synced",
      settings: "id",
    });
  }
}

let _db: PerpDB | null = null;

/** Lazily create the Dexie instance (browser-only). */
export function getDB(): PerpDB {
  if (typeof window === "undefined") {
    throw new Error("Dexie is only available in the browser");
  }
  if (!_db) {
    _db = new PerpDB();
  }
  return _db;
}
