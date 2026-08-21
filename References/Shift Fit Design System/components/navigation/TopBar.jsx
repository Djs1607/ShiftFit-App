import React from 'react';
import {IconButton} from './../core/IconButton.jsx';

/** Screen header: 56px, hairline underline, optional eyebrow. */
export function TopBar({title,eyebrow,back,onBack,actions,sticky,style,...rest}){
  return (
    <header {...rest} style={{display:'flex',alignItems:'center',gap:'var(--space-3)',
      height:'var(--nav-h)',padding:'0 var(--gutter-screen)',
      background:'var(--bg-base)',borderBottom:'1px solid var(--border-subtle)',
      position:sticky?'sticky':'relative',top:sticky?0:undefined,zIndex:20,...style}}>
      {back&&<IconButton icon="chevron-left" label="Back" onClick={onBack}
        style={{marginLeft:-8}}/>}
      <div style={{flex:1,minWidth:0}}>
        {eyebrow&&<div style={{font:'var(--fw-semibold) var(--fs-micro)/1 var(--font-body)',
          letterSpacing:'var(--ls-eyebrow)',textTransform:'uppercase',
          color:'var(--text-tertiary)',marginBottom:3}}>{eyebrow}</div>}
        <div style={{font:'var(--fw-semibold) var(--fs-title-md)/1.15 var(--font-display)',
          letterSpacing:'var(--ls-title)',color:'var(--text-primary)',
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</div>
      </div>
      {actions&&<div style={{display:'flex',gap:'var(--space-1)',marginRight:-8}}>{actions}</div>}
    </header>
  );
}
