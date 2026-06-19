"use client";

import { Progress } from "@/components/ui/progress";
import type { InspectionStats } from "@/types";

/**
 * Inspection progress bar. `embedded` renders just the inner content (for
 * placing inside another sticky container); otherwise it is sticky on its own.
 */
export function StickyProgress({
  stats,
  embedded,
}: {
  stats: InspectionStats;
  embedded?: boolean;
}) {
  const inner = (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
        <div className="flex gap-3">
          <span className="text-pass">Passed {stats.passed}</span>
          <span className="text-fail">Failed {stats.failed}</span>
          <span className="text-major">Pending {stats.pending}</span>
        </div>
        <span className="tabular-nums">{stats.completion}%</span>
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
  );

  if (embedded) return <div className="px-4 pb-2">{inner}</div>;

  return (
    <div className="safe-top sticky top-14 z-20 border-b bg-background/90 px-4 py-2 backdrop-blur">
      {inner}
    </div>
  );
}
