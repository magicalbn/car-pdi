"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { PhotoGrid } from "@/components/inspection/photo-grid";
import {
  LoadingInspection,
  NotFoundInspection,
} from "@/components/inspection/states";
import { useInspection } from "@/hooks/useInspection";
import { useInspectionPhotos } from "@/hooks/usePhotoUrls";
import { cn } from "@/lib/utils";

type GalleryFilter = "all" | "failed" | "evidence" | "checklist" | "quick";

const TABS: { key: GalleryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "failed", label: "Failed Items" },
  { key: "checklist", label: "Checklist" },
  { key: "evidence", label: "Evidence" },
  { key: "quick", label: "Quick" },
];

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>();
  const insp = useInspection(id);
  const { views } = useInspectionPhotos(id);
  const [filter, setFilter] = useState<GalleryFilter>("all");

  const failedItemIds = useMemo(() => {
    const set = new Set<string>();
    insp?.items.forEach((it) => {
      if (it.status === "FAIL") set.add(it.id);
    });
    return set;
  }, [insp]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "failed":
        return views.filter(
          (v) =>
            v.record.kind === "item" &&
            v.record.refKey &&
            failedItemIds.has(v.record.refKey)
        );
      case "evidence":
        return views.filter((v) => v.record.kind === "evidence");
      case "checklist":
        return views.filter((v) => v.record.kind === "item");
      case "quick":
        return views.filter((v) => v.record.kind === "quick");
      default:
        return views;
    }
  }, [views, filter, failedItemIds]);

  if (insp === undefined) return <LoadingInspection />;
  if (insp === null) return <NotFoundInspection />;

  return (
    <>
      <AppHeader
        title="Photo Gallery"
        subtitle={`${views.length} photo${views.length === 1 ? "" : "s"}`}
        backHref={`/inspections/${id}`}
      />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === t.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <PhotoGrid views={filtered} emptyLabel="No photos in this view" />
      </main>
    </>
  );
}
