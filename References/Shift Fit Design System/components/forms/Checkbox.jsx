import React from 'react';
import {Icon} from './../core/Icon.jsx';

/** Multi-select control. 20px box, 4px radius, amber when checked. */
export function Checkbox({checked,onChange,label,description,disabled,style,...rest}){
  return (
    <label {...rest} style={{display:'flex',gap:10,alignItems:'flex-start',
      cursor:disabled?'not-allowed':'pointer',opacity:disabled?.45:1,...style}}>
      <span onClick={()=>!disabled&&onChange&&onChange(!checked)}
        style={{display:'flex',alignItems:'center',justifyContent:'center',
          width:20,height:20,marginTop:1,flex:'0 0 auto',
          background:checked?'var(--action-accent)':'var(--surface-inset)',
          border:`1px solid ${checked?'var(--action-accent)':'var(--border-strong)'}`,
          borderRadius:'var(--radius-xs)',transition:'var(--transition-control)'}}>
        {checked&&<Icon name="check" size={14} color="var(--text-on-accent)"/>}
      </span>
      {(label||description)&&<span>
        <span style={{display:'block',font:'var(--fw-medium) var(--fs-body-md)/1.3 var(--font-body)',
          color:'var(--text-primary)'}}>{label}</span>
        {description&&<span style={{display:'block',marginTop:2,
          font:'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
          color:'var(--text-tertiary)'}}>{description}</span>}
      </span>}
    </label>
  );
}
