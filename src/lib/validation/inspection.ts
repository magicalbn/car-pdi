import { z } from "zod";

export const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().optional().default(""),
  vin: z
    .string()
    .min(1, "VIN is required")
    .max(17, "VIN cannot exceed 17 characters")
    .transform((v) => v.toUpperCase().trim()),
  engineNumber: z.string().optional().default(""),
  odometer: z.coerce.number().min(0, "Odometer must be 0 or more").default(0),
  manufacturingDate: z.string().optional().default(""),
  dealerName: z.string().min(1, "Dealer name is required"),
  inspectionDate: z.string().min(1, "Inspection date is required"),
});

export type VehicleFormValues = z.input<typeof vehicleSchema>;
export type VehicleParsed = z.output<typeof vehicleSchema>;
