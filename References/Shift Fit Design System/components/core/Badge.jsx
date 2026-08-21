import React from 'react';
import {Icon} from './Icon.jsx';

const TONES={
  neutral:['var(--surface-raised)','var(--text-secondary)','var(--border-default)'],
  primary:['var(--action-primary-quiet)','var(--sf-blue-300)','rgba(74,122,158,.35)'],
  accent:['var(--action-accent-quiet)','var(--sf-amber-400)','rgba(224,164,88,.35)'],
  success:['var(--feedback-success-quiet)','var(--sf-green-400)','rgba(94,158,126,.35)'],
  warning:['var(--feedback-warning-quiet)','var(--sf-amber-400)','rgba(224,164,88,.35)'],
  danger:['var(--feedback-danger-quiet)','var(--sf-red-400)','rgba(196,97,79,.35)']
};

/** Small status marker. Reads state, never navigates. */
export function Badge({tone='neutral',icon,dot,uppercase=true,children,style,...rest}){
  const [bg,fg,bd]=TONES[tone]||TONES.neutral;
  return (
    <span {...rest} style={{display:'inline-flex',alignItems:'center',gap:6,
      padding:'3px 8px',background:bg,color:fg,border:`1px solid ${bd}`,
      borderRadius:'var(--radius-pill)',
      font:'var(--fw-semibold) var(--fs-micro)/1.4 var(--font-body)',
      letterSpacing:'var(--ls-label)',textTransform:uppercase?'uppercase':'none',...style}}>
      {dot&&<span style={{width:6,height:6,borderRadius:'50%',background:fg}}/>}
      {icon&&<Icon name={icon} size={12}/>}
      {children}
    </span>
  );
}
