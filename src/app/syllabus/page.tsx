"use client";

import { useRef, useState } from "react";
import { ChevronDown, NotebookPen } from "lucide-react";
import { useStore } from "@/lib/store";
import { UNIT_STAGES, unitPct, unitDone, subjectPct, syllabusPct, unitsCompleted } from "@/lib/state";
import { SUBJECTS, type SubjectId, type Unit } from "@/lib/syllabus";
import { fmtDate } from "@/lib/time";
import { Card, Checkbox, Eyebrow, PageHeader, ProgressBar, ProgressRing, cx } from "@/components/ui";

const ROMAN = ["I", "II", "III", "IV", "V"];

function NoteBox({ k, placeholder }: { k: string; placeholder: string }) {
  const { state, setNote } = useStore();
  const [saved, setSaved] = useState(false);
  const t = useRef<number | undefined>(undefined);
  return (
    <div className="relative">
      <textarea
        className="field min-h-28 text-sm leading-relaxed"
        placeholder={placeholder}
        value={state.notes[k] ?? ""}
        onChange={(e) => {
          setNote(k, e.target.value);
          setSaved(true);
          window.clearTimeout(t.current);
          t.current = window.setTimeout(() => setSaved(false), 1200);
        }}
      />
      <span className={cx("pointer-events-none absolute bottom-2 right-3 text-[10px] text-muted transition-opacity", saved ? "opacity-100" : "opacity-0")}>Saved</span>
    </div>
  );
}

function UnitRow({ u, color }: { u: Unit; color: string }) {
  const { state, setStage, setUnitComplete } = useStore();
  const [open, setOpen] = useState(false);
  const pct = unitPct(state, u.id);
  const done = unitDone(state, u.id);
  const stages = state.units[u.id] ?? {};
  const hasNote = !!state.notes[u.id]?.trim();
  return (
    <div className={cx("rounded-2xl border transition-colors", done ? "border-sage bg-sage-soft/40" : "border-line bg-card")}>
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Checkbox checked={done} onChange={(v) => setUnitComplete(u.id, v)} label={`Mark Unit ${u.n} ${u.title} complete`} className="mt-0.5" />
          <button className="min-w-0 flex-1 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Unit {ROMAN[u.n - 1]}</p>
            <p className={cx("font-medium leading-snug", done && "text-olive-ink")}>{u.title}</p>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pl-8 md:pl-0">
          {UNIT_STAGES.map((st) => {
            const on = !!stages[st.key];
            return (
              <button
                key={st.key}
                role="switch"
                aria-checked={on}
                onClick={() => setStage(u.id, st.key, !on)}
                className={cx(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  on ? "border-olive bg-olive text-white dark:text-[#1b1d1a]" : "border-line text-muted hover:border-sage hover:text-ink",
                )}
              >
                {st.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 pl-8 md:w-40 md:pl-0">
          <ProgressBar value={pct} color={color} className="flex-1" />
          <span className="num w-9 text-right text-xs font-semibold">{pct}%</span>
          <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Collapse unit" : "Expand unit"} className="text-muted hover:text-ink">
            <ChevronDown className={cx("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>
      {!open && hasNote && (
        <p className="flex items-center gap-1.5 px-4 pb-3 pl-12 text-[11px] text-muted">
          <NotebookPen className="h-3 w-3" /> Has notes
        </p>
      )}
      {open && (
        <div className="fade-in grid gap-5 border-t border-line/70 p-4 md:grid-cols-2 md:pl-12">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Topics</p>
            <ul className="space-y-1.5">
              {u.topics.map((t) => (
                <li key={t} className="flex gap-2 text-sm">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Unit notes</p>
            <NoteBox k={u.id} placeholder="Key definitions, formulas, mnemonics, doubts to clear…" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SyllabusPage() {
  const { state } = useStore();
  const [filter, setFilter] = useState<SubjectId | "all">("all");
  const list = filter === "all" ? SUBJECTS : SUBJECTS.filter((s) => s.id === filter);

  return (
    <div>
      <PageHeader
        eyebrow="Six subjects · thirty units"
        title="Syllabus Tracker"
        subtitle="Each unit moves through four stages: first reading, notes, revision and a self-test. Ticking the unit checkbox completes all four."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-5">
          <ProgressRing value={syllabusPct(state)} size={84} stroke={7}>
            <span className="num text-lg font-semibold">{syllabusPct(state)}%</span>
          </ProgressRing>
          <div>
            <Eyebrow>Overall syllabus</Eyebrow>
            <p className="mt-1 text-sm text-muted">Average stage progress across all units</p>
          </div>
        </Card>
        <Card>
          <Eyebrow>Units complete</Eyebrow>
          <p className="num mt-2 text-3xl font-semibold">
            {unitsCompleted(state)} <span className="text-lg text-muted">/ 30</span>
          </p>
        </Card>
        <Card>
          <Eyebrow>Stages ticked</Eyebrow>
          <p className="num mt-2 text-3xl font-semibold">
            {Object.values(state.units).reduce((t, u) => t + Object.values(u).filter(Boolean).length, 0)} <span className="text-lg text-muted">/ 120</span>
          </p>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[{ id: "all" as const, short: "All subjects", color: "" }, ...SUBJECTS].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={cx("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors", filter === s.id ? "border-olive bg-sage-soft text-olive-ink" : "border-line text-muted hover:text-ink")}
          >
            {s.color && <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />}
            {s.short}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {list.map((s) => {
          const pct = subjectPct(state, s.id);
          const doneCount = s.units.filter((u) => unitDone(state, u.id)).length;
          return (
            <Card key={s.id} className="fade-in">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <ProgressRing value={pct} size={64} stroke={6} color={s.color}>
                    <span className="num text-sm font-semibold">{pct}%</span>
                  </ProgressRing>
                  <div>
                    <h2 className="font-serif text-2xl leading-tight">{s.name}</h2>
                    <p className="num text-xs text-muted">
                      {doneCount}/5 units complete · Exam {fmtDate(s.exam.date)}, {s.exam.label}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                {s.units.map((u) => (
                  <UnitRow key={u.id} u={u} color={s.color} />
                ))}
              </div>
              <details className="mt-5 rounded-2xl bg-bg-soft p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Subject notes {state.notes[s.id]?.trim() ? <span className="text-xs text-muted">· saved</span> : null}
                </summary>
                <div className="mt-3">
                  <NoteBox k={s.id} placeholder={`Anything for ${s.name} as a whole: exam pattern, faculty hints, weak areas…`} />
                </div>
              </details>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
