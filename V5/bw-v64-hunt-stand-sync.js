(function(){
  'use strict';
  if(window.__bwV64StandSync)return;
  window.__bwV64StandSync=true;

  function readLegacy(){
    try{return JSON.parse(localStorage.getItem('backwoods-planner-map-v5')||'{}')}catch(e){return {}};
  }
  function readV6(){
    try{return window.BackwoodsData?.get?.()||null}catch(e){return null}
  }
  function isStand(p){
    const t=String(p?.type||p?.kind||p?.category||p?.labelType||'').toLowerCase();
    return t==='stand'||t.includes('tree stand')||t.includes('hunting stand')||t.includes('stand');
  }
  function name(p,i){return String(p?.name||p?.label||p?.title||('Stand '+(i+1))).trim()}
  function collect(){
    const out=[],seen=new Set();
    const v6=readV6();
    (v6?.stands||[]).forEach((p,i)=>{if(!p||!isStand(p))return;const id=String(p.id??'');if(id&&!seen.has(id)){seen.add(id);out.push({id:id,name:name(p,i)})}});
    const legacy=readLegacy();
    (legacy.pins||[]).forEach((p,i)=>{if(!p||!isStand(p))return;const id=String(p.id??i);if(!seen.has(id)){seen.add(id);out.push({id:id,name:name(p,i)})}});
    return out;
  }
  function forms(){
    const a=[...document.querySelectorAll('form[data-type="hunt"],#hunt form')];
    return [...new Set(a)];
  }
  function sync(form){
    if(!form)return;
    let field=form.querySelector('select[name="stand"],select#huntStand');
    const input=form.querySelector('input[name="stand"]');
    if(!field&&input){
      field=document.createElement('select');
      field.name='stand';field.id='huntStand';field.className=input.className;field.style.cssText=input.style.cssText;
      input.replaceWith(field);
    }
    if(!field)return;
    const stands=collect(),previous=field.value;
    field.innerHTML='';
    const placeholder=document.createElement('option');
    placeholder.value='';placeholder.textContent=stands.length?'Select a stand…':'No stands added yet';
    field.appendChild(placeholder);
    stands.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;field.appendChild(o)});
    if(previous&&stands.some(s=>String(s.id)===String(previous)))field.value=previous;
    field.dataset.bwStandSync='1';
    const label=field.closest('label');
    if(label){const text=[...label.childNodes].find(n=>n.nodeType===3&&String(n.textContent).trim());if(text)text.textContent='Stand';}
  }
  function run(){forms().forEach(sync)}
  run();
  setInterval(run,1000);
  window.BackwoodsHuntStandSync={version:1,sync:run};
})();
