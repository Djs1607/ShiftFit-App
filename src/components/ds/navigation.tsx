import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './core';

// ── ListRow ───────────────────────────────────────────────────────
export function ListRow({ title, subtitle, leading, trailing, meta, chevron = true, onClick, className = '' }: {
  title: ReactNode; subtitle?: ReactNode; leading?: ReactNode; trailing?: ReactNode; meta?: string; chevron?: boolean; onClick?: () => void; className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex min-h-11 items-center gap-3 rounded-control px-4 py-3 transition-colors duration-fast ease-standard
        ${onClick ? 'cursor-pointer hover:bg-surface-hover' : ''} ${className}`}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium text-fg-primary">{title}</div>
        {subtitle && <div className="mt-0.5 text-[13px] text-fg-tertiary">{subtitle}</div>}
      </div>
      {meta && <span className="font-mono text-[13px] font-medium text-fg-secondary">{meta}</span>}
      {trailing}
      {chevron && onClick && <ChevronRight size={16} strokeWidth={2} className="text-fg-tertiary" />}
    </div>
  );
}

// ── SegmentedControl ──────────────────────────────────────────────
export function SegmentedControl<T extends string>({ options, value, onChange, fullWidth = true, className = '' }: {
  options: (T | { value: T; label: string })[]; value: T; onChange: (v: T) => void; fullWidth?: boolean; className?: string;
}) {
  return (
    <div role="tablist" className={`inline-flex gap-0.5 rounded-control border border-line-subtle bg-surface-inset p-[3px] ${fullWidth ? 'w-full' : ''} ${className}`}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        const on = v === value;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(v)}
            className={`h-8 flex-1 rounded-sm px-3 text-[13px] transition-colors duration-fast ease-standard
              ${on ? 'bg-surface-overlay text-fg-primary font-semibold shadow-sm' : 'text-fg-tertiary font-medium hover:text-fg-secondary'}`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

// ── TopBar ────────────────────────────────────────────────────────
// When sticky, the bar pads itself past the safe-area inset so its title
// never sits under the iPhone status bar. Keep `actions` to icon buttons —
// text pinned to either edge collides with the clock or battery readout.
export function TopBar({ title, eyebrow, back, onBack, actions, sticky, className = '' }: {
  title: ReactNode; eyebrow?: string; back?: boolean; onBack?: () => void; actions?: ReactNode; sticky?: boolean; className?: string;
}) {
  return (
    <header
      className={`flex min-h-14 items-center gap-2 border-b border-line-subtle bg-bg-base px-5 z-20
        ${sticky ? 'sticky top-0 pt-[env(safe-area-inset-top)]' : ''} ${className}`}
    >
      {back && <IconButton icon={ChevronLeft} label="Back" onClick={onBack} className="-ml-2" />}
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-tertiary">{eyebrow}</div>}
        <div className="truncate font-display text-[19px] font-semibold leading-tight tracking-[-0.01em] text-fg-primary">{title}</div>
      </div>
      {actions && <div className="-mr-2 flex gap-1">{actions}</div>}
    </header>
  );
}

// ── TabBar ────────────────────────────────────────────────────────
export interface TabBarItem<T extends string> { id: T; label: string; icon: LucideIcon }

export function TabBar<T extends string>({ items, active, onChange, className = '' }: {
  items: TabBarItem<T>[]; active: T; onChange: (id: T) => void; className?: string;
}) {
  return (
    <nav className={`flex h-16 items-stretch border-t border-line-subtle bg-surface-card ${className}`}>
      {items.map(({ id, label, icon: Icon }) => {
        const on = id === active;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-fast ease-standard
              ${on ? 'text-action-accent' : 'text-fg-tertiary'}`}
          >
            <Icon size={22} strokeWidth={on ? 2.5 : 2} />
            <span className={`text-[11px] tracking-[0.02em] ${on ? 'font-semibold' : 'font-medium'}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
