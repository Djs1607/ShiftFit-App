import React,{useState} from 'react';
import {Icon} from './../core/Icon.jsx';

/** Text/number field. Inset well, hairline border, blue focus. */
export function Input({label,hint,error,icon,suffix,size='md',style,wrapperStyle,...rest}){
  const [f,setF]=useState(false);
  const h={sm:32,md:40,lg:48}[size];
  return (
    <label style={{display:'block',...wrapperStyle}}>
      {label&&<span style={{display:'block',marginBottom:6,
        font:'var(--text-label)',letterSpacing:'var(--ls-label)',
        textTransform:'uppercase',color:'var(--text-tertiary)'}}>{label}</span>}
      <span style={{display:'flex',alignItems:'center',gap:8,height:h,padding:'0 12px',
        background:'var(--surface-inset)',
        border:`1px solid ${error?'var(--feedback-danger)':f?'var(--border-focus)':'var(--border-default)'}`,
        borderRadius:'var(--radius-control)',
        boxShadow:f?'0 0 0 3px rgba(74,122,158,.18)':'none',
        transition:'var(--transition-control)'}}>
        {icon&&<Icon name={icon} size="sm" color="var(--text-tertiary)"/>}
        <input {...rest} onFocus={e=>{setF(true);rest.onFocus&&rest.onFocus(e);}}
          onBlur={e=>{setF(false);rest.onBlur&&rest.onBlur(e);}}
          style={{flex:1,minWidth:0,background:'none',border:'none',outline:'none',
            color:'var(--text-primary)',font:'var(--text-body-md)',...style}}/>
        {suffix&&<span style={{font:'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)',
          color:'var(--text-tertiary)'}}>{suffix}</span>}
      </span>
      {(hint||error)&&<span style={{display:'block',marginTop:6,
        font:'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
        color:error?'var(--feedback-danger)':'var(--text-tertiary)'}}>{error||hint}</span>}
    </label>
  );
}
