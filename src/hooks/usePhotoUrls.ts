"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB, type PhotoRecord } from "@/lib/db/dexie";

export interface PhotoView {
  id: string;
  url: string;
  record: PhotoRecord;
}

/** Live photos for an inspection, with managed object URLs. */
export function useInspectionPhotos(inspectionId: string | undefined) {
  const records = useLiveQuery(
    async () =>
      inspectionId
        ? getDB().photos.where("inspectionId").equals(inspectionId).toArray()
        : [],
    [inspectionId],
    [] as PhotoRecord[]
  );

  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const r of records ?? []) {
      map[r.id] = URL.createObjectURL(r.blob);
    }
    setUrls(map);
    return () => {
      for (const u of Object.values(map)) URL.revokeObjectURL(u);
    };
  }, [records]);

  const views: PhotoView[] = useMemo(
    () =>
      (records ?? [])
        .filter((r) => urls[r.id])
        .map((r) => ({ id: r.id, url: urls[r.id], record: r })),
    [records, urls]
  );

  return { records: records ?? [], views };
}
