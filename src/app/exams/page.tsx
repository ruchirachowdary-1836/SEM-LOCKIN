"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Circle, Clock3, GraduationCap, Printer, Target, Undo2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { examCompleted, nextExam, unitDone, examStart, examEnd, allBlocks, statusOf, subjectPct } from "@/lib/state";
import { EXAMS, type Subject } from "@/lib/syllabus";
import { istParts, fmtLong, fmtDate, dayDiff, countdownParts, weekdayOf } from "@/lib/time";
import { Button, Card, Checkbox, Eyebrow, PageHeader, ProgressBar, cx } from "@/components/ui";
import { MonthCalendar } from "@/components/MonthCalendar";
import { BlockRow } from "@/components/DayTimeline";

function Countdown({ to }: { to: Date }) {
  const { now } = useStore();
  const c = countdownParts(to.getTime() - now.getTime());
  return (
    <div className="flex gap-3" aria-label="Countdown">
      {(
        [
          ["d", "Days"],
          ["h", "Hours"],
          ["m", "Min"],
          ["s", "Sec"],
        ] as const
      ).map(([k, label]) => (
        <div key={k} className="min-w-14 rounded-2xl bg-card/80 px-3 py-2 text-center ring-1 ring-line">
          <p className="num text-2xl font-semibold">{String(c[k]).padStart(2, "0")}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

function CheckList({ sid, kind, items, title }: { sid: string; kind: string; items: string[]; title: string }) {
  const { state, toggleExamCheck } = useStore();
  const done = items.filter((_, i) => state.examChecks[`${sid}:${kind}:${i}`]).length;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{title}</p>
        <span className="num text-xs text-muted">
          {done}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const key = `${sid}:${kind}:${i}`;
          const on = !!state.examChecks[key];
          return (
            <li key={key} className="flex items-start gap-2.5">
              <Checkbox size="sm" checked={on} onChange={() => toggleExamCheck(key)} label={it} className="mt-0.5" />
              <span className={cx("text-sm leading-snug", on && "text-muted line-through decoration-sage")}>{it}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function revisionItems(s: Subject) {
  return [
    ...s.units.map((u) => `Revise Unit ${u.n} — ${u.title}`),
    "Write a one-page definitions & formula sheet",
    "Solve one previous-year question paper under time",
    "Check hall ticket, ID and stationery the night before",
  ];
}

function SubjectPrep({ s, defaultOpen }: { s: Subject; defaultOpen?: boolean }) {
  const { state, now, setExamDone } = useStore();
  const [open, setOpen] = useState(!!defaultOpen);
  const done = examCompleted(state, s, now);
  const unitsDone = s.units.filter((u) => unitDone(state, u.id)).length;
  const days = dayDiff(istParts(now).dateKey, s.exam.date);
  const manual = state.examDone[s.id] !== undefined;
  return (
    <Card className={cx("fade-in", done && "opacity-80")}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button className="flex items-center gap-4 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="h-10 w-1.5 rounded-full" style={{ background: s.color }} />
          <div>
            <h3 className="font-serif text-xl leading-tight">{s.name}</h3>
            <p className="num text-xs text-muted">
              {weekdayOf(s.exam.date)}, {fmtDate(s.exam.date)} · {s.exam.label} · {done ? "Completed" : days <= 0 ? "Today" : `${days} days left`}
            </p>
          </div>
        </button>
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <p className="num text-sm">
              <span className="font-semibold">{unitsDone}</span> done · <span className="font-semibold">{5 - unitsDone}</span> remaining
            </p>
            <ProgressBar value={subjectPct(state, s.id)} color={s.color} className="mt-1 w-40" />
          </div>
          {done ? (
            <Button variant="ghost" onClick={() => setExamDone(s.id, manual ? undefined : false)} title={manual ? "Return to automatic status" : "Mark as not yet written"}>
              <Undo2 className="h-4 w-4" /> {manual ? "Auto status" : "Not done"}
            </Button>
          ) : (
            <Button variant="soft" onClick={() => setExamDone(s.id, true)}>
              <CheckCircle2 className="h-4 w-4" /> Mark written
            </Button>
          )}
        </div>
      </div>
      {open && (
        <div className="fade-in mt-6 grid gap-8 border-t border-line pt-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Important topics</p>
            <ul className="space-y-3">
              {s.units.map((u) => (
                <li key={u.id}>
                  <p className={cx("text-sm font-medium", unitDone(state, u.id) && "text-olive-ink")}>
                    {unitDone(state, u.id) ? <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> : <Circle className="mr-1 inline h-3.5 w-3.5 text-muted" />}
                    Unit {u.n} · {u.title}
                  </p>
                  <p className="mt-0.5 pl-5 text-xs leading-relaxed text-muted">{u.topics.slice(0, 4).join(" · ")}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <CheckList sid={s.id} kind="rev" title="Revision checklist" items={revisionItems(s)} />
          </div>
          <CheckList sid={s.id} kind="dia" title="Diagrams to practise" items={s.units.flatMap((u) => u.diagrams.map((d) => `U${u.n} · ${d}`))} />
          <CheckList sid={s.id} kind="q" title="10-mark answer preparation" items={s.units.flatMap((u) => u.questions.map((q) => `U${u.n} · ${q}`))} />
        </div>
      )}
    </Card>
  );
}

function ExamDayView({ s }: { s: Subject }) {
  const { state, now } = useStore();
  const start = examStart(s);
  const end = examEnd(s);
  const live = now >= start && now < end;
  const today = istParts(now).dateKey;
  // Only this subject's remaining plan blocks up to its exam — other subjects' future tasks are hidden.
  const blocks = allBlocks(state).filter((b) => b.subject === s.id && b.date >= today && b.date <= s.exam.date && statusOf(state, b.id) !== "done");
  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden p-6 sm:p-10" style={{ background: `linear-gradient(135deg, var(--card), color-mix(in oklab, ${s.color} 14%, var(--card)))` }}>
        <Eyebrow>{live ? "Examination in progress" : s.exam.date === today ? "Exam day" : "Next examination"}</Eyebrow>
        <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{s.name}</h2>
        <p className="mt-2 text-muted">
          {fmtLong(s.exam.date)} · {s.exam.label}
        </p>
        <div className="mt-6">{live ? <p className="font-serif text-2xl italic text-olive-ink">Read every question twice. Diagrams first, then words. You are ready.</p> : <Countdown to={start} />}</div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Eyebrow>Last-minute recall</Eyebrow>
          <ul className="mt-4 space-y-3">
            {s.units.map((u) => (
              <li key={u.id} className="text-sm">
                <p className="font-medium">
                  Unit {u.n} · {u.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">{u.diagrams.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Eyebrow>Remaining {s.short} blocks before the exam</Eyebrow>
          <div className="mt-4 space-y-2">
            {blocks.length === 0 ? <p className="text-sm text-muted">Nothing pending for this subject. Rest your mind, glance at diagrams.</p> : blocks.map((b) => <BlockRow key={b.id} block={b} showDate={fmtDate(b.date).replace(", 2026", "")} />)}
          </div>
        </Card>
      </div>
      <SubjectPrep s={s} defaultOpen />
    </div>
  );
}

export default function ExamsPage() {
  const { state, now, setExamDayView } = useStore();
  const today = istParts(now).dateKey;
  const next = nextExam(state, now);
  const isExamDay = !!next && next.exam.date === today;
  const [view, setView] = useState<"all" | "focus">(isExamDay && state.examDayView ? "focus" : "all");

  return (
    <div>
      <PageHeader
        eyebrow="Six papers · 11 – 23 November"
        title="Exam Mode"
        subtitle="Timeline, countdowns and a revision kit for every paper. Exams finish automatically once their time has passed — or mark them yourself."
        actions={
          <>
            <Link href="/print/exams" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-bg-soft">
              <Printer className="h-4 w-4" /> Print timetable
            </Link>
          </>
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="inline-flex rounded-full bg-card p-1 text-sm shadow-sm ring-1 ring-line">
          <button onClick={() => setView("all")} className={cx("rounded-full px-4 py-1.5", view === "all" ? "bg-sage-soft font-medium text-olive-ink" : "text-muted")}>
            All subjects
          </button>
          <button onClick={() => setView("focus")} disabled={!next} className={cx("inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 disabled:opacity-40", view === "focus" ? "bg-sage-soft font-medium text-olive-ink" : "text-muted")}>
            <Target className="h-4 w-4" /> Exam-day view
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          <Checkbox size="sm" checked={state.examDayView} onChange={setExamDayView} label="Open exam-day view automatically on exam days" />
          Open exam-day view automatically on exam days
        </label>
      </div>

      {view === "focus" && next ? (
        <ExamDayView s={next} />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <Card>
              <Eyebrow>Examination timeline</Eyebrow>
              <ol className="relative mt-6 space-y-6 pl-8 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-line">
                {EXAMS.map((s) => {
                  const done = examCompleted(state, s, now);
                  const isNext = next?.id === s.id;
                  return (
                    <li key={s.id} className="relative">
                      <span
                        className={cx(
                          "absolute -left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-card",
                          done ? "border-olive bg-olive text-white dark:text-[#1b1d1a]" : isNext ? "border-rose" : "border-line",
                        )}
                      >
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : isNext ? <span className="pulse-dot h-2 w-2 rounded-full bg-rose" /> : null}
                      </span>
                      <div className={cx("rounded-2xl p-4 transition-colors", isNext ? "bg-rose-soft/60 ring-1 ring-rose" : "bg-bg-soft")}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="num text-xs font-medium text-muted">
                            {weekdayOf(s.exam.date)}, {fmtDate(s.exam.date)}
                          </p>
                          <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", done ? "bg-sage-soft text-olive-ink" : isNext ? "bg-rose text-[#30342f]" : "bg-card text-muted")}>
                            {done ? "Completed" : isNext ? "Next" : "Upcoming"}
                          </span>
                        </div>
                        <p className={cx("mt-1 font-serif text-lg", done && "text-muted line-through decoration-sage")}>{s.name}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                          <Clock3 className="h-3 w-3" /> {s.exam.label}
                        </p>
                        {isNext && (
                          <div className="mt-3">
                            <Countdown to={examStart(s)} />
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
            <Card>
              <MonthCalendar
                year={2026}
                month={11}
                today={today}
                cell={(d) => {
                  const ex = EXAMS.find((s) => s.exam.date === d);
                  if (!ex) return null;
                  const done = examCompleted(state, ex, now);
                  return (
                    <div className="rounded-md px-1 py-0.5 text-[10px] font-semibold leading-tight" style={{ background: `color-mix(in oklab, ${ex.color} 22%, transparent)` }}>
                      <span className={cx(done && "line-through")}>{ex.short}</span>
                      <span className="hidden font-normal text-muted sm:block">{ex.exam.label}</span>
                    </div>
                  );
                }}
              />
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-bg-soft p-4 text-sm text-muted">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
                Exam hours are never counted as study. On exam days the study target is the blocks scheduled after the paper.
              </div>
            </Card>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl">Preparation kit</h2>
              <span className="text-xs text-muted">Tap a subject to open its kit</span>
            </div>
            <div className="space-y-4">
              {EXAMS.map((s) => (
                <SubjectPrep key={s.id} s={s} defaultOpen={s.id === next?.id} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
