// ShiftFit — single-page shell with in-app tab navigation.
// State management: React Context + useReducer (src/lib/store.tsx),
// persisted to localStorage. No URL sub-routes are used, so the
// static preview always renders from "/".

import { useEffect, useState } from 'react';
import { Dumbbell, UserRound, LayoutDashboard, TrendingUp } from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import { load, save } from './lib/storage';
import { localISO } from './lib/schedule';
import { useRestTimer } from './lib/restTimer';
import { useSessionView } from './lib/sessionView';
import { TabBar, type TabBarItem } from './components/ds';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Today from './pages/Today';
import Patterns from './pages/Patterns';
import Workouts from './pages/Workouts';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Tracker from './pages/Tracker';
import { WorkoutPill } from './components/WorkoutPill';

// `shifts` (the Patterns/Shifts page) is not shown in the bottom tab bar —
// it's reached via the "Shift pattern" row on the Profile page instead,
// since rotation editing is rare.
export type Tab = 'today' | 'shifts' | 'workouts' | 'progress' | 'profile';

const TABS: TabBarItem<Tab>[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

function Shell() {
  const { user, userWorkouts, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>('today');
  const [trackingId, setTrackingId] = useState<string | null>(null);
  // minimized: the active workout keeps running but Tracker is off screen
  // (a pill above the tab bar stands in). A rest running out pulls it back up.
  const [minimized, setMinimized] = useState(false);
  const restTimer = useRestTimer(() => setMinimized(false));

  // auto-resume a session that was started but never finished or exited
  const liveId = trackingId ?? userWorkouts.find((w) => w.startedAt && !w.completed && !w.exitedAt)?.id ?? null;
  const liveWorkout = userWorkouts.find((w) => w.id === liveId);
  const session = useSessionView(liveId, liveWorkout);
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

  // Starting or resuming a workout always brings it to full screen. If a
  // *different* workout is still active (i.e. minimized), pause it exactly
  // as Exit would: keep its data, mark it exited so it doesn't quietly
  // auto-resume later, and drop its rest timer and view state.
  const startWorkout = (id: string) => {
    const other = liveId && liveId !== id ? userWorkouts.find((w) => w.id === liveId) : undefined;
    if (other) {
      dispatch({ type: 'saveWorkout', workout: { ...other, exitedAt: localISO(new Date()) } });
      restTimer.reset();
      session.reset();
    }
    setTrackingId(id);
    setMinimized(false);
  };

  if (liveId && !minimized) {
    return (
      <Tracker
        workoutId={liveId}
        restTimer={restTimer}
        session={session}
        onMinimize={() => setMinimized(true)}
        onExit={() => { restTimer.reset(); session.reset(); setMinimized(false); setTrackingId(null); }}
        onFinished={() => { restTimer.reset(); session.reset(); setMinimized(false); setTrackingId(null); setTab('progress'); }}
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
      <main
        className="flex-1 mx-auto w-full max-w-md px-5 pt-5"
        style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + ${liveId ? 136 : 80}px)` }}
      >
        {tab === 'today' && <Today go={setTab} onStart={startWorkout} />}
        {tab === 'shifts' && <Patterns />}
        {tab === 'workouts' && <Workouts go={setTab} onStart={startWorkout} />}
        {tab === 'progress' && <Progress />}
        {tab === 'profile' && <Profile go={setTab} />}
      </main>

      {liveId && (
        <WorkoutPill
          restTimer={restTimer}
          label={liveWorkout?.exercises?.[session.currentExIdx]?.name ?? liveWorkout?.type ?? 'Workout'}
          onOpen={() => setMinimized(false)}
        />
      )}

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
