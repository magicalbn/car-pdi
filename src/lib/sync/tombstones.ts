"use client";

// Tracks inspections deleted locally so the cloud pull never re-hydrates them.
// A tombstone is cleared once the server confirms deletion (or there is no
// server). Persisted in localStorage so it survives reloads while offline.

const KEY = "perp-deleted-inspections";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // ignore quota / serialization errors
  }
}

export function addTombstone(id: string) {
  const ids = read();
  if (!ids.includes(id)) write([...ids, id]);
}

export function removeTombstone(id: string) {
  write(read().filter((x) => x !== id));
}

export function getTombstones(): string[] {
  return read();
}

export function isTombstoned(id: string): boolean {
  return read().includes(id);
}
