import { CHECKLIST, buildItemId } from "@/config/checklist";
import type { Inspection, InspectionItem, Vehicle } from "@/types";
import { uid } from "@/lib/utils";

/** Build the full set of checklist items (all PENDING) from the config. */
export function buildItems(): InspectionItem[] {
  const items: InspectionItem[] = [];
  for (const section of CHECKLIST) {
    for (const category of section.categories) {
      for (const item of category.items) {
        items.push({
          id: buildItemId(section.key, category.key, item.key),
          sectionKey: section.key,
          categoryKey: category.key,
          itemKey: item.key,
          label: item.label,
          status: "PENDING",
          severity: item.defaultSeverity,
          notes: "",
          photoIds: [],
        });
      }
    }
  }
  return items;
}

export function createInspection(vehicle: Vehicle): Inspection {
  const now = Date.now();
  return {
    id: uid("insp"),
    vehicle,
    status: "IN_PROGRESS",
    items: buildItems(),
    globalNotes: {
      dealerFeedback: "",
      negotiationNotes: "",
      pendingCommitments: "",
      additionalObservations: "",
    },
    timeline: { startedAt: now },
    quickCaptureNotes: [],
    createdAt: now,
    updatedAt: now,
    dirty: true,
  };
}

const SAMPLE_VEHICLE: Vehicle = {
  make: "Tata",
  model: "Nexon",
  variant: "Fearless+ Diesel",
  vin: "MAT625139PWA12345",
  engineNumber: "REVOTORQ-PWA12345",
  odometer: 18,
  manufacturingDate: "2025-11-01",
  dealerName: "Tata Motors, Pune",
  inspectionDate: new Date().toISOString().slice(0, 10),
};

/** A demo inspection with a few items graded, for first-run exploration. */
export function createSampleInspection(): Inspection {
  const insp = createInspection(SAMPLE_VEHICLE);
  const set = (id: string, patch: Partial<InspectionItem>) => {
    const it = insp.items.find((i) => i.id === id);
    if (it) Object.assign(it, patch, { timestamp: Date.now() });
  };
  set("exterior.paint-bodywork.panel-gaps", { status: "PASS" });
  set("exterior.paint-bodywork.scratches", {
    status: "FAIL",
    severity: "MINOR",
    notes: "Light scratch on rear passenger door, ~4cm.",
  });
  set("exterior.lights.headlights", { status: "PASS" });
  set("exterior.wheels-tyres.dot-date", {
    status: "FAIL",
    severity: "MAJOR",
    notes: "Front-left tyre DOT 0124 — older than 12 months.",
  });
  set("test-drive.brakes.brake-stopping", { status: "PASS" });
  set("interior.air-conditioning.cooling", { status: "PASS" });
  insp.globalNotes.dealerFeedback =
    "Dealer agreed to inspect tyre stock for fresher DOT dates.";
  return insp;
}
