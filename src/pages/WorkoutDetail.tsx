import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarPlus, ChevronLeft, Clock, Flame, ListChecks, Play, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import { buildDayPlans, findOverlap, dateKey, fmtTime, localISO } from '../lib/schedule';
import type { CustomWorkout, LibraryWorkout } from '../lib/library';
import type { Workout } from '../lib/types';
import { REC_META } from '../components/Fatigue';
import TimePicker from '../components/TimePicker';
import { Badge, Button, Card, Input } from '../components/ds';

const INTENSITY_RANK: Record<string, number> = { rest: 0, light: 1, moderate: 2, hard: 3 };

// Rough energy estimate so the stat strip carries a third number like the
// reference does. MET-style: intensity factor × minutes. Deliberately shown
// as "~" — it's an estimate, not a measurement.
const MET: Record<string, number> = { light: 3.5, moderate: 6, hard: 9 };
const estimateCal = (min: number, intensity: string) => Math.round((MET[intensity] ?? 6) * 3.5 * 75 * min / 200 / 10) * 10;

export default function WorkoutDetail({
  workout,
  onBack,
  onStart,
}: {
  workout: LibraryWorkout | CustomWorkout;
  onBack: () => void;
  onStart: (id: string) => void;
}) {
  const { user, activePattern, userWorkouts, userSleepLogs, userOverrides, dispatch } = useStore();
  const [scheduling, setScheduling] = useState(false);
  const [date, setDate] = useState(dateKey(new Date()));
  const [time, setTime] = useState('17:00');
  const [override, setOverride] = useState(false);
  const [saved, setSaved] = useState(false);

  const plan = workout.plan ?? [];
  const meta = REC_META[workout.level];

  const start = useMemo(() => {
    const [y, m, d] = date.split('-').map(Number);
    const [h, mi] = time.split(':').map(Number);
    return new Date(y, (m || 1) - 1, d || 1, h || 0, mi || 0);
  }, [date, time]);
  const end = useMemo(() => new Date(start.getTime() + workout.durationMin * 60000), [start, workout.durationMin]);

  const conflict = useMemo(
    () => (activePattern ? findOverlap(activePattern, start, end, userOverrides) : null),
    [activePattern, start, end, userOverrides]
  );

  // does this session's load exceed what the chosen day can take?
  const dayPlan = useMemo(() => {
    if (!activePattern) return null;
    const d = new Date(start); d.setHours(0, 0, 0, 0);
    return buildDayPlans(activePattern, d, d, userWorkouts, { sleepLogs: userSleepLogs, overrides: userOverrides })[0] ?? null;
  }, [activePattern, start, userWorkouts, userSleepLogs, userOverrides]);

  // Compare the session's LEVEL (the bucket it's built for), not its raw
  // intensity — a rest-day session is tagged 'light' intensity, so ranking on
  // intensity would warn that a rest workout is too much for a rest day.
  const mismatch =
    dayPlan && INTENSITY_RANK[workout.level] > INTENSITY_RANK[dayPlan.recommendation]
      ? dayPlan.recommendation
      : null;

  const buildWorkout = (when: Date): Workout => ({
    id: uid(),
    userId: user!.id,
    datetime: localISO(when),
    type: workout.type,
    durationMin: workout.durationMin,
    intensity: workout.intensity,
    completed: false,
    libraryId: workout.id,
    notes: workout.name,
  });

  const startNow = () => {
    if (!user) return;
    const w = buildWorkout(new Date());
    dispatch({ type: 'saveWorkout', workout: w });
    onStart(w.id);
  };

  const schedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (conflict && !override)) return;
    dispatch({ type: 'saveWorkout', workout: buildWorkout(start) });
    setSaved(true);
    setTimeout(() => { setSaved(false); setScheduling(false); setOverride(false); }, 1200);
  };

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="-ml-2 flex items-center gap-1 rounded-control px-2 py-1.5 text-[14px] font-semibold text-fg-tertiary hover:text-fg-primary"
      >
        <ChevronLeft size={18} strokeWidth={2} /> Workouts
      </button>

      <div>
        <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${meta.text}`}>
          {meta.label} session
        </span>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">
          {workout.name}
        </h1>
        {workout.blurb && <p className="mt-2 text-[14px] leading-relaxed text-fg-secondary">{workout.blurb}</p>}
      </div>

      {/* stat strip — the reference's "6 Exercises · 48 Min · 244 Cal" row */}
      <Card tone="inset" padding="md">
        <dl className="flex items-center justify-around text-center">
          {[
            { icon: ListChecks, value: plan.length || '–', label: plan.length === 1 ? 'Exercise' : 'Exercises' },
            { icon: Clock, value: workout.durationMin, label: 'Minutes' },
            { icon: Flame, value: `~${estimateCal(workout.durationMin, workout.intensity)}`, label: 'Est. kcal' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex-1">
              <Icon size={16} strokeWidth={2} className="mx-auto mb-1.5 text-fg-disabled" />
              <dd className="font-display text-[22px] font-semibold leading-none tracking-[-0.02em] text-fg-primary">{value}</dd>
              <dt className="mt-1 text-[11px] uppercase tracking-[0.08em] text-fg-tertiary">{label}</dt>
            </div>
          ))}
        </dl>
      </Card>

      {mismatch && (
        <div className="rounded-control border border-[rgba(226,96,63,.3)] bg-feedback-warning-quiet p-3.5">
          <p className="flex items-start gap-2 text-[14px] font-semibold text-amber-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {scheduling && dateKey(start) !== dateKey(new Date()) ? 'That day' : 'Today'} scores as a {mismatch} day
            {dayPlan && ` (fatigue ${dayPlan.fatigue})`}. This is a {REC_META[workout.level].label.toLowerCase()} session.
          </p>
          <p className="mt-1.5 text-[13px] text-fg-secondary">
            You can still do it, just know you're going against the rotation.
          </p>
        </div>
      )}

      {/* exercise list — thumbnail slot + sets × reps, per the reference */}
      {plan.length > 0 ? (
        <section>
          <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-fg-tertiary">The session</h2>
          <ul className="overflow-hidden rounded-card border border-line-subtle bg-surface-card">
            {plan.map((p, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-line-subtle' : ''}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-inset font-mono text-[13px] font-semibold text-fg-tertiary">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-fg-primary">{p.name}</span>
                <span className="shrink-0 font-mono text-[13px] font-medium text-fg-secondary">
                  {p.sets} × {p.reps}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="rounded-control border border-dashed border-line-strong px-4 py-3.5 text-[13px] text-fg-tertiary">
          No exercise breakdown for this one: it's a single continuous effort. Start it and the timer runs.
        </p>
      )}

      {/* schedule form appears only when asked for — it is never the first thing you see */}
      {scheduling && (
        <Card tone="default" padding="lg">
          <form onSubmit={schedule} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-fg-primary">Schedule it</h2>
              <button type="button" onClick={() => setScheduling(false)} className="p-1 text-fg-tertiary hover:text-fg-primary" aria-label="Cancel scheduling">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">Start time</label>
                <TimePicker value={time} onChange={setTime} />
              </div>
            </div>

            <p className="text-[13px] text-fg-tertiary">
              {workout.type} · {workout.durationMin} min · <span className="capitalize">{workout.intensity}</span> · finishes {fmtTime(end)}
            </p>

            {conflict && (
              <div className="rounded-control border border-[rgba(196,97,79,.3)] bg-feedback-danger-quiet p-3.5">
                <p className="flex items-start gap-2 text-[14px] font-semibold text-feedback-danger">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Overlaps your shift {fmtTime(conflict.start)} – {fmtTime(conflict.end)}.
                </p>
                <label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-[12px] text-fg-body">
                  <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} className="h-4 w-4 accent-feedback-danger" />
                  I know, schedule it anyway
                </label>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={!!conflict && !override}>
              {conflict && !override ? 'Blocked: overlaps a shift' : saved ? 'Scheduled ✓' : 'Add to my plan'}
            </Button>
          </form>
        </Card>
      )}

      {/* primary action pair — amber accent used once, on the single main action */}
      {!scheduling && (
        <div className="space-y-2.5 pt-1">
          <Button variant="accent" size="lg" fullWidth icon={Play} onClick={startNow}>
            Start now
          </Button>
          <Button variant="secondary" size="lg" fullWidth icon={CalendarPlus} onClick={() => setScheduling(true)}>
            Schedule for later
          </Button>
        </div>
      )}

      {'userId' in workout && (
        <p className="text-center">
          <Badge tone="primary">Your workout</Badge>
        </p>
      )}
    </div>
  );
}
