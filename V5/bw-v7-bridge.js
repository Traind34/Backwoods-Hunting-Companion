(function(){
'use strict';
const LEGACY='backwoods-planner-map-v5',V7='backwoods-v7-suite',V8='backwoods-suite-v8';
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function migrate(){
  const legacy=read(LEGACY), old=read(V7), s=read(V8);
  s.properties=Array.isArray(s.properties)?s.properties:[];
  s.stands=Array.isArray(s.stands)?s.stands:[];
  s.hunts=Array.isArray(s.hunts)?s.hunts:[];
  s.cameras=Array.isArray(s.cameras)?s.cameras:[];
  s.deer=Array.isArray(s.deer)?s.deer:[];
  s.sightings=Array.isArray(s.sightings)?s.sightings:[];
  s.conditions=Array.isArray(s.conditions)?s.conditions:[];
  const existing=new Set(s.stands.map(x=>String(x.id)));
  const addStand=(p,i,source)=>{
    const type=String(p?.type||p?.kind||p?.category||'').toLowerCase();
    if(source==='legacy'&&!type.includes('stand'))return;
    const id=String(p?.id||((source==='legacy'?'legacy-stand-':'v7-stand-')+i));
    if(existing.has(id))return;
    s.stands.push({id,name:String(p?.name||p?.label||('Stand '+(i+1))),type:String(p?.type||'Existing Map Stand'),wind:String(p?.wind||''),notes:String(p?.notes||'Imported from existing Backwoods data.'),source});
    existing.add(id);
  };
  (Array.isArray(legacy.pins)?legacy.pins:[]).forEach((p,i)=>addStand(p,i,'legacy'));
  (Array.isArray(old.stands)?old.stands:[]).forEach((p,i)=>addStand(p,i,'v7'));
  if(!s.properties.length&&Array.isArray(legacy.myParcels)){
    legacy.myParcels.forEach((p,i)=>s.properties.push({id:String(p.id||'legacy-property-'+i),name:String(p.name||p.label||'My Property'),acres:p.acres||'',notes:'Imported from existing Backwoods property map.',source:'legacy-map'}));
  }
  write(V8,s);
  window.dispatchEvent(new CustomEvent('backwoods-v8-change',{detail:{type:'migration'}}));
}
function loadSuite(){
  if(window.BackwoodsSuite)return;
  const s=document.createElement('script');
  s.src='bw-v8-backwoods-suite.js';
  s.defer=true;
  document.head.appendChild(s);
}
function boot(){migrate();loadSuite();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
