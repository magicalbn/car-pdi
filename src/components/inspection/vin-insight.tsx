"use client";

import { useMemo } from "react";
import { CalendarClock, Sparkles, AlertTriangle } from "lucide-react";
import { decodeVin } from "@/lib/vin/decode";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

export function VinInsight({
  vin,
  className,
}: {
  vin: string;
  className?: string;
}) {
  const settings = useSettings();
  const info = useMemo(
    () => decodeVin(vin, settings.freshInventoryMaxMonths),
    [vin, settings.freshInventoryMaxMonths]
  );

  if (!vin || vin.length < 10) return null;

  if (!info.valid) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        {info.message}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-2.5 text-xs",
        className
      )}
    >
      <span className="inline-flex items-center gap-1 font-medium">
        <CalendarClock className="h-3.5 w-3.5" /> Model year {info.modelYear}
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        Age {info.ageYears} year{info.ageYears === 1 ? "" : "s"}
      </span>
      <span
        className={cn(
          "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
          info.fresh ? "bg-pass/15 text-pass" : "bg-major/15 text-major"
        )}
      >
        {info.fresh ? (
          <Sparkles className="h-3 w-3" />
        ) : (
          <AlertTriangle className="h-3 w-3" />
        )}
        {info.fresh ? "Fresh inventory" : "Aged inventory"}
      </span>
    </div>
  );
}
