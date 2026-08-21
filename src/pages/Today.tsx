import { useMemo, useState } from 'react';
import { Moon, Sun, ChevronRight, Play, BedDouble, Check, Pencil } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import { buildDayPlans, fmtTime, dateKey, localISO } from '../lib/schedule';
import { WORKOUT_LIBRARY } from '../lib/library';
import { fatigueText, FatigueBar } from '../components/Fatigue';
import TimePicker from '../components/TimePicker';
import type { Tab } from '../App';
import type { Recommendation, SleepQuality, Workout } from '../lib/types';

// one-tap session for each recommendation level
const START_PICKS: Record<Recommendation, string> = {
  rest: 'mobility-reset',
  light: 'recovery-walk',
  moderate: 'full-body-moderate',
  hard: 'heavy-lifts',
};
const START_LABELS: Record<Recommendation, string> = {
  rest: 'Too cooked? Just the 10-min reset',
  light: 'Start now — light session',
  moderate: 'Start now — moderate session',
  hard: 'Start now — go hard',
};

// what the fatigue ring is telling you, in one line
const FATIGUE_SUBTITLE: Record<Recommendation, string> = {
  rest: 'Recovery day',
  light: 'Take it easy today',
  moderate: 'Steady day ahead',
  hard: 'Push hard today',
};

const SLEEP_OPTIONS: { q: SleepQuality; label: string }[] = [
  { q: 'good', label: 'Slept well' },
  { q: 'ok', label: 'So-so' },
  { q: 'poor', label: 'Barely slept' },
];

function volumeOf(w: Workout): number {
  let v = 0;
  for (const e of w.exercises ?? []) for (const s of e.sets) if (s.done) v += s.weightKg * s.reps;
  return v;
}

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}

// horizontal fatigue readout — number + verdict lead, bar gives it scale at a glance
function FatigueReadout({ score, subtitle }: { score: number; subtitle: string }) {
  return (
    <div>
      <p className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`readout text-4xl ${fatigueText(score)}`}>{score}</span>
        <span className="text-ink-600 font-display text-lg">/100</span>
        <span className="text-ink-400 text-sm">— {subtitle}</span>
      </p>
      <div className="mt-3">
        <FatigueBar score={score} />
      </div>
    </div>
  );
}

export default function Today({ go, onStart }: { go: (t: Tab) => void; onStart: (id: string) => void }) {
  const { user, activePattern, userWorkouts, userSleepLogs, userOverrides, dispatch } = useStore();
  const [editingDay, setEditingDay] = useState(false);
  const [editingSleep, setEditingSleep] = useState(false);

  const plans = useMemo(() => {
    if (!activePattern) return [];
    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + 6 * 86400000);
    return buildDayPlans(activePattern, from, to, userWorkouts, {
      sleepLogs: userSleepLogs,
      overrides: userOverrides,
    });
  }, [activePattern, userWorkouts, userSleepLogs, userOverrides]);

  if (!user) return null;

  const now = new Date();
  const firstName = user.name.trim().split(/\s+/)[0];

  if (!activePattern) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl leading-tight">
          {greeting(now)}, {firstName}
        </h1>
        <EmptyState
          title="No shift pattern yet"
          body="Define your rotation once — ShiftFit projects it onto the calendar and tells you when to push, go light, or rest."
          cta="Build my rotation"
          onCta={() => go('shifts')}
        />
      </div>
    );
  }

  const today = plans[0];
  const tomorrow = plans[1];
  const onShiftNow = today.shift && now >= today.shift.start && now <= today.shift.end;
  const todayKey = dateKey(now);
  const todaysWorkouts = userWorkouts.filter((w) => w.datetime.slice(0, 10) === todayKey);
  const doneToday = todaysWorkouts.filter((w) => w.completed);
  const doneMins = doneToday.reduce((t, w) => t + w.durationMin, 0);
  const doneVol = doneToday.reduce((t, w) => t + volumeOf(w), 0);
  const sleepToday = userSleepLogs.find((s) => s.dateKey === todayKey)?.quality;

  const nextWorkout = todaysWorkouts.find((w) => !w.completed);
  const suggested = WORKOUT_LIBRARY.find((l) => l.id === START_PICKS[today.recommendation]) ?? WORKOUT_LIBRARY[0];
  const isRest = !nextWorkout && today.recommendation === 'rest' && doneToday.length === 0;
  const isDone = doneToday.length > 0;

  const startSuggested = () => {
    const w: Workout = {
      id: uid(),
      userId: user.id,
      datetime: localISO(new Date()),
      type: suggested.type,
      durationMin: suggested.durationMin,
      intensity: suggested.intensity,
      completed: false,
      libraryId: suggested.id,
      notes: suggested.name,
    };
    dispatch({ type: 'saveWorkout', workout: w });
    onStart(w.id);
  };

  // resolve what today's session actually is, once, for the hero card + details below
  const w = nextWorkout;
  const lib = (w ? WORKOUT_LIBRARY.find((l) => l.id === w.libraryId) : suggested) ?? suggested;
  const sessionName = w ? (w.notes ?? w.type) : isRest ? 'Rest day' : lib.name;
  const plan = w?.exercises?.length
    ? w.exercises.map((e) => ({ name: e.name, sets: e.sets.length, reps: e.sets[0]?.reps ?? 0 }))
    : (lib.plan ?? []).map((p) => ({ name: p.name, sets: p.sets, reps: p.reps }));
  const mins = w ? w.durationMin : isRest ? 0 : lib.durationMin;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── header: greeting + one-line shift status ── */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl leading-tight">
          {greeting(now)}, {firstName}
        </h1>
        <div className="flex items-center gap-1.5 text-sm text-ink-400 mt-1">
          {today.shift ? (
            <span className="flex items-center gap-1.5">
              {today.shift.isNight ? <Moon className="h-3.5 w-3.5 text-night-300" /> : <Sun className="h-3.5 w-3.5 text-day-300" />}
              {onShiftNow ? 'On shift now' : `Shift ${fmtTime(today.shift.start)}–${fmtTime(today.shift.end)}`}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-ember-300" /> No shift today
            </span>
          )}
          <span className="text-ink-700">·</span>
          <span>{FATIGUE_SUBTITLE[today.recommendation]}</span>
          <button onClick={() => setEditingDay((v) => !v)} className="ml-auto text-ink-600 p-1 -m-1">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        {editingDay && (
          <div className="mt-3">
            <OverrideEditor
              dateKey={todayKey}
              existing={userOverrides.find((o) => o.dateKey === todayKey)}
              userId={user.id}
              onClose={() => setEditingDay(false)}
            />
          </div>
        )}
      </div>

      {/* ── hero: fatigue bar + today's session + primary action, all above the fold ── */}
      <section className="rounded-3xl bg-ink-900/60 p-5">
        <FatigueReadout score={today.fatigue} subtitle={FATIGUE_SUBTITLE[today.recommendation]} />

        <div className="mt-5 pt-5 border-t border-ink-800 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-ink-500 text-[11px] font-semibold uppercase tracking-[0.14em]">
              {isDone ? 'Done for today' : isRest ? 'Rest day' : 'Today'}
            </p>
            <p className="font-display text-xl leading-tight truncate">{isDone ? `${doneToday.length} session${doneToday.length > 1 ? 's' : ''} logged` : sessionName}</p>
            {!isDone && (
              <p className="text-xs text-ink-500 truncate">
                {isRest ? 'Recovery is training too' : `${plan.length > 0 ? `${plan.length} exercises` : lib.type} · ${mins} min`}
              </p>
            )}
            {isDone && <p className="text-xs text-ink-500">{doneMins} min{doneVol > 0 && ` · ${doneVol} kg`}</p>}
          </div>
        </div>

        {isDone ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-ember-400/10 px-4 py-3">
            <Check className="h-4 w-4 text-ember-300 shrink-0" strokeWidth={3} />
            <span className="text-sm text-ember-300 font-semibold">Nice work — you're set for today</span>
          </div>
        ) : isRest ? (
          <button
            onClick={startSuggested}
            className="mt-4 w-full rounded-xl border border-ink-700 py-3 text-sm font-semibold text-ink-300 active:bg-ink-800"
          >
            Do the 10-min reset anyway
          </button>
        ) : (
          <button
            onClick={() => (w ? onStart(w.id) : startSuggested())}
            className="mt-4 w-full rounded-xl bg-ember-400 text-ink-950 font-bold py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Play className="h-5 w-5" strokeWidth={2.5} />
            {w ? (w.startedAt ? 'Resume workout' : 'Start workout') : START_LABELS[today.recommendation]}
          </button>
        )}
      </section>

      {/* ── sleep log — sits right under the fatigue/session hero, one line once logged ── */}
      <section>
        {sleepToday && !editingSleep ? (
          <button
            onClick={() => setEditingSleep(true)}
            className="w-full flex items-center justify-between rounded-2xl bg-ink-900/60 px-5 py-3.5"
          >
            <span className="flex items-center gap-2 text-sm text-ink-300">
              <BedDouble className="h-4 w-4 text-ink-500" />
              {SLEEP_OPTIONS.find((o) => o.q === sleepToday)?.label}
            </span>
            <span className="text-xs text-ink-500 font-semibold">Change</span>
          </button>
        ) : (
          <div className="rounded-3xl bg-ink-900/60 p-5">
            <p className="text-sm text-ink-400 flex items-center gap-2 mb-3">
              <BedDouble className="h-4 w-4" /> How did you sleep?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SLEEP_OPTIONS.map(({ q, label }) => (
                <button
                  key={q}
                  onClick={() => {
                    dispatch({ type: 'logSleep', userId: user.id, dateKey: todayKey, quality: q });
                    setEditingSleep(false);
                  }}
                  className={`rounded-xl py-3 text-xs font-semibold transition-colors ${
                    sleepToday === q ? 'bg-night-400 text-ink-950' : 'bg-ink-800 text-ink-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── exercise breakdown (below the fold is fine — hero already covers "what do I do") ── */}
      {!isDone && plan.length > 0 && (
        <section className="rounded-3xl bg-ink-900/60 p-5">
          <ul className="divide-y divide-ink-800">
            {plan.map((e, i) => (
              <li key={i} className="py-2.5 flex items-center justify-between">
                <p className="font-medium text-sm text-ink-200">{e.name}</p>
                <p className="text-xs text-ink-500">{e.sets} × {e.reps}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isDone && (
        <section className="space-y-2">
          {doneToday.map((wk) => (
            <div key={wk.id} className="flex items-center gap-2.5 rounded-2xl bg-ember-400/5 px-4 py-3">
              <Check className="h-4 w-4 text-ember-300 shrink-0" strokeWidth={3} />
              <span className="text-sm text-ink-400 flex-1 line-through">{wk.notes ?? wk.type}</span>
              <span className="text-xs text-ember-300 font-semibold">{wk.durationMin}m</span>
            </div>
          ))}
          {tomorrow && (
            <p className="text-sm text-ink-500 px-1">
              Tomorrow: {tomorrow.shift ? `${fmtTime(tomorrow.shift.start)}–${fmtTime(tomorrow.shift.end)}` : 'off'} · {FATIGUE_SUBTITLE[tomorrow.recommendation].toLowerCase()}
            </p>
          )}
        </section>
      )}

      <button
        onClick={() => go('workouts')}
        className="text-ink-500 text-xs font-semibold flex items-center gap-1"
      >
        Plan ahead in the Planner <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── single-day override editor ──────────────────────────────────────

function OverrideEditor({
  dateKey: key, existing, userId, onClose,
}: { dateKey: string; existing?: { kind: 'off' | 'shift' }; userId: string; onClose: () => void }) {
  const { dispatch } = useStore();
  const [start, setStart] = useState('07:00');
  const [end, setEnd] = useState('15:00');
  const [custom, setCustom] = useState(false);

  const saveOff = () => {
    dispatch({ type: 'saveOverride', override: { id: uid(), userId, dateKey: key, kind: 'off' } });
    onClose();
  };
  const saveShift = () => {
    dispatch({ type: 'saveOverride', override: { id: uid(), userId, dateKey: key, kind: 'shift', startTime: start, endTime: end } });
    onClose();
  };

  return (
    <div className="rounded-2xl bg-ink-800/50 border border-ink-700 p-3.5 space-y-2.5">
      <p className="text-xs text-ink-400">Reality check for today:</p>
      <div className="flex gap-2">
        <button onClick={saveOff} className="flex-1 rounded-lg bg-ink-800 border border-ink-600 py-2 text-xs font-semibold text-ink-200 active:bg-ink-700">
          Off / sick instead
        </button>
        <button onClick={() => setCustom((c) => !c)} className={`flex-1 rounded-lg border py-2 text-xs font-semibold active:bg-ink-700 ${custom ? 'bg-ink-700 border-ink-500 text-ink-100' : 'bg-ink-800 border-ink-600 text-ink-200'}`}>
          Custom shift
        </button>
        {existing && (
          <button
            onClick={() => { dispatch({ type: 'clearOverride', userId, dateKey: key }); onClose(); }}
            className="flex-1 rounded-lg bg-ink-800 border border-ink-600 py-2 text-xs font-semibold text-caution-300 active:bg-ink-700"
          >
            Reset to rotation
          </button>
        )}
      </div>
      {custom && (
        <div className="flex items-center gap-2">
          <TimePicker value={start} onChange={setStart} className="flex-1" />
          <span className="text-ink-500 text-sm">→</span>
          <TimePicker value={end} onChange={setEnd} className="flex-1" />
          <button onClick={saveShift} className="rounded-lg bg-ember-400 text-ink-950 text-xs font-bold px-3.5 py-2.5">Save</button>
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title, body, cta, onCta,
}: { title: string; body: string; cta: string; onCta: () => void }) {
  return (
    <div className="rounded-3xl bg-ink-900/60 p-8 text-center">
      <h2 className="font-display text-3xl leading-tight mb-2.5">{title}</h2>
      <p className="text-sm text-ink-400 leading-relaxed mb-6">{body}</p>
      <button
        onClick={onCta}
        className="rounded-xl bg-ember-400 text-ink-950 font-bold px-6 py-3.5 active:scale-[0.98] transition-transform"
      >
        {cta}
      </button>
    </div>
  );
}
