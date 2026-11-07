"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Clock, List, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  blocksOn,
  statusOf,
  blockMinutes,
  dayKind,
  examOn,
  targetMinutes,
  studyMinutesOfTimetable,
  sleepMinutesOfTimetable,
} from "@/lib/state";
import { PLAN_START, PLAN_END, type PlanBlock, type TimetableRow, type RowType } from "@/lib/plan";
import { dateRange, fmtDayMonth, fmtLong, fmtHours, istParts, weekdayShort, spanMin, toMin } from "@/lib/time";
import { SUBJECT_MAP } from "@/lib/syllabus";
import { Button, Card, ConfirmModal, Eyebrow, IconButton, PageHeader, ProgressBar, cx } from "@/components/ui";
import { DayTimeline } from "@/components/DayTimeline";
import { BlockEditor, emptyDraft } from "@/components/BlockEditor";
import { MonthCalendar } from "@/components/MonthCalendar";

type Tab = "days" | "calendar" | "timetable";

function TimetableEditor() {
  const { state, setTimetable, resetTimetable, setTargets } = useStore();
  const [confirm, setConfirm] = useState(false);
  const rows = state.timetable;
  const study = studyMinutesOfTimetable(rows);
  const sleep = sleepMinutesOfTimetable(rows);
  const set = (id: string, patch: Partial<TimetableRow>) => setTimetable(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const sorted = [...rows].sort((a, b) => {
    if (a.type === "sleep") return 1;
    if (b.type === "sleep") return -1;
    return toMin(a.start) - toMin(b.start);
  });
  const total = rows.reduce((t, r) => t + spanMin(r.start, r.end), 0);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Eyebrow>Fixed daily timetable</Eyebrow>
          <h2 className="mt-2 font-serif text-2xl">The shape of a normal preparation day</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Routine rows (meals, breaks, sleep) frame every normal study day. Exam days follow their own schedule, and exam hours never count as study.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="soft"
            onClick={() => setTimetable([...rows, { id: `t${Date.now()}`, start: "12:00", end: "12:30", label: "New activity", type: "routine" }])}
          >
            <Plus className="h-4 w-4" /> Add row
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(true)}>
            <RotateCcw className="h-4 w-4" /> Default
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-sage-soft p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-olive-ink">Study sessions</p>
          <p className="num mt-1 text-2xl font-semibold">{fmtHours(study)}</p>
        </div>
        <div className="rounded-2xl bg-bg-soft p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Sleep</p>
          <p className="num mt-1 text-2xl font-semibold">{fmtHours(sleep)}</p>
        </div>
        <label className="rounded-2xl bg-bg-soft p-4">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Study target (h)</span>
          <input type="number" min={1} max={16} step={0.25} className="num mt-1 w-full bg-transparent text-2xl font-semibold outline-none" value={state.targetHours} onChange={(e) => setTargets(Number(e.target.value) || 0, state.sleepHours)} />
        </label>
        <label className="rounded-2xl bg-bg-soft p-4">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Sleep target (h)</span>
          <input type="number" min={4} max={12} step={0.25} className="num mt-1 w-full bg-transparent text-2xl font-semibold outline-none" value={state.sleepHours} onChange={(e) => setTargets(state.targetHours, Number(e.target.value) || 0)} />
        </label>
      </div>
      {study !== Math.round(state.targetHours * 60) && (
        <p className="mt-3 text-xs text-muted">
          The study rows add up to {fmtHours(study)}, while the target is {fmtHours(state.targetHours * 60)}. Progress is measured against the target.
        </p>
      )}
      {total !== 1440 && <p className="mt-1 text-xs text-rose-ink">Rows cover {fmtHours(total)} of the day — check for overlaps or gaps.</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-muted">
              <th className="pb-2 font-medium">Start</th>
              <th className="pb-2 font-medium">End</th>
              <th className="pb-2 font-medium">Activity</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 text-right font-medium">Length</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className={cx("border-t border-line", r.type === "study" && "bg-sage-soft/40")}>
                <td className="py-2 pr-2">
                  <input type="time" className="field py-1.5" value={r.start} onChange={(e) => set(r.id, { start: e.target.value })} aria-label="Start time" />
                </td>
                <td className="py-2 pr-2">
                  <input type="time" className="field py-1.5" value={r.end} onChange={(e) => set(r.id, { end: e.target.value })} aria-label="End time" />
                </td>
                <td className="py-2 pr-2">
                  <input className="field py-1.5" value={r.label} onChange={(e) => set(r.id, { label: e.target.value })} aria-label="Activity" />
                </td>
                <td className="py-2 pr-2">
                  <select className="field py-1.5" value={r.type} onChange={(e) => set(r.id, { type: e.target.value as RowType })} aria-label="Type">
                    <option value="routine">Routine</option>
                    <option value="meal">Meal</option>
                    <option value="break">Break</option>
                    <option value="study">Study</option>
                    <option value="sleep">Sleep</option>
                  </select>
                </td>
                <td className="num py-2 text-right text-muted">{fmtHours(spanMin(r.start, r.end))}</td>
                <td className="py-2 pl-2">
                  <IconButton label="Remove row" onClick={() => setTimetable(rows.filter((x) => x.id !== r.id))}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal open={confirm} onClose={() => setConfirm(false)} title="Restore default timetable?" body="Timings, targets (12 h study, 7.5 h sleep) and rows go back to the original schedule." confirmLabel="Restore" onConfirm={resetTimetable} />
    </Card>
  );
}

export default function PlanPage() {
  const { state, now, restoreBlocks } = useStore();
  const today = istParts(now).dateKey;
  const days = useMemo(() => dateRange(PLAN_START, PLAN_END), []);
  const [tab, setTab] = useState<Tab>("days");
  const [sel, setSel] = useState(today >= PLAN_START && today <= PLAN_END ? today : PLAN_START);
  const [editing, setEditing] = useState<(Omit<PlanBlock, "id"> & { id?: string }) | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const dayStats = (d: string) => {
    const bl = blocksOn(state, d);
    const total = bl.reduce((t, b) => t + blockMinutes(b), 0);
    const done = bl.filter((b) => statusOf(state, b.id) === "done").reduce((t, b) => t + blockMinutes(b), 0);
    return { bl, total, done, pct: total ? (done / total) * 100 : 0 };
  };
  const selStats = dayStats(sel);
  const exam = examOn(sel);
  const modified = state.hiddenBlocks.length > 0 || Object.keys(state.taskEdits).length > 0;

  return (
    <div>
      <PageHeader
        eyebrow="7 – 23 November 2026"
        title="Study Plan"
        subtitle="Every block has a time, a subject, its units and the exact concepts to cover. Tick blocks off as you go; edit or reschedule anything."
        actions={
          <>
            <Button variant="primary" onClick={() => setEditing(emptyDraft(sel))}>
              <Plus className="h-4 w-4" /> Add block
            </Button>
            <Link href="/print/plan" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-bg-soft">
              <Printer className="h-4 w-4" /> Export PDF
            </Link>
            {modified && (
              <Button variant="ghost" onClick={() => setConfirmRestore(true)}>
                <RotateCcw className="h-4 w-4" /> Restore default plan
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 inline-flex rounded-full bg-card p-1 text-sm shadow-sm ring-1 ring-line">
        {(
          [
            ["days", "Day by day", List],
            ["calendar", "Calendar", CalendarDays],
            ["timetable", "Daily timetable", Clock],
          ] as const
        ).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition-colors", tab === k ? "bg-sage-soft font-medium text-olive-ink" : "text-muted hover:text-ink")}>
            <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "timetable" && <TimetableEditor />}

      {tab === "calendar" && (
        <Card>
          <MonthCalendar
            year={2026}
            month={11}
            today={today}
            selected={sel}
            onSelect={(d) => {
              if (d >= PLAN_START && d <= PLAN_END) {
                setSel(d);
                setTab("days");
              }
            }}
            cell={(d) => {
              if (d < PLAN_START || d > PLAN_END) return null;
              const st = dayStats(d);
              const ex = examOn(d);
              const subs = Array.from(new Set(st.bl.map((b) => b.subject).filter(Boolean))) as (keyof typeof SUBJECT_MAP)[];
              return (
                <div className="space-y-1">
                  {ex && <p className="truncate rounded-md bg-rose-soft px-1 text-[10px] font-semibold text-rose-ink">{ex.short} exam</p>}
                  <div className="hidden flex-wrap gap-1 sm:flex">
                    {subs.map((s) => (
                      <span key={s} className="text-[10px] text-muted">
                        <span className="mr-0.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: SUBJECT_MAP[s].color }} />
                        {SUBJECT_MAP[s].short}
                      </span>
                    ))}
                  </div>
                  {st.total > 0 && <ProgressBar value={st.pct} height={3} />}
                </div>
              );
            }}
          />
          <p className="mt-4 text-xs text-muted">Select a day to open its schedule.</p>
        </Card>
      )}

      {tab === "days" && (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Plan days" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-1.5 lg:overflow-visible lg:px-0">
            {days.map((d) => {
              const st = dayStats(d);
              const ex = examOn(d);
              const subs = Array.from(new Set(st.bl.map((b) => b.subject).filter(Boolean))) as (keyof typeof SUBJECT_MAP)[];
              return (
                <button
                  key={d}
                  onClick={() => setSel(d)}
                  className={cx(
                    "w-36 shrink-0 rounded-2xl border p-3 text-left transition-all lg:w-full",
                    sel === d ? "border-olive bg-card shadow-sm" : "border-transparent hover:bg-card",
                    d === today && "ring-1 ring-rose",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="num text-sm font-semibold">
                      {weekdayShort(d)} {fmtDayMonth(d)}
                    </span>
                    {d === today && <span className="text-[10px] uppercase tracking-wider text-rose-ink">Today</span>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">{ex ? `${ex.short} exam${subs.filter((s) => s !== ex.id).length ? " · " + subs.filter((s) => s !== ex.id).map((s) => SUBJECT_MAP[s].short).join(", ") : ""}` : subs.length ? subs.map((s) => SUBJECT_MAP[s].short).join(" · ") : "Preparation"}</p>
                  <ProgressBar value={st.pct} height={3} className="mt-2" />
                </button>
              );
            })}
          </nav>

          <Card>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow>{dayKind(sel) === "exam" ? "Exam day" : dayKind(sel) === "prep" ? "Preparation day" : "Study day"}</Eyebrow>
                <h2 className="mt-1 font-serif text-2xl">{fmtLong(sel)}</h2>
                {exam && (
                  <p className="mt-1 text-sm text-rose-ink">
                    {exam.name} examination · {exam.exam.label} — not counted as study time
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="num text-sm">
                  <span className="font-semibold">{fmtHours(selStats.done)}</span> <span className="text-muted">of {fmtHours(selStats.total)} planned</span>
                </p>
                <p className="num text-xs text-muted">Target {fmtHours(targetMinutes(state, sel))}</p>
              </div>
            </div>
            {selStats.bl.length === 0 && !exam ? (
              <p className="rounded-2xl bg-bg-soft p-6 text-center text-sm text-muted">No study blocks on this day.</p>
            ) : (
              <DayTimeline date={sel} onEdit={(b) => setEditing(b)} />
            )}
          </Card>
        </div>
      )}

      <BlockEditor open={!!editing} initial={editing} onClose={() => setEditing(null)} />
      <ConfirmModal
        open={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        title="Restore the default plan?"
        body="Removed default blocks come back and edits to default blocks are undone. Your own added blocks and all ticked progress stay."
        confirmLabel="Restore"
        onConfirm={restoreBlocks}
      />
    </div>
  );
}
