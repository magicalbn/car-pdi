"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { PhotoViewer } from "@/components/inspection/photo-viewer";
import { deletePhoto } from "@/lib/repo";
import type { PhotoView } from "@/hooks/usePhotoUrls";
import { cn } from "@/lib/utils";

function useViewer(views: PhotoView[]) {
  const [open, setOpen] = React.useState<number | null>(null);
  const viewerPhotos = views.map((v) => ({
    id: v.id,
    url: v.url,
    caption: v.record.caption,
  }));
  const node =
    open !== null ? (
      <PhotoViewer
        photos={viewerPhotos}
        index={open}
        onClose={() => setOpen(null)}
        onDelete={async (id) => {
          await deletePhoto(id);
          setOpen(null);
        }}
      />
    ) : null;
  return { open: setOpen, node };
}

/** Compact inline strip used inside checklist items. */
export function PhotoStrip({
  views,
  size = 64,
  className,
}: {
  views: PhotoView[];
  size?: number;
  className?: string;
}) {
  const viewer = useViewer(views);
  if (!views.length) return null;
  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {views.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => viewer.open(i)}
            className="overflow-hidden rounded-lg border"
            style={{ width: size, height: size }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.url}
              alt={v.record.caption || "photo"}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
      {viewer.node}
    </>
  );
}

/** Full responsive gallery grid with hover delete. */
export function PhotoGrid({
  views,
  emptyLabel = "No photos",
  showDelete = true,
}: {
  views: PhotoView[];
  emptyLabel?: string;
  showDelete?: boolean;
}) {
  const viewer = useViewer(views);
  if (!views.length)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {views.map((v, i) => (
          <div
            key={v.id}
            className="group relative aspect-square overflow-hidden rounded-lg border"
          >
            <button
              type="button"
              onClick={() => viewer.open(i)}
              className="h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.url}
                alt={v.record.caption || "photo"}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
            {showDelete && (
              <button
                type="button"
                onClick={() => deletePhoto(v.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Delete photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            {v.record.caption && (
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                {v.record.caption}
              </span>
            )}
          </div>
        ))}
      </div>
      {viewer.node}
    </>
  );
}
