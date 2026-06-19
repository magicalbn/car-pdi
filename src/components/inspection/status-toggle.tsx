"use client";

import { Check, X, MinusCircle } from "lucide-react";
import type { ItemStatus } from "@/types";
import { cn } from "@/lib/utils";

const OPTIONS: {
  value: Exclude<ItemStatus, "PENDING">;
  label: string;
  icon: typeof Check;
  active: string;
}[] = [
  { value: "PASS", label: "Pass", icon: Check, active: "bg-pass text-pass-foreground border-pass" },
  { value: "FAIL", label: "Fail", icon: X, active: "bg-fail text-fail-foreground border-fail" },
  { value: "NA", label: "N/A", icon: MinusCircle, active: "bg-na text-na-foreground border-na" },
];

export function StatusToggle({
  value,
  onChange,
}: {
  value: ItemStatus;
  onChange: (s: Exclude<ItemStatus, "PENDING">) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold transition-all active:scale-[0.97]",
              active
                ? opt.active
                : "border-input bg-background text-muted-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
