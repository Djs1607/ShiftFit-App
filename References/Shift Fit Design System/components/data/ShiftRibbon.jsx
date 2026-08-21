import React from 'react';

const C={day:'var(--sf-shift-day)',swing:'var(--sf-shift-swing)',night:'var(--sf-shift-night)',off:'var(--sf-shift-off)'};

/** Horizontal circadian strip: one cell per day, coloured by shift phase. */
export function ShiftRibbon({days=[],height=32,showLabels=true,style,...rest}){
  return (
    <div {...rest} style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      <div style={{display:'flex',gap:3}}>
        {days.map((d,i)=>(
          <div key={i} title={d.type} style={{flex:1,height,background:C[d.type]||C.off,
            borderRadius:'var(--radius-xs)',position:'relative',
            outline:d.today?'1px solid var(--text-primary)':'none',outlineOffset:1}}>
            {d.session&&<span style={{position:'absolute',bottom:4,left:'50%',
              transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',
              background:'var(--sf-ink-100)'}}/>}
          </div>
        ))}
      </div>
      {showLabels&&<div style={{display:'flex',gap:3}}>
        {days.map((d,i)=>(
          <span key={i} style={{flex:1,textAlign:'center',
            font:'var(--fw-medium) var(--fs-micro)/1 var(--font-mono)',
            color:d.today?'var(--text-primary)':'var(--text-tertiary)'}}>{d.label}</span>
        ))}
      </div>}
    </div>
  );
}
