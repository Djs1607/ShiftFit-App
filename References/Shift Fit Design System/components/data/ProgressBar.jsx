import React from 'react';

/** Linear track — session completion, weekly targets, upload states. */
export function ProgressBar({value=0,max=100,tone='primary',height=8,label,valueLabel,style,...rest}){
  const pct=Math.min(100,(value/max)*100);
  const c={primary:'var(--action-primary)',accent:'var(--action-accent)',
    success:'var(--feedback-success)',danger:'var(--feedback-danger)'}[tone];
  return (
    <div {...rest} style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      {(label||valueLabel)&&<div style={{display:'flex',justifyContent:'space-between',gap:8}}>
        <span style={{font:'var(--text-label)',letterSpacing:'var(--ls-label)',
          textTransform:'uppercase',color:'var(--text-tertiary)'}}>{label}</span>
        <span style={{font:'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)',
          fontFeatureSettings:'var(--font-numeric-feature)',color:'var(--text-secondary)'}}>{valueLabel}</span>
      </div>}
      <div style={{height,background:'var(--data-track)',borderRadius:'var(--radius-pill)',overflow:'hidden'}}>
        <div style={{width:`${pct}%`,height:'100%',background:c,
          borderRadius:'var(--radius-pill)',
          transition:'width var(--dur-slow) var(--ease-mechanical)'}}/>
      </div>
    </div>
  );
}
