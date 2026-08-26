import { useEffect, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from './core';

// ── EmptyState ────────────────────────────────────────────────────
// Zero-data state: glyph, one line of plain talk, one action.
export function EmptyState({ icon: Icon = Inbox, title, message, action, className = '' }: {
  icon?: LucideIcon; title: ReactNode; message?: ReactNode; action?: ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-4 px-6 py-10 text-center ${className}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-line-subtle bg-surface-inset">
        <Icon size={24} strokeWidth={2} className="text-fg-tertiary" />
      </span>
      <div>
        <div className="font-display text-[17px] font-semibold leading-snug text-fg-primary">{title}</div>
        {message && <div className="mt-1 max-w-[280px] text-[15px] leading-relaxed text-fg-secondary">{message}</div>}
      </div>
      {action}
    </div>
  );
}

// ── ConfirmSheet ──────────────────────────────────────────────────
// In-app replacement for window.confirm(). Native confirm() is unreliable
// in standalone/installed PWAs (iOS in particular can no-op it silently),
// which reads as "the button does nothing" — so destructive actions never
// use it.
export function ConfirmSheet({
  open, title, message, confirmLabel = 'Delete', danger = true, onConfirm, onCancel,
}: {
  open: boolean;
  title: ReactNode;
  message?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-bg-scrim" onClick={onCancel} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-sheet-title"
        className="relative w-full max-w-md rounded-t-sheet border border-line-subtle bg-surface-card p-5
          pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-sheet duration-sheet ease-out
          animate-in slide-in-from-bottom sm:rounded-card sm:pb-5"
      >
        <p id="confirm-sheet-title" className="font-display text-[17px] font-semibold leading-snug text-fg-primary">
          {title}
        </p>
        {message && <p className="mt-1.5 text-[14px] leading-relaxed text-fg-secondary">{message}</p>}
        <div className="mt-5 flex gap-2.5">
          <Button variant="secondary" size="lg" fullWidth onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} size="lg" fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
