"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type AppState,
  type TaskStatus,
  type UnitStage,
  type Todo,
  type JournalEntry,
  type TimerMode,
  TIMER_MODES,
  defaultState,
  hydrate,
  allBlocks,
  blocksOn,
  statusOf,
  uid,
  UNIT_STAGES,
} from "./state";
import type { PlanBlock, TimetableRow } from "./plan";
import { DEFAULT_TIMETABLE } from "./plan";
import { unitById, SUBJECT_MAP, type SubjectId } from "./syllabus";
import { istParts, now as clockNow, fmtDate } from "./time";

const KEY = "sli:state:v1";
const SNAP_KEY = "sli:snapshots:v1";

export interface Snapshot {
  date: string;
  savedAt: number;
  label: string;
  data: AppState;
}

function pushSnapshot(data: AppState, label: string) {
  const snaps = readLS<Snapshot[]>(SNAP_KEY) ?? [];
  writeLS(SNAP_KEY, [{ date: istParts().dateKey, savedAt: Date.now(), label, data }, ...snaps].slice(0, 10));
}

function readLS<T>(key: string): T | null {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function writeLS(key: string, v: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage full or blocked */
  }
}

interface Ctx {
  state: AppState;
  ready: boolean;
  now: Date;
  celebration: string | null;
  dismissCelebration: () => void;
  celebrate: (msg: string) => void;
  // plan
  setTaskStatus: (id: string, st: TaskStatus) => void;
  toggleTask: (id: string) => void;
  saveBlock: (b: PlanBlock) => void;
  addBlock: (b: Omit<PlanBlock, "id" | "custom">) => void;
  deleteBlock: (id: string) => void;
  restoreBlocks: () => void;
  // units
  setStage: (unitId: string, stage: UnitStage, v: boolean) => void;
  setUnitComplete: (unitId: string, v: boolean) => void;
  setNote: (key: string, text: string) => void;
  // exams
  toggleExamCheck: (key: string) => void;
  setExamDone: (id: SubjectId, v: boolean | undefined) => void;
  setExamDayView: (v: boolean) => void;
  // timetable
  setTimetable: (rows: TimetableRow[]) => void;
  resetTimetable: () => void;
  setTargets: (target: number, sleep: number) => void;
  // timer
  timerStart: () => void;
  timerPause: () => void;
  timerReset: () => void;
  timerSetMode: (m: TimerMode) => void;
  timerSetTask: (id: string | null) => void;
  timerSkipPhase: () => void;
  timerLogPartial: () => void;
  deleteSession: (id: string) => void;
  // journal & todos
  saveJournal: (date: string, e: Omit<JournalEntry, "updatedAt">) => void;
  addTodo: (t: Omit<Todo, "id" | "done" | "createdAt">) => void;
  updateTodo: (id: string, patch: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
  // misc
  toggleTheme: () => void;
  exportJSON: () => string;
  importJSON: (text: string) => void;
  resetAll: () => void;
  snapshots: () => Snapshot[];
  restoreSnapshot: (savedAt: number) => void;
}

const StoreCtx = createContext<Ctx | null>(null);

function notify(title: string, body: string) {
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body, icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg` });
    }
  } catch {
    /* ignore */
  }
}

function chime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 1);
    });
  } catch {
    /* ignore */
  }
}

export function timerDurationMs(t: AppState["timer"]): number {
  const m = TIMER_MODES[t.mode];
  return (t.phase === "focus" ? m.focus : m.brk) * 60000;
}
export function timerElapsedMs(t: AppState["timer"], at: number): number {
  return t.accumulatedMs + (t.running && t.startedAt ? at - t.startedAt : 0);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [celebration, setCelebration] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load once.
  useEffect(() => {
    const stored = readLS<unknown>(KEY);
    const s = hydrate(stored);
    setState(s);
    setNow(clockNow());
    setReady(true);
  }, []);

  // Persist on every change + one rolling daily snapshot (last 7 days).
  useEffect(() => {
    if (!ready) return;
    writeLS(KEY, state);
    // Automatic backup: the first state seen each day is kept as that day's snapshot.
    const today = istParts().dateKey;
    const snaps = readLS<Snapshot[]>(SNAP_KEY) ?? [];
    if (!snaps.some((x) => x.date === today && x.label === "Daily automatic backup")) pushSnapshot(state, "Daily automatic backup");
  }, [state, ready]);

  // Theme class.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  // Sync between tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setState(hydrate(JSON.parse(e.newValue)));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const celebrate = useCallback((msg: string) => setCelebration(msg), []);

  // Clock tick + timer phase completion.
  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      const n = clockNow();
      setNow(n);
      const t = stateRef.current.timer;
      if (!t.running) return;
      const dur = timerDurationMs(t);
      if (timerElapsedMs(t, n.getTime()) < dur) return;
      setState((s) => {
        const tt = s.timer;
        if (!tt.running || timerElapsedMs(tt, n.getTime()) < timerDurationMs(tt)) return s;
        const m = TIMER_MODES[tt.mode];
        if (tt.phase === "focus") {
          const block = tt.taskId ? allBlocks(s).find((b) => b.id === tt.taskId) : undefined;
          const endAt = (tt.startedAt ?? n.getTime()) + (timerDurationMs(tt) - tt.accumulatedMs);
          const session = {
            id: uid("s"),
            date: istParts(new Date(endAt)).dateKey,
            endedAt: endAt,
            minutes: m.focus,
            mode: tt.mode,
            taskId: tt.taskId,
            subject: block?.subject ?? null,
          };
          setTimeout(() => {
            chime();
            notify("Focus session complete", `${m.focus} minutes logged. Take your ${m.brk}-minute break.`);
          }, 0);
          return { ...s, sessions: [...s.sessions, session], timer: { ...tt, phase: "break", running: false, startedAt: null, accumulatedMs: 0 } };
        }
        setTimeout(() => {
          chime();
          notify("Break over", "Back to your desk — next focus session is ready.");
        }, 0);
        return { ...s, timer: { ...tt, phase: "focus", running: false, startedAt: null, accumulatedMs: 0 } };
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [ready]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const api = useMemo<Omit<Ctx, "state" | "ready" | "now" | "celebration">>(() => {
    const checkDayComplete = (s: AppState, id: string) => {
      const block = allBlocks(s).find((b) => b.id === id);
      if (!block) return;
      const day = blocksOn(s, block.date);
      if (day.length && day.every((b) => statusOf(s, b.id) === "done")) {
        setCelebration(`Every study block for ${fmtDate(block.date)} is complete.`);
      }
    };
    return {
      dismissCelebration: () => setCelebration(null),
      celebrate,
      setTaskStatus: (id, st) =>
        update((s) => {
          const next = { ...s, taskStatus: { ...s.taskStatus, [id]: st } };
          if (st === "done" && statusOf(s, id) !== "done") checkDayComplete(next, id);
          return next;
        }),
      toggleTask: (id) =>
        update((s) => {
          const st: TaskStatus = statusOf(s, id) === "done" ? "todo" : "done";
          const next = { ...s, taskStatus: { ...s.taskStatus, [id]: st } };
          if (st === "done") checkDayComplete(next, id);
          return next;
        }),
      saveBlock: (b) =>
        update((s) => {
          if (b.custom) return { ...s, customBlocks: s.customBlocks.map((x) => (x.id === b.id ? b : x)) };
          const { id, ...rest } = b;
          return { ...s, taskEdits: { ...s.taskEdits, [id]: rest } };
        }),
      addBlock: (b) => update((s) => ({ ...s, customBlocks: [...s.customBlocks, { ...b, id: uid("c"), custom: true }] })),
      deleteBlock: (id) =>
        update((s) =>
          s.customBlocks.some((x) => x.id === id)
            ? { ...s, customBlocks: s.customBlocks.filter((x) => x.id !== id) }
            : { ...s, hiddenBlocks: [...s.hiddenBlocks, id] },
        ),
      restoreBlocks: () => update((s) => ({ ...s, hiddenBlocks: [], taskEdits: {} })),
      setStage: (unitId, stage, v) =>
        update((s) => {
          const cur = { ...(s.units[unitId] ?? {}), [stage]: v };
          const wasDone = UNIT_STAGES.every((x) => s.units[unitId]?.[x.key]);
          const isDone = UNIT_STAGES.every((x) => cur[x.key]);
          if (isDone && !wasDone) {
            const u = unitById(unitId);
            if (u) setCelebration(`${SUBJECT_MAP[u.subject].name} · Unit ${u.n} complete.`);
          }
          return { ...s, units: { ...s.units, [unitId]: cur } };
        }),
      setUnitComplete: (unitId, v) =>
        update((s) => {
          const wasDone = UNIT_STAGES.every((x) => s.units[unitId]?.[x.key]);
          if (v && !wasDone) {
            const u = unitById(unitId);
            if (u) setCelebration(`${SUBJECT_MAP[u.subject].name} · Unit ${u.n} complete.`);
          }
          return { ...s, units: { ...s.units, [unitId]: { reading: v, notes: v, revision: v, test: v } } };
        }),
      setNote: (key, text) => update((s) => ({ ...s, notes: { ...s.notes, [key]: text } })),
      toggleExamCheck: (key) => update((s) => ({ ...s, examChecks: { ...s.examChecks, [key]: !s.examChecks[key] } })),
      setExamDone: (id, v) =>
        update((s) => {
          if (v) setCelebration(`${SUBJECT_MAP[id].name} examination done. On to the next one.`);
          const examDone = { ...s.examDone };
          if (v === undefined) delete examDone[id];
          else examDone[id] = v;
          return { ...s, examDone };
        }),
      setExamDayView: (v) => update((s) => ({ ...s, examDayView: v })),
      setTimetable: (rows) => update((s) => ({ ...s, timetable: rows })),
      resetTimetable: () => update((s) => ({ ...s, timetable: DEFAULT_TIMETABLE.map((r) => ({ ...r })), targetHours: 12, sleepHours: 7.5 })),
      setTargets: (target, sleep) => update((s) => ({ ...s, targetHours: target, sleepHours: sleep })),
      timerStart: () =>
        update((s) => (s.timer.running ? s : { ...s, timer: { ...s.timer, running: true, startedAt: clockNow().getTime() } })),
      timerPause: () =>
        update((s) =>
          s.timer.running
            ? { ...s, timer: { ...s.timer, running: false, startedAt: null, accumulatedMs: timerElapsedMs(s.timer, clockNow().getTime()) } }
            : s,
        ),
      timerReset: () => update((s) => ({ ...s, timer: { ...s.timer, running: false, startedAt: null, accumulatedMs: 0 } })),
      timerSetMode: (m) => update((s) => ({ ...s, timer: { ...s.timer, mode: m, phase: "focus", running: false, startedAt: null, accumulatedMs: 0 } })),
      timerSetTask: (id) => update((s) => ({ ...s, timer: { ...s.timer, taskId: id } })),
      timerSkipPhase: () =>
        update((s) => ({
          ...s,
          timer: { ...s.timer, phase: s.timer.phase === "focus" ? "break" : "focus", running: false, startedAt: null, accumulatedMs: 0 },
        })),
      timerLogPartial: () =>
        update((s) => {
          const t = s.timer;
          if (t.phase !== "focus") return s;
          const at = clockNow().getTime();
          const minutes = Math.floor(timerElapsedMs(t, at) / 60000);
          const reset = { ...t, running: false, startedAt: null, accumulatedMs: 0 };
          if (minutes < 1) return { ...s, timer: reset };
          const block = t.taskId ? allBlocks(s).find((b) => b.id === t.taskId) : undefined;
          return {
            ...s,
            sessions: [...s.sessions, { id: uid("s"), date: istParts(new Date(at)).dateKey, endedAt: at, minutes, mode: t.mode, taskId: t.taskId, subject: block?.subject ?? null }],
            timer: reset,
          };
        }),
      deleteSession: (id) => update((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) })),
      saveJournal: (date, e) => update((s) => ({ ...s, journal: { ...s.journal, [date]: { ...e, updatedAt: Date.now() } } })),
      addTodo: (t) => update((s) => ({ ...s, todos: [...s.todos, { ...t, id: uid("t"), done: false, createdAt: Date.now() }] })),
      updateTodo: (id, patch) => update((s) => ({ ...s, todos: s.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTodo: (id) => update((s) => ({ ...s, todos: s.todos.filter((t) => t.id !== id) })),
      toggleTheme: () => update((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
      exportJSON: () => JSON.stringify({ app: "semester-lock-in", exportedAt: new Date().toISOString(), state: stateRef.current }, null, 2),
      importJSON: (text) => {
        const parsed = JSON.parse(text) as { app?: string; state?: unknown };
        if (!parsed || parsed.app !== "semester-lock-in" || !parsed.state) throw new Error("This file is not a Semester Lock-In backup.");
        pushSnapshot(stateRef.current, "Before import");
        setState(hydrate(parsed.state));
      },
      resetAll: () => {
        pushSnapshot(stateRef.current, "Before reset");
        update((s) => ({ ...defaultState(), theme: s.theme }));
      },
      snapshots: () => readLS<Snapshot[]>(SNAP_KEY) ?? [],
      restoreSnapshot: (savedAt) => {
        const snap = (readLS<Snapshot[]>(SNAP_KEY) ?? []).find((x) => x.savedAt === savedAt);
        if (snap) {
          pushSnapshot(stateRef.current, "Before restore");
          setState(hydrate(snap.data));
        }
      },
    };
  }, [update, celebrate]);

  const value = useMemo<Ctx>(() => ({ state, ready, now, celebration, ...api }), [state, ready, now, celebration, api]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
