import mongoose, { Schema, type Model } from "mongoose";

/**
 * Server-side persistence models.
 *
 * NOTE: schemas are intentionally declared as `Schema<any>` and models as
 * `Model<any>`. Mongoose's generic inference over large nested schema literals
 * scales super-linearly with program size and can exhaust the type-checker's
 * heap during `next build`. Forcing `any` collapses that inference while
 * keeping full runtime behavior — domain typing is enforced at the client/repo
 * layer via the shared types in `@/types`.
 */

const VehicleSchema = new Schema<any>(
  {
    make: String,
    model: String,
    variant: String,
    vin: { type: String, index: true },
    engineNumber: String,
    odometer: Number,
    manufacturingDate: String,
    dealerName: String,
    inspectionDate: String,
  },
  { _id: false }
);

const RectificationSchema = new Schema<any>(
  {
    dealerAction: { type: String, default: "" },
    resolutionStatus: {
      type: String,
      enum: ["PENDING", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { _id: false }
);

const ItemSchema = new Schema<any>(
  {
    id: { type: String, required: true },
    sectionKey: String,
    categoryKey: String,
    itemKey: String,
    label: String,
    status: {
      type: String,
      enum: ["PASS", "FAIL", "NA", "PENDING"],
      default: "PENDING",
    },
    severity: {
      type: String,
      enum: ["CRITICAL", "MAJOR", "MINOR"],
      default: "MINOR",
    },
    notes: { type: String, default: "" },
    photoIds: { type: [String], default: [] },
    timestamp: Number,
    rectification: RectificationSchema,
  },
  { _id: false }
);

const GlobalNotesSchema = new Schema<any>(
  {
    dealerFeedback: { type: String, default: "" },
    negotiationNotes: { type: String, default: "" },
    pendingCommitments: { type: String, default: "" },
    additionalObservations: { type: String, default: "" },
  },
  { _id: false }
);

const TimelineSchema = new Schema<any>(
  {
    startedAt: Number,
    exteriorCompletedAt: Number,
    testDriveCompletedAt: Number,
    finishedAt: Number,
  },
  { _id: false }
);

const QuickCaptureSchema = new Schema<any>(
  {
    id: { type: String, required: true },
    note: { type: String, default: "" },
    photoIds: { type: [String], default: [] },
    assignedItemId: String,
    createdAt: Number,
  },
  { _id: false }
);

const InspectionSchema = new Schema<any>(
  {
    _id: { type: String },
    vehicle: VehicleSchema,
    status: {
      type: String,
      enum: ["DRAFT", "IN_PROGRESS", "COMPLETED"],
      default: "DRAFT",
    },
    items: { type: [ItemSchema], default: [] },
    globalNotes: { type: GlobalNotesSchema, default: () => ({}) },
    timeline: { type: TimelineSchema, default: () => ({}) },
    quickCaptureNotes: { type: [QuickCaptureSchema], default: [] },
    createdAt: Number,
    updatedAt: Number,
  },
  { timestamps: true, _id: false }
);

const PhotoSchema = new Schema<any>(
  {
    _id: { type: String },
    inspectionId: { type: String, index: true },
    kind: { type: String, enum: ["item", "evidence", "quick"] },
    refKey: String,
    caption: String,
    width: Number,
    height: Number,
    serverPath: String,
    data: String,
    createdAt: Number,
  },
  { timestamps: true, _id: false }
);

const SettingsSchema = new Schema<any>(
  {
    _id: { type: String, default: "settings" },
    theme: { type: String, default: "system" },
    freshInventoryMaxMonths: { type: Number, default: 12 },
    tyreFreshMaxMonths: { type: Number, default: 12 },
    tyreModerateMaxMonths: { type: Number, default: 36 },
    updatedAt: Number,
  },
  { _id: false }
);

function model(name: string, schema: Schema): Model<any> {
  return (
    (mongoose.models[name] as Model<any>) ?? mongoose.model(name, schema)
  );
}

export const InspectionModel = model("Inspection", InspectionSchema);
export const PhotoModel = model("Photo", PhotoSchema);
export const SettingsModel = model("Settings", SettingsSchema);

// Registered for completeness with the data-model spec (embedded in practice).
export const VehicleModel = model("Vehicle", new Schema<any>(VehicleSchema.obj));
export const InspectionItemModel = model(
  "InspectionItem",
  new Schema<any>(ItemSchema.obj)
);
