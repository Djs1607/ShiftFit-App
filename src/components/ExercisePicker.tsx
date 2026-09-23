// ── Exercise picker ──────────────────────────────────────────────────
// Full-screen overlay (same shell as Tracker's ExerciseListOverlay: fixed
// inset-0, safe-area padding, Close header) for browsing the bundled
// exercise database by name search and/or muscle-group filter.

import { useMemo, useState } from 'react';
import { Dumbbell, Search } from 'lucide-react';
import { ListRow } from './ds';
import {
  ALL_MUSCLES, getExercisesForMuscle, searchExercises, type Exercise,
} from '../lib/exerciseDatabase';

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function ResultThumb() {
  return (
    <span className="h-11 w-11 shrink-0 rounded-card flex items-center justify-center bg-surface-raised text-fg-tertiary">
      <Dumbbell className="h-5 w-5" />
    </span>
  );
}

// The caller should only mount this while open (e.g. `{open && <ExercisePicker ... />}`)
// rather than always rendering it with a visibility flag — that way each open
// starts with a clean search/filter instead of carrying the last visit's over.
export function ExercisePicker({
  onSelect, onClose,
}: {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);

  const results = useMemo(() => {
    const byQuery = searchExercises(query);
    if (!muscle) return byQuery;
    const byMuscle = new Set(getExercisesForMuscle(muscle).map((e) => e.name));
    return byQuery.filter((e) => byMuscle.has(e.name));
  }, [query, muscle]);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-bg-base text-fg-primary"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-between px-5 pt-5 max-w-md mx-auto w-full shrink-0">
        <h1 className="font-display text-[19px] font-semibold text-fg-primary">Browse Exercises</h1>
        <button onClick={onClose} className="text-[14px] font-semibold text-fg-secondary">Close</button>
      </div>

      <div className="px-5 pt-4 max-w-md mx-auto w-full shrink-0 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-disabled" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises"
            className="w-full rounded-sheet bg-surface-card border border-line-subtle pl-10 pr-4 py-3 text-[14px] text-fg-primary outline-none focus:border-line-focus placeholder:text-fg-disabled"
          />
        </div>

        <div className="-mx-5 px-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ALL_MUSCLES.map((m) => {
            const active = muscle === m;
            return (
              <button
                key={m}
                onClick={() => setMuscle(active ? null : m)}
                className={`shrink-0 whitespace-nowrap rounded-pill px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-fast ease-standard ${
                  active ? 'bg-action-accent text-fg-onAccent' : 'bg-surface-card border border-line-subtle text-fg-tertiary'
                }`}
              >
                {titleCase(m)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 max-w-md mx-auto w-full">
        {results.length === 0 ? (
          <p className="text-center text-[14px] text-fg-tertiary py-10">No exercises match.</p>
        ) : (
          <ul className="space-y-2">
            {results.map((ex) => (
              <li key={ex.name} className="rounded-card border border-line-subtle bg-surface-card">
                <ListRow
                  title={ex.name}
                  subtitle={[ex.equipment ? titleCase(ex.equipment) : null, ex.primaryMuscles.map(titleCase).join(', ')]
                    .filter(Boolean)
                    .join(' · ')}
                  leading={<ResultThumb />}
                  onClick={() => onSelect(ex)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
