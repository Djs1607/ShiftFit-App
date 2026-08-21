import React from 'react';
import {Icon} from './../core/Icon.jsx';

/** Bottom navigation, 4–5 destinations, active item in amber. */
export function TabBar({items=[],active,onChange,style,...rest}){
  return (
    <nav {...rest} style={{display:'flex',alignItems:'stretch',
      height:'var(--tabbar-h)',background:'var(--surface-card)',
      borderTop:'1px solid var(--border-subtle)',...style}}>
      {items.map(it=>{
        const on=it.id===active;
        return (
          <button key={it.id} onClick={()=>onChange&&onChange(it.id)}
            style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:4,background:'none',border:'none',
              cursor:'pointer',color:on?'var(--action-accent)':'var(--text-tertiary)',
              transition:'color var(--dur-fast) var(--ease-standard)'}}>
            <Icon name={it.icon} size="md"/>
            <span style={{font:`${on?'var(--fw-semibold)':'var(--fw-medium)'} var(--fs-micro)/1 var(--font-body)`,
              letterSpacing:'.02em'}}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
