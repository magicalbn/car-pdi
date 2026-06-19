import { cn } from "@/lib/utils";
import type { InspectionStats } from "@/types";

export function StatGrid({ stats }: { stats: InspectionStats }) {
  const cells = [
    { label: "Sections", value: stats.totalSections, tone: "" },
    { label: "Checks", value: stats.totalChecks, tone: "" },
    { label: "Passed", value: stats.passed, tone: "text-pass" },
    { label: "Failed", value: stats.failed, tone: "text-fail" },
    { label: "N/A", value: stats.na, tone: "text-muted-foreground" },
    { label: "Pending", value: stats.pending, tone: "text-major" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border bg-card p-3 text-center"
        >
          <p className={cn("text-2xl font-bold tabular-nums", c.tone)}>
            {c.value}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}
