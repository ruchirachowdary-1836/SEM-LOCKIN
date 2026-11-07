"use client";

import { useEffect, useMemo, useState } from "react";
import { BookHeart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { focusMinutesOn, completedBlockMinutesOn, blocksOn, statusOf } from "@/lib/state";
import { addDays, fmtLong, fmtHours, istParts, fmtDate } from "@/lib/time";
import { Button, Card, Eyebrow, Field, IconButton, PageHeader, Empty, cx } from "@/components/ui";

const MOODS = ["Focused", "Calm", "Motivated", "Tired", "Anxious", "Scattered"];

export default function JournalPage() {
  const { state, now, saveJournal } = useStore();
  const today = istParts(now).dateKey;
  const [date, setDate] = useState(today);
  const entry = state.journal[date];
  const blank = { mood: "", energy: 3, wins: "", improve: "", tomorrow: "", text: "" };
  const [draft, setDraft] = useState(entry ?? blank);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setDraft(state.journal[date] ?? blank);
    setSavedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const dirty = JSON.stringify({ ...blank, ...(entry ?? {}), updatedAt: undefined }) !== JSON.stringify({ ...blank, ...draft, updatedAt: undefined });
  const save = () => {
    const { mood, energy, wins, improve, tomorrow, text } = draft;
    saveJournal(date, { mood, energy, wins, improve, tomorrow, text });
    setSavedAt(Date.now());
  };

  const past = useMemo(() => Object.entries(state.journal).sort((a, b) => b[0].localeCompare(a[0])), [state.journal]);
  const blocks = blocksOn(state, date);
  const doneBlocks = blocks.filter((b) => statusOf(state, b.id) === "done").length;

  return (
    <div>
      <PageHeader eyebrow="Reflect · reset · return" title="Study Journal" subtitle="Two minutes at the end of each day: what went well, what to fix, and the one thing that matters tomorrow." />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-6 flex items-center justify-between gap-3">
            <IconButton label="Previous day" onClick={() => setDate(addDays(date, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            <div className="text-center">
              <h2 className="font-serif text-2xl">{fmtLong(date)}</h2>
              <p className="num text-xs text-muted">
                {fmtHours(focusMinutesOn(state, date))} timer focus · {doneBlocks}/{blocks.length} blocks · {fmtHours(completedBlockMinutesOn(state, date))} planned study done
              </p>
            </div>
            <IconButton label="Next day" onClick={() => setDate(addDays(date, 1))} disabled={date >= today} className="disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </IconButton>
          </div>

          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-xs font-medium text-muted">Mood</span>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setDraft({ ...draft, mood: draft.mood === m ? "" : m })}
                    className={cx("rounded-full border px-3.5 py-1.5 text-sm transition-colors", draft.mood === m ? "border-rose bg-rose-soft text-rose-ink" : "border-line text-muted hover:text-ink")}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-2 block text-xs font-medium text-muted">Energy · {draft.energy}/5</span>
              <input type="range" min={1} max={5} value={draft.energy} onChange={(e) => setDraft({ ...draft, energy: Number(e.target.value) })} className="w-full accent-[var(--olive)]" aria-label="Energy level" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="What went well">
                <textarea className="field min-h-24 text-sm" value={draft.wins} onChange={(e) => setDraft({ ...draft, wins: e.target.value })} />
              </Field>
              <Field label="What to improve">
                <textarea className="field min-h-24 text-sm" value={draft.improve} onChange={(e) => setDraft({ ...draft, improve: e.target.value })} />
              </Field>
              <Field label="Tomorrow’s one priority">
                <textarea className="field min-h-24 text-sm" value={draft.tomorrow} onChange={(e) => setDraft({ ...draft, tomorrow: e.target.value })} />
              </Field>
            </div>
            <Field label="Free writing">
              <textarea
                className="field min-h-48 font-serif text-base leading-relaxed"
                placeholder="Dear diary, today I finally understood back-propagation…"
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              />
            </Field>
            <div className="flex items-center justify-end gap-3">
              {savedAt && !dirty && (
                <span className="inline-flex items-center gap-1 text-xs text-olive-ink">
                  <Check className="h-3.5 w-3.5" /> Saved
                </span>
              )}
              <Button variant="primary" onClick={save} disabled={!dirty}>
                Save entry
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <Eyebrow>Past entries</Eyebrow>
          {past.length === 0 ? (
            <div className="mt-4">
              <Empty icon={<BookHeart className="h-6 w-6" />} title="Your first page" body="Saved entries appear here." />
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {past.map(([d, e]) => (
                <li key={d}>
                  <button onClick={() => setDate(d)} className={cx("w-full rounded-2xl p-3 text-left transition-colors", d === date ? "bg-sage-soft" : "hover:bg-bg-soft")}>
                    <p className="num text-sm font-medium">{fmtDate(d)}</p>
                    <p className="truncate text-xs text-muted">{[e.mood, e.tomorrow || e.wins || e.text].filter(Boolean).join(" · ") || "Empty entry"}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
