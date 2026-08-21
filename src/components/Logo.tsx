/** ShiftFit brand lockup — the S-sun mark + condensed uppercase wordmark. */
export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: { mark: 'h-6 w-6', text: 'text-lg tracking-[0.1em]' },
    md: { mark: 'h-8 w-8', text: 'text-2xl tracking-[0.11em]' },
    lg: { mark: 'h-12 w-12', text: 'text-4xl tracking-[0.12em]' },
  }[size];
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <img src="/logo-mark.png" alt="" className={`${dims.mark} object-contain`} />
      <span className={`${dims.text} font-display font-semibold uppercase leading-none text-ink-50`}>
        Shift<span className="text-shock-400">Fit</span>
      </span>
    </span>
  );
}
