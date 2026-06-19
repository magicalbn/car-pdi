import { AlertTriangle, CheckCircle2, ShieldAlert, Clock } from "lucide-react";
import type { Recommendation } from "@/types";
import { cn } from "@/lib/utils";

const STYLE: Record<
  Recommendation,
  { icon: typeof CheckCircle2; wrap: string; iconCls: string }
> = {
  ACCEPT: {
    icon: CheckCircle2,
    wrap: "border-pass/40 bg-pass/10",
    iconCls: "text-pass",
  },
  REVIEW: {
    icon: AlertTriangle,
    wrap: "border-major/40 bg-major/10",
    iconCls: "text-major",
  },
  REJECT: {
    icon: ShieldAlert,
    wrap: "border-fail/40 bg-fail/10",
    iconCls: "text-fail",
  },
  INCOMPLETE: {
    icon: Clock,
    wrap: "border-primary/40 bg-primary/10",
    iconCls: "text-primary",
  },
};

export function RecommendationCard({
  recommendation,
  title,
  detail,
}: {
  recommendation: Recommendation;
  title: string;
  detail: string;
}) {
  const s = STYLE[recommendation];
  const Icon = s.icon;
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", s.wrap)}>
      <Icon className={cn("h-7 w-7 shrink-0", s.iconCls)} />
      <div>
        <p className={cn("text-base font-bold", s.iconCls)}>{title}</p>
        <p className="text-sm text-foreground/80">{detail}</p>
      </div>
    </div>
  );
}
