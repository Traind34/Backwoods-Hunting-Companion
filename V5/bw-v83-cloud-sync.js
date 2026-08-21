(function(){
  'use strict';
  const KEY='backwoods-cloud-sync-v3';
  const OLD='backwoods-cloud-sync-v2';
  const AUTO_SYNC_KEY='BACKWOODS-AUTO-2026';
  const DATA_API='https://ep-rapid-leaf-af8dfmo0.apirest.c-2.us-west-2.aws.neon.tech/neondb/rest/v1';
  const AUTH_URL='https://ep-rapid-leaf-af8dfmo0.neonauth.c-2.us-west-2.aws.neon.tech/neondb/auth';
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(OLD)||'{}')}catch(e){return{}}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
  function local(){return window.BackwoodsData?.get?.()||null}
  function meaningful(d){return !!d&&(!!d.property?.name||!!d.boundary||(d.hunts||[]).length||(d.stands||[]).length||(d.cameras||[]).length||(d.deerSightings||[]).length||(d.observations||[]).length||(d.sightings||[]).length)}
  function toast(m){if(window.BackwoodsAppCore?.toast)return window.BackwoodsAppCore.toast(m);const t=document.getElementById('toast');if(t){t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}}
  function setData(d){window.BackwoodsData?.set?.(d)}
  let client=null;
  async function neon(){if(client)return client;const m=await import('https://esm.sh/@neondatabase/neon-js@latest');client=m.createClient({auth:{url:AUTH_URL,allowAnonymous:true},dataApi:{url:DATA_API}});return client}
  async function request(fn,args){const r=await (await neon()).rpc(fn,args);if(r.error)throw r.error;return r.data||{}}
  function ensureAutoKey(){const s=state();if(s.syncKey!==AUTO_SYNC_KEY){save({...s,syncKey:AUTO_SYNC_KEY,lastSyncAt:Number(s.lastSyncAt||0)})}return AUTO_SYNC_KEY}
  function panel(){let p=document.getElementById('bwCloudSyncPanel');if(p)return p;p=document.createElement('section');p.id='bwCloudSyncPanel';p.className='card';p.style.display='none';p.innerHTML='<h2>Cloud Sync</h2>';const host=document.querySelector('#more')||document.querySelector('.screen:last-of-type')||document.body;host.appendChild(p);return p}
  function render(){const p=panel(),s=state();if(p){p.dataset.sync='automatic';p.setAttribute('aria-hidden','true')}return s}
  async function push(){const key=ensureAutoKey(),d=local();if(!d)throw Error('NO_LOCAL_DATA');const at=Date.now();const r=await request('backwoods_sync_put',{p_sync_key:key,p_data:d,p_updated_at:at});save({...state(),syncKey:key,lastSyncAt:Number(r.updatedAt||at)});return r}
  async function pull(){const key=ensureAutoKey(),r=await request('backwoods_sync_get',{p_sync_key:key}),cloud=r.data||null,at=Number(r.updatedAt||0),last=Number(state().lastSyncAt||0),d=local();
    if(cloud&&meaningful(cloud)){
      if(!meaningful(d)){setData(cloud);save({...state(),syncKey:key,lastSyncAt:at});setTimeout(()=>location.reload(),150);return}
      if(!last||at>last){setData(cloud);save({...state(),syncKey:key,lastSyncAt:at});setTimeout(()=>location.reload(),150);return}
      if(last>at&&meaningful(d)){await push();return}
    }else if(meaningful(d)){await push();return}
    render()
  }
  async function sync(){try{await pull()}catch(e){console.warn('Backwoods automatic cloud sync unavailable',e)}}
  function init(){ensureAutoKey();render();setTimeout(sync,500);setInterval(sync,15000);window.addEventListener('online',sync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});window.addEventListener('backwoods:data-changed',()=>{clearTimeout(window.__bwAutoSyncTimer);window.__bwAutoSyncTimer=setTimeout(()=>push().catch(e=>console.warn('Backwoods auto push unavailable',e)),600)})}
  window.BackwoodsCloudSync={version:5,init,push,pull,sync,state,auto:true};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
