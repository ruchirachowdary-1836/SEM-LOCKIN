"use client";

import { useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Priority } from "@/lib/plan";
import { SUBJECTS, type SubjectId } from "@/lib/syllabus";
import { fmtDate, istParts } from "@/lib/time";
import { Button, Card, Checkbox, Eyebrow, IconButton, PageHeader, PriorityBadge, SubjectTag, Empty, cx } from "@/components/ui";

const ORDER: Priority[] = ["high", "medium", "low"];

export default function TasksPage() {
  const { state, now, addTodo, updateTodo, removeTodo } = useStore();
  const today = istParts(now).dateKey;
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("high");
  const [due, setDue] = useState("");
  const [subject, setSubject] = useState<SubjectId | "">("");
  const [showDone, setShowDone] = useState(false);

  const open = state.todos.filter((t) => !t.done);
  const done = state.todos.filter((t) => t.done);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTodo({ title: title.trim(), priority, due: due || null, subject: (subject || null) as SubjectId | null });
    setTitle("");
  };

  return (
    <div>
      <PageHeader eyebrow="Priority first" title="Task Manager" subtitle="Small things outside the timetable — photocopies, doubts to ask, diagrams to redraw. High priority rises to the top." />

      <Card className="mb-8">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_140px_160px_140px_auto]">
          <input className="field" placeholder="Add a task and press Enter…" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Task title" />
          <select className="field" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority">
            <option value="high">High priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input type="date" className="field" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
          <select className="field" value={subject} onChange={(e) => setSubject(e.target.value as SubjectId | "")} aria-label="Subject">
            <option value="">General</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.short}
              </option>
            ))}
          </select>
          <Button type="submit" variant="primary" disabled={!title.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </form>
      </Card>

      {state.todos.length === 0 ? (
        <Empty icon={<ListChecks className="h-6 w-6" />} title="Nothing on the list" body="Add a task above, or press N anywhere for quick add." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {ORDER.map((p) => {
            const list = open.filter((t) => t.priority === p).sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));
            return (
              <Card key={p}>
                <div className="mb-4 flex items-center justify-between">
                  <PriorityBadge p={p} />
                  <span className="num text-xs text-muted">{list.length} open</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-sm text-muted">Clear.</p>
                ) : (
                  <ul className="space-y-2">
                    {list.map((t) => {
                      const overdue = t.due && t.due < today;
                      return (
                        <li key={t.id} className="group flex items-start gap-3 rounded-xl p-2 hover:bg-bg-soft">
                          <Checkbox checked={t.done} onChange={(v) => updateTodo(t.id, { done: v })} label={`Complete ${t.title}`} className="mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-snug">{t.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <SubjectTag id={t.subject} short />
                              {t.due && <span className={cx("num text-xs", overdue ? "text-rose-ink" : "text-muted")}>{overdue ? "Overdue · " : "Due "}{fmtDate(t.due)}</span>}
                            </div>
                          </div>
                          <select
                            aria-label="Change priority"
                            className="rounded-md bg-transparent text-xs text-muted opacity-0 outline-none group-hover:opacity-100 focus:opacity-100"
                            value={t.priority}
                            onChange={(e) => updateTodo(t.id, { priority: e.target.value as Priority })}
                          >
                            <option value="high">High</option>
                            <option value="medium">Med</option>
                            <option value="low">Low</option>
                          </select>
                          <IconButton label="Delete task" className="h-7 w-7" onClick={() => removeTodo(t.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconButton>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-8">
          <button onClick={() => setShowDone((s) => !s)} className="text-sm text-muted hover:text-ink">
            {showDone ? "Hide" : "Show"} {done.length} completed
          </button>
          {showDone && (
            <Card className="mt-3">
              <Eyebrow>Completed</Eyebrow>
              <ul className="mt-3 space-y-2">
                {done.map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <Checkbox checked onChange={() => updateTodo(t.id, { done: false })} label={`Reopen ${t.title}`} />
                    <span className="flex-1 text-sm text-muted line-through">{t.title}</span>
                    <IconButton label="Delete task" className="h-7 w-7" onClick={() => removeTodo(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
