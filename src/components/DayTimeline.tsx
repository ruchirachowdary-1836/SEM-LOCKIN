"use client";

import { useState } from "react";
import { ChevronDown, Coffee, Moon, PenLine, Sun, Utensils, GraduationCap, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { scheduleFor, currentIndex, statusOf, type ScheduleItem } from "@/lib/state";
import type { PlanBlock } from "@/lib/plan";
import { fmtRange, istParts, spanMin, fmtHours } from "@/lib/time";
import { SUBJECT_MAP, unitById } from "@/lib/syllabus";
import { Checkbox, PriorityBadge, StatusSelect, SubjectTag, cx, IconButton } from "./ui";

const ICON = {
  routine: Sun,
  meal: Utensils,
  break: Coffee,
  sleep: Moon,
  exam: GraduationCap,
  study: Sparkles,
} as const;

export function BlockRow({
  block,
  current,
  past,
  onEdit,
  defaultOpen = false,
  showDate = false,
}: {
  block: PlanBlock;
  current?: boolean;
  past?: boolean;
  onEdit?: (b: PlanBlock) => void;
  defaultOpen?: boolean;
  showDate?: string | false;
}) {
  const { state, toggleTask, setTaskStatus } = useStore();
  const [open, setOpen] = useState(defaultOpen);
  const st = statusOf(state, block.id);
  const sub = block.subject ? SUBJECT_MAP[block.subject] : null;
  const done = st === "done";
  return (
    <div
      className={cx(
        "group rounded-2xl border transition-all duration-300",
        current ? "border-rose bg-rose-soft/50 shadow-[0_0_0_3px_color-mix(in_oklab,var(--rose)_25%,transparent)]" : "border-line bg-card",
        done && !current && "opacity-75",
      )}
    >
      <div className="flex flex-wrap items-start gap-3 p-4 sm:flex-nowrap">
        <Checkbox checked={done} onChange={() => toggleTask(block.id)} label={`Mark “${block.title}” complete`} className="mt-0.5" />
        <button className="min-w-0 flex-1 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="num text-xs font-medium text-muted">
              {showDate ? `${showDate} · ` : ""}
              {fmtRange(block.start, block.end)} · {fmtHours(spanMin(block.start, block.end))}
            </span>
            {current && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#30342f]">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#30342f]" /> Now
              </span>
            )}
            {past && !done && !current && <span className="text-[10px] uppercase tracking-wider text-rose-ink">Overdue</span>}
            {block.kind === "revision" && <span className="text-[10px] uppercase tracking-wider text-muted">Revision</span>}
          </div>
          <p className={cx("mt-1 font-medium leading-snug", done && "text-muted line-through decoration-sage")}>{block.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <SubjectTag id={block.subject} short />
            {block.units.length > 0 && sub && (
              <span className="text-xs text-muted">
                {block.units.length === sub.units.length ? "All units" : block.units.map((u) => `Unit ${unitById(u)?.n}`).join(", ")}
              </span>
            )}
          </div>
        </button>
        <div className="flex w-full shrink-0 items-center justify-between gap-2 pl-8 sm:w-auto sm:flex-col sm:items-end sm:justify-start sm:pl-0">
          <div className="flex items-center gap-1">
            <PriorityBadge p={block.priority} />
            {onEdit && (
              <IconButton label="Edit or reschedule block" className="h-7 w-7" onClick={() => onEdit(block)}>
                <PenLine className="h-3.5 w-3.5" />
              </IconButton>
            )}
          </div>
          <StatusSelect value={st} onChange={(v) => setTaskStatus(block.id, v)} />
        </div>
      </div>
      {open && (
        <div className="fade-in border-t border-line/70 px-4 pb-4 pl-12 pt-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Concepts to study</p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {block.concepts.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: sub?.color ?? "var(--olive)" }} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!open && (
        <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-1 border-t border-line/50 py-1 text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
          {block.concepts.length} concepts <ChevronDown className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function RoutineRow({ item, current }: { item: ScheduleItem; current: boolean }) {
  const Icon = ICON[item.type];
  const exam = item.type === "exam";
  return (
    <div
      className={cx(
        "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm",
        exam ? "border border-rose bg-rose-soft text-rose-ink" : current ? "bg-sage-soft" : "",
      )}
    >
      <Icon className={cx("h-4 w-4 shrink-0", exam ? "" : "text-muted")} />
      <span className="num w-40 shrink-0 text-xs text-muted">{fmtRange(item.start, item.end)}</span>
      <span className={cx("flex-1", exam ? "font-semibold" : "text-muted", current && !exam && "font-medium text-ink")}>{item.label}</span>
      {exam && <span className="text-[10px] uppercase tracking-wider">Not study time</span>}
      {current && !exam && <span className="text-[10px] uppercase tracking-wider text-olive-ink">Now</span>}
    </div>
  );
}

export function DayTimeline({ date, onEdit, hideRoutine = false }: { date: string; onEdit?: (b: PlanBlock) => void; hideRoutine?: boolean }) {
  const { state, now } = useStore();
  const p = istParts(now);
  const items = scheduleFor(state, date);
  const isToday = p.dateKey === date;
  const isPastDay = date < p.dateKey;
  const ci = isToday ? currentIndex(items, p.minutes) : -1;
  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        if (it.block) {
          const endMin = Number(it.end.slice(0, 2)) * 60 + Number(it.end.slice(3));
          const past = isPastDay || (isToday && p.minutes >= endMin);
          return <BlockRow key={it.key} block={it.block} current={i === ci} past={past} onEdit={onEdit} />;
        }
        if (hideRoutine && it.type !== "exam") return null;
        return <RoutineRow key={it.key} item={it} current={i === ci} />;
      })}
    </div>
  );
}
