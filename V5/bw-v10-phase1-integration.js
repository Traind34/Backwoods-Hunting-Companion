(function(){
'use strict';
if(window.BackwoodsPhase1Integration)return;
window.BackwoodsPhase1Integration={version:'10.0'};
const KEY='backwoods-suite-v8';
const LEGACY='backwoods-planner-map-v5';
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}}
function write(s){localStorage.setItem(KEY,JSON.stringify(s));window.dispatchEvent(new CustomEvent('backwoods:datachange',{detail:s}))}
function id(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function normalize(){const s=read(KEY);s.properties=Array.isArray(s.properties)?s.properties:[];s.stands=Array.isArray(s.stands)?s.stands:[];s.hunts=Array.isArray(s.hunts)?s.hunts:[];s.cameras=Array.isArray(s.cameras)?s.cameras:[];s.deer=Array.isArray(s.deer)?s.deer:[];s.sightings=Array.isArray(s.sightings)?s.sightings:[];s.conditions=Array.isArray(s.conditions)?s.conditions:[];return s}
function syncMap(){const s=normalize(),legacy=read(LEGACY);let changed=false;const byName=new Map(s.properties.map(p=>[String(p.name||'').trim().toLowerCase(),p]));
 if(Array.isArray(legacy.myParcels))legacy.myParcels.forEach((p,i)=>{const name=String(p.name||p.label||'My Property').trim(),key=name.toLowerCase();if(!byName.has(key)){const x={id:String(p.id||id('property')),name,acres:p.acres||'',notes:'Imported from Backwoods property map.',source:'map'};s.properties.push(x);byName.set(key,x);changed=true}});
 const existing=new Set(s.stands.map(x=>String(x.id)));(Array.isArray(legacy.pins)?legacy.pins:[]).forEach((p,i)=>{const type=String(p.type||p.kind||p.category||'').toLowerCase();if(type&&!type.includes('stand'))return;const sid=String(p.id||'legacy-stand-'+i);if(existing.has(sid))return;const prop=s.properties.length===1?s.properties[0]:null;s.stands.push({id:sid,name:String(p.name||p.label||'Map Stand '+(i+1)),type:String(p.type||'Existing Map Stand'),wind:String(p.wind||''),notes:String(p.notes||'Imported from existing Backwoods map.'),propertyId:prop?prop.id:'',source:'map'});existing.add(sid);changed=true});
 s.properties.forEach(p=>{if(!p.id){p.id=id('property');changed=true}});s.stands.forEach(x=>{if(!x.id){x.id=id('stand');changed=true}if(!x.propertyId&&s.properties.length===1){x.propertyId=s.properties[0].id;changed=true}});
 const standByName=new Map(s.stands.map(x=>[String(x.name||'').trim().toLowerCase(),x]));
 s.hunts.forEach(h=>{if(!h.id){h.id=id('hunt');changed=true}if(!h.standId&&h.stand){const st=standByName.get(String(h.stand).trim().toLowerCase());if(st){h.standId=st.id;changed=true}}});
 s.sightings.forEach(x=>{if(!x.id){x.id=id('sighting');changed=true}if(!x.standId&&x.stand){const st=standByName.get(String(x.stand).trim().toLowerCase());if(st){x.standId=st.id;changed=true}}});
 s.cameras.forEach(c=>{if(!c.id){c.id=id('camera');changed=true}});s.deer.forEach(d=>{if(!d.id){d.id=id('deer');changed=true}});s._schemaVersion=2;if(changed)write(s);return s}
function refreshSelects(){const s=normalize();document.querySelectorAll('#bwSuite8 form').forEach(form=>{const stand=form.querySelector('select[name="stand"]');if(stand&&stand.options.length<=1&&s.stands.length){const current=stand.value;stand.innerHTML='<option value="">Select stand</option>'+s.stands.map(x=>'<option value="'+x.id+'">'+String(x.name||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))+'</option>').join('');if(current)stand.value=current}
 });}
function bindFieldLinking(){const root=document.getElementById('bwSuite8');if(!root||root.dataset.bwPhase1==='1')return;root.dataset.bwPhase1='1';root.addEventListener('submit',function(e){const form=e.target;if(!(form instanceof HTMLFormElement))return;const fd=new FormData(form);let s=normalize();const standField=form.querySelector('[name="stand"]');if(standField&&standField.value){const st=s.stands.find(x=>x.id===standField.value);if(st){const text=st.name;const hidden=form.querySelector('[name="standId"]');if(hidden)hidden.value=st.id;const old=standField.getAttribute('data-display-name');if(old===null)standField.dataset.displayName=text}}
 if(form.id==='bwHuntForm'||form.id==='bwSightingForm'){setTimeout(function(){syncMap();refreshSelects()},50)}},true)}
function observe(){syncMap();refreshSelects();bindFieldLinking()}
let n=0;const timer=setInterval(function(){observe();if(++n>120)clearInterval(timer)},500);observe();
})();