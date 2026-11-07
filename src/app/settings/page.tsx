"use client";

import { useRef, useState } from "react";
import { Download, History, Moon, RotateCcw, Sun, Upload, AlertTriangle } from "lucide-react";
import { useStore, type Snapshot } from "@/lib/store";
import { Button, Card, ConfirmModal, Eyebrow, PageHeader } from "@/components/ui";
import { NotificationToggle } from "@/components/TimerPanel";
import { istParts } from "@/lib/time";

function download(name: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SettingsPage() {
  const { state, now, toggleTheme, exportJSON, importJSON, resetAll, snapshots, restoreSnapshot } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<Snapshot | null>(null);
  const [snaps, setSnaps] = useState<Snapshot[]>(() => snapshots());

  const counts = {
    blocks: Object.values(state.taskStatus).filter((s) => s === "done").length,
    stages: Object.values(state.units).reduce((t, u) => t + Object.values(u).filter(Boolean).length, 0),
    sessions: state.sessions.length,
    journal: Object.keys(state.journal).length,
    todos: state.todos.length,
  };

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Your data stays in this browser" title="Settings & Data" subtitle="Everything is saved locally on this device. Export a backup before clearing your browser or switching laptops." />

      <div className="space-y-6">
        <Card>
          <Eyebrow>Appearance & alerts</Eyebrow>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted">Currently {state.theme}.</p>
            </div>
            <Button variant="ghost" onClick={toggleTheme}>
              {state.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Switch to {state.theme === "dark" ? "light" : "dark"}
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <div>
              <p className="font-medium">Timer notifications</p>
              <p className="text-sm text-muted">Shown only after you allow them.</p>
            </div>
            <NotificationToggle />
          </div>
        </Card>

        <Card>
          <Eyebrow>Backup</Eyebrow>
          <p className="num mt-3 text-sm text-muted">
            {counts.blocks} blocks done · {counts.stages} unit stages · {counts.sessions} sessions · {counts.journal} journal entries · {counts.todos} tasks
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => download(`semester-lock-in-${istParts(now).dateKey}.json`, exportJSON())}>
              <Download className="h-4 w-4" /> Export JSON
            </Button>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                try {
                  importJSON(await f.text());
                  setMsg({ ok: true, text: `Restored from ${f.name}.` });
                  setSnaps(snapshots());
                } catch (err) {
                  setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not read that file." });
                }
              }}
            />
          </div>
          {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-olive-ink" : "text-rose-ink"}`}>{msg.text}</p>}
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted" />
            <Eyebrow>Automatic backups</Eyebrow>
          </div>
          <p className="mt-2 text-sm text-muted">A snapshot is saved automatically once a day, and before every import, restore or reset. The last ten are kept.</p>
          {snaps.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No snapshots yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {snaps.map((s) => (
                <li key={s.savedAt} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="num text-xs text-muted">{new Date(s.savedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => download(`semester-lock-in-snapshot-${s.date}.json`, JSON.stringify({ app: "semester-lock-in", exportedAt: new Date(s.savedAt).toISOString(), state: s.data }, null, 2))}>
                      Download
                    </Button>
                    <Button variant="soft" className="px-3 py-1.5 text-xs" onClick={() => setRestoreTarget(s)}>
                      Restore
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="border-rose/60">
          <div className="flex items-center gap-2 text-rose-ink">
            <AlertTriangle className="h-4 w-4" />
            <Eyebrow className="text-rose-ink">Reset progress</Eyebrow>
          </div>
          <p className="mt-2 text-sm text-muted">Clears ticked blocks, unit stages, notes, checklists, timer sessions, journal and tasks. A snapshot is kept so you can undo it from Automatic backups.</p>
          <Button variant="danger" className="mt-4" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" /> Reset all progress
          </Button>
        </Card>
      </div>

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all progress?"
        body="Every tick, note, session, journal entry and task will be cleared. You can still restore the “Before reset” snapshot afterwards."
        confirmLabel="Reset everything"
        onConfirm={() => {
          resetAll();
          setSnaps(snapshots());
          setMsg({ ok: true, text: "Progress reset. A snapshot was kept." });
        }}
      />
      <ConfirmModal
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        title="Restore this snapshot?"
        body={restoreTarget ? `Your current data will be replaced with “${restoreTarget.label}” from ${new Date(restoreTarget.savedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}. The current state is saved as a snapshot first.` : ""}
        confirmLabel="Restore"
        onConfirm={() => {
          if (restoreTarget) restoreSnapshot(restoreTarget.savedAt);
          setSnaps(snapshots());
          setMsg({ ok: true, text: "Snapshot restored." });
        }}
      />
    </div>
  );
}
