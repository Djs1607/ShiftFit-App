import React from 'react';

/** Single-choice row. */
export function Radio({checked,onChange,label,description,name,disabled,style,...rest}){
  return (
    <label {...rest} style={{display:'flex',gap:10,alignItems:'flex-start',
      cursor:disabled?'not-allowed':'pointer',opacity:disabled?.45:1,...style}}>
      <span onClick={()=>!disabled&&onChange&&onChange(true)} data-name={name}
        style={{display:'flex',alignItems:'center',justifyContent:'center',
          width:20,height:20,marginTop:1,flex:'0 0 auto',borderRadius:'50%',
          background:'var(--surface-inset)',
          border:`1px solid ${checked?'var(--action-primary)':'var(--border-strong)'}`,
          transition:'var(--transition-control)'}}>
        {checked&&<span style={{width:9,height:9,borderRadius:'50%',background:'var(--action-primary)'}}/>}
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
