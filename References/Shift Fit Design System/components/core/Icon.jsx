import React from 'react';

const CDN='https://unpkg.com/lucide-static@0.544.0/icons/';
const SIZES={sm:16,md:20,lg:24,xl:32};
const CACHE={};

/** Lucide icon inlined as SVG so it survives DOM-based capture (screenshots, PPTX,
 *  card thumbnails) as well as normal rendering. Strokes inherit currentColor. */
export function Icon({name='activity',size='md',color,style,...rest}){
  const px=SIZES[size]||size;
  const [markup,setMarkup]=React.useState(CACHE[name]||null);

  React.useEffect(()=>{
    if(CACHE[name]){setMarkup(CACHE[name]);return;}
    let live=true;
    fetch(CDN+name+'.svg').then(r=>r.ok?r.text():'').then(t=>{
      if(!t)return;
      const inner=t.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>[\s\S]*$/,'');
      CACHE[name]=inner;
      if(live)setMarkup(inner);
    }).catch(()=>{});
    return()=>{live=false;};
  },[name]);

  return (
    <span aria-hidden="true" {...rest} style={{display:'inline-flex',alignItems:'center',
      justifyContent:'center',width:px,height:px,flex:'0 0 auto',
      color:color||'currentColor',...style}}>
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{display:'block'}}
        dangerouslySetInnerHTML={markup?{__html:markup}:undefined}/>
    </span>
  );
}
