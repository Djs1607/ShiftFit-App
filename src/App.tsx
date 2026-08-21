// ShiftFit — single-page shell with in-app tab navigation.
// State management: React Context + useReducer (src/lib/store.tsx),
// persisted to localStorage. No URL sub-routes are used, so the
// static preview always renders from "/".

import { useEffect, useState } from 'react';
import { CalendarDays, Dumbbell, UserRound, LayoutDashboard, TrendingUp } from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import { load, save } from './lib/storage';
import Logo from './components/Logo';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Today from './pages/Today';
import Patterns from './pages/Patterns';
import Workouts from './pages/Workouts';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Tracker from './pages/Tracker';

export type Tab = 'today' | 'shifts' | 'workouts' | 'progress' | 'profile';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'shifts', label: 'Shifts', icon: CalendarDays },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

function Shell() {
  const { user, userWorkouts } = useStore();
  const [tab, setTab] = useState<Tab>('today');
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(true);

  // first-run gate: show onboarding until this user completes/skips it.
  // Profile can replay it by dispatching the window event.
  useEffect(() => {
    if (user) setOnboarded(load(`onboarded:${user.id}`, false));
    const replay = () => setOnboarded(false);
    window.addEventListener('shiftfit:replay-onboarding', replay);
    return () => window.removeEventListener('shiftfit:replay-onboarding', replay);
  }, [user?.id]);

  if (!user) return <Auth />;

  if (!onboarded) {
    return (
      <Onboarding
        onDone={(next?: 'today' | 'shifts') => {
          save(`onboarded:${user.id}`, true);
          setOnboarded(true);
          if (next) setTab(next);
        }}
      />
    );
  }

  // auto-resume a session that was started but never finished or exited
  const liveId = trackingId ?? userWorkouts.find((w) => w.startedAt && !w.completed && !w.exitedAt)?.id ?? null;

  if (liveId) {
    return (
      <Tracker
        workoutId={liveId}
        onExit={() => setTrackingId(null)}
        onFinished={() => { setTrackingId(null); setTab('progress'); }}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-ink-950 text-ink-100 flex flex-col">
      {/* header */}
      <header className="sticky top-0 z-10 bg-ink-950/90 backdrop-blur border-b border-ink-900">
        <div className="mx-auto max-w-md px-5 py-3 flex items-center">
          <Logo size="sm" />
          <span className="ml-auto text-xs text-ink-500">Hey, {user.name.split(' ')[0]}</span>
        </div>
      </header>

      {/* content */}
      <main className="flex-1 mx-auto w-full max-w-md px-5 pt-5 pb-28">
        {tab === 'today' && <Today go={setTab} onStart={setTrackingId} />}
        {tab === 'shifts' && <Patterns />}
        {tab === 'workouts' && <Workouts go={setTab} onStart={setTrackingId} />}
        {tab === 'progress' && <Progress />}
        {tab === 'profile' && <Profile />}
      </main>

      {/* bottom tab bar — one-thumb reach */}
      <nav className="fixed bottom-0 inset-x-0 z-10 bg-ink-950/95 backdrop-blur border-t border-ink-900 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-md grid grid-cols-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                tab === id ? 'text-shock-300' : 'text-ink-500'
              }`}
            >
              <span className={`px-3.5 py-1 rounded-full transition-colors ${tab === id ? 'bg-shock-400/15' : ''}`}>
                <Icon className="h-5 w-5" strokeWidth={tab === id ? 2.5 : 2} />
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
