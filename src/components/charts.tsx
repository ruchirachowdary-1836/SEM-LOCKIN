"use client";

import { useState } from "react";
import { cx } from "./ui";

export interface BarDatum {
  key: string;
  label: string;
  sub?: string;
  values: number[]; // one per series, minutes
  target?: number;
  highlight?: boolean;
}

/** Grouped vertical bars (hours) with a per-day target tick and a hover tooltip. */
export function GroupedBars({ data, series, height = 220 }: { data: BarDatum[]; series: { name: string; color: string }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const maxMin = Math.max(60, ...data.flatMap((d) => [...d.values, d.target ?? 0]));
  const maxH = Math.ceil(maxMin / 60 / 2) * 2;
  const ticks = Array.from({ length: maxH / 2 + 1 }, (_, i) => i * 2);
  const W = 100 / data.length;
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} /> {s.name}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded bg-rose-ink" /> Day’s target
        </span>
      </div>
      <div className="relative flex" style={{ height }}>
        <div className="num relative w-8 shrink-0 text-[10px] text-muted">
          {ticks.map((t) => (
            <span key={t} className="absolute right-2 -translate-y-1/2" style={{ bottom: `${(t / maxH) * 100}%`, transform: "translateY(50%)" }}>
              {t}h
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-line/70" style={{ bottom: `${(t / maxH) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <div
                key={d.key}
                className={cx("relative flex h-full items-end justify-center gap-[2px] px-[3px] sm:px-1.5", hover === i && "bg-bg-soft/80 rounded-md", d.highlight && "bg-rose-soft/30 rounded-md")}
                style={{ width: `${W}%` }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${d.label}: ${series.map((s, j) => `${s.name} ${(d.values[j] / 60).toFixed(1)} hours`).join(", ")}`}
              >
                {d.values.map((v, j) => (
                  <div
                    key={j}
                    className="w-full max-w-4 rounded-t-[4px]"
                    style={{ height: `${(v / 60 / maxH) * 100}%`, background: series[j].color, minHeight: v > 0 ? 2 : 0, transition: "height .6s cubic-bezier(.2,.8,.2,1)" }}
                  />
                ))}
                {d.target ? <div className="pointer-events-none absolute inset-x-1 h-0.5 rounded bg-rose-ink/80" style={{ bottom: `${(d.target / 60 / maxH) * 100}%` }} /> : null}
                {hover === i && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 w-44 rounded-xl border border-line bg-card p-3 text-left text-xs shadow-lg">
                    <p className="font-medium">{d.label}</p>
                    {d.sub && <p className="text-muted">{d.sub}</p>}
                    {series.map((s, j) => (
                      <p key={s.name} className="num mt-1 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-muted">
                          <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                          {s.name}
                        </span>
                        {(d.values[j] / 60).toFixed(1)}h
                      </p>
                    ))}
                    {d.target !== undefined && <p className="num mt-1 text-muted">Target {(d.target / 60).toFixed(1)}h</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-8 flex">
        {data.map((d) => (
          <div key={d.key} className="num truncate pt-2 text-center text-[10px] text-muted" style={{ width: `${W}%` }}>
            {d.label.split(" ")[0]}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Donut({ parts, size = 150, stroke = 16, children }: { parts: { value: number; color: string; label: string }[]; size?: number; stroke?: number; children?: React.ReactNode }) {
  const total = parts.reduce((t, p) => t + p.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = parts.filter((p) => p.value > 0).length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(", ")}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sage-soft)" strokeWidth={stroke} />
        {parts.map((p) => {
          const len = (p.value / total) * c;
          const el = (
            <circle
              key={p.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth={stroke}
              strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
              strokeDashoffset={-offset}
              style={{ transition: "stroke-dasharray .6s ease" }}
            />
          );
          offset += len;
          return p.value > 0 ? el : null;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
