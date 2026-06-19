"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FileDown,
  Printer,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/inspection/score-ring";
import { StatGrid } from "@/components/inspection/stat-grid";
import { CriticalBanner } from "@/components/inspection/critical-banner";
import { RecommendationCard } from "@/components/inspection/recommendation-card";
import { VehicleInfoCard } from "@/components/inspection/vehicle-info-card";
import { TimelineView } from "@/components/inspection/timeline";
import { PhotoGrid } from "@/components/inspection/photo-grid";
import {
  LoadingInspection,
  NotFoundInspection,
} from "@/components/inspection/states";
import { useInspection } from "@/hooks/useInspection";
import { useInspectionPhotos } from "@/hooks/usePhotoUrls";
import { summarize, displayScore } from "@/lib/scoring";
import { setStatus } from "@/lib/repo";
import { buildBundle, exportInspection } from "@/lib/export/backup";
import { downloadReport } from "@/lib/export/pdf";
import { sectionLabelFor } from "@/lib/labels";
import type { InspectionItem } from "@/types";

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const insp = useInspection(id);
  const { views } = useInspectionPhotos(id);
  const [pdfBusy, setPdfBusy] = useState(false);

  const summary = useMemo(() => (insp ? summarize(insp) : null), [insp]);

  const invalidItems = useMemo(() => {
    if (!insp) return [] as InspectionItem[];
    return insp.items.filter(
      (it) =>
        it.status === "FAIL" &&
        (!it.notes.trim() || it.photoIds.length === 0)
    );
  }, [insp]);

  if (insp === undefined) return <LoadingInspection />;
  if (insp === null) return <NotFoundInspection />;

  const { stats, scores, recommendation } = summary!;
  const failed = insp.items.filter((i) => i.status === "FAIL");
  const bySeverity = (sev: string) =>
    failed.filter((f) => f.severity === sev);
  const commitments = insp.items.filter(
    (i) => i.rectification?.dealerAction?.trim()
  );
  const canComplete = invalidItems.length === 0;

  async function handlePdf() {
    setPdfBusy(true);
    try {
      const bundle = await buildBundle(id);
      if (!bundle) throw new Error("not found");
      await downloadReport(bundle.inspection, summarize(bundle.inspection), bundle.photos);
      toast.success("PDF report generated");
    } catch {
      toast.error("Couldn't generate PDF");
    } finally {
      setPdfBusy(false);
    }
  }

  async function handleComplete() {
    if (!canComplete) {
      toast.error(
        `${invalidItems.length} failed item(s) need notes & a photo first`
      );
      return;
    }
    await setStatus(id, "COMPLETED");
    toast.success("Inspection marked complete");
  }

  return (
    <>
      <AppHeader
        title="Summary"
        subtitle={`${insp.vehicle.make} ${insp.vehicle.model}`}
        backHref={`/inspections/${id}`}
      />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        {/* Export actions */}
        <div className="no-print grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={handlePdf} disabled={pdfBusy}>
            {pdfBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const ok = await exportInspection(id);
              if (ok) toast.success("JSON backup downloaded");
              else toast.error("Export failed");
            }}
          >
            <Download className="h-4 w-4" /> JSON
          </Button>
        </div>

        <CriticalBanner count={stats.criticalFailures} />

        <Card>
          <CardContent className="flex flex-col items-center gap-5 p-5 sm:flex-row">
            <ScoreRing score={scores.overall} label="Overall" />
            <div className="flex-1 space-y-3">
              <RecommendationCard
                recommendation={recommendation.recommendation}
                title={recommendation.title}
                detail={recommendation.detail}
              />
              <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                {[
                  ["Exterior", scores.exterior],
                  ["Interior", scores.interior],
                  ["Mechanical", scores.mechanical],
                  ["Electronics", scores.electronics],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-lg border p-2">
                    <p className="text-lg font-bold tabular-nums">
                      {displayScore(v as number | null)}
                    </p>
                    <p className="text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <StatGrid stats={stats} />
        <VehicleInfoCard vehicle={insp.vehicle} />

        {/* Issues by severity */}
        {failed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Failed Items ({failed.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["CRITICAL", "MAJOR", "MINOR"] as const).map((sev) => {
                const list = bySeverity(sev);
                if (!list.length) return null;
                return (
                  <div key={sev}>
                    <Badge
                      variant={
                        sev === "CRITICAL"
                          ? "critical"
                          : sev === "MAJOR"
                          ? "major"
                          : "minor"
                      }
                      className="mb-2"
                    >
                      {sev} · {list.length}
                    </Badge>
                    <ul className="space-y-2">
                      {list.map((it) => (
                        <li
                          key={it.id}
                          className="rounded-lg border border-fail/20 bg-fail/[0.04] p-2.5"
                        >
                          <p className="text-sm font-medium">{it.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {sectionLabelFor(it.sectionKey)}
                          </p>
                          {it.notes && (
                            <p className="mt-1 text-xs">{it.notes}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Dealer commitments */}
        {commitments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dealer Commitments ({commitments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {commitments.map((it) => (
                <div key={it.id} className="rounded-lg border p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{it.label}</p>
                    <Badge
                      variant={
                        it.rectification?.resolutionStatus === "RESOLVED"
                          ? "pass"
                          : it.rectification?.resolutionStatus === "REJECTED"
                          ? "fail"
                          : "secondary"
                      }
                    >
                      {it.rectification?.resolutionStatus}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {it.rectification?.dealerAction}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineView inspectionId={id} timeline={insp.timeline} />
          </CardContent>
        </Card>

        {/* Notes */}
        {Object.values(insp.globalNotes).some((v) => v?.trim()) && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {insp.globalNotes.dealerFeedback && (
                <NoteBlock label="Dealer Feedback" value={insp.globalNotes.dealerFeedback} />
              )}
              {insp.globalNotes.negotiationNotes && (
                <NoteBlock label="Negotiation" value={insp.globalNotes.negotiationNotes} />
              )}
              {insp.globalNotes.pendingCommitments && (
                <NoteBlock label="Pending Commitments" value={insp.globalNotes.pendingCommitments} />
              )}
              {insp.globalNotes.additionalObservations && (
                <NoteBlock label="Observations" value={insp.globalNotes.additionalObservations} />
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Photos ({views.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoGrid views={views} showDelete={false} emptyLabel="No photos captured" />
          </CardContent>
        </Card>

        {/* Complete */}
        <div className="no-print">
          {!canComplete && (
            <p className="mb-2 flex items-center gap-1.5 text-sm text-major">
              <AlertTriangle className="h-4 w-4" />
              {invalidItems.length} failed item(s) need notes and a photo before
              completing.
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            variant={canComplete ? "success" : "outline"}
            onClick={handleComplete}
            disabled={!canComplete}
          >
            <CheckCircle2 className="h-5 w-5" />
            {insp.status === "COMPLETED"
              ? "Inspection Complete"
              : "Complete Inspection"}
          </Button>
        </div>
      </main>
    </>
  );
}

function NoteBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="whitespace-pre-wrap">{value}</p>
    </div>
  );
}
