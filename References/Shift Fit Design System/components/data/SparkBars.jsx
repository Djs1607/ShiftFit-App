import React from 'react';

/** Compact bar chart for weekly volume / sleep debt. No axes, no gridlines. */
export function SparkBars({data=[],height=64,color='var(--action-primary)',highlightLast,labels,style,...rest}){
  const max=Math.max(1,...data);
  return (
    <div {...rest} style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      <div style={{display:'flex',alignItems:'flex-end',gap:4,height}}>
        {data.map((v,i)=>{
          const last=highlightLast&&i===data.length-1;
          return <div key={i} style={{flex:1,height:`${Math.max(3,(v/max)*100)}%`,
            background:last?'var(--action-accent)':color,opacity:last?1:.62,
            borderRadius:'2px 2px 0 0',
            transition:'height var(--dur-meter) var(--ease-mechanical)'}}/>;
        })}
      </div>
      {labels&&<div style={{display:'flex',gap:4}}>
        {labels.map((l,i)=><span key={i} style={{flex:1,textAlign:'center',
          font:'var(--fw-medium) var(--fs-micro)/1 var(--font-mono)',
          color:'var(--text-tertiary)'}}>{l}</span>)}
      </div>}
    </div>
  );
}
