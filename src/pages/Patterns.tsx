import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Check, Moon, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import type { ShiftDay, ShiftPattern } from '../lib/types';
import { dateKey, parseHM } from '../lib/schedule';
import TimePicker from '../components/TimePicker';
import { PRESETS } from '../lib/presets';

function blankDays(n: number): ShiftDay[] {
  return Array.from({ length: n }, (_, i) => ({
    dayIndexInCycle: i, isOnShift: false, startTime: '07:00', endTime: '19:00',
  }));
}

export default function Patterns() {
  const { user, userPatterns, activePattern, dispatch } = useStore();
  const [editing, setEditing] = useState<ShiftPattern | null>(null);
  const [building, setBuilding] = useState(false);

  if (!user) return null;

  if (building || editing) {
    return (
      <Builder
        existing={editing}
        userId={user.id}
        hasActive={!!activePattern}
        onDone={() => { setBuilding(false); setEditing(null); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold uppercase tracking-[0.06em]">Shift patterns</h1>
        <button
          onClick={() => setBuilding(true)}
          className="flex items-center gap-1.5 rounded-xl bg-shock-400 text-ink-950 font-bold px-4 py-2.5 text-sm active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} /> New
        </button>
      </div>

      {userPatterns.length === 0 && (
        <p className="text-sm text-ink-500">No patterns yet. Create one, or start from a preset.</p>
      )}

      <ul className="space-y-3">
        {userPatterns.map((p) => {
          const onDays = p.days.filter((d) => d.isOnShift).length;
          return (
            <li key={p.id} className={`rounded-2xl border p-4 ${p.isActive ? 'bg-ink-900 border-shock-400/40' : 'bg-ink-900 border-ink-800'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    {p.name}
                    {p.isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-shock-300 bg-shock-400/15 rounded-full px-2 py-0.5">Active</span>
                    )}
                  </p>
                  <p className="text-xs text-ink-500 mt-1">
                    {p.cycleLengthDays}-day cycle · {onDays} shifts · starts {p.startDate}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {p.days.filter((d) => d.isOnShift).map((d, i) => (
                      <span key={i} className="mr-2">{d.startTime}–{d.endTime}{parseHM(d.endTime).h * 60 + parseHM(d.endTime).m <= parseHM(d.startTime).h * 60 + parseHM(d.startTime).m && <Moon className="inline h-3 w-3 ml-0.5 text-night-300" />}</span>
                    ))}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditing(p)} className="p-2 rounded-lg text-ink-400 hover:bg-ink-800" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${p.name}"?`)) dispatch({ type: 'deletePattern', id: p.id, userId: user.id }); }}
                    className="p-2 rounded-lg text-ink-400 hover:bg-ink-800 hover:text-cooked-400" aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {!p.isActive && (
                <button
                  onClick={() => dispatch({ type: 'setActivePattern', id: p.id, userId: user.id })}
                  className="mt-3 w-full rounded-xl border border-ink-700 py-2.5 text-sm font-semibold text-ink-300 active:bg-ink-800"
                >
                  Set as active
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Builder / editor ────────────────────────────────────────────────

function Builder({
  existing, userId, hasActive, onDone,
}: { existing: ShiftPattern | null; userId: string; hasActive: boolean; onDone: () => void }) {
  const { dispatch } = useStore();
  const [name, setName] = useState(existing?.name ?? '');
  const [startDate, setStartDate] = useState(existing?.startDate ?? dateKey(new Date()));
  const [days, setDays] = useState<ShiftDay[]>(existing ? existing.days.map((d) => ({ ...d })) : blankDays(7));
  const [error, setError] = useState('');

  const setDay = (i: number, patch: Partial<ShiftDay>) =>
    setDays((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const addDay = () => setDays((ds) => [...ds, { dayIndexInCycle: ds.length, isOnShift: false, startTime: '07:00', endTime: '19:00' }]);
  const removeDay = () => setDays((ds) => (ds.length > 1 ? ds.slice(0, -1) : ds));

  // repeating-schedule generator: "X on / Y off" fills the whole cycle
  const [genOn, setGenOn] = useState(2);
  const [genOff, setGenOff] = useState(2);
  const generate = () => {
    const on = Math.max(1, Math.min(14, genOn));
    const off = Math.max(0, Math.min(14, genOff));
    const t = days.find((d) => d.isOnShift) ?? { startTime: '07:00', endTime: '19:00' };
    const seq: ShiftDay[] = [];
    for (let i = 0; i < on; i++) seq.push({ dayIndexInCycle: seq.length, isOnShift: true, startTime: t.startTime, endTime: t.endTime });
    for (let i = 0; i < off; i++) seq.push({ dayIndexInCycle: seq.length, isOnShift: false, startTime: '07:00', endTime: '19:00' });
    setDays(seq);
  };

  // copy one day's times onto every on-shift day
  const applyTimesToAll = (i: number) =>
    setDays((ds) => ds.map((d) => (d.isOnShift ? { ...d, startTime: ds[i].startTime, endTime: ds[i].endTime } : d)));

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setName(preset.name);
    setDays(preset.days.map((d, i) => ({
      dayIndexInCycle: i,
      isOnShift: d.isOnShift ?? false,
      startTime: d.startTime ?? '07:00',
      endTime: d.endTime ?? '19:00',
    })));
  };

  const save = () => {
    if (!name.trim()) { setError('Give the pattern a name.'); return; }
    if (!startDate) { setError('Pick a start date — it anchors day 1 of the cycle to the calendar.'); return; }
    const pattern: ShiftPattern = {
      id: existing?.id ?? uid(),
      userId,
      name: name.trim(),
      cycleLengthDays: days.length,
      startDate,
      days: days.map((d, i) => ({ ...d, dayIndexInCycle: i })),
      isActive: existing ? existing.isActive : !hasActive,
    };
    dispatch({ type: 'savePattern', pattern });
    onDone();
  };

  const onCount = useMemo(() => days.filter((d) => d.isOnShift).length, [days]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold uppercase tracking-[0.06em]">{existing ? 'Edit pattern' : 'New pattern'}</h1>
        <button onClick={onDone} className="p-2 rounded-lg text-ink-400 hover:bg-ink-800" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      {!existing && (
        <div>
          <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider block mb-2">Start from a preset</label>
          <select
            value=""
            onChange={(e) => {
              const preset = PRESETS.find((p) => p.name === e.target.value);
              if (preset) applyPreset(preset);
            }}
            className="w-full rounded-xl bg-ink-900 border border-ink-800 px-4 py-3 text-sm outline-none focus:border-shock-400/60 text-ink-300"
          >
            <option value="" disabled>Choose a common rotation…</option>
            {PRESETS.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3">
        <input
          className="w-full rounded-xl bg-ink-900 border border-ink-800 px-4 py-3 text-base outline-none focus:border-shock-400/60 placeholder:text-ink-600"
          placeholder="Pattern name (e.g. 4on/4off nights)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          <label className="text-xs text-ink-500 block mb-1.5">Cycle day 1 starts on</label>
          <input
            type="date"
            className="w-full rounded-xl bg-ink-900 border border-ink-800 px-4 py-3 text-base outline-none focus:border-shock-400/60 [color-scheme:dark]"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
            Rotation cycle — {days.length} days ({onCount} on)
          </p>
          <div className="flex gap-1.5">
            <button onClick={removeDay} className="h-8 w-8 rounded-lg bg-ink-800 text-ink-300 font-bold active:bg-ink-700">−</button>
            <button onClick={addDay} className="h-8 w-8 rounded-lg bg-ink-800 text-ink-300 font-bold active:bg-ink-700">+</button>
          </div>
        </div>

        {/* repeating schedule generator */}
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-ink-800/50 border border-ink-800 px-3 py-2.5">
          <span className="text-xs text-ink-400 shrink-0">Repeating:</span>
          <input
            type="number" min={1} max={14} value={genOn}
            onChange={(e) => setGenOn(Number(e.target.value) || 1)}
            className="w-12 rounded-lg bg-ink-800 border border-ink-700 px-2 py-1.5 text-center text-sm outline-none"
          />
          <span className="text-xs text-ink-400">on /</span>
          <input
            type="number" min={0} max={14} value={genOff}
            onChange={(e) => setGenOff(Number(e.target.value) || 0)}
            className="w-12 rounded-lg bg-ink-800 border border-ink-700 px-2 py-1.5 text-center text-sm outline-none"
          />
          <span className="text-xs text-ink-400">off</span>
          <button onClick={generate} className="ml-auto rounded-lg bg-shock-400/15 text-shock-300 text-xs font-bold px-3 py-1.5 active:bg-shock-400/25">
            Build
          </button>
        </div>

        <ul className="space-y-2">
          {days.map((d, i) => {
            const overnight = d.isOnShift &&
              parseHM(d.endTime).h * 60 + parseHM(d.endTime).m <= parseHM(d.startTime).h * 60 + parseHM(d.startTime).m;
            return (
              <li key={i} className={`rounded-2xl border p-3.5 ${d.isOnShift ? 'bg-ink-900 border-ink-700' : 'bg-ink-900/50 border-ink-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-300 flex items-center gap-2">
                    Day {i + 1}
                    {d.isOnShift && onCount > 1 && (
                      <button
                        onClick={() => applyTimesToAll(i)}
                        className="text-[10px] font-bold text-shock-300/80 uppercase tracking-wide active:text-shock-200"
                      >
                        ⇢ times to all
                      </button>
                    )}
                  </span>
                  <button
                    onClick={() => setDay(i, { isOnShift: !d.isOnShift })}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                      d.isOnShift ? 'bg-shock-400 text-ink-950' : 'bg-ink-800 text-ink-400'
                    }`}
                  >
                    {d.isOnShift ? 'On shift' : 'Off'}
                  </button>
                </div>
                {d.isOnShift && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <TimePicker value={d.startTime} onChange={(v) => setDay(i, { startTime: v })} className="flex-1" />
                      <span className="text-ink-500 text-sm">→</span>
                      <TimePicker value={d.endTime} onChange={(v) => setDay(i, { endTime: v })} className="flex-1" />
                    </div>
                    {overnight && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-night-300">
                        <Moon className="h-3.5 w-3.5" /> Crosses midnight — ends next day
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {error && <p className="text-cooked-400 text-sm">{error}</p>}

      <button
        onClick={save}
        className="w-full rounded-xl bg-shock-400 text-ink-950 font-bold py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Check className="h-5 w-5" strokeWidth={2.5} />
        {existing ? 'Save changes' : 'Create pattern'}
      </button>
    </div>
  );
}
