import { useState } from 'react';
import { LogOut, Check, RotateCcw } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button, Card, Input } from '../components/ds';

export default function Profile() {
  const { user, userPatterns, activePattern, dispatch } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [savedName, setSavedName] = useState(false);

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

      <Card tone="default" padding="lg">
        <h2 className="text-[15px] font-semibold text-fg-primary mb-3">Active pattern</h2>
        {userPatterns.length === 0 ? (
          <p className="text-[14px] text-fg-tertiary">No patterns yet — create one in the Shifts tab.</p>
        ) : (
          <div className="space-y-2">
            {userPatterns.map((p) => (
              <button
                key={p.id}
                onClick={() => dispatch({ type: 'setActivePattern', id: p.id, userId: user.id })}
                className={`w-full flex items-center justify-between rounded-control border px-4 py-3.5 text-left transition-colors duration-fast ease-standard ${
                  p.isActive ? 'border-coral-400/50 bg-action-primary-quiet' : 'border-line-subtle bg-surface-raised'
                }`}
              >
                <span>
                  <span className={`block text-[14px] font-semibold ${p.isActive ? 'text-coral-200' : 'text-fg-body'}`}>{p.name}</span>
                  <span className="block text-[13px] text-fg-tertiary mt-0.5">{p.cycleLengthDays}-day cycle · starts {p.startDate}</span>
                </span>
                {p.isActive && <Check className="h-5 w-5 text-coral-300 shrink-0" />}
              </button>
            ))}
          </div>
        )}
        {activePattern && (
          <p className="text-[12px] text-fg-disabled mt-3">The active pattern drives the dashboard, fatigue scores and workout clash checks.</p>
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
