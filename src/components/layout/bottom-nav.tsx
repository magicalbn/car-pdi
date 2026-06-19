"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Camera,
  Images,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function InspectionBottomNav({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/inspections/${id}`;

  const items = [
    { href: base, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `${base}/inspect`, label: "Inspect", icon: ListChecks },
    { href: `${base}/evidence`, label: "Evidence", icon: Camera },
    { href: `${base}/gallery`, label: "Gallery", icon: Images },
    { href: `${base}/summary`, label: "Summary", icon: FileText },
  ];

  return (
    <nav className="safe-bottom z-30 shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 no-print">
      <div className="mx-auto flex w-full max-w-3xl items-stretch justify-around">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
