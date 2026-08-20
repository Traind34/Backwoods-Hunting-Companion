(function(){
  'use strict';
  const KEY='backwoods-cloud-sync-v2';
  const DATA_API='https://ep-muddy-block-axi4payo.apirest.c-4.us-east-2.aws.neon.tech/neondb/rest/v1';
  const makeKey=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';const bytes=new Uint8Array(12);crypto.getRandomValues(bytes);for(const b of bytes)s+=a[b%a.length];return s.slice(0,6)+'-'+s.slice(6)};
  const state=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const saveState=s=>localStorage.setItem(KEY,JSON.stringify(s));
  const data=()=>window.BackwoodsData?.get?.()||null;
  const setData=d=>window.BackwoodsData?.set?.(d);
  let client=null;
  async function neon(){
    if(client)return client;
    const mod=await import('https://esm.sh/@neondatabase/neon-js@latest');
    client=mod.createClient({auth:{url:'https://ep-muddy-block-axi4payo.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth',allowAnonymous:true},dataApi:{url:DATA_API}});
    return client;
  }
  function toast(msg){if(window.BackwoodsAppCore?.toast)return window.BackwoodsAppCore.toast(msg);const t=document.getElementById('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}}
  async function request(fn,args){const c=await neon();const r=await c.rpc(fn,args);if(r.error)throw r.error;return r.data||{};}
  function panel(){let p=document.getElementById('bwCloudSyncPanel');if(p)return p;p=document.createElement('section');p.id='bwCloudSyncPanel';p.className='card';p.innerHTML='<h2 style="margin-top:0">Cloud Sync</h2><p id="bwSyncStatus" class="bwmuted">Not connected</p><div id="bwSyncKeyRow" style="display:none;margin:10px 0"><label style="font-weight:800;font-size:12px">Sync code</label><input id="bwSyncKey" autocomplete="off" autocapitalize="characters" inputmode="text" style="width:100%;padding:12px;margin-top:5px;border:1px solid #d7d0c1;border-radius:10px;font:inherit;letter-spacing:.12em"></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="bwCreateSync" class="primary">Create Sync Code</button><button id="bwConnectSync">Connect Existing Code</button><button id="bwSyncNow" style="display:none">Sync Now</button></div><p id="bwSyncHelp" class="bwmuted" style="margin-bottom:0">Use the same sync code on Safari and the Home Screen app. Your Backwoods data will be stored in the cloud and kept in sync.</p>';const host=document.querySelector('#more')||document.querySelector('.screen:last-of-type')||document.body;host.appendChild(p);bind(p);return p}
  function render(){const p=panel(),s=state(),status=p.querySelector('#bwSyncStatus'),input=p.querySelector('#bwSyncKey'),row=p.querySelector('#bwSyncKeyRow'),sync=p.querySelector('#bwSyncNow');if(s.syncKey){status.textContent='Connected • '+s.syncKey;row.style.display='none';sync.style.display='inline-block'}else{status.textContent='Not connected';row.style.display='block';sync.style.display='none'}if(input&&s.syncKey)input.value=s.syncKey}
  async function push(){const s=state();if(!s.syncKey)throw Error('NO_SYNC');const d=data();if(!d)throw Error('NO_DATA');const updatedAt=Date.now();const r=await request('backwoods_sync_put',{p_sync_key:s.syncKey,p_data:d,p_updated_at:updatedAt});saveState({...s,lastSyncAt:Number(r.updatedAt||updatedAt)});window.dispatchEvent(new CustomEvent('backwoods:cloud-saved'));return r}
  async function pull(){const s=state();if(!s.syncKey)throw Error('NO_SYNC');const r=await request('backwoods_sync_get',{p_sync_key:s.syncKey});if(r.data){const cloudAt=Number(r.updatedAt||0),localAt=Number(data()?.updatedAt||0),last=Number(s.lastSyncAt||0);if(cloudAt>Math.max(localAt,last)){setData(r.data);saveState({...s,lastSyncAt:cloudAt});window.dispatchEvent(new CustomEvent('backwoods:cloud-pulled'));toast('Cloud data loaded')}}else if(data()){await push()}render()}
  async function connect(key){key=String(key||'').trim().toUpperCase();if(key.length<8)throw Error('INVALID_SYNC_KEY');const r=await request('backwoods_sync_get',{p_sync_key:key});if(!r.data)throw Error('SYNC_NOT_FOUND');setData(r.data);saveState({syncKey:key,lastSyncAt:Number(r.updatedAt||Date.now())});render();window.dispatchEvent(new CustomEvent('backwoods:cloud-pulled'));toast('Device connected to Backwoods cloud')}
  function bind(p){p.querySelector('#bwCreateSync').onclick=async()=>{try{const key=makeKey();saveState({syncKey:key});await push();p.querySelector('#bwSyncKey').value=key;render();toast('Sync code created');}catch(e){saveState({});render();toast('Could not create cloud sync')}};p.querySelector('#bwConnectSync').onclick=async()=>{const input=p.querySelector('#bwSyncKey');const key=prompt('Enter your Backwoods sync code',input.value||'');if(!key)return;try{await connect(key)}catch(e){toast(e.message==='SYNC_NOT_FOUND'?'Sync code not found':'Could not connect device')}};p.querySelector('#bwSyncNow').onclick=async()=>{try{await pull()}catch(e){toast('Cloud sync failed')}}}
  function init(){render();const s=state();if(s.syncKey)setTimeout(()=>pull().catch(()=>{}),900);window.addEventListener('backwoods:data-changed',()=>{if(state().syncKey){clearTimeout(window.__bwSyncTimer);window.__bwSyncTimer=setTimeout(()=>push().catch(()=>{}),800)}});window.addEventListener('backwoods:cloud-pulled',()=>setTimeout(()=>location.reload(),250));}
  window.BackwoodsCloudSync={version:2,init,push,pull,connect,state};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
