"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarClock, CheckCircle2, Clock3, Hourglass, Moon, Target, Quote, ListChecks, BookOpenCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  blocksOn,
  scheduleFor,
  currentIndex,
  statusOf,
  blockMinutes,
  nextExam,
  syllabusPct,
  unitsCompleted,
  overallPct,
  planPct,
  targetMinutes,
  dayKind,
  examCompleted,
  studyMinutesOfTimetable,
  sleepMinutesOfTimetable,
} from "@/lib/state";
import { EXAMS, SUBJECT_MAP } from "@/lib/syllabus";
import { QUOTES, type PlanBlock, PLAN_START, PLAN_END } from "@/lib/plan";
import { istParts, fmtDate, fmtLong, fmtRange, fmtHours, dayDiff, toMin, countdownParts } from "@/lib/time";
import { Card, Eyebrow, ProgressRing, PriorityBadge, SubjectTag, cx, Checkbox } from "@/components/ui";
import { DayTimeline } from "@/components/DayTimeline";
import { TimerPanel } from "@/components/TimerPanel";
import { BlockEditor } from "@/components/BlockEditor";
import { examStart } from "@/lib/state";

function HeroStat({ icon: Icon, label, value, hint }: { icon: typeof Clock3; label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="card lift p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="num mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { state, now, toggleTask, updateTodo } = useStore();
  const [editing, setEditing] = useState<PlanBlock | null>(null);
  const p = istParts(now);
  const today = p.dateKey;

  const next = nextExam(state, now);
  const daysToNext = next ? dayDiff(today, next.exam.date) : null;
  const cd = next ? countdownParts(examStart(next).getTime() - now.getTime()) : null;

  const blocks = blocksOn(state, today);
  const items = scheduleFor(state, today);
  const ci = currentIndex(items, p.minutes);
  const currentItem = ci >= 0 ? items[ci] : undefined;
  const upcoming = items.filter((it) => it.block && toMin(it.start) > p.minutes && it.type !== "sleep");
  const nextBlock = upcoming.find((it) => it !== currentItem)?.block;
  const doneBlocks = blocks.filter((b) => statusOf(state, b.id) === "done");
  const scheduled = blocks.reduce((t, b) => t + blockMinutes(b), 0);
  const remaining = blocks.filter((b) => statusOf(state, b.id) !== "done").reduce((t, b) => t + blockMinutes(b), 0);
  const subjectsToday = Array.from(new Set(blocks.map((b) => b.subject).filter(Boolean))) as (keyof typeof SUBJECT_MAP)[];
  const kind = dayKind(today);
  const quote = QUOTES[Math.abs(dayDiff("2026-01-01", today)) % QUOTES.length];

  const overall = overallPct(state);
  const syl = syllabusPct(state);
  const plan = planPct(state);
  const studyDaily = studyMinutesOfTimetable(state.timetable);
  const sleepDaily = sleepMinutesOfTimetable(state.timetable);
  const sleepRow = state.timetable.find((r) => r.type === "sleep");

  const openTodos = state.todos
    .filter((t) => !t.done)
    .sort((a, b) => ["high", "medium", "low"].indexOf(a.priority) - ["high", "medium", "low"].indexOf(b.priority))
    .slice(0, 4);

  // Nearest plan day for empty states (before the plan begins or after it ends).
  const outside = today < PLAN_START ? "before" : today > PLAN_END ? "after" : null;

  return (
    <div className="space-y-8">
      {/* ── Hero */}
      <section className="card dot-grid relative overflow-hidden p-6 sm:p-10 fade-in">
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Eyebrow>{fmtLong(today)}</Eyebrow>
            <h1 className="mt-3 font-serif text-4xl leading-[1.1] sm:text-5xl">
              Your semester. <span className="italic text-olive">Your discipline.</span> Your results.
            </h1>
            <p className="mt-4 max-w-xl text-muted">One chapter at a time. One exam at a time. Full marks mindset.</p>
            <figure className="mt-6 flex max-w-xl gap-3 rounded-2xl bg-bg/70 p-4">
              <Quote className="h-4 w-4 shrink-0 text-rose-ink" />
              <div>
                <blockquote className="font-serif text-base italic leading-snug">{quote.text}</blockquote>
                <figcaption className="mt-1 text-xs text-muted">— {quote.by}</figcaption>
              </div>
            </figure>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ProgressRing value={overall} size={190} stroke={11} label={`Overall semester preparation ${overall} percent`}>
              <span className="num font-serif text-5xl">{overall}%</span>
              <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">Semester ready</span>
            </ProgressRing>
            <p className="num text-center text-xs text-muted">
              Syllabus {syl}% · Plan done {plan}%
            </p>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <HeroStat
            icon={Hourglass}
            label="Next exam in"
            value={daysToNext === null ? "—" : daysToNext <= 0 ? "Today" : `${daysToNext} ${daysToNext === 1 ? "day" : "days"}`}
            hint={cd && daysToNext !== null && daysToNext >= 0 ? `${cd.d}d ${cd.h}h ${cd.m}m to start` : "All exams complete"}
          />
          <HeroStat icon={CalendarClock} label="Next exam" value={<span className="block truncate text-lg leading-8">{next ? next.name : "Done"}</span>} hint={next ? `${fmtDate(next.exam.date)} · ${next.exam.label}` : "Semester complete"} />
          <HeroStat icon={BookOpenCheck} label="Syllabus" value={`${syl}%`} hint="Across all four stages" />
          <HeroStat icon={CheckCircle2} label="Units done" value={<>{unitsCompleted(state)}<span className="text-base text-muted"> / 30</span></>} hint="All four stages ticked" />
          <HeroStat icon={Target} label="Study target" value={`${state.targetHours}h`} hint={`Sessions add up to ${fmtHours(studyDaily)}`} />
          <HeroStat icon={Moon} label="Sleep target" value={`${state.sleepHours}h`} hint={sleepRow ? `${fmtRange(sleepRow.start, sleepRow.end)} · ${fmtHours(sleepDaily)}` : fmtHours(sleepDaily)} />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── Today's focus */}
        <Card className="fade-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Eyebrow>Today’s focus</Eyebrow>
              <h2 className="mt-2 font-serif text-2xl">{fmtLong(today)}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {kind === "exam" && <span className="rounded-full bg-rose-soft px-2.5 py-0.5 text-xs font-medium text-rose-ink">Exam day</span>}
                {kind === "prep" && <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-medium text-amber-ink">Preparation day</span>}
                {subjectsToday.map((s) => (
                  <SubjectTag key={s} id={s} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-right sm:min-w-64">
              <div>
                <p className="num text-xl font-semibold">
                  {doneBlocks.length}/{blocks.length}
                </p>
                <p className="text-[11px] text-muted">Blocks done</p>
              </div>
              <div>
                <p className="num text-xl font-semibold">{fmtHours(remaining)}</p>
                <p className="text-[11px] text-muted">Study left</p>
              </div>
              <div>
                <p className="num text-xl font-semibold">{fmtHours(targetMinutes(state, today))}</p>
                <p className="text-[11px] text-muted">{kind === "study" ? "Daily target" : "Today’s target"}</p>
              </div>
            </div>
          </div>

          {outside ? (
            <div className="mt-6 rounded-2xl bg-bg-soft p-6 text-center">
              <p className="font-serif text-xl">{outside === "before" ? "The plan begins on 7 November." : "Every exam is behind you."}</p>
              <p className="mt-1 text-sm text-muted">{outside === "before" ? "Use these days to collect notes and settle the routine." : "Take a breath — the semester is locked in."}</p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className={cx("rounded-2xl p-4", currentItem?.block ? "bg-rose-soft/60" : "bg-bg-soft")}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Right now</p>
                  {currentItem ? (
                    <>
                      <p className="mt-1.5 font-medium leading-snug">{currentItem.label}</p>
                      <p className="num mt-0.5 text-xs text-muted">{fmtRange(currentItem.start, currentItem.end)}</p>
                      {currentItem.block && (
                        <label className="mt-3 flex items-center gap-2 text-xs">
                          <Checkbox size="sm" checked={statusOf(state, currentItem.block.id) === "done"} onChange={() => toggleTask(currentItem.block!.id)} label="Mark current block complete" />
                          Mark complete
                        </label>
                      )}
                    </>
                  ) : (
                    <p className="mt-1.5 text-sm text-muted">Nothing scheduled at this minute.</p>
                  )}
                </div>
                <div className="rounded-2xl bg-bg-soft p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Up next</p>
                  {nextBlock ? (
                    <>
                      <p className="mt-1.5 font-medium leading-snug">{nextBlock.title}</p>
                      <p className="num mt-0.5 text-xs text-muted">
                        {fmtRange(nextBlock.start, nextBlock.end)} · {nextBlock.subject ? SUBJECT_MAP[nextBlock.subject].short : "Prep"}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1.5 text-sm text-muted">No more study blocks today{scheduled ? " — rest well." : "."}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <DayTimeline date={today} onEdit={setEditing} />
              </div>
            </>
          )}
        </Card>

        {/* ── Right column */}
        <div className="space-y-8">
          <Card className="fade-in">
            <TimerPanel />
          </Card>

          <Card className="fade-in">
            <div className="flex items-center justify-between">
              <Eyebrow>Exam countdown</Eyebrow>
              <Link href="/exams" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                Exam mode <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="mt-4 space-y-2">
              {EXAMS.map((s) => {
                const done = examCompleted(state, s, now);
                const isNext = next?.id === s.id;
                const d = dayDiff(today, s.exam.date);
                return (
                  <li key={s.id} className={cx("flex items-center gap-3 rounded-xl px-3 py-2", isNext && "bg-sage-soft")}>
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className={cx("flex-1 truncate text-sm", done && "text-muted line-through")}>{s.name}</span>
                    <span className="num text-xs text-muted">{done ? "Done" : d <= 0 ? "Today" : `${d}d`}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="fade-in">
            <div className="flex items-center justify-between">
              <Eyebrow>Priority tasks</Eyebrow>
              <Link href="/tasks" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                All tasks <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {openTodos.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <ListChecks className="h-4 w-4" /> No open tasks. Press <kbd className="rounded border border-line px-1.5 text-xs">N</kbd> to add one.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {openTodos.map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <Checkbox size="sm" checked={t.done} onChange={(v) => updateTodo(t.id, { done: v })} label={`Complete ${t.title}`} />
                    <span className="flex-1 truncate text-sm">{t.title}</span>
                    <PriorityBadge p={t.priority} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <BlockEditor open={!!editing} initial={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
