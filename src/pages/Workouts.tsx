import { useCallback, useMemo, useState } from 'react';
import { Check, Moon, Plus, Sun, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { buildDayPlans, projectShifts, resolveDayShift, dateKey, fmtDayLabel, fmtTime } from '../lib/schedule';
import { WORKOUT_LIBRARY, type CustomWorkout, type LibraryWorkout } from '../lib/library';
import { IntensityDot, REC_META } from '../components/Fatigue';
import WorkoutCard from '../components/WorkoutCard';
import WorkoutBuilder from './WorkoutBuilder';
import WorkoutDetail from './WorkoutDetail';
import { Button, ConfirmSheet, EmptyState, SegmentedControl } from '../components/ds';
import type { Tab } from '../App';
import type { Recommendation, Workout } from '../lib/types';

const TYPE_FILTERS = ['Strength', 'Run', 'Cycle', 'Swim', 'HIIT', 'Mobility', 'Walk'];
const LEVEL_ORDER: Recommendation[] = ['rest', 'light', 'moderate', 'hard'];
const LEVEL_HEADING: Record<Recommendation, string> = {
  rest: 'Rest-day sessions',
  light: 'Light',
  moderate: 'Moderate',
  hard: 'Hard',
};

// Horizontal filter rail, mirroring the reference's chip row. A real button
// per chip so it is reachable by keyboard and announced as pressable.
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 shrink-0 whitespace-nowrap rounded-pill border px-3.5 text-[13px] font-medium
        transition-colors duration-fast ease-standard
        ${active
          ? 'border-[rgba(255,106,69,.45)] bg-surface-selected text-coral-300'
          : 'border-line-subtle bg-surface-raised text-fg-secondary hover:text-fg-primary'}`}
    >
      {children}
    </button>
  );
}

export default function Workouts({ go, onStart }: { go: (t: Tab) => void; onStart: (id: string) => void }) {
  const { user, activePattern, userWorkouts, userSleepLogs, userOverrides, userCustomWorkouts, dispatch } = useStore();

  const [mode, setMode] = useState<'browse' | 'plan'>('browse');
  const [fit, setFit] = useState<'today' | 'all'>('today');
  const [type, setType] = useState<string | null>(null);
  const [opened, setOpened] = useState<LibraryWorkout | CustomWorkout | null>(null);
  const [builder, setBuilder] = useState<'new' | CustomWorkout | null>(null);
  const [toDelete, setToDelete] = useState<CustomWorkout | null>(null);

  // today's fatigue score drives which sessions are surfaced first
  const todayPlan = useMemo(() => {
    if (!activePattern) return null;
    const from = new Date(); from.setHours(0, 0, 0, 0);
    return buildDayPlans(activePattern, from, from, userWorkouts, {
      sleepLogs: userSleepLogs,
      overrides: userOverrides,
    })[0];
  }, [activePattern, userWorkouts, userSleepLogs, userOverrides]);

  const rec = todayPlan?.recommendation;

  const all = useMemo(
    () => [...userCustomWorkouts, ...WORKOUT_LIBRARY] as (LibraryWorkout | CustomWorkout)[],
    [userCustomWorkouts]
  );

  const filtered = useMemo(
    () => all.filter((w) => (!type || w.type === type) && (fit === 'all' || !rec || w.level === rec)),
    [all, type, fit, rec]
  );

  // "Fits today" is one flat list; "All" groups by load so the page has shape
  const groups = useMemo(() => {
    if (fit === 'today') return [{ key: 'fit', heading: null, items: filtered }];
    return LEVEL_ORDER
      .map((lv) => ({ key: lv, heading: LEVEL_HEADING[lv], items: filtered.filter((w) => w.level === lv) }))
      .filter((g) => g.items.length > 0);
  }, [fit, filtered]);

  // memoised so the timeline below re-renders when a custom workout's
  // exercise list changes, rather than showing a stale preview line
  const previewOf = useCallback(
    (w: Workout): string => {
      const lib = w.libraryId
        ? WORKOUT_LIBRARY.find((l) => l.id === w.libraryId) ?? userCustomWorkouts.find((c) => c.id === w.libraryId)
        : undefined;
      const names = w.exercises?.length
        ? w.exercises.map((e) => e.name)
        : (lib?.plan ?? []).map((p) => p.name);
      if (!names.length) return '';
      const shown = names.slice(0, 3).join(' · ');
      return names.length > 3 ? `${shown} +${names.length - 3}` : shown;
    },
    [userCustomWorkouts]
  );

  // combined shift + workout timeline for the next 14 days
  const days = useMemo(() => {
    if (!activePattern) return [];
    const out: { key: string; label: string; items: { time: number; node: React.ReactNode }[] }[] = [];
    const from = new Date(); from.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const d = new Date(from.getTime() + i * 86400000);
      const key = dateKey(d);
      const items: { time: number; node: React.ReactNode }[] = [];

      const dayStart = new Date(d);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      const ov = userOverrides.find((o) => o.dateKey === key);
      const edited = !!ov;

      const shifts = ov
        ? ov.kind === 'off'
          ? []
          : [resolveDayShift(activePattern, dayStart, userOverrides)].filter((s) => s !== null)
        : projectShifts(activePattern, dayStart, dayEnd).filter(
            (s) => s.start.getTime() >= dayStart.getTime() && s.start.getTime() <= dayEnd.getTime()
          );

      if (edited && shifts.length === 0) {
        items.push({
          time: dayStart.getTime(),
          node: (
            <div key={'off' + i} className="flex items-center gap-3 rounded-control border border-dashed border-line-strong bg-surface-card px-3.5 py-3">
              <span className="text-[14px] text-fg-tertiary">Off <span className="text-[12px] text-amber-400/80">(edited)</span></span>
            </div>
          ),
        });
      }

      for (const s of shifts) {
        items.push({
          time: s.start.getTime(),
          node: (
            <div key={'s' + i} className="flex items-center gap-3 rounded-control border border-line-subtle bg-surface-card px-3.5 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-surface-raised">
                {s.isNight ? <Moon className="h-4 w-4 text-shift-night" /> : <Sun className="h-4 w-4 text-shift-day" />}
              </span>
              <span className="text-[14px] text-fg-body">
                Shift {fmtTime(s.start)} – {fmtTime(s.end)}
                <span className="ml-2 font-mono text-[12px] text-fg-tertiary">{Math.round(s.lengthHours)}h</span>
                {edited && <span className="ml-2 text-[12px] text-amber-400/80">(edited)</span>}
              </span>
            </div>
          ),
        });
      }

      for (const w of userWorkouts.filter((w) => w.datetime.slice(0, 10) === key)) {
        items.push({
          time: new Date(w.datetime).getTime(),
          node: (
            <div key={w.id} className={`flex items-center gap-3 rounded-control border px-3.5 py-3 ${w.completed ? 'border-line-subtle bg-action-primary-quiet/40' : 'border-line-default bg-surface-card'}`}>
              <button
                onClick={() => dispatch({ type: 'toggleWorkout', id: w.id })}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-fast ease-standard ${
                  w.completed ? 'border-action-primary bg-action-primary' : 'border-line-strong'
                }`}
                aria-label={w.completed ? 'Mark not done' : 'Mark done'}
              >
                {w.completed && <Check className="h-4 w-4 text-fg-onPrimary" strokeWidth={3} />}
              </button>
              <span className="min-w-0 flex-1">
                <span className={`flex items-baseline gap-1.5 text-[14px] ${w.completed ? 'text-fg-tertiary line-through' : 'text-fg-primary'}`}>
                  <span className="shrink-0 font-mono font-semibold">{fmtTime(new Date(w.datetime))}</span>
                  <span className="truncate font-medium">{w.notes ?? w.type}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-fg-tertiary">
                  {w.durationMin}m
                  <IntensityDot intensity={w.intensity} />
                  <span className="capitalize">{w.intensity}</span>
                </span>
                {previewOf(w) && <span className="mt-0.5 block truncate text-[12px] text-fg-disabled">{previewOf(w)}</span>}
              </span>
              {!w.completed && (
                <button
                  onClick={() => onStart(w.id)}
                  className="shrink-0 rounded-control bg-action-accent px-3 py-2 text-[12px] font-bold text-fg-onAccent active:scale-[0.97]"
                >
                  {w.startedAt ? 'Resume' : 'Start'}
                </button>
              )}
              <button onClick={() => dispatch({ type: 'deleteWorkout', id: w.id })} className="p-1.5 text-fg-disabled hover:text-feedback-danger" aria-label="Delete workout">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ),
        });
      }

      if (items.length) {
        items.sort((a, b) => a.time - b.time);
        out.push({ key, label: i === 0 ? 'Today' : fmtDayLabel(d), items });
      }
    }
    return out;
  }, [activePattern, userWorkouts, userOverrides, dispatch, onStart, previewOf]);

  // early returns come AFTER all hooks (React hook-order rules)
  if (!user) return null;

  if (!activePattern) {
    return (
      <EmptyState
        title="Set up your rotation first"
        message="ShiftFit needs your shift pattern before it can schedule workouts around it."
        action={<Button variant="primary" onClick={() => go('shifts')}>Build my rotation</Button>}
      />
    );
  }

  if (builder) {
    return <WorkoutBuilder existing={builder === 'new' ? null : builder} userId={user.id} onDone={() => setBuilder(null)} />;
  }

  if (opened) {
    return <WorkoutDetail workout={opened} onBack={() => setOpened(null)} onStart={onStart} />;
  }

  const scheduledCount = userWorkouts.filter((w) => !w.completed && w.datetime.slice(0, 10) >= dateKey(new Date())).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">Workouts</h1>
        <Button variant="secondary" size="sm" icon={Plus} onClick={() => setBuilder('new')}>Create</Button>
      </div>

      <SegmentedControl
        options={[
          { value: 'browse', label: 'Browse' },
          { value: 'plan', label: scheduledCount ? `My plan (${scheduledCount})` : 'My plan' },
        ]}
        value={mode}
        onChange={setMode}
      />

      {mode === 'browse' ? (
        <>
          {/* readiness line: says why these sessions, in fatigue language */}
          {rec && (
            <p className="text-[14px] leading-relaxed text-fg-secondary">
              Today scores{' '}
              <span className={`font-semibold ${REC_META[rec].text}`}>{todayPlan?.fatigue}</span>
              , a <span className={`font-semibold ${REC_META[rec].text}`}>{REC_META[rec].label.toLowerCase()}</span> day.
              {fit === 'today' ? ' These fit that.' : ' Browsing everything.'}
            </p>
          )}

          {/* filter rail */}
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Chip active={fit === 'today'} onClick={() => setFit('today')}>Fits today</Chip>
            <Chip active={fit === 'all'} onClick={() => setFit('all')}>All</Chip>
            <span className="my-1 w-px shrink-0 bg-line-subtle" />
            {TYPE_FILTERS.map((t) => (
              <Chip key={t} active={type === t} onClick={() => setType(type === t ? null : t)}>{t}</Chip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="Nothing matches"
              message="No sessions fit those filters. Widen them, or build your own."
              action={<Button variant="primary" onClick={() => { setFit('all'); setType(null); }}>Clear filters</Button>}
            />
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <section key={g.key}>
                  {g.heading && (
                    <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-fg-tertiary">{g.heading}</h2>
                  )}
                  <ul className="space-y-3">
                    {g.items.map((w) => (
                      <WorkoutCard
                        key={w.id}
                        workout={w}
                        custom={'userId' in w}
                        onOpen={setOpened}
                        onEdit={'userId' in w ? (cw) => setBuilder(cw) : undefined}
                        onDelete={'userId' in w ? (cw) => setToDelete(cw) : undefined}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      ) : days.length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          message="Your next 14 days are clear. Browse the library and pick something that fits your rotation."
          action={<Button variant="primary" onClick={() => setMode('browse')}>Browse workouts</Button>}
        />
      ) : (
        <div className="space-y-4">
          {days.map((d) => (
            <div key={d.key}>
              <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">{d.label}</p>
              <div className="space-y-2">{d.items.map((it) => it.node)}</div>
            </div>
          ))}
        </div>
      )}

      <ConfirmSheet
        open={!!toDelete}
        title={`Delete "${toDelete?.name}"?`}
        message="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) dispatch({ type: 'deleteCustomWorkout', id: toDelete.id });
          setToDelete(null);
        }}
      />
    </div>
  );
}
