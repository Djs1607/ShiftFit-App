import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────
// Amber = effort/commit, blue = navigation/confirm. See guidelines/color-accent.
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
type ControlSize = 'sm' | 'md' | 'lg';

const BTN_H: Record<ControlSize, string> = { sm: 'h-8', md: 'h-10', lg: 'h-12' };
const BTN_PX: Record<ControlSize, string> = { sm: 'px-3', md: 'px-4', lg: 'px-5' };
const BTN_TEXT: Record<ControlSize, string> = { sm: 'text-[13px]', md: 'text-[15px]', lg: 'text-[16px]' };
const ICON_SIZE: Record<ControlSize, number> = { sm: 14, md: 16, lg: 18 };

const BTN_SKIN: Record<ButtonVariant, string> = {
  primary: 'bg-action-primary text-fg-onPrimary border border-transparent hover:bg-action-primary-hover active:bg-action-primary-press',
  accent: 'bg-action-accent text-fg-onAccent border border-transparent hover:bg-action-accent-hover active:bg-action-accent-press',
  secondary: 'bg-transparent text-fg-primary border border-line-strong hover:bg-surface-hover hover:border-line-focus',
  ghost: 'bg-transparent text-fg-secondary border border-transparent hover:bg-surface-hover hover:text-fg-primary',
  danger: 'bg-feedback-danger-quiet text-feedback-danger border border-[rgba(196,97,79,.4)] hover:bg-[rgba(196,97,79,.22)]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ControlSize;
  icon?: LucideIcon;
  iconAfter?: LucideIcon;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', icon: Icon, iconAfter: IconAfter, fullWidth, disabled,
  className = '', children, ...rest
}: ButtonProps) {
  const iconPx = ICON_SIZE[size];
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold tracking-[-0.005em]
        transition-colors duration-fast ease-standard active:scale-[0.97]
        disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed
        ${BTN_H[size]} ${BTN_PX[size]} ${BTN_TEXT[size]} ${BTN_SKIN[variant]}
        ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon size={iconPx} strokeWidth={2} className="shrink-0" />}
      {children}
      {IconAfter && <IconAfter size={iconPx} strokeWidth={2} className="shrink-0" />}
    </button>
  );
}

// ── IconButton ────────────────────────────────────────────────────
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: ControlSize;
  variant?: 'ghost' | 'filled';
  label: string;
}

const ICON_BTN_DIM: Record<ControlSize, string> = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };

export function IconButton({ icon: Icon, size = 'md', variant = 'ghost', label, disabled, className = '', ...rest }: IconButtonProps) {
  const filled = variant === 'filled';
  return (
    <button
      {...rest}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-control transition-colors duration-fast ease-standard active:scale-[0.97]
        disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed
        ${ICON_BTN_DIM[size]}
        ${filled
          ? 'bg-surface-raised text-fg-primary border border-line-subtle hover:bg-surface-press'
          : 'bg-transparent text-fg-secondary border border-transparent hover:bg-surface-hover hover:text-fg-primary active:bg-surface-press'}
        ${className}`}
    >
      <Icon size={size === 'sm' ? 16 : 20} strokeWidth={2} />
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'raised' | 'inset' | 'accent' | 'primary';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

const CARD_TONE: Record<NonNullable<CardProps['tone']>, string> = {
  default: 'bg-surface-card',
  raised: 'bg-surface-raised',
  inset: 'bg-surface-inset',
  accent: 'bg-action-accent-quiet',
  primary: 'bg-action-primary-quiet',
};
const CARD_PAD: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-5',
};

export function Card({ tone = 'default', padding = 'md', interactive, header, footer, className = '', children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={`rounded-card border border-line-subtle transition-colors duration-fast ease-standard
        ${CARD_TONE[tone]} ${CARD_PAD[padding]} ${tone === 'inset' ? '' : 'shadow-sm'}
        ${interactive ? 'cursor-pointer' : ''} ${className}`}
    >
      {header && <div className="flex items-center justify-between gap-2 mb-3">{header}</div>}
      {children}
      {footer && <div className="mt-3 pt-3 border-t border-line-subtle">{footer}</div>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────
export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

const BADGE_SKIN: Record<BadgeTone, string> = {
  neutral: 'bg-surface-raised text-fg-secondary border-line-default',
  primary: 'bg-action-primary-quiet text-coral-300 border-[rgba(255,106,69,.35)]',
  accent: 'bg-action-accent-quiet text-amber-400 border-[rgba(226,96,63,.35)]',
  success: 'bg-feedback-success-quiet text-green-400 border-[rgba(94,158,126,.35)]',
  warning: 'bg-feedback-warning-quiet text-amber-400 border-[rgba(226,96,63,.35)]',
  danger: 'bg-feedback-danger-quiet text-red-400 border-[rgba(196,97,79,.35)]',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: LucideIcon;
  dot?: boolean;
  uppercase?: boolean;
}

export function Badge({ tone = 'neutral', icon: Icon, dot, uppercase = true, className = '', children, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-pill border px-2 py-[3px] text-[11px] font-semibold tracking-[0.06em]
        ${uppercase ? 'uppercase' : ''} ${BADGE_SKIN[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

// ── Tag ───────────────────────────────────────────────────────────
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
  onRemove?: () => void;
  icon?: LucideIcon;
}

export function Tag({ selected, onRemove, icon: Icon, className = '', children, ...rest }: TagProps) {
  return (
    <span
      {...rest}
      className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 text-[13px] font-medium
        transition-colors duration-fast ease-standard
        ${selected ? 'bg-surface-selected text-coral-300 border-[rgba(255,106,69,.45)]' : 'bg-surface-raised text-fg-secondary border-line-subtle'}
        ${className}`}
    >
      {Icon && <Icon size={14} strokeWidth={2} />}
      {children}
      {onRemove && (
        <button onClick={onRemove} aria-label="Remove" className="opacity-60 hover:opacity-100">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
