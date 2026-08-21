import React from 'react';

/** Instant-effect setting toggle. */
export function Switch({checked,onChange,label,description,disabled,style,...rest}){
  return (
    <div {...rest} style={{display:'flex',alignItems:'center',gap:12,
      opacity:disabled?.45:1,...style}}>
      {(label||description)&&<div style={{flex:1,minWidth:0}}>
        <div style={{font:'var(--fw-medium) var(--fs-body-md)/1.3 var(--font-body)',
          color:'var(--text-primary)'}}>{label}</div>
        {description&&<div style={{marginTop:2,
          font:'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
          color:'var(--text-tertiary)'}}>{description}</div>}
      </div>}
      <button role="switch" aria-checked={!!checked} disabled={disabled}
        onClick={()=>onChange&&onChange(!checked)}
        style={{position:'relative',width:44,height:26,flex:'0 0 auto',padding:0,
          background:checked?'var(--action-primary)':'var(--surface-raised)',
          border:`1px solid ${checked?'var(--action-primary)':'var(--border-strong)'}`,
          borderRadius:'var(--radius-pill)',cursor:disabled?'not-allowed':'pointer',
          transition:'background-color var(--dur-base) var(--ease-standard),border-color var(--dur-base) var(--ease-standard)'}}>
        <span style={{position:'absolute',top:2,left:checked?20:2,width:20,height:20,
          borderRadius:'50%',background:checked?'#F2F7FB':'var(--sf-ink-300)',
          transition:'left var(--dur-base) var(--ease-out)'}}/>
      </button>
    </div>
  );
}
