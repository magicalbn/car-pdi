"use client";

import * as React from "react";
import { AlertTriangle, Wrench } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusToggle } from "@/components/inspection/status-toggle";
import { PhotoCapture } from "@/components/inspection/photo-capture";
import { PhotoStrip } from "@/components/inspection/photo-grid";
import { updateItem } from "@/lib/repo";
import type { InspectionItem, ResolutionStatus, Severity } from "@/types";
import type { PhotoView } from "@/hooks/usePhotoUrls";
import { cn } from "@/lib/utils";

export function ChecklistItem({
  inspectionId,
  item,
  photoViews,
}: {
  inspectionId: string;
  item: InspectionItem;
  photoViews: PhotoView[];
}) {
  const [notes, setNotes] = React.useState(item.notes);
  const [dealerAction, setDealerAction] = React.useState(
    item.rectification?.dealerAction ?? ""
  );
  const notesTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync if the underlying item changes elsewhere.
  React.useEffect(() => setNotes(item.notes), [item.notes]);
  React.useEffect(
    () => setDealerAction(item.rectification?.dealerAction ?? ""),
    [item.rectification?.dealerAction]
  );

  function saveNotes(value: string) {
    setNotes(value);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      updateItem(inspectionId, item.id, { notes: value });
    }, 500);
  }

  function saveDealerAction(value: string) {
    setDealerAction(value);
    if (actionTimer.current) clearTimeout(actionTimer.current);
    actionTimer.current = setTimeout(() => {
      updateItem(inspectionId, item.id, {
        rectification: {
          dealerAction: value,
          resolutionStatus: item.rectification?.resolutionStatus ?? "PENDING",
        },
      });
    }, 500);
  }

  const isFail = item.status === "FAIL";
  const missingNotes = isFail && !notes.trim();
  const missingPhoto = isFail && photoViews.length === 0;
  const invalid = missingNotes || missingPhoto;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        item.status === "PASS" && "border-pass/30 bg-pass/[0.04]",
        isFail && "border-fail/30 bg-fail/[0.04]",
        item.status === "NA" && "bg-muted/30",
        item.status === "PENDING" && "bg-card"
      )}
      id={item.id}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{item.label}</p>
        <SeverityPicker
          value={item.severity}
          onChange={(severity) =>
            updateItem(inspectionId, item.id, { severity })
          }
        />
      </div>

      <StatusToggle
        value={item.status}
        onChange={(status) => updateItem(inspectionId, item.id, { status })}
      />

      {(isFail || notes || photoViews.length > 0) && (
        <div className="mt-3 space-y-2.5">
          <Textarea
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
            placeholder={
              isFail ? "Describe the issue (required)…" : "Add a note…"
            }
            className={cn("min-h-[64px] text-sm", missingNotes && "border-fail")}
          />

          <PhotoStrip views={photoViews} />

          <div className="flex items-center justify-between gap-2">
            <PhotoCapture
              inspectionId={inspectionId}
              kind="item"
              refKey={item.id}
            />
            {invalid && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-major">
                <AlertTriangle className="h-3.5 w-3.5" />
                {missingNotes && missingPhoto
                  ? "Notes & photo required"
                  : missingNotes
                  ? "Notes required"
                  : "Photo required"}
              </span>
            )}
          </div>

          {isFail && (
            <div className="rounded-lg border border-dashed bg-background p-2.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" /> Dealer Rectification
              </div>
              <Textarea
                value={dealerAction}
                onChange={(e) => saveDealerAction(e.target.value)}
                placeholder="What did the dealer commit to fix?"
                className="mb-2 min-h-[44px] text-sm"
              />
              <ResolutionPicker
                value={item.rectification?.resolutionStatus ?? "PENDING"}
                onChange={(resolutionStatus) =>
                  updateItem(inspectionId, item.id, {
                    rectification: {
                      dealerAction,
                      resolutionStatus,
                    },
                  })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SeverityPicker({
  value,
  onChange,
}: {
  value: Severity;
  onChange: (s: Severity) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Severity)}>
      <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent px-1.5 py-0 text-xs focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CRITICAL">
          <Badge variant="critical">Critical</Badge>
        </SelectItem>
        <SelectItem value="MAJOR">
          <Badge variant="major">Major</Badge>
        </SelectItem>
        <SelectItem value="MINOR">
          <Badge variant="minor">Minor</Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function ResolutionPicker({
  value,
  onChange,
}: {
  value: ResolutionStatus;
  onChange: (s: ResolutionStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ResolutionStatus)}>
      <SelectTrigger className="h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="RESOLVED">Resolved</SelectItem>
        <SelectItem value="REJECTED">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}
