import type { Severity } from "@/types";

export type ScoreGroup =
  | "exterior"
  | "interior"
  | "mechanical"
  | "electronics"
  | "general";

export interface ChecklistItemDef {
  key: string;
  label: string;
  defaultSeverity: Severity;
}

export interface ChecklistCategoryDef {
  key: string;
  label: string;
  items: ChecklistItemDef[];
}

export interface ChecklistSectionDef {
  key: string;
  label: string;
  icon: string; // lucide-react icon name, resolved in the UI
  scoreGroup: ScoreGroup;
  categories: ChecklistCategoryDef[];
}

const s = (key: string, label: string, defaultSeverity: Severity = "MINOR"): ChecklistItemDef => ({
  key,
  label,
  defaultSeverity,
});

export const CHECKLIST: ChecklistSectionDef[] = [
  {
    key: "exterior",
    label: "Exterior",
    icon: "Car",
    scoreGroup: "exterior",
    categories: [
      {
        key: "paint-bodywork",
        label: "Paint & Bodywork",
        items: [
          s("panel-gaps", "Panel gaps even and consistent", "MAJOR"),
          s("scratches", "No scratches or scuffs"),
          s("dents", "No dents or dings", "MAJOR"),
          s("paint-finish", "Paint finish uniform (no overspray)", "MAJOR"),
          s("rust", "No rust or corrosion", "CRITICAL"),
          s("bumpers", "Bumpers aligned and secure"),
          s("cladding", "Plastic cladding & trim secure / undamaged"),
          s("underbody", "Underbody — nothing hanging or out of place", "MAJOR"),
        ],
      },
      {
        key: "glass",
        label: "Glass",
        items: [
          s("windshield", "Windshield free of chips/cracks", "MAJOR"),
          s("windows", "All windows free of damage"),
          s("mirrors", "Mirrors intact and adjustable"),
          s("seals", "Rubber seals/weatherstrips intact"),
        ],
      },
      {
        key: "lights",
        label: "Lights",
        items: [
          s("headlights", "Headlights (low/high beam)", "MAJOR"),
          s("taillights", "Tail lights", "MAJOR"),
          s("indicators", "Turn indicators", "MAJOR"),
          s("brake-lights", "Brake lights", "CRITICAL"),
          s("fog-lights", "Fog lights"),
          s("drl", "Daytime running lights"),
          s("plate-light", "Number plate light"),
        ],
      },
      {
        key: "wheels-tyres",
        label: "Wheels & Tyres",
        items: [
          s("tread-depth", "Tread depth within spec", "MAJOR"),
          s("dot-date", "Tyre DOT date is fresh", "MAJOR"),
          s("tyre-damage", "No cuts/bulges/cracks", "CRITICAL"),
          s("alloys", "Alloys/wheels undamaged"),
          s("pressure", "Tyre pressure correct"),
          s("matching", "Matching tyre brand/spec"),
        ],
      },
    ],
  },
  {
    key: "under-hood",
    label: "Under The Hood",
    icon: "Wrench",
    scoreGroup: "mechanical",
    categories: [
      {
        key: "engine-bay",
        label: "Engine Bay",
        items: [
          s("cleanliness", "Engine bay clean (no obvious issues)"),
          s("leaks", "No oil/coolant leaks", "CRITICAL"),
          s("engine-oil", "Engine oil level & condition", "MAJOR"),
          s("coolant", "Coolant level adequate", "MAJOR"),
          s("brake-fluid", "Brake fluid level", "CRITICAL"),
          s("washer-fluid", "Washer fluid topped up"),
          s("belts-hoses", "Belts & hoses in good condition", "MAJOR"),
          s("tamper-marks", "No tamper marks on nuts, bolts & pipes", "MAJOR"),
        ],
      },
      {
        key: "battery",
        label: "Battery",
        items: [
          s("battery-condition", "Battery secure & undamaged", "MAJOR"),
          s("terminals", "Terminals clean, no corrosion"),
          s("battery-date", "Battery manufacturing date acceptable"),
          s("battery-health", "Battery health/voltage OK", "MAJOR"),
        ],
      },
    ],
  },
  {
    key: "interior",
    label: "Interior",
    icon: "Armchair",
    scoreGroup: "interior",
    categories: [
      {
        key: "seats",
        label: "Seats",
        items: [
          s("upholstery", "Upholstery clean, no tears/stains"),
          s("adjustment", "All seat adjustments work"),
          s("seatbelts", "Seatbelts function & retract", "CRITICAL"),
          s("heating-cooling", "Seat heating/ventilation (if equipped)"),
        ],
      },
      {
        key: "dashboard",
        label: "Dashboard",
        items: [
          s("warning-lights", "No warning lights on start-up", "CRITICAL"),
          s("dash-condition", "Dashboard trim undamaged"),
          s("controls", "All dash controls functional"),
          s("steering-adjust", "Steering tilt / telescopic adjustment"),
        ],
      },
      {
        key: "cabin-features",
        label: "Cabin Features",
        items: [
          s("doors", "All doors open, close, latch & align", "MAJOR"),
          s("power-windows", "Power windows operate"),
          s("central-locking", "Central locking works", "MAJOR"),
          s("orvm", "ORVM electric adjust / fold (if equipped)"),
          s("sunroof", "Sunroof/moonroof (if equipped)"),
          s("storage", "Glovebox & storage compartments"),
          s("armrests", "Armrests & cup holders"),
          s("headliner", "Headliner & roofline undamaged"),
          s("floor", "Floor & carpets undamaged"),
          s("interior-lights", "Interior/courtesy lights"),
        ],
      },
      {
        key: "air-conditioning",
        label: "Air Conditioning",
        items: [
          s("cooling", "Cooling performance", "MAJOR"),
          s("heating", "Heating performance"),
          s("blower", "All blower speeds work"),
          s("vents", "All vents direct airflow"),
          s("rear-vents", "Rear AC vents & blower (if equipped)"),
          s("climate-control", "Climate control/auto modes"),
        ],
      },
    ],
  },
  {
    key: "electronics",
    label: "Electronics",
    icon: "Cpu",
    scoreGroup: "electronics",
    categories: [
      {
        key: "touchscreen",
        label: "Touchscreen",
        items: [
          s("touchscreen-response", "Touchscreen responsive, no dead zones", "MAJOR"),
          s("touchscreen-display", "Display clear, no pixel defects"),
        ],
      },
      {
        key: "bluetooth",
        label: "Bluetooth",
        items: [s("bluetooth-pair", "Bluetooth pairs & streams audio/calls")],
      },
      {
        key: "android-auto",
        label: "Android Auto",
        items: [s("android-auto", "Android Auto connects & functions")],
      },
      {
        key: "apple-carplay",
        label: "Apple CarPlay",
        items: [s("apple-carplay", "Apple CarPlay connects & functions")],
      },
      {
        key: "navigation",
        label: "Navigation",
        items: [s("navigation", "Navigation/GPS acquires & routes")],
      },
      {
        key: "reverse-camera",
        label: "Reverse Camera",
        items: [
          s("reverse-camera", "Reverse camera clear & functional", "MAJOR"),
        ],
      },
      {
        key: "parking-sensors",
        label: "Parking Sensors",
        items: [s("parking-sensors", "Parking sensors detect & alert", "MAJOR")],
      },
      {
        key: "instrument-cluster",
        label: "Instrument Cluster",
        items: [
          s("cluster-display", "Cluster fully functional", "MAJOR"),
          s("cluster-gauges", "Gauges read correctly"),
        ],
      },
      {
        key: "ports",
        label: "Ports & Charging",
        items: [
          s("usb-12v", "USB, 12V & charging ports work"),
          s("wireless-charger", "Wireless charger (if equipped)"),
        ],
      },
      {
        key: "diagnostics",
        label: "Diagnostics",
        items: [
          s("obd-scan", "OBD-II scan — no stored fault codes", "MAJOR"),
          s("ev-soh", "EV: HV battery state-of-health (if EV)", "MAJOR"),
        ],
      },
    ],
  },
  {
    key: "test-drive",
    label: "Test Drive",
    icon: "Gauge",
    scoreGroup: "mechanical",
    categories: [
      {
        key: "engine",
        label: "Engine",
        items: [
          s("engine-start", "Starts smoothly, idles steady", "MAJOR"),
          s("engine-power", "Power delivery smooth"),
          s("engine-noise", "No abnormal noises/smoke", "CRITICAL"),
          s("exhaust-smoke", "No excessive exhaust smoke (blue/white)", "MAJOR"),
          s("heavy-load", "Stable under heavy load (AC, all fans & audio on)"),
        ],
      },
      {
        key: "transmission",
        label: "Transmission",
        items: [
          s("shifts", "Shifts smoothly (no jerks)", "MAJOR"),
          s("clutch", "Clutch/gearbox engagement OK", "MAJOR"),
        ],
      },
      {
        key: "steering",
        label: "Steering",
        items: [
          s("steering-feel", "Steering precise, returns to center", "CRITICAL"),
          s("steering-noise", "No play, vibration or noise", "MAJOR"),
        ],
      },
      {
        key: "brakes",
        label: "Brakes",
        items: [
          s("brake-stopping", "Brakes stop firmly & straight", "CRITICAL"),
          s("brake-noise", "No squeal/grind/vibration", "MAJOR"),
          s("handbrake", "Parking brake holds", "MAJOR"),
        ],
      },
      {
        key: "suspension",
        label: "Suspension",
        items: [
          s("ride", "Ride composed, no clunks", "MAJOR"),
          s("stability", "Stable over bumps/corners"),
        ],
      },
    ],
  },
  {
    key: "accessories",
    label: "Accessories & Delivery Items",
    icon: "Package",
    scoreGroup: "general",
    categories: [
      {
        key: "delivery-items",
        label: "Delivery Items",
        items: [
          s("spare-wheel", "Spare wheel present & inflated"),
          s("toolkit", "Toolkit complete"),
          s("jack", "Jack present & functional"),
          s("manuals", "Owner's manuals present"),
          s("warranty-docs", "Warranty documents present", "MAJOR"),
          s("spare-key", "Spare key provided", "MAJOR"),
          s("accessories", "Ordered accessories fitted"),
        ],
      },
    ],
  },
  {
    key: "forgotten-checks",
    label: "Forgotten Checks",
    icon: "ListChecks",
    scoreGroup: "general",
    categories: [
      {
        key: "commonly-missed",
        label: "Commonly Missed",
        items: [
          s("fuel-flap", "Fuel flap opens & locks"),
          s("bonnet", "Bonnet / hood opens, props & latches"),
          s("boot", "Boot/tailgate operation"),
          s("rear-seat-fold", "Rear seat folding mechanism"),
          s("horn", "Horn works", "MAJOR"),
          s("wipers", "Wipers (all speeds)"),
          s("washers", "Washers spray correctly"),
          s("tpms", "TPMS functional"),
          s("reverse-guidelines", "Reverse camera guidelines display"),
        ],
      },
    ],
  },
  {
    key: "final-review",
    label: "Final Delivery Review",
    icon: "ClipboardCheck",
    scoreGroup: "general",
    categories: [
      {
        key: "acceptance",
        label: "Acceptance",
        items: [
          s("vin-captured", "VIN captured & verified", "MAJOR"),
          s("odometer-captured", "Odometer captured"),
          s("odometer-plausible", "Odometer reading plausible (not too low / high)", "MAJOR"),
          s("build-fresh", "Build / manufacture date is fresh (not aged stock)", "MAJOR"),
          s("photos-captured", "Required photos captured"),
          s("issues-logged", "Pending issues logged", "MAJOR"),
          s("review-complete", "Acceptance review complete", "MAJOR"),
        ],
      },
    ],
  },
];

export function buildItemId(
  sectionKey: string,
  categoryKey: string,
  itemKey: string
): string {
  return `${sectionKey}.${categoryKey}.${itemKey}`;
}

export const TOTAL_CHECKS = CHECKLIST.reduce(
  (acc, sec) =>
    acc + sec.categories.reduce((a, c) => a + c.items.length, 0),
  0
);

export const TOTAL_SECTIONS = CHECKLIST.length;

const sectionScoreGroup = new Map(CHECKLIST.map((s) => [s.key, s.scoreGroup]));

export function getScoreGroup(sectionKey: string): ScoreGroup {
  return sectionScoreGroup.get(sectionKey) ?? "general";
}
