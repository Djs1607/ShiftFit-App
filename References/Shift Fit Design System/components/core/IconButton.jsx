import React,{useState} from 'react';
import {Icon} from './Icon.jsx';

const H={sm:32,md:40,lg:48};

/** Square, label-free control for toolbars and cards. */
export function IconButton({icon='more-horizontal',size='md',variant='ghost',label,disabled,style,...rest}){
  const [h,setH]=useState(false),[p,setP]=useState(false);
  const filled=variant==='filled';
  return (
    <button {...rest} aria-label={label} disabled={disabled}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>{setH(false);setP(false);}}
      onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)}
      style={{display:'inline-flex',alignItems:'center',justifyContent:'center',
        width:H[size],height:H[size],
        background:filled?'var(--surface-raised)':(p?'var(--surface-press)':h?'var(--surface-hover)':'transparent'),
        color:h||filled?'var(--text-primary)':'var(--text-secondary)',
        border:filled?'1px solid var(--border-subtle)':'1px solid transparent',
        borderRadius:'var(--radius-control)',cursor:disabled?'not-allowed':'pointer',
        opacity:disabled?.4:1,transform:p?'scale(var(--press-scale))':'none',
        transition:'var(--transition-control)',...style}}>
      <Icon name={icon} size={size==='sm'?'sm':'md'}/>
    </button>
  );
}
