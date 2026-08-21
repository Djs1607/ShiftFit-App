import React from 'react';
import {Icon} from './Icon.jsx';

/** Selectable/removable chip — filters, muscle groups, session labels. */
export function Tag({selected,onRemove,icon,children,style,...rest}){
  return (
    <span {...rest} style={{display:'inline-flex',alignItems:'center',gap:6,
      height:28,padding:'0 10px',
      background:selected?'var(--surface-selected)':'var(--surface-raised)',
      color:selected?'var(--sf-blue-300)':'var(--text-secondary)',
      border:`1px solid ${selected?'rgba(74,122,158,.45)':'var(--border-subtle)'}`,
      borderRadius:'var(--radius-sm)',
      font:'var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)',
      cursor:'pointer',transition:'var(--transition-control)',...style}}>
      {icon&&<Icon name={icon} size={14}/>}
      {children}
      {onRemove&&<Icon name="x" size={14} onClick={onRemove} style={{opacity:.6,cursor:'pointer'}}/>}
    </span>
  );
}
