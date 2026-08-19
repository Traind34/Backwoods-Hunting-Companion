(function(){
'use strict';
if(window.BackwoodsPhase1Integration)return;
window.BackwoodsPhase1Integration={version:'10.1'};
const KEY='backwoods-suite-v8', LEGACY='backwoods-planner-map-v5';
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}}
function write(s){localStorage.setItem(KEY,JSON.stringify(s));window.dispatchEvent(new CustomEvent('backwoods:datachange',{detail:s}))}
function id(p){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function norm(){const s=read(KEY);['properties','stands','hunts','cameras','deer','sightings','conditions'].forEach(k=>{s[k]=Array.isArray(s[k])?s[k]:[]});return s}
function syncMap(){const s=norm(),legacy=read(LEGACY);let changed=false;const props=new Map(s.properties.map(p=>[String(p.name||'').trim().toLowerCase(),p]));
 (Array.isArray(legacy.myParcels)?legacy.myParcels:[]).forEach(p=>{const name=String(p.name||p.label||'My Property').trim(),key=name.toLowerCase();if(!props.has(key)){const x={id:String(p.id||id('property')),name,acres:p.acres||'',notes:'Imported from property map.',source:'map'};s.properties.push(x);props.set(key,x);changed=true}});
 const stands=new Set(s.stands.map(x=>String(x.id)));(Array.isArray(legacy.pins)?legacy.pins:[]).forEach((p,i)=>{const type=String(p.type||p.kind||p.category||'').toLowerCase();if(type&&!type.includes('stand'))return;const sid=String(p.id||'legacy-stand-'+i);if(stands.has(sid))return;const prop=s.properties.length===1?s.properties[0]:null;s.stands.push({id:sid,name:String(p.name||p.label||'Map Stand '+(i+1)),type:String(p.type||'Existing Map Stand'),wind:String(p.wind||''),notes:String(p.notes||'Imported from property map.'),propertyId:prop?prop.id:'',source:'map'});stands.add(sid);changed=true});
 s.properties.forEach(p=>{if(!p.id){p.id=id('property');changed=true}});s.stands.forEach(x=>{if(!x.id){x.id=id('stand');changed=true}if(!x.propertyId&&s.properties.length===1){x.propertyId=s.properties[0].id;changed=true}});
 const byStandId=new Map(s.stands.map(x=>[String(x.id),x])),byStandName=new Map(s.stands.map(x=>[String(x.name||'').trim().toLowerCase(),x]));
 function resolve(v){if(!v)return null;return byStandId.get(String(v))||byStandName.get(String(v).trim().toLowerCase())||null}
 s.hunts.forEach(h=>{if(!h.id){h.id=id('hunt');changed=true}const st=resolve(h.standId||h.stand);if(st){if(h.standId!==st.id){h.standId=st.id;changed=true}if(h.stand!==st.name){h.stand=st.name;changed=true}}});
 s.sightings.forEach(x=>{if(!x.id){x.id=id('sighting');changed=true}const st=resolve(x.standId||x.stand);if(st){if(x.standId!==st.id){x.standId=st.id;changed=true}if(x.stand!==st.name){x.stand=st.name;changed=true}}});
 s.cameras.forEach(c=>{if(!c.id){c.id=id('camera');changed=true}});s.deer.forEach(d=>{if(!d.id){d.id=id('deer');changed=true}});s._schemaVersion=3;if(changed)write(s);return s}
function refreshSelects(){const s=norm();document.querySelectorAll('#bwSuite8 select[name="stand"]').forEach(sel=>{const current=sel.value;sel.innerHTML='<option value="">Select stand</option>'+s.stands.map(x=>'<option value="'+String(x.id).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">'+String(x.name||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))+'</option>').join('');if(current&&Array.from(sel.options).some(o=>o.value===current))sel.value=current});}
function bind(){const root=document.getElementById('bwSuite8');if(!root||root.dataset.bwPhase1==='1')return;root.dataset.bwPhase1='1';root.addEventListener('submit',function(e){const form=e.target;if(!(form instanceof HTMLFormElement))return;const sel=form.querySelector('select[name="stand"]');if(sel&&sel.value){let s=norm(),st=s.stands.find(x=>String(x.id)===String(sel.value));if(st){let hidden=form.querySelector('[name="standId"]');if(!hidden){hidden=document.createElement('input');hidden.type='hidden';hidden.name='standId';form.appendChild(hidden)}hidden.value=st.id;let display=form.querySelector('[name="standName"]');if(display)display.value=st.name;}}setTimeout(function(){syncMap();refreshSelects()},100)},true)}
function observe(){syncMap();refreshSelects();bind()}
observe();let n=0;const timer=setInterval(function(){observe();if(++n>120)clearInterval(timer)},500);window.addEventListener('backwoods:datachange',function(){setTimeout(observe,0)});
})();