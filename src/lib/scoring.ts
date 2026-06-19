import type {
  Inspection,
  InspectionItem,
  InspectionStats,
  Recommendation,
  ScoreBreakdown,
  Severity,
} from "@/types";
import { TOTAL_SECTIONS, getScoreGroup, type ScoreGroup } from "@/config/checklist";

const SEVERITY_WEIGHT: Record<Severity, number> = {
  CRITICAL: 5,
  MAJOR: 3,
  MINOR: 1,
};

export function computeStats(items: InspectionItem[]): InspectionStats {
  let passed = 0;
  let failed = 0;
  let na = 0;
  let pending = 0;
  let criticalFailures = 0;
  let majorFailures = 0;
  let minorFailures = 0;

  for (const it of items) {
    switch (it.status) {
      case "PASS":
        passed++;
        break;
      case "FAIL":
        failed++;
        if (it.severity === "CRITICAL") criticalFailures++;
        else if (it.severity === "MAJOR") majorFailures++;
        else minorFailures++;
        break;
      case "NA":
        na++;
        break;
      default:
        pending++;
    }
  }

  const totalChecks = items.length;
  const completed = passed + failed + na;
  const completion =
    totalChecks === 0 ? 0 : Math.round((completed / totalChecks) * 100);

  return {
    totalSections: TOTAL_SECTIONS,
    totalChecks,
    passed,
    failed,
    na,
    pending,
    completion,
    criticalFailures,
    majorFailures,
    minorFailures,
  };
}

/**
 * Returns 0-100, or null when nothing has been assessed yet (no PASS/FAIL).
 *
 * PENDING checks count toward the denominator (they drag the score down until
 * completed), so an inspection that is mostly untouched scores low rather than
 * showing a misleading 100. NA checks are excluded entirely. Once every check
 * is graded (no pending), this becomes a pure pass/fail quality score.
 */
function scoreFor(items: InspectionItem[]): number | null {
  let earned = 0;
  let possible = 0;
  let graded = 0;
  for (const it of items) {
    const w = SEVERITY_WEIGHT[it.severity];
    if (it.status === "PASS") {
      earned += w;
      possible += w;
      graded++;
    } else if (it.status === "FAIL") {
      possible += w;
      graded++;
    } else if (it.status === "PENDING") {
      possible += w; // counts against the score until reviewed
    }
    // NA is excluded entirely.
  }
  if (graded === 0 || possible === 0) return null; // not started / all N/A
  return Math.round((earned / possible) * 100);
}

/** Format a score for display ("—" when not yet started). */
export function displayScore(score: number | null): string {
  return score == null ? "—" : String(score);
}

export function computeScores(items: InspectionItem[]): ScoreBreakdown {
  const byGroup: Record<ScoreGroup, InspectionItem[]> = {
    exterior: [],
    interior: [],
    mechanical: [],
    electronics: [],
    general: [],
  };
  for (const it of items) {
    byGroup[getScoreGroup(it.sectionKey)].push(it);
  }
  return {
    overall: scoreFor(items),
    exterior: scoreFor(byGroup.exterior),
    interior: scoreFor(byGroup.interior),
    mechanical: scoreFor(byGroup.mechanical),
    electronics: scoreFor(byGroup.electronics),
  };
}

export function computeRecommendation(
  stats: InspectionStats
): { recommendation: Recommendation; title: string; detail: string } {
  if (stats.criticalFailures > 0) {
    return {
      recommendation: "REJECT",
      title: "Do Not Accept Delivery",
      detail: `${stats.criticalFailures} critical issue${
        stats.criticalFailures === 1 ? "" : "s"
      } detected. Resolve before acceptance.`,
    };
  }
  if (stats.majorFailures > 0) {
    return {
      recommendation: "REVIEW",
      title: "Review Before Acceptance",
      detail: `${stats.majorFailures} major issue${
        stats.majorFailures === 1 ? "" : "s"
      } found. Negotiate fixes before signing.`,
    };
  }
  // No critical/major issues — but you can't accept what you haven't inspected.
  if (stats.pending > 0) {
    return {
      recommendation: "INCOMPLETE",
      title: "Inspection Incomplete",
      detail: `${stats.pending} of ${stats.totalChecks} checks still pending (${stats.completion}% done). Complete the inspection before accepting.`,
    };
  }
  return {
    recommendation: "ACCEPT",
    title: "Safe To Accept",
    detail:
      stats.minorFailures > 0
        ? `All ${stats.totalChecks} checks reviewed. ${stats.minorFailures} minor issue${
            stats.minorFailures === 1 ? "" : "s"
          } noted; no critical or major issues.`
        : `All ${stats.totalChecks} checks reviewed. No critical or major issues found.`,
  };
}

export interface InspectionSummary {
  stats: InspectionStats;
  scores: ScoreBreakdown;
  recommendation: ReturnType<typeof computeRecommendation>;
}

export function summarize(inspection: Inspection): InspectionSummary {
  const stats = computeStats(inspection.items);
  return {
    stats,
    scores: computeScores(inspection.items),
    recommendation: computeRecommendation(stats),
  };
}

/** Per-section completion, e.g. "Exterior 22/22". */
export function sectionProgress(items: InspectionItem[]) {
  const map = new Map<string, { done: number; total: number }>();
  for (const it of items) {
    const entry = map.get(it.sectionKey) ?? { done: 0, total: 0 };
    entry.total++;
    if (it.status !== "PENDING") entry.done++;
    map.set(it.sectionKey, entry);
  }
  return map;
}
