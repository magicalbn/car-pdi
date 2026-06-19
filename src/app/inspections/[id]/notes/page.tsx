"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  LoadingInspection,
  NotFoundInspection,
} from "@/components/inspection/states";
import { useInspection } from "@/hooks/useInspection";
import { setGlobalNotes } from "@/lib/repo";
import type { GlobalNotes } from "@/types";

const FIELDS: { key: keyof GlobalNotes; label: string; hint: string }[] = [
  {
    key: "dealerFeedback",
    label: "Dealer Feedback",
    hint: "Observations shared with or by the dealer.",
  },
  {
    key: "negotiationNotes",
    label: "Negotiation Notes",
    hint: "Price, discounts, add-ons discussed.",
  },
  {
    key: "pendingCommitments",
    label: "Pending Commitments",
    hint: "Promises to be fulfilled before/after delivery.",
  },
  {
    key: "additionalObservations",
    label: "Additional Observations",
    hint: "Anything else worth recording.",
  },
];

export default function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const insp = useInspection(id);

  if (insp === undefined) return <LoadingInspection />;
  if (insp === null) return <NotFoundInspection />;

  return (
    <>
      <AppHeader
        title="Inspection Notes"
        subtitle="Autosaves continuously"
        backHref={`/inspections/${id}`}
      />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        {FIELDS.map((f) => (
          <NoteField
            key={f.key}
            inspectionId={id}
            field={f.key}
            label={f.label}
            hint={f.hint}
            initial={insp.globalNotes[f.key]}
          />
        ))}
      </main>
    </>
  );
}

function NoteField({
  inspectionId,
  field,
  label,
  hint,
  initial,
}: {
  inspectionId: string;
  field: keyof GlobalNotes;
  label: string;
  hint: string;
  initial: string;
}) {
  const [value, setValue] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(v: string) {
    setValue(v);
    setSaved(false);
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await setGlobalNotes(inspectionId, { [field]: v });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 600);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving
            </>
          ) : saved ? (
            <>
              <Check className="h-3.5 w-3.5 text-pass" /> Saved
            </>
          ) : null}
        </span>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint}
          className="min-h-[120px]"
        />
      </CardContent>
    </Card>
  );
}
