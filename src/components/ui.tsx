"use client";

import { Check, X } from "lucide-react";
import { useEffect, type ReactNode, type ButtonHTMLAttributes } from "react";
import type { Priority } from "@/lib/plan";
import type { TaskStatus } from "@/lib/state";
import { SUBJECT_MAP, type SubjectId } from "@/lib/syllabus";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Card({ className, children, as: Tag = "section" }: { className?: string; children: ReactNode; as?: "section" | "div" | "article" }) {
  return <Tag className={cx("card p-5 sm:p-6", className)}>{children}</Tag>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("text-[11px] font-medium uppercase tracking-[0.18em] text-muted", className)}>{children}</p>;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between fade-in">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

type BtnVariant = "primary" | "ghost" | "soft" | "danger";
export function Button({ variant = "soft", className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const styles: Record<BtnVariant, string> = {
    primary: "bg-olive text-white hover:bg-olive-ink dark:text-[#1b1d1a]",
    soft: "bg-sage-soft text-olive-ink hover:bg-sage/40",
    ghost: "border border-line text-ink hover:bg-bg-soft",
    danger: "bg-rose-soft text-rose-ink hover:bg-rose/40",
  };
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cx("inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-bg-soft hover:text-ink", className)}
    >
      {children}
    </button>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 8,
  color = "var(--olive)",
  track = "var(--sage-soft)",
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v)} percent`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function ProgressBar({ value, color = "var(--olive)", className, height = 6 }: { value: number; color?: string; className?: string; height?: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cx("w-full overflow-hidden rounded-full bg-sage-soft", className)} style={{ height }} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full" style={{ width: `${v}%`, background: color, transition: "width 0.6s cubic-bezier(.2,.8,.2,1)" }} />
    </div>
  );
}

export function Checkbox({ checked, onChange, label, className, size = "md" }: { checked: boolean; onChange: (v: boolean) => void; label: string; className?: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-md border transition-all duration-200",
        dim,
        checked ? "border-olive bg-olive text-white dark:text-[#1b1d1a]" : "border-line bg-card hover:border-sage",
        className,
      )}
    >
      {checked && <Check className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={3} />}
    </button>
  );
}

export function PriorityBadge({ p }: { p: Priority }) {
  const map: Record<Priority, { label: string; cls: string; dot: string }> = {
    high: { label: "High", cls: "bg-rose-soft text-rose-ink", dot: "bg-rose-ink" },
    medium: { label: "Medium", cls: "bg-amber-soft text-amber-ink", dot: "bg-amber-ink" },
    low: { label: "Low", cls: "bg-sage-soft text-olive-ink", dot: "bg-olive" },
  };
  const m = map[p];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", m.cls)}>
      <span className={cx("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export const STATUS_LABEL: Record<TaskStatus, string> = { todo: "Not started", doing: "In progress", done: "Completed" };

export function StatusSelect({ value, onChange }: { value: TaskStatus; onChange: (v: TaskStatus) => void }) {
  const cls: Record<TaskStatus, string> = {
    todo: "bg-bg-soft text-muted",
    doing: "bg-amber-soft text-amber-ink",
    done: "bg-sage-soft text-olive-ink",
  };
  return (
    <select
      aria-label="Task status"
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className={cx("cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-[11px] font-medium outline-none", cls[value])}
    >
      {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((k) => (
        <option key={k} value={k}>
          {STATUS_LABEL[k]}
        </option>
      ))}
    </select>
  );
}

export function SubjectTag({ id, short = false }: { id: SubjectId | null | undefined; short?: boolean }) {
  if (!id) return <span className="text-xs text-muted">General</span>;
  const s = SUBJECT_MAP[id];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink">
      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
      {short ? s.short : s.name}
    </span>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-[#30342f]/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cx("card fade-in max-h-[90vh] w-full overflow-y-auto rounded-b-none p-6 sm:rounded-b-[1.25rem]", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-sm text-muted">{body}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <p className="num mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Empty({ icon, title, body }: { icon: ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <div className="mb-3 text-sage">{icon}</div>
      <p className="font-serif text-lg">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
    </div>
  );
}
