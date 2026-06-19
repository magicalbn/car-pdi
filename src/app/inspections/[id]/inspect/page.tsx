import { redirect } from "next/navigation";
import { CHECKLIST } from "@/config/checklist";

// The Inspect tab opens the first section directly; section switching (and the
// "All" view) happens via the tab-strip inside the section screen.
export default async function InspectIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/inspections/${id}/inspect/${CHECKLIST[0].key}`);
}
