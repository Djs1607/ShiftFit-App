import React from 'react';

/** Base container. Elevation in Shift Fit is surface value + hairline, not shadow. */
export function Card({tone='default',padding='md',interactive,header,footer,children,style,...rest}){
  const bg={default:'var(--surface-card)',raised:'var(--surface-raised)',inset:'var(--surface-inset)',
    accent:'var(--action-accent-quiet)',primary:'var(--action-primary-quiet)'}[tone];
  const pad={none:0,sm:'var(--space-4)',md:'var(--gutter-card)',lg:'var(--gutter-card-lg)'}[padding];
  return (
    <div {...rest} style={{background:bg,border:'1px solid var(--border-subtle)',
      borderRadius:'var(--radius-card)',padding:pad,
      boxShadow:tone==='inset'?'none':'var(--shadow-sm)',
      cursor:interactive?'pointer':undefined,transition:'var(--transition-control)',...style}}>
      {header&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        gap:8,marginBottom:'var(--space-4)'}}>{header}</div>}
      {children}
      {footer&&<div style={{marginTop:'var(--space-4)',paddingTop:'var(--space-4)',
        borderTop:'1px solid var(--border-subtle)'}}>{footer}</div>}
    </div>
  );
}
