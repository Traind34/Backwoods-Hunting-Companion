(function(){
'use strict';
const LEGACY='backwoods-planner-map-v5',V7='backwoods-v7-suite';
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function migrate(){const legacy=read(LEGACY),s=read(V7);s.stands=Array.isArray(s.stands)?s.stands:[];const existing=new Set(s.stands.map(x=>String(x.id)));const pins=Array.isArray(legacy.pins)?legacy.pins:[];pins.forEach((p,i)=>{const type=String(p?.type||p?.kind||p?.category||'').toLowerCase();if(!type.includes('stand'))return;const id=String(p.id||('legacy-stand-'+i));if(existing.has(id))return;s.stands.push({id,name:String(p.name||p.label||('Stand '+(i+1))),type:'Existing Map Stand',wind:String(p.wind||''),notes:'Imported from the existing Backwoods property map.',source:'legacy-map'});existing.add(id)});write(V7,s);window.dispatchEvent(new CustomEvent('backwoods-v7-change',{detail:{type:'legacy-migration'}}))}
function boot(){migrate();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();