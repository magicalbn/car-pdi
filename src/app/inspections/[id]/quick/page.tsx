"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { Zap, Save, Tag, Check } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PhotoCapture } from "@/components/inspection/photo-capture";
import { PhotoStrip } from "@/components/inspection/photo-grid";
import { EmptyState } from "@/components/inspection/empty-state";
import {
  LoadingInspection,
  NotFoundInspection,
} from "@/components/inspection/states";
import { useInspection } from "@/hooks/useInspection";
import { useInspectionPhotos, type PhotoView } from "@/hooks/usePhotoUrls";
import { addQuickCapture, assignQuickCapture } from "@/lib/repo";
import { CHECKLIST } from "@/config/checklist";
import { relativeTime } from "@/lib/utils";

export default function QuickCapturePage() {
  const { id } = useParams<{ id: string }>();
  const insp = useInspection(id);
  const { views } = useInspectionPhotos(id);
  const [note, setNote] = React.useState("");

  const quickViews = React.useMemo(
    () => views.filter((v) => v.record.kind === "quick"),
    [views]
  );

  const viewById = React.useMemo(() => {
    const m = new Map<string, PhotoView>();
    quickViews.forEach((v) => m.set(v.id, v));
    return m;
  }, [quickViews]);

  if (insp === undefined) return <LoadingInspection />;
  if (insp === null) return <NotFoundInspection />;

  const assignedIds = new Set(
    insp.quickCaptureNotes.flatMap((q) => q.photoIds)
  );
  const stagedViews = quickViews.filter((v) => !assignedIds.has(v.id));

  async function handleSave() {
    if (!note.trim() && stagedViews.length === 0) {
      toast.error("Add a note or a photo first");
      return;
    }
    await addQuickCapture(
      id,
      note.trim(),
      stagedViews.map((v) => v.id)
    );
    setNote("");
    toast.success("Quick capture saved");
  }

  return (
    <>
      <AppHeader
        title="Quick Capture"
        subtitle="Snap now, categorize later"
        backHref={`/inspections/${id}`}
      />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        <Card className="border-primary/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Zap className="h-4 w-4" /> New Capture
            </div>
            <PhotoCapture
              inspectionId={id}
              kind="quick"
              variant="dropzone"
            />
            {stagedViews.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">
                  {stagedViews.length} unsaved photo(s)
                </p>
                <PhotoStrip views={stagedViews} size={56} />
              </div>
            )}
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Quick note about the issue…"
            />
            <Button className="w-full" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Capture
            </Button>
          </CardContent>
        </Card>

        <h3 className="px-1 text-sm font-semibold text-muted-foreground">
          Saved Captures ({insp.quickCaptureNotes.length})
        </h3>

        {insp.quickCaptureNotes.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No quick captures yet"
            description="Walk around the vehicle and capture issues fast. Assign them to checklist items anytime."
          />
        ) : (
          <div className="space-y-3">
            {insp.quickCaptureNotes.map((qc) => {
              const qViews = qc.photoIds
                .map((pid) => viewById.get(pid))
                .filter((v): v is PhotoView => !!v);
              return (
                <Card key={qc.id}>
                  <CardContent className="space-y-2 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {relativeTime(qc.createdAt)}
                      </span>
                      {qc.assignedItemId ? (
                        <Badge variant="pass">
                          <Check className="mr-1 h-3 w-3" /> Assigned
                        </Badge>
                      ) : (
                        <AssignDialog
                          inspectionId={id}
                          quickId={qc.id}
                        />
                      )}
                    </div>
                    {qc.note && <p className="text-sm">{qc.note}</p>}
                    {qViews.length > 0 && (
                      <PhotoStrip views={qViews} size={56} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

function AssignDialog({
  inspectionId,
  quickId,
}: {
  inspectionId: string;
  quickId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const items = React.useMemo(() => {
    const all = CHECKLIST.flatMap((s) =>
      s.categories.flatMap((c) =>
        c.items.map((it) => ({
          id: `${s.key}.${c.key}.${it.key}`,
          label: it.label,
          section: s.label,
        }))
      )
    );
    const query = q.trim().toLowerCase();
    return query
      ? all.filter(
          (i) =>
            i.label.toLowerCase().includes(query) ||
            i.section.toLowerCase().includes(query)
        )
      : all;
  }, [q]);

  async function assign(itemId: string) {
    await assignQuickCapture(inspectionId, quickId, itemId);
    setOpen(false);
    toast.success("Assigned to checklist item");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="h-3.5 w-3.5" /> Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign to Check</DialogTitle>
        </DialogHeader>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search checks…"
        />
        <div className="-mx-2 max-h-[50vh] overflow-y-auto px-2">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => assign(it.id)}
              className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <span className="font-medium">{it.label}</span>
              <span className="text-xs text-muted-foreground">
                {it.section}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
