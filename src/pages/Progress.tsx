import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { useStore } from '../lib/store';
import { buildDayPlans, dateKey, parseDateKey, pad2 } from '../lib/schedule';
import { IntensityDot } from '../components/Fatigue';

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
  const { userWorkouts, activePattern, userSleepLogs, userOverrides } = useStore();
  const [range, setRange] = useState<Range>('All');
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-based

  const completed = useMemo(
    () => userWorkouts.filter((w) => w.completed).sort((a, b) => b.datetime.localeCompare(a.datetime)),
    [userWorkouts]
  );

  const stats = useMemo(() => {
    const cutoff = now.getTime() - RANGE_DAYS[range] * 86400000;
    const inRange = completed.filter((w) => new Date(w.datetime).getTime() >= cutoff);
    const count = inRange.length;
    const mins = inRange.reduce((t, w) => t + w.durationMin, 0);
    const vol = inRange.reduce((t, w) => t + volumeOf(w), 0);
    return { count, mins, hours: Math.round((mins / 60) * 10) / 10, vol };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, range]);

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
  };

  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const firstWeekday = new Date(calYear, calMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayKey = dateKey(now);
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-display font-semibold uppercase tracking-[0.06em]">Progress</h1>

      {/* stats card */}
      <section className="rounded-2xl bg-ink-900 border border-ink-800 p-5">
        <div className="flex rounded-xl bg-ink-800/60 p-1 mb-5">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
                range === r ? 'bg-shock-400 text-ink-950' : 'text-ink-400'
              }`}>
              {r}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 text-center divide-x divide-ink-800">
          <div>
            <p className="readout text-4xl text-shock-300">{stats.count}</p>
            <p className="text-xs text-ink-500 mt-1">Workouts logged</p>
          </div>
          <div>
            <p className="readout text-4xl text-shock-300">
              {stats.hours < 1 ? stats.mins : stats.hours}
            </p>
            <p className="text-xs text-ink-500 mt-1">{stats.hours < 1 ? 'Minutes' : 'Hours'} training</p>
          </div>
          <div>
            <p className="readout text-4xl text-shock-300">{fmtVolume(stats.vol)}</p>
            <p className="text-xs text-ink-500 mt-1">Total kg lifted</p>
          </div>
        </div>
      </section>

      {/* calendar */}
      <section className="rounded-2xl bg-ink-900 border border-ink-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => shiftMonth(-1)} className="p-2 rounded-lg text-ink-400 hover:bg-ink-800" aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-semibold">{monthLabel}</p>
          <div className="flex items-center gap-1">
            {!isCurrentMonth && (
              <button onClick={() => { setCalYear(now.getFullYear()); setCalMonth(now.getMonth()); }}
                className="text-xs font-semibold text-shock-300 px-2 py-1">Today</button>
            )}
            <button onClick={() => shiftMonth(1)} className="p-2 rounded-lg text-ink-400 hover:bg-ink-800" aria-label="Next month">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[11px] font-semibold text-ink-600 py-1">{d}</span>
          ))}
          {Array.from({ length: firstWeekday }, (_, i) => <span key={'b' + i} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const key = `${calYear}-${pad2(calMonth + 1)}-${pad2(day)}`;
            const trained = trainedDays.has(day);
            const rested = !trained && restWins.has(key);
            const isToday = key === todayKey;
            return (
              <span key={day} className="flex flex-col items-center py-1">
                <span className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  isToday ? 'ring-1 ring-shock-400/60 text-shock-300' : trained ? 'text-ink-100' : 'text-ink-500'
                }`}>
                  {day}
                </span>
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                  trained ? 'bg-shock-400' : rested ? 'bg-night-400' : 'bg-transparent'
                }`} />
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <span className="h-1.5 w-1.5 rounded-full bg-shock-400" /> Trained
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <span className="h-1.5 w-1.5 rounded-full bg-night-400" /> Rested as prescribed
          </span>
        </div>
      </section>

      {/* recent sessions */}
      <section className="rounded-2xl bg-ink-900 border border-ink-800 p-5">
        <h2 className="font-semibold mb-3">Recent sessions</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-ink-500 flex items-center gap-2">
            <Dumbbell className="h-4 w-4" /> Nothing logged yet — start a workout from the Workouts tab.
          </p>
        ) : (
          <ul className="divide-y divide-ink-800">
            {completed.slice(0, 8).map((w) => {
              const d = parseDateKey(w.datetime.slice(0, 10));
              const vol = volumeOf(w);
              return (
                <li key={w.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {w.type} <IntensityDot intensity={w.intensity} />
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
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
      </section>
    </div>
  );
}
