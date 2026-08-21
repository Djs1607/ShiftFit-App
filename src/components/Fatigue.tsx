import type { Recommendation } from '../lib/types';

// The load ramp is deliberately never lavender: shock-* means "tap me", and a
// fatigue reading that looks like a button gets tapped instead of read.
export const REC_META: Record<Recommendation, { label: string; color: string; bg: string; ring: string }> = {
  rest: { label: 'Rest', color: 'text-cooked-300', bg: 'bg-cooked-400/15', ring: 'ring-cooked-400/40' },
  light: { label: 'Light', color: 'text-caution-300', bg: 'bg-caution-400/15', ring: 'ring-caution-400/40' },
  moderate: { label: 'Moderate', color: 'text-steady-300', bg: 'bg-steady-400/15', ring: 'ring-steady-400/40' },
  hard: { label: 'Hard', color: 'text-fresh-300', bg: 'bg-fresh-400/15', ring: 'ring-fresh-400/40' },
};

export function fatigueColor(score: number): string {
  if (score <= 30) return 'bg-fresh-400';
  if (score <= 50) return 'bg-steady-400';
  if (score <= 70) return 'bg-caution-400';
  return 'bg-cooked-400';
}

export function fatigueText(score: number): string {
  if (score <= 30) return 'text-fresh-300';
  if (score <= 50) return 'text-steady-300';
  if (score <= 70) return 'text-caution-300';
  return 'text-cooked-300';
}

export function FatigueBar({ score }: { score: number }) {
  return (
    <div className="h-2.5 w-full rounded-full bg-ink-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${fatigueColor(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export function RecBadge({ rec, big }: { rec: Recommendation; big?: boolean }) {
  const m = REC_META[rec];
  return (
    <span
      className={`inline-flex items-center rounded-full ring-1 ${m.bg} ${m.color} ${m.ring} ${
        big
          ? 'font-display font-semibold uppercase tracking-[0.08em] px-4 py-1 text-xl'
          : 'font-semibold px-2.5 py-0.5 text-xs'
      }`}
    >
      {m.label}
    </span>
  );
}

export function IntensityDot({ intensity }: { intensity: 'light' | 'moderate' | 'hard' }) {
  const c = intensity === 'hard' ? 'bg-fresh-400' : intensity === 'moderate' ? 'bg-steady-400' : 'bg-caution-400';
  return <span className={`inline-block h-2 w-2 rounded-full ${c}`} />;
}
