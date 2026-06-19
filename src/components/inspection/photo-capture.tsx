"use client";

import * as React from "react";
import { Camera, ImagePlus, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addPhoto } from "@/lib/repo";
import type { PhotoMeta } from "@/types";
import { cn } from "@/lib/utils";

export function PhotoCapture({
  inspectionId,
  kind,
  refKey,
  variant = "buttons",
  className,
  onAdded,
}: {
  inspectionId: string;
  kind: PhotoMeta["kind"];
  refKey?: string;
  variant?: "buttons" | "dropzone";
  className?: string;
  onAdded?: () => void;
}) {
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    try {
      for (const file of list) {
        await addPhoto(inspectionId, kind, refKey, file);
      }
      toast.success(
        `${list.length} photo${list.length === 1 ? "" : "s"} added`
      );
      onAdded?.();
    } catch (err) {
      console.error(err);
      toast.error("Couldn't add photo");
    } finally {
      setBusy(false);
    }
  }

  const inputs = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </>
  );

  if (variant === "dropzone") {
    return (
      <div className={className}>
        {inputs}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "hover:border-primary/50 hover:bg-accent/40"
          )}
        >
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="h-7 w-7 text-muted-foreground" />
          )}
          <p className="text-sm font-medium">Drop photos or tap to upload</p>
          <p className="text-xs text-muted-foreground">
            Camera capture supported on mobile
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                cameraRef.current?.click();
              }}
            >
              <Camera className="h-4 w-4" /> Camera
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {inputs}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => cameraRef.current?.click()}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        Camera
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        <ImagePlus className="h-4 w-4" /> Upload
      </Button>
    </div>
  );
}
