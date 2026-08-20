(function(){
'use strict';
if(window.__bwV80RecentActivityStandNames)return;
const OLD='backwoods-v1', NEW='backwoods-planner-v6-data';
function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
function allData(){return [read(OLD),read(NEW)].filter(Boolean)}
function hunts(){
  const out=[];
  allData().forEach(d=>{
    if(Array.isArray(d.hunt))out.push(...d.hunt);
    if(Array.isArray(d.hunts))out.push(...d.hunts);
  });
  return out;
}
function pins(){
  const out=[];
  allData().forEach(d=>{
    if(Array.isArray(d.pins))out.push(...d.pins);
    if(Array.isArray(d.locations))out.push(...d.locations);
    if(Array.isArray(d.stands))out.push(...d.stands);
  });
  return out;
}
function norm(v){return String(v??'').trim().toLowerCase()}
function findHunt(id){
  const k=norm(id);
  return hunts().find(h=>norm(h.id)===k)||null;
}
function standName(h){
  if(!h)return '';
  const direct=h.standName||h.locationName||((typeof h.stand==='string'&&isNaN(Number(h.stand)))?h.stand:'')||((typeof h.location==='string'&&isNaN(Number(h.location)))?h.location:'');
  if(direct)return String(direct);
  const ref=h.standId??h.stand??h.locationId??h.location;
  if(ref===undefined||ref===null||ref==='')return '';
  const k=norm(ref);
  const p=pins().find(x=>norm(x.id)===k||norm(x.pinId)===k||norm(x.locationId)===k||norm(x.standId)===k||norm(x.name)===k);
  return p?.name||p?.standName||p?.label||'';
}
function fmtDate(v){
  if(!v)return '';
  try{return new Date(String(v).includes('T')?v:v+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}catch(e){return String(v)}
}
function patch(){
  const rows=document.querySelectorAll('.row');
  rows.forEach(row=>{
    const b=row.querySelector('b'), small=row.querySelector('small');
    if(!b||norm(b.textContent)!=='hunt')return;
    const id=(small?.textContent||'').trim();
    const h=findHunt(id);
    const name=standName(h);
    if(!name)return;
    b.textContent=name;
    b.dataset.bw80StandName='1';
    if(small){
      const date=h?.date||h?.huntDate||h?.createdAt||h?.created;
      const dateText=fmtDate(date);
      if(dateText)small.textContent=dateText;
    }
  });
}
function boot(){patch();new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});window.addEventListener('storage',patch);setTimeout(patch,250);setTimeout(patch,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

/* V8.2: Home Season Snapshot camera count must include every camera source. */
(function(){
  const SLOT_KEY='bwCameraSlotsV57';
  const APP_KEY='backwoods-v1';
  const MAP_KEY='backwoods-planner-map-v5';
  function arr(v){return Array.isArray(v)?v:[]}
  function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function cameraCount(){
    const ids=new Set();
    arr(readJSON(SLOT_KEY)).forEach(x=>{
      const id=x?.id||x?.cameraId||x?.name;
      if(id!=null&&String(id).trim())ids.add('slot:'+String(id));
    });
    const app=readJSON(APP_KEY);
    if(app&&typeof app==='object'){
      arr(app.cameraInventory).forEach(x=>{
        const id=x?.id||x?.cameraId||x?.name;
        if(id!=null&&String(id).trim())ids.add('inventory:'+String(id));
      });
      arr(app.cameras).forEach(x=>{
        const id=x?.id||x?.cameraId||x?.name;
        if(id!=null&&String(id).trim())ids.add('camera:'+String(id));
      });
      arr(app.camera).forEach(x=>{
        const id=x?.id||x?.cameraId||x?.name;
        if(id!=null&&String(id).trim())ids.add('check:'+String(id));
      });
    }
    const map=readJSON(MAP_KEY);
    arr(map?.pins).forEach(x=>{
      if(norm(x?.type)==='camera'){
        const id=x?.id||x?.name||(`${x?.lat},${x?.lng}`);
        if(id!=null&&String(id).trim())ids.add('map:'+String(id));
      }
    });
    return ids.size;
  }
  function patchCameraCount(){
    const home=document.getElementById('home');
    if(!home)return;
    const stat=[...home.querySelectorAll('.stat')].find(x=>/CAMERA/i.test(x.textContent||'')&&/CHECK/i.test(x.textContent||''));
    const value=stat?.querySelector('b');
    if(value)value.textContent=String(cameraCount());
  }
  function bootCamera(){
    patchCameraCount();
    setInterval(patchCameraCount,1000);
    window.addEventListener('storage',patchCameraCount);
    window.addEventListener('backwoods:data-changed',patchCameraCount);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)patchCameraCount()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootCamera);else bootCamera();
})();
})();