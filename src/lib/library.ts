// ── Workout library ─────────────────────────────────────────────────
// Curated starter sessions so users never have to invent a workout.
// Matched to the four recommendation levels.

import type { WorkoutIntensity } from './types';

export interface ExercisePlan {
  name: string;
  sets: number;
  reps: number;
}

export interface LibraryWorkout {
  id: string;
  name: string;
  type: string; // matches the scheduler's type list
  durationMin: number;
  intensity: WorkoutIntensity;
  level: 'rest' | 'light' | 'moderate' | 'hard'; // recommendation bucket it suits
  blurb: string;
  plan?: ExercisePlan[]; // seeded into the live tracker when the session starts
}

// user-built workouts live alongside the built-in library
export interface CustomWorkout extends LibraryWorkout {
  userId: string;
}

export const WORKOUT_LIBRARY: LibraryWorkout[] = [
  // rest-day friendly
  { id: 'walk-stretch', name: 'Walk & stretch', type: 'Walk', durationMin: 20, intensity: 'light', level: 'rest', blurb: 'Easy stroll + 5 min stretching. Keeps you loose without adding load.' },
  { id: 'mobility-reset', name: '10-min mobility reset', type: 'Mobility', durationMin: 10, intensity: 'light', level: 'rest', blurb: 'Hips, shoulders, spine. Perfect after a night shift.', plan: [
    { name: 'Cat-Cow (reps = breaths)', sets: 1, reps: 8 },
    { name: '90/90 Hip Switch (reps = breaths)', sets: 1, reps: 6 },
    { name: 'Thread the Needle each side (reps = breaths)', sets: 1, reps: 5 },
    { name: 'Shoulder Rolls (reps = breaths)', sets: 1, reps: 8 },
    { name: 'Standing Forward Fold (reps = seconds)', sets: 1, reps: 30 },
  ] },
  // light
  { id: 'recovery-walk', name: 'Recovery walk', type: 'Walk', durationMin: 30, intensity: 'light', level: 'light', blurb: 'Brisk but conversational pace. Great on tired legs.' },
  { id: 'yoga-flow', name: 'Easy yoga flow', type: 'Mobility', durationMin: 25, intensity: 'light', level: 'light', blurb: 'Slow flow to unwind tension and downshift before sleep.', plan: [
    { name: 'Cat-Cow (reps = breaths)', sets: 2, reps: 8 },
    { name: 'Downward Dog (reps = breaths)', sets: 2, reps: 5 },
    { name: 'Pigeon Pose each side (reps = breaths)', sets: 2, reps: 6 },
    { name: 'Child’s Pose (reps = breaths)', sets: 1, reps: 10 },
  ] },
  { id: 'zone1-spin', name: 'Zone 1 spin', type: 'Cycle', durationMin: 30, intensity: 'light', level: 'light', blurb: 'Very easy pedalling. You should be able to chat the whole time.' },
  // moderate
  { id: 'tempo-run', name: 'Tempo run', type: 'Run', durationMin: 35, intensity: 'moderate', level: 'moderate', blurb: 'Comfortably hard: a few sentences at a time, not full chat.' },
  { id: 'full-body-moderate', name: 'Full-body strength', type: 'Strength', durationMin: 45, intensity: 'moderate', level: 'moderate', blurb: 'Squat, push, pull, hinge: 3 sets each, leaving 2 reps in the tank.', plan: [
    { name: 'Goblet Squat', sets: 3, reps: 10 },
    { name: 'Push-up', sets: 3, reps: 12 },
    { name: 'Dumbbell Row', sets: 3, reps: 10 },
    { name: 'Romanian Deadlift', sets: 3, reps: 10 },
    { name: 'Plank (reps = seconds)', sets: 3, reps: 40 },
  ] },
  { id: 'steady-swim', name: 'Steady swim', type: 'Swim', durationMin: 30, intensity: 'moderate', level: 'moderate', blurb: 'Continuous easy laps, low impact on tired joints.' },
  // hard
  { id: 'heavy-lifts', name: 'Heavy strength session', type: 'Strength', durationMin: 60, intensity: 'hard', level: 'hard', blurb: 'Big lifts at 80%+, full rests. Only when fatigue is low.', plan: [
    { name: 'Back Squat', sets: 5, reps: 5 },
    { name: 'Bench Press', sets: 5, reps: 5 },
    { name: 'Deadlift', sets: 3, reps: 5 },
    { name: 'Overhead Press', sets: 3, reps: 8 },
  ] },
  { id: 'interval-run', name: 'Interval run', type: 'Run', durationMin: 40, intensity: 'hard', level: 'hard', blurb: '6 × 3 min fast / 2 min easy after a proper warm-up.' },
  { id: 'hiit-circuit', name: 'HIIT circuit', type: 'HIIT', durationMin: 30, intensity: 'hard', level: 'hard', blurb: '40s on / 20s off: burpees, kettlebell swings, rows, bike sprints.', plan: [
    { name: 'Burpees (reps = seconds)', sets: 5, reps: 40 },
    { name: 'Kettlebell Swings (reps = seconds)', sets: 5, reps: 40 },
    { name: 'Row Erg (reps = seconds)', sets: 5, reps: 40 },
    { name: 'Bike Sprint (reps = seconds)', sets: 5, reps: 40 },
  ] },
  { id: 'long-ride', name: 'Long steady ride', type: 'Cycle', durationMin: 90, intensity: 'hard', level: 'hard', blurb: 'Endurance builder for a proper day off.' },
];
