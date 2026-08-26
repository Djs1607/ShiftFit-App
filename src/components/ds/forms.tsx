import { useId, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, Minus, Plus } from 'lucide-react';

const CTRL_H: Record<'sm' | 'md' | 'lg', string> = { sm: 'h-8', md: 'h-10', lg: 'h-12' };

// ── Input ─────────────────────────────────────────────────────────
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  wrapperClassName?: string;
}

export function Input({ label, hint, error, icon: Icon, suffix, size = 'md', className = '', wrapperClassName = '', ...rest }: InputProps) {
  return (
    <label className={`block ${wrapperClassName}`}>
      {label && <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">{label}</span>}
      <span
        className={`flex items-center gap-2 rounded-control border bg-surface-inset px-3 transition-colors duration-fast ease-standard
          ${CTRL_H[size]}
          ${error ? 'border-feedback-danger' : 'border-line-default focus-within:border-line-focus focus-within:shadow-[0_0_0_3px_rgba(255,106,69,.18)]'}`}
      >
        {Icon && <Icon size={16} strokeWidth={2} className="shrink-0 text-fg-tertiary" />}
        <input {...rest} className={`min-w-0 flex-1 bg-transparent text-[15px] text-fg-primary outline-none placeholder:text-fg-disabled ${className}`} />
        {suffix && <span className="font-mono text-[13px] font-medium text-fg-tertiary">{suffix}</span>}
      </span>
      {(hint || error) && <span className={`mt-1.5 block text-[13px] ${error ? 'text-feedback-danger' : 'text-fg-tertiary'}`}>{error || hint}</span>}
    </label>
  );
}

// ── Select ────────────────────────────────────────────────────────
export interface SelectOption { value: string; label: string }
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: string;
  options: (string | SelectOption)[];
  size?: 'sm' | 'md' | 'lg';
}

export function Select({ label, hint, options, size = 'md', className = '', ...rest }: SelectProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">{label}</span>}
      <span className="relative block">
        <select
          {...rest}
          className={`w-full appearance-none rounded-control border border-line-default bg-surface-inset px-3 pr-9 text-[15px] text-fg-primary
            outline-none transition-colors duration-fast ease-standard focus:border-line-focus cursor-pointer
            ${CTRL_H[size]} ${className}`}
        >
          {options.map((o) => {
            const v = typeof o === 'string' ? o : o.value;
            const l = typeof o === 'string' ? o : o.label;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        <ChevronDown size={16} strokeWidth={2} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-tertiary" />
      </span>
      {hint && <span className="mt-1.5 block text-[13px] text-fg-tertiary">{hint}</span>}
    </label>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────
export function Checkbox({ checked, onChange, label, description, disabled, className = '' }: {
  checked: boolean; onChange?: (v: boolean) => void; label?: string; description?: string; disabled?: boolean; className?: string;
}) {
  return (
    <label className={`flex items-start gap-2.5 ${disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'} ${className}`}>
      <span
        onClick={() => !disabled && onChange?.(!checked)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border transition-colors duration-fast ease-standard
          ${checked ? 'bg-action-accent border-action-accent' : 'bg-surface-inset border-line-strong'}`}
      >
        {checked && (
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--text-on-accent)" strokeWidth={2.5}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      {(label || description) && (
        <span>
          {label && <span className="block text-[15px] font-medium text-fg-primary">{label}</span>}
          {description && <span className="mt-0.5 block text-[13px] text-fg-tertiary">{description}</span>}
        </span>
      )}
    </label>
  );
}

// ── Radio ─────────────────────────────────────────────────────────
export function Radio({ checked, onChange, label, description, disabled, className = '' }: {
  checked: boolean; onChange?: (v: boolean) => void; label?: string; description?: string; disabled?: boolean; className?: string;
}) {
  return (
    <label className={`flex items-start gap-2.5 ${disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'} ${className}`}>
      <span
        onClick={() => !disabled && onChange?.(true)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-fast ease-standard bg-surface-inset
          ${checked ? 'border-action-primary' : 'border-line-strong'}`}
      >
        {checked && <span className="h-[9px] w-[9px] rounded-full bg-action-primary" />}
      </span>
      {(label || description) && (
        <span>
          {label && <span className="block text-[15px] font-medium text-fg-primary">{label}</span>}
          {description && <span className="mt-0.5 block text-[13px] text-fg-tertiary">{description}</span>}
        </span>
      )}
    </label>
  );
}

// ── Switch ────────────────────────────────────────────────────────
export function Switch({ checked, onChange, label, description, disabled, className = '' }: {
  checked: boolean; onChange?: (v: boolean) => void; label?: string; description?: string; disabled?: boolean; className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${disabled ? 'opacity-45' : ''} ${className}`}>
      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && <div className="text-[15px] font-medium text-fg-primary">{label}</div>}
          {description && <div className="mt-0.5 text-[13px] text-fg-tertiary">{description}</div>}
        </div>
      )}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-[26px] w-11 shrink-0 rounded-pill border p-0 transition-colors duration-base ease-standard
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${checked ? 'bg-action-primary border-action-primary' : 'bg-surface-raised border-line-strong'}`}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full transition-[left] duration-base ease-out"
          style={{ left: checked ? 20 : 2, background: checked ? '#F2F7FB' : 'var(--sf-ink-300)' }}
        />
      </button>
    </div>
  );
}

// ── Stepper ───────────────────────────────────────────────────────
// Numeric stepper for reps, sets, load — thumb-friendly, mono readout.
export function Stepper({ value, step = 1, min = 0, max = 999, unit, onChange, label, className = '' }: {
  value: number; step?: number; min?: number; max?: number; unit?: string; onChange?: (v: number) => void; label?: string; className?: string;
}) {
  const id = useId();
  const set = (v: number) => onChange?.(Math.min(max, Math.max(min, +v.toFixed(2))));
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span id={id} className="text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">{label}</span>}
      <div className="flex items-center gap-1 rounded-control border border-line-default bg-surface-inset p-1" aria-labelledby={label ? id : undefined}>
        <button type="button" aria-label="Decrease" onClick={() => set(value - step)}
          className="flex h-8 w-8 items-center justify-center rounded-control text-fg-secondary hover:bg-surface-hover active:scale-[0.97]">
          <Minus size={16} strokeWidth={2} />
        </button>
        <span className="flex-1 text-center font-mono text-[24px] font-medium text-fg-primary">
          {value}{unit && <span className="ml-1 text-[13px] text-fg-tertiary">{unit}</span>}
        </span>
        <button type="button" aria-label="Increase" onClick={() => set(value + step)}
          className="flex h-8 w-8 items-center justify-center rounded-control text-fg-secondary hover:bg-surface-hover active:scale-[0.97]">
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
