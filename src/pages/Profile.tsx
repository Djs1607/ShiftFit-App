import { useState } from 'react';
import { LogOut, Check, RotateCcw, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { InstallInstructions, useIsStandalone } from '../components/InstallInstructions';
import { Button, Card, Input } from '../components/ds';
import type { Tab } from '../App';

export default function Profile({ go }: { go: (t: Tab) => void }) {
  const { user, userPatterns, activePattern, dispatch } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [savedName, setSavedName] = useState(false);
  const installed = useIsStandalone();

  if (!user) return null;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">Profile</h1>

      <Card tone="default" padding="lg" className="space-y-4">
        <div>
          <div className="flex gap-2 items-end">
            <Input
              label="Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setSavedName(false); }}
              wrapperClassName="flex-1"
            />
            <Button
              variant="secondary"
              size="md"
              onClick={() => { dispatch({ type: 'updateUser', user: { ...user, name: name.trim() || user.name } }); setSavedName(true); }}
            >
              {savedName ? <Check className="h-4 w-4" /> : 'Save'}
            </Button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">Email</label>
          <p className="rounded-control bg-surface-inset border border-line-subtle px-4 py-3 text-[14px] text-fg-secondary">{user.email}</p>
        </div>
      </Card>

      <Card tone="default" padding="none" className="overflow-hidden">
        <button
          onClick={() => go('shifts')}
          className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors duration-fast ease-standard active:bg-surface-raised"
        >
          <span>
            <span className="block text-[15px] font-semibold text-fg-primary">Shift pattern</span>
            <span className="block text-[13px] text-fg-tertiary mt-0.5">
              {activePattern ? activePattern.name : userPatterns.length === 0 ? 'No pattern set up yet' : 'No active pattern'}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-fg-tertiary shrink-0" />
        </button>
      </Card>

      <Card tone="default" padding="lg" className="space-y-3">
        <h2 className="text-[15px] font-semibold text-fg-primary">Install app</h2>
        {installed ? (
          <p className="flex items-center gap-1.5 text-[14px] font-medium text-feedback-success">
            <Check className="h-4 w-4" /> App installed
          </p>
        ) : (
          <>
            <p className="text-[13px] text-fg-tertiary">
              Add ShiftFit to your home screen for the full app experience — full screen, no browser bar, opens instantly.
            </p>
            <InstallInstructions />
          </>
        )}
      </Card>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        icon={RotateCcw}
        onClick={() => window.dispatchEvent(new Event('shiftfit:replay-onboarding'))}
      >
        Replay onboarding
      </Button>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        icon={LogOut}
        onClick={() => dispatch({ type: 'logout' })}
      >
        Sign out
      </Button>

      <p className="text-fg-disabled text-[13px] text-center leading-relaxed px-4">
        Local-only MVP: your account, patterns and workouts are stored in this browser's localStorage.
        They won't sync to other devices, and clearing browser data removes them.
      </p>
    </div>
  );
}
