import React,{useState} from 'react';
import {Icon} from './../core/Icon.jsx';

/** Tappable row for lists of sessions, exercises, settings. */
export function ListRow({title,subtitle,leading,trailing,meta,chevron=true,onClick,style,...rest}){
  const [h,setH]=useState(false);
  return (
    <div {...rest} onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:'flex',alignItems:'center',gap:'var(--space-4)',
        minHeight:'var(--tap-min)',padding:'12px var(--gutter-card)',
        background:h&&onClick?'var(--surface-hover)':'transparent',
        cursor:onClick?'pointer':'default',
        transition:'background-color var(--dur-fast) var(--ease-standard)',...style}}>
      {leading}
      <div style={{flex:1,minWidth:0}}>
        <div style={{font:'var(--fw-medium) var(--fs-body-md)/1.3 var(--font-body)',
          color:'var(--text-primary)'}}>{title}</div>
        {subtitle&&<div style={{marginTop:2,
          font:'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
          color:'var(--text-tertiary)'}}>{subtitle}</div>}
      </div>
      {meta&&<span style={{font:'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)',
        fontFeatureSettings:'var(--font-numeric-feature)',color:'var(--text-secondary)'}}>{meta}</span>}
      {trailing}
      {chevron&&onClick&&<Icon name="chevron-right" size="sm" color="var(--text-tertiary)"/>}
    </div>
  );
}
