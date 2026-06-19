"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useInspection } from "@/hooks/useInspection";
import { CHECKLIST } from "@/config/checklist";
import type { ItemStatus } from "@/types";

interface FlatItem {
  id: string;
  label: string;
  sectionKey: string;
  sectionLabel: string;
  categoryLabel: string;
}

const FLAT_ITEMS: FlatItem[] = CHECKLIST.flatMap((sec) =>
  sec.categories.flatMap((cat) =>
    cat.items.map((def) => ({
      id: `${sec.key}.${cat.key}.${def.key}`,
      label: def.label,
      sectionKey: sec.key,
      sectionLabel: sec.label,
      categoryLabel: cat.label,
    }))
  )
);

const STATUS_BADGE: Record<
  ItemStatus,
  { variant: "pass" | "fail" | "na" | "secondary"; label: string }
> = {
  PASS: { variant: "pass", label: "Pass" },
  FAIL: { variant: "fail", label: "Fail" },
  NA: { variant: "na", label: "N/A" },
  PENDING: { variant: "secondary", label: "Pending" },
};

export function InspectionSearch({ inspectionId }: { inspectionId: string }) {
  const router = useRouter();
  const insp = useInspection(inspectionId);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const statusById = React.useMemo(() => {
    const m = new Map<string, ItemStatus>();
    insp?.items.forEach((it) => m.set(it.id, it.status));
    return m;
  }, [insp]);

  const results = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return FLAT_ITEMS.slice(0, 12);
    return FLAT_ITEMS.filter(
      (it) =>
        it.label.toLowerCase().includes(query) ||
        it.sectionLabel.toLowerCase().includes(query) ||
        it.categoryLabel.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [q]);

  function go(it: FlatItem) {
    setOpen(false);
    setQ("");
    router.push(
      `/inspections/${inspectionId}/inspect/${it.sectionKey}?focus=${it.id}`
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search checks">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-[12%] translate-y-0 gap-3 p-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Search checks</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search all checks…"
              className="pl-9"
            />
          </div>
        </DialogHeader>

        <div className="-mx-1 max-h-[55vh] overflow-y-auto px-1">
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No checks match “{q}”.
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((it) => {
                const status = statusById.get(it.id) ?? "PENDING";
                const badge = STATUS_BADGE[status];
                return (
                  <li key={it.id}>
                    <button
                      onClick={() => go(it)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {it.label}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {it.sectionLabel} · {it.categoryLabel}
                        </span>
                      </span>
                      <Badge variant={badge.variant} className="shrink-0">
                        {badge.label}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
