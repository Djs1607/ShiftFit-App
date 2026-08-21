import React from 'react';
import {Icon} from './../core/Icon.jsx';

/** Zero-data state: glyph, one line of plain talk, one action. */
export function EmptyState({icon='inbox',title,message,action,style,...rest}){
  return (
    <div {...rest} style={{display:'flex',flexDirection:'column',alignItems:'center',
      textAlign:'center',gap:'var(--space-4)',padding:'var(--space-9) var(--space-6)',...style}}>
      <span style={{display:'flex',alignItems:'center',justifyContent:'center',
        width:56,height:56,borderRadius:'var(--radius-lg)',
        background:'var(--surface-inset)',border:'1px solid var(--border-subtle)'}}>
        <Icon name={icon} size="lg" color="var(--text-tertiary)"/>
      </span>
      <div>
        <div style={{font:'var(--fw-semibold) var(--fs-title-sm)/1.3 var(--font-display)',
          color:'var(--text-primary)'}}>{title}</div>
        {message&&<div style={{marginTop:4,maxWidth:280,
          font:'var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)',
          color:'var(--text-secondary)'}}>{message}</div>}
      </div>
      {action}
    </div>
  );
}
