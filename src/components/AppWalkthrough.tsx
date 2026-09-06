// ── App walkthrough ──────────────────────────────────────────────────
// The "how it works" content, extracted so it can be shown both inside
// first-run Onboarding (step 2) and on its own from Profile: same cards,
// same source of truth, no account-setup steps attached.

import type { ReactNode } from 'react';
import { X, Sunrise, Pencil, Zap, Timer, CalendarDays, SlidersHorizontal } from 'lucide-react';
import { Button } from './ds';

const CARDS = [
  {
    icon: Sunrise,
    title: '1. Check Today each morning',
    body: 'See your fatigue score and what it recommends: hard, moderate, light, or rest. Log last night’s sleep in one tap for a sharper score.',
  },
  {
    icon: Pencil,
    title: '2. Fix a wrong shift',
    body: 'Swapped, cancelled, or an unplanned day off? Tap the pencil next to your name on Today to correct that day’s shift so fatigue stays accurate.',
  },
  {
    icon: Zap,
    title: '3. Tap “Start now”',
    body: 'One tap starts a workout matched to your energy, no planning required. Too cooked? There’s always a 10-minute option.',
  },
  {
    icon: Timer,
    title: '4. Log sets, rest runs itself',
    body: 'Enter weight and reps as you go; the rest timer starts automatically. Finished workouts feed tomorrow’s fatigue score.',
  },
  {
    icon: CalendarDays,
    title: '5. Tap any day in Progress',
    body: 'The calendar doubles as a filter: tap a day to see just that day’s sessions, or "Show recent" to jump back to the full list.',
  },
  {
    icon: SlidersHorizontal,
    title: '6. Customise sets mid-session',
    body: 'Tap "Customise exercise" during a workout to add or remove sets on the fly. It won’t let you drop below sets you’ve already done.',
  },
];

/** Heading + card list: content only, no chrome. Drop into any page. */
export function AppWalkthrough({ intro, className = '' }: { intro?: ReactNode; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {intro}
      <div className="space-y-1">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">How it all works</h1>
        <p className="text-fg-secondary text-[15px]">The daily loop is just three taps, plus a few extras worth knowing.</p>
      </div>
      <div className="space-y-3">
        {CARDS.map((c) => (
          <div key={c.title} className="rounded-card border border-line-subtle bg-surface-card p-4 flex gap-3">
            <div className="w-10 h-10 rounded-control bg-action-primary-quiet flex items-center justify-center shrink-0">
              <c.icon className="h-5 w-5 text-coral-300" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-fg-primary">{c.title}</div>
              <div className="text-[14px] text-fg-secondary leading-snug">{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-screen presentation for opening the walkthrough on its own (e.g. from Profile). */
export function WalkthroughOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg-base text-fg-primary"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-between px-5 pt-5 max-w-md mx-auto w-full shrink-0">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-fg-tertiary">How it works</p>
        <button onClick={onClose} aria-label="Close" className="text-fg-tertiary hover:text-fg-primary">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-md mx-auto w-full">
        <AppWalkthrough />
        <Button variant="primary" size="lg" fullWidth onClick={onClose} className="mt-6">
          Got it
        </Button>
      </div>
    </div>
  );
}
