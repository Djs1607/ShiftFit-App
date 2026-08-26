import { useMemo, useState, type CSSProperties } from 'react';
import { Moon, Sun, ChevronRight, Play, BedDouble, Check, Pencil } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import { buildDayPlans, fmtTime, dateKey, localISO } from '../lib/schedule';
import { WORKOUT_LIBRARY } from '../lib/library';
import TimePicker from '../components/TimePicker';
import LoadMotif from '../components/LoadMotif';
import { LOAD_LABEL, LOAD_RULE, LOAD_TEXT } from '../lib/load';
import { Button, EmptyState, FatigueGauge, ShiftRibbon, type ShiftRibbonDay } from '../components/ds';
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
  rest: 'Do the 10-min reset',
  light: 'Start light session',
  moderate: 'Start moderate session',
  hard: 'Start hard session',
};

// what the fatigue gauge is telling you, in one line
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

// staggered entrance index -> CSS custom property consumed by .rise
const rise = (i: number) => ({ '--rise-i': i }) as CSSProperties;

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
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">
          {greeting(now)}, {firstName}
        </h1>
        <EmptyState
          title="No shift pattern yet"
          message="Define your rotation once. ShiftFit projects it onto the calendar and tells you when to push, go light, or rest."
          action={<Button variant="primary" onClick={() => go('shifts')}>Build my rotation</Button>}
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
  const level = today.recommendation;

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

  // resolve what today's session actually is, once, for the panel + list below
  const w = nextWorkout;
  const lib = (w ? WORKOUT_LIBRARY.find((l) => l.id === w.libraryId) : suggested) ?? suggested;
  const sessionName = w ? (w.notes ?? w.type) : isRest ? 'Rest day' : lib.name;
  const plan = w?.exercises?.length
    ? w.exercises.map((e) => ({ name: e.name, sets: e.sets.length, reps: e.sets[0]?.reps ?? 0 }))
    : (lib.plan ?? []).map((p) => ({ name: p.name, sets: p.sets, reps: p.reps }));
  const mins = w ? w.durationMin : isRest ? 0 : lib.durationMin;

  // 7-day rota strip for context, reusing the fatigue engine's day plans
  const ribbonDays: ShiftRibbonDay[] = plans.map((p, i) => ({
    type: p.shift ? (p.shift.isNight ? 'night' : 'day') : 'off',
    label: p.date.toLocaleDateString(undefined, { weekday: 'narrow' }),
    today: i === 0,
    session: userWorkouts.some((wk) => wk.datetime.slice(0, 10) === p.dateKey),
  }));

  return (
    <div className="space-y-6">
      {/* ── greeting + live shift status ── */}
      <header className="rise" style={rise(0)}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => go('profile')}
            aria-label="Profile"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(255,106,69,.35)]
              bg-action-primary-quiet font-display text-[15px] font-semibold text-coral-300"
          >
            {firstName.slice(0, 1).toUpperCase()}
          </button>
          <h1 className="min-w-0 flex-1 truncate font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">
            {greeting(now)}, {firstName}
          </h1>
          <button
            onClick={() => setEditingDay((v) => !v)}
            aria-label="Correct today's shift"
            aria-expanded={editingDay}
            className="shrink-0 rounded-control p-2 text-fg-disabled hover:text-fg-secondary"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2.5 flex items-center gap-2 text-[14px] text-fg-secondary">
          {today.shift ? (
            <>
              {today.shift.isNight
                ? <Moon className="h-4 w-4 shrink-0 text-shift-night" />
                : <Sun className="h-4 w-4 shrink-0 text-shift-day" />}
              {onShiftNow
                ? 'On shift now'
                : <>Shift <span className="num">{fmtTime(today.shift.start)}</span> to <span className="num">{fmtTime(today.shift.end)}</span></>}
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 shrink-0 text-fg-tertiary" />
              No shift today
            </>
          )}
        </p>

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
      </header>

      {/* ── status panel: the page's subject, on a load-keyed motif ground ── */}
      <section
        className="rise relative overflow-hidden rounded-card border border-line-subtle bg-surface-card shadow-sm"
        style={rise(1)}
      >
        <LoadMotif level={level} intensity={0.9} scale={1.6} />
        {/* keeps the readout legible over the pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-card/60 via-surface-card/85 to-surface-card" />
        <span className={`absolute inset-y-0 left-0 w-[3px] ${LOAD_RULE[level]}`} aria-hidden />

        <div className="relative p-5">
          <div className="flex items-center gap-5">
            <FatigueGauge value={today.fatigue} size={116} thickness={9} label="Fatigue" />
            <div className="min-w-0 flex-1">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${LOAD_TEXT[level]}`}>
                {isDone ? 'Done for today' : LOAD_LABEL[level]}
              </p>
              <p className="mt-1 font-display text-[20px] font-semibold leading-tight tracking-[-0.01em] text-fg-primary">
                {isDone
                  ? `${doneToday.length} session${doneToday.length > 1 ? 's' : ''} logged`
                  : isRest
                    ? 'Nothing scheduled'
                    : sessionName}
              </p>
              {/* no advice line once the work is done: the stat strip below says
                  what happened, and "push hard today" would contradict it */}
              {!isDone && (
                <p className="mt-1 text-[13px] leading-relaxed text-fg-secondary">
                  {isRest
                    ? 'Recovery is training too.'
                    : `${plan.length > 0 ? `${plan.length} exercises` : lib.type}, ${mins} min`}
                </p>
              )}
              {sleepToday && (
                <p className="mt-1.5 text-[12px] text-fg-tertiary">Adjusted for your sleep</p>
              )}
            </div>
          </div>

          {/* what drove the score, sitting with the score rather than in the footer */}
          {!isDone && today.reasons.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-1.5">
              {today.reasons.slice(0, 3).map((r) => (
                <li key={r} className="num rounded-pill bg-surface-inset px-2.5 py-1 text-[11px] text-fg-tertiary">
                  {r}
                </li>
              ))}
            </ul>
          )}

          {/* done-state numbers borrow the stat-strip idiom from the workout detail page */}
          {isDone && (
            <dl className="mt-4 flex items-center gap-6 border-t border-line-subtle pt-4">
              {[
                { value: doneToday.length, label: doneToday.length === 1 ? 'Session' : 'Sessions' },
                { value: doneMins, label: 'Minutes' },
                ...(doneVol > 0 ? [{ value: `${doneVol}`, label: 'kg lifted' }] : []),
              ].map(({ value, label }) => (
                <div key={label}>
                  <dd className="readout text-[22px] text-fg-primary">{value}</dd>
                  <dt className="mt-1 text-[11px] uppercase tracking-[0.08em] text-fg-tertiary">{label}</dt>
                </div>
              ))}
            </dl>
          )}

          {isDone ? (
            <p className="mt-4 flex items-center gap-2 text-[14px] font-semibold text-amber-400">
              <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
              You're set for today
            </p>
          ) : (
            <Button
              variant={isRest ? 'secondary' : 'accent'}
              size="lg"
              fullWidth
              icon={Play}
              onClick={() => (w ? onStart(w.id) : startSuggested())}
              className="mt-5"
            >
              {w ? (w.startedAt ? 'Resume workout' : 'Start workout') : START_LABELS[level]}
            </Button>
          )}
        </div>
      </section>

      {/* ── rotation context: bare, no container, so it reads as a chart not a card ── */}
      <section className="rise" style={rise(2)}>
        <ShiftRibbon days={ribbonDays} height={28} />
        <p className="mt-2 text-[13px] text-fg-tertiary">
          {tomorrow && (
            <>Tomorrow {tomorrow.shift
              ? <><span className="num">{fmtTime(tomorrow.shift.start)}</span> to <span className="num">{fmtTime(tomorrow.shift.end)}</span></>
              : 'off'}, {FATIGUE_SUBTITLE[tomorrow.recommendation].toLowerCase()}.
            </>
          )}
        </p>
      </section>

      {/* ── sleep: a single row once answered, a choice while it isn't ── */}
      <section className="rise" style={rise(3)}>
        {sleepToday && !editingSleep ? (
          <button
            onClick={() => setEditingSleep(true)}
            className="flex w-full items-center gap-2.5 rounded-control border border-line-subtle bg-surface-card px-4 py-3
              text-left transition-colors duration-fast ease-standard hover:border-line-default"
          >
            <BedDouble className="h-4 w-4 shrink-0 text-fg-tertiary" />
            <span className="flex-1 text-[14px] text-fg-secondary">
              {SLEEP_OPTIONS.find((o) => o.q === sleepToday)?.label}
            </span>
            <span className="text-[13px] font-semibold text-fg-tertiary">Change</span>
          </button>
        ) : (
          <div className="rounded-control border border-line-subtle bg-surface-card p-4">
            <p className="mb-3 flex items-center gap-2 text-[14px] text-fg-secondary">
              <BedDouble className="h-4 w-4 shrink-0" /> How did you sleep?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SLEEP_OPTIONS.map(({ q, label }) => (
                <button
                  key={q}
                  onClick={() => {
                    dispatch({ type: 'logSleep', userId: user.id, dateKey: todayKey, quality: q });
                    setEditingSleep(false);
                  }}
                  className={`rounded-control py-3 text-[12px] font-semibold transition-colors duration-fast ease-standard ${
                    sleepToday === q ? 'bg-action-primary text-fg-onPrimary' : 'bg-surface-raised text-fg-secondary hover:text-fg-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── what's in the session: numbered rows, matching the workout detail page ── */}
      {!isDone && plan.length > 0 && (
        <section className="rise" style={rise(4)}>
          <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-fg-tertiary">The session</h2>
          <ul className="overflow-hidden rounded-card border border-line-subtle bg-surface-card">
            {plan.map((e, i) => (
              <li key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-line-subtle' : ''}`}>
                <span className="readout flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-inset text-[13px] text-fg-tertiary">
                  {i + 1}
                </span>
                <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-fg-primary">{e.name}</p>
                <p className="num shrink-0 text-[13px] text-fg-secondary">{e.sets} × {e.reps}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isDone && doneToday.length > 0 && (
        <section className="rise space-y-2" style={rise(4)}>
          {doneToday.map((wk) => (
            <div key={wk.id} className="flex items-center gap-2.5 rounded-control border border-line-subtle bg-surface-card px-4 py-3">
              <Check className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={3} />
              <span className="flex-1 truncate text-[14px] text-fg-tertiary line-through">{wk.notes ?? wk.type}</span>
              <span className="num shrink-0 text-[13px] font-semibold text-amber-400">{wk.durationMin}m</span>
            </div>
          ))}
        </section>
      )}

      <footer className="rise pt-1" style={rise(5)}>
        <button
          onClick={() => go('workouts')}
          className="flex items-center gap-1 text-[13px] font-semibold text-fg-tertiary hover:text-fg-secondary"
        >
          Browse workouts <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </footer>
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
    <div className="space-y-2.5 rounded-card border border-line-default bg-surface-raised p-3.5">
      <p className="text-[13px] text-fg-secondary">Reality check for today:</p>
      <div className="flex gap-2">
        <button onClick={saveOff} className="flex-1 rounded-control border border-line-strong bg-surface-inset py-2 text-[12px] font-semibold text-fg-body hover:bg-surface-hover">
          Off / sick instead
        </button>
        <button onClick={() => setCustom((c) => !c)} className={`flex-1 rounded-control border py-2 text-[12px] font-semibold hover:bg-surface-hover ${custom ? 'border-line-strong bg-surface-overlay text-fg-primary' : 'border-line-strong bg-surface-inset text-fg-body'}`}>
          Custom shift
        </button>
        {existing && (
          <button
            onClick={() => { dispatch({ type: 'clearOverride', userId, dateKey: key }); onClose(); }}
            className="flex-1 rounded-control border border-line-strong bg-surface-inset py-2 text-[12px] font-semibold text-amber-400 hover:bg-surface-hover"
          >
            Reset to rotation
          </button>
        )}
      </div>
      {custom && (
        <div className="flex items-center gap-2">
          <TimePicker value={start} onChange={setStart} className="flex-1" />
          <span className="text-[14px] text-fg-tertiary">to</span>
          <TimePicker value={end} onChange={setEnd} className="flex-1" />
          <button onClick={saveShift} className="rounded-control bg-action-accent px-3.5 py-2.5 text-[12px] font-bold text-fg-onAccent">Save</button>
        </div>
      )}
    </div>
  );
}
