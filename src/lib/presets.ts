import type { ShiftDay, ShiftPattern } from './types';
import { uid } from './storage';
import { dateKey } from './schedule';

export interface ShiftPreset {
  name: string;
  blurb: string;
  days: Partial<ShiftDay>[];
}

// ── Common rotations for one-tap setup ──────────────────────────────
export const PRESETS: ShiftPreset[] = [
  {
    name: '4 on / 4 off — days 12h',
    blurb: 'Four day shifts, four days off',
    days: [
      { isOnShift: true, startTime: '06:00', endTime: '18:00' },
      { isOnShift: true, startTime: '06:00', endTime: '18:00' },
      { isOnShift: true, startTime: '06:00', endTime: '18:00' },
      { isOnShift: true, startTime: '06:00', endTime: '18:00' },
      { isOnShift: false }, { isOnShift: false }, { isOnShift: false }, { isOnShift: false },
    ],
  },
  {
    name: '4 on / 4 off — nights 12h',
    blurb: 'Four night shifts, four days off',
    days: [
      { isOnShift: true, startTime: '18:00', endTime: '06:00' },
      { isOnShift: true, startTime: '18:00', endTime: '06:00' },
      { isOnShift: true, startTime: '18:00', endTime: '06:00' },
      { isOnShift: true, startTime: '18:00', endTime: '06:00' },
      { isOnShift: false }, { isOnShift: false }, { isOnShift: false }, { isOnShift: false },
    ],
  },
  {
    name: '2 days / 2 nights / 4 off',
    blurb: 'Two days, two nights, then four off',
    days: [
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: true, startTime: '19:00', endTime: '07:00' },
      { isOnShift: true, startTime: '19:00', endTime: '07:00' },
      { isOnShift: false }, { isOnShift: false }, { isOnShift: false }, { isOnShift: false },
    ],
  },
  {
    name: 'Mon–Fri 9–5 (7-day)',
    blurb: 'Standard office week, weekends off',
    days: [
      { isOnShift: true, startTime: '09:00', endTime: '17:00' },
      { isOnShift: true, startTime: '09:00', endTime: '17:00' },
      { isOnShift: true, startTime: '09:00', endTime: '17:00' },
      { isOnShift: true, startTime: '09:00', endTime: '17:00' },
      { isOnShift: true, startTime: '09:00', endTime: '17:00' },
      { isOnShift: false }, { isOnShift: false },
    ],
  },
  {
    name: '6 on / 3 off — days 8h',
    blurb: 'Six day shifts, three days off',
    days: [
      { isOnShift: true, startTime: '08:00', endTime: '16:00' },
      { isOnShift: true, startTime: '08:00', endTime: '16:00' },
      { isOnShift: true, startTime: '08:00', endTime: '16:00' },
      { isOnShift: true, startTime: '08:00', endTime: '16:00' },
      { isOnShift: true, startTime: '08:00', endTime: '16:00' },
      { isOnShift: true, startTime: '08:00', endTime: '16:00' },
      { isOnShift: false }, { isOnShift: false }, { isOnShift: false },
    ],
  },
  {
    name: '2-2-3 Panama — days 12h',
    blurb: 'Alternating 2 and 3 on, every other weekend off',
    days: [
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: false }, { isOnShift: false },
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: false }, { isOnShift: false },
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: true, startTime: '07:00', endTime: '19:00' },
      { isOnShift: false }, { isOnShift: false }, { isOnShift: false },
    ],
  },
];

/** Turn a preset into a full, active ShiftPattern anchored to today. */
export function patternFromPreset(preset: ShiftPreset, userId: string, startDate?: string): ShiftPattern {
  return {
    id: uid(),
    userId,
    name: preset.name,
    cycleLengthDays: preset.days.length,
    startDate: startDate ?? dateKey(new Date()),
    days: preset.days.map((d, i) => ({
      dayIndexInCycle: i,
      isOnShift: d.isOnShift ?? false,
      startTime: d.startTime ?? '07:00',
      endTime: d.endTime ?? '19:00',
    })),
    isActive: true,
  };
}
