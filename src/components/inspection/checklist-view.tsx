"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { StickyProgress } from "@/components/inspection/sticky-progress";
import { SectionTabs } from "@/components/inspection/section-tabs";
import { CriticalBanner } from "@/components/inspection/critical-banner";
import { FilterBar } from "@/components/inspection/filter-bar";
import { ChecklistItem } from "@/components/inspection/checklist-item";
import { SectionIcon } from "@/components/inspection/section-icon";
import { EmptyState } from "@/components/inspection/empty-state";
import { useInspectionPhotos, type PhotoView } from "@/hooks/usePhotoUrls";
import { useUIStore } from "@/stores/uiStore";
import { CHECKLIST, type ChecklistCategoryDef } from "@/config/checklist";
import { computeStats } from "@/lib/scoring";
import { matchesFilter, matchesSearch } from "@/lib/filter";
import type { Inspection, InspectionItem } from "@/types";

export function ChecklistView({
  inspection,
  sectionKeys,
  activeSection,
}: {
  inspection: Inspection;
  sectionKeys: string[];
  /** Highlighted tab: a section key or "all". */
  activeSection: string;
}) {
  const { views } = useInspectionPhotos(inspection.id);
  const { search, filter, setSearch, setFilter } = useUIStore();
  const focusId = useSearchParams().get("focus");

  // When arriving from the inspection search, clear any active filter, then
  // scroll the target check into view and briefly highlight it.
  useEffect(() => {
    if (!focusId) return;
    setSearch("");
    setFilter("all");
    const t = setTimeout(() => {
      const el = document.getElementById(focusId);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(
        () => el.classList.remove("ring-2", "ring-primary", "ring-offset-2"),
        2200
      );
    }, 200);
    return () => clearTimeout(t);
  }, [focusId, setSearch, setFilter]);

  const wanted = useMemo(() => new Set(sectionKeys), [sectionKeys]);

  const itemMap = useMemo(() => {
    const m = new Map<string, InspectionItem>();
    inspection.items.forEach((it) => m.set(it.id, it));
    return m;
  }, [inspection.items]);

  const photosByItem = useMemo(() => {
    const m = new Map<string, PhotoView[]>();
    for (const v of views) {
      if (v.record.kind === "item" && v.record.refKey) {
        const arr = m.get(v.record.refKey) ?? [];
        arr.push(v);
        m.set(v.record.refKey, arr);
      }
    }
    return m;
  }, [views]);

  const sections = useMemo(
    () => CHECKLIST.filter((s) => wanted.has(s.key)),
    [wanted]
  );

  const stats = useMemo(
    () => computeStats(inspection.items.filter((i) => wanted.has(i.sectionKey))),
    [inspection.items, wanted]
  );

  const visibleSections = sections
    .map((section) => {
      const categories = section.categories
        .map((cat) => ({
          cat,
          items: cat.items
            .map((def) => itemMap.get(`${section.key}.${cat.key}.${def.key}`))
            .filter((it): it is InspectionItem => !!it)
            .filter(
              (it) => matchesFilter(it, filter) && matchesSearch(it, search)
            ),
        }))
        .filter((c) => c.items.length > 0);
      return { section, categories };
    })
    .filter((s) => s.categories.length > 0);

  const single = sections.length === 1;

  function renderCategories(
    sectionKey: string,
    categories: { cat: ChecklistCategoryDef; items: InspectionItem[] }[]
  ) {
    return (
      <div className="space-y-4">
        {categories.map(({ cat, items }) => (
          <div key={`${sectionKey}.${cat.key}`}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {cat.label}
            </p>
            <div className="space-y-2">
              {items.map((it) => (
                <ChecklistItem
                  key={it.id}
                  inspectionId={inspection.id}
                  item={it}
                  photoViews={photosByItem.get(it.id) ?? []}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="safe-top sticky top-14 z-20 border-b bg-background/90 backdrop-blur">
        <SectionTabs inspectionId={inspection.id} active={activeSection} />
        <StickyProgress stats={stats} embedded />
      </div>
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        <CriticalBanner count={stats.criticalFailures} />
        <FilterBar />

        {visibleSections.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matching checks"
            description="Try a different filter or search term."
          />
        ) : single ? (
          renderCategories(
            visibleSections[0].section.key,
            visibleSections[0].categories
          )
        ) : (
          <Accordion
            type="multiple"
            defaultValue={visibleSections.map((s) => s.section.key)}
            className="space-y-3"
          >
            {visibleSections.map(({ section, categories }) => {
              const total = section.categories.reduce(
                (a, c) => a + c.items.length,
                0
              );
              const done = section.categories.reduce(
                (a, c) =>
                  a +
                  c.items.filter(
                    (def) =>
                      itemMap.get(`${section.key}.${c.key}.${def.key}`)
                        ?.status !== "PENDING"
                  ).length,
                0
              );
              return (
                <AccordionItem
                  key={section.key}
                  value={section.key}
                  id={section.key}
                  className="overflow-hidden rounded-xl border bg-card px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <SectionIcon
                        name={section.icon}
                        className="h-5 w-5 text-primary"
                      />
                      <span>{section.label}</span>
                    </div>
                    <Badge
                      variant={done === total ? "pass" : "secondary"}
                      className="ml-auto mr-2"
                    >
                      {done}/{total}
                    </Badge>
                  </AccordionTrigger>
                  <AccordionContent>
                    {renderCategories(section.key, categories)}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </main>
    </>
  );
}
