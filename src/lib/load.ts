// ── Load vocabulary tokens ──────────────────────────────────────────
// Class names and labels for the four recommendation bands, kept in a
// plain module so components can share them without tripping the
// react-refresh "components only" rule.
//
// These are *reading* colours: they describe how heavy a day or session
// is. Interactive intent belongs to the amber action colour, never here.
import type { Recommendation } from './types';

export const LOAD_LABEL: Record<Recommendation, string> = {
  rest: 'Rest day',
  light: 'Light',
  moderate: 'Moderate',
  hard: 'Hard',
};

export const LOAD_TEXT: Record<Recommendation, string> = {
  rest: 'text-fatigue-5',
  light: 'text-fatigue-3',
  moderate: 'text-fatigue-2',
  hard: 'text-fatigue-1',
};

export const LOAD_RULE: Record<Recommendation, string> = {
  rest: 'bg-fatigue-5',
  light: 'bg-fatigue-3',
  moderate: 'bg-fatigue-2',
  hard: 'bg-fatigue-1',
};
