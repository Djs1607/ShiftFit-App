// ── Exercise database ────────────────────────────────────────────────
// Static, bundled dataset (no runtime fetch — the app works offline).
// Source: free-exercise-db (public domain), normalized down to just the
// fields the picker needs. See exerciseDatabase.json.

import raw from './exerciseDatabase.json';

export interface Exercise {
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  category: string;
}

export const ALL_EXERCISES: Exercise[] = raw as Exercise[];

export const ALL_MUSCLES: string[] = Array.from(
  new Set(ALL_EXERCISES.flatMap((e) => [...e.primaryMuscles, ...e.secondaryMuscles]))
).sort((a, b) => a.localeCompare(b));

export function getExercisesForMuscle(muscle: string): Exercise[] {
  const q = muscle.toLowerCase();
  return ALL_EXERCISES.filter(
    (e) => e.primaryMuscles.some((m) => m.toLowerCase() === q) || e.secondaryMuscles.some((m) => m.toLowerCase() === q)
  );
}

export function searchExercises(query: string): Exercise[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_EXERCISES;
  return ALL_EXERCISES.filter((e) => e.name.toLowerCase().includes(q));
}
