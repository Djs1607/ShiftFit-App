import React from 'react';
import {Icon} from './../core/Icon.jsx';

const TREND={up:['trending-up','var(--sf-green-400)'],down:['trending-down','var(--sf-red-400)'],flat:['minus','var(--text-tertiary)']};

/** Single number readout: uppercase label, mono value, optional delta. */
export function MetricTile({label,value,unit,delta,trend,size='md',icon,style,...rest}){
  const fs={sm:'var(--fs-metric-md)',md:'var(--fs-metric-lg)',lg:'var(--fs-metric-xl)'}[size];
  const t=TREND[trend];
  return (
    <div {...rest} style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      <span style={{display:'flex',alignItems:'center',gap:6,font:'var(--text-label)',
        letterSpacing:'var(--ls-label)',textTransform:'uppercase',color:'var(--text-tertiary)'}}>
        {icon&&<Icon name={icon} size={13}/>}{label}
      </span>
      <span style={{display:'flex',alignItems:'baseline',gap:4}}>
        <span style={{font:`var(--fw-medium) ${fs}/1 var(--font-mono)`,
          fontFeatureSettings:'var(--font-numeric-feature)',color:'var(--text-primary)',
          letterSpacing:'-0.02em'}}>{value}</span>
        {unit&&<span style={{font:'var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)',
          color:'var(--text-tertiary)'}}>{unit}</span>}
      </span>
      {(delta||t)&&<span style={{display:'flex',alignItems:'center',gap:4,
        font:'var(--fw-medium) var(--fs-body-sm)/1 var(--font-mono)',
        color:t?t[1]:'var(--text-tertiary)'}}>
        {t&&<Icon name={t[0]} size={13}/>}{delta}
      </span>}
    </div>
  );
}
