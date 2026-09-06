import { useState } from 'react';
import { X, Check, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import type { CustomWorkout, ExercisePlan } from '../lib/library';
import type { WorkoutIntensity } from '../lib/types';
import { Button, IconButton, Input, Select } from '../components/ds';

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

  const numInput = 'w-16 text-center rounded-control bg-surface-inset border border-line-default px-2 py-2 text-[14px] font-mono text-fg-primary outline-none focus:border-line-focus';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">{existing ? 'Edit workout' : 'Build a workout'}</h1>
        <IconButton icon={X} label="Close" onClick={onDone} />
      </div>

      <Input
        placeholder="Workout name (e.g. Post-night-shift legs)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        size="lg"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={TYPES} />
        <Input
          type="number" min={5} max={600} step={5} label="Duration (min)" value={duration}
          onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 0))}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">Intensity</label>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'moderate', 'hard'] as const).map((lv) => (
            <button
              type="button" key={lv} onClick={() => setIntensity(lv)}
              className={`rounded-control py-2.5 text-[14px] font-semibold capitalize transition-colors duration-fast ease-standard ${
                intensity === lv ? 'bg-action-primary text-fg-onPrimary' : 'bg-surface-raised text-fg-tertiary'
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      {/* exercise list editor */}
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary mb-2">
          Exercises: {exercises.length}
        </p>
        <ul className="space-y-2">
          {exercises.map((ex, i) => (
            <li key={i} className="rounded-card bg-surface-card border border-line-subtle p-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-fg-tertiary disabled:opacity-25" aria-label="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === exercises.length - 1} className="text-fg-tertiary disabled:opacity-25" aria-label="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  value={ex.name}
                  onChange={(e) => setEx(i, { name: e.target.value })}
                  placeholder={`Exercise ${i + 1}`}
                  wrapperClassName="flex-1 min-w-0"
                />
                <button
                  onClick={() => setExercises((xs) => xs.filter((_, j) => j !== i))}
                  className="p-2 text-fg-disabled hover:text-feedback-danger" aria-label="Remove exercise"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 ml-8">
                <label className="text-[11px] text-fg-tertiary">Sets</label>
                <input
                  type="number" min={1} max={20} value={ex.sets}
                  onChange={(e) => setEx(i, { sets: Math.max(1, Number(e.target.value) || 1) })}
                  className={numInput}
                />
                <label className="text-[11px] text-fg-tertiary">Reps</label>
                <input
                  type="number" min={1} max={500} value={ex.reps}
                  onChange={(e) => setEx(i, { reps: Math.max(1, Number(e.target.value) || 1) })}
                  className={numInput}
                />
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setExercises((xs) => [...xs, { name: '', sets: 3, reps: 10 }])}
          className="mt-2 w-full rounded-control border border-dashed border-line-strong py-3 text-[14px] font-semibold text-fg-tertiary hover:bg-surface-hover flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add exercise
        </button>
      </div>

      {error && <p className="text-feedback-danger text-[13px]">{error}</p>}

      <Button variant="primary" size="lg" fullWidth icon={Check} onClick={save}>
        {existing ? 'Save changes' : 'Save workout'}
      </Button>
    </div>
  );
}
