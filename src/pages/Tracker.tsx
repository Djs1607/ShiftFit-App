import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Check, Trash2, Timer, Flag, Play, Pause, RotateCcw, Dumbbell, ChevronRight, ChevronLeft, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import { localISO } from '../lib/schedule';
import { WORKOUT_LIBRARY } from '../lib/library';
import { Button, ListRow, MetricTile, Stepper } from '../components/ds';
import { ExercisePicker } from '../components/ExercisePicker';
import type { Workout, WorkoutExercise, WorkoutSet } from '../lib/types';
import type { RestTimer } from '../lib/restTimer';
import type { SessionView } from '../lib/sessionView';
import { beep } from '../lib/beep';

const REST_OPTIONS = [30, 60, 90, 120, 180];
const CARDIO_TYPES = new Set(['Run', 'Walk', 'Cycle', 'Swim', 'Cardio', 'Row']);
const DURATION_CHIPS = [5, 10, 15, 20, 30, 45, 60];

// same heuristic style as the dumbbell-label check: case-insensitive
// substring match on the exercise name, nothing fancier — real exercise
// names mix "One-Arm", "One Arm", "Single-Leg" etc., so space and hyphen
// are treated interchangeably as the separator
const isSingleArmExercise = (name: string) => /(single|one)[\s-]+(arm|leg)|unilateral/i.test(name);

function makeSets(count: number, base: { reps: number; weightKg: number }, singleArm: boolean): WorkoutSet[] {
  if (!singleArm) return Array.from({ length: count }, () => ({ ...base, done: false }));
  return Array.from({ length: count }, () => [
    { ...base, done: false, side: 'left' as const },
    { ...base, done: false, side: 'right' as const },
  ]).flat();
}

function fmtElapsed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

// ── circular rest-timer ring ─────────────────────────────────────────
// Highly visible, sits right under the header so it's reachable mid-set
// without scrolling. Tap the ring itself to skip (plus explicit buttons
// for anyone who wants a bigger target).
function RestRing({
  restLeft, restDuration, variant = 'rest', onAdjust, onSkip,
}: {
  restLeft: number; restDuration: number; variant?: 'rest' | 'transition';
  onAdjust: (deltaMs: number) => void; onSkip: () => void;
}) {
  const R = 50;
  const C = 2 * Math.PI * R;
  const frac = restDuration > 0 ? Math.min(1, Math.max(0, restLeft / restDuration)) : 0;
  const offset = C * (1 - frac);
  const hot = restLeft <= 5;
  const isTransition = variant === 'transition';

  return (
    <section className="rounded-sheet bg-surface-raised border border-[rgba(226,96,63,.3)] p-4 mb-4 shadow-lg shadow-black/30">
      <div className="flex items-center gap-4">
        <button
          onClick={onSkip}
          aria-label={isTransition ? 'Tap to skip side switch' : 'Tap to skip rest'}
          className="relative h-28 w-28 shrink-0 active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeWidth="8" className="text-data-track" />
            <circle
              cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={offset}
              className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${hot ? 'text-feedback-danger' : 'text-action-accent'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`readout text-3xl ${hot ? 'text-feedback-danger' : 'text-fg-primary'}`}>{fmtElapsed(restLeft)}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-fg-tertiary mt-0.5">Tap to skip</span>
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" /> {isTransition ? 'Switch sides' : 'Resting'}
          </p>
          <p className="text-[14px] text-fg-secondary mb-3 leading-snug">
            {isTransition
              ? 'Get set up on the other side, then keep going.'
              : "Next set unlocks when the ring empties, or skip whenever you're ready."}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => onAdjust(-15000)} className="flex-1 rounded-control bg-surface-inset py-2 text-[12px] font-bold text-fg-body hover:bg-surface-hover">−15s</button>
            <button onClick={() => onAdjust(15000)} className="flex-1 rounded-control bg-surface-inset py-2 text-[12px] font-bold text-fg-body hover:bg-surface-hover">+15s</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── session warm-up / cooldown screens ──────────────────────────────
// A guided checklist, not a gate: nothing here blocks the action button,
// and nothing is saved. Item state is local to the screen (the caller keys
// it by phase so it starts fresh each time). Countdowns reuse the parent's
// 1s `now` tick against a stored end timestamp — no extra interval.
type PrepItem = { id: string; name: string; seconds: number | null; reps: string | null; done: boolean };
type PrepDef = Omit<PrepItem, 'done'> & { label: string | null };

const WARMUP_ITEMS: PrepDef[] = [
  { id: 'w1', name: 'March or jog in place', seconds: 60, reps: null, label: '1 min' },
  { id: 'w2', name: 'Arm circles', seconds: 30, reps: null, label: '30s each direction' },
  { id: 'w3', name: 'Bodyweight squats', seconds: null, reps: '15 reps', label: null },
  { id: 'w4', name: 'Leg swings', seconds: null, reps: '10 each leg', label: null },
  { id: 'w5', name: 'Torso twists', seconds: 30, reps: null, label: '30s' },
];

const COOLDOWN_ITEMS: PrepDef[] = [
  { id: 'c1', name: 'Standing quad stretch', seconds: 30, reps: null, label: '30s each leg' },
  { id: 'c2', name: 'Hamstring stretch', seconds: 30, reps: null, label: '30s each leg' },
  { id: 'c3', name: 'Chest and shoulder stretch', seconds: 30, reps: null, label: '30s each side' },
  { id: 'c4', name: 'Calf stretch', seconds: 30, reps: null, label: '30s each leg' },
  { id: 'c5', name: "Deep breathing / child's pose", seconds: 60, reps: null, label: '1 min' },
];

function SessionPhaseScreen({
  title, defs, now, actionLabel, actionIcon, onAction, skipLabel, onExit,
}: {
  title: string; defs: PrepDef[]; now: number;
  actionLabel: string; actionIcon: typeof Flag; onAction: () => void; skipLabel: string; onExit: () => void;
}) {
  const [items, setItems] = useState<PrepItem[]>(() => defs.map((d) => ({ id: d.id, name: d.name, seconds: d.seconds, reps: d.reps, done: false })));
  const [timer, setTimer] = useState<{ id: string; end: number } | null>(null);

  // timer reached zero: check the item off, beep, clear it
  useEffect(() => {
    if (timer && now >= timer.end) {
      beep();
      setItems((prev) => prev.map((i) => (i.id === timer.id ? { ...i, done: true } : i)));
      setTimer(null);
    }
  }, [now, timer]);

  const toggleDone = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  // the primary button walks the list: each tap completes the next unfinished
  // item (dropping its timer if one is running); once everything is done it
  // becomes the real action. The skip link jumps past the whole list.
  const nextItem = items.find((i) => !i.done);
  const completeNext = () => {
    if (!nextItem) return onAction();
    setItems((prev) => prev.map((i) => (i.id === nextItem.id ? { ...i, done: true } : i)));
    setTimer((t) => (t?.id === nextItem.id ? null : t));
  };

  // one timer at a time: starting another replaces it without touching done;
  // tapping the running item again just stops it
  const toggleTimer = (item: PrepItem) => {
    if (item.seconds === null) return;
    setTimer((t) => (t?.id === item.id ? null : { id: item.id, end: Date.now() + item.seconds! * 1000 }));
  };

  return (
    <div className="min-h-dvh bg-bg-base text-fg-primary flex flex-col">
      <header className="sticky top-0 z-10 bg-bg-base/95 backdrop-blur border-b border-line-subtle" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <button onClick={onExit} className="flex items-center gap-1 text-[14px] text-fg-secondary font-semibold">
            <X className="h-4 w-4" /> Exit
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-md px-5 pt-12 pb-40">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">{title}</h1>
        <ul className="mt-8 divide-y divide-line-subtle">
          {items.map((item, i) => {
            const running = timer?.id === item.id;
            const remaining = running && item.seconds !== null
              ? Math.min(item.seconds, Math.max(0, Math.ceil((timer.end - now) / 1000)))
              : null;
            return (
              <li key={item.id} className="flex items-center gap-3 py-4">
                <button
                  onClick={() => toggleDone(item.id)}
                  role="checkbox"
                  aria-checked={item.done}
                  aria-label={`Mark ${item.name} done`}
                  className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center transition-colors duration-fast ease-standard ${
                    item.done ? 'bg-action-accent' : 'border border-line-default bg-surface-raised'
                  }`}
                >
                  <Check className={`h-4 w-4 ${item.done ? 'text-fg-onAccent' : 'text-transparent'}`} strokeWidth={3} />
                </button>
                <p className={`min-w-0 flex-1 text-[17px] font-medium leading-snug break-words${item.done ? 'text-fg-tertiary' : 'text-fg-primary'}`}>
                  {item.name}
                </p>
                <span className={`min-w-0 max-w-[5.5rem] text-right text-[13px] leading-snug tabular-nums ${running ? 'text-fg-primary font-bold' : 'text-fg-tertiary'}`}>
                  {running ? `${remaining}s` : (item.reps ?? defs[i].label)}
                </span>
                {item.seconds !== null ? (
                  <button
                    onClick={() => toggleTimer(item)}
                    aria-label={running ? `Stop ${item.name} timer` : `Start ${item.name} timer`}
                    className="h-9 w-9 shrink-0 rounded-control bg-surface-raised border border-line-default flex items-center justify-center text-fg-secondary active:scale-90 transition-transform"
                  >
                    {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                ) : (
                  <span aria-hidden className="h-9 w-9 shrink-0" />
                )}
              </li>
            );
          })}
        </ul>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-10 bg-bg-base/95 backdrop-blur border-t border-line-subtle pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-md px-4 py-2.5">
          <Button variant="accent" size="lg" fullWidth icon={nextItem ? Check : actionIcon} onClick={completeNext}>
            <span className="min-w-0 truncate">{nextItem ? `Done with ${nextItem.name}` : actionLabel}</span>
          </Button>
          {nextItem && (
            <button onClick={onAction} className="mx-auto mt-2 block py-1 text-[13px] text-fg-tertiary">
              {skipLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── exercise list overview ──────────────────────────────────────────
// Full-screen overlay (same shell as WalkthroughOverlay: fixed inset-0,
// safe-area padding, Close/action header) rather than the bottom sheets
// used elsewhere in this file — this is a scrolling list, not a quick
// confirm, so it gets the full-screen treatment.
function fmtSetRange(sets: WorkoutSet[]): string {
  const reps = sets.map((s) => s.reps);
  const min = Math.min(...reps), max = Math.max(...reps);
  return `${sets.length} sets x ${min === max ? min : `${min}-${max}`} reps`;
}

function ExerciseThumb({ done }: { done: boolean }) {
  return (
    <span className="relative h-14 w-14 shrink-0 rounded-card flex items-center justify-center bg-surface-raised text-fg-tertiary">
      <Dumbbell className="h-6 w-6" />
      {done && (
        <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-action-accent text-fg-onAccent flex items-center justify-center border-2 border-bg-base">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </span>
  );
}

function ExerciseListOverlay({
  open, exercises, currentExIdx, onClose, onSelectExercise, onCustomize,
}: {
  open: boolean;
  exercises: WorkoutExercise[];
  currentExIdx: number;
  onClose: () => void;
  onSelectExercise: (idx: number) => void;
  onCustomize: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const current = exercises[currentExIdx];
  const isDone = (ex: WorkoutExercise) => ex.sets.length > 0 && ex.sets.every((s) => s.done);
  const completed = exercises.filter((ex) => ex.id !== current?.id && isDone(ex));
  // every not-yet-done exercise other than the current one, in original
  // order — NOT limited to array positions after currentExIdx, since
  // jumping ahead to a later exercise must not drop earlier undone ones
  const next = exercises.filter((ex) => ex.id !== current?.id && !isDone(ex));

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-bg-base text-fg-primary"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-between px-5 pt-5 max-w-md mx-auto w-full shrink-0">
        <button onClick={onClose} className="text-[14px] font-semibold text-fg-secondary">Close</button>
        <button onClick={onCustomize} className="text-[14px] font-semibold text-action-accent">Customize</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-md mx-auto w-full space-y-6">
        <h1 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.01em] text-fg-primary">Exercise List</h1>

        {completed.length > 0 && (
          <section>
            <h2 className="mb-2 text-[13px] font-medium text-fg-tertiary">Completed Exercises</h2>
            <ul className="space-y-2">
              {completed.map((ex) => (
                <li key={ex.id} className="rounded-card border border-line-subtle bg-surface-card">
                  <ListRow
                    title={ex.name}
                    subtitle={ex.sets.map((s) => `${s.weightKg} x ${s.reps}`).join(' | ')}
                    leading={<ExerciseThumb done />}
                    chevron={false}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {current && (
          <section>
            <h2 className="mb-2 text-[13px] font-medium text-amber-400">Current Exercise</h2>
            <ul>
              <li className="rounded-card border border-[rgba(226,96,63,.35)] bg-surface-card">
                <ListRow
                  title={current.name}
                  subtitle={fmtSetRange(current.sets)}
                  leading={<ExerciseThumb done={isDone(current)} />}
                  chevron={false}
                />
              </li>
            </ul>
          </section>
        )}

        {next.length > 0 && (
          <section>
            <h2 className="mb-2 text-[13px] font-medium text-fg-tertiary">Next Exercises</h2>
            <ul className="space-y-2">
              {next.map((ex) => {
                const idx = exercises.findIndex((e) => e.id === ex.id);
                return (
                  <li key={ex.id} className="rounded-card border border-line-subtle bg-surface-card">
                    <ListRow
                      title={ex.name}
                      subtitle={fmtSetRange(ex.sets)}
                      leading={<ExerciseThumb done={false} />}
                      onClick={() => { onSelectExercise(idx); onClose(); }}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

// ── customise-exercise sheet ────────────────────────────────────────
// Set-count editor for the active exercise. Same shell as ConfirmSheet
// (backdrop, slide-up panel, escape-to-close) — content differs so it's
// its own component rather than reusing ConfirmSheet directly.
function CustomizeExerciseSheet({
  open, exName, value, min, max, onChange, onClose,
}: {
  open: boolean;
  exName: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-bg-scrim" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-sheet-title"
        className="relative w-full max-w-md rounded-t-sheet border border-line-subtle bg-surface-card p-5
          pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-sheet duration-sheet ease-out
          animate-in slide-in-from-bottom sm:rounded-card sm:pb-5"
      >
        <p id="customize-sheet-title" className="font-display text-[17px] font-semibold leading-snug text-fg-primary">
          {exName}
        </p>
        <Stepper value={value} min={min} max={max} unit="sets" onChange={onChange} className="mt-4" />
        <div className="mt-5">
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

export default function Tracker({
  workoutId, restTimer, session, onMinimize, onExit, onFinished,
}: { workoutId: string; restTimer: RestTimer; session: SessionView; onMinimize: () => void; onExit: () => void; onFinished: () => void }) {
  const { userWorkouts, userCustomWorkouts, dispatch } = useStore();
  const workout = userWorkouts.find((w) => w.id === workoutId);

  const [now, setNow] = useState(Date.now());
  const { restSecs, setRestSecs, restEnd, restDuration, restKind } = restTimer;
  const { currentExIdx, setCurrentExIdx, sessionPhase, setSessionPhase } = session;
  const [newEx, setNewEx] = useState('');
  const [summary, setSummary] = useState<{ min: number; volume: number; sets: number; goal?: number } | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [exerciseListOpen, setExerciseListOpen] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);

  // cardio countdown state
  const [targetMin, setTargetMin] = useState<number | null>(null);
  const [customMin, setCustomMin] = useState('');
  const [leftSec, setLeftSec] = useState<number | null>(null); // remaining when paused / before start
  const [runEnd, setRunEnd] = useState<number | null>(null);   // timestamp when countdown hits 0
  const cardioDone = useRef(false);

  const libItem =
    WORKOUT_LIBRARY.find((l) => l.id === workout?.libraryId) ??
    userCustomWorkouts.find((c) => c.id === workout?.libraryId);
  const isCardio = !!workout && !libItem?.plan?.length && CARDIO_TYPES.has(workout.type);

  // 1s tick for elapsed + countdowns
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // The rest timer beeps and clears itself (see useRestTimer). What's left
  // here is view-only: when a countdown runs out while this screen is
  // showing a fully-done exercise, move on to the next one. Expiries from
  // before this mount are ignored, so this is a no-op while unmounted.
  const seenExpiry = useRef(restTimer.lastExpiry);
  useEffect(() => {
    if (restTimer.lastExpiry === seenExpiry.current) return;
    seenExpiry.current = restTimer.lastExpiry;
    const exs = workout?.exercises ?? [];
    const idx = Math.min(currentExIdx, Math.max(0, exs.length - 1));
    const ex = exs[idx];
    const done = ex ? ex.sets.filter((s) => s.done).length : 0;
    if (ex && ex.sets.length > 0 && done === ex.sets.length && idx < exs.length - 1) {
      setCurrentExIdx(idx + 1);
    }
  }, [restTimer.lastExpiry, workout, currentExIdx, setCurrentExIdx]);

  // cardio countdown completion
  useEffect(() => {
    if (runEnd && now >= runEnd && !cardioDone.current) {
      cardioDone.current = true;
      beep(3);
      setRunEnd(null);
      setLeftSec(0);
    }
  }, [now, runEnd]);

  const save = (patch: Partial<Workout>) => {
    if (workout) dispatch({ type: 'saveWorkout', workout: { ...workout, ...patch } });
  };

  // most recent performance of an exercise across past sessions
  const lastPerf = (name: string): { weightKg: number; reps: number } | null => {
    const norm = (n: string) => n.trim().toLowerCase().replace(/\s*\(reps = [^)]*\)\s*/gi, '');
    const key = norm(name);
    const past = [...userWorkouts]
      .filter((w) => w.id !== workoutId && w.exercises?.length)
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
    for (const w of past) {
      for (const e of w.exercises ?? []) {
        if (norm(e.name) === key && e.sets.length) {
          const s = [...e.sets].reverse().find((x) => x.done) ?? e.sets[e.sets.length - 1];
          return { weightKg: s.weightKg, reps: s.reps };
        }
      }
    }
    return null;
  };

  // seed session on first open; clear the paused marker when resuming
  useEffect(() => {
    if (workout && !workout.startedAt) {
      const plan =
        WORKOUT_LIBRARY.find((l) => l.id === workout.libraryId)?.plan ??
        userCustomWorkouts.find((c) => c.id === workout.libraryId)?.plan ??
        [];
      const exercises: WorkoutExercise[] = plan.map((p) => {
        const last = lastPerf(p.name);
        const base = { reps: last?.reps ?? p.reps, weightKg: last?.weightKg ?? 0 };
        return {
          id: uid(),
          name: p.name,
          sets: makeSets(p.sets, base, isSingleArmExercise(p.name)),
        };
      });
      save({ startedAt: localISO(new Date()), exercises });
    } else if (workout?.exitedAt) {
      save({ exitedAt: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout?.id]);

  // exit = pause: keep the session data, stop auto-resuming until Start is tapped again
  const exit = () => {
    save({ exitedAt: localISO(new Date()) });
    onExit();
  };

  const exercises = workout?.exercises ?? [];

  const stats = useMemo(() => {
    let volume = 0, reps = 0, sets = 0;
    for (const e of exercises) for (const s of e.sets) {
      if (!s.done) continue;
      volume += s.weightKg * s.reps;
      reps += s.reps;
      sets += 1;
    }
    return { volume, reps, sets };
  }, [exercises]);

  const totalSets = useMemo(() => exercises.reduce((t, e) => t + e.sets.length, 0), [exercises]);

  // clamp for read/nav so an out-of-range index (e.g. after removeExercise) self-heals without a setState-in-effect
  const safeExIdx = Math.min(currentExIdx, Math.max(0, exercises.length - 1));
  const currentEx = exercises[safeExIdx];
  const currentDoneCount = currentEx ? currentEx.sets.filter((s) => s.done).length : 0;
  const currentTotalSets = currentEx ? currentEx.sets.length : 0;

  // if the workout vanished mid-session (deleted elsewhere), leave
  useEffect(() => {
    if (!workout) onExit();
  }, [workout, onExit]);

  if (!workout) return null;

  const startMs = workout.startedAt ? new Date(workout.startedAt).getTime() : now;
  const elapsedSec = Math.max(0, Math.floor((now - startMs) / 1000));
  const restLeft = restEnd ? Math.max(0, Math.ceil((restEnd - now) / 1000)) : null;

  const setSet = (exId: string, idx: number, patch: Partial<{ reps: number; weightKg: number; done: boolean }>) => {
    save({
      exercises: exercises.map((e) =>
        e.id !== exId ? e : { ...e, sets: e.sets.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }
      ),
    });
  };

  const toggleDone = (exId: string, idx: number) => {
    const ex = exercises.find((e) => e.id === exId);
    const set = ex?.sets[idx];
    if (!set) return;
    const done = !set.done;
    setSet(exId, idx, { done });
    if (done) {
      // single-arm: the left side of a pair gets a short fixed transition
      // to switch sides (not the user's chosen rest duration); only the
      // right entry starts the normal rest timer
      if (set.side === 'left') restTimer.start('transition', 10);
      else restTimer.start('rest', restSecs);

      // that was the exercise's final set → auto-advance the view to the
      // next exercise shortly after, giving the checkmark a moment to
      // register. The rest timer above is untouched by this view change.
      const exIdxNow = exercises.findIndex((e) => e.id === exId);
      const allDone = ex.sets.every((s, i) => (i === idx ? true : s.done));
      if (allDone && exIdxNow >= 0 && exIdxNow < exercises.length - 1) {
        setTimeout(() => {
          setCurrentExIdx((i) => (i === exIdxNow ? exIdxNow + 1 : i));
        }, 500);
      }
    }
  };

  const addSet = (exId: string) => {
    const ex = exercises.find((e) => e.id === exId);
    if (!ex) return;
    const last = ex.sets[ex.sets.length - 1];
    const base = { reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 0 };
    const newSets = makeSets(1, base, isSingleArmExercise(ex.name));
    save({
      exercises: exercises.map((e) => (e.id !== exId ? e : { ...e, sets: [...e.sets, ...newSets] })),
    });
  };

  const removeSet = (exId: string) => {
    save({
      exercises: exercises.map((e) => {
        if (e.id !== exId) return e;
        const n = isSingleArmExercise(e.name) ? 2 : 1;
        return { ...e, sets: e.sets.slice(0, Math.max(0, e.sets.length - n)) };
      }),
    });
  };

  const removeExercise = (exId: string) => save({ exercises: exercises.filter((e) => e.id !== exId) });

  // shared by the free-text input and the exercise picker, so both add an
  // exercise the exact same way — same suggested weight/reps, and the
  // single-arm/dumbbell heuristics apply identically either way since both
  // just resolve to a name
  const addExerciseNamed = (name: string) => {
    const last = lastPerf(name);
    const base = { reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 0 };
    save({
      exercises: [...exercises, { id: uid(), name, sets: makeSets(1, base, isSingleArmExercise(name)) }],
    });
  };

  const addExercise = () => {
    const name = newEx.trim();
    if (!name) return;
    addExerciseNamed(name);
    setNewEx('');
  };

  const finish = () => {
    const min = Math.max(1, Math.round(elapsedSec / 60));
    save({ completed: true, finishedAt: localISO(new Date()), durationMin: min });
    restTimer.clear();
    setSummary({ min, volume: stats.volume, sets: stats.sets, goal: isCardio ? (targetMin ?? workout.durationMin) : undefined });
  };

  const skipRest = () => restTimer.clear();
  const adjustRest = (deltaMs: number) => restTimer.adjust(deltaMs);

  // ── completion summary ────────────────────────────────────────────
  if (summary) {
    return (
      <div
        className="min-h-dvh bg-bg-base text-fg-primary flex flex-col items-center justify-center px-6"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-action-accent flex items-center justify-center mb-5 shadow-glow-accent">
            <Check className="h-9 w-9 text-fg-onAccent" strokeWidth={3} />
          </div>
          <h1 className="font-display text-[40px] font-bold leading-tight tracking-[-0.02em] mb-2">Workout complete</h1>
          <p className="text-fg-tertiary text-[14px] mb-8">{workout.type} · logged to your progress</p>
          {summary.goal ? (
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="rounded-card bg-surface-card border border-line-subtle py-4">
                <p className="readout text-3xl text-fg-primary">{summary.min}</p>
                <p className="text-[12px] text-fg-tertiary mt-1">minutes done</p>
              </div>
              <div className="rounded-card bg-surface-card border border-line-subtle py-4">
                <p className="readout text-3xl text-fg-primary">{summary.goal}</p>
                <p className="text-[12px] text-fg-tertiary mt-1">minute goal</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-card bg-surface-card border border-line-subtle py-4">
                <p className="readout text-3xl text-fg-primary">{summary.min}</p>
                <p className="text-[12px] text-fg-tertiary mt-1">minutes</p>
              </div>
              <div className="rounded-card bg-surface-card border border-line-subtle py-4">
                <p className="readout text-3xl text-fg-primary">{summary.sets}</p>
                <p className="text-[12px] text-fg-tertiary mt-1">sets done</p>
              </div>
              <div className="rounded-card bg-surface-card border border-line-subtle py-4">
                <p className="readout text-3xl text-fg-primary">{summary.volume >= 1000 ? `${(summary.volume / 1000).toFixed(1)}t` : summary.volume}</p>
                <p className="text-[12px] text-fg-tertiary mt-1">kg lifted</p>
              </div>
            </div>
          )}
          <Button variant="accent" size="lg" fullWidth onClick={onFinished}>View my progress</Button>
        </div>
      </div>
    );
  }

  // ── cardio session: duration countdown ────────────────────────────
  if (isCardio) {
    const goal = targetMin ?? workout.durationMin ?? 20;
    const remaining = runEnd ? Math.max(0, Math.ceil((runEnd - now) / 1000)) : (leftSec ?? goal * 60);
    const running = runEnd !== null;
    const finished0 = leftSec === 0 && !running;
    const pct = goal > 0 ? Math.min(1, 1 - remaining / (goal * 60)) : 0;
    const R = 92, C = 2 * Math.PI * R;

    const pickMin = (m: number) => { setTargetMin(m); setLeftSec(m * 60); setRunEnd(null); cardioDone.current = false; };
    const startPause = () => {
      if (running) { setLeftSec(Math.max(0, Math.ceil((runEnd - now) / 1000))); setRunEnd(null); }
      else {
        cardioDone.current = false;
        const secs = leftSec ?? goal * 60;
        if (secs <= 0) { setLeftSec(goal * 60); setRunEnd(Date.now() + goal * 60 * 1000); }
        else setRunEnd(Date.now() + secs * 1000);
      }
    };
    const adjust = (delta: number) => {
      if (running) setRunEnd((r) => (r ? Math.max(Date.now(), r + delta * 1000) : r));
      else setLeftSec((l) => Math.max(0, (l ?? goal * 60) + delta));
    };
    const resetTimer = () => { setRunEnd(null); setLeftSec(goal * 60); cardioDone.current = false; };

    return (
      <div className="min-h-dvh bg-bg-base text-fg-primary flex flex-col">
        <header className="sticky top-0 z-10 bg-bg-base/95 backdrop-blur border-b border-line-subtle" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="mx-auto max-w-md px-5 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <button onClick={exit} className="flex items-center gap-1 text-[14px] text-fg-secondary font-semibold">
                <X className="h-4 w-4" /> Exit
              </button>
              <p className="font-bold flex items-center gap-1.5"><Dumbbell className="h-4 w-4 text-amber-400" />{workout.type}</p>
              <span className="w-10" />
            </div>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-md px-5 pt-6 pb-40 flex flex-col items-center">
          <p className="text-[12px] font-semibold text-fg-tertiary uppercase tracking-wider mb-4">Elapsed {fmtElapsed(elapsedSec)}</p>

          {/* big circular countdown */}
          <div className={`relative h-64 w-64 flex items-center justify-center rounded-full transition-colors ${
            finished0 ? 'shadow-glow-accent' : ''
          }`}>
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="100" cy="100" r={R} fill="none" stroke="currentColor" strokeWidth="10" className="text-data-track" />
              <circle
                cx="100" cy="100" r={R} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear text-action-accent"
              />
            </svg>
            <div className="flex flex-col items-center">
              <p className="text-[12px] font-bold text-fg-tertiary uppercase tracking-wider mb-1">
                {finished0 ? 'Time up' : running ? 'Remaining' : 'Ready'}
              </p>
              <p className={`readout text-6xl ${finished0 ? 'text-amber-400' : 'text-fg-primary'}`}>
                {fmtElapsed(remaining)}
              </p>
              <p className="text-[12px] text-fg-disabled mt-1">of {goal} min goal</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => adjust(-60)} className="rounded-control bg-surface-card border border-line-subtle px-4 py-2.5 text-[12px] font-bold text-fg-body hover:bg-surface-hover">−1m</button>
            <button
              onClick={startPause}
              className={`rounded-card px-8 py-3.5 font-bold flex items-center gap-2 active:scale-[0.97] transition-transform shadow-lg ${
                running ? 'bg-surface-raised text-fg-primary shadow-black/20' : 'bg-action-accent text-fg-onAccent shadow-glow-accent'
              }`}
            >
              {running ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> {leftSec !== null && leftSec < goal * 60 && leftSec > 0 ? 'Resume' : 'Start'}</>}
            </button>
            <button onClick={() => adjust(60)} className="rounded-control bg-surface-card border border-line-subtle px-4 py-2.5 text-[12px] font-bold text-fg-body hover:bg-surface-hover">+1m</button>
          </div>
          {(running || (leftSec !== null && leftSec !== goal * 60)) && (
            <button onClick={resetTimer} className="mt-3 text-[12px] text-fg-tertiary flex items-center gap-1 mx-auto">
              <RotateCcw className="h-3 w-3" /> Reset to {goal} min
            </button>
          )}

          {/* duration picker (only before start) */}
          {!running && (
            <div className="w-full mt-8">
              <p className="text-[12px] font-semibold text-fg-tertiary uppercase tracking-wider mb-2">Duration</p>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_CHIPS.map((m) => (
                  <button key={m} onClick={() => pickMin(m)}
                    className={`rounded-control py-2.5 text-[14px] font-bold transition-colors ${
                      goal === m ? 'bg-action-accent text-fg-onAccent' : 'bg-surface-card border border-line-subtle text-fg-tertiary'
                    }`}>
                    {m}m
                  </button>
                ))}
                <div className="flex items-center rounded-control bg-surface-card border border-line-subtle px-2">
                  <input
                    type="number" inputMode="numeric" min={1} max={300}
                    value={customMin}
                    placeholder="min"
                    onChange={(e) => {
                      setCustomMin(e.target.value);
                      const v = Math.max(1, Math.min(300, Number(e.target.value) || 0));
                      if (e.target.value) pickMin(v);
                    }}
                    className="w-full bg-transparent py-2.5 text-center text-[14px] font-bold outline-none placeholder:text-fg-disabled text-fg-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        <div className="fixed bottom-0 inset-x-0 z-10 bg-bg-base/95 backdrop-blur border-t border-line-subtle pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-md px-5 py-3">
            <Button variant="accent" size="lg" fullWidth icon={Flag} onClick={finish}>
              {finished0 ? 'Log it, done!' : 'Finish early'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── strength session: warm-up / cooldown screens ──────────────────
  if (sessionPhase === 'warmup') {
    return (
      <SessionPhaseScreen
        key="warmup"
        title="Warm up first"
        defs={WARMUP_ITEMS}
        now={now}
        actionLabel="Start workout"
        actionIcon={Play}
        onAction={() => setSessionPhase('exercises')}
        skipLabel="Skip warm-up"
        onExit={exit}
      />
    );
  }
  if (sessionPhase === 'cooldown') {
    return (
      <SessionPhaseScreen
        key="cooldown"
        title="Cool down"
        defs={COOLDOWN_ITEMS}
        now={now}
        actionLabel="Finish workout"
        actionIcon={Flag}
        onAction={finish}
        skipLabel="Skip cool-down"
        onExit={exit}
      />
    );
  }

  // light/recovery sessions finish immediately; everything else cools down first
  const onFinishTap = () => (workout.intensity === 'light' ? finish() : setSessionPhase('cooldown'));

  // ── strength session: sets × reps ─────────────────────────────────
  return (
    <div className="min-h-dvh bg-bg-base text-fg-primary flex flex-col">
      {/* header stats */}
      <header className="sticky top-0 z-10 bg-bg-base/95 backdrop-blur border-b border-line-subtle" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto max-w-md px-4 pt-3 pb-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-3">
            <div className="flex items-center gap-3">
              <button onClick={exit} className="flex items-center gap-1 text-[14px] text-fg-secondary font-semibold">
                <X className="h-4 w-4" /> Exit
              </button>
              <button onClick={onMinimize} aria-label="Minimize workout" className="text-fg-tertiary">
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
            <p className="font-bold text-[14px] flex items-center gap-1.5"><Dumbbell className="h-4 w-4 text-amber-400" />{workout.type}</p>
            <button onClick={() => setExerciseListOpen(true)} className="justify-self-end text-[14px] text-fg-secondary font-semibold">
              Exercises
            </button>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line-subtle rounded-card bg-surface-card border border-line-subtle py-2.5">
            <MetricTile label="Time" value={fmtElapsed(elapsedSec)} size="sm" className="items-center" />
            <MetricTile label="Volume" value={stats.volume} unit="kg" size="sm" className="items-center" />
            <MetricTile label="Sets" value={`${stats.sets}/${totalSets}`} size="sm" className="items-center" />
          </div>
        </div>
      </header>

      {/* floating overlay — stays put above the content while resting */}
      {restLeft !== null && (
        <div className="fixed inset-x-0 top-24 z-30 flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto">
            <RestRing restLeft={restLeft} restDuration={restDuration} variant={restKind} onAdjust={adjustRest} onSkip={skipRest} />
          </div>
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-md px-4 pt-4 pb-40 space-y-3">
        {exercises.length === 0 && (
          <div className="rounded-sheet border border-dashed border-line-subtle py-10 text-center">
            <Dumbbell className="h-6 w-6 text-fg-disabled mx-auto mb-2" />
            <p className="text-[14px] text-fg-tertiary">No exercises yet. Add your first one below.</p>
          </div>
        )}

        {exercises.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setCurrentExIdx(Math.max(0, safeExIdx - 1))}
              disabled={safeExIdx === 0}
              className="flex items-center gap-1 rounded-control bg-surface-card border border-line-subtle px-3.5 py-2 text-[12px] font-bold text-fg-body hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              onClick={() => setCurrentExIdx(Math.min(exercises.length - 1, safeExIdx + 1))}
              disabled={safeExIdx >= exercises.length - 1}
              className="flex items-center gap-1 rounded-control bg-surface-card border border-line-subtle px-3.5 py-2 text-[12px] font-bold text-fg-body hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {currentEx && (() => {
          const ex = currentEx;
          const exIdx = safeExIdx;
          const last = lastPerf(ex.name);
          const doneCount = ex.sets.filter((s) => s.done).length;
          const exComplete = ex.sets.length > 0 && doneCount === ex.sets.length;
          const isDumbbell = /dumbbell/i.test(ex.name);
          const isSingleArm = isSingleArmExercise(ex.name);
          return (
            <section
              key={ex.id}
              className={`rounded-sheet bg-surface-card border p-4 shadow-lg shadow-black/20 transition-colors duration-fast ease-standard ${
                exComplete ? 'border-[rgba(226,96,63,.35)]' : 'border-line-subtle'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`h-11 w-11 shrink-0 rounded-card flex items-center justify-center ${
                    exComplete ? 'bg-action-accent-quiet text-amber-400' : 'bg-surface-raised text-fg-tertiary'
                  }`}>
                    {exComplete ? <Check className="h-5 w-5" strokeWidth={3} /> : <Dumbbell className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg-tertiary">
                      Exercise {exIdx + 1}/{exercises.length}
                    </p>
                    <h2 className="font-bold text-[15px] leading-tight truncate text-fg-primary">{ex.name}</h2>
                  </div>
                </div>
                <button onClick={() => removeExercise(ex.id)} className="p-1.5 text-fg-disabled hover:text-feedback-danger shrink-0" aria-label="Remove exercise">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {last && last.weightKg > 0 && (
                <p className="text-[12px] text-fg-tertiary mb-3 ml-14">
                  Last time <span className="text-fg-body font-semibold font-mono">{last.weightKg} kg × {last.reps}</span>
                </p>
              )}

              <div className="grid grid-cols-[28px_1fr_1fr_40px] gap-2 text-[10px] text-fg-disabled font-bold uppercase tracking-wider mb-1.5 px-0.5">
                <span>Set</span>
                <span className="text-center">
                  Kg
                  {isDumbbell && (
                    <span className="block normal-case font-medium tracking-normal text-fg-disabled/80">per dumbbell</span>
                  )}
                </span>
                <span className="text-center">Reps</span><span />
              </div>
              <ul>
                {ex.sets.map((s, i) => {
                  // single-arm pairs (left,right) sit tight against each other;
                  // extra breathing room goes before the next pair's left side
                  const gapClass = i === 0 ? '' : isSingleArm ? (i % 2 === 0 ? 'mt-3' : 'mt-1') : 'mt-1.5';
                  return (
                  <li
                    key={i}
                    className={`${gapClass} grid grid-cols-[28px_1fr_1fr_40px] gap-2 items-center rounded-card px-2.5 py-2 transition-colors duration-fast ease-standard ${
                      s.done ? 'bg-action-accent-quiet border border-[rgba(226,96,63,.3)]' : 'bg-surface-inset/60 border border-line-subtle'
                    }`}
                  >
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                      s.done ? 'bg-action-accent text-fg-onAccent' : 'bg-surface-raised text-fg-tertiary'
                    }`}>
                      {s.side === 'left' ? 'L' : s.side === 'right' ? 'R' : i + 1}
                    </span>
                    <div className="flex flex-col items-center">
                      <input
                        type="number" inputMode="decimal" min={0} value={s.weightKg || ''} placeholder="0"
                        onChange={(e) => setSet(ex.id, i, { weightKg: Math.max(0, Number(e.target.value) || 0) })}
                        onFocus={(e) => e.target.select()}
                        className={`w-full bg-transparent text-center text-[17px] font-bold font-mono outline-none ${
                          s.done ? 'text-fg-primary' : 'text-fg-body'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <input
                        type="number" inputMode="numeric" min={0} value={s.reps || ''} placeholder="0"
                        onChange={(e) => setSet(ex.id, i, { reps: Math.max(0, Number(e.target.value) || 0) })}
                        onFocus={(e) => e.target.select()}
                        className={`w-full bg-transparent text-center text-[17px] font-bold font-mono outline-none ${
                          s.done ? 'text-fg-primary' : 'text-fg-body'
                        }`}
                      />
                    </div>
                    <button
                      onClick={() => toggleDone(ex.id, i)}
                      className={`h-9 w-9 rounded-control flex items-center justify-center transition-all active:scale-90 ${
                        s.done ? 'bg-action-accent shadow-md shadow-[rgba(226,96,63,.3)]' : 'bg-surface-raised border border-line-default'
                      }`}
                      aria-label="Mark set done"
                    >
                      <Check className={`h-4 w-4 ${s.done ? 'text-fg-onAccent' : 'text-fg-disabled'}`} strokeWidth={3} />
                    </button>
                  </li>
                  );
                })}
              </ul>
              <button onClick={() => addSet(ex.id)}
                className="mt-2.5 w-full rounded-control border border-dashed border-line-strong py-2 text-[12px] font-semibold text-fg-tertiary hover:bg-surface-hover flex items-center justify-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add set
              </button>
            </section>
          );
        })()}

        {/* add exercise */}
        <div className="flex gap-2 pt-1">
          <input
            value={newEx} onChange={(e) => setNewEx(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExercise()}
            placeholder="Add exercise (e.g. Bench Press)"
            className="flex-1 rounded-sheet bg-surface-card border border-line-subtle px-4 py-3 text-[14px] text-fg-primary outline-none focus:border-line-focus placeholder:text-fg-disabled"
          />
          <button onClick={addExercise} className="rounded-sheet bg-surface-card border border-line-subtle px-4 text-amber-400 hover:bg-surface-hover" aria-label="Add exercise">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={() => setExercisePickerOpen(true)}
          className="w-full rounded-control border border-dashed border-line-strong py-2.5 text-[12px] font-semibold text-fg-tertiary hover:bg-surface-hover flex items-center justify-center gap-1.5"
        >
          <Search className="h-3.5 w-3.5" /> Browse exercises
        </button>

        {currentEx && (
          <button
            onClick={() => setCustomizeOpen(true)}
            className="w-full rounded-control border border-dashed border-line-strong py-2.5 text-[12px] font-semibold text-fg-tertiary hover:bg-surface-hover flex items-center justify-center gap-1.5"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Customise exercise
          </button>
        )}
      </main>

      {/* bottom: rest presets (when not resting) + finish */}
      <div className="fixed bottom-0 inset-x-0 z-10 bg-bg-base/95 backdrop-blur border-t border-line-subtle pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-md px-4 py-2.5 space-y-2">
          {restLeft === null && (
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-fg-tertiary shrink-0" />
              <span className="text-[10px] text-fg-tertiary mr-0.5 uppercase font-semibold">Rest</span>
              {REST_OPTIONS.map((s) => (
                <button key={s} onClick={() => setRestSecs(s)}
                  className={`flex-1 rounded-control py-1.5 text-[11px] font-bold transition-colors duration-fast ease-standard ${
                    restSecs === s ? 'bg-action-accent text-fg-onAccent' : 'bg-surface-card border border-line-subtle text-fg-tertiary'
                  }`}>
                  {s}s
                </button>
              ))}
            </div>
          )}
          <Button variant="accent" size="lg" fullWidth icon={Flag} iconAfter={ChevronRight} onClick={onFinishTap}>
            Finish workout
          </Button>
        </div>
      </div>

      <CustomizeExerciseSheet
        open={customizeOpen && !!currentEx}
        exName={currentEx?.name ?? ''}
        value={currentTotalSets}
        min={currentDoneCount}
        max={20}
        onChange={(v) => {
          if (!currentEx) return;
          if (v > currentEx.sets.length) addSet(currentEx.id);
          else if (v < currentEx.sets.length) removeSet(currentEx.id);
        }}
        onClose={() => setCustomizeOpen(false)}
      />

      <ExerciseListOverlay
        open={exerciseListOpen}
        exercises={exercises}
        currentExIdx={safeExIdx}
        onClose={() => setExerciseListOpen(false)}
        onSelectExercise={(idx) => setCurrentExIdx(idx)}
        onCustomize={() => {}}
      />

      {exercisePickerOpen && (
        <ExercisePicker
          onSelect={(exercise) => { addExerciseNamed(exercise.name); setExercisePickerOpen(false); }}
          onClose={() => setExercisePickerOpen(false)}
        />
      )}
    </div>
  );
}
