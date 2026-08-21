import React,{useState} from 'react';
import {Icon} from './Icon.jsx';

const H={sm:32,md:40,lg:48};
const FS={sm:'var(--fs-body-sm)',md:'var(--fs-body-md)',lg:'var(--fs-body-lg)'};
const PAD={sm:'0 12px',md:'0 16px',lg:'0 20px'};

function skin(variant,state){
  const on={
    primary:{bg:'var(--action-primary)',fg:'var(--text-on-primary)',bd:'transparent'},
    accent:{bg:'var(--action-accent)',fg:'var(--text-on-accent)',bd:'transparent'},
    secondary:{bg:'transparent',fg:'var(--text-primary)',bd:'var(--border-strong)'},
    ghost:{bg:'transparent',fg:'var(--text-secondary)',bd:'transparent'},
    danger:{bg:'var(--feedback-danger-quiet)',fg:'var(--feedback-danger)',bd:'rgba(196,97,79,.4)'}
  }[variant]||{};
  if(state==='hover'){
    if(variant==='primary')on.bg='var(--action-primary-hover)';
    if(variant==='accent')on.bg='var(--action-accent-hover)';
    if(variant==='secondary'){on.bg='var(--surface-hover)';on.bd='var(--border-focus)';}
    if(variant==='ghost'){on.bg='var(--surface-hover)';on.fg='var(--text-primary)';}
    if(variant==='danger')on.bg='rgba(196,97,79,.22)';
  }
  if(state==='press'){
    if(variant==='primary')on.bg='var(--action-primary-press)';
    if(variant==='accent')on.bg='var(--action-accent-press)';
    if(variant!=='primary'&&variant!=='accent')on.bg='var(--surface-press)';
  }
  return on;
}

/** Primary action control. Amber = effort/commit, blue = navigation/confirm. */
export function Button({variant='primary',size='md',icon,iconAfter,fullWidth,disabled,children,style,onClick,...rest}){
  const [s,setS]=useState('rest');
  const k=skin(variant,disabled?'rest':s);
  return (
    <button {...rest} disabled={disabled} onClick={onClick}
      onMouseEnter={()=>setS('hover')} onMouseLeave={()=>setS('rest')}
      onMouseDown={()=>setS('press')} onMouseUp={()=>setS('hover')}
      style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,
        height:H[size],padding:PAD[size],width:fullWidth?'100%':undefined,
        font:`var(--fw-semibold) ${FS[size]}/1 var(--font-body)`,letterSpacing:'-0.005em',whiteSpace:'nowrap',
        background:k.bg,color:k.fg,border:`1px solid ${k.bd}`,
        borderRadius:'var(--radius-control)',cursor:disabled?'not-allowed':'pointer',
        opacity:disabled?.4:1,transform:s==='press'&&!disabled?'scale(var(--press-scale))':'none',
        transition:'var(--transition-control)',...style}}>
      {icon&&<Icon name={icon} size={size==='lg'?'lg':'sm'}/>}
      {children}
      {iconAfter&&<Icon name={iconAfter} size={size==='lg'?'lg':'sm'}/>}
    </button>
  );
}
