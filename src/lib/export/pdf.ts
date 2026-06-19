"use client";

import { jsPDF } from "jspdf";
import type { Inspection, PhotoTransport } from "@/types";
import { displayScore, type InspectionSummary } from "@/lib/scoring";
import { CHECKLIST } from "@/config/checklist";
import { EVIDENCE_SLOTS } from "@/config/evidence";
import { formatDate, formatDateTime } from "@/lib/utils";

const REC_TEXT: Record<string, string> = {
  ACCEPT: "SAFE TO ACCEPT",
  REVIEW: "REVIEW BEFORE ACCEPTANCE",
  REJECT: "DO NOT ACCEPT DELIVERY",
  INCOMPLETE: "INSPECTION INCOMPLETE",
};
const REC_COLOR: Record<string, [number, number, number]> = {
  ACCEPT: [22, 163, 74],
  REVIEW: [234, 88, 12],
  REJECT: [220, 38, 38],
  INCOMPLETE: [37, 99, 235],
};

const sectionLabel = new Map(CHECKLIST.map((s) => [s.key, s.label]));
const slotLabel = new Map(EVIDENCE_SLOTS.map((s) => [s.key, s.label]));

export function generateReport(
  inspection: Inspection,
  summary: InspectionSummary,
  photos: PhotoTransport[]
): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;
  let y = M;

  const { vehicle } = inspection;
  const { stats, scores, recommendation } = summary;

  const ensure = (needed: number) => {
    if (y + needed > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const heading = (text: string) => {
    ensure(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text(text, M, y);
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.line(M, y, W - M, y);
    y += 6;
  };
  const kv = (label: string, value: string) => {
    ensure(7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label, M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    doc.text(value || "—", M + 45, y);
    y += 6;
  };
  const para = (text: string, size = 9) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(31, 41, 55);
    const lines = doc.splitTextToSize(text, W - M * 2);
    for (const line of lines) {
      ensure(5);
      doc.text(line, M, y);
      y += 5;
    }
  };

  // ---- Cover ----
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 52, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Pre-Delivery Inspection", M, 24);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${vehicle.make} ${vehicle.model} ${vehicle.variant || ""}`.trim(),
    M,
    34
  );
  doc.setFontSize(10);
  doc.text(`VIN: ${vehicle.vin || "—"}`, M, 43);
  y = 64;

  // Recommendation banner
  const rc = REC_COLOR[recommendation.recommendation];
  doc.setFillColor(rc[0], rc[1], rc[2]);
  doc.roundedRect(M, y, W - M * 2, 20, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(REC_TEXT[recommendation.recommendation], W / 2, y + 9, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Overall Score: ${displayScore(scores.overall)}/100`, W / 2, y + 16, {
    align: "center",
  });
  y += 30;

  // ---- Vehicle info ----
  heading("Vehicle Information");
  kv("Make / Model", `${vehicle.make} ${vehicle.model}`);
  kv("Variant", vehicle.variant);
  kv("VIN", vehicle.vin);
  kv("Engine Number", vehicle.engineNumber);
  kv("Odometer", `${vehicle.odometer ?? "—"} km`);
  kv("Mfg. Date", formatDate(vehicle.manufacturingDate));
  kv("Dealer", vehicle.dealerName);
  kv("Inspection Date", formatDate(vehicle.inspectionDate));

  // ---- Statistics & scores ----
  heading("Inspection Results");
  kv("Completion", `${stats.completion}%`);
  kv("Checks", `${stats.totalChecks} across ${stats.totalSections} sections`);
  kv("Passed", `${stats.passed}`);
  kv("Failed", `${stats.failed}`);
  kv("N/A", `${stats.na}`);
  kv("Pending", `${stats.pending}`);
  kv(
    "Issues",
    `${stats.criticalFailures} critical · ${stats.majorFailures} major · ${stats.minorFailures} minor`
  );
  y += 2;
  kv("Exterior", `${displayScore(scores.exterior)}/100`);
  kv("Interior", `${displayScore(scores.interior)}/100`);
  kv("Mechanical", `${displayScore(scores.mechanical)}/100`);
  kv("Electronics", `${displayScore(scores.electronics)}/100`);

  // ---- Failed items ----
  const failed = inspection.items.filter((i) => i.status === "FAIL");
  if (failed.length) {
    heading(`Failed Items (${failed.length})`);
    for (const it of failed) {
      ensure(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      doc.text(`• ${it.label}`, M, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${it.severity} · ${sectionLabel.get(it.sectionKey) ?? it.sectionKey}`,
        W - M,
        y,
        { align: "right" }
      );
      y += 5;
      if (it.notes) para(`Notes: ${it.notes}`, 8);
      if (it.rectification?.dealerAction)
        para(
          `Dealer action: ${it.rectification.dealerAction} (${it.rectification.resolutionStatus})`,
          8
        );
      y += 2;
    }
  }

  // ---- Timeline ----
  const tl = inspection.timeline;
  const tlRows = [
    ["Inspection Started", tl.startedAt],
    ["Exterior Completed", tl.exteriorCompletedAt],
    ["Test Drive Completed", tl.testDriveCompletedAt],
    ["Inspection Finished", tl.finishedAt],
  ].filter(([, t]) => t) as [string, number][];
  if (tlRows.length) {
    heading("Timeline");
    for (const [label, t] of tlRows) kv(label, formatDateTime(t));
  }

  // ---- Notes ----
  const n = inspection.globalNotes;
  const noteRows = [
    ["Dealer Feedback", n.dealerFeedback],
    ["Negotiation Notes", n.negotiationNotes],
    ["Pending Commitments", n.pendingCommitments],
    ["Additional Observations", n.additionalObservations],
  ].filter(([, v]) => v?.trim());
  if (noteRows.length) {
    heading("Notes");
    for (const [label, value] of noteRows) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      ensure(6);
      doc.setTextColor(71, 85, 105);
      doc.text(label as string, M, y);
      y += 5;
      para(value as string, 9);
      y += 2;
    }
  }

  // ---- Photos ----
  const withImages = photos.filter((p) => p.dataUrl);
  if (withImages.length) {
    heading(`Photos (${withImages.length})`);
    const cols = 3;
    const gap = 4;
    const cellW = (W - M * 2 - gap * (cols - 1)) / cols;
    const cellH = cellW * 0.75;
    let col = 0;
    for (const p of withImages) {
      ensure(cellH + 8);
      const x = M + col * (cellW + gap);
      try {
        doc.addImage(p.dataUrl, "JPEG", x, y, cellW, cellH, undefined, "FAST");
      } catch {
        doc.setDrawColor(226, 232, 240);
        doc.rect(x, y, cellW, cellH);
      }
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      const caption =
        p.kind === "evidence"
          ? slotLabel.get(p.refKey ?? "") ?? "Evidence"
          : p.kind === "quick"
          ? "Quick capture"
          : "Checklist";
      doc.text(caption, x, y + cellH + 3);
      col++;
      if (col === cols) {
        col = 0;
        y += cellH + 8;
      }
    }
    if (col !== 0) y += cellH + 8;
  }

  // ---- Footer on every page ----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `PERP · Generated ${formatDateTime(Date.now())}`,
      M,
      H - 8
    );
    doc.text(`Page ${i} of ${pages}`, W - M, H - 8, { align: "right" });
  }

  return doc;
}

export async function downloadReport(
  inspection: Inspection,
  summary: InspectionSummary,
  photos: PhotoTransport[]
) {
  const doc = generateReport(inspection, summary, photos);
  const v = inspection.vehicle;
  const safe = `${v.make}-${v.model}-${v.vin || "vehicle"}`
    .replace(/[^a-z0-9-]+/gi, "-")
    .toLowerCase();
  doc.save(`perp-report-${safe}.pdf`);
}
