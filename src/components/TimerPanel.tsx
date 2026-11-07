"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Maximize2, Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import Link from "next/link";
import { useStore, timerDurationMs, timerElapsedMs } from "@/lib/store";
import { TIMER_MODES, blocksOn, scheduleFor, currentIndex, focusMinutesOn, targetMinutes, type TimerMode } from "@/lib/state";
import { istParts, fmtHours, fmtRange } from "@/lib/time";
import { SUBJECT_MAP } from "@/lib/syllabus";
import { Button, Eyebrow, ProgressRing, cx } from "./ui";

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function NotificationToggle() {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  useEffect(() => {
    setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);
  if (perm === "unsupported") return <p className="text-xs text-muted">Notifications aren’t supported in this browser.</p>;
  if (perm === "granted")
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-olive-ink">
        <Bell className="h-3.5 w-3.5" /> Notifications on
      </p>
    );
  if (perm === "denied")
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-muted">
        <BellOff className="h-3.5 w-3.5" /> Notifications blocked in browser settings
      </p>
    );
  return (
    <button onClick={() => Notification.requestPermission().then(setPerm)} className="inline-flex items-center gap-1.5 text-xs font-medium text-olive-ink underline-offset-4 hover:underline">
      <Bell className="h-3.5 w-3.5" /> Enable session-end notifications
    </button>
  );
}

export function TimerPanel({ variant = "card" }: { variant?: "card" | "full" }) {
  const { state, now, timerStart, timerPause, timerReset, timerSetMode, timerSetTask, timerSkipPhase, timerLogPartial } = useStore();
  const t = state.timer;
  const today = istParts(now);
  const at = now.getTime();
  const dur = timerDurationMs(t);
  const elapsed = Math.min(timerElapsedMs(t, at), dur);
  const remaining = dur - elapsed;
  const pct = (elapsed / dur) * 100;

  const blocks = blocksOn(state, today.dateKey);
  const items = scheduleFor(state, today.dateKey);
  const ci = currentIndex(items, today.minutes);
  const currentBlock = ci >= 0 ? items[ci].block : undefined;
  const linkedId = t.taskId ?? currentBlock?.id ?? null;
  const linked = blocks.find((b) => b.id === linkedId);

  const focused = focusMinutesOn(state, today.dateKey) + (t.phase === "focus" ? Math.floor(elapsed / 60000) : 0);
  const target = Math.max(targetMinutes(state, today.dateKey), 1);
  const big = variant === "full";

  const start = () => {
    if (!t.taskId && currentBlock) timerSetTask(currentBlock.id);
    timerStart();
  };

  return (
    <div className={cx(big ? "flex flex-col items-center text-center" : "")}>
      <div className={cx("flex flex-wrap items-center gap-2", big ? "justify-center" : "justify-between")}>
        {!big && <Eyebrow>Study timer</Eyebrow>}
        <div className="inline-flex rounded-full bg-bg-soft p-1 text-xs">
          {(Object.keys(TIMER_MODES) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => timerSetMode(m)}
              disabled={t.running}
              className={cx("rounded-full px-3 py-1.5 transition-colors disabled:cursor-not-allowed", t.mode === m ? "bg-card font-medium shadow-sm" : "text-muted")}
            >
              {TIMER_MODES[m].label}
            </button>
          ))}
        </div>
      </div>

      <div className={cx("flex flex-col items-center gap-6", big ? "mt-10" : "mt-5")}>
        <ProgressRing value={pct} size={big ? 300 : 170} stroke={big ? 10 : 8} color={t.phase === "focus" ? "var(--olive)" : "var(--rose)"} label={`${mmss(remaining)} remaining`}>
          <span className={cx("text-[10px] uppercase tracking-[0.2em]", t.phase === "focus" ? "text-olive-ink" : "text-rose-ink")}>
            {t.phase === "focus" ? "Focus" : "Break"}
          </span>
          <span className={cx("num font-semibold tracking-tight", big ? "text-6xl" : "text-3xl")}>{mmss(remaining)}</span>
          <span className="num mt-0.5 text-[11px] text-muted">{mmss(elapsed)} elapsed</span>
        </ProgressRing>

        <div className={cx("w-full min-w-0", big && "max-w-md")}>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted">Linked task</span>
            <select className="field text-sm" value={linkedId ?? ""} onChange={(e) => timerSetTask(e.target.value || null)}>
              <option value="">No task — free study</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {fmtRange(b.start, b.end)} · {b.subject ? SUBJECT_MAP[b.subject].short : "Prep"} · {b.title}
                </option>
              ))}
            </select>
          </label>
          {linked && !t.taskId && <p className="mt-1 text-[11px] text-muted">Following the session scheduled right now.</p>}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {t.running ? (
              <Button variant="primary" onClick={timerPause}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button variant="primary" onClick={start}>
                <Play className="h-4 w-4" /> {elapsed > 0 ? "Resume" : "Start"}
              </Button>
            )}
            <Button variant="ghost" onClick={timerReset} aria-label="Reset timer">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            {t.phase === "focus" && elapsed >= 60000 && (
              <Button variant="soft" onClick={timerLogPartial} title="Stop now and save the minutes studied">
                <Square className="h-3.5 w-3.5" /> Finish & log
              </Button>
            )}
            <Button variant="ghost" onClick={timerSkipPhase} aria-label={t.phase === "focus" ? "Skip to break" : "Skip break"} title={t.phase === "focus" ? "Skip to break" : "Skip break"}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className={cx("mt-6 flex items-center gap-4 border-t border-line pt-5", big ? "w-full max-w-md justify-center" : "")}>
        <ProgressRing value={(focused / target) * 100} size={56} stroke={5} color="var(--rose-ink)" track="var(--rose-soft)" label="Today's focused time against target">
          <span className="num text-[11px] font-semibold">{Math.round((focused / target) * 100)}%</span>
        </ProgressRing>
        <div className="text-left">
          <p className="num text-sm font-medium">
            {fmtHours(focused)} focused today <span className="text-muted">/ {fmtHours(target)}</span>
          </p>
          <div className="mt-1 flex items-center gap-3">
            <NotificationToggle />
            {!big && (
              <Link href="/focus" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                <Maximize2 className="h-3 w-3" /> Focus mode
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
