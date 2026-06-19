// Tyre DOT date code decoder. The last 4 digits of a DOT code encode the
// manufacturing week and year, e.g. "2626" => week 26 of 2026.

export type TyreFreshness = "FRESH" | "MODERATE" | "OLD";

export interface TyreInfo {
  valid: boolean;
  week: number | null;
  year: number | null;
  ageMonths: number | null;
  ageLabel: string;
  freshness: TyreFreshness | null;
  message: string;
}

export function decodeDot(
  code: string,
  freshMaxMonths = 12,
  moderateMaxMonths = 36
): TyreInfo {
  const digits = (code || "").replace(/\D/g, "");
  const last4 = digits.slice(-4);

  if (last4.length < 4) {
    return {
      valid: false,
      week: null,
      year: null,
      ageMonths: null,
      ageLabel: "—",
      freshness: null,
      message: "Enter the 4-digit DOT code (WWYY), e.g. 2626.",
    };
  }

  const week = parseInt(last4.slice(0, 2), 10);
  const yy = parseInt(last4.slice(2, 4), 10);

  if (week < 1 || week > 53) {
    return {
      valid: false,
      week: null,
      year: null,
      ageMonths: null,
      ageLabel: "—",
      freshness: null,
      message: "Invalid week (must be 01–53).",
    };
  }

  const now = new Date();
  const currentYY = now.getFullYear() % 100;
  // Assume 2000s; if the two-digit year is in the future, it belonged to 1900s.
  const year = yy <= currentYY ? 2000 + yy : 1900 + yy;

  // Approx manufacture date = start of that ISO week.
  const manufactured = new Date(year, 0, 1 + (week - 1) * 7);
  const ageMonths = Math.max(
    0,
    Math.round(
      (now.getTime() - manufactured.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )
  );

  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  const ageLabel =
    years > 0
      ? `${years}y ${months}m`
      : `${months} month${months === 1 ? "" : "s"}`;

  let freshness: TyreFreshness;
  if (ageMonths <= freshMaxMonths) freshness = "FRESH";
  else if (ageMonths <= moderateMaxMonths) freshness = "MODERATE";
  else freshness = "OLD";

  return {
    valid: true,
    week,
    year,
    ageMonths,
    ageLabel,
    freshness,
    message:
      freshness === "FRESH"
        ? "Fresh tyre"
        : freshness === "MODERATE"
        ? "Moderate age — acceptable"
        : "Old tyre — flag for replacement",
  };
}
