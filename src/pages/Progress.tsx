import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { useStore } from '../lib/store';
import { buildDayPlans, dateKey, parseDateKey, pad2 } from '../lib/schedule';
import { PLANS, computePlanProgress } from '../lib/plans';
import { WORKOUT_LIBRARY } from '../lib/library';
import { IntensityDot } from '../components/Fatigue';
import { Badge, Card, IconButton, MetricTile, SegmentedControl, SparkBars } from '../components/ds';

type Range = '1W' | '1M' | '6M' | '1Y' | 'All';
const RANGES: Range[] = ['1W', '1M', '6M', '1Y', 'All'];
const RANGE_DAYS: Record<Range, number> = { '1W': 7, '1M': 30, '6M': 182, '1Y': 365, All: 36500 };

function volumeOf(w: { exercises?: { sets: { reps: number; weightKg: number; done: boolean }[] }[] }): number {
  let v = 0;
  for (const e of w.exercises ?? []) for (const s of e.sets) if (s.done) v += s.weightKg * s.reps;
  return v;
}

function fmtVolume(kg: number): string {
  if (kg >= 1000000) return `${(kg / 1000000).toFixed(1)}M`;
  if (kg >= 1000) return `${Math.round(kg / 1000)}K`;
  return String(Math.round(kg));
}

export default function Progress() {
  const { userWorkouts, activePattern, userSleepLogs, userOverrides, userActivePlan } = useStore();
  const [range, setRange] = useState<Range>('All');
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-based
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // dateKey, or null = default recent list

  const completed = useMemo(
    () => userWorkouts.filter((w) => w.completed).sort((a, b) => b.datetime.localeCompare(a.datetime)),
    [userWorkouts]
  );

  // active training plan's progress — same shared math Plan.tsx uses, so the
  // two screens can't disagree on week/session counts
  const activePlan = userActivePlan ? PLANS.find((p) => p.id === userActivePlan.planId) ?? null : null;
  const planProgress = useMemo(() => {
    if (!activePlan) return null;
    const base = computePlanProgress(activePlan, userWorkouts);
    const nextUp = WORKOUT_LIBRARY.find((l) => l.id === activePlan.sessionTemplate[base.nextIndex]) ?? null;
    return { ...base, nextUp };
  }, [activePlan, userWorkouts]);

  const stats = useMemo(() => {
    const cutoff = now.getTime() - RANGE_DAYS[range] * 86400000;
    const inRange = completed.filter((w) => new Date(w.datetime).getTime() >= cutoff);
    const count = inRange.length;
    const mins = inRange.reduce((t, w) => t + w.durationMin, 0);
    const vol = inRange.reduce((t, w) => t + volumeOf(w), 0);
    return { count, mins, hours: Math.round((mins / 60) * 10) / 10, vol };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, range]);

  // last 7 days of lifted volume — axis-free trend, today highlighted
  const weekBars = useMemo(() => {
    const days: { key: string; vol: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = dateKey(d);
      const vol = completed.filter((w) => w.datetime.slice(0, 10) === key).reduce((t, w) => t + volumeOf(w), 0);
      days.push({ key, vol });
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  // days the user rested exactly as prescribed (a win for this audience)
  const restWins = useMemo(() => {
    if (!activePattern) return new Set<string>();
    const from = new Date(calYear, calMonth, 1);
    const to = new Date(calYear, calMonth + 1, 0);
    const plans = buildDayPlans(activePattern, from, to, userWorkouts, {
      sleepLogs: userSleepLogs,
      overrides: userOverrides,
    });
    const trained = new Set(completed.map((w) => w.datetime.slice(0, 10)));
    const today = dateKey(new Date());
    return new Set(
      plans
        .filter((p) => p.recommendation === 'rest' && p.dateKey <= today && !trained.has(p.dateKey))
        .map((p) => p.dateKey)
    );
  }, [activePattern, calYear, calMonth, userWorkouts, userSleepLogs, userOverrides, completed]);

  // days in the displayed month that have a completed workout
  const trainedDays = useMemo(() => {
    const prefix = `${calYear}-${pad2(calMonth + 1)}-`;
    const set = new Set<number>();
    for (const w of completed) {
      if (w.datetime.startsWith(prefix)) set.add(Number(w.datetime.slice(8, 10)));
    }
    return set;
  }, [completed, calYear, calMonth]);

  const shiftMonth = (delta: number) => {
    const d = new Date(calYear, calMonth + delta, 1);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
    setSelectedDay(null);
  };

  const selectDay = (key: string) => setSelectedDay((cur) => (cur === key ? null : key));

  // workouts completed on the selected calendar day, most recent first
  const selectedDayWorkouts = useMemo(
    () => (selectedDay ? completed.filter((w) => w.datetime.slice(0, 10) === selectedDay) : []),
    [completed, selectedDay]
  );

  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const firstWeekday = new Date(calYear, calMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayKey = dateKey(now);
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

  return (
    <div className="space-y-5">
      <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">Progress</h1>

      {/* active training plan — mirrors Plan.tsx's summary card, read-only here */}
      {activePlan && planProgress && (
        <Card tone="default" padding="lg" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line-subtle bg-surface-inset">
                <activePlan.icon size={18} strokeWidth={2} className="text-fg-secondary" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold text-fg-primary truncate">{activePlan.name}</p>
                <p className="text-[13px] text-fg-tertiary">Week {planProgress.week} of {activePlan.weeks}</p>
              </div>
            </div>
            <Badge tone="neutral">{planProgress.isComplete ? 'Complete' : 'Active'}</Badge>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">Sessions</span>
              <span className="font-mono text-[13px] font-medium text-fg-secondary">
                {planProgress.completedSessions} of {planProgress.totalSessions}
              </span>
            </div>
            <div className="overflow-hidden rounded-pill bg-data-track" style={{ height: 8 }}>
              <div
                className="h-full rounded-pill bg-fg-tertiary transition-[width] duration-slow ease-mechanical"
                style={{ width: `${planProgress.pct}%` }}
              />
            </div>
          </div>

          {!planProgress.isComplete && planProgress.nextUp && (
            <p className="text-[13px] text-fg-secondary">
              Next up: <span className="text-fg-primary font-medium">{planProgress.nextUp.name}</span>
            </p>
          )}
        </Card>
      )}

      {/* stats card */}
      <Card tone="default" padding="lg">
        <SegmentedControl options={RANGES} value={range} onChange={setRange} className="mb-5" />
        <div className="grid grid-cols-3 text-center divide-x divide-line-subtle">
          <MetricTile label="Workouts" value={stats.count} size="sm" className="items-center" />
          <MetricTile label={stats.hours < 1 ? 'Minutes' : 'Hours'} value={stats.hours < 1 ? stats.mins : stats.hours} size="sm" className="items-center" />
          <MetricTile label="Kg lifted" value={fmtVolume(stats.vol)} size="sm" className="items-center" />
        </div>
      </Card>

      {/* weekly volume trend */}
      <Card tone="default" padding="lg">
        <h2 className="text-[15px] font-semibold text-fg-primary mb-3">Last 7 days</h2>
        <SparkBars
          data={weekBars.map((d) => d.vol)}
          labels={weekBars.map((d) => parseDateKey(d.key).toLocaleDateString(undefined, { weekday: 'narrow' }))}
          highlightLast
        />
      </Card>

      {/* calendar */}
      <Card tone="default" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <IconButton icon={ChevronLeft} label="Previous month" onClick={() => shiftMonth(-1)} />
          <p className="text-[15px] font-semibold text-fg-primary">{monthLabel}</p>
          <div className="flex items-center gap-1">
            {!isCurrentMonth && (
              <button onClick={() => { setCalYear(now.getFullYear()); setCalMonth(now.getMonth()); setSelectedDay(null); }}
                className="text-[12px] font-semibold text-coral-300 px-2 py-1">Today</button>
            )}
            <IconButton icon={ChevronRight} label="Next month" onClick={() => shiftMonth(1)} />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[11px] font-semibold text-fg-disabled py-1">{d}</span>
          ))}
          {Array.from({ length: firstWeekday }, (_, i) => <span key={'b' + i} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const key = `${calYear}-${pad2(calMonth + 1)}-${pad2(day)}`;
            const trained = trainedDays.has(day);
            const rested = !trained && restWins.has(key);
            const isToday = key === todayKey;
            const isSelected = key === selectedDay;
            return (
              <button key={day} onClick={() => selectDay(key)} className="flex flex-col items-center py-1">
                <span className={`h-8 w-8 flex items-center justify-center rounded-full text-[14px] font-medium transition-colors duration-fast ease-standard ${
                  isSelected
                    ? 'bg-action-accent text-fg-onAccent'
                    : isToday
                    ? 'ring-1 ring-coral-400/60 text-coral-300'
                    : trained
                    ? 'text-fg-primary'
                    : 'text-fg-tertiary'
                }`}>
                  {day}
                </span>
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                  trained ? 'bg-action-accent' : rested ? 'bg-coral-400' : 'bg-transparent'
                }`} />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <span className="flex items-center gap-1.5 text-[11px] text-fg-tertiary">
            <span className="h-1.5 w-1.5 rounded-full bg-action-accent" /> Trained
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-fg-tertiary">
            <span className="h-1.5 w-1.5 rounded-full bg-coral-400" /> Rested as prescribed
          </span>
        </div>
      </Card>

      {/* recent sessions — or, when a calendar day is selected, just that day's */}
      <Card tone="default" padding="lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-fg-primary">
            {selectedDay
              ? parseDateKey(selectedDay).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
              : 'Recent sessions'}
          </h2>
          {selectedDay && (
            <button onClick={() => setSelectedDay(null)} className="text-[12px] font-semibold text-coral-300 px-2 py-1">
              Show recent
            </button>
          )}
        </div>
        {(selectedDay ? selectedDayWorkouts : completed).length === 0 ? (
          <p className="text-[14px] text-fg-tertiary flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            {selectedDay ? 'No workouts logged on this day.' : 'Nothing logged yet. Start a workout from the Workouts tab.'}
          </p>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {(selectedDay ? selectedDayWorkouts : completed.slice(0, 8)).map((w) => {
              const d = parseDateKey(w.datetime.slice(0, 10));
              const vol = volumeOf(w);
              return (
                <li key={w.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-fg-primary flex items-center gap-2">
                      {w.type} <IntensityDot intensity={w.intensity} />
                    </p>
                    <p className="text-[13px] text-fg-tertiary mt-0.5">
                      {d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' · '}{w.durationMin} min
                      {vol > 0 && ` · ${fmtVolume(vol)} kg`}
                      {w.exercises && w.exercises.length > 0 && ` · ${w.exercises.length} exercises`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
