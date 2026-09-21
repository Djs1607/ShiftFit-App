// ── Rest-timer state, owned above Tracker ───────────────────────────
// Lives in Shell so the countdown end-timestamp (and the chosen rest length)
// survive Tracker being unmounted. Tracker still drives the 1s tick and
// decides what happens on expiry; this only holds and mutates the state.

import { useRef, useState } from 'react';

export type RestKind = 'rest' | 'transition';
type ActiveRest = { end: number; duration: number; kind: RestKind };

export function useRestTimer() {
  const [restSecs, setRestSecs] = useState(90); // the user's chosen rest length
  const [active, setActive] = useState<ActiveRest | null>(null);
  const beepedFor = useRef<number | null>(null); // end-timestamp already handled

  const start = (kind: RestKind, seconds: number) => {
    beepedFor.current = null;
    setActive({ end: Date.now() + seconds * 1000, duration: seconds, kind });
  };

  const clear = () => {
    beepedFor.current = null;
    setActive(null);
  };

  // shift the running countdown; never lets it land in the past
  const adjust = (deltaMs: number, now: number) =>
    setActive((a) => (a ? { ...a, end: Math.max(now + 1000, a.end + deltaMs) } : a));

  // true exactly once per countdown: the caller should then beep / react
  const expire = () => {
    if (!active || beepedFor.current === active.end) return false;
    beepedFor.current = active.end;
    setActive(null);
    return true;
  };

  // back to a clean slate, as if Tracker had just mounted fresh
  const reset = () => {
    setRestSecs(90);
    clear();
  };

  return {
    restSecs, setRestSecs,
    restEnd: active?.end ?? null,
    restDuration: active?.duration ?? restSecs,
    restKind: active?.kind ?? ('rest' as RestKind),
    start, clear, adjust, expire, reset,
  };
}

export type RestTimer = ReturnType<typeof useRestTimer>;
