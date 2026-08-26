import { useId } from 'react';
import { LOAD_TEXT } from '../lib/load';
import type { Recommendation } from '../lib/types';

// ── Shared load vocabulary ──────────────────────────────────────────
// One geometric motif per recommendation band, used as a card banner on
// the Workouts page and as the ground of the home status panel, so both
// screens speak the same language.
//
// These stay *reading* vocabulary: the motif and rule say "this is how
// heavy the day is", never "tap me". Interactive intent stays with the
// amber action colour and the chevron affordance.
const MOTIF: Record<Recommendation, { draw: (id: string, scale: number) => React.ReactNode }> = {
  rest: {
    draw: (id, scale) => (
      <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
        <circle cx="11" cy="11" r="2.5" fill="currentColor" />
      </pattern>
    ),
  },
  light: {
    draw: (id, scale) => (
      <pattern id={id} width="40" height="18" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
        <path d="M0 12 Q10 2 20 12 T40 12" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </pattern>
    ),
  },
  moderate: {
    draw: (id, scale) => (
      <pattern id={id} width="30" height="26" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
        <path d="M15 1 L28 8.5 L28 17.5 L15 25 L2 17.5 L2 8.5 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      </pattern>
    ),
  },
  hard: {
    draw: (id, scale) => (
      <pattern id={id} width="32" height="20" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
        <path d="M0 15 L8 5 L16 15 L24 5 L32 15" fill="none" stroke="currentColor" strokeWidth="3" />
      </pattern>
    ),
  },
};

// Each pattern lays down a different amount of ink: the rest dots are
// sparse, the hard chevrons nearly solid. A single opacity would make
// chevrons shout and dots vanish, so weight is normalised per band and
// callers scale it with `intensity` rather than setting raw opacity.
const INK: Record<Recommendation, number> = {
  rest: 0.20,
  light: 0.15,
  moderate: 0.13,
  hard: 0.10,
};

/** Absolutely-positioned motif ground. Parent must be `relative`. */
export default function LoadMotif({
  level,
  intensity = 1,
  scale = 1,
  className = '',
}: {
  level: Recommendation;
  /** multiplier on the band's normalised ink weight */
  intensity?: number;
  scale?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const motif = MOTIF[level];
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${LOAD_TEXT[level]} ${className}`}
      style={{ opacity: INK[level] * intensity }}
      aria-hidden
    >
      <defs>{motif.draw(id, scale)}</defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
