"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Maximize, Minimize } from "lucide-react";
import { useStore } from "@/lib/store";
import { allBlocks, scheduleFor, currentIndex } from "@/lib/state";
import { QUOTES } from "@/lib/plan";
import { SUBJECT_MAP } from "@/lib/syllabus";
import { istParts, dayDiff, fmtRange } from "@/lib/time";
import { TimerPanel } from "@/components/TimerPanel";
import { Button, Eyebrow } from "@/components/ui";

export default function FocusPage() {
  const { state, now } = useStore();
  const [fs, setFs] = useState(false);
  const p = istParts(now);

  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  const toggleFs = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.getElementById("focus-root")?.requestFullscreen();
    } catch {
      /* fullscreen not allowed */
    }
  };

  const items = scheduleFor(state, p.dateKey);
  const ci = currentIndex(items, p.minutes);
  const linked = state.timer.taskId ? allBlocks(state).find((b) => b.id === state.timer.taskId) : ci >= 0 ? items[ci].block : undefined;
  const quote = QUOTES[Math.abs(dayDiff("2026-01-01", p.dateKey)) % QUOTES.length];

  return (
    <div id="focus-root" className="dot-grid -mx-4 -mt-8 flex min-h-[calc(100vh-4rem)] flex-col bg-bg px-4 py-8 sm:-mx-6 sm:px-6">
      <div className="no-print mx-auto flex w-full max-w-3xl items-center justify-between">
        {!fs ? (
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        ) : (
          <span />
        )}
        <Button variant="ghost" onClick={toggleFs}>
          {fs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />} {fs ? "Exit full screen" : "Full screen"}
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-8 text-center">
        <Eyebrow>{state.timer.phase === "focus" ? "Deep work" : "Rest your eyes"}</Eyebrow>
        {linked ? (
          <div className="mt-3">
            <h1 className="font-serif text-3xl leading-tight sm:text-4xl">{linked.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {linked.subject ? SUBJECT_MAP[linked.subject].name : "Preparation"} · {fmtRange(linked.start, linked.end)}
            </p>
            <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-1.5">
              {linked.concepts.slice(0, 8).map((c) => (
                <span key={c} className="rounded-full bg-card px-2.5 py-1 text-xs text-muted ring-1 ring-line">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">One thing at a time.</h1>
        )}
        <div className="mt-8 w-full">
          <TimerPanel variant="full" />
        </div>
      </div>

      <figure className="mx-auto max-w-xl pb-4 text-center">
        <blockquote className="font-serif text-lg italic text-muted">“{quote.text}”</blockquote>
        <figcaption className="mt-1 text-xs text-muted">— {quote.by}</figcaption>
      </figure>
    </div>
  );
}
