"use client";

// Optional online VIN enrichment via the free NHTSA vPIC API.
// Returns null when offline or on any error — the offline decoder still works.

export interface NhtsaVinResult {
  make?: string;
  model?: string;
  modelYear?: string;
  manufacturer?: string;
  plantCountry?: string;
  plantState?: string;
  plantCity?: string;
  fuelTypePrimary?: string;
  fuelTypeSecondary?: string;
  bodyClass?: string;
  vehicleType?: string;
  doors?: string;
  engineCylinders?: string;
  displacementL?: string;
  engineHP?: string;
  driveType?: string;
  transmissionStyle?: string;
  series?: string;
  trim?: string;
  errorText?: string;
}

const clean = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : "";
  return s && s !== "Not Applicable" && s !== "0" ? s : undefined;
};

export async function fetchVinDetails(
  vin: string
): Promise<NhtsaVinResult | null> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;
  const v = (vin || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (v.length < 11) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${v}?format=json`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const r = data?.Results?.[0];
    if (!r) return null;

    return {
      make: clean(r.Make),
      model: clean(r.Model),
      modelYear: clean(r.ModelYear),
      manufacturer: clean(r.Manufacturer),
      plantCountry: clean(r.PlantCountry),
      plantState: clean(r.PlantState),
      plantCity: clean(r.PlantCity),
      fuelTypePrimary: clean(r.FuelTypePrimary),
      fuelTypeSecondary: clean(r.FuelTypeSecondary),
      bodyClass: clean(r.BodyClass),
      vehicleType: clean(r.VehicleType),
      doors: clean(r.Doors),
      engineCylinders: clean(r.EngineCylinders),
      displacementL: clean(r.DisplacementL),
      engineHP: clean(r.EngineHP),
      driveType: clean(r.DriveType),
      transmissionStyle: clean(r.TransmissionStyle),
      series: clean(r.Series),
      trim: clean(r.Trim),
      errorText: clean(r.ErrorText),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
