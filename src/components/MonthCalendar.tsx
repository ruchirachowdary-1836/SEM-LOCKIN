"use client";

import type { ReactNode } from "react";
import { monthName } from "@/lib/time";
import { cx } from "./ui";

/** Monday-first month grid. `cell` renders the inside of each in-month day. */
export function MonthCalendar({
  year,
  month,
  today,
  selected,
  onSelect,
  cell,
}: {
  year: number;
  month: number; // 1-12
  today: string;
  selected?: string;
  onSelect?: (date: string) => void;
  cell: (date: string) => ReactNode;
}) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(lead).fill(null)];
  for (let d = 1; d <= days; d++) cells.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);

  return (
    <div>
      <p className="mb-4 font-serif text-xl">
        {monthName(month)} {year}
      </p>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="pb-1">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) =>
          date ? (
            <button
              key={date}
              onClick={() => onSelect?.(date)}
              className={cx(
                "flex min-h-16 flex-col rounded-xl border p-1.5 text-left transition-colors sm:min-h-24 sm:p-2",
                selected === date ? "border-olive bg-sage-soft" : "border-line bg-card hover:border-sage",
                today === date && "ring-2 ring-rose",
              )}
            >
              <span className={cx("num text-xs font-semibold", today === date && "text-rose-ink")}>{Number(date.slice(8))}</span>
              <div className="mt-1 min-w-0 flex-1">{cell(date)}</div>
            </button>
          ) : (
            <div key={`e${i}`} />
          ),
        )}
      </div>
    </div>
  );
}
