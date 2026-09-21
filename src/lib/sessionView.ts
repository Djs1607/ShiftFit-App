// ── Which exercise / which phase the active session is on ───────────
// Lives in Shell next to the rest timer so a Tracker that unmounts and
// remounts for the same workout resumes exactly where it left off.
// Keyed by workout id: adopting a new active workout picks its starting
// phase once; reset() drops it (Exit / Finish).

import { useState } from 'react';
import type { Workout } from './types';

export type SessionPhase = 'warmup' | 'exercises' | 'cooldown';

type View = { workoutId: string | null; currentExIdx: number; sessionPhase: SessionPhase };
const EMPTY: View = { workoutId: null, currentExIdx: 0, sessionPhase: 'exercises' };

// Light/recovery sessions skip the warm-up, and so does a session already
// under way (startedAt is only set on first open), so resuming or reloading
// mid-workout doesn't replay it.
const startingPhase = (w?: Workout): SessionPhase =>
  !w || w.intensity === 'light' || w.startedAt ? 'exercises' : 'warmup';

export function useSessionView(liveId: string | null, liveWorkout: Workout | undefined) {
  const [view, setView] = useState<View>(EMPTY);

  // a different workout became active: decide its starting phase right now,
  // before anything (e.g. Tracker seeding startedAt) can change the answer
  if (liveId !== null && liveId !== view.workoutId) {
    setView({ workoutId: liveId, currentExIdx: 0, sessionPhase: startingPhase(liveWorkout) });
  }

  return {
    currentExIdx: view.currentExIdx,
    sessionPhase: view.sessionPhase,
    setCurrentExIdx: (v: number | ((i: number) => number)) =>
      setView((p) => ({ ...p, currentExIdx: typeof v === 'function' ? v(p.currentExIdx) : v })),
    setSessionPhase: (phase: SessionPhase) => setView((p) => ({ ...p, sessionPhase: phase })),
    reset: () => setView(EMPTY),
  };
}

export type SessionView = ReturnType<typeof useSessionView>;
