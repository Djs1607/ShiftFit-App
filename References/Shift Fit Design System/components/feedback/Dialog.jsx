import React from 'react';
import {IconButton} from './../core/IconButton.jsx';

/** Modal sheet. On mobile it rises from the bottom; on wide screens it centres. */
export function Dialog({open=true,title,description,children,actions,onClose,variant='sheet',style,...rest}){
  if(!open)return null;
  const sheet=variant==='sheet';
  return (
    <div style={{position:'absolute',inset:0,display:'flex',
      alignItems:sheet?'flex-end':'center',justifyContent:'center',
      background:'var(--bg-scrim)',backdropFilter:'blur(6px)',zIndex:50}}>
      <div {...rest} role="dialog" aria-modal="true" style={{width:'100%',maxWidth:sheet?'none':440,
        background:'var(--surface-raised)',
        border:'1px solid var(--border-default)',
        borderRadius:sheet?'var(--radius-sheet) var(--radius-sheet) 0 0':'var(--radius-lg)',
        boxShadow:sheet?'var(--shadow-sheet)':'var(--shadow-lg)',
        padding:'var(--space-6)',
        animation:`sf-rise var(--dur-sheet) var(--ease-out)`,...style}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
          <div style={{flex:1}}>
            {title&&<h3 style={{margin:0,font:'var(--fw-semibold) var(--fs-title-lg)/1.2 var(--font-display)',
              letterSpacing:'var(--ls-title)',color:'var(--text-primary)'}}>{title}</h3>}
            {description&&<p style={{margin:'6px 0 0',
              font:'var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)',
              color:'var(--text-secondary)'}}>{description}</p>}
          </div>
          {onClose&&<IconButton icon="x" label="Close" onClick={onClose}/>}
        </div>
        {children&&<div style={{marginTop:'var(--space-6)'}}>{children}</div>}
        {actions&&<div style={{display:'flex',gap:'var(--space-3)',marginTop:'var(--space-7)'}}>{actions}</div>}
      </div>
    </div>
  );
}
