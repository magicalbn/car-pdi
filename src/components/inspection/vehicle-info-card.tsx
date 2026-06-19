import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VinDetailsPopover } from "@/components/inspection/vin-details-popover";
import { formatDate } from "@/lib/utils";
import { decodeVin } from "@/lib/vin/decode";
import type { Vehicle } from "@/types";

export function VehicleInfoCard({ vehicle }: { vehicle: Vehicle }) {
  const vin = decodeVin(vehicle.vin);
  const rows: { label: string; value: string }[] = [
    { label: "Make", value: vehicle.make || "—" },
    { label: "Model", value: vehicle.model || "—" },
    { label: "Variant", value: vehicle.variant || "—" },
    { label: "VIN", value: vehicle.vin || "—" },
    { label: "Engine No.", value: vehicle.engineNumber || "—" },
    {
      label: "Odometer",
      value: vehicle.odometer != null ? `${vehicle.odometer} km` : "—",
    },
    { label: "Mfg. Date", value: formatDate(vehicle.manufacturingDate) },
    {
      label: "Model Year",
      value: vin.valid ? `${vin.modelYear} (${vin.ageYears}y)` : "—",
    },
    { label: "Dealer", value: vehicle.dealerName || "—" },
    { label: "Inspected", value: formatDate(vehicle.inspectionDate) },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Vehicle Details</CardTitle>
        {vehicle.vin && <VinDetailsPopover vin={vehicle.vin} />}
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {rows.map((r) => (
            <div key={r.label} className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {r.label}
              </dt>
              <dd className="truncate text-sm font-medium" title={r.value}>
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
