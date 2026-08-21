import { useState } from 'react';
import { X, Check, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import type { CustomWorkout, ExercisePlan } from '../lib/library';
import type { WorkoutIntensity } from '../lib/types';

const TYPES = ['Strength', 'Run', 'Cycle', 'Swim', 'HIIT', 'Mobility', 'Walk', 'Other'];

// Custom workout builder: create / edit user workouts with a full
// exercise list editor (add, remove, reorder, modify).
export default function WorkoutBuilder({
  existing,
  userId,
  onDone,
}: {
  existing: CustomWorkout | null;
  userId: string;
  onDone: () => void;
}) {
  const { dispatch } = useStore();
  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState(existing?.type ?? 'Strength');
  const [duration, setDuration] = useState(existing?.durationMin ?? 45);
  const [intensity, setIntensity] = useState<WorkoutIntensity>(existing?.intensity ?? 'moderate');
  const [exercises, setExercises] = useState<ExercisePlan[]>(
    existing?.plan?.length ? existing.plan.map((p) => ({ ...p })) : [{ name: '', sets: 3, reps: 10 }]
  );
  const [error, setError] = useState('');

  const setEx = (i: number, patch: Partial<ExercisePlan>) =>
    setExercises((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const move = (i: number, dir: -1 | 1) =>
    setExercises((xs) => {
      const j = i + dir;
      if (j < 0 || j >= xs.length) return xs;
      const copy = [...xs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const save = () => {
    if (!name.trim()) { setError('Give your workout a name.'); return; }
    const plan = exercises.filter((e) => e.name.trim());
    if (!plan.length) { setError('Add at least one exercise.'); return; }
    const workout: CustomWorkout = {
      id: existing?.id ?? uid(),
      userId,
      name: name.trim(),
      type,
      durationMin: Math.max(5, duration),
      intensity,
      level: intensity, // custom workouts match their intensity bucket
      blurb: existing?.blurb ?? '',
      plan: plan.map((e) => ({ name: e.name.trim(), sets: Math.max(1, e.sets), reps: Math.max(1, e.reps) })),
    };
    dispatch({ type: 'saveCustomWorkout', workout });
    onDone();
  };

  const input = 'rounded-lg bg-ink-800 border border-ink-700 px-3 py-2.5 text-sm outline-none focus:border-shock-400/60';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold uppercase tracking-[0.06em]">{existing ? 'Edit workout' : 'Build a workout'}</h1>
        <button onClick={onDone} className="p-2 rounded-lg text-ink-400 hover:bg-ink-800" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <input
        className="w-full rounded-xl bg-ink-900 border border-ink-800 px-4 py-3 text-base outline-none focus:border-shock-400/60 placeholder:text-ink-600"
        placeholder="Workout name (e.g. Post-night-shift legs)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-ink-500 block mb-1.5">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={`w-full ${input}`}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink-500 block mb-1.5">Duration (min)</label>
          <input
            type="number" min={5} max={600} step={5} value={duration}
            onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 0))}
            className={`w-full ${input}`}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-ink-500 block mb-1.5">Intensity</label>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'moderate', 'hard'] as const).map((lv) => (
            <button
              type="button" key={lv} onClick={() => setIntensity(lv)}
              className={`rounded-xl py-2.5 text-sm font-semibold capitalize transition-colors ${
                intensity === lv ? 'bg-shock-400 text-ink-950' : 'bg-ink-800 text-ink-400'
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      {/* exercise list editor */}
      <div>
        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
          Exercises — {exercises.length}
        </p>
        <ul className="space-y-2">
          {exercises.map((ex, i) => (
            <li key={i} className="rounded-2xl bg-ink-900 border border-ink-800 p-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-ink-500 disabled:opacity-25" aria-label="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === exercises.length - 1} className="text-ink-500 disabled:opacity-25" aria-label="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <input
                  value={ex.name}
                  onChange={(e) => setEx(i, { name: e.target.value })}
                  placeholder={`Exercise ${i + 1}`}
                  className={`flex-1 min-w-0 ${input}`}
                />
                <button
                  onClick={() => setExercises((xs) => xs.filter((_, j) => j !== i))}
                  className="p-2 text-ink-600 hover:text-cooked-400" aria-label="Remove exercise"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 ml-8">
                <label className="text-[11px] text-ink-500">Sets</label>
                <input
                  type="number" min={1} max={20} value={ex.sets}
                  onChange={(e) => setEx(i, { sets: Math.max(1, Number(e.target.value) || 1) })}
                  className={`w-16 text-center ${input}`}
                />
                <label className="text-[11px] text-ink-500">Reps</label>
                <input
                  type="number" min={1} max={500} value={ex.reps}
                  onChange={(e) => setEx(i, { reps: Math.max(1, Number(e.target.value) || 1) })}
                  className={`w-16 text-center ${input}`}
                />
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setExercises((xs) => [...xs, { name: '', sets: 3, reps: 10 }])}
          className="mt-2 w-full rounded-xl border border-dashed border-ink-700 py-3 text-sm font-semibold text-ink-400 active:bg-ink-800 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add exercise
        </button>
      </div>

      {error && <p className="text-cooked-400 text-sm">{error}</p>}

      <button
        onClick={save}
        className="w-full rounded-xl bg-shock-400 text-ink-950 font-bold py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Check className="h-5 w-5" strokeWidth={2.5} />
        {existing ? 'Save changes' : 'Save workout'}
      </button>
    </div>
  );
}
