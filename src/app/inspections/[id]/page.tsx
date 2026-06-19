"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  ListChecks,
  Camera,
  StickyNote,
  Zap,
  FileText,
  Clock,
  LayoutList,
} from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/inspection/score-ring";
import { StatGrid } from "@/components/inspection/stat-grid";
import { CriticalBanner } from "@/components/inspection/critical-banner";
import { VehicleInfoCard } from "@/components/inspection/vehicle-info-card";
import { RecommendationCard } from "@/components/inspection/recommendation-card";
import { InspectionSearch } from "@/components/inspection/inspection-search";
import { useInspection } from "@/hooks/useInspection";
import { summarize, sectionProgress, displayScore } from "@/lib/scoring";
import { CHECKLIST } from "@/config/checklist";
import { relativeTime } from "@/lib/utils";
import { NotFoundInspection, LoadingInspection } from "@/components/inspection/states";

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const insp = useInspection(id);

  const summary = useMemo(() => (insp ? summarize(insp) : null), [insp]);
  const progress = useMemo(
    () => (insp ? sectionProgress(insp.items) : null),
    [insp]
  );

  if (insp === undefined) return <LoadingInspection />;
  if (insp === null) return <NotFoundInspection />;

  const { stats, scores, recommendation } = summary!;
  const base = `/inspections/${id}`;

  const scoreBars = [
    { label: "Exterior", value: scores.exterior },
    { label: "Interior", value: scores.interior },
    { label: "Mechanical", value: scores.mechanical },
    { label: "Electronics", value: scores.electronics },
  ];

  const quickLinks = [
    { href: `${base}/inspect`, label: "Inspect", icon: ListChecks },
    { href: `${base}/evidence`, label: "Evidence", icon: Camera },
    { href: `${base}/quick`, label: "Quick Capture", icon: Zap },
    { href: `${base}/notes`, label: "Notes", icon: StickyNote },
    { href: `${base}/summary`, label: "Summary", icon: FileText },
  ];

  return (
    <>
      <AppHeader
        title={`${insp.vehicle.make} ${insp.vehicle.model}`}
        subtitle={insp.vehicle.variant || insp.vehicle.dealerName}
        backHref="/"
        right={<InspectionSearch inspectionId={id} />}
      />
      <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-5">
        <CriticalBanner count={stats.criticalFailures} />

        <Card>
          <CardContent className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-center">
            <ScoreRing score={scores.overall} label="Overall" />
            <div className="w-full flex-1 space-y-3">
              <RecommendationCard
                recommendation={recommendation.recommendation}
                title={recommendation.title}
                detail={recommendation.detail}
              />
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">
                    {stats.completion}% complete
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {relativeTime(insp.updatedAt)}
                  </span>
                </div>
                <Progress value={stats.completion} />
              </div>
            </div>
          </CardContent>
        </Card>

        <StatGrid stats={stats} />

        <VehicleInfoCard vehicle={insp.vehicle} />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {quickLinks.map((q) => {
            const Icon = q.icon;
            return (
              <Button
                key={q.href}
                asChild
                variant="outline"
                className="h-auto flex-col gap-1.5 py-3"
              >
                <Link href={q.href}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{q.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scoreBars.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{b.label}</span>
                  <span className="font-semibold tabular-nums">
                    {displayScore(b.value)}
                  </span>
                </div>
                <Progress
                  value={b.value ?? 0}
                  indicatorClassName={
                    b.value == null
                      ? "bg-muted-foreground/30"
                      : b.value >= 90
                      ? "bg-pass"
                      : b.value >= 70
                      ? "bg-major"
                      : "bg-fail"
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CHECKLIST.map((section) => {
              const p = progress!.get(section.key) ?? { done: 0, total: 0 };
              const complete = p.total > 0 && p.done === p.total;
              return (
                <Link
                  key={section.key}
                  href={`${base}/inspect/${section.key}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-accent"
                >
                  <span>{section.label}</span>
                  <span
                    className={
                      complete
                        ? "font-semibold text-pass"
                        : "text-muted-foreground"
                    }
                  >
                    {p.done}/{p.total} {complete ? "✓" : ""}
                  </span>
                </Link>
              );
            })}

            <Link
              href={`${base}/inspect/all`}
              className="mt-1 flex items-center justify-between rounded-lg border-t px-2 pb-1 pt-3 text-sm font-medium hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <LayoutList className="h-4 w-4 text-primary" /> All Checks
              </span>
              <span
                className={
                  stats.pending === 0 && stats.totalChecks > 0
                    ? "font-semibold text-pass"
                    : "text-muted-foreground"
                }
              >
                {stats.totalChecks - stats.pending}/{stats.totalChecks}{" "}
                {stats.pending === 0 && stats.totalChecks > 0 ? "✓" : ""}
              </span>
            </Link>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
