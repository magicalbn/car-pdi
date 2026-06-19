"use client";

import Link from "next/link";
import { CHECKLIST } from "@/config/checklist";
import { cn } from "@/lib/utils";

/** Horizontal section switcher (Exterior · Interior · … · All). */
export function SectionTabs({
  inspectionId,
  active,
}: {
  inspectionId: string;
  active: string; // a section key, or "all"
}) {
  const base = `/inspections/${inspectionId}/inspect`;

  const chip = (href: string, label: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      scroll={false}
      className={cn(
        "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background text-muted-foreground hover:bg-accent"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2">
      {CHECKLIST.map((s) => chip(`${base}/${s.key}`, s.label, active === s.key))}
      {chip(`${base}/all`, "All", active === "all")}
    </div>
  );
}
