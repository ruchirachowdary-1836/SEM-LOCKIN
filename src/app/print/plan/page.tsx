"use client";

import { useStore } from "@/lib/store";
import { blocksOn, statusOf, examOn, blockMinutes } from "@/lib/state";
import { PLAN_START, PLAN_END } from "@/lib/plan";
import { SUBJECT_MAP, unitById } from "@/lib/syllabus";
import { dateRange, fmtLong, fmtRange, fmtHours } from "@/lib/time";
import { PrintFrame } from "@/components/PrintFrame";

export default function PrintPlan() {
  const { state } = useStore();
  return (
    <PrintFrame title="Day-wise Study Plan · 7 – 23 November 2026" back="/plan">
      <div className="space-y-8">
        {dateRange(PLAN_START, PLAN_END).map((d) => {
          const blocks = blocksOn(state, d);
          const ex = examOn(d);
          const total = blocks.reduce((t, b) => t + blockMinutes(b), 0);
          return (
            <section key={d} className="break-avoid">
              <div className="mb-2 flex items-baseline justify-between border-b border-[#e7e5dc] pb-1">
                <h2 className="font-serif text-lg">{fmtLong(d)}</h2>
                <span className="text-xs text-[#898d83]">{fmtHours(total)} study</span>
              </div>
              {ex && (
                <p className="mb-2 rounded-md bg-[#f5ebe8] px-2 py-1 text-xs font-semibold text-[#9c6a60]">
                  {ex.name} examination · {ex.exam.label} (not counted as study)
                </p>
              )}
              <table className="w-full text-xs">
                <tbody>
                  {blocks.map((b) => (
                    <tr key={b.id} className="border-b border-[#f1efe7] align-top">
                      <td className="w-6 py-1.5">{statusOf(state, b.id) === "done" ? "☑" : "☐"}</td>
                      <td className="w-36 py-1.5 text-[#898d83]">{fmtRange(b.start, b.end)}</td>
                      <td className="py-1.5">
                        <p className="font-semibold">
                          {b.subject ? SUBJECT_MAP[b.subject].short + " · " : ""}
                          {b.title}
                          {b.units.length > 0 && <span className="font-normal text-[#898d83]"> ({b.units.map((u) => `U${unitById(u)?.n}`).join(", ")})</span>}
                        </p>
                        <p className="mt-0.5 text-[#5f645b]">{b.concepts.join(" · ")}</p>
                      </td>
                      <td className="w-14 py-1.5 text-right capitalize text-[#898d83]">{b.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </PrintFrame>
  );
}
