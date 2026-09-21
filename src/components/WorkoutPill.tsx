// ── Minimized-workout pill ──────────────────────────────────────────
// Compact floating capsule shown above the tab bar while an active workout
// is minimized. Tapping anywhere on it brings the workout back. The ring is
// the rest-timer ring scaled down; with no rest running it's a dumbbell.

import { useSyncExternalStore } from 'react';
import { Dumbbell } from 'lucide-react';
import type { RestTimer } from '../lib/restTimer';

const subscribeToSeconds = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const currentSecond = () => Math.floor(Date.now() / 1000);

const fmtRemaining = (sec: number) => {
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}:${String(sec % 60).padStart(2, '0')}` : String(sec);
};

// only mounted while a countdown is active, so the 1s subscription only lives that long
function MiniRing({ restEnd, duration }: { restEnd: number; duration: number }) {
  const nowMs = useSyncExternalStore(subscribeToSeconds, currentSecond) * 1000;
  const remaining = Math.max(0, Math.ceil((restEnd - nowMs) / 1000));
  const R = 50;
  const C = 2 * Math.PI * R;
  const frac = duration > 0 ? Math.min(1, remaining / duration) : 0;
  const hot = remaining <= 5;

  return (
    <span className="relative h-9 w-9 shrink-0">
      <svg viewBox="0 0 120 120" className="h-9 w-9 -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeWidth="12" className="text-data-track" />
        <circle
          cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - frac)}
          className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${hot ? 'text-feedback-danger' : 'text-action-accent'}`}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold ${hot ? 'text-feedback-danger' : 'text-fg-primary'}`}>
        {fmtRemaining(remaining)}
      </span>
    </span>
  );
}

export function WorkoutPill({ restTimer, label, onOpen }: { restTimer: RestTimer; label: string; onOpen: () => void }) {
  return (
    <div
      className="fixed inset-x-0 z-30 flex justify-center px-4 pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 77px)' }}
    >
      <button
        onClick={onOpen}
        aria-label={`Return to workout: ${label}`}
        className="pointer-events-auto flex max-w-full items-center gap-2.5 rounded-full border border-[rgba(226,96,63,.3)] bg-surface-raised py-1.5 pl-1.5 pr-4 shadow-lg shadow-black/30 active:scale-95 transition-transform"
      >
        {restTimer.restEnd !== null ? (
          <MiniRing restEnd={restTimer.restEnd} duration={restTimer.restDuration} />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action-accent-quiet text-amber-400">
            <Dumbbell className="h-4 w-4" />
          </span>
        )}
        <span className="min-w-0 max-w-[10rem] truncate text-[13px] font-semibold text-fg-primary">{label}</span>
      </button>
    </div>
  );
}
