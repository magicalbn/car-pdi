import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  size = 120,
  label = "Score",
  className,
}: {
  score: number | null;
  size?: number;
  label?: string;
  className?: string;
}) {
  const stroke = size * 0.09;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const started = score != null;
  const value = score ?? 0;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;

  const color = !started
    ? "stroke-muted-foreground/40"
    : value >= 90
    ? "stroke-pass"
    : value >= 70
    ? "stroke-major"
    : "stroke-fail";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="fill-none stroke-muted"
        />
        {started && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={cn(
              "fill-none transition-[stroke-dashoffset] duration-700",
              color
            )}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-bold tabular-nums",
            started ? "text-2xl" : "text-2xl text-muted-foreground"
          )}
        >
          {started ? value : "—"}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {started ? label : "Not started"}
        </span>
      </div>
    </div>
  );
}
