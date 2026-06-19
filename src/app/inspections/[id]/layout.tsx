"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { InspectionBottomNav } from "@/components/layout/bottom-nav";
import { reconcileItems } from "@/lib/repo";

export default function InspectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  // Backfill any checklist items added since this inspection was created.
  useEffect(() => {
    if (id) void reconcileItems(id);
  }, [id]);

  // Fixed-height app shell: the content scrolls inside `flex-1`, and the bottom
  // nav is a normal flex child — never `position: fixed` — so it stays correctly
  // placed even as the mobile browser's address bar shows/hides (dynamic vh).
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {id && <InspectionBottomNav id={id} />}
    </div>
  );
}
