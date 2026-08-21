import React from 'react';
import {Icon} from './../core/Icon.jsx';
import {IconButton} from './../core/IconButton.jsx';

const TONES={info:['info','var(--sf-blue-300)'],success:['check-circle','var(--sf-green-400)'],
  warning:['alert-triangle','var(--sf-amber-400)'],danger:['alert-circle','var(--sf-red-400)']};

/** Transient confirmation. One line, one optional action, auto-dismissing. */
export function Toast({tone='info',title,message,action,onClose,style,...rest}){
  const [icon,c]=TONES[tone]||TONES.info;
  return (
    <div {...rest} role="status" style={{display:'flex',alignItems:'flex-start',gap:10,
      padding:'12px 12px 12px 14px',minWidth:280,maxWidth:420,
      background:'var(--surface-overlay)',border:'1px solid var(--border-default)',
      borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',
      animation:'sf-rise var(--dur-base) var(--ease-out)',...style}}>
      <Icon name={icon} size="md" color={c} style={{marginTop:1}}/>
      <div style={{flex:1,minWidth:0}}>
        {title&&<div style={{font:'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)',
          color:'var(--text-primary)'}}>{title}</div>}
        {message&&<div style={{marginTop:2,
          font:'var(--fw-regular) var(--fs-body-sm)/1.45 var(--font-body)',
          color:'var(--text-secondary)'}}>{message}</div>}
        {action&&<div style={{marginTop:8}}>{action}</div>}
      </div>
      {onClose&&<IconButton icon="x" size="sm" label="Dismiss" onClick={onClose}/>}
    </div>
  );
}
