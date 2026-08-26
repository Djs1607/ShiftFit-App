/** ShiftFit brand lockup — app-icon mark + Space Grotesk wordmark, "Fit" in amber. */
export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dims = {
    sm: { mark: 'h-6 w-6 rounded-[6px]', text: 'text-lg', gap: 'gap-2' },
    md: { mark: 'h-8 w-8 rounded-[8px]', text: 'text-2xl', gap: 'gap-2.5' },
    lg: { mark: 'h-11 w-11 rounded-[11px]', text: 'text-3xl', gap: 'gap-3.5' },
    xl: { mark: 'h-14 w-14 rounded-[14px]', text: 'text-4xl', gap: 'gap-4' },
  }[size];
  return (
    <span className={`inline-flex items-center ${dims.gap} select-none`}>
      <img src="/logo-mark.png" alt="" className={`${dims.mark} object-contain shrink-0`} />
      <span className={`${dims.text} font-display font-bold leading-none tracking-[-0.03em] text-fg-primary`}>
        Shift<span className="text-action-accent">Fit</span>
      </span>
    </span>
  );
}
