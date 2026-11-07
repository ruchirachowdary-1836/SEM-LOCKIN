// All date/time logic runs in Asia/Kolkata regardless of the device's zone.

export const TZ = "Asia/Kolkata";
const IST_OFFSET_MIN = 330;

/** Current instant. A dev-only override (localStorage "sli:simNow", ISO string) helps test exam days. */
export function now(): Date {
  if (typeof window !== "undefined") {
    try {
      const sim = window.localStorage.getItem("sli:simNow");
      if (sim) {
        const base = JSON.parse(sim) as { at: string; setAt: number };
        return new Date(new Date(base.at).getTime() + (Date.now() - base.setAt));
      }
    } catch {
      /* ignore */
    }
  }
  return new Date();
}

export interface ISTParts {
  dateKey: string; // YYYY-MM-DD
  minutes: number; // minutes since IST midnight
  seconds: number;
  weekday: number; // 0 = Sunday
}

export function istParts(d: Date = now()): ISTParts {
  const shifted = new Date(d.getTime() + IST_OFFSET_MIN * 60000);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  return {
    dateKey: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    seconds: shifted.getUTCSeconds(),
    weekday: shifted.getUTCDay(),
  };
}

export function todayKey(): string {
  return istParts().dateKey;
}

/** Instant for an IST wall-clock date + HH:MM. */
export function istInstant(dateKey: string, hhmm = "00:00"): Date {
  return new Date(`${dateKey}T${hhmm}:00+05:30`);
}

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Duration in minutes; handles ranges that cross midnight (e.g. sleep). */
export function spanMin(start: string, end: string): number {
  const s = toMin(start);
  let e = toMin(end);
  if (e <= s) e += 1440;
  return e - s;
}

export function fmt12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function fmtRange(start: string, end: string): string {
  return `${fmt12(start)} – ${fmt12(end)}`;
}

export function fmtHours(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function partsOfKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, wd };
}

export function weekdayOf(key: string): string {
  return DAYS[partsOfKey(key).wd];
}
export function weekdayShort(key: string): string {
  return DAYS_SHORT[partsOfKey(key).wd];
}
export function fmtDate(key: string): string {
  const { y, m, d } = partsOfKey(key);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export function fmtDayMonth(key: string): string {
  const { m, d } = partsOfKey(key);
  return `${d} ${MONTHS[m - 1]}`;
}
export function fmtLong(key: string): string {
  const { y, m, d, wd } = partsOfKey(key);
  return `${DAYS[wd]}, ${d} ${MONTHS_LONG[m - 1]} ${y}`;
}
export function monthName(m: number): string {
  return MONTHS_LONG[m - 1];
}

export function addDays(key: string, n: number): string {
  const { y, m, d } = partsOfKey(key);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

/** Whole calendar days from a to b (b - a). */
export function dayDiff(a: string, b: string): number {
  const pa = partsOfKey(a);
  const pb = partsOfKey(b);
  return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 86400000);
}

export function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let k = from; k <= to; k = addDays(k, 1)) out.push(k);
  return out;
}

export function clockString(d: Date = now()): string {
  return d.toLocaleTimeString("en-IN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
}

export function countdownParts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
