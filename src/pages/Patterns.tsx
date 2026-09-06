import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Check, Moon, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import type { ShiftDay, ShiftPattern } from '../lib/types';
import { dateKey, parseHM } from '../lib/schedule';
import TimePicker from '../components/TimePicker';
import { PRESETS } from '../lib/presets';
import { Badge, Button, ConfirmSheet, IconButton, Input, Select } from '../components/ds';

function blankDays(n: number): ShiftDay[] {
  return Array.from({ length: n }, (_, i) => ({
    dayIndexInCycle: i, isOnShift: false, startTime: '07:00', endTime: '19:00',
  }));
}

export default function Patterns() {
  const { user, userPatterns, activePattern, dispatch } = useStore();
  const [editing, setEditing] = useState<ShiftPattern | null>(null);
  const [building, setBuilding] = useState(false);
  const [toDelete, setToDelete] = useState<ShiftPattern | null>(null);

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
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">Shift patterns</h1>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setBuilding(true)}>New</Button>
      </div>

      {userPatterns.length === 0 && (
        <p className="text-[14px] text-fg-tertiary">No patterns yet. Create one, or start from a preset.</p>
      )}

      <ul className="space-y-3">
        {userPatterns.map((p) => {
          const onDays = p.days.filter((d) => d.isOnShift).length;
          return (
            <li key={p.id} className={`rounded-card border p-4 bg-surface-card ${p.isActive ? 'border-coral-400/40' : 'border-line-subtle'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-fg-primary flex items-center gap-2">
                    {p.name}
                    {p.isActive && <Badge tone="primary">Active</Badge>}
                  </p>
                  <p className="text-[13px] text-fg-tertiary mt-1">
                    {p.cycleLengthDays}-day cycle · {onDays} shifts · starts {p.startDate}
                  </p>
                  <p className="text-[13px] text-fg-tertiary mt-0.5 font-mono">
                    {p.days.filter((d) => d.isOnShift).map((d, i) => (
                      <span key={i} className="mr-2">{d.startTime}–{d.endTime}{parseHM(d.endTime).h * 60 + parseHM(d.endTime).m <= parseHM(d.startTime).h * 60 + parseHM(d.startTime).m && <Moon className="inline h-3 w-3 ml-0.5 text-shift-night" />}</span>
                    ))}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(p)} />
                  <IconButton
                    icon={Trash2}
                    label="Delete"
                    onClick={() => setToDelete(p)}
                    className="hover:text-feedback-danger"
                  />
                </div>
              </div>
              {!p.isActive && (
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => dispatch({ type: 'setActivePattern', id: p.id, userId: user.id })}
                  className="mt-3"
                >
                  Set as active
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmSheet
        open={!!toDelete}
        title={`Delete "${toDelete?.name}"?`}
        message="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) dispatch({ type: 'deletePattern', id: toDelete.id, userId: user.id });
          setToDelete(null);
        }}
      />
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
    if (!startDate) { setError('Pick a start date: it anchors day 1 of the cycle to the calendar.'); return; }
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
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">{existing ? 'Edit pattern' : 'New pattern'}</h1>
        <IconButton icon={X} label="Close" onClick={onDone} />
      </div>

      {!existing && (
        <Select
          label="Start from a preset"
          value=""
          onChange={(e) => {
            const preset = PRESETS.find((p) => p.name === e.target.value);
            if (preset) applyPreset(preset);
          }}
          options={[{ value: '', label: 'Choose a common rotation…' }, ...PRESETS.map((p) => ({ value: p.name, label: p.name }))]}
        />
      )}

      <div className="space-y-3">
        <Input
          placeholder="Pattern name (e.g. 4on/4off nights)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="lg"
        />
        <Input
          type="date"
          label="Cycle day 1 starts on"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="lg"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">
            Rotation cycle: {days.length} days ({onCount} on)
          </p>
          <div className="flex gap-1.5">
            <button onClick={removeDay} className="h-8 w-8 rounded-control bg-surface-raised text-fg-body font-bold hover:bg-surface-press">−</button>
            <button onClick={addDay} className="h-8 w-8 rounded-control bg-surface-raised text-fg-body font-bold hover:bg-surface-press">+</button>
          </div>
        </div>

        {/* repeating schedule generator */}
        <div className="mb-3 flex items-center gap-2 rounded-card bg-surface-card border border-line-subtle px-3 py-2.5">
          <span className="text-[13px] text-fg-secondary shrink-0">Repeating:</span>
          <input
            type="number" min={1} max={14} value={genOn}
            onChange={(e) => setGenOn(Number(e.target.value) || 1)}
            className="w-12 rounded-control bg-surface-inset border border-line-default px-2 py-1.5 text-center text-[13px] font-mono text-fg-primary outline-none"
          />
          <span className="text-[13px] text-fg-secondary">on /</span>
          <input
            type="number" min={0} max={14} value={genOff}
            onChange={(e) => setGenOff(Number(e.target.value) || 0)}
            className="w-12 rounded-control bg-surface-inset border border-line-default px-2 py-1.5 text-center text-[13px] font-mono text-fg-primary outline-none"
          />
          <span className="text-[13px] text-fg-secondary">off</span>
          <button onClick={generate} className="ml-auto rounded-control bg-action-primary-quiet text-coral-300 text-[12px] font-bold px-3 py-1.5 hover:bg-[rgba(255,106,69,.24)]">
            Build
          </button>
        </div>

        <ul className="space-y-2">
          {days.map((d, i) => {
            const overnight = d.isOnShift &&
              parseHM(d.endTime).h * 60 + parseHM(d.endTime).m <= parseHM(d.startTime).h * 60 + parseHM(d.startTime).m;
            return (
              <li key={i} className={`rounded-card border p-3.5 ${d.isOnShift ? 'bg-surface-card border-line-default' : 'bg-surface-card/50 border-line-subtle'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-fg-body flex items-center gap-2">
                    Day {i + 1}
                    {d.isOnShift && onCount > 1 && (
                      <button
                        onClick={() => applyTimesToAll(i)}
                        className="text-[10px] font-bold text-coral-300/80 uppercase tracking-wide hover:text-coral-200"
                      >
                        ⇢ times to all
                      </button>
                    )}
                  </span>
                  <button
                    onClick={() => setDay(i, { isOnShift: !d.isOnShift })}
                    className={`rounded-pill px-4 py-1.5 text-[12px] font-bold transition-colors duration-fast ease-standard ${
                      d.isOnShift ? 'bg-action-primary text-fg-onPrimary' : 'bg-surface-raised text-fg-tertiary'
                    }`}
                  >
                    {d.isOnShift ? 'On shift' : 'Off'}
                  </button>
                </div>
                {d.isOnShift && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <TimePicker value={d.startTime} onChange={(v) => setDay(i, { startTime: v })} className="flex-1" />
                      <span className="text-fg-tertiary text-[14px]">→</span>
                      <TimePicker value={d.endTime} onChange={(v) => setDay(i, { endTime: v })} className="flex-1" />
                    </div>
                    {overnight && (
                      <p className="mt-2 flex items-center gap-1.5 text-[13px] text-coral-300">
                        <Moon className="h-3.5 w-3.5" /> Crosses midnight, ends next day
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {error && <p className="text-feedback-danger text-[13px]">{error}</p>}

      <Button variant="primary" size="lg" fullWidth icon={Check} onClick={save}>
        {existing ? 'Save changes' : 'Create pattern'}
      </Button>
    </div>
  );
}
