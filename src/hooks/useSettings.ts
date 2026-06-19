"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/dexie";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import type { Settings } from "@/types";

export function useSettings(): Settings {
  return useLiveQuery(
    async () => (await getDB().settings.get("settings")) ?? DEFAULT_SETTINGS,
    [],
    DEFAULT_SETTINGS
  );
}
