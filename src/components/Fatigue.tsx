import type { Recommendation } from '../lib/types';

// Recommendation is fatigue-derived, so it reuses the fatigue-1..5 severity
// ramp rather than inventing a second colour language.
export const REC_META: Record<Recommendation, { label: string; text: string; bg: string; ring: string }> = {
  hard: { label: 'Hard', text: 'text-fatigue-1', bg: 'bg-fatigue-1/15', ring: 'ring-fatigue-1/40' },
  moderate: { label: 'Moderate', text: 'text-fatigue-2', bg: 'bg-fatigue-2/15', ring: 'ring-fatigue-2/40' },
  light: { label: 'Light', text: 'text-fatigue-3', bg: 'bg-fatigue-3/15', ring: 'ring-fatigue-3/40' },
  rest: { label: 'Rest', text: 'text-fatigue-5', bg: 'bg-fatigue-5/15', ring: 'ring-fatigue-5/40' },
};

export function RecBadge({ rec, big }: { rec: Recommendation; big?: boolean }) {
  const m = REC_META[rec];
  return (
    <span
      className={`inline-flex items-center rounded-pill ring-1 ${m.bg} ${m.text} ${m.ring} ${
        big
          ? 'font-display font-semibold uppercase tracking-[0.06em] px-4 py-1 text-lg'
          : 'font-semibold px-2.5 py-0.5 text-[11px] uppercase tracking-[0.06em]'
      }`}
    >
      {m.label}
    </span>
  );
}

const INTENSITY_COLOR: Record<'light' | 'moderate' | 'hard', string> = {
  hard: 'bg-fatigue-1', moderate: 'bg-fatigue-2', light: 'bg-fatigue-3',
};

export function IntensityDot({ intensity }: { intensity: 'light' | 'moderate' | 'hard' }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${INTENSITY_COLOR[intensity]}`} />;
}
