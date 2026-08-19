(function(){'use strict';
if(window.BackwoodsDataBridge)return;
const KEY='backwoods-suite-v8';
const VERSION=1;
function safe(v){try{return JSON.parse(v)}catch(e){return null}}
function readSuite(){return safe(localStorage.getItem(KEY))||{}}
function writeSuite(s){localStorage.setItem(KEY,JSON.stringify(s));window.dispatchEvent(new CustomEvent('backwoods:datachange',{detail:s}))}
function normalize(s){s=s||{};s.properties=Array.isArray(s.properties)?s.properties:[];s.stands=Array.isArray(s.stands)?s.stands:[];s.hunts=Array.isArray(s.hunts)?s.hunts:[];s.cameras=Array.isArray(s.cameras)?s.cameras:[];s.deer=Array.isArray(s.deer)?s.deer:[];s.sightings=Array.isArray(s.sightings)?s.sightings:[];s.conditions=Array.isArray(s.conditions)?s.conditions:[];s.season=s.season||String(new Date().getFullYear());return s}
function migrate(){let s=normalize(readSuite());let changed=false;
 const oldKeys=['backwoods-data','backwoods','bw-properties','backwoods-planner-data'];
 oldKeys.forEach(k=>{const x=safe(localStorage.getItem(k));if(!x)return;const d=normalize(x);['properties','stands','hunts','cameras','deer','sightings','conditions'].forEach(key=>{if(d[key].length){const existing=new Set(s[key].map(v=>v.id||JSON.stringify(v)));d[key].forEach(v=>{const id=v.id||JSON.stringify(v);if(!existing.has(id)){s[key].push(v);existing.add(id);changed=true}})}});});
 const propByName=new Map(s.properties.map(p=>[String(p.name||'').trim().toLowerCase(),p]));
 s.properties.forEach(p=>{if(!p.id){p.id='prop-'+Date.now()+'-'+Math.random().toString(36).slice(2);changed=true}propByName.set(String(p.name||'').trim().toLowerCase(),p)});
 s.stands.forEach(x=>{if(!x.id){x.id='stand-'+Date.now()+'-'+Math.random().toString(36).slice(2);changed=true}if(!x.propertyId&&x.property){const p=s.properties.find(p=>p.id===x.property||String(p.name).toLowerCase()===String(x.property).toLowerCase());if(p){x.propertyId=p.id;changed=true}}if(!x.propertyId&&s.properties.length===1){x.propertyId=s.properties[0].id;changed=true}});
 s.hunts.forEach(h=>{if(!h.id){h.id='hunt-'+Date.now()+'-'+Math.random().toString(36).slice(2);changed=true}if(!h.standId&&h.stand){const x=s.stands.find(x=>x.id===h.stand||String(x.name).toLowerCase()===String(h.stand).toLowerCase());if(x){h.standId=x.id;changed=true}}});
 s.sightings.forEach(x=>{if(!x.id){x.id='sighting-'+Date.now()+'-'+Math.random().toString(36).slice(2);changed=true}if(!x.standId&&x.stand){const st=s.stands.find(st=>st.id===x.stand||String(st.name).toLowerCase()===String(x.stand).toLowerCase());if(st){x.standId=st.id;changed=true}}});
 s.cameras.forEach(c=>{if(!c.id){c.id='camera-'+Date.now()+'-'+Math.random().toString(36).slice(2);changed=true}});
 s.deer.forEach(d=>{if(!d.id){d.id='deer-'+Date.now()+'-'+Math.random().toString(36).slice(2);changed=true}});
 s._schemaVersion=VERSION;if(changed)writeSuite(s);return s}
window.BackwoodsDataBridge={version:VERSION,load:migrate,save:function(s){s=normalize(s);s._schemaVersion=VERSION;writeSuite(s);return s},refresh:migrate,findStand:function(id){return normalize(readSuite()).stands.find(x=>x.id===id)||null},findProperty:function(id){return normalize(readSuite()).properties.find(x=>x.id===id)||null}};
try{migrate()}catch(e){console.warn('Backwoods data migration skipped',e)}
})();