"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Share2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveImageToDevice, canShareFiles } from "@/lib/image/save";
import { cn } from "@/lib/utils";

export interface ViewerPhoto {
  id: string;
  url: string;
  caption?: string;
}

export function PhotoViewer({
  photos,
  index,
  onClose,
  onDelete,
}: {
  photos: ViewerPhoto[];
  index: number;
  onClose: () => void;
  onDelete?: (id: string) => void;
}) {
  const [current, setCurrent] = React.useState(index);
  const [zoomed, setZoomed] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => setCurrent(index), [index]);
  React.useEffect(() => setCanShare(canShareFiles()), []);

  const go = React.useCallback(
    (dir: number) => {
      setZoomed(false);
      setCurrent((c) => (c + dir + photos.length) % photos.length);
    },
    [photos.length]
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const photo = photos[current];

  const handleSave = React.useCallback(async () => {
    if (!photo) return;
    setSaving(true);
    try {
      const blob = await (await fetch(photo.url)).blob();
      const safe =
        (photo.caption || `perp-photo-${photo.id}`)
          .replace(/[^a-z0-9]+/gi, "-")
          .toLowerCase() + ".jpg";
      const result = await saveImageToDevice(blob, safe);
      if (result === "shared") toast.success("Choose “Save to Photos”");
      else if (result === "downloaded") toast.success("Image saved");
    } catch {
      toast.error("Couldn't save image");
    } finally {
      setSaving(false);
    }
  }, [photo]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-fade-in">
      <div className="safe-top flex items-center justify-between p-3 text-white pt-10">
        <span className="text-sm text-white/70">
          {current + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={saving}
            className="text-white hover:bg-white/10"
            onClick={handleSave}
          >
            {canShare ? (
              <Share2 className="h-5 w-5" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {canShare ? "Save to Photos" : "Save"}
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-fail"
              onClick={() => onDelete(photo.id)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {photos.length > 1 && (
          <button
            onClick={() => go(-1)}
            className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || "Inspection photo"}
          onClick={() => setZoomed((z) => !z)}
          className={cn(
            "max-h-full max-w-full select-none object-contain transition-transform duration-200",
            zoomed ? "scale-[2.2] cursor-zoom-out" : "cursor-zoom-in"
          )}
        />
        {photos.length > 1 && (
          <button
            onClick={() => go(1)}
            className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {photo.caption && (
        <div className="safe-bottom p-4 text-center text-sm text-white/80">
          {photo.caption}
        </div>
      )}
    </div>
  );
}
