// ── Training plan catalog ───────────────────────────────────────────
// Static catalog (like WORKOUT_LIBRARY) — the user-owned "I started this
// plan" record lives in the store as a TrainingPlanRecord instead.
// sessionTemplate holds WORKOUT_LIBRARY ids, one per weekly slot; it repeats
// every week for the plan's duration, so total sessions = weeks * sessionsPerWeek.

import { Activity, BatteryLow, Dumbbell, Moon, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TrainingPlan {
  id: string;
  name: string;
  weeks: number;
  sessionsPerWeek: number;
  frequencyLabel: string;
  description: string;
  icon: LucideIcon;
  sessionTemplate: string[]; // WORKOUT_LIBRARY ids, length === sessionsPerWeek
}

export const PLANS: TrainingPlan[] = [
  {
    id: 'shift-worker-strength',
    name: 'Shift Worker Strength',
    weeks: 4,
    sessionsPerWeek: 3,
    frequencyLabel: '3x per week',
    description: 'Full-body strength sessions that reshuffle around your rotation and ease off after night blocks.',
    icon: Dumbbell,
    sessionTemplate: ['full-body-moderate', 'heavy-lifts', 'full-body-moderate'],
  },
  {
    id: 'night-shift-recovery',
    name: 'Night Shift Recovery',
    weeks: 2,
    sessionsPerWeek: 7,
    frequencyLabel: 'Daily, light movement',
    description: 'Short, low-intensity sessions to burn off cortisol and protect sleep across consecutive nights.',
    icon: Moon,
    sessionTemplate: [
      'recovery-walk', 'yoga-flow', 'mobility-reset', 'zone1-spin',
      'recovery-walk', 'yoga-flow', 'mobility-reset',
    ],
  },
  {
    id: '4-week-run-base',
    name: '4-Week Run Base',
    weeks: 4,
    sessionsPerWeek: 3,
    frequencyLabel: '3 runs per week',
    description: 'Builds aerobic base with three easy-paced runs a week. No speed work required.',
    icon: Activity,
    sessionTemplate: ['tempo-run', 'tempo-run', 'tempo-run'],
  },
  {
    id: 'active-recovery-block',
    name: 'Active Recovery Block',
    weeks: 1,
    sessionsPerWeek: 7,
    frequencyLabel: 'Daily, light movement',
    description: 'Gentle daily movement for the weeks when fatigue is running high and load needs to drop.',
    icon: BatteryLow,
    sessionTemplate: [
      'walk-stretch', 'mobility-reset', 'recovery-walk', 'yoga-flow',
      'zone1-spin', 'walk-stretch', 'mobility-reset',
    ],
  },
  {
    id: 'strength-foundation',
    name: 'Strength Foundation',
    weeks: 6,
    sessionsPerWeek: 4,
    frequencyLabel: '4x per week',
    description: 'Progressive overload across six weeks to build a lasting strength base.',
    icon: Zap,
    sessionTemplate: ['full-body-moderate', 'full-body-moderate', 'heavy-lifts', 'full-body-moderate'],
  },
];
