"use client";

import { Flame, Hourglass, Target, Timer, Trash2, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  focusMinutesOn,
  completedBlockMinutesOn,
  targetMinutes,
  streak,
  nextExam,
  subjectPct,
  unitDone,
  unitsCompleted,
  allBlocks,
  statusOf,
  blockMinutes,
  examStart,
  studiedOn,
  TIMER_MODES,
} from "@/lib/state";
import { SUBJECTS, SUBJECT_MAP } from "@/lib/syllabus";
import { PLAN_START, PLAN_END } from "@/lib/plan";
import { addDays, dateRange, fmtDayMonth, fmtHours, istParts, weekdayShort, fmtDate, countdownParts } from "@/lib/time";
import { Card, Eyebrow, IconButton, PageHeader, ProgressBar, Empty, cx } from "@/components/ui";
import { GroupedBars, Donut } from "@/components/charts";

function Kpi({ icon: Icon, label, value, hint }: { icon: typeof Flame; label: string; value: React.ReactNode; hint: string }) {
  return (
    <Card className="lift">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4" />
        <Eyebrow>{label}</Eyebrow>
      </div>
      <p className="num mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Card>
  );
}

export default function ProgressPage() {
  const { state, now, deleteSession } = useStore();
  const today = istParts(now).dateKey;
  const planDays = dateRange(PLAN_START, PLAN_END);

  const totalFocus = state.sessions.reduce((t, s) => t + s.minutes, 0);
  const totalBlocks = allBlocks(state);
  const doneBlockMin = totalBlocks.filter((b) => statusOf(state, b.id) === "done").reduce((t, b) => t + blockMinutes(b), 0);
  const plannedMin = totalBlocks.reduce((t, b) => t + blockMinutes(b), 0);

  // Target achievement over plan days that have fully passed or are today.
  const elapsedDays = planDays.filter((d) => d <= today);
  const met = elapsedDays.filter((d) => {
    const tgt = targetMinutes(state, d);
    return tgt > 0 && Math.max(completedBlockMinutesOn(state, d), focusMinutesOn(state, d)) >= tgt;
  });
  const st = streak(state, today);
  const next = nextExam(state, now);
  const cd = next ? countdownParts(examStart(next).getTime() - now.getTime()) : null;

  const chartData = planDays.map((d) => ({
    key: d,
    label: `${fmtDayMonth(d)}`,
    sub: weekdayShort(d),
    values: [completedBlockMinutesOn(state, d), focusMinutesOn(state, d)],
    target: targetMinutes(state, d),
    highlight: d === today,
  }));

  const last14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const consistency = last14.filter((d) => studiedOn(state, d)).length;

  const unitsDoneN = unitsCompleted(state);
  const recent = [...state.sessions].sort((a, b) => b.endedAt - a.endedAt).slice(0, 12);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Measured, not imagined" title="Progress" subtitle="Everything here comes from blocks you ticked and focus sessions you logged with the timer. Nothing is prefilled." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Timer} label="Total focused" value={fmtHours(totalFocus)} hint={`${state.sessions.length} timer ${state.sessions.length === 1 ? "session" : "sessions"} logged`} />
        <Kpi icon={Flame} label="Study streak" value={`${st} ${st === 1 ? "day" : "days"}`} hint="Consecutive days with study logged" />
        <Kpi icon={Target} label="Target achievement" value={elapsedDays.length ? `${met.length}/${elapsedDays.length}` : "—"} hint="Plan days where the day’s target was met" />
        <Kpi icon={Hourglass} label="Next exam" value={next && cd ? `${cd.d}d ${cd.h}h` : "Done"} hint={next ? `${next.name} · ${fmtDate(next.exam.date)}` : "All six papers written"} />
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Daily study hours</Eyebrow>
            <h2 className="mt-1 font-serif text-2xl">7 – 23 November</h2>
          </div>
          <p className="num text-sm text-muted">
            {fmtHours(doneBlockMin)} of {fmtHours(plannedMin)} planned study completed
          </p>
        </div>
        <GroupedBars
          data={chartData}
          series={[
            { name: "Planned blocks completed", color: "var(--olive)" },
            { name: "Timer focus", color: "var(--rose)" },
          ]}
        />
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <Eyebrow>Weekly consistency</Eyebrow>
          <h2 className="mt-1 font-serif text-2xl">
            {consistency} of the last 14 days
          </h2>
          <div className="mt-5 grid max-w-md grid-cols-7 gap-2">
            {last14.map((d) => {
              const m = Math.max(completedBlockMinutesOn(state, d), focusMinutesOn(state, d));
              const tgt = targetMinutes(state, d) || state.targetHours * 60;
              const lvl = m === 0 ? 0 : m < tgt * 0.34 ? 1 : m < tgt * 0.67 ? 2 : m < tgt ? 3 : 4;
              const bg = ["var(--bg-soft)", "color-mix(in oklab, var(--olive) 25%, var(--card))", "color-mix(in oklab, var(--olive) 50%, var(--card))", "color-mix(in oklab, var(--olive) 75%, var(--card))", "var(--olive)"][lvl];
              return (
                <div key={d} className="text-center" title={`${fmtDate(d)} — ${fmtHours(m)} studied`}>
                  <div className={cx("aspect-square rounded-lg ring-1 ring-line/60", d === today && "ring-2 ring-rose")} style={{ background: bg }} />
                  <p className="num mt-1 text-[10px] text-muted">{weekdayShort(d).slice(0, 2)} {Number(d.slice(8))}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-muted">
            Less
            {[0, 1, 2, 3, 4].map((l) => (
              <span
                key={l}
                className="h-3 w-3 rounded ring-1 ring-line/60"
                style={{ background: ["var(--bg-soft)", "color-mix(in oklab, var(--olive) 25%, var(--card))", "color-mix(in oklab, var(--olive) 50%, var(--card))", "color-mix(in oklab, var(--olive) 75%, var(--card))", "var(--olive)"][l] }}
              />
            ))}
            Target met
          </div>
        </Card>

        <Card>
          <Eyebrow>Units</Eyebrow>
          <h2 className="mt-1 font-serif text-2xl">Completed vs pending</h2>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
            <Donut
              parts={[
                { value: unitsDoneN, color: "var(--olive)", label: "Completed" },
                { value: 30 - unitsDoneN, color: "var(--rose)", label: "Pending" },
              ]}
            >
              <span className="num font-serif text-3xl">{unitsDoneN}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted">of 30</span>
            </Donut>
            <div className="w-full flex-1 space-y-2">
              <div className="flex gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-olive" /> Completed {unitsDoneN}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose" /> Pending {30 - unitsDoneN}
                </span>
              </div>
              {SUBJECTS.map((s) => {
                const n = s.units.filter((u) => unitDone(state, u.id)).length;
                return (
                  <div key={s.id} className="flex items-center gap-3 text-sm">
                    <span className="w-12 text-xs font-medium">{s.short}</span>
                    <div className="flex flex-1 gap-[2px]">
                      {s.units.map((u) => (
                        <span key={u.id} className={cx("h-3 flex-1 rounded-[3px]", unitDone(state, u.id) ? "bg-olive" : "bg-rose/50")} title={`Unit ${u.n}: ${unitDone(state, u.id) ? "complete" : "pending"}`} />
                      ))}
                    </div>
                    <span className="num w-8 text-right text-xs text-muted">{n}/5</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Eyebrow>Subject-wise preparation</Eyebrow>
        <h2 className="mt-1 font-serif text-2xl">Syllabus stages and plan completion</h2>
        <div className="mt-6 space-y-5">
          {SUBJECTS.map((s) => {
            const blocks = totalBlocks.filter((b) => b.subject === s.id);
            const tot = blocks.reduce((t, b) => t + blockMinutes(b), 0);
            const dn = blocks.filter((b) => statusOf(state, b.id) === "done").reduce((t, b) => t + blockMinutes(b), 0);
            const planP = tot ? Math.round((dn / tot) * 100) : 0;
            const sylP = subjectPct(state, s.id);
            const focus = state.sessions.filter((x) => x.subject === s.id).reduce((t, x) => t + x.minutes, 0);
            return (
              <div key={s.id} className="grid gap-2 sm:grid-cols-[220px_1fr] sm:items-center">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </p>
                  <p className="num pl-4 text-xs text-muted">{fmtHours(focus)} timer focus</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-[11px] text-muted">Syllabus</span>
                    <ProgressBar value={sylP} className="flex-1" />
                    <span className="num w-10 text-right text-xs font-semibold">{sylP}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-[11px] text-muted">Plan blocks</span>
                    <ProgressBar value={planP} color="var(--rose-ink)" className="flex-1" />
                    <span className="num w-10 text-right text-xs font-semibold">{planP}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <Eyebrow>Session log</Eyebrow>
        <h2 className="mt-1 font-serif text-2xl">Recent focus sessions</h2>
        {recent.length === 0 ? (
          <div className="mt-5">
            <Empty icon={<Timer className="h-6 w-6" />} title="No sessions yet" body="Start the study timer on the dashboard or in focus mode — completed sessions appear here." />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recent.map((s) => {
              const b = s.taskId ? totalBlocks.find((x) => x.id === s.taskId) : undefined;
              return (
                <li key={s.id} className="flex items-center gap-3 py-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-olive" />
                  <span className="num w-28 text-xs text-muted">
                    {fmtDayMonth(s.date)} · {new Date(s.endedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" })}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{b ? b.title : s.subject ? SUBJECT_MAP[s.subject].name : "Free study"}</span>
                  <span className="hidden text-xs text-muted sm:inline">{TIMER_MODES[s.mode].label}</span>
                  <span className="num font-medium">{fmtHours(s.minutes)}</span>
                  <IconButton label="Delete session" className="h-7 w-7" onClick={() => deleteSession(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
