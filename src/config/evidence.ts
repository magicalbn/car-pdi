export interface EvidenceSlotDef {
  key: string;
  label: string;
  icon: string; // lucide-react icon name
  hint?: string;
}

/** Dedicated vehicle-evidence capture slots. These appear in the final report. */
export const EVIDENCE_SLOTS: EvidenceSlotDef[] = [
  { key: "front", label: "Front View", icon: "Car", hint: "Full front, straight-on" },
  { key: "rear", label: "Rear View", icon: "Car", hint: "Full rear, straight-on" },
  { key: "left", label: "Left Side", icon: "Car", hint: "Driver/left profile" },
  { key: "right", label: "Right Side", icon: "Car", hint: "Passenger/right profile" },
  { key: "vin", label: "VIN Plate", icon: "ScanLine", hint: "Legible VIN" },
  { key: "odometer", label: "Odometer", icon: "Gauge", hint: "Reading visible" },
  { key: "tyre-dot", label: "Tyre DOT Code", icon: "Disc", hint: "4-digit DOT week/year" },
  { key: "battery", label: "Battery Label", icon: "BatteryCharging", hint: "Manufacture/date label" },
];
