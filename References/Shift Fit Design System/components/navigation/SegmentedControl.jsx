import React from 'react';

/** 2–4 mutually exclusive views (Week / Month / Cycle). */
export function SegmentedControl({options=[],value,onChange,fullWidth=true,style,...rest}){
  return (
    <div {...rest} role="tablist" style={{display:'inline-flex',padding:3,gap:2,
      width:fullWidth?'100%':undefined,
      background:'var(--surface-inset)',border:'1px solid var(--border-subtle)',
      borderRadius:'var(--radius-control)',...style}}>
      {options.map(o=>{
        const v=typeof o==='string'?o:o.value,l=typeof o==='string'?o:o.label;
        const on=v===value;
        return (
          <button key={v} role="tab" aria-selected={on} onClick={()=>onChange&&onChange(v)}
            style={{flex:1,height:32,padding:'0 12px',
              background:on?'var(--surface-overlay)':'transparent',
              color:on?'var(--text-primary)':'var(--text-tertiary)',
              border:'none',borderRadius:'var(--radius-sm)',cursor:'pointer',
              font:`${on?'var(--fw-semibold)':'var(--fw-medium)'} var(--fs-body-sm)/1 var(--font-body)`,
              boxShadow:on?'var(--shadow-sm)':'none',
              transition:'var(--transition-control)'}}>{l}</button>
        );
      })}
    </div>
  );
}
