"use client";

import * as React from "react";
import {
  Info,
  Loader2,
  Globe,
  Factory,
  Fuel,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  CloudOff,
  Car,
  Hash,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { decodeVinDetails } from "@/lib/vin/decode";
import { fetchVinDetails, type NhtsaVinResult } from "@/lib/vin/nhtsa";
import { useSettings } from "@/hooks/useSettings";
import { useSync } from "@/hooks/useSync";
import { cn } from "@/lib/utils";

export function VinDetailsPopover({ vin }: { vin: string }) {
  const settings = useSettings();
  const { online } = useSync();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<NhtsaVinResult | null>(null);
  const fetchedFor = React.useRef<string>("");

  const details = React.useMemo(
    () => decodeVinDetails(vin, settings.freshInventoryMaxMonths),
    [vin, settings.freshInventoryMaxMonths]
  );

  const cleanVin = (vin || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  React.useEffect(() => {
    if (!open || !online || cleanVin.length < 11) return;
    if (fetchedFor.current === cleanVin) return;
    let active = true;
    setLoading(true);
    fetchVinDetails(cleanVin).then((r) => {
      if (!active) return;
      setResult(r);
      fetchedFor.current = cleanVin;
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [open, online, cleanVin]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
          aria-label="VIN details"
        >
          <Info className="h-3.5 w-3.5" /> Details
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        {cleanVin.length < 3 ? (
          <p className="text-sm text-muted-foreground">
            Enter a VIN to decode manufacturer, origin and year.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">VIN Intelligence</p>
              {details.fresh != null && (
                <Badge variant={details.fresh ? "pass" : "major"}>
                  {details.fresh ? "Fresh" : "Aged"}
                </Badge>
              )}
            </div>

            <p className="break-all rounded-md bg-muted px-2 py-1 font-mono text-xs">
              {cleanVin}
            </p>

            {/* Offline-decoded */}
            <div className="space-y-1.5">
              <Row
                icon={Factory}
                label="Manufacturer"
                value={details.manufacturer ?? (details.wmi ? `WMI ${details.wmi}` : "—")}
              />
              <Row
                icon={Globe}
                label="Origin"
                value={
                  [details.country, details.region]
                    .filter(Boolean)
                    .join(" · ") || "—"
                }
              />
              <Row
                icon={Calendar}
                label="Model Year"
                value={
                  details.modelYear
                    ? `${details.modelYear} (${details.ageYears}y old)`
                    : "—"
                }
              />
              {details.plantCode && (
                <Row
                  icon={Factory}
                  label="Plant code"
                  value={details.plantCode}
                />
              )}
              {details.serial && (
                <Row icon={Hash} label="Serial no." value={details.serial} />
              )}
              {details.wmi && (
                <Row icon={Info} label="WMI" value={details.wmi} />
              )}
              <CheckDigitRow value={details.checkDigitValid} />
            </div>

            {/* Online enrichment */}
            <div className="border-t pt-2">
              {cleanVin.length < 11 ? (
                <p className="text-xs text-muted-foreground">
                  Enter the full VIN for make, fuel type & plant details.
                </p>
              ) : !online ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CloudOff className="h-3.5 w-3.5" /> Connect to fetch make,
                  fuel type & plant (NHTSA).
                </p>
              ) : loading ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Looking up
                  registry…
                </p>
              ) : result ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Registry (NHTSA)
                  </p>
                  <Row
                    icon={Car}
                    label="Make / Model"
                    value={
                      [result.make, result.model].filter(Boolean).join(" ") ||
                      "—"
                    }
                  />
                  <Row icon={Fuel} label="Fuel" value={fuelLabel(result)} />
                  <Row
                    icon={Factory}
                    label="Plant"
                    value={
                      [result.plantCity, result.plantState, result.plantCountry]
                        .filter(Boolean)
                        .join(", ") || "—"
                    }
                  />
                  <Row
                    icon={Car}
                    label="Body"
                    value={result.bodyClass ?? result.vehicleType ?? "—"}
                  />
                  <Row icon={Info} label="Engine" value={engineLabel(result)} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No registry match — the NHTSA database mainly covers
                  US-market vehicles. Indian-market details are decoded offline
                  above.
                </p>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function fuelLabel(r: NhtsaVinResult): string {
  return (
    [r.fuelTypePrimary, r.fuelTypeSecondary].filter(Boolean).join(" / ") || "—"
  );
}

function engineLabel(r: NhtsaVinResult): string {
  const parts = [
    r.displacementL ? `${Number(r.displacementL).toFixed(1)}L` : null,
    r.engineCylinders ? `${r.engineCylinders}-cyl` : null,
    r.engineHP ? `${r.engineHP} hp` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="flex-1 font-medium">{value}</span>
    </div>
  );
}

function CheckDigitRow({ value }: { value: boolean | null }) {
  if (value == null) return null;
  // The check digit (pos 9) is mandatory in North America but optional in many
  // markets (incl. India), so a non-matching digit is "not verified", not invalid.
  const Icon = value ? ShieldCheck : ShieldAlert;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          value ? "text-pass" : "text-muted-foreground"
        )}
      />
      <span className="w-24 shrink-0 text-muted-foreground">Check digit</span>
      <span
        className={cn(
          "flex-1 font-medium",
          value ? "text-pass" : "text-muted-foreground"
        )}
      >
        {value ? "Valid" : "Not verified (non-NA scheme)"}
      </span>
    </div>
  );
}
