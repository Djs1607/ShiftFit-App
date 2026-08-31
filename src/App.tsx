// ShiftFit — single-page shell with in-app tab navigation.
// State management: React Context + useReducer (src/lib/store.tsx),
// persisted to localStorage. No URL sub-routes are used, so the
// static preview always renders from "/".

import { useEffect, useState } from 'react';
import { CalendarDays, Dumbbell, UserRound, LayoutDashboard, TrendingUp } from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import { load, save } from './lib/storage';
import { TabBar, type TabBarItem } from './components/ds';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Today from './pages/Today';
import Patterns from './pages/Patterns';
import Workouts from './pages/Workouts';
import Plan from './pages/Plan';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Tracker from './pages/Tracker';

// `shifts` (the Patterns/Shifts page) is not shown in the bottom tab bar —
// it's reached via the "Shift pattern" row on the Profile page instead,
// since rotation editing is rare.
export type Tab = 'today' | 'shifts' | 'workouts' | 'plan' | 'progress' | 'profile';

const TABS: TabBarItem<Tab>[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'plan', label: 'Plan', icon: CalendarDays },
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
    <div className="min-h-dvh bg-bg-base text-fg-primary flex flex-col">
      {/* Status-bar scrim. Deliberately empty: anything rendered up here sits
          under the iPhone clock (left) and battery readout (right). It only
          reserves the safe-area inset and blurs content scrolling beneath it.
          Branding lives on Auth/Onboarding; the greeting lives on Today. */}
      <div
        aria-hidden
        className="sticky top-0 z-20 h-[env(safe-area-inset-top)] bg-bg-base/95 backdrop-blur"
      />

      {/* content */}
      <main className="flex-1 mx-auto w-full max-w-md px-5 pt-5 pb-28">
        {tab === 'today' && <Today go={setTab} onStart={setTrackingId} />}
        {tab === 'shifts' && <Patterns />}
        {tab === 'workouts' && <Workouts go={setTab} onStart={setTrackingId} />}
        {tab === 'plan' && <Plan />}
        {tab === 'progress' && <Progress />}
        {tab === 'profile' && <Profile go={setTab} />}
      </main>

      {/* bottom tab bar — one-thumb reach */}
      <div className="fixed bottom-0 inset-x-0 z-20 pb-[env(safe-area-inset-bottom)] bg-surface-card/95 backdrop-blur border-t border-line-subtle">
        <div className="mx-auto max-w-md">
          <TabBar items={TABS} active={tab} onChange={setTab} className="border-t-0 bg-transparent" />
        </div>
      </div>
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
