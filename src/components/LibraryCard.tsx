import { useState } from 'react';
import { ArrowUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import type { CustomWorkout, LibraryWorkout } from '../lib/library';
import { IntensityDot } from './Fatigue';

// A library workout card with an expandable exercise preview,
// so users can see exactly what's in a session before starting.
export default function LibraryCard({
  workout,
  custom,
  onUse,
  onEdit,
  onDelete,
}: {
  workout: LibraryWorkout | CustomWorkout;
  custom?: boolean;
  onUse: (w: LibraryWorkout) => void;
  onEdit?: (w: CustomWorkout) => void;
  onDelete?: (w: CustomWorkout) => void;
}) {
  const [open, setOpen] = useState(false);
  const plan = workout.plan ?? [];

  return (
    <li className="rounded-2xl bg-ink-800/50 border border-ink-800 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold flex items-center gap-2 flex-wrap">
            {workout.name} <IntensityDot intensity={workout.intensity} />
            {custom && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-day-300 bg-day-400/15 rounded-full px-2 py-0.5">Custom</span>
            )}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            {workout.type} · {workout.durationMin} min · <span className="capitalize">{workout.intensity}</span>
            {plan.length > 0 && ` · ${plan.length} exercises`}
          </p>
          {workout.blurb && <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">{workout.blurb}</p>}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => onUse(workout)}
            className="flex items-center gap-1 rounded-lg bg-shock-400/15 text-shock-300 text-xs font-bold px-3 py-2 active:bg-shock-400/25"
          >
            <ArrowUp className="h-3.5 w-3.5" /> Use
          </button>
          {custom && onEdit && onDelete && (
            <div className="flex gap-1.5">
              <button onClick={() => onEdit(workout as CustomWorkout)} className="flex-1 rounded-lg bg-ink-800 p-2 text-ink-400 active:bg-ink-700" aria-label="Edit workout">
                <Pencil className="h-3.5 w-3.5 mx-auto" />
              </button>
              <button onClick={() => onDelete(workout as CustomWorkout)} className="flex-1 rounded-lg bg-ink-800 p-2 text-ink-400 active:bg-ink-700 hover:text-cooked-400" aria-label="Delete workout">
                <Trash2 className="h-3.5 w-3.5 mx-auto" />
              </button>
            </div>
          )}
        </div>
      </div>

      {plan.length > 0 && (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-2.5 flex items-center gap-1 text-xs text-ink-500 font-semibold"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            {open ? 'Hide' : 'Preview'} exercises
          </button>
          {open && (
            <ul className="mt-2 space-y-1 rounded-xl bg-ink-900/60 border border-ink-800 p-3">
              {plan.map((p, i) => (
                <li key={i} className="text-xs text-ink-300 flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-ink-500 tabular-nums">{p.sets} × {p.reps}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
}
