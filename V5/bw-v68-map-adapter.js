(function(){
'use strict';
if(window.BackwoodsMapAdapter)return;
const KEY='backwoods-planner-map-v5';
function legacy(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function syncPins(){const d=window.BackwoodsData;if(!d)return;const l=legacy(),pins=Array.isArray(l.pins)?l.pins:[],s=d.get();let changed=false;const buckets={stands:'stand',cameras:'camera',beddingAreas:'bedding',foodPlots:'food',waterSources:'water',scrapes:'scrape',rubAreas:'rub'};pins.forEach((p,i)=>{const t=String(p?.type||p?.kind||p?.category||'other').toLowerCase();let collection=Object.keys(buckets).find(k=>t.includes(buckets[k]));if(!collection)collection='otherLocations';const id=String(p?.id??'');const arr=s[collection]||[];if(id&&!arr.some(x=>String(x.id)===id)){d.add(collection,{...p,id});changed=true}});return changed?d.get():s}
function saveFromCanonical(){const d=window.BackwoodsData;if(!d)return;const s=d.get(),l=legacy();const all=[];Object.keys({stands:1,cameras:1,beddingAreas:1,foodPlots:1,waterSources:1,scrapes:1,rubAreas:1,otherLocations:1}).forEach(k=>(s[k]||[]).forEach(p=>all.push(p)));const existing=Array.isArray(l.pins)?l.pins:[];const byId=new Map(existing.map(p=>[String(p.id),p]));all.forEach(p=>{if(!byId.has(String(p.id)))byId.set(String(p.id),p)});l.pins=[...byId.values()];localStorage.setItem(KEY,JSON.stringify(l))}
function init(){syncPins();saveFromCanonical();window.dispatchEvent(new CustomEvent('backwoods:data-change',{detail:{type:'map-sync'}}))}
window.BackwoodsMapAdapter={version:1,sync:syncPins,publish:saveFromCanonical,init};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
