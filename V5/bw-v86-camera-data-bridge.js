(function(){
  'use strict';
  if(window.__bwV86CameraBridge)return;
  window.__bwV86CameraBridge=true;

  const SLOT_KEY='bwCameraSlotsV57';
  const DATA_EVENT='backwoods:data-changed';

  function readSlots(){
    try{
      const v=JSON.parse(localStorage.getItem(SLOT_KEY)||'[]');
      return Array.isArray(v)?v:[];
    }catch(e){return[]}
  }
  function writeSlots(v){
    try{localStorage.setItem(SLOT_KEY,JSON.stringify(v))}catch(e){}
  }
  function validId(v){return v!=null && String(v).trim()}
  function cameraKey(x){
    return String(x?.cameraId||x?.id||x?.name||'').trim().toLowerCase();
  }

  function normalizeFromSlot(x){
    const key=cameraKey(x);
    return {
      id:String(x?.id||('cam_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7))),
      name:String(x?.name||x?.cameraId||'Camera'),
      cameraId:String(x?.cameraId||x?.id||''),
      location:String(x?.location||''),
      type:String(x?.type||'standard'),
      provider:String(x?.provider||''),
      notes:String(x?.notes||''),
      ingestId:String(x?.ingestId||''),
      legacyKey:key,
      source:'camera-slot-v57',
      createdAt:x?.createdAt||new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
  }

  function normalizeToSlot(x){
    return {
      id:String(x?.legacySlotId||x?.id||('cam_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7))),
      ingestId:String(x?.ingestId||''),
      created:String(x?.createdAt||new Date().toISOString()),
      name:String(x?.name||x?.cameraId||'Camera'),
      cameraId:String(x?.cameraId||x?.id||''),
      location:String(x?.location||''),
      type:String(x?.type||'standard'),
      provider:String(x?.provider||''),
      notes:String(x?.notes||'')
    };
  }

  function notify(){
    try{window.dispatchEvent(new Event(DATA_EVENT))}catch(e){}
    try{window.dispatchEvent(new CustomEvent('backwoods:data-change',{detail:{type:'camera-bridge'}}))}catch(e){}
  }

  let changed=false;
  let pushQueued=false;
  function queueCloudPush(){
    if(pushQueued)return;
    pushQueued=true;
    const run=()=>{
      pushQueued=false;
      try{
        if(window.BackwoodsCloudSync?.push){
          window.BackwoodsCloudSync.push().catch(()=>{});
          return true;
        }
      }catch(e){}
      return false;
    };
    if(!run())setTimeout(()=>{if(!run())setTimeout(run,3000)},1200);
  }

  function sync(){
    const BD=window.BackwoodsData;
    if(!BD?.get)return;
    let data;
    try{data=BD.get()}catch(e){return}
    if(!data || !Array.isArray(data.cameras))return;

    const slots=readSlots();
    const byKey=new Map();
    data.cameras.forEach(c=>{const k=cameraKey(c);if(k)byKey.set(k,c)});

    // iPhone/legacy Camera Center -> canonical V6 data.
    for(const slot of slots){
      const k=cameraKey(slot);
      if(!k)continue;
      const existing=byKey.get(k);
      if(!existing){
        const c=normalizeFromSlot(slot);
        data.cameras.push(c);
        byKey.set(k,c);
        changed=true;
      }else{
        const patch={
          name:existing.name||slot.name,
          cameraId:existing.cameraId||slot.cameraId,
          location:existing.location||slot.location,
          type:existing.type||slot.type,
          provider:existing.provider||slot.provider,
          notes:existing.notes||slot.notes,
          ingestId:existing.ingestId||slot.ingestId,
          legacySlotId:existing.legacySlotId||slot.id,
          updatedAt:new Date().toISOString()
        };
        Object.assign(existing,patch);
      }
    }

    // Canonical V6 data -> Camera Center slots, so another device can render the same cameras.
    const existingSlotKeys=new Set(slots.map(cameraKey).filter(Boolean));
    for(const c of data.cameras){
      const k=cameraKey(c);
      if(!k || existingSlotKeys.has(k))continue;
      const slot=normalizeToSlot(c);
      const targetKey=cameraKey(slot);
      if(targetKey && !existingSlotKeys.has(targetKey)){
        slots.push(slot);
        existingSlotKeys.add(targetKey);
        changed=true;
      }
    }

    if(changed){
      try{BD.set(data)}catch(e){return}
      writeSlots(slots);
      notify();
      queueCloudPush();
    }
  }

  function patchHome(){
    const home=document.getElementById('home');
    if(!home)return;
    const stat=[...home.querySelectorAll('.stat')].find(x=>/CAMERA/i.test(x.textContent||'')&&/CHECK/i.test(x.textContent||''));
    if(!stat)return;
    let count=0;
    try{count=Array.isArray(window.BackwoodsData?.get?.()?.cameras)?window.BackwoodsData.get().cameras.length:0}catch(e){}
    if(!count)count=readSlots().filter(x=>validId(x?.id||x?.cameraId||x?.name)).length;
    const b=stat.querySelector('b');
    if(b)b.textContent=String(count);
  }

  function init(){
    sync();
    patchHome();
    setTimeout(()=>{sync();patchHome()},1500);
    setTimeout(()=>{sync();patchHome()},5000);
    setInterval(()=>{sync();patchHome()},3000);
    window.addEventListener('storage',()=>{sync();patchHome()});
    window.addEventListener(DATA_EVENT,()=>{sync();patchHome()});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync();patchHome()}});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
