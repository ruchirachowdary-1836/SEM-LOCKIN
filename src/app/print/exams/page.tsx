"use client";

import { EXAMS } from "@/lib/syllabus";
import { fmtDate, weekdayOf } from "@/lib/time";
import { PrintFrame } from "@/components/PrintFrame";

export default function PrintExams() {
  return (
    <PrintFrame title="Semester Examination Timetable · November 2026" back="/exams">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#30342f] text-left text-[11px] uppercase tracking-[0.14em]">
            <th className="py-2">#</th>
            <th className="py-2">Date</th>
            <th className="py-2">Day</th>
            <th className="py-2">Subject</th>
            <th className="py-2">Timing</th>
            <th className="py-2 text-right">Done</th>
          </tr>
        </thead>
        <tbody>
          {EXAMS.map((s, i) => (
            <tr key={s.id} className="border-b border-[#e7e5dc]">
              <td className="py-3 text-[#898d83]">{i + 1}</td>
              <td className="py-3 font-semibold">{fmtDate(s.exam.date)}</td>
              <td className="py-3">{weekdayOf(s.exam.date)}</td>
              <td className="py-3 font-serif text-base">{s.name}</td>
              <td className="py-3">{s.exam.label}</td>
              <td className="py-3 text-right text-lg">☐</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-10 grid grid-cols-2 gap-6 text-xs text-[#5f645b]">
        <div>
          <p className="mb-1 font-semibold uppercase tracking-[0.14em] text-[#30342f]">Exam-day routine</p>
          <p>6:30 wake · 7:00 breakfast · 8:00 get ready and travel · 9:30 settle in at the hall</p>
        </div>
        <div>
          <p className="mb-1 font-semibold uppercase tracking-[0.14em] text-[#30342f]">Carry</p>
          <p>Hall ticket · college ID · two pens · pencil, scale and eraser for diagrams · water</p>
        </div>
      </div>
    </PrintFrame>
  );
}
