// ── Shift projection engine ─────────────────────────────────────────
// Generates shift instances for any date by projecting the pattern
// forward (or backward) from its startDate. No future instances are
// stored — everything is derived.

import type { DayOverride, DayPlan, Recommendation, ShiftDay, ShiftInstance, ShiftPattern, SleepLog, Workout } from './types';

export const DAY_MS = 24 * 60 * 60 * 1000;

export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function parseHM(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(':').map(Number);
  return { h: h || 0, m: m || 0 };
}

/** Combine a calendar day with an "HH:mm" time into a Date. */
export function atTime(day: Date, hm: string): Date {
  const { h, m } = parseHM(hm);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

export function fmtTime(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Local-time ISO string ("YYYY-MM-DDTHH:mm:ss", no Z).
 * ShiftFit treats all times as local — storing UTC ("...Z") would make
 * date grouping (slice(0,10)) land workouts on the wrong calendar day
 * near midnight or in timezones ahead of UTC.
 * Seconds are REAL (not truncated) — session timers measure against
 * these stamps, and truncating would add up to 59s of phantom elapsed time.
 */
export function localISO(d: Date): string {
  return `${dateKey(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function fmtDayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function isNightShift(start: Date): boolean {
  const h = start.getHours();
  return h >= 18 || h < 6;
}

/** Resolve one cycle day into a concrete shift instance anchored to a cycle start. */
function resolveDay(cycleStart: Date, day: ShiftDay, patternId: string): ShiftInstance | null {
  if (!day.isOnShift) return null;
  const base = new Date(cycleStart.getTime() + day.dayIndexInCycle * DAY_MS);
  const start = atTime(base, day.startTime);
  let end = atTime(base, day.endTime);
  if (end.getTime() <= start.getTime()) {
    // Overnight shift — one continuous span crossing midnight
    end = new Date(end.getTime() + DAY_MS);
  }
  return {
    patternId,
    dayIndexInCycle: day.dayIndexInCycle,
    start,
    end,
    lengthHours: (end.getTime() - start.getTime()) / 3600000,
    isNight: isNightShift(start),
  };
}

/**
 * Project every shift instance whose span intersects [from, to].
 * Handles overnight shifts (a shift starting the day before `from`
 * can still overlap the window).
 */
export function projectShifts(pattern: ShiftPattern, from: Date, to: Date): ShiftInstance[] {
  const anchor = parseDateKey(pattern.startDate);
  anchor.setHours(0, 0, 0, 0);
  const cycleMs = pattern.cycleLengthDays * DAY_MS;
  const out: ShiftInstance[] = [];

  const windowStart = new Date(from); windowStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(to); windowEnd.setHours(23, 59, 59, 999);
  // start one cycle early so overnight shifts spilling into the window are caught
  const scanStart = new Date(windowStart.getTime() - cycleMs);

  // first cycle start >= scanStart (cycles may begin before the anchor)
  const diffDays = Math.floor((scanStart.getTime() - anchor.getTime()) / DAY_MS);
  const cyclesBack = Math.ceil(-diffDays / pattern.cycleLengthDays);
  let cycleStart = new Date(anchor.getTime() - cyclesBack * cycleMs);

  while (cycleStart.getTime() <= windowEnd.getTime()) {
    for (const day of pattern.days) {
      const inst = resolveDay(cycleStart, day, pattern.id);
      if (!inst) continue;
      if (inst.end.getTime() >= windowStart.getTime() && inst.start.getTime() <= windowEnd.getTime()) {
        out.push(inst);
      }
    }
    cycleStart = new Date(cycleStart.getTime() + cycleMs);
  }
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

/** All shifts overlapping a single calendar day (usually 0 or 1). */
export function shiftOnDate(pattern: ShiftPattern, day: Date): ShiftInstance | null {
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(day); end.setHours(23, 59, 59, 999);
  const hits = projectShifts(pattern, start, end).filter(
    (s) => s.start.getTime() <= end.getTime() && s.end.getTime() >= start.getTime()
  );
  return hits[0] ?? null;
}

// ── Actual-day overrides ────────────────────────────────────────────

function makeOverrideShift(day: Date, ov: DayOverride): ShiftInstance | null {
  if (ov.kind !== 'shift' || !ov.startTime || !ov.endTime) return null;
  const start = atTime(day, ov.startTime);
  let end = atTime(day, ov.endTime);
  if (end.getTime() <= start.getTime()) end = new Date(end.getTime() + DAY_MS);
  return {
    patternId: 'override',
    dayIndexInCycle: -1,
    start,
    end,
    lengthHours: (end.getTime() - start.getTime()) / 3600000,
    isNight: isNightShift(start),
  };
}

/** Shift for one calendar day, honouring any override for that day. */
export function resolveDayShift(
  pattern: ShiftPattern,
  day: Date,
  overrides: DayOverride[] = []
): ShiftInstance | null {
  const ov = overrides.find((o) => o.dateKey === dateKey(day));
  if (ov) {
    if (ov.kind === 'off') return null;
    return makeOverrideShift(day, ov);
  }
  return shiftOnDate(pattern, day);
}

/** Apply day-level overrides onto a projected shift list for [from,to]. */
function applyOverrides(
  shifts: ShiftInstance[],
  from: Date,
  to: Date,
  overrides: DayOverride[]
): ShiftInstance[] {
  if (!overrides.length) return shifts;
  let out = shifts;
  for (let t = new Date(from); t.getTime() <= to.getTime(); t = new Date(t.getTime() + DAY_MS)) {
    const key = dateKey(t);
    const ov = overrides.find((o) => o.dateKey === key);
    if (!ov) continue;
    const dayStart = new Date(t); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(t); dayEnd.setHours(23, 59, 59, 999);
    // drop projected shifts starting on the overridden day
    out = out.filter((s) => !(s.start.getTime() >= dayStart.getTime() && s.start.getTime() <= dayEnd.getTime()));
    const custom = makeOverrideShift(t, ov);
    if (custom) out.push(custom);
  }
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

// ── Fatigue engine ──────────────────────────────────────────────────
// Tunable thresholds — retune freely, everything flows from these.

export const FATIGUE = {
  CONSECUTIVE_SHIFT_PTS: 9, // per consecutive shift without a full rest day
  CONSECUTIVE_CAP: 36,
  LONG_SHIFT_PTS_PER_HR: 3.5, // per hour beyond 8h
  SHORT_GAP_THRESHOLD_H: 11, // mirrors real fatigue-risk-management (~10–11h)
  SHORT_GAP_PTS_PER_HR: 4.5, // per hour below threshold
  NIGHT_SHIFT_PTS: 8,
  NIGHT_TO_DAY_PTS: 14, // circadian disruption on type change
  DAY_TO_NIGHT_PTS: 9,
  RECOVERY_DAYS_NEEDED: 2, // full rest days after a night block to reset
  RECOVERY_PTS: 16, // decays by half each recovery day
  LONG_SHIFT_H: 8,
  // completed workouts add training load: full points same day,
  // half points the following day (recovery still in progress)
  WORKOUT_PTS: { light: 4, moderate: 9, hard: 15 } as Record<string, number>,
  SLEEP_POOR_PTS: 12, // self-reported bad sleep before this day
  SLEEP_OK_PTS: 5,
};

// Fatigue → workout intensity mapping (0–100 fatigue score).
// Low fatigue = push hard; high fatigue = rest.
export const RECO_THRESHOLDS: { max: number; rec: Recommendation }[] = [
  { max: 30, rec: 'hard' },
  { max: 50, rec: 'moderate' },
  { max: 70, rec: 'light' },
  { max: 100, rec: 'rest' },
];

export function recommendationFor(fatigue: number): Recommendation {
  for (const t of RECO_THRESHOLDS) if (fatigue <= t.max) return t.rec;
  return 'rest';
}

// ── Safety overrides ────────────────────────────────────────────────
// These run AFTER the score-based recommendation above and never touch
// the point values — they only cap or override the final recommendation.
const RECO_ORDER: Recommendation[] = ['rest', 'light', 'moderate', 'hard'];

/** Long shifts cap the ceiling regardless of how low the computed score is. */
function shiftLengthCap(lengthHours: number): Recommendation | null {
  if (lengthHours >= 12) return 'light';
  if (lengthHours >= 8) return 'moderate';
  return null;
}

/**
 * Build day plans for [from, to] with fatigue scored from schedule
 * context (look-back included so history affects the first visible day).
 * Completed workouts add training-load points to their day and half
 * points to the following day.
 */
export function buildDayPlans(
  pattern: ShiftPattern,
  from: Date,
  to: Date,
  workouts: Workout[] = [],
  extras: { sleepLogs?: SleepLog[]; overrides?: DayOverride[] } = {}
): DayPlan[] {
  const done = workouts.filter((w) => w.completed);
  const lookback = new Date(from.getTime() - 10 * DAY_MS);
  const end = new Date(to.getTime() + DAY_MS); // need "next shift" for rest-gap
  const shifts = applyOverrides(
    projectShifts(pattern, lookback, end),
    lookback,
    end,
    extras.overrides ?? []
  );
  const sleepMap = new Map((extras.sleepLogs ?? []).map((s) => [s.dateKey, s.quality]));
  const ovMap = new Map((extras.overrides ?? []).map((o) => [o.dateKey, o]));

  // day-by-day schedule for the whole analysed span
  const days: { date: Date; shift: ShiftInstance | null }[] = [];
  for (let t = lookback.getTime(); t <= to.getTime(); t += DAY_MS) {
    const date = new Date(t);
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
    let shift =
      shifts.find((s) => s.start.getTime() <= dayEnd.getTime() && s.end.getTime() >= dayStart.getTime()) ?? null;
    // an 'off' override clears even an overnight shift spilling into this day
    if (ovMap.get(dateKey(date))?.kind === 'off') shift = null;
    days.push({ date, shift });
  }

  // recovery state: full rest days since the end of the last night block
  let nightBlockActive = false;
  let restDaysSinceNightBlock = 99;
  let consecutive = 0;

  const plans: DayPlan[] = [];

  for (let i = 0; i < days.length; i++) {
    const { date, shift } = days[i];
    const reasons: string[] = [];
    let score = 0;

    if (shift) {
      consecutive = i > 0 && days[i - 1].shift ? consecutive + 1 : 1;
      const consecPts = Math.min(consecutive * FATIGUE.CONSECUTIVE_SHIFT_PTS, FATIGUE.CONSECUTIVE_CAP);
      score += consecPts;
      if (consecutive > 1) reasons.push(`${consecutive} shifts in a row (+${Math.round(consecPts)})`);

      if (shift.lengthHours > FATIGUE.LONG_SHIFT_H) {
        const pts = (shift.lengthHours - FATIGUE.LONG_SHIFT_H) * FATIGUE.LONG_SHIFT_PTS_PER_HR;
        score += pts;
        reasons.push(`${Math.round(shift.lengthHours)}h shift (+${Math.round(pts)})`);
      }

      if (shift.isNight) {
        score += FATIGUE.NIGHT_SHIFT_PTS;
        reasons.push(`Night shift (+${FATIGUE.NIGHT_SHIFT_PTS})`);
      }

      // rest gap + transition vs the previous shift
      const prev = shifts.filter((s) => s.start.getTime() < shift.start.getTime()).pop();
      if (prev) {
        const gapH = (shift.start.getTime() - prev.end.getTime()) / 3600000;
        if (gapH < FATIGUE.SHORT_GAP_THRESHOLD_H) {
          const pts = (FATIGUE.SHORT_GAP_THRESHOLD_H - gapH) * FATIGUE.SHORT_GAP_PTS_PER_HR;
          score += pts;
          reasons.push(`Only ${gapH.toFixed(1)}h rest before this shift (+${Math.round(pts)})`);
        }
        if (prev.isNight && !shift.isNight) {
          score += FATIGUE.NIGHT_TO_DAY_PTS;
          reasons.push(`Night → day flip (+${FATIGUE.NIGHT_TO_DAY_PTS})`);
        } else if (!prev.isNight && shift.isNight) {
          score += FATIGUE.DAY_TO_NIGHT_PTS;
          reasons.push(`Day → night flip (+${FATIGUE.DAY_TO_NIGHT_PTS})`);
        }
      }
    }

    // night-block bookkeeping & recovery window
    if (shift?.isNight) {
      nightBlockActive = true;
      restDaysSinceNightBlock = 0;
    } else if (!shift) {
      if (nightBlockActive) {
        nightBlockActive = false;
        restDaysSinceNightBlock = 1;
      } else if (restDaysSinceNightBlock < 99) {
        restDaysSinceNightBlock += 1;
      }
    } else {
      // working a day shift right after nights: count as partial recovery
      if (restDaysSinceNightBlock < 99) restDaysSinceNightBlock += 0.5;
    }

    if (restDaysSinceNightBlock <= FATIGUE.RECOVERY_DAYS_NEEDED && restDaysSinceNightBlock < 99) {
      const pts = FATIGUE.RECOVERY_PTS / Math.max(restDaysSinceNightBlock, 0.5);
      score += pts;
      reasons.push(`Still recovering from nights (+${Math.round(pts)})`);
    }

    // self-reported sleep before this day
    const sleep = sleepMap.get(dateKey(date));
    if (sleep === 'poor') {
      score += FATIGUE.SLEEP_POOR_PTS;
      reasons.push(`Poor sleep last night (+${FATIGUE.SLEEP_POOR_PTS})`);
    } else if (sleep === 'ok') {
      score += FATIGUE.SLEEP_OK_PTS;
      reasons.push(`So-so sleep last night (+${FATIGUE.SLEEP_OK_PTS})`);
    }

    // completed workouts: full load on the day, half load the day after
    const key = dateKey(date);
    const prevKey = dateKey(new Date(date.getTime() - DAY_MS));
    for (const w of done) {
      const wKey = w.datetime.slice(0, 10);
      const base = FATIGUE.WORKOUT_PTS[w.intensity] ?? 0;
      if (wKey === key) {
        score += base;
        reasons.push(`Completed ${w.type.toLowerCase()} · ${w.intensity} (+${base})`);
      } else if (wKey === prevKey) {
        const pts = Math.round(base / 2);
        score += pts;
        reasons.push(`Recovering from yesterday's ${w.type.toLowerCase()} (+${pts})`);
      }
    }

    const fatigue = Math.max(0, Math.min(100, Math.round(score)));
    let recommendation = recommendationFor(fatigue);
    // a day the user explicitly marked off (sick/called off) never prescribes hard work
    if (ovMap.get(dateKey(date))?.kind === 'off' && (recommendation === 'moderate' || recommendation === 'hard')) {
      recommendation = 'light';
      reasons.push('You marked this day off — keep it easy');
    }

    // shift-length safety cap — bring the recommendation down, never up
    if (shift) {
      const cap = shiftLengthCap(shift.lengthHours);
      if (cap && RECO_ORDER.indexOf(recommendation) > RECO_ORDER.indexOf(cap)) {
        recommendation = cap;
        reasons.unshift(`${Math.round(shift.lengthHours)}h shift — capping at ${cap}`);
      }
    }

    // sleep hard floor — poor sleep forces rest regardless of every other factor
    if (sleepMap.get(dateKey(date)) === 'poor') {
      recommendation = 'rest';
      reasons.unshift('Poor sleep — recommending rest regardless of other factors.');
    }

    plans.push({
      date,
      dateKey: dateKey(date),
      shift,
      fatigue,
      recommendation,
      reasons,
    });
  }

  return plans.filter((p) => p.date.getTime() >= from.getTime() && p.date.getTime() <= to.getTime());
}

/** True if [start,end] overlaps ANY shift span in the window (partial counts). */
export function findOverlap(
  pattern: ShiftPattern,
  start: Date,
  end: Date,
  overrides: DayOverride[] = []
): ShiftInstance | null {
  const from = new Date(start.getTime() - 2 * DAY_MS);
  const to = new Date(end.getTime() + 2 * DAY_MS);
  const shifts = applyOverrides(projectShifts(pattern, from, to), from, to, overrides);
  return shifts.find((s) => s.start.getTime() < end.getTime() && s.end.getTime() > start.getTime()) ?? null;
}
