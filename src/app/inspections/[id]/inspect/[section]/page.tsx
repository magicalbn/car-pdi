"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SearchX } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { ChecklistView } from "@/components/inspection/checklist-view";
import { InspectionSearch } from "@/components/inspection/inspection-search";
import { EmptyState } from "@/components/inspection/empty-state";
import {
  LoadingInspection,
  NotFoundInspection,
} from "@/components/inspection/states";
import { useInspection } from "@/hooks/useInspection";
import { CHECKLIST } from "@/config/checklist";

export default function SectionInspectPage() {
  const { id, section } = useParams<{ id: string; section: string }>();
  const insp = useInspection(id);

  if (insp === undefined) return <LoadingInspection />;
  if (insp === null) return <NotFoundInspection />;

  const isAll = section === "all";
  const def = isAll ? null : CHECKLIST.find((s) => s.key === section);

  if (!isAll && !def) {
    return (
      <>
        <AppHeader title="Not found" backHref={`/inspections/${id}`} />
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <EmptyState
            icon={SearchX}
            title="Section not found"
            description="This checklist section doesn't exist."
            action={
              <Button asChild>
                <Link href={`/inspections/${id}`}>Back to dashboard</Link>
              </Button>
            }
          />
        </main>
      </>
    );
  }

  const sectionKeys = isAll ? CHECKLIST.map((s) => s.key) : [def!.key];

  return (
    <>
      <AppHeader
        title={isAll ? "All Checks" : def!.label}
        subtitle={`${insp.vehicle.make} ${insp.vehicle.model}`}
        backHref={`/inspections/${id}`}
        right={<InspectionSearch inspectionId={id} />}
      />
      <Suspense>
        <ChecklistView
          inspection={insp}
          sectionKeys={sectionKeys}
          activeSection={isAll ? "all" : def!.key}
        />
      </Suspense>
    </>
  );
}
