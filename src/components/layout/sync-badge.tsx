"use client";

import { Cloud, CloudOff, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useSync } from "@/hooks/useSync";
import { cn } from "@/lib/utils";

export function SyncBadge() {
  const { online, syncing, configured, pending } = useSync();

  const label = !online
    ? "Offline"
    : syncing
    ? "Syncing"
    : configured === false
    ? "Local only"
    : pending > 0
    ? `${pending} pending`
    : "Synced";

  const Icon = !online
    ? WifiOff
    : syncing
    ? RefreshCw
    : configured === false
    ? CloudOff
    : pending > 0
    ? Cloud
    : Wifi;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        !online
          ? "bg-muted text-muted-foreground"
          : syncing
          ? "bg-primary/10 text-primary"
          : pending > 0
          ? "bg-major/10 text-major"
          : "bg-pass/10 text-pass"
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
      {label}
    </span>
  );
}
