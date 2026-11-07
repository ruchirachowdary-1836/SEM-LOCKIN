"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { PlanBlock, Priority, BlockKind } from "@/lib/plan";
import { PLAN_START, PLAN_END } from "@/lib/plan";
import { SUBJECTS, SUBJECT_MAP, type SubjectId } from "@/lib/syllabus";
import { useStore } from "@/lib/store";
import { Button, Field, Modal, ConfirmModal } from "./ui";
import { toMin } from "@/lib/time";

type Draft = Omit<PlanBlock, "id"> & { id?: string };

export function emptyDraft(date: string): Draft {
  return { date, start: "08:00", end: "10:30", subject: "dl", units: [], title: "", concepts: [], priority: "medium", kind: "study" };
}

export function BlockEditor({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: Draft | null }) {
  const { saveBlock, addBlock, deleteBlock } = useStore();
  const [d, setD] = useState<Draft | null>(initial);
  const [conceptText, setConceptText] = useState("");
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    setD(initial);
    setConceptText(initial?.concepts.join("\n") ?? "");
    setErr("");
  }, [initial, open]);

  if (!d) return null;
  const subjectUnits = d.subject ? SUBJECT_MAP[d.subject].units : [];

  const submit = () => {
    if (!d.title.trim()) return setErr("Give this block a title.");
    if (toMin(d.end) <= toMin(d.start)) return setErr("End time must be after start time.");
    const concepts = conceptText.split("\n").map((x) => x.trim()).filter(Boolean);
    const full = { ...d, title: d.title.trim(), concepts };
    if (full.id) saveBlock(full as PlanBlock);
    else addBlock(full);
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={d.id ? "Edit study block" : "New study block"} wide>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date">
            <input type="date" className="field" min={PLAN_START} max={PLAN_END} value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} />
          </Field>
          <Field label="Start">
            <input type="time" className="field" value={d.start} onChange={(e) => setD({ ...d, start: e.target.value })} />
          </Field>
          <Field label="End">
            <input type="time" className="field" value={d.end} onChange={(e) => setD({ ...d, end: e.target.value })} />
          </Field>
          <Field label="Subject">
            <select
              className="field"
              value={d.subject ?? ""}
              onChange={(e) => setD({ ...d, subject: (e.target.value || null) as SubjectId | null, units: [] })}
            >
              <option value="">General</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select className="field" value={d.priority} onChange={(e) => setD({ ...d, priority: e.target.value as Priority })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>
          <Field label="Type">
            <select className="field" value={d.kind} onChange={(e) => setD({ ...d, kind: e.target.value as BlockKind })}>
              <option value="study">First study</option>
              <option value="revision">Revision</option>
              <option value="prep">Preparation</option>
            </select>
          </Field>
        </div>
        {subjectUnits.length > 0 && (
          <div className="mt-4">
            <span className="mb-1.5 block text-xs font-medium text-muted">Units</span>
            <div className="flex flex-wrap gap-2">
              {subjectUnits.map((u) => {
                const on = d.units.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setD({ ...d, units: on ? d.units.filter((x) => x !== u.id) : [...d.units, u.id] })}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${on ? "border-olive bg-sage-soft text-olive-ink" : "border-line text-muted hover:border-sage"}`}
                  >
                    Unit {u.n}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <Field label="Title" className="mt-4">
          <input className="field" value={d.title} placeholder="e.g. Unit III — Convolution basics" onChange={(e) => setD({ ...d, title: e.target.value })} />
        </Field>
        <Field label="Concepts to study (one per line)" className="mt-4">
          <textarea className="field min-h-32" value={conceptText} onChange={(e) => setConceptText(e.target.value)} />
        </Field>
        {err && <p className="mt-3 text-sm text-rose-ink">{err}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          {d.id ? (
            <Button variant="danger" onClick={() => setConfirmDel(true)}>
              <Trash2 className="h-4 w-4" /> Remove block
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit}>
              {d.id ? "Save changes" : "Add block"}
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Remove this block?"
        body={<>“{d.title}” will be removed from the plan. Default blocks can be brought back later with “Restore default plan”.</>}
        confirmLabel="Remove"
        onConfirm={() => {
          if (d.id) deleteBlock(d.id);
          onClose();
        }}
      />
    </>
  );
}
