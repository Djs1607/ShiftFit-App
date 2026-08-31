// ── ShiftFit store: React Context + useReducer ──────────────────────
// Routing: single-page shell with in-app tab navigation (no URL
// sub-routes, so the static preview never hits a blank route).
// Persistence: localStorage only (local-only MVP auth per spec).

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { DayOverride, ShiftPattern, SleepLog, TrainingPlanRecord, User, Workout } from './types';
import type { CustomWorkout } from './library';
import { load, save, uid } from './storage';
import { localISO } from './schedule';

// Migrate workouts saved as UTC ISO ("...Z") to local-time datetimes,
// so date grouping lands them on the correct calendar day.
function migrateWorkouts(ws: Workout[]): Workout[] {
  return ws.map((w) =>
    w.datetime.endsWith('Z') ? { ...w, datetime: localISO(new Date(w.datetime)) } : w
  );
}

interface State {
  users: User[];
  sessionUserId: string | null;
  patterns: ShiftPattern[];
  workouts: Workout[];
  sleepLogs: SleepLog[];
  overrides: DayOverride[];
  customWorkouts: CustomWorkout[];
  trainingPlans: TrainingPlanRecord[];
}

type Action =
  | { type: 'signup'; name: string; email: string; password: string }
  | { type: 'login'; email: string; password: string }
  | { type: 'logout' }
  | { type: 'savePattern'; pattern: ShiftPattern }
  | { type: 'deletePattern'; id: string; userId: string }
  | { type: 'setActivePattern'; id: string; userId: string }
  | { type: 'saveWorkout'; workout: Workout }
  | { type: 'deleteWorkout'; id: string }
  | { type: 'toggleWorkout'; id: string }
  | { type: 'updateUser'; user: User }
  | { type: 'logSleep'; userId: string; dateKey: string; quality: SleepLog['quality'] }
  | { type: 'saveOverride'; override: DayOverride }
  | { type: 'clearOverride'; userId: string; dateKey: string }
  | { type: 'saveCustomWorkout'; workout: CustomWorkout }
  | { type: 'deleteCustomWorkout'; id: string }
  | { type: 'startPlan'; record: TrainingPlanRecord }
  | { type: 'cancelPlan'; userId: string };

const initial: State = {
  users: load<User[]>('users', []),
  sessionUserId: load<string | null>('session', null),
  patterns: load<ShiftPattern[]>('patterns', []),
  workouts: migrateWorkouts(load<Workout[]>('workouts', [])),
  sleepLogs: load<SleepLog[]>('sleepLogs', []),
  overrides: load<DayOverride[]>('overrides', []),
  customWorkouts: load<CustomWorkout[]>('customWorkouts', []),
  trainingPlans: load<TrainingPlanRecord[]>('trainingPlans', []),
};

export class AuthError extends Error {}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'signup': {
      const email = action.email.trim().toLowerCase();
      if (state.users.some((u) => u.email === email)) throw new AuthError('That email is already registered.');
      const user: User = {
        id: uid(),
        name: action.name.trim(),
        email,
        password: action.password,
        createdAt: new Date().toISOString(),
      };
      return { ...state, users: [...state.users, user], sessionUserId: user.id };
    }
    case 'login': {
      const email = action.email.trim().toLowerCase();
      const user = state.users.find((u) => u.email === email);
      if (!user || user.password !== action.password) throw new AuthError('Wrong email or password.');
      return { ...state, sessionUserId: user.id };
    }
    case 'logout':
      return { ...state, sessionUserId: null };
    case 'savePattern': {
      const exists = state.patterns.some((p) => p.id === action.pattern.id);
      const patterns = exists
        ? state.patterns.map((p) => (p.id === action.pattern.id ? action.pattern : p))
        : [...state.patterns, action.pattern];
      return { ...state, patterns };
    }
    case 'deletePattern': {
      const patterns = state.patterns.filter((p) => p.id !== action.id);
      // if the active pattern was deleted, activate another one of the user's
      const remaining = patterns.filter((p) => p.userId === action.userId);
      if (remaining.length && !remaining.some((p) => p.isActive)) {
        const promoted = { ...remaining[0], isActive: true };
        return { ...state, patterns: patterns.map((p) => (p.id === promoted.id ? promoted : p)) };
      }
      return { ...state, patterns };
    }
    case 'setActivePattern':
      return {
        ...state,
        patterns: state.patterns.map((p) =>
          p.userId === action.userId ? { ...p, isActive: p.id === action.id } : p
        ),
      };
    case 'saveWorkout': {
      const exists = state.workouts.some((w) => w.id === action.workout.id);
      const workouts = exists
        ? state.workouts.map((w) => (w.id === action.workout.id ? action.workout : w))
        : [...state.workouts, action.workout];
      return { ...state, workouts };
    }
    case 'deleteWorkout':
      return { ...state, workouts: state.workouts.filter((w) => w.id !== action.id) };
    case 'toggleWorkout':
      return {
        ...state,
        workouts: state.workouts.map((w) => (w.id === action.id ? { ...w, completed: !w.completed } : w)),
      };
    case 'updateUser':
      return { ...state, users: state.users.map((u) => (u.id === action.user.id ? action.user : u)) };
    case 'logSleep': {
      const existing = state.sleepLogs.find((s) => s.userId === action.userId && s.dateKey === action.dateKey);
      if (existing && existing.quality === action.quality) {
        // tapping the same quality again clears the log
        return { ...state, sleepLogs: state.sleepLogs.filter((s) => s.id !== existing.id) };
      }
      const log: SleepLog = { id: existing?.id ?? uid(), userId: action.userId, dateKey: action.dateKey, quality: action.quality };
      return {
        ...state,
        sleepLogs: existing
          ? state.sleepLogs.map((s) => (s.id === existing.id ? log : s))
          : [...state.sleepLogs, log],
      };
    }
    case 'saveOverride': {
      const exists = state.overrides.some(
        (o) => o.userId === action.override.userId && o.dateKey === action.override.dateKey
      );
      return {
        ...state,
        overrides: exists
          ? state.overrides.map((o) =>
              o.userId === action.override.userId && o.dateKey === action.override.dateKey ? action.override : o
            )
          : [...state.overrides, action.override],
      };
    }
    case 'clearOverride':
      return {
        ...state,
        overrides: state.overrides.filter(
          (o) => !(o.userId === action.userId && o.dateKey === action.dateKey)
        ),
      };
    case 'saveCustomWorkout': {
      const exists = state.customWorkouts.some((w) => w.id === action.workout.id);
      return {
        ...state,
        customWorkouts: exists
          ? state.customWorkouts.map((w) => (w.id === action.workout.id ? action.workout : w))
          : [...state.customWorkouts, action.workout],
      };
    }
    case 'deleteCustomWorkout':
      return { ...state, customWorkouts: state.customWorkouts.filter((w) => w.id !== action.id) };
    case 'startPlan':
      // one active plan per user — replace any existing record for them
      return {
        ...state,
        trainingPlans: [...state.trainingPlans.filter((p) => p.userId !== action.record.userId), action.record],
      };
    case 'cancelPlan':
      return { ...state, trainingPlans: state.trainingPlans.filter((p) => p.userId !== action.userId) };
    default:
      return state;
  }
}

interface Store extends State {
  user: User | null;
  userPatterns: ShiftPattern[];
  activePattern: ShiftPattern | null;
  userWorkouts: Workout[];
  userSleepLogs: SleepLog[];
  userOverrides: DayOverride[];
  userCustomWorkouts: CustomWorkout[];
  userActivePlan: TrainingPlanRecord | null;
  dispatch: React.Dispatch<Action>;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => save('users', state.users), [state.users]);
  useEffect(() => save('session', state.sessionUserId), [state.sessionUserId]);
  useEffect(() => save('patterns', state.patterns), [state.patterns]);
  useEffect(() => save('workouts', state.workouts), [state.workouts]);
  useEffect(() => save('sleepLogs', state.sleepLogs), [state.sleepLogs]);
  useEffect(() => save('overrides', state.overrides), [state.overrides]);
  useEffect(() => save('customWorkouts', state.customWorkouts), [state.customWorkouts]);
  useEffect(() => save('trainingPlans', state.trainingPlans), [state.trainingPlans]);

  const store = useMemo<Store>(() => {
    const user = state.users.find((u) => u.id === state.sessionUserId) ?? null;
    const userPatterns = user ? state.patterns.filter((p) => p.userId === user.id) : [];
    const activePattern = userPatterns.find((p) => p.isActive) ?? null;
    const userWorkouts = user
      ? [...state.workouts.filter((w) => w.userId === user.id)].sort(
          (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        )
      : [];
    const userSleepLogs = user ? state.sleepLogs.filter((s) => s.userId === user.id) : [];
    const userOverrides = user ? state.overrides.filter((o) => o.userId === user.id) : [];
    const userCustomWorkouts = user ? state.customWorkouts.filter((w) => w.userId === user.id) : [];
    const userActivePlan = user ? state.trainingPlans.find((p) => p.userId === user.id) ?? null : null;
    return { ...state, user, userPatterns, activePattern, userWorkouts, userSleepLogs, userOverrides, userCustomWorkouts, userActivePlan, dispatch };
  }, [state]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
