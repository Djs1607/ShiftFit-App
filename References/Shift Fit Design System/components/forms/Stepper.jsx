import React from 'react';
import {IconButton} from './../core/IconButton.jsx';

/** Numeric stepper for reps, sets and load — thumb-friendly, mono readout. */
export function Stepper({value=0,step=1,min=0,max=999,unit,onChange,label,style,...rest}){
  const set=v=>onChange&&onChange(Math.min(max,Math.max(min,+(v).toFixed(2))));
  return (
    <div {...rest} style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      {label&&<span style={{font:'var(--text-label)',letterSpacing:'var(--ls-label)',
        textTransform:'uppercase',color:'var(--text-tertiary)'}}>{label}</span>}
      <div style={{display:'flex',alignItems:'center',gap:4,padding:4,
        background:'var(--surface-inset)',border:'1px solid var(--border-default)',
        borderRadius:'var(--radius-control)'}}>
        <IconButton icon="minus" label="Decrease" onClick={()=>set(value-step)}/>
        <span style={{flex:1,textAlign:'center',
          font:`var(--fw-medium) var(--fs-metric-md)/1 var(--font-mono)`,
          fontFeatureSettings:'var(--font-numeric-feature)',color:'var(--text-primary)'}}>
          {value}{unit&&<span style={{marginLeft:4,fontSize:'var(--fs-body-sm)',
            color:'var(--text-tertiary)'}}>{unit}</span>}
        </span>
        <IconButton icon="plus" label="Increase" onClick={()=>set(value+step)}/>
      </div>
    </div>
  );
}
