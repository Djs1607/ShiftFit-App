import { useMemo, useState } from 'react';
import { AlertTriangle, Moon, Sun, Check, Trash2, Dumbbell, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import { buildDayPlans, findOverlap, projectShifts, resolveDayShift, dateKey, fmtDayLabel, fmtTime, localISO } from '../lib/schedule';
import { WORKOUT_LIBRARY, type CustomWorkout, type LibraryWorkout } from '../lib/library';
import { IntensityDot, RecBadge } from '../components/Fatigue';
import TimePicker from '../components/TimePicker';
import LibraryCard from '../components/LibraryCard';
import WorkoutBuilder from './WorkoutBuilder';
import { EmptyState } from './Today';
import type { Tab } from '../App';
import type { Workout, WorkoutIntensity } from '../lib/types';

const TYPES = ['Strength', 'Run', 'Cycle', 'Swim', 'HIIT', 'Mobility', 'Walk', 'Other'];

const INTENSITY_RANK: Record<string, number> = { rest: 0, light: 1, moderate: 2, hard: 3 };

export default function Workouts({ go, onStart }: { go: (t: Tab) => void; onStart: (id: string) => void }) {
  const { user, activePattern, userWorkouts, userSleepLogs, userOverrides, userCustomWorkouts, dispatch } = useStore();

  const [date, setDate] = useState(dateKey(new Date()));
  const [time, setTime] = useState('17:00');
  const [type, setType] = useState(TYPES[0]);
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState<WorkoutIntensity>('moderate');
  const [override, setOverride] = useState(false);
  const [saved, setSaved] = useState(false);
  const [libFilter, setLibFilter] = useState<'today' | 'all'>('today');
  const [libId, setLibId] = useState<string | null>(null);
  const [builder, setBuilder] = useState<'new' | CustomWorkout | null>(null);

  const start = useMemo(() => {
    const [y, m, d] = date.split('-').map(Number);
    const [h, mi] = time.split(':').map(Number);
    return new Date(y, (m || 1) - 1, d || 1, h || 0, mi || 0);
  }, [date, time]);
  const end = useMemo(() => new Date(start.getTime() + duration * 60000), [start, duration]);

  const conflict = useMemo(
    () => (activePattern ? findOverlap(activePattern, start, end, userOverrides) : null),
    [activePattern, start, end, userOverrides]
  );

  // guardrail: warn when chosen intensity exceeds that day's recommendation
  const dayPlan = useMemo(() => {
    if (!activePattern) return null;
    const d = new Date(start); d.setHours(0, 0, 0, 0);
    return buildDayPlans(activePattern, d, d, userWorkouts, {
      sleepLogs: userSleepLogs,
      overrides: userOverrides,
    })[0] ?? null;
  }, [activePattern, start, userWorkouts, userSleepLogs, userOverrides]);

  const mismatch =
    dayPlan && INTENSITY_RANK[intensity] > INTENSITY_RANK[dayPlan.recommendation]
      ? dayPlan.recommendation
      : null;

  const lookupLib = (id: string | undefined): LibraryWorkout | undefined =>
    id ? WORKOUT_LIBRARY.find((l) => l.id === id) ?? userCustomWorkouts.find((c) => c.id === id) : undefined;

  // glanceable preview of a scheduled workout's contents
  const previewOf = (w: Workout): string => {
    const names = w.exercises?.length
      ? w.exercises.map((e) => e.name)
      : (lookupLib(w.libraryId)?.plan ?? []).map((p) => p.name);
    if (!names.length) return '';
    const shown = names.slice(0, 3).join(' · ');
    return names.length > 3 ? `${shown} +${names.length - 3}` : shown;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (conflict && !override) return; // blocked until user explicitly overrides
    const lib = lookupLib(libId ?? undefined);
    dispatch({
      type: 'saveWorkout',
      workout: {
        id: uid(), userId: user.id, datetime: localISO(start),
        type, durationMin: duration, intensity, completed: false,
        libraryId: lib?.id,
        notes: lib?.name,
      },
    });
    setOverride(false);
    setLibId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // today's recommendation drives which library sessions are suggested
  const todayPlan = useMemo(() => {
    if (!activePattern) return null;
    const from = new Date(); from.setHours(0, 0, 0, 0);
    return buildDayPlans(activePattern, from, from, userWorkouts, {
      sleepLogs: userSleepLogs,
      overrides: userOverrides,
    })[0];
  }, [activePattern, userWorkouts, userSleepLogs, userOverrides]);

  // custom workouts always visible (they're the user's own), then filtered built-ins
  const libraryItems = useMemo(() => {
    const builtins = WORKOUT_LIBRARY.filter((w) => libFilter === 'all' || w.level === todayPlan?.recommendation);
    return [...userCustomWorkouts, ...builtins] as (LibraryWorkout | CustomWorkout)[];
  }, [libFilter, todayPlan, userCustomWorkouts]);

  const useLibraryWorkout = (w: LibraryWorkout) => {
    setType(w.type);
    setDuration(w.durationMin);
    setIntensity(w.intensity);
    setOverride(false);
    setLibId(w.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // combined timeline: next 14 days
  const days = useMemo(() => {
    if (!activePattern) return [];
    const out: { key: string; label: string; items: { kind: 'shift' | 'workout'; time: number; node: React.ReactNode }[] }[] = [];
    const from = new Date(); from.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(from.getTime() + i * 86400000);
      const key = dateKey(d);
      const items: { kind: 'shift' | 'workout'; time: number; node: React.ReactNode }[] = [];

      const dayStart = new Date(d);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      const ov = userOverrides.find((o) => o.dateKey === key);
      const edited = !!ov;

      // shifts STARTING this day, honouring any override
      const shifts = ov
        ? ov.kind === 'off'
          ? []
          : [resolveDayShift(activePattern, dayStart, userOverrides)].filter((s) => s !== null)
        : projectShifts(activePattern, dayStart, dayEnd).filter(
            (s) => s.start.getTime() >= dayStart.getTime() && s.start.getTime() <= dayEnd.getTime()
          );

      if (edited && shifts.length === 0) {
        items.push({
          kind: 'shift', time: dayStart.getTime(),
          node: (
            <div key={'off' + i} className="flex items-center gap-3 rounded-xl bg-ink-800/50 border border-dashed border-ink-700 px-3.5 py-3">
              <span className="text-sm text-ink-500">Off <span className="text-caution-300/80 text-xs">(edited)</span></span>
            </div>
          ),
        });
      }

      for (const s of shifts) {
        items.push({
          kind: 'shift', time: s.start.getTime(),
          node: (
            <div key={'s' + i} className="flex items-center gap-3 rounded-xl bg-ink-800/50 border border-ink-800 px-3.5 py-3">
              <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${s.isNight ? 'bg-night-400/15 text-night-300' : 'bg-day-400/15 text-day-300'}`}>
                {s.isNight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </span>
              <span className="text-sm text-ink-300">
                Shift {fmtTime(s.start)} – {fmtTime(s.end)}
                <span className="text-ink-500 text-xs ml-2">{Math.round(s.lengthHours)}h</span>
                {edited && <span className="text-caution-300/80 text-xs ml-2">(edited)</span>}
              </span>
            </div>
          ),
        });
      }

      for (const w of userWorkouts.filter((w) => w.datetime.slice(0, 10) === key)) {
        items.push({
          kind: 'workout', time: new Date(w.datetime).getTime(),
          node: (
            <div key={w.id} className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${w.completed ? 'bg-shock-400/5 border-shock-400/20' : 'bg-ink-900 border-ink-700'}`}>
              <button
                onClick={() => dispatch({ type: 'toggleWorkout', id: w.id })}
                className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  w.completed ? 'bg-shock-400 border-shock-400' : 'border-ink-600'
                }`}
                aria-label="Toggle completed"
              >
                {w.completed && <Check className="h-4 w-4 text-ink-950" strokeWidth={3} />}
              </button>
              <span className={`text-sm flex-1 ${w.completed ? 'text-ink-500 line-through' : 'text-ink-100'}`}>
                <span className="font-semibold">{fmtTime(new Date(w.datetime))}</span> · {w.notes ?? w.type} · {w.durationMin}m
                <IntensityDot intensity={w.intensity} />
                <span className="text-xs text-ink-500 ml-1.5 capitalize">{w.intensity}</span>
                {previewOf(w) && (
                  <span className="block text-xs text-ink-500 mt-0.5 no-underline">{previewOf(w)}</span>
                )}
              </span>
              {!w.completed && (
                <button
                  onClick={() => onStart(w.id)}
                  className="shrink-0 rounded-lg bg-shock-400 text-ink-950 text-xs font-bold px-3 py-2 active:scale-[0.97]"
                >
                  {w.startedAt ? 'Resume' : 'Start'}
                </button>
              )}
              <button onClick={() => dispatch({ type: 'deleteWorkout', id: w.id })} className="p-1.5 text-ink-600 hover:text-cooked-400" aria-label="Delete workout">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ),
        });
      }

      if (items.length) {
        items.sort((a, b) => a.time - b.time);
        out.push({ key, label: i === 0 ? 'Today' : fmtDayLabel(d), items });
      }
    }
    return out;
  }, [activePattern, userWorkouts, userOverrides, dispatch]);

  // early returns come AFTER all hooks (React hook-order rules)
  if (!user) return null;

  if (!activePattern) {
    return <EmptyState title="Set up your rotation first" body="ShiftFit needs your shift pattern before it can schedule workouts around it." cta="Build my rotation" onCta={() => go('shifts')} />;
  }

  if (builder) {
    return (
      <WorkoutBuilder
        existing={builder === 'new' ? null : builder}
        userId={user.id}
        onDone={() => setBuilder(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-display font-semibold uppercase tracking-[0.06em]">Workouts</h1>

      {/* schedule form */}
      <form onSubmit={submit} className="rounded-2xl bg-ink-900 border border-ink-800 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-500 block mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="w-full rounded-xl bg-ink-800 border border-ink-700 px-3 py-3 text-sm outline-none [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-xs text-ink-500 block mb-1.5">Start time</label>
            <TimePicker value={time} onChange={setTime} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-500 block mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl bg-ink-800 border border-ink-700 px-3 py-3 text-sm outline-none">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-500 block mb-1.5">Duration (min)</label>
            <input type="number" min={5} max={600} step={5} value={duration}
              onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 0))}
              className="w-full rounded-xl bg-ink-800 border border-ink-700 px-3 py-3 text-sm outline-none" />
          </div>
        </div>

        <div>
          <label className="text-xs text-ink-500 block mb-1.5">Intensity</label>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'moderate', 'hard'] as const).map((lv) => (
              <button type="button" key={lv} onClick={() => setIntensity(lv)}
                className={`rounded-xl py-2.5 text-sm font-semibold capitalize transition-colors ${
                  intensity === lv ? 'bg-shock-400 text-ink-950' : 'bg-ink-800 text-ink-400'
                }`}>
                {lv}
              </button>
            ))}
          </div>
        </div>

        {mismatch && !conflict && (
          <div className="rounded-xl bg-caution-400/10 border border-caution-400/30 p-3.5">
            <p className="flex items-start gap-2 text-sm text-caution-300 font-semibold">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              That day looks like a {mismatch} day (fatigue {dayPlan?.fatigue}).
            </p>
            <button
              type="button"
              onClick={() => setIntensity(mismatch === 'rest' ? 'light' : mismatch)}
              className="mt-2 rounded-lg bg-caution-400/20 text-caution-300 text-xs font-bold px-3 py-1.5 active:bg-caution-400/30"
            >
              Switch to {mismatch === 'rest' ? 'light' : mismatch} instead
            </button>
          </div>
        )}

        {conflict && (
          <div className="rounded-xl bg-cooked-400/10 border border-cooked-400/30 p-3.5">
            <p className="flex items-start gap-2 text-sm text-cooked-300 font-semibold">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              Overlaps your shift {fmtTime(conflict.start)} – {fmtTime(conflict.end)}.
            </p>
            <label className="mt-2.5 flex items-center gap-2.5 text-xs text-ink-300 cursor-pointer">
              <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)}
                className="h-4 w-4 accent-cooked-400" />
              I know — schedule it anyway
            </label>
          </div>
        )}

        <button type="submit" disabled={!!conflict && !override}
          className={`w-full rounded-xl font-bold py-3.5 flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            conflict && !override
              ? 'bg-ink-800 text-ink-600 cursor-not-allowed'
              : 'bg-shock-400 text-ink-950'
          }`}>
          <Dumbbell className="h-5 w-5" strokeWidth={2.5} />
          {conflict && !override ? 'Blocked — overlaps a shift' : saved ? 'Scheduled ✓' : 'Schedule workout'}
        </button>
      </form>

      {/* workout library */}
      <section className="rounded-2xl bg-ink-900 border border-ink-800 p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">Workout library</h2>
          <div className="flex items-center gap-2">
            {todayPlan && <RecBadge rec={todayPlan.recommendation} />}
            <button
              onClick={() => setBuilder('new')}
              className="flex items-center gap-1 rounded-lg bg-shock-400 text-ink-950 text-xs font-bold px-3 py-2 active:scale-[0.97]"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> Create
            </button>
          </div>
        </div>
        <p className="text-xs text-ink-500 mb-3">
          {libFilter === 'today'
            ? `Suggested for today — ${todayPlan?.recommendation ?? 'any'} intensity fits your fatigue score.`
            : 'All sessions. Tap one to load it into the scheduler above.'}
        </p>
        <div className="flex rounded-xl bg-ink-800/60 p-1 mb-4">
          {(['today', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setLibFilter(f)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                libFilter === f ? 'bg-ink-700 text-ink-100' : 'text-ink-500'
              }`}>
              {f === 'today' ? 'For today' : 'All'}
            </button>
          ))}
        </div>
        <ul className="space-y-2.5">
          {libraryItems.map((w) => {
            const isCustom = 'userId' in w;
            return (
              <LibraryCard
                key={w.id}
                workout={w}
                custom={isCustom}
                onUse={useLibraryWorkout}
                onEdit={isCustom ? (cw) => setBuilder(cw) : undefined}
                onDelete={
                  isCustom
                    ? (cw) => { if (confirm(`Delete "${cw.name}"?`)) dispatch({ type: 'deleteCustomWorkout', id: cw.id }); }
                    : undefined
                }
              />
            );
          })}
        </ul>
      </section>

      {/* combined timeline */}
      <section>
        <h2 className="font-semibold mb-3">Shifts + workouts, next 14 days</h2>
        {days.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing coming up.</p>
        ) : (
          <div className="space-y-4">
            {days.map((d) => (
              <div key={d.key}>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{d.label}</p>
                <div className="space-y-2">{d.items.map((it) => it.node)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
