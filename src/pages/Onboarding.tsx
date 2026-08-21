import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Sunrise, Zap, Timer, SkipForward } from 'lucide-react';
import { useStore } from '../lib/store';
import { PRESETS, patternFromPreset, type ShiftPreset } from '../lib/presets';

/**
 * First-run onboarding: welcome → pick a rotation in one tap → learn the daily loop.
 * Every existing option stays available; this just gets a new user to a working app in ~30s.
 */
export default function Onboarding({ onDone }: { onDone: (tab?: 'today' | 'shifts') => void }) {
  const { user, dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  if (!user) return null;

  const choosePreset = (preset: ShiftPreset) => {
    dispatch({ type: 'savePattern', pattern: patternFromPreset(preset, user.id) });
    setPicked(preset.name);
    setStep(2);
  };

  return (
    <div className="min-h-dvh bg-ink-950 text-ink-100 flex flex-col">
      {/* progress dots + skip */}
      <div className="flex items-center justify-between px-5 pt-5 max-w-md mx-auto w-full">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-shock-400' : i < step ? 'w-3 bg-shock-400/50' : 'w-3 bg-ink-800'
              }`}
            />
          ))}
        </div>
        {step < 2 && (
          <button onClick={() => onDone()} className="text-sm text-ink-500 flex items-center gap-1">
            <SkipForward className="h-3.5 w-3.5" /> Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-md mx-auto w-full">
        {step === 0 && (
          <div className="space-y-6 text-center">
            <img src="/logo-full.png" alt="ShiftFit" className="mx-auto w-52 object-contain" />
            <div className="space-y-2">
              <p className="text-ink-400 text-lg">
                Workouts that fit around your shifts — not the other way round.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-800 bg-ink-900/60 p-4 text-left text-sm text-ink-400">
              <p>
                ShiftFit reads your rotation, scores your daily fatigue, and tells you{' '}
                <span className="text-ink-100 font-medium">when</span> to train and{' '}
                <span className="text-ink-100 font-medium">how hard</span> — so you never plan a heavy
                session after a night shift again.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full rounded-xl bg-shock-400 text-ink-950 py-3.5 font-semibold text-lg flex items-center justify-center gap-2"
            >
              Get started <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h1 className="text-4xl font-display font-semibold uppercase tracking-[0.05em]">What's your rotation?</h1>
              <p className="text-ink-400">
                Tap one — you're set. You can edit times or build your own any time in the Shifts tab.
              </p>
            </div>
            <div className="space-y-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => choosePreset(p)}
                  className="w-full rounded-xl border border-ink-800 bg-ink-900/60 p-3.5 text-left flex items-center justify-between hover:border-shock-400/60 transition-colors"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-ink-500">{p.blurb}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-600 shrink-0" />
                </button>
              ))}
            </div>
            <button
              onClick={() => onDone('shifts')}
              className="w-full rounded-xl border border-dashed border-ink-700 py-3 text-sm text-ink-400"
            >
              None of these — set up my own pattern
            </button>
            <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-ink-500 mx-auto">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {picked && (
              <div className="flex items-center gap-2 rounded-xl bg-shock-400/10 text-shock-300 px-4 py-2.5 text-sm font-medium">
                <Check className="h-4 w-4" /> {picked} — active from today
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-4xl font-display font-semibold uppercase tracking-[0.05em]">Your daily loop</h1>
              <p className="text-ink-400">Three taps a day. That's it.</p>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: Sunrise,
                  title: '1. Check Today each morning',
                  body: 'See your fatigue score and what it recommends — hard, moderate, light, or rest. Log last night\u2019s sleep in one tap for a sharper score.',
                },
                {
                  icon: Zap,
                  title: '2. Tap \u201cStart now\u201d',
                  body: 'One tap starts a workout matched to your energy — no planning required. Too cooked? There\u2019s always a 10-minute option.',
                },
                {
                  icon: Timer,
                  title: '3. Log sets, rest runs itself',
                  body: 'Enter weight and reps as you go; the rest timer starts automatically. Finished workouts feed tomorrow\u2019s fatigue score.',
                },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-ink-800 bg-ink-900/60 p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-shock-400/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-shock-300" />
                  </div>
                  <div>
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-sm text-ink-400">{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onDone()}
              className="w-full rounded-xl bg-shock-400 text-ink-950 py-3.5 font-semibold text-lg"
            >
              Start using ShiftFit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
