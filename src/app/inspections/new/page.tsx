"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VinInsight } from "@/components/inspection/vin-insight";
import { VinDetailsPopover } from "@/components/inspection/vin-details-popover";
import {
  vehicleSchema,
  type VehicleFormValues,
} from "@/lib/validation/inspection";
import { createAndSaveInspection } from "@/lib/repo";
import type { Vehicle } from "@/types";

export default function NewInspectionPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      variant: "",
      vin: "",
      engineNumber: "",
      odometer: 0,
      manufacturingDate: "",
      dealerName: "",
      inspectionDate: new Date().toISOString().slice(0, 10),
    },
  });

  const vin = watch("vin");

  async function onSubmit(values: VehicleFormValues) {
    const parsed = vehicleSchema.parse(values);
    const insp = await createAndSaveInspection(parsed as Vehicle);
    toast.success("Inspection created");
    router.replace(`/inspections/${insp.id}`);
  }

  function fillDemo() {
    setValue("make", "Hyundai");
    setValue("model", "Creta");
    setValue("variant", "SX(O) Turbo");
    setValue("vin", "MALCU81CLPM012345");
    setValue("engineNumber", "G4FJ-PM012345");
    setValue("odometer", 24);
    setValue("manufacturingDate", "2025-09-15");
    setValue("dealerName", "Advaith Hyundai, Bengaluru");
  }

  return (
    <div className="min-h-dvh pb-28">
      <AppHeader title="New Inspection" backHref="/" />
      <main className="mx-auto w-full max-w-3xl px-4 py-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Vehicle Details</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fillDemo}
              >
                <Sparkles className="h-4 w-4" /> Demo
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Make" error={errors.make?.message}>
                <Input placeholder="e.g. Toyota" {...register("make")} />
              </Field>
              <Field label="Model" error={errors.model?.message}>
                <Input placeholder="e.g. Camry" {...register("model")} />
              </Field>
              <Field label="Variant" error={errors.variant?.message}>
                <Input placeholder="e.g. Hybrid XLE" {...register("variant")} />
              </Field>
              <Field label="Odometer (km)" error={errors.odometer?.message}>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  {...register("odometer")}
                />
              </Field>
              <div className="sm:col-span-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>VIN</Label>
                  <VinDetailsPopover vin={vin} />
                </div>
                <Input
                  placeholder="17-character VIN"
                  autoCapitalize="characters"
                  className="font-mono uppercase"
                  {...register("vin")}
                />
                {errors.vin?.message && (
                  <p className="mt-1 text-xs text-fail">{errors.vin.message}</p>
                )}
                <VinInsight vin={vin} className="mt-2" />
              </div>
              <Field label="Engine Number" error={errors.engineNumber?.message}>
                <Input
                  placeholder="Engine no."
                  className="font-mono"
                  {...register("engineNumber")}
                />
              </Field>
              <Field
                label="Manufacturing Date"
                error={errors.manufacturingDate?.message}
              >
                <Input type="date" {...register("manufacturingDate")} />
              </Field>
              <Field label="Dealer Name" error={errors.dealerName?.message}>
                <Input
                  placeholder="Dealership"
                  {...register("dealerName")}
                />
              </Field>
              <Field
                label="Inspection Date"
                error={errors.inspectionDate?.message}
              >
                <Input type="date" {...register("inspectionDate")} />
              </Field>
            </CardContent>
          </Card>

          <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 p-3 backdrop-blur">
            <div className="mx-auto flex w-full max-w-3xl gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                <Save className="h-4 w-4" /> Start Inspection
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-fail">{error}</p>}
    </div>
  );
}
