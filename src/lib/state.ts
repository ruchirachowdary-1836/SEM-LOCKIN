// Persistent state shape, defaults and pure selectors.

import { DEFAULT_PLAN, DEFAULT_TIMETABLE, SPECIAL_DAYS, type PlanBlock, type Priority, type TimetableRow, type RowType } from "./plan";
import { ALL_UNITS, EXAMS, SUBJECTS, type SubjectId, type Subject } from "./syllabus";
import { istInstant, spanMin, toMin, dateRange, type ISTParts } from "./time";

export type TaskStatus = "todo" | "doing" | "done";
export type UnitStage = "reading" | "notes" | "revision" | "test";
export const UNIT_STAGES: { key: UnitStage; label: string }[] = [
  { key: "reading", label: "First reading" },
  { key: "notes", label: "Notes prepared" },
  { key: "revision", label: "Revision completed" },
  { key: "test", label: "Test completed" },
];

export type TimerMode = "pomodoro" | "deep";
export const TIMER_MODES: Record<TimerMode, { label: string; focus: number; brk: number }> = {
  pomodoro: { label: "Study 50 / 10", focus: 50, brk: 10 },
  deep: { label: "Deep focus 90 / 15", focus: 90, brk: 15 },
};

export interface TimerState {
  mode: TimerMode;
  phase: "focus" | "break";
  running: boolean;
  startedAt: number | null;
  accumulatedMs: number;
  taskId: string | null;
}

export interface Session {
  id: string;
  date: string; // IST date the session ended
  endedAt: number;
  minutes: number;
  mode: TimerMode;
  taskId: string | null;
  subject: SubjectId | null;
}

export interface JournalEntry {
  mood: string;
  energy: number; // 1-5
  wins: string;
  improve: string;
  tomorrow: string;
  text: string;
  updatedAt: number;
}

export interface Todo {
  id: string;
  title: string;
  priority: Priority;
  due: string | null;
  subject: SubjectId | null;
  done: boolean;
  createdAt: number;
}

export interface AppState {
  version: 1;
  taskStatus: Record<string, TaskStatus>;
  taskEdits: Record<string, Partial<PlanBlock>>;
  customBlocks: PlanBlock[];
  hiddenBlocks: string[];
  units: Record<string, Partial<Record<UnitStage, boolean>>>;
  notes: Record<string, string>; // key: subject id or unit id
  examChecks: Record<string, boolean>;
  examDone: Partial<Record<SubjectId, boolean>>; // manual override
  timetable: TimetableRow[];
  targetHours: number;
  sleepHours: number;
  sessions: Session[];
  timer: TimerState;
  journal: Record<string, JournalEntry>;
  todos: Todo[];
  theme: "light" | "dark";
  examDayView: boolean;
}

export function defaultState(): AppState {
  return {
    version: 1,
    taskStatus: {},
    taskEdits: {},
    customBlocks: [],
    hiddenBlocks: [],
    units: {},
    notes: {},
    examChecks: {},
    examDone: {},
    timetable: DEFAULT_TIMETABLE.map((r) => ({ ...r })),
    targetHours: 12,
    sleepHours: 7.5,
    sessions: [],
    timer: { mode: "pomodoro", phase: "focus", running: false, startedAt: null, accumulatedMs: 0, taskId: null },
    journal: {},
    todos: [],
    theme: "light",
    examDayView: true,
  };
}

/** Merge a stored/imported object over defaults so older or partial data still loads. */
export function hydrate(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AppState>;
  return {
    ...base,
    ...r,
    timer: { ...base.timer, ...(r.timer ?? {}) },
    timetable: Array.isArray(r.timetable) && r.timetable.length ? r.timetable : base.timetable,
    version: 1,
  };
}

// ───────────────────────── Plan selectors

export function allBlocks(s: AppState): PlanBlock[] {
  const hidden = new Set(s.hiddenBlocks);
  return [...DEFAULT_PLAN, ...s.customBlocks]
    .filter((b) => !hidden.has(b.id))
    .map((b) => (s.taskEdits[b.id] ? { ...b, ...s.taskEdits[b.id] } : b))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}

export function blocksOn(s: AppState, date: string): PlanBlock[] {
  return allBlocks(s).filter((b) => b.date === date);
}

export function statusOf(s: AppState, id: string): TaskStatus {
  return s.taskStatus[id] ?? "todo";
}

export function blockMinutes(b: PlanBlock): number {
  return spanMin(b.start, b.end);
}

export function studyMinutesOfTimetable(rows: TimetableRow[]): number {
  return rows.filter((r) => r.type === "study").reduce((t, r) => t + spanMin(r.start, r.end), 0);
}
export function sleepMinutesOfTimetable(rows: TimetableRow[]): number {
  return rows.filter((r) => r.type === "sleep").reduce((t, r) => t + spanMin(r.start, r.end), 0);
}

export function examOn(date: string): Subject | undefined {
  return SUBJECTS.find((x) => x.exam.date === date);
}

export type DayKind = "prep" | "study" | "exam" | "off";
export function dayKind(date: string): DayKind {
  if (examOn(date)) return "exam";
  if (date === "2026-11-07") return "prep";
  if (date >= "2026-11-08" && date <= "2026-11-22") return "study";
  return "off";
}

/** Study target for a date in minutes: the daily target on normal days, the scheduled blocks otherwise. */
export function targetMinutes(s: AppState, date: string): number {
  const kind = dayKind(date);
  if (kind === "study") return Math.round(s.targetHours * 60);
  return blocksOn(s, date).reduce((t, b) => t + blockMinutes(b), 0);
}

export interface ScheduleItem {
  key: string;
  start: string;
  end: string;
  label: string;
  type: RowType;
  block?: PlanBlock;
  subject?: SubjectId;
}

/** Full timeline for a day: routine rows + study blocks + exam. Exams are never study. */
export function scheduleFor(s: AppState, date: string): ScheduleItem[] {
  const items: ScheduleItem[] = [];
  const kind = dayKind(date);
  const routine = SPECIAL_DAYS[date] ?? (kind === "study" ? s.timetable.filter((r) => r.type !== "study") : []);
  for (const r of routine) items.push({ key: r.id, start: r.start, end: r.end, label: r.label, type: r.type });
  const ex = examOn(date);
  if (ex) items.push({ key: `exam-${ex.id}`, start: ex.exam.start, end: ex.exam.end, label: `${ex.name} examination`, type: "exam", subject: ex.id });
  for (const b of blocksOn(s, date)) items.push({ key: b.id, start: b.start, end: b.end, label: b.title, type: "study", block: b, subject: b.subject ?? undefined });
  return items.sort((a, b) => {
    // Sleep (crosses midnight) always last.
    if (a.type === "sleep" && b.type !== "sleep") return 1;
    if (b.type === "sleep" && a.type !== "sleep") return -1;
    return toMin(a.start) - toMin(b.start);
  });
}

/** Index of the item happening at `minutes`, honouring the overnight sleep row. */
export function currentIndex(items: ScheduleItem[], minutes: number): number {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const s = toMin(it.start);
    const e = toMin(it.end);
    if (e > s ? minutes >= s && minutes < e : minutes >= s || minutes < e) return i;
  }
  return -1;
}

// ───────────────────────── Units

export function unitPct(s: AppState, unitId: string): number {
  const u = s.units[unitId] ?? {};
  return UNIT_STAGES.filter((st) => u[st.key]).length * 25;
}
export function unitDone(s: AppState, unitId: string): boolean {
  return unitPct(s, unitId) === 100;
}
export function syllabusPct(s: AppState): number {
  return Math.round(ALL_UNITS.reduce((t, u) => t + unitPct(s, u.id), 0) / ALL_UNITS.length);
}
export function unitsCompleted(s: AppState): number {
  return ALL_UNITS.filter((u) => unitDone(s, u.id)).length;
}
export function subjectPct(s: AppState, id: SubjectId): number {
  const units = ALL_UNITS.filter((u) => u.subject === id);
  return Math.round(units.reduce((t, u) => t + unitPct(s, u.id), 0) / units.length);
}

export function planPct(s: AppState): number {
  const blocks = allBlocks(s);
  if (!blocks.length) return 0;
  const done = blocks.filter((b) => statusOf(s, b.id) === "done").reduce((t, b) => t + blockMinutes(b), 0);
  const total = blocks.reduce((t, b) => t + blockMinutes(b), 0);
  return Math.round((done / total) * 100);
}

/** Overall preparation = mean of syllabus stage progress and planned study completed (by time). */
export function overallPct(s: AppState): number {
  return Math.round((syllabusPct(s) + planPct(s)) / 2);
}

// ───────────────────────── Exams

export function examEnd(sub: Subject): Date {
  return istInstant(sub.exam.date, sub.exam.end);
}
export function examStart(sub: Subject): Date {
  return istInstant(sub.exam.date, sub.exam.start);
}
export function examCompleted(s: AppState, sub: Subject, at: Date): boolean {
  if (s.examDone[sub.id] !== undefined) return !!s.examDone[sub.id];
  return at.getTime() >= examEnd(sub).getTime();
}
export function nextExam(s: AppState, at: Date): Subject | undefined {
  return EXAMS.find((x) => !examCompleted(s, x, at));
}

// ───────────────────────── Time tracking

export function focusMinutesOn(s: AppState, date: string): number {
  return s.sessions.filter((x) => x.date === date).reduce((t, x) => t + x.minutes, 0);
}
export function completedBlockMinutesOn(s: AppState, date: string): number {
  return blocksOn(s, date)
    .filter((b) => statusOf(s, b.id) === "done")
    .reduce((t, b) => t + blockMinutes(b), 0);
}

/** A day counts as studied if a focus session was logged or a planned block was completed. */
export function studiedOn(s: AppState, date: string): boolean {
  return focusMinutesOn(s, date) > 0 || completedBlockMinutesOn(s, date) > 0;
}

export function streak(s: AppState, today: ISTParts["dateKey"]): number {
  const days = dateRange("2026-01-01", today).reverse();
  let n = 0;
  for (let i = 0; i < days.length; i++) {
    if (studiedOn(s, days[i])) n++;
    else if (i === 0) continue; // today not started yet doesn't break the streak
    else break;
  }
  return n;
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
