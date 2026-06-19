// Lightweight, offline VIN intelligence (ISO 3779). Decodes the model year
// (10th char), world manufacturer identifier (chars 1-3 → region / country /
// manufacturer) and validates the North-American check digit (char 9).
// Richer data (make, fuel type, plant) comes from optional NHTSA enrichment.

const YEAR_CODES: Record<string, number[]> = {
  A: [1980, 2010],
  B: [1981, 2011],
  C: [1982, 2012],
  D: [1983, 2013],
  E: [1984, 2014],
  F: [1985, 2015],
  G: [1986, 2016],
  H: [1987, 2017],
  J: [1988, 2018],
  K: [1989, 2019],
  L: [1990, 2020],
  M: [1991, 2021],
  N: [1992, 2022],
  P: [1993, 2023],
  R: [1994, 2024],
  S: [1995, 2025],
  T: [1996, 2026],
  V: [1997, 2027],
  W: [1998, 2028],
  X: [1999, 2029],
  Y: [2000, 2030],
  "1": [2001, 2031],
  "2": [2002, 2032],
  "3": [2003, 2033],
  "4": [2004, 2034],
  "5": [2005, 2035],
  "6": [2006, 2036],
  "7": [2007, 2037],
  "8": [2008, 2038],
  "9": [2009, 2039],
};

const REGION_BY_FIRST: Record<string, string> = {
  A: "Africa",
  B: "Africa",
  C: "Africa",
  D: "Africa",
  E: "Africa",
  F: "Africa",
  G: "Africa",
  H: "Africa",
  J: "Asia",
  K: "Asia",
  L: "Asia",
  M: "Asia",
  N: "Asia",
  P: "Asia",
  R: "Asia",
  S: "Europe",
  T: "Europe",
  U: "Europe",
  V: "Europe",
  W: "Europe",
  X: "Europe",
  Y: "Europe",
  Z: "Europe",
  "1": "North America",
  "2": "North America",
  "3": "North America",
  "4": "North America",
  "5": "North America",
  "6": "Oceania",
  "7": "Oceania",
  "8": "South America",
  "9": "South America",
};

// Country by the first two VIN characters (major automotive nations).
// Each entry covers an inclusive [start, end] range of 2-char codes.
const COUNTRY_RANGES: { from: string; to: string; country: string }[] = [
  { from: "AA", to: "AH", country: "South Africa" },
  { from: "JA", to: "J0", country: "Japan" },
  { from: "KL", to: "KR", country: "South Korea" },
  { from: "KF", to: "KK", country: "Israel" },
  { from: "LA", to: "L0", country: "China" },
  { from: "MA", to: "ME", country: "India" },
  { from: "MF", to: "MK", country: "Indonesia" },
  { from: "ML", to: "MR", country: "Thailand" },
  { from: "MS", to: "M0", country: "Myanmar" },
  { from: "NA", to: "NE", country: "Iran" },
  { from: "NF", to: "NK", country: "Pakistan" },
  { from: "NL", to: "NR", country: "Turkey" },
  { from: "PA", to: "PE", country: "Philippines" },
  { from: "PF", to: "PK", country: "Singapore" },
  { from: "PL", to: "PR", country: "Malaysia" },
  { from: "RA", to: "RE", country: "UAE" },
  { from: "RF", to: "RK", country: "Taiwan" },
  { from: "RL", to: "RR", country: "Vietnam" },
  { from: "SA", to: "SM", country: "United Kingdom" },
  { from: "SN", to: "ST", country: "Germany" },
  { from: "SU", to: "SZ", country: "Poland" },
  { from: "TA", to: "TH", country: "Switzerland" },
  { from: "TJ", to: "TP", country: "Czech Republic" },
  { from: "TR", to: "TV", country: "Hungary" },
  { from: "TW", to: "T1", country: "Portugal" },
  { from: "VA", to: "VE", country: "Austria" },
  { from: "VF", to: "VR", country: "France" },
  { from: "VS", to: "VW", country: "Spain" },
  { from: "VX", to: "V2", country: "Serbia" },
  { from: "WA", to: "W0", country: "Germany" },
  { from: "XA", to: "XE", country: "Bulgaria" },
  { from: "XS", to: "XW", country: "Russia" },
  { from: "X3", to: "X0", country: "Russia" },
  { from: "YA", to: "YE", country: "Belgium" },
  { from: "YF", to: "YK", country: "Finland" },
  { from: "YS", to: "YW", country: "Sweden" },
  { from: "ZA", to: "ZR", country: "Italy" },
  { from: "1A", to: "10", country: "United States" },
  { from: "2A", to: "20", country: "Canada" },
  { from: "3A", to: "3W", country: "Mexico" },
  { from: "4A", to: "40", country: "United States" },
  { from: "5A", to: "50", country: "United States" },
  { from: "6A", to: "6W", country: "Australia" },
  { from: "7A", to: "7E", country: "New Zealand" },
  { from: "8A", to: "8E", country: "Argentina" },
  { from: "9A", to: "9E", country: "Brazil" },
  { from: "93", to: "99", country: "Brazil" },
];

// Common World Manufacturer Identifiers (first 3 chars). Not exhaustive.
const MANUFACTURERS: Record<string, string> = {
  // --- India (MA–ME) ---
  MA1: "Mahindra & Mahindra",
  MA3: "Maruti Suzuki India",
  MA6: "General Motors India",
  MA7: "Hindustan Motors / Mitsubishi",
  MAC: "Tata Motors",
  MAJ: "Ford India",
  MAK: "Honda Cars India",
  MAL: "Hyundai Motor India",
  MAT: "Tata Motors",
  MBH: "Suzuki Motor Gujarat",
  MBJ: "Toyota Kirloskar Motor",
  MBR: "Mercedes-Benz India",
  MBV: "Volvo Eicher (VECV)",
  MBX: "Piaggio India",
  MCA: "FCA India (Fiat / Jeep)",
  MC2: "Volvo Buses India",
  MD2: "Bajaj Auto",
  MD6: "TVS Motor",
  MDH: "Nissan Motor India",
  ME1: "India Yamaha Motor",
  ME3: "Royal Enfield",
  ME4: "Honda Motorcycle & Scooter India",
  ME9: "Mercedes-Benz India (CV)",
  MEC: "Daimler India Commercial Vehicles",
  MEE: "Renault Nissan Automotive India",
  MER: "Renault India",
  MET: "Toyota Kirloskar Motor",
  MEX: "Volkswagen India / Škoda",
  MZB: "MG Motor India (SAIC)",
  MZD: "Kia India",
  // --- Global ---
  JHM: "Honda",
  JH4: "Acura",
  JT2: "Toyota",
  JT3: "Toyota",
  JTD: "Toyota",
  JTE: "Toyota",
  JTH: "Lexus",
  "4T1": "Toyota",
  "4T3": "Toyota",
  "5TD": "Toyota",
  "5TF": "Toyota",
  "2T1": "Toyota (Canada)",
  JN1: "Nissan",
  JN8: "Nissan",
  "1N4": "Nissan",
  "3N1": "Nissan (Mexico)",
  JM1: "Mazda",
  JF1: "Subaru",
  JF2: "Subaru",
  JS3: "Suzuki",
  JA3: "Mitsubishi",
  KMH: "Hyundai",
  KM8: "Hyundai",
  "5NP": "Hyundai (USA)",
  KND: "Kia",
  KNA: "Kia",
  "5XY": "Kia (USA)",
  WBA: "BMW",
  WBS: "BMW M",
  WBY: "BMW i",
  "4US": "BMW (USA)",
  "5UX": "BMW (USA)",
  WDB: "Mercedes-Benz",
  WDD: "Mercedes-Benz",
  WDC: "Mercedes-Benz",
  "4JG": "Mercedes-Benz (USA)",
  WAU: "Audi",
  WA1: "Audi",
  TRU: "Audi",
  WVW: "Volkswagen",
  WV1: "Volkswagen Commercial",
  "1VW": "Volkswagen (USA)",
  "3VW": "Volkswagen (Mexico)",
  WP0: "Porsche",
  WP1: "Porsche SUV",
  ZFA: "Fiat",
  ZFF: "Ferrari",
  ZAR: "Alfa Romeo",
  ZHW: "Lamborghini",
  SAL: "Land Rover",
  SAJ: "Jaguar",
  SCC: "Lotus",
  SCB: "Bentley",
  VF1: "Renault",
  VF3: "Peugeot",
  VF7: "Citroën",
  VR1: "DS Automobiles",
  "1G1": "Chevrolet",
  "1GC": "Chevrolet Truck",
  "2G1": "Chevrolet (Canada)",
  "3GC": "Chevrolet (Mexico)",
  "1GT": "GMC",
  "1GY": "Cadillac",
  "1FA": "Ford",
  "1FT": "Ford Truck",
  "1FM": "Ford SUV",
  "2FA": "Ford (Canada)",
  "3FA": "Ford (Mexico)",
  "1C3": "Chrysler",
  "1C4": "Jeep/RAM",
  "1J4": "Jeep",
  "2C3": "Chrysler (Canada)",
  "5YJ": "Tesla",
  "7SA": "Tesla",
  LRW: "Tesla (China)",
  "1HG": "Honda (USA)",
  "2HG": "Honda (Canada)",
  "19X": "Honda (USA)",
  LGB: "BYD",
  LFV: "FAW-Volkswagen",
  LVS: "Ford (China)",
  LSV: "SAIC Volkswagen",
};

function cleanVin(vin: string): string {
  return (vin || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function decodeYear(clean: string): {
  modelYear: number | null;
  ageYears: number | null;
} {
  if (clean.length < 10) return { modelYear: null, ageYears: null };
  const candidates = YEAR_CODES[clean[9]];
  if (!candidates) return { modelYear: null, ageYears: null };
  const currentYear = new Date().getFullYear();
  const modelYear =
    candidates.filter((y) => y <= currentYear + 1).sort((a, b) => b - a)[0] ??
    candidates[0];
  return { modelYear, ageYears: Math.max(0, currentYear - modelYear) };
}

function lookupCountry(twoChar: string): string | null {
  for (const r of COUNTRY_RANGES) {
    if (twoChar >= r.from && twoChar <= r.to) return r.country;
  }
  return null;
}

// North-American check-digit validation (position 9).
const TRANSLIT: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

function validateCheckDigit(clean: string): boolean | null {
  if (clean.length !== 17) return null;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const v = TRANSLIT[clean[i]];
    if (v === undefined) return null;
    sum += v * WEIGHTS[i];
  }
  const remainder = sum % 11;
  const expected = remainder === 10 ? "X" : String(remainder);
  return clean[8] === expected;
}

export interface VinInfo {
  valid: boolean;
  modelYear: number | null;
  ageYears: number | null;
  fresh: boolean | null;
  message: string;
}

export interface VinDetails extends VinInfo {
  vin: string;
  length: number;
  wmi: string | null;
  vds: string | null;
  region: string | null;
  country: string | null;
  manufacturer: string | null;
  plantCode: string | null;
  serial: string | null;
  checkDigitValid: boolean | null;
}

/** Quick decode used for the inline freshness chip. */
export function decodeVin(vin: string, freshMaxMonths = 12): VinInfo {
  const d = decodeVinDetails(vin, freshMaxMonths);
  return {
    valid: d.valid,
    modelYear: d.modelYear,
    ageYears: d.ageYears,
    fresh: d.fresh,
    message: d.message,
  };
}

/** Full offline decode: year, age, region, country, manufacturer, check digit. */
export function decodeVinDetails(vin: string, freshMaxMonths = 12): VinDetails {
  const clean = cleanVin(vin);
  const wmi = clean.length >= 3 ? clean.slice(0, 3) : null;
  const vds = clean.length >= 9 ? clean.slice(3, 9) : null;
  const region = clean.length >= 1 ? REGION_BY_FIRST[clean[0]] ?? null : null;
  const country = clean.length >= 2 ? lookupCountry(clean.slice(0, 2)) : null;
  const manufacturer = wmi ? MANUFACTURERS[wmi] ?? null : null;
  const plantCode = clean.length >= 11 ? clean[10] : null;
  const serial = clean.length >= 17 ? clean.slice(11, 17) : null;
  const checkDigitValid = validateCheckDigit(clean);

  const base: VinDetails = {
    valid: false,
    vin: clean,
    length: clean.length,
    wmi,
    vds,
    region,
    country,
    manufacturer,
    plantCode,
    serial,
    modelYear: null,
    ageYears: null,
    fresh: null,
    checkDigitValid,
    message: "",
  };

  if (clean.length < 10) {
    return {
      ...base,
      message: "Enter at least 10 VIN characters to decode the model year.",
    };
  }

  const { modelYear, ageYears } = decodeYear(clean);
  if (modelYear == null) {
    return {
      ...base,
      message: "Model-year character not recognised (I, O, Q, U, Z are invalid).",
    };
  }

  const fresh = (ageYears ?? 0) * 12 <= freshMaxMonths;
  return {
    ...base,
    valid: true,
    modelYear,
    ageYears,
    fresh,
    message: fresh
      ? "Fresh inventory"
      : `Aged inventory — ${ageYears} year${ageYears === 1 ? "" : "s"} old`,
  };
}
