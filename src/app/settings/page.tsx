"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Upload, Info } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/useSettings";
import { saveSettings } from "@/lib/settings";
import { importInspection } from "@/lib/export/backup";
import { useSync } from "@/hooks/useSync";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const settings = useSettings();
  const { theme, setTheme } = useTheme();
  const sync = useSync();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  async function onImport(file: File) {
    try {
      const id = await importInspection(file);
      toast.success("Inspection imported");
      router.push(`/inspections/${id}`);
    } catch {
      toast.error("Invalid backup file");
    }
  }

  const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="min-h-dvh pb-10">
      <AppHeader title="Settings" backHref="/" />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => {
                const Icon = t.icon;
                const active = mounted && theme === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Freshness Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ThresholdField
              label="Fresh inventory (max months)"
              value={settings.freshInventoryMaxMonths}
              onCommit={(v) => saveSettings({ freshInventoryMaxMonths: v })}
            />
            <ThresholdField
              label="Tyre fresh (max months)"
              value={settings.tyreFreshMaxMonths}
              onCommit={(v) => saveSettings({ tyreFreshMaxMonths: v })}
            />
            <ThresholdField
              label="Tyre moderate (max months)"
              value={settings.tyreModerateMaxMonths}
              onCommit={(v) => saveSettings({ tyreModerateMaxMonths: v })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Import an inspection from a JSON backup file. Each inspection can
              be exported from its Summary screen.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Import Inspection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" /> About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>PERP — Pre-Delivery Inspection Report Platform</p>
            <p>
              Cloud sync:{" "}
              <span className="font-medium text-foreground">
                {sync.configured === false
                  ? "Disabled (offline-only)"
                  : sync.configured
                  ? "Enabled"
                  : "Checking…"}
              </span>
            </p>
            <p>
              Connection:{" "}
              <span className="font-medium text-foreground">
                {sync.online ? "Online" : "Offline"}
              </span>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function ThresholdField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (v: number) => void;
}) {
  const [local, setLocal] = React.useState(String(value));
  React.useEffect(() => setLocal(String(value)), [value]);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const n = parseInt(local, 10);
          if (!Number.isNaN(n) && n >= 0) onCommit(n);
        }}
      />
    </div>
  );
}
