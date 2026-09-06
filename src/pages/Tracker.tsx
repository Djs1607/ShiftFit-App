import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Check, Trash2, Timer, Flag, Play, Pause, RotateCcw, Dumbbell, ChevronRight, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import { localISO } from '../lib/schedule';
import { WORKOUT_LIBRARY } from '../lib/library';
import { Button, ConfirmSheet, MetricTile, Stepper } from '../components/ds';
import type { Workout, WorkoutExercise } from '../lib/types';

const REST_OPTIONS = [30, 60, 90, 120, 180];
const CARDIO_TYPES = new Set(['Run', 'Walk', 'Cycle', 'Swim', 'Cardio', 'Row']);
const DURATION_CHIPS = [5, 10, 15, 20, 30, 45, 60];

function fmtElapsed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

function beep(times = 1) {
  try {
    const ctx = new AudioContext();
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      const t0 = ctx.currentTime + i * 0.35;
      g.gain.setValueAtTime(0.15, t0);
      o.start(t0);
      o.stop(t0 + 0.25);
    }
    setTimeout(() => ctx.close(), 400 + times * 350);
  } catch { /* audio unavailable */ }
  try { navigator.vibrate?.(times > 1 ? [200, 100, 200] : 200); } catch { /* no vibration */ }
}

// ── circular rest-timer ring ─────────────────────────────────────────
// Highly visible, sits right under the header so it's reachable mid-set
// without scrolling. Tap the ring itself to skip (plus explicit buttons
// for anyone who wants a bigger target).
function RestRing({
  restLeft, restDuration, onAdjust, onSkip,
}: { restLeft: number; restDuration: number; onAdjust: (deltaMs: number) => void; onSkip: () => void }) {
  const R = 50;
  const C = 2 * Math.PI * R;
  const frac = restDuration > 0 ? Math.min(1, Math.max(0, restLeft / restDuration)) : 0;
  const offset = C * (1 - frac);
  const hot = restLeft <= 5;

  return (
    <section className="rounded-sheet bg-surface-raised border border-[rgba(226,96,63,.3)] p-4 mb-4 shadow-lg shadow-black/30">
      <div className="flex items-center gap-4">
        <button
          onClick={onSkip}
          aria-label="Tap to skip rest"
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
            <Timer className="h-3.5 w-3.5" /> Resting
          </p>
          <p className="text-[14px] text-fg-secondary mb-3 leading-snug">Next set unlocks when the ring empties — or skip whenever you're ready.</p>
          <div className="flex items-center gap-2">
            <button onClick={() => onAdjust(-15000)} className="flex-1 rounded-control bg-surface-inset py-2 text-[12px] font-bold text-fg-body hover:bg-surface-hover">−15s</button>
            <button onClick={() => onAdjust(15000)} className="flex-1 rounded-control bg-surface-inset py-2 text-[12px] font-bold text-fg-body hover:bg-surface-hover">+15s</button>
            <button onClick={onSkip} className="flex-1 rounded-control bg-action-accent py-2 text-[12px] font-bold text-fg-onAccent active:scale-95 transition-transform">Skip</button>
          </div>
        </div>
      </div>
    </section>
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
  workoutId, onExit, onFinished,
}: { workoutId: string; onExit: () => void; onFinished: () => void }) {
  const { userWorkouts, userCustomWorkouts, dispatch } = useStore();
  const workout = userWorkouts.find((w) => w.id === workoutId);

  const [now, setNow] = useState(Date.now());
  const [restSecs, setRestSecs] = useState(90);
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [newEx, setNewEx] = useState('');
  const [summary, setSummary] = useState<{ min: number; volume: number; sets: number; goal?: number } | null>(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const beepedFor = useRef<number | null>(null);
  const restDurationRef = useRef(90);

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

  // rest-timer completion: beep, then move on to the next exercise if it's
  // now fully done (this is the only path that auto-advances silently —
  // it means the user was already sitting through a rest countdown)
  useEffect(() => {
    if (restEnd && now >= restEnd && beepedFor.current !== restEnd) {
      beepedFor.current = restEnd;
      beep();
      setRestEnd(null);
      const exs = workout?.exercises ?? [];
      const idx = Math.min(currentExIdx, Math.max(0, exs.length - 1));
      const ex = exs[idx];
      const done = ex ? ex.sets.filter((s) => s.done).length : 0;
      if (ex && ex.sets.length > 0 && done === ex.sets.length && idx < exs.length - 1) {
        setCurrentExIdx(idx + 1);
      }
    }
  }, [now, restEnd, workout, currentExIdx]);

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
        return {
          id: uid(),
          name: p.name,
          sets: Array.from({ length: p.sets }, () => ({
            reps: last?.reps ?? p.reps,
            weightKg: last?.weightKg ?? 0,
            done: false,
          })),
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

  // exercise just became fully done with no rest timer running (rest already
  // finished, was skipped, or sets were removed down to the completed count)
  // → confirm before moving on, rather than silently jumping ahead.
  // A running timer is handled by the rest-completion effect above instead.
  useEffect(() => {
    if (currentTotalSets === 0 || currentDoneCount < currentTotalSets) {
      setPendingAdvance(false);
      return;
    }
    if (restEnd === null && safeExIdx < exercises.length - 1) {
      setPendingAdvance(true);
    }
  }, [currentDoneCount, currentTotalSets, restEnd, safeExIdx, exercises.length]);

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
      beepedFor.current = null;
      restDurationRef.current = restSecs;
      setRestEnd(Date.now() + restSecs * 1000);
    }
  };

  const addSet = (exId: string) => {
    const ex = exercises.find((e) => e.id === exId);
    const last = ex?.sets[ex.sets.length - 1];
    save({
      exercises: exercises.map((e) =>
        e.id !== exId ? e : { ...e, sets: [...e.sets, { reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 0, done: false }] }
      ),
    });
  };

  const removeSet = (exId: string) => {
    save({
      exercises: exercises.map((e) => (e.id !== exId ? e : { ...e, sets: e.sets.slice(0, -1) })),
    });
  };

  const removeExercise = (exId: string) => save({ exercises: exercises.filter((e) => e.id !== exId) });

  const addExercise = () => {
    const name = newEx.trim();
    if (!name) return;
    const last = lastPerf(name);
    save({
      exercises: [...exercises, { id: uid(), name, sets: [{ reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 0, done: false }] }],
    });
    setNewEx('');
  };

  const finish = () => {
    const min = Math.max(1, Math.round(elapsedSec / 60));
    save({ completed: true, finishedAt: localISO(new Date()), durationMin: min });
    setRestEnd(null);
    setSummary({ min, volume: stats.volume, sets: stats.sets, goal: isCardio ? (targetMin ?? workout.durationMin) : undefined });
  };

  const skipRest = () => { beepedFor.current = null; setRestEnd(null); };
  const adjustRest = (deltaMs: number) => setRestEnd((r) => (r ? Math.max(now + 1000, r + deltaMs) : r));

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
              {finished0 ? 'Log it — done!' : 'Finish early'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── strength session: sets × reps ─────────────────────────────────
  return (
    <div className="min-h-dvh bg-bg-base text-fg-primary flex flex-col">
      {/* header stats */}
      <header className="sticky top-0 z-10 bg-bg-base/95 backdrop-blur border-b border-line-subtle" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto max-w-md px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={exit} className="flex items-center gap-1 text-[14px] text-fg-secondary font-semibold">
              <X className="h-4 w-4" /> Exit
            </button>
            <p className="font-bold text-[14px] flex items-center gap-1.5"><Dumbbell className="h-4 w-4 text-amber-400" />{workout.type}</p>
            <span className="w-10" />
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
            <RestRing restLeft={restLeft} restDuration={restDurationRef.current} onAdjust={adjustRest} onSkip={skipRest} />
          </div>
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-md px-4 pt-4 pb-40 space-y-3">
        {exercises.length === 0 && (
          <div className="rounded-sheet border border-dashed border-line-subtle py-10 text-center">
            <Dumbbell className="h-6 w-6 text-fg-disabled mx-auto mb-2" />
            <p className="text-[14px] text-fg-tertiary">No exercises yet — add your first one below.</p>
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
                <span>Set</span><span className="text-center">Kg</span><span className="text-center">Reps</span><span />
              </div>
              <ul className="space-y-1.5">
                {ex.sets.map((s, i) => (
                  <li
                    key={i}
                    className={`grid grid-cols-[28px_1fr_1fr_40px] gap-2 items-center rounded-card px-2.5 py-2 transition-colors duration-fast ease-standard ${
                      s.done ? 'bg-action-accent-quiet border border-[rgba(226,96,63,.3)]' : 'bg-surface-inset/60 border border-line-subtle'
                    }`}
                  >
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                      s.done ? 'bg-action-accent text-fg-onAccent' : 'bg-surface-raised text-fg-tertiary'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex flex-col items-center">
                      <input
                        type="number" inputMode="decimal" min={0} value={s.weightKg || ''} placeholder="0"
                        onChange={(e) => setSet(ex.id, i, { weightKg: Math.max(0, Number(e.target.value) || 0) })}
                        className={`w-full bg-transparent text-center text-[17px] font-bold font-mono outline-none ${
                          s.done ? 'text-fg-primary' : 'text-fg-body'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <input
                        type="number" inputMode="numeric" min={0} value={s.reps || ''} placeholder="0"
                        onChange={(e) => setSet(ex.id, i, { reps: Math.max(0, Number(e.target.value) || 0) })}
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
                ))}
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
          <Button variant="accent" size="lg" fullWidth icon={Flag} iconAfter={ChevronRight} onClick={finish}>
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

      <ConfirmSheet
        open={pendingAdvance}
        title="Move to next exercise?"
        message={currentEx ? `You're all done with ${currentEx.name}.` : undefined}
        confirmLabel="Next exercise"
        danger={false}
        onConfirm={() => {
          setPendingAdvance(false);
          setCurrentExIdx((i) => Math.min(exercises.length - 1, i + 1));
        }}
        onCancel={() => setPendingAdvance(false)}
      />
    </div>
  );
}
