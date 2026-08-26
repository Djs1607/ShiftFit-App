import type { HTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ── MetricTile ────────────────────────────────────────────────────
// Single number readout: uppercase label, mono value, optional delta.
export interface MetricTileProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

const METRIC_FS: Record<NonNullable<MetricTileProps['size']>, string> = {
  sm: 'text-[24px]', md: 'text-[34px]', lg: 'text-[48px]',
};
const TREND_META = {
  up: { Icon: TrendingUp, color: 'text-green-400' },
  down: { Icon: TrendingDown, color: 'text-red-400' },
  flat: { Icon: Minus, color: 'text-fg-tertiary' },
};

export function MetricTile({ label, value, unit, delta, trend, size = 'md', icon: Icon, className = '', ...rest }: MetricTileProps) {
  const t = trend ? TREND_META[trend] : null;
  return (
    <div {...rest} className={`flex flex-col gap-1.5 ${className}`}>
      <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">
        {Icon && <Icon size={13} strokeWidth={2} />}{label}
      </span>
      <span className="flex items-baseline gap-1">
        <span className={`readout ${METRIC_FS[size]} text-fg-primary`}>{value}</span>
        {unit && <span className="text-[13px] font-medium text-fg-tertiary">{unit}</span>}
      </span>
      {(delta || t) && (
        <span className={`flex items-center gap-1 text-[13px] font-medium font-mono ${t ? t.color : 'text-fg-tertiary'}`}>
          {t && <t.Icon size={13} strokeWidth={2} />}{delta}
        </span>
      )}
    </div>
  );
}

// ── FatigueGauge ──────────────────────────────────────────────────
// 240deg-ish arc gauge for the fatigue/readiness score — the product's headline number.
const BANDS = [
  { max: 20, label: 'Fresh', c: '#5E9E7E' },
  { max: 40, label: 'Ready', c: '#8FA96C' },
  { max: 65, label: 'Elevated', c: '#D68A3A' },
  { max: 85, label: 'High', c: '#D07E4A' },
  { max: 101, label: 'Critical', c: '#C4614F' },
];

export interface FatigueGaugeProps {
  value: number;
  size?: number;
  label?: string;
  caption?: string;
  thickness?: number;
  className?: string;
}

export function FatigueGauge({ value, size = 180, label = 'Fatigue', caption, thickness = 12, className = '' }: FatigueGaugeProps) {
  const band = BANDS.find((b) => value < b.max) ?? BANDS[4];
  const r = (size - thickness) / 2;
  const c = size / 2;
  const sweep = 270;
  const start = 135;
  const len = 2 * Math.PI * r * (sweep / 360);
  const pol = (a: number, rad: number): [number, number] => [c + rad * Math.cos((a * Math.PI) / 180), c + rad * Math.sin((a * Math.PI) / 180)];
  const arc = (from: number, to: number) => {
    const [x1, y1] = pol(from, r);
    const [x2, y2] = pol(to, r);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size * 0.82 }}>
        <svg width={size} height={size} className="block">
          <path d={arc(start, start + sweep)} fill="none" stroke="var(--data-track)" strokeWidth={thickness} strokeLinecap="round" />
          <path
            d={arc(start, start + sweep)}
            fill="none"
            stroke={band.c}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${len} ${len}`}
            strokeDashoffset={len * (1 - Math.min(100, Math.max(0, value)) / 100)}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.5,0,.2,1), stroke 220ms cubic-bezier(.2,0,0,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: size * 0.04 }}>
          <span className="readout text-fg-primary" style={{ fontSize: size * 0.26 }}>{Math.round(value)}</span>
          <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: band.c }}>{band.label}</span>
        </div>
      </div>
      <span className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">{label}</span>
      {caption && <span className="mt-1.5 max-w-[240px] text-center text-[13px] text-fg-secondary">{caption}</span>}
    </div>
  );
}

// ── ShiftRibbon ───────────────────────────────────────────────────
// Horizontal circadian strip: one cell per day, coloured by shift phase.
export interface ShiftRibbonDay {
  type: 'day' | 'swing' | 'night' | 'off';
  label: string;
  today?: boolean;
  session?: boolean;
}

const SHIFT_COLOR: Record<ShiftRibbonDay['type'], string> = {
  day: 'var(--sf-shift-day)', swing: 'var(--sf-shift-swing)', night: 'var(--sf-shift-night)', off: 'var(--sf-shift-off)',
};

export function ShiftRibbon({ days, height = 32, showLabels = true, className = '' }: { days: ShiftRibbonDay[]; height?: number; showLabels?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex gap-[3px]">
        {days.map((d, i) => (
          <div
            key={i}
            title={d.type}
            className="relative flex-1 rounded-xs"
            style={{
              height,
              background: SHIFT_COLOR[d.type],
              outline: d.today ? '1px solid var(--text-primary)' : 'none',
              outlineOffset: 1,
            }}
          >
            {d.session && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ink-100" />}
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-[3px]">
          {days.map((d, i) => (
            <span key={i} className={`flex-1 text-center font-mono text-[11px] ${d.today ? 'text-fg-primary' : 'text-fg-tertiary'}`}>{d.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SparkBars ─────────────────────────────────────────────────────
// Compact axis-free bar chart for weekly volume / sleep debt.
export function SparkBars({ data, height = 64, color = 'var(--action-primary)', highlightLast, labels, className = '' }: {
  data: number[]; height?: number; color?: string; highlightLast?: boolean; labels?: string[]; className?: string;
}) {
  const max = Math.max(1, ...data);
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((v, i) => {
          const last = !!highlightLast && i === data.length - 1;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-[2px]"
              style={{
                height: `${Math.max(3, (v / max) * 100)}%`,
                background: last ? 'var(--action-accent)' : color,
                opacity: last ? 1 : 0.62,
                transition: 'height 900ms cubic-bezier(.5,0,.2,1)',
              }}
            />
          );
        })}
      </div>
      {labels && (
        <div className="flex gap-1">
          {labels.map((l, i) => <span key={i} className="flex-1 text-center font-mono text-[11px] text-fg-tertiary">{l}</span>)}
        </div>
      )}
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, tone = 'primary', height = 8, label, valueLabel, className = '' }: {
  value: number; max?: number; tone?: 'primary' | 'accent' | 'success' | 'danger'; height?: number; label?: string; valueLabel?: string; className?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const toneClass = { primary: 'bg-action-primary', accent: 'bg-action-accent', success: 'bg-feedback-success', danger: 'bg-feedback-danger' }[tone];
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between gap-2">
          {label && <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">{label}</span>}
          {valueLabel && <span className="font-mono text-[13px] font-medium text-fg-secondary">{valueLabel}</span>}
        </div>
      )}
      <div className="overflow-hidden rounded-pill bg-data-track" style={{ height }}>
        <div className={`h-full rounded-pill transition-[width] duration-slow ease-mechanical ${toneClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
