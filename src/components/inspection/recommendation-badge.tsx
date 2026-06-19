import { AlertTriangle, CheckCircle2, ShieldAlert, Clock } from "lucide-react";
import type { Recommendation } from "@/types";
import { cn } from "@/lib/utils";

const MAP: Record<
  Recommendation,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  ACCEPT: {
    label: "Safe to Accept",
    icon: CheckCircle2,
    className: "bg-pass/15 text-pass",
  },
  REVIEW: {
    label: "Review First",
    icon: AlertTriangle,
    className: "bg-major/15 text-major",
  },
  REJECT: {
    label: "Do Not Accept",
    icon: ShieldAlert,
    className: "bg-fail/15 text-fail",
  },
  INCOMPLETE: {
    label: "In Progress",
    icon: Clock,
    className: "bg-primary/10 text-primary",
  },
};

export function RecommendationBadge({
  recommendation,
  className,
}: {
  recommendation: Recommendation;
  className?: string;
}) {
  const cfg = MAP[recommendation];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        cfg.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}
