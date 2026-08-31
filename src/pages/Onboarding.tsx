import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Sunrise, Zap, Timer, SkipForward } from 'lucide-react';
import { useStore } from '../lib/store';
import { PRESETS, patternFromPreset, type ShiftPreset } from '../lib/presets';
import { dateKey, fmtDayLabel, parseDateKey } from '../lib/schedule';
import Logo from '../components/Logo';
import { Button, Card, Input } from '../components/ds';

/**
 * First-run onboarding: welcome → pick a rotation in one tap → learn the daily loop.
 * Every existing option stays available; this just gets a new user to a working app in ~30s.
 */
export default function Onboarding({ onDone }: { onDone: (tab?: 'today' | 'shifts') => void }) {
  const { user, dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(dateKey(new Date()));

  if (!user) return null;

  const choosePreset = (preset: ShiftPreset) => {
    dispatch({ type: 'savePattern', pattern: patternFromPreset(preset, user.id, startDate) });
    setPicked(preset.name);
    setStep(2);
  };

  return (
    <div className="min-h-dvh bg-bg-base text-fg-primary flex flex-col">
      {/* progress dots + skip */}
      <div className="flex items-center justify-between px-5 pt-5 max-w-md mx-auto w-full">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-pill transition-all duration-base ease-standard ${
                i === step ? 'w-6 bg-action-primary' : i < step ? 'w-3 bg-action-primary/50' : 'w-3 bg-surface-raised'
              }`}
            />
          ))}
        </div>
        {step < 2 && (
          <button onClick={() => onDone()} className="text-[13px] text-fg-tertiary flex items-center gap-1">
            <SkipForward className="h-3.5 w-3.5" /> Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-md mx-auto w-full">
        {step === 0 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Logo size="xl" />
            </div>
            <p className="text-fg-secondary text-[17px] leading-snug">
              Workouts that fit around your shifts — not the other way round.
            </p>
            <Card tone="raised" padding="md" className="text-left">
              <p className="text-[14px] text-fg-secondary leading-relaxed">
                ShiftFit reads your rotation, scores your daily fatigue, and tells you{' '}
                <span className="text-fg-primary font-medium">when</span> to train and{' '}
                <span className="text-fg-primary font-medium">how hard</span> — so you never plan a heavy
                session after a night shift again.
              </p>
            </Card>
            <Button variant="primary" size="lg" fullWidth iconAfter={ChevronRight} onClick={() => setStep(1)}>
              Get started
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">What's your rotation?</h1>
              <p className="text-fg-secondary text-[15px]">
                Tap one — you're set. You can edit times or build your own any time from your Profile.
              </p>
            </div>
            <Input
              type="date"
              label="Day 1 of the rotation starts on"
              hint="Already mid-rotation? Pick a past date so today lines up correctly. Starting later is fine too."
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="lg"
            />
            <div className="space-y-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => choosePreset(p)}
                  className="w-full rounded-card border border-line-subtle bg-surface-card p-3.5 text-left flex items-center justify-between hover:border-line-focus transition-colors duration-fast ease-standard"
                >
                  <div>
                    <div className="text-[15px] font-medium text-fg-primary">{p.name}</div>
                    <div className="text-[13px] text-fg-tertiary">{p.blurb}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-fg-tertiary shrink-0" />
                </button>
              ))}
            </div>
            <button
              onClick={() => onDone('shifts')}
              className="w-full rounded-control border border-dashed border-line-strong py-3 text-[13px] text-fg-secondary"
            >
              None of these — set up my own pattern
            </button>
            <button onClick={() => setStep(0)} className="flex items-center gap-1 text-[13px] text-fg-tertiary mx-auto">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {picked && (
              <div className="flex items-center gap-2 rounded-control bg-action-primary-quiet text-coral-300 px-4 py-2.5 text-[14px] font-medium">
                <Check className="h-4 w-4" /> {picked} — day 1 is {fmtDayLabel(parseDateKey(startDate))}
              </div>
            )}
            <div className="space-y-1">
              <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">Your daily loop</h1>
              <p className="text-fg-secondary text-[15px]">Three taps a day. That's it.</p>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: Sunrise,
                  title: '1. Check Today each morning',
                  body: 'See your fatigue score and what it recommends — hard, moderate, light, or rest. Log last night’s sleep in one tap for a sharper score.',
                },
                {
                  icon: Zap,
                  title: '2. Tap “Start now”',
                  body: 'One tap starts a workout matched to your energy — no planning required. Too cooked? There’s always a 10-minute option.',
                },
                {
                  icon: Timer,
                  title: '3. Log sets, rest runs itself',
                  body: 'Enter weight and reps as you go; the rest timer starts automatically. Finished workouts feed tomorrow’s fatigue score.',
                },
              ].map((c) => (
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
            <Button variant="primary" size="lg" fullWidth onClick={() => onDone()}>
              Start using ShiftFit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
