"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import {
  Plus,
  ClipboardList,
  Car,
  Gauge,
  Trash2,
  Sparkles,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/inspection/empty-state";
import { RecommendationBadge } from "@/components/inspection/recommendation-badge";
import { getDB } from "@/lib/db/dexie";
import { deleteInspection, saveSampleInspection } from "@/lib/repo";
import { createSampleInspection } from "@/lib/factory";
import { summarize, displayScore } from "@/lib/scoring";
import { relativeTime } from "@/lib/utils";
import type { Inspection } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const inspections = useLiveQuery(
    () => getDB().inspections.orderBy("updatedAt").reverse().toArray(),
    [],
    undefined
  );

  async function handleSample() {
    const insp = createSampleInspection();
    await saveSampleInspection(insp);
    toast.success("Sample inspection created");
    router.push(`/inspections/${insp.id}`);
  }

  async function handleDelete(id: string) {
    await deleteInspection(id);
    toast.success("Inspection deleted");
  }

  return (
    <div className="min-h-dvh pb-24">
      <AppHeader
        title="PERP"
        subtitle="Pre-Delivery Inspections"
        right={
          <Button asChild variant="ghost" size="icon" aria-label="Settings">
            <Link href="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Inspections</h2>
            <p className="text-sm text-muted-foreground">
              {inspections?.length
                ? `${inspections.length} inspection${
                    inspections.length === 1 ? "" : "s"
                  }`
                : "Start your first inspection"}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/inspections/new">
              <Plus className="h-5 w-5" /> New
            </Link>
          </Button>
        </div>

        {inspections === undefined ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-muted/60"
              />
            ))}
          </div>
        ) : inspections.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No inspections yet"
            description="Create a new pre-delivery inspection or load a sample to explore the app."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild>
                  <Link href="/inspections/new">
                    <Plus className="h-4 w-4" /> New Inspection
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSample}>
                  <Sparkles className="h-4 w-4" /> Load Sample
                </Button>
              </div>
            }
          />
        ) : (
          <ul className="space-y-3">
            {inspections.map((insp, i) => (
              <motion.li
                key={insp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <InspectionRow insp={insp} onDelete={handleDelete} />
              </motion.li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function InspectionRow({
  insp,
  onDelete,
}: {
  insp: Inspection;
  onDelete: (id: string) => void;
}) {
  const { stats, scores, recommendation } = summarize(insp);
  const { vehicle } = insp;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <Link
          href={`/inspections/${insp.id}`}
          className="block p-4 active:bg-accent/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">
                {vehicle.make} {vehicle.model}
                {vehicle.variant ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {vehicle.variant}
                  </span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {vehicle.dealerName || "—"} · Updated{" "}
                {relativeTime(insp.updatedAt)}
              </p>
            </div>
            <RecommendationBadge
              recommendation={recommendation.recommendation}
            />
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> {vehicle.vin || "No VIN"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" /> Score {displayScore(scores.overall)}
            </span>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">{stats.completion}% complete</span>
              <span className="text-muted-foreground">
                {stats.passed} pass · {stats.failed} fail · {stats.pending} left
              </span>
            </div>
            <Progress
              value={stats.completion}
              indicatorClassName={
                stats.criticalFailures > 0
                  ? "bg-fail"
                  : stats.failed > 0
                  ? "bg-major"
                  : "bg-pass"
              }
            />
          </div>
        </Link>
        <div className="flex items-center justify-end border-t px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-fail"
            onClick={() => onDelete(insp.id)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
