"use client";

import { getDB } from "@/lib/db/dexie";
import type { Settings } from "@/types";

export const DEFAULT_SETTINGS: Settings = {
  id: "settings",
  theme: "system",
  freshInventoryMaxMonths: 12,
  tyreFreshMaxMonths: 12,
  tyreModerateMaxMonths: 36,
  updatedAt: 0,
};

export async function getSettings(): Promise<Settings> {
  const s = await getDB().settings.get("settings");
  return s ?? DEFAULT_SETTINGS;
}

export async function saveSettings(
  patch: Partial<Omit<Settings, "id">>
): Promise<void> {
  const current = await getSettings();
  await getDB().settings.put({
    ...current,
    ...patch,
    id: "settings",
    updatedAt: Date.now(),
  });
}
