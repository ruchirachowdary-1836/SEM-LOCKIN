# Semester Lock-In

A personal semester exam-preparation planner (Next.js 15 · TypeScript · Tailwind CSS v4 · Lucide).
All progress is stored in the browser (localStorage) — no backend, no accounts, no paid APIs.

## Run

```bash
npm install
npm run dev      # http://localhost:3400
npm run build && npm start   # production
```

## Pages

| Route | What it does |
|---|---|
| `/` | Dashboard — hero stats, overall readiness ring, today's focus (live current/next block), timer, exam countdown, priority tasks |
| `/plan` | Day-by-day plan 7–23 Nov with concepts, checkboxes, status, priority, edit/reschedule/add/remove; calendar view; editable daily timetable |
| `/syllabus` | 6 subjects × 5 units with four stages each (reading, notes, revision, test), progress and per-unit/subject notes |
| `/exams` | Exam timeline + calendar, live countdown, per-subject prep kit (topics, revision checklist, diagrams, 10-mark answers), exam-day view |
| `/progress` | Daily hours chart, 14-day consistency, units donut, subject-wise progress, streak, target achievement, session log |
| `/focus` | Full-screen focus timer (50/10 and 90/15) linked to the current block |
| `/journal` | Daily study journal |
| `/tasks` | Priority task manager (also `N` anywhere for quick add) |
| `/settings` | Theme, notifications, JSON export/import, automatic daily snapshots, reset with confirmation |
| `/print/plan`, `/print/exams` | Print / Save-as-PDF views |

## Notes

- All times are Asia/Kolkata regardless of the device time zone.
- Exam hours are never counted as study. On exam days the target is the blocks scheduled after the paper.
- The default timetable's study sessions add up to 12 h 15 m (2.5 + 2.25 + 3 + 2.5 + 2); the daily target is kept at 12 h and both numbers are shown.
- Data lives in `localStorage` key `sli:state:v1`; snapshots in `sli:snapshots:v1`.
