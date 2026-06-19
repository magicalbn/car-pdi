import Link from "next/link";
import { SearchX } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/inspection/empty-state";

export function LoadingInspection() {
  return (
    <>
      <AppHeader title="Loading…" backHref="/" />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5">
        <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-24 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-64 animate-pulse rounded-xl bg-muted/60" />
      </main>
    </>
  );
}

export function NotFoundInspection() {
  return (
    <>
      <AppHeader title="Not found" backHref="/" />
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <EmptyState
          icon={SearchX}
          title="Inspection not found"
          description="This inspection may have been deleted or hasn't synced to this device."
          action={
            <Button asChild>
              <Link href="/">Back to inspections</Link>
            </Button>
          }
        />
      </main>
    </>
  );
}
