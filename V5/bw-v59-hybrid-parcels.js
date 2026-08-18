(function(){
  'use strict';
  const KEY='backwoods-planner-map-v5';
  const HYBRID_KEY='backwoods-hybrid-map-v59';

  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function setStateBase(base){const s=state();s.base=base;localStorage.setItem(KEY,JSON.stringify(s))}
  const N=z=>Math.pow(2,z);
  const X=(lon,z)=>(lon+180)/360*N(z);
  const Y=(lat,z)=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*N(z);

  function css(){
    if(document.getElementById('bwV514Style'))return;
    const s=document.createElement('style');s.id='bwV514Style';s.textContent=`
      #bwMapViewport .bwParcelPoly{stroke:#fff!important;stroke-width:2.5!important;paint-order:stroke fill;filter:drop-shadow(0 0 1px rgba(0,0,0,.8))}
      #bwMapViewport .bwSelectedParcel{fill:rgba(108,188,224,.28)!important;stroke:#5aa9d1!important;stroke-width:4!important;paint-order:stroke fill;filter:drop-shadow(0 0 1px rgba(0,0,0,.65))}
      #bwMapViewport .bwMyPropertyPath{fill:rgba(108,188,224,.38)!important;stroke:#4f9fc9!important;stroke-width:3.5!important;paint-order:stroke fill;vector-effect:non-scaling-stroke;pointer-events:none;filter:drop-shadow(0 0 1px rgba(0,0,0,.55))}
      #bwHybridControl{display:block!important;margin:0!important;font-weight:800}
      #bwHybridControl input{margin-right:6px}
    `;document.head.appendChild(s)
  }

  function removeBackwoodsTerrain(){
    document.querySelectorAll('#bwTerrain,#bwBackwoodsTerrain,[data-layer="terrain"],[data-map-type="terrain"]').forEach(el=>el.remove());
    document.querySelectorAll('#bwMapLayerPanel label,#bwMapLayerPanel button').forEach(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      if(text==='backwoods terrain'||text==='backwoods terrain map')el.remove();
    });
  }

  function hybridTile(x,y,z){
    const n=N(z);if(y<0||y>=n)return null;const xx=((x%n)+n)%n;
    return `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/${z}/${y}/${xx}`;
  }

  function renderHybridTiles(){
    if(localStorage.getItem(HYBRID_KEY)!=='1')return;
    const v=document.querySelector('#bwMapViewport'),t=document.querySelector('#bwMapTiles');if(!v||!t)return;
    const s=state(),z=Math.max(3,Math.min(16,Number(s.zoom)||7)),c=s.center||{lat:41.2033,lng:-77.1945};
    const r=v.getBoundingClientRect(),cx=X(c.lng,z),cy=Y(c.lat,z);t.innerHTML='';
    for(let tx=Math.floor(cx-r.width/512)-1;tx<=Math.ceil(cx+r.width/512)+1;tx++)for(let ty=Math.floor(cy-r.height/512)-1;ty<=Math.ceil(cy+r.height/512)+1;ty++){
      const url=hybridTile(tx,ty,z);if(!url)continue;
      const im=document.createElement('img');im.className='bwMapTile';im.alt='';im.style.left=((tx-cx)*256+r.width/2)+'px';im.style.top=((ty-cy)*256+r.height/2)+'px';im.src=url;im.onerror=()=>im.remove();t.appendChild(im);
    }
  }

  function project(lat,lng,s,r){
    const z=Math.max(3,Math.min(16,Number(s.zoom)||7));
    const cx=X(s.center?.lng??-77.1945,z)*256;
    const cy=Y(s.center?.lat??41.2033,z)*256;
    return {x:(X(lng,z)*256-cx)+r.width/2,y:(Y(lat,z)*256-cy)+r.height/2};
  }

  function renderMyProperty(){
    const v=document.querySelector('#bwMapViewport'),g=document.querySelector('#bwMapVector');
    if(!v||!g)return;
    let host=document.querySelector('#bwMyPropertyOverlay');
    if(!host){host=document.createElementNS('http://www.w3.org/2000/svg','g');host.id='bwMyPropertyOverlay';host.setAttribute('pointer-events','none');g.appendChild(host)}
    host.innerHTML='';
    const s=state(),properties=Array.isArray(s.myParcels)?s.myParcels:[];
    if(!properties.length)return;
    const r=v.getBoundingClientRect();
    properties.forEach(parcel=>{
      const geom=parcel?.geometry;if(!geom)return;
      const polygons=geom.type==='Polygon'?[geom.coordinates]:geom.type==='MultiPolygon'?(geom.coordinates||[]).map(p=>p):[];
      polygons.forEach(poly=>{
        (poly||[]).forEach(ring=>{
          if(!ring||ring.length<3)return;
          const d=ring.map((c,i)=>{const q=project(c[1],c[0],s,r);return(i?'L':'M')+' '+q.x+' '+q.y}).join(' ')+' Z';
          const p=document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d',d);p.setAttribute('class','bwMyPropertyPath');host.appendChild(p);
        });
      });
    });
  }

  function activateHybrid(){
    localStorage.setItem(HYBRID_KEY,'1');
    setStateBase('hybrid');
    const road=document.querySelector('#bwRoad'),sat=document.querySelector('#bwSatellite'),topo=document.querySelector('#bwTopo');
    if(road)road.checked=false;if(sat)sat.checked=false;if(topo)topo.checked=false;
    const v=document.querySelector('#bwMapViewport');if(v)v.classList.remove('bw-hybrid-active');
    renderHybridTiles();
  }

  function ensureHybridControl(){
    const sat=document.querySelector('#bwSatellite'),road=document.querySelector('#bwRoad');
    if(!sat)return;
    let host=document.querySelector('#bwHybridControl');
    if(!host){
      host=document.createElement('label');
      host.id='bwHybridControl';
      host.innerHTML='<input type="radio" name="bwBase" id="bwHybrid"> Backwoods Hybrid';
      const sl=sat.closest('label');
      if(sl&&sl.parentElement)sl.parentElement.insertBefore(host,sl.nextSibling);
      else if(road&&road.closest('label')?.parentElement)road.closest('label').parentElement.appendChild(host);
    }else{
      const sl=sat.closest('label');
      if(sl&&sl.parentElement&&host!==sl.nextSibling)sl.parentElement.insertBefore(host,sl.nextSibling);
    }
    const input=host.querySelector('#bwHybrid');
    if(input&&!input.dataset.v514Bound){
      input.dataset.v514Bound='1';
      input.addEventListener('change',()=>{if(input.checked)activateHybrid()});
    }
    return input;
  }

  function syncHybridControl(){
    removeBackwoodsTerrain();
    const h=ensureHybridControl();
    const mode=state().base;
    const hybridOn=localStorage.getItem(HYBRID_KEY)==='1'||mode==='hybrid';
    if(h)h.checked=hybridOn;
    if(hybridOn)renderHybridTiles();
  }

  function watchStandardBaseChanges(){
    ['bwRoad','bwSatellite','bwTopo'].forEach(id=>{
      const cb=document.querySelector('#'+id);if(!cb||cb.dataset.v514Watch)return;
      cb.dataset.v514Watch='1';
      cb.addEventListener('change',()=>{
        if(!cb.checked)return;
        localStorage.setItem(HYBRID_KEY,'0');
        setStateBase(id==='bwRoad'?'road':id==='bwSatellite'?'satellite':'topo');
        const h=document.querySelector('#bwHybrid');if(h)h.checked=false;
      },true);
    });
  }

  function tick(){
    syncHybridControl();
    watchStandardBaseChanges();
    renderMyProperty();
    if(localStorage.getItem(HYBRID_KEY)==='1'){
      const s=state(),sig=`${s.center?.lat}|${s.center?.lng}|${s.zoom}|${document.querySelector('#bwMapViewport')?.clientWidth}|${document.querySelector('#bwMapViewport')?.clientHeight}`;
      if(sig!==window.__bwHybridSig){window.__bwHybridSig=sig;renderHybridTiles()}
    }
  }

  function boot(){css();tick();window.addEventListener('resize',()=>{window.__bwHybridSig='';tick()});setInterval(tick,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* Backwoods stable Camera Center */
(function(){
  'use strict';
  const DB='backwoods-camera-center-v1';
  let db=null,currentCameraId=null;
  const $=id=>document.getElementById(id);
  function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains('cameras'))d.createObjectStore('cameras',{keyPath:'id'});if(!d.objectStoreNames.contains('photos')){const p=d.createObjectStore('photos',{keyPath:'id',autoIncrement:true});p.createIndex('cameraId','cameraId')}};req.onsuccess=()=>{db=req.result;resolve()};req.onerror=()=>reject(req.error)})}
  function getAll(store){return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  function put(store,value){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).put(value);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  function del(store,id){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
  function style(){if($('bwCameraStyle'))return;const s=document.createElement('style');s.id='bwCameraStyle';s.textContent=`#camera .bwCameraGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}#camera .bwCameraCard{background:#fff;border:1px solid #d7d0c1;border-radius:13px;padding:12px}#camera .bwCameraCard h3{margin:0 0 5px;font-family:Georgia,serif}#camera .bwCameraPhotos{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:10px}#camera .bwCameraPhotos img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px}#camera .bwCameraActions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}#camera .bwCameraActions button{padding:9px 10px;border-radius:9px;border:0;font-weight:800}#camera .bwCameraAdd{background:#2f3a2f;color:#fff}#camera .bwCameraUpload{background:#86754d;color:#fff}#camera .bwCameraDelete{background:#eeeae1;color:#8a3e2f}#bwCameraModal{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:none;padding:18px;overflow:auto}#bwCameraModal.open{display:block}#bwCameraModal .inner{max-width:700px;margin:40px auto;background:#fff;border-radius:16px;padding:16px}#bwCameraModal h2{margin-top:0}#bwCameraPhotoGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}#bwCameraPhotoGrid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px}`;document.head.appendChild(s)}
  function build(){const section=$('camera');if(!section||$('bwCameraCenter'))return;const old=section.querySelector('form[data-type="camera"]');if(old)old.style.display='none';const title=section.querySelector('.page');const wrap=document.createElement('div');wrap.id='bwCameraCenter';wrap.innerHTML=`<div class="card"><h2 style="margin-top:0">Camera Center</h2><p class="bwmuted">Create a camera slot, then upload photos specifically to that camera. Cellular-camera support is designed around the camera ID for future automatic ingestion.</p><form id="bwCameraForm" class="form"><label>Camera Name<input name="name" placeholder="North Ridge Camera" required></label><label>Camera ID<input name="id" placeholder="CAM-01" required></label><label>Location<input name="location" placeholder="North Ridge"></label><label>Camera Type<select name="type"><option>Standard / SD Card</option><option>Cellular</option></select></label><label>Brand / Provider<input name="provider" placeholder="Tactacam, Spartan, Moultrie, etc."></label><label class="wide">Notes<textarea name="notes"></textarea></label><button class="primary wide">Save Camera</button></form></div><div class="card"><h2 style="margin-top:0">Your Cameras</h2><div id="bwCameraList" class="bwCameraGrid"></div></div><div id="bwCameraModal"><div class="inner"><button type="button" id="bwCameraClose" style="float:right">Close</button><h2 id="bwCameraModalTitle">Camera Photos</h2><p class="bwmuted">Upload multiple photos. They stay associated with this specific camera.</p><input id="bwCameraInput" type="file" accept="image/*" multiple><div id="bwCameraPhotoGrid"></div></div></div>`;if(title)title.after(wrap);else section.prepend(wrap);$('bwCameraForm').addEventListener('submit',saveCamera);$('bwCameraClose').onclick=closeCamera;$('bwCameraInput').addEventListener('change',uploadPhotos)}
  async function saveCamera(e){e.preventDefault();const f=new FormData(e.target);const c={id:String(f.get('id')).trim(),name:String(f.get('name')).trim(),location:String(f.get('location')||''),type:String(f.get('type')||''),provider:String(f.get('provider')||''),notes:String(f.get('notes')||''),updatedAt:Date.now()};if(!c.id||!c.name)return;await put('cameras',c);e.target.reset();render()}
  async function render(){if(!db||!$('bwCameraList'))return;const cams=await getAll('cameras');const list=$('bwCameraList');list.innerHTML='';if(!cams.length){list.innerHTML='<p class="bwmuted">No cameras added yet.</p>';return}for(const c of cams){const card=document.createElement('div');card.className='bwCameraCard';card.innerHTML='<h3></h3><div class="bwmuted"></div><div class="bwCameraActions"><button class="bwCameraUpload">Open Photos</button><button class="bwCameraDelete">Delete</button></div><div class="bwCameraPhotos"></div>';card.querySelector('h3').textContent=c.name;card.querySelector('.bwmuted').textContent=(c.location||'No location')+' • '+c.type+(c.provider?' • '+c.provider:'');card.querySelector('.bwCameraUpload').onclick=()=>openCamera(c);card.querySelector('.bwCameraDelete').onclick=async()=>{if(confirm('Delete this camera and its photos?')){await del('cameras',c.id);const photos=(await getAll('photos')).filter(p=>p.cameraId===c.id);for(const p of photos)await del('photos',p.id);render()}};const photos=(await getAll('photos')).filter(p=>p.cameraId===c.id).slice(-6).reverse();const grid=card.querySelector('.bwCameraPhotos');photos.forEach(p=>{const img=document.createElement('img');img.src=URL.createObjectURL(p.blob);img.alt='Camera photo';grid.appendChild(img)});list.appendChild(card)}}
  async function openCamera(c){currentCameraId=c.id;$('bwCameraModalTitle').textContent=c.name+' — Photos';$('bwCameraModal').classList.add('open');await renderModalPhotos()}
  function closeCamera(){$('bwCameraModal').classList.remove('open');currentCameraId=null}
  async function renderModalPhotos(){const grid=$('bwCameraPhotoGrid');grid.innerHTML='';if(!currentCameraId)return;const photos=(await getAll('photos')).filter(p=>p.cameraId===currentCameraId);if(!photos.length){grid.innerHTML='<p class="bwmuted">No photos uploaded yet.</p>';return}photos.reverse().forEach(p=>{const img=document.createElement('img');img.src=URL.createObjectURL(p.blob);img.alt='Trail camera photo';grid.appendChild(img)})}
  async function uploadPhotos(e){if(!currentCameraId)return;for(const file of e.target.files)await put('photos',{cameraId:currentCameraId,name:file.name,blob:file,createdAt:Date.now()});e.target.value='';await renderModalPhotos();await render()}
  function init(){style();build();openDB().then(render).catch(()=>{})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
