// ── ShiftFit data model ─────────────────────────────────────────────
// All times are treated as LOCAL (no timezone conversion, per spec).

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // local-only MVP auth — stored client-side
  createdAt: string; // ISO
}

export interface ShiftDay {
  dayIndexInCycle: number; // 0-based index within the rotation cycle
  isOnShift: boolean;
  startTime: string; // "HH:mm" local — only meaningful when isOnShift
  endTime: string; // "HH:mm" local; end <= start means the shift crosses midnight
}

export interface ShiftPattern {
  id: string;
  userId: string;
  name: string;
  cycleLengthDays: number; // any length, NOT locked to 7
  startDate: string; // "YYYY-MM-DD" — anchors cycle-day-1 onto the calendar
  days: ShiftDay[]; // one entry per cycle day
  isActive: boolean;
}

export type WorkoutIntensity = 'light' | 'moderate' | 'hard';

// ── Live session tracking ───────────────────────────────────────────
export interface WorkoutSet {
  reps: number;
  weightKg: number; // 0 = bodyweight / not tracked
  done: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  userId: string;
  datetime: string; // LOCAL datetime "YYYY-MM-DDTHH:mm:00" (no Z — all times are local)
  type: string; // e.g. "Run", "Strength", "Mobility"
  durationMin: number; // planned duration; overwritten with actual on finish
  intensity: WorkoutIntensity;
  completed: boolean;
  notes?: string;
  libraryId?: string; // set when scheduled from the workout library
  exercises?: WorkoutExercise[]; // live tracker data
  startedAt?: string; // LOCAL datetime — session start
  finishedAt?: string; // LOCAL datetime — session end
  exitedAt?: string; // set when the user exits a live session (pause); cleared on resume
}

// A fully resolved shift instance (projected onto the calendar)
export interface ShiftInstance {
  patternId: string;
  dayIndexInCycle: number;
  start: Date;
  end: Date; // always > start, even when crossing midnight
  lengthHours: number;
  isNight: boolean; // heuristic: starts at/after 18:00 or before 06:00
}

export type Recommendation = 'rest' | 'light' | 'moderate' | 'hard';

// ── Self-reported sleep (folds into fatigue) ────────────────────────
export type SleepQuality = 'good' | 'ok' | 'poor';

export interface SleepLog {
  id: string;
  userId: string;
  dateKey: string; // the day the sleep preceded ("slept badly last night" logged that morning)
  quality: SleepQuality;
}

// ── Actual-day overrides (overtime, swaps, sick days) ───────────────
// Reality deviates from the rotation — override single days without
// touching the underlying pattern.
export interface DayOverride {
  id: string;
  userId: string;
  dateKey: string; // "YYYY-MM-DD"
  kind: 'off' | 'shift'; // off = rest/sick/called off; shift = custom times
  startTime?: string; // "HH:mm" when kind === 'shift'
  endTime?: string;
}

export interface DayPlan {
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  shift: ShiftInstance | null; // the shift that overlaps this calendar day, if any
  fatigue: number; // 0–100
  recommendation: Recommendation;
  reasons: string[]; // human-readable fatigue contributors
}
