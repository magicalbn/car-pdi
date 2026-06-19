import { CHECKLIST } from "@/config/checklist";

const SECTION_LABELS = new Map(CHECKLIST.map((s) => [s.key, s.label]));

export function sectionLabelFor(key: string): string {
  return SECTION_LABELS.get(key) ?? key;
}
