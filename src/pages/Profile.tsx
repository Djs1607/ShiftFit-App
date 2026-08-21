import { useState } from 'react';
import { LogOut, Check, RotateCcw } from 'lucide-react';
import { useStore } from '../lib/store';

export default function Profile() {
  const { user, userPatterns, activePattern, dispatch } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [savedName, setSavedName] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-display font-semibold uppercase tracking-[0.06em]">Profile</h1>

      <section className="rounded-2xl bg-ink-900 border border-ink-800 p-5 space-y-4">
        <div>
          <label className="text-xs text-ink-500 block mb-1.5">Name</label>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setSavedName(false); }}
              className="flex-1 rounded-xl bg-ink-800 border border-ink-700 px-4 py-3 text-base outline-none focus:border-shock-400/60"
            />
            <button
              onClick={() => { dispatch({ type: 'updateUser', user: { ...user, name: name.trim() || user.name } }); setSavedName(true); }}
              className="rounded-xl bg-ink-800 px-4 text-shock-300 font-semibold text-sm active:bg-ink-700"
            >
              {savedName ? <Check className="h-5 w-5" /> : 'Save'}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-ink-500 block mb-1.5">Email</label>
          <p className="rounded-xl bg-ink-800/50 border border-ink-800 px-4 py-3 text-sm text-ink-400">{user.email}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-ink-900 border border-ink-800 p-5">
        <h2 className="font-semibold mb-3">Active pattern</h2>
        {userPatterns.length === 0 ? (
          <p className="text-sm text-ink-500">No patterns yet — create one in the Shifts tab.</p>
        ) : (
          <div className="space-y-2">
            {userPatterns.map((p) => (
              <button
                key={p.id}
                onClick={() => dispatch({ type: 'setActivePattern', id: p.id, userId: user.id })}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  p.isActive ? 'border-shock-400/50 bg-shock-400/10' : 'border-ink-800 bg-ink-800/40'
                }`}
              >
                <span>
                  <span className={`block text-sm font-semibold ${p.isActive ? 'text-shock-200' : 'text-ink-200'}`}>{p.name}</span>
                  <span className="block text-xs text-ink-500 mt-0.5">{p.cycleLengthDays}-day cycle · starts {p.startDate}</span>
                </span>
                {p.isActive && <Check className="h-5 w-5 text-shock-300 shrink-0" />}
              </button>
            ))}
          </div>
        )}
        {activePattern && (
          <p className="text-xs text-ink-600 mt-3">The active pattern drives the dashboard, fatigue scores and workout clash checks.</p>
        )}
      </section>

      <button
        onClick={() => window.dispatchEvent(new Event('shiftfit:replay-onboarding'))}
        className="w-full rounded-xl border border-ink-800 py-3.5 text-sm font-semibold text-ink-400 flex items-center justify-center gap-2 active:bg-ink-900"
      >
        <RotateCcw className="h-4 w-4" /> Replay onboarding
      </button>

      <button
        onClick={() => dispatch({ type: 'logout' })}
        className="w-full rounded-xl border border-ink-800 py-3.5 text-sm font-semibold text-ink-400 flex items-center justify-center gap-2 active:bg-ink-900"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      <p className="text-ink-600 text-xs text-center leading-relaxed px-4">
        Local-only MVP: your account, patterns and workouts are stored in this browser's localStorage.
        They won't sync to other devices, and clearing browser data removes them.
      </p>
    </div>
  );
}
