(function(){
'use strict';
if(window.BackwoodsHuntController)return;
function forms(){return [...document.querySelectorAll('form[data-type="hunt"],#hunt form')];}
function stands(){const s=window.BackwoodsData?.get?.()||{};return Array.isArray(s.stands)?s.stands:[]}
function legacy(){try{return JSON.parse(localStorage.getItem('backwoods-planner-map-v5')||'{}').pins||[]}catch(e){return[]}}
function text(p){return String(p?.name||p?.label||p?.title||p?.location||'').trim().toLowerCase()}
function isStand(p){
  const t=String(p?.type||p?.kind||p?.category||p?.labelType||'').toLowerCase();
  const n=text(p);
  if(t.includes('camera')||t.includes('trail camera')||n.includes('camera'))return false;
  if(t==='stand'||t.includes('stand')||t==='blind'||t.includes('tree stand'))return true;
  return /\b(stand|blind)\b/.test(n);
}
function name(p,i){return String(p?.name||p?.label||p?.title||p?.location||('Stand '+(i+1))).trim()}
function collect(){
  const out=[],seen=new Set();
  stands().concat(legacy()).forEach((p,i)=>{
    if(!isStand(p))return;
    const id=String(p.id??('pin-'+i));
    if(seen.has(id))return;
    seen.add(id);
    out.push({id,name:name(p,i)});
  });
  return out;
}
function sync(form){
  let field=form.querySelector('select[name="stand"],select#huntStand');
  const input=form.querySelector('input[name="stand"]');
  if(!field&&input){
    field=document.createElement('select');field.name='stand';field.id='huntStand';field.className=input.className;field.style.cssText=input.style.cssText;input.replaceWith(field);
  }
  if(!field)return;
  const previous=field.value,items=collect();
  field.innerHTML='';
  const p=document.createElement('option');p.value='';p.textContent=items.length?'Select a stand…':'No stands added yet';field.appendChild(p);
  items.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;field.appendChild(o)});
  if(previous&&items.some(s=>s.id===String(previous)))field.value=previous;
  if(!field.dataset.bwControllerBound){
    field.dataset.bwControllerBound='1';
    field.addEventListener('change',()=>{
      if(field.value){const t=form.querySelector('[name="in"]');if(t){t.value=window.BackwoodsAppCore?.time?.()||new Date().toTimeString().slice(0,5);t.dataset.bwAuto='1'}}
    });
  }
}
function run(){forms().forEach(sync);window.BackwoodsAppCore?.initHuntForm?.()}
window.BackwoodsHuntController={version:2,run,collect};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setInterval(run,1500);
})();
