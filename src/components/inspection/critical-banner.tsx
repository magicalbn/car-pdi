import { ShieldAlert } from "lucide-react";

export function CriticalBanner({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-fail/40 bg-fail/10 p-4 text-fail">
      <ShieldAlert className="h-6 w-6 shrink-0" />
      <div>
        <p className="text-sm font-bold uppercase tracking-wide">
          {count} Critical Issue{count === 1 ? "" : "s"}
        </p>
        <p className="text-sm font-semibold">DO NOT ACCEPT DELIVERY</p>
      </div>
    </div>
  );
}
