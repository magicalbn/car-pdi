// Shared domain types for PERP. Used by the client stores, Dexie, Mongoose, and APIs.

export type ItemStatus = "PASS" | "FAIL" | "NA" | "PENDING";
export type Severity = "CRITICAL" | "MAJOR" | "MINOR";
export type ResolutionStatus = "PENDING" | "RESOLVED" | "REJECTED";
export type InspectionStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED";
export type Recommendation = "ACCEPT" | "REVIEW" | "REJECT" | "INCOMPLETE";

export interface Vehicle {
  make: string;
  model: string;
  variant: string;
  vin: string;
  engineNumber: string;
  odometer: number;
  manufacturingDate: string; // ISO date (yyyy-mm-dd)
  dealerName: string;
  inspectionDate: string; // ISO date (yyyy-mm-dd)
}

export interface Rectification {
  dealerAction: string;
  resolutionStatus: ResolutionStatus;
}

export interface InspectionItem {
  /** Stable id, unique within the inspection: `${sectionKey}.${categoryKey}.${itemKey}` */
  id: string;
  sectionKey: string;
  categoryKey: string;
  itemKey: string;
  label: string;
  status: ItemStatus;
  severity: Severity;
  notes: string;
  photoIds: string[];
  timestamp?: number;
  rectification?: Rectification;
}

export interface GlobalNotes {
  dealerFeedback: string;
  negotiationNotes: string;
  pendingCommitments: string;
  additionalObservations: string;
}

export interface Timeline {
  startedAt?: number;
  exteriorCompletedAt?: number;
  testDriveCompletedAt?: number;
  finishedAt?: number;
}

/** Photo metadata. The binary lives as a Blob in Dexie; transport uses `dataUrl`. */
export interface PhotoMeta {
  id: string;
  inspectionId: string;
  /** "item" for checklist items, "evidence" for the evidence grid, "quick" for quick-capture */
  kind: "item" | "evidence" | "quick";
  /** itemId for item photos, evidence slot key for evidence, undefined for quick */
  refKey?: string;
  caption?: string;
  width?: number;
  height?: number;
  serverPath?: string;
  createdAt: number;
  synced?: boolean;
}

/** Photo with embedded base64 payload, used for JSON export/import and Mongo sync. */
export interface PhotoTransport extends PhotoMeta {
  dataUrl: string;
}

export interface ScoreBreakdown {
  /** null when nothing has been graded yet (no PASS/FAIL). */
  overall: number | null;
  exterior: number | null;
  interior: number | null;
  mechanical: number | null;
  electronics: number | null;
}

export interface InspectionStats {
  totalSections: number;
  totalChecks: number;
  passed: number;
  failed: number;
  na: number;
  pending: number;
  completion: number; // 0-100
  criticalFailures: number;
  majorFailures: number;
  minorFailures: number;
}

export interface Inspection {
  id: string;
  vehicle: Vehicle;
  status: InspectionStatus;
  items: InspectionItem[];
  globalNotes: GlobalNotes;
  timeline: Timeline;
  quickCaptureNotes: QuickCapture[];
  createdAt: number;
  updatedAt: number;
  /** Sync bookkeeping (offline-first). */
  dirty: boolean;
  syncedAt?: number;
}

export interface QuickCapture {
  id: string;
  note: string;
  photoIds: string[];
  /** Optional: once categorized, the item id this was assigned to. */
  assignedItemId?: string;
  createdAt: number;
}

export interface Settings {
  id: "settings";
  theme: "light" | "dark" | "system";
  // Inventory freshness thresholds (months)
  freshInventoryMaxMonths: number;
  // Tyre age thresholds (months)
  tyreFreshMaxMonths: number;
  tyreModerateMaxMonths: number;
  updatedAt: number;
}

/** A complete, portable bundle for backup/restore. */
export interface InspectionBundle {
  version: number;
  exportedAt: number;
  inspection: Inspection;
  photos: PhotoTransport[];
}
