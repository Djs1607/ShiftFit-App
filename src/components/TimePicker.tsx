// Bulletproof time picker: two native <select>s (hour + minute).
// Native <input type="time"> is unreliable across mobile browsers —
// values often never commit, which made manual shift entry impossible.

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const BASE_MINS = ['00', '15', '30', '45'];

export default function TimePicker({
  value,
  onChange,
  className = '',
}: {
  value: string; // "HH:mm"
  onChange: (v: string) => void;
  className?: string;
}) {
  const [h = '07', m = '00'] = (value || '07:00').split(':');
  // keep any non-quarter minute selectable rather than silently dropping it
  const mins = BASE_MINS.includes(m) ? BASE_MINS : [...BASE_MINS, m].sort();

  const sel =
    'flex-1 rounded-lg bg-ink-800 border border-ink-700 px-2 py-2.5 text-sm text-center font-semibold outline-none focus:border-shock-400/60 appearance-none';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <select value={h} onChange={(e) => onChange(`${e.target.value}:${m}`)} className={sel} aria-label="Hour">
        {HOURS.map((hh) => (
          <option key={hh} value={hh}>{hh}</option>
        ))}
      </select>
      <span className="text-ink-500 font-bold">:</span>
      <select value={m} onChange={(e) => onChange(`${h}:${e.target.value}`)} className={sel} aria-label="Minute">
        {mins.map((mm) => (
          <option key={mm} value={mm}>{mm}</option>
        ))}
      </select>
    </div>
  );
}
