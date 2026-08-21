import React,{useState} from 'react';

/** Hover/focus hint for icon-only controls and metric definitions. */
export function Tooltip({label,placement='top',children,style,...rest}){
  const [open,setOpen]=useState(false);
  const pos={top:{bottom:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)'},
    bottom:{top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)'},
    left:{right:'calc(100% + 8px)',top:'50%',transform:'translateY(-50%)'},
    right:{left:'calc(100% + 8px)',top:'50%',transform:'translateY(-50%)'}}[placement];
  return (
    <span {...rest} style={{position:'relative',display:'inline-flex',...style}}
      onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}
      onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)}>
      {children}
      {open&&<span role="tooltip" style={{position:'absolute',...pos,zIndex:40,
        whiteSpace:'nowrap',padding:'6px 9px',background:'var(--sf-ink-700)',
        color:'var(--text-primary)',border:'1px solid var(--border-strong)',
        borderRadius:'var(--radius-sm)',boxShadow:'var(--shadow-md)',
        font:'var(--fw-medium) var(--fs-body-sm)/1.2 var(--font-body)',
        animation:'sf-rise var(--dur-fast) var(--ease-out)'}}>{label}</span>}
    </span>
  );
}
