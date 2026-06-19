import type { InspectionItem } from "@/types";
import type { FilterKey } from "@/stores/uiStore";

export function matchesFilter(
  item: InspectionItem,
  filter: FilterKey
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "pending":
      return item.status === "PENDING";
    case "passed":
      return item.status === "PASS";
    case "failed":
      return item.status === "FAIL";
    case "critical":
      return item.status === "FAIL" && item.severity === "CRITICAL";
    case "major":
      return item.status === "FAIL" && item.severity === "MAJOR";
    case "minor":
      return item.status === "FAIL" && item.severity === "MINOR";
    case "has-photos":
      return item.photoIds.length > 0;
    case "missing-notes":
      return item.status === "FAIL" && !item.notes.trim();
    default:
      return true;
  }
}

export function matchesSearch(item: InspectionItem, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    item.label.toLowerCase().includes(q) ||
    item.notes.toLowerCase().includes(q) ||
    item.sectionKey.toLowerCase().includes(q) ||
    item.categoryKey.toLowerCase().includes(q)
  );
}

export function filterItems(
  items: InspectionItem[],
  filter: FilterKey,
  search: string
): InspectionItem[] {
  return items.filter(
    (it) => matchesFilter(it, filter) && matchesSearch(it, search)
  );
}
