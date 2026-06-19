"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoCapture } from "@/components/inspection/photo-capture";
import { PhotoStrip } from "@/components/inspection/photo-grid";
import { SectionIcon } from "@/components/inspection/section-icon";
import { TyreDotTool } from "@/components/inspection/tyre-dot-tool";
import {
  LoadingInspection,
  NotFoundInspection,
} from "@/components/inspection/states";
import { useInspection } from "@/hooks/useInspection";
import { useInspectionPhotos } from "@/hooks/usePhotoUrls";
import { EVIDENCE_SLOTS } from "@/config/evidence";
import type { PhotoView } from "@/hooks/usePhotoUrls";

export default function EvidencePage() {
  const { id } = useParams<{ id: string }>();
  const insp = useInspection(id);
  const { views } = useInspectionPhotos(id);

  const bySlot = useMemo(() => {
    const m = new Map<string, PhotoView[]>();
    for (const v of views) {
      if (v.record.kind === "evidence" && v.record.refKey) {
        const arr = m.get(v.record.refKey) ?? [];
        arr.push(v);
        m.set(v.record.refKey, arr);
      }
    }
    return m;
  }, [views]);

  if (insp === undefined) return <LoadingInspection />;
  if (insp === null) return <NotFoundInspection />;

  const captured = EVIDENCE_SLOTS.filter((s) => bySlot.get(s.key)?.length).length;

  return (
    <>
      <AppHeader
        title="Vehicle Evidence"
        subtitle={`${captured}/${EVIDENCE_SLOTS.length} captured`}
        backHref={`/inspections/${id}`}
      />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        <p className="text-sm text-muted-foreground">
          Capture key reference photos of the vehicle. These appear in the final
          report.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EVIDENCE_SLOTS.map((slot) => {
            const photos = bySlot.get(slot.key) ?? [];
            return (
              <Card key={slot.key}>
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SectionIcon
                        name={slot.icon}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm font-semibold">
                        {slot.label}
                      </span>
                    </div>
                    {photos.length > 0 ? (
                      <Badge variant="pass">{photos.length}</Badge>
                    ) : (
                      <Badge variant="na">Empty</Badge>
                    )}
                  </div>
                  {slot.hint && (
                    <p className="mb-2 text-xs text-muted-foreground">
                      {slot.hint}
                    </p>
                  )}
                  {photos.length > 0 && (
                    <PhotoStrip views={photos} size={56} className="mb-2" />
                  )}
                  <PhotoCapture
                    inspectionId={id}
                    kind="evidence"
                    refKey={slot.key}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <TyreDotTool />
      </main>
    </>
  );
}
