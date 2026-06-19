"use client";

import { useMemo, useState } from "react";
import { Disc, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decodeDot } from "@/lib/tyre/dot";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

export function TyreDotTool() {
  const [code, setCode] = useState("");
  const settings = useSettings();
  const info = useMemo(
    () =>
      decodeDot(
        code,
        settings.tyreFreshMaxMonths,
        settings.tyreModerateMaxMonths
      ),
    [code, settings.tyreFreshMaxMonths, settings.tyreModerateMaxMonths]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Disc className="h-5 w-5 text-primary" /> Tyre DOT Decoder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>DOT Code (last 4 digits)</Label>
          <Input
            value={code}
            inputMode="numeric"
            placeholder="e.g. 2626"
            maxLength={4}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="font-mono text-lg tracking-widest"
          />
        </div>

        {info.valid ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Week" value={`${info.week}`} />
            <Stat label="Year" value={`${info.year}`} />
            <Stat label="Age" value={info.ageLabel} />
            <div
              className={cn(
                "col-span-3 inline-flex items-center justify-center gap-1.5 rounded-lg p-2 text-sm font-semibold",
                info.freshness === "FRESH"
                  ? "bg-pass/15 text-pass"
                  : info.freshness === "MODERATE"
                  ? "bg-minor/15 text-minor"
                  : "bg-fail/15 text-fail"
              )}
            >
              {info.freshness === "OLD" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {info.message}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{info.message}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-2">
      <p className="text-base font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
