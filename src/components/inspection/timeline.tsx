"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setTimeline } from "@/lib/repo";
import { formatDateTime } from "@/lib/utils";
import type { Timeline } from "@/types";

const STEPS: { key: keyof Timeline; label: string }[] = [
  { key: "startedAt", label: "Inspection Started" },
  { key: "exteriorCompletedAt", label: "Exterior Completed" },
  { key: "testDriveCompletedAt", label: "Test Drive Completed" },
  { key: "finishedAt", label: "Inspection Finished" },
];

export function TimelineView({
  inspectionId,
  timeline,
  editable = true,
}: {
  inspectionId: string;
  timeline: Timeline;
  editable?: boolean;
}) {
  return (
    <ol className="relative space-y-4 pl-2">
      {STEPS.map((step, i) => {
        const t = timeline[step.key];
        const done = Boolean(t);
        return (
          <li key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-pass" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              {i < STEPS.length - 1 && (
                <span className="mt-1 h-6 w-px bg-border" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{step.label}</p>
              {done ? (
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(t)}
                </p>
              ) : editable ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2 h-7 text-xs text-primary"
                  onClick={() =>
                    setTimeline(inspectionId, { [step.key]: Date.now() })
                  }
                >
                  Mark done
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Pending</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
