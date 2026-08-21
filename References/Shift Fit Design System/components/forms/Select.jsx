import React,{useState} from 'react';
import {Icon} from './../core/Icon.jsx';

/** Native select with Shift Fit chrome. */
export function Select({label,hint,options=[],size='md',style,...rest}){
  const [f,setF]=useState(false);
  const h={sm:32,md:40,lg:48}[size];
  return (
    <label style={{display:'block'}}>
      {label&&<span style={{display:'block',marginBottom:6,font:'var(--text-label)',
        letterSpacing:'var(--ls-label)',textTransform:'uppercase',color:'var(--text-tertiary)'}}>{label}</span>}
      <span style={{position:'relative',display:'block'}}>
        <select {...rest} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{appearance:'none',width:'100%',height:h,padding:'0 34px 0 12px',
            background:'var(--surface-inset)',color:'var(--text-primary)',
            border:`1px solid ${f?'var(--border-focus)':'var(--border-default)'}`,
            borderRadius:'var(--radius-control)',font:'var(--text-body-md)',
            outline:'none',cursor:'pointer',transition:'var(--transition-control)',...style}}>
          {options.map(o=>{const v=typeof o==='string'?o:o.value,l=typeof o==='string'?o:o.label;
            return <option key={v} value={v}>{l}</option>;})}
        </select>
        <Icon name="chevron-down" size="sm" color="var(--text-tertiary)"
          style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
      </span>
      {hint&&<span style={{display:'block',marginTop:6,
        font:'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',color:'var(--text-tertiary)'}}>{hint}</span>}
    </label>
  );
}
