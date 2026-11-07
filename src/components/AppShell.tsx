"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  GraduationCap,
  LineChart,
  Moon,
  Sun,
  Plus,
  Timer,
  NotebookPen,
  ListChecks,
  Settings,
  Lock,
  MoreHorizontal,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { clockString, fmtLong, istParts, PLAN_START_KEY } from "./shell-helpers";
import { weekdayShort, fmtDayMonth } from "@/lib/time";
import { Button, Field, IconButton, Modal, cx } from "./ui";
import { SUBJECTS, type SubjectId } from "@/lib/syllabus";
import type { Priority } from "@/lib/plan";
import { Celebration } from "./Celebration";
import { BlockEditor, emptyDraft } from "./BlockEditor";

export const MAIN_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plan", label: "Study Plan", icon: CalendarDays },
  { href: "/syllabus", label: "Syllabus", icon: BookOpen },
  { href: "/exams", label: "Exams", icon: GraduationCap },
  { href: "/progress", label: "Progress", icon: LineChart },
];
export const MORE_NAV = [
  { href: "/focus", label: "Focus timer", icon: Timer },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/settings", label: "Settings & data", icon: Settings },
];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

function Clock() {
  const { now } = useStore();
  const p = istParts(now);
  return (
    <div className="whitespace-nowrap text-right leading-tight">
      <p className="num text-xs font-medium sm:text-sm">{clockString(now)}</p>
      <p className="hidden text-[11px] text-muted xl:block">{fmtLong(p.dateKey)}</p>
      <p className="text-[10px] text-muted xl:hidden">
        {weekdayShort(p.dateKey)}, {fmtDayMonth(p.dateKey)}
      </p>
    </div>
  );
}

function QuickAdd({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTodo, now } = useStore();
  const [tab, setTab] = useState<"task" | "block">("task");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState("");
  const [subject, setSubject] = useState<SubjectId | "">("");
  const [blockOpen, setBlockOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDue(istParts(now).dateKey);
      setTab("task");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const today = istParts(now).dateKey;
  const blockDate = today < PLAN_START_KEY ? PLAN_START_KEY : today > "2026-11-23" ? "2026-11-23" : today;

  return (
    <>
      <Modal open={open && !blockOpen} onClose={onClose} title="Quick add">
        <div className="mb-5 inline-flex rounded-full bg-bg-soft p-1 text-sm">
          {(["task", "block"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cx("rounded-full px-4 py-1.5 transition-colors", tab === t ? "bg-card shadow-sm" : "text-muted")}>
              {t === "task" ? "Task" : "Study block"}
            </button>
          ))}
        </div>
        {tab === "task" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              addTodo({ title: title.trim(), priority, due: due || null, subject: (subject || null) as SubjectId | null });
              onClose();
            }}
          >
            <Field label="What needs doing?">
              <input ref={inputRef} autoFocus className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Practise LSTM diagram twice" />
            </Field>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Priority">
                <select className="field" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </Field>
              <Field label="Due">
                <input type="date" className="field" value={due} onChange={(e) => setDue(e.target.value)} />
              </Field>
              <Field label="Subject">
                <select className="field" value={subject} onChange={(e) => setSubject(e.target.value as SubjectId | "")}>
                  <option value="">General</option>
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.short}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!title.trim()}>
                Add task
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-sm text-muted">Add a timed study block to the day-wise plan, with subject, units and concepts.</p>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" onClick={() => setBlockOpen(true)}>
                Open block editor
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <BlockEditor
        open={blockOpen}
        initial={blockOpen ? emptyDraft(blockDate) : null}
        onClose={() => {
          setBlockOpen(false);
          onClose();
        }}
      />
    </>
  );
}

function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-xs font-semibold tracking-wide text-[#30342f] ring-2 ring-card transition-transform hover:scale-105"
      >
        RC
      </button>
      {open && (
        <div className="card fade-in absolute right-0 top-11 z-40 w-56 p-2">
          <p className="px-3 pb-2 pt-1 text-xs text-muted">Semester VII · B.Tech</p>
          {MORE_NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-bg-soft">
              <n.icon className="h-4 w-4 text-muted" /> {n.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileMore() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  const active = MORE_NAV.some((n) => isActive(path, n.href));
  return (
    <>
      <button onClick={() => setOpen(true)} className={cx("flex flex-1 flex-col items-center gap-1 py-2 text-[10px]", active ? "text-olive-ink" : "text-muted")}>
        <MoreHorizontal className="h-5 w-5" />
        More
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="More">
        <div className="grid grid-cols-2 gap-2">
          {MORE_NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-2xl border border-line p-4 text-sm hover:bg-bg-soft">
              <n.icon className="h-4 w-4 text-olive" /> {n.label}
            </Link>
          ))}
        </div>
      </Modal>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, state, toggleTheme } = useStore();
  const path = usePathname();
  const [quick, setQuick] = useState(false);
  const bare = path.startsWith("/print");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        e.preventDefault();
        setQuick(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Lock className="h-4 w-4 animate-pulse" />
          <span className="font-serif text-lg">Opening your planner…</span>
        </div>
      </div>
    );
  }

  if (bare) return <>{children}</>;

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="hidden h-8 w-8 items-center justify-center rounded-xl bg-olive min-[420px]:flex text-white dark:text-[#1b1d1a]">
              <Lock className="h-4 w-4" />
            </span>
            <span className="whitespace-nowrap font-serif text-sm font-semibold tracking-[0.06em] sm:text-xl sm:tracking-[0.08em] lg:text-lg xl:text-xl">SEMESTER LOCK-IN</span>
          </Link>
          <nav className="ml-1 hidden items-center gap-0.5 lg:flex xl:ml-4 xl:gap-1" aria-label="Main">
            {MAIN_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cx(
                  "whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm transition-colors xl:px-3.5",
                  isActive(path, n.href) ? "bg-sage-soft font-medium text-olive-ink" : "text-muted hover:text-ink",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-0.5 sm:gap-2">
            <Clock />
            <IconButton label="Quick add (N)" onClick={() => setQuick(true)} className="bg-sage-soft text-olive-ink hover:bg-sage/40 hover:text-olive-ink">
              <Plus className="h-4 w-4" />
            </IconButton>
            <Link href="/focus" aria-label="Focus timer" title="Focus timer" className="hidden h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-bg-soft hover:text-ink sm:inline-flex">
              <Timer className="h-4 w-4" />
            </Link>
            <IconButton label={state.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme}>
              {state.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconButton>
            <AvatarMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">{children}</main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-card/95 backdrop-blur-md lg:hidden" aria-label="Mobile">
        {MAIN_NAV.map((n) => (
          <Link key={n.href} href={n.href} className={cx("flex flex-1 flex-col items-center gap-1 py-2 text-[10px]", isActive(path, n.href) ? "text-olive-ink" : "text-muted")}>
            <n.icon className="h-5 w-5" />
            {n.label.replace("Study ", "")}
          </Link>
        ))}
        <MobileMore />
      </nav>

      <QuickAdd open={quick} onClose={() => setQuick(false)} />
      <Celebration />
    </div>
  );
}
