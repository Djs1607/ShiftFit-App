import React from 'react';

const BANDS=[
  {max:20,label:'Fresh',c:'var(--sf-fatigue-1)'},
  {max:40,label:'Ready',c:'var(--sf-fatigue-2)'},
  {max:65,label:'Elevated',c:'var(--sf-fatigue-3)'},
  {max:85,label:'High',c:'var(--sf-fatigue-4)'},
  {max:101,label:'Critical',c:'var(--sf-fatigue-5)'}
];

/** 240° arc gauge for the fatigue/readiness score. Band colour carries meaning. */
export function FatigueGauge({value=0,size=180,label='Fatigue',caption,thickness=12,style,...rest}){
  const band=BANDS.find(b=>value<b.max)||BANDS[4];
  const r=(size-thickness)/2,c=size/2,sweep=270,start=135;
  const len=2*Math.PI*r*(sweep/360);
  const pol=(a,rad)=>[c+rad*Math.cos(a*Math.PI/180),c+rad*Math.sin(a*Math.PI/180)];
  const arc=(from,to)=>{const[x1,y1]=pol(from,r),[x2,y2]=pol(to,r);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to-from>180?1:0} 1 ${x2} ${y2}`;};
  return (
    <div {...rest} style={{display:'inline-flex',flexDirection:'column',alignItems:'center',...style}}>
      <div style={{position:'relative',width:size,height:size*0.82}}>
        <svg width={size} height={size} style={{display:'block'}}>
          <path d={arc(start,start+sweep)} fill="none" stroke="var(--data-track)"
            strokeWidth={thickness} strokeLinecap="round"/>
          <path d={arc(start,start+sweep)} fill="none" stroke={band.c}
            strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={`${len} ${len}`}
            strokeDashoffset={len*(1-Math.min(100,value)/100)}
            style={{transition:'stroke-dashoffset var(--dur-meter) var(--ease-mechanical), stroke var(--dur-base) var(--ease-standard)'}}/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center',paddingTop:size*0.04}}>
          <span style={{font:`var(--fw-medium) ${size*0.26}px/1 var(--font-mono)`,
            fontFeatureSettings:'var(--font-numeric-feature)',color:'var(--text-primary)',
            letterSpacing:'-0.03em'}}>{Math.round(value)}</span>
          <span style={{marginTop:6,font:'var(--fw-semibold) var(--fs-micro)/1 var(--font-body)',
            letterSpacing:'var(--ls-label)',textTransform:'uppercase',color:band.c}}>{band.label}</span>
        </div>
      </div>
      <span style={{marginTop:2,font:'var(--text-label)',letterSpacing:'var(--ls-label)',
        textTransform:'uppercase',color:'var(--text-tertiary)'}}>{label}</span>
      {caption&&<span style={{marginTop:6,maxWidth:size+40,textAlign:'center',
        font:'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)',
        color:'var(--text-secondary)'}}>{caption}</span>}
    </div>
  );
}
