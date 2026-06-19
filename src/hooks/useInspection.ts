"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/dexie";

/**
 * Live inspection by id.
 * - `undefined` while loading
 * - `null` when not found
 */
export function useInspection(id: string | undefined) {
  return useLiveQuery(
    async () => {
      if (!id) return null;
      const insp = await getDB().inspections.get(id);
      return insp ?? null;
    },
    [id],
    undefined
  );
}
