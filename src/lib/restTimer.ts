// ── Rest-timer state, owned above Tracker ───────────────────────────
// Lives in Shell and is fully self-sufficient: it runs its own interval
// while a countdown is active, detects expiry against its own end
// timestamp, and beeps + clears on its own. It works whether or not any
// screen is mounted. Consumers only read state and react to `lastExpiry`.

import { useEffect, useRef, useState } from 'react';
import { beep } from './beep';

export type RestKind = 'rest' | 'transition';
type ActiveRest = { end: number; duration: number; kind: RestKind };

export function useRestTimer(onExpire?: () => void) {
  const [restSecs, setRestSecs] = useState(90); // the user's chosen rest length
  const [active, setActive] = useState<ActiveRest | null>(null);
  // end-timestamp of the most recent countdown that ran to zero (not skipped)
  const [lastExpiry, setLastExpiry] = useState<number | null>(null);
  const beepedFor = useRef<number | null>(null); // end-timestamp already handled
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onExpireRef.current = onExpire; });

  // own tick, alive only while a countdown is running
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (Date.now() < active.end || beepedFor.current === active.end) return;
      beepedFor.current = active.end;
      beep();
      setActive(null);
      setLastExpiry(active.end);
      onExpireRef.current?.();
    }, 500);
    return () => clearInterval(id);
  }, [active]);

  const start = (kind: RestKind, seconds: number) => {
    beepedFor.current = null;
    setActive({ end: Date.now() + seconds * 1000, duration: seconds, kind });
  };

  const clear = () => {
    beepedFor.current = null;
    setActive(null);
  };

  // shift the running countdown; never lets it land in the past
  const adjust = (deltaMs: number) =>
    setActive((a) => (a ? { ...a, end: Math.max(Date.now() + 1000, a.end + deltaMs) } : a));

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
    lastExpiry,
    start, clear, adjust, reset,
  };
}

export type RestTimer = ReturnType<typeof useRestTimer>;
