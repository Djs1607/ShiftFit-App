import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { CustomWorkout, LibraryWorkout } from '../lib/library';
import LoadMotif from './LoadMotif';
import { LOAD_LABEL, LOAD_RULE, LOAD_TEXT } from '../lib/load';
import { Badge } from './ds';

export default function WorkoutCard({
  workout,
  custom,
  onOpen,
  onEdit,
  onDelete,
}: {
  workout: LibraryWorkout | CustomWorkout;
  custom?: boolean;
  onOpen: (w: LibraryWorkout) => void;
  onEdit?: (w: CustomWorkout) => void;
  onDelete?: (w: CustomWorkout) => void;
}) {
  const count = workout.plan?.length ?? 0;

  return (
    <li className="relative">
      <button
        onClick={() => onOpen(workout)}
        className="group w-full overflow-hidden rounded-card border border-line-subtle bg-surface-card text-left
          shadow-sm transition-colors duration-fast ease-standard hover:border-line-default active:scale-[0.99]"
      >
        {/* motif banner — stands in for the reference's photography */}
        <div className="relative h-[84px] w-full overflow-hidden bg-surface-inset">
          <LoadMotif level={workout.level} />
          {/* fade so the label never fights the pattern behind it */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface-card via-surface-card/80 to-transparent" />

          <div className="absolute inset-y-0 left-0 flex items-center gap-3 pl-4 pr-3">
            <span className={`h-9 w-[3px] shrink-0 rounded-full ${LOAD_RULE[workout.level]}`} />
            <span className="min-w-0">
              <span className={`block text-[11px] font-semibold uppercase tracking-[0.14em] ${LOAD_TEXT[workout.level]}`}>
                {LOAD_LABEL[workout.level]}
              </span>
              <span className="mt-0.5 block truncate font-display text-[17px] font-semibold leading-tight tracking-[-0.01em] text-fg-primary">
                {workout.name}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-[13px] text-fg-tertiary">
            {workout.type} · {workout.durationMin} min
            {count > 0 && ` · ${count} exercise${count > 1 ? 's' : ''}`}
          </span>
          {custom && <Badge tone="primary">Custom</Badge>}
          <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-fg-disabled group-hover:text-fg-tertiary" />
        </div>
      </button>

      {/* custom-workout controls sit outside the card button so they stay reachable */}
      {custom && onEdit && onDelete && (
        <span className="absolute right-3 top-3 flex gap-1.5">
          <button
            onClick={() => onEdit(workout as CustomWorkout)}
            className="rounded-control border border-line-default bg-surface-overlay p-2 text-fg-secondary shadow-sm hover:text-fg-primary"
            aria-label={`Edit ${workout.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(workout as CustomWorkout)}
            className="rounded-control border border-line-default bg-surface-overlay p-2 text-fg-secondary shadow-sm hover:text-feedback-danger"
            aria-label={`Delete ${workout.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
    </li>
  );
}
