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
      #bwMapViewport .bwSelectedParcel{stroke:#f28c28!important;stroke-width:4!important}
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
    if(localStorage.getItem(HYBRID_KEY)==='1'){
      const s=state(),sig=`${s.center?.lat}|${s.center?.lng}|${s.zoom}|${document.querySelector('#bwMapViewport')?.clientWidth}|${document.querySelector('#bwMapViewport')?.clientHeight}`;
      if(sig!==window.__bwHybridSig){window.__bwHybridSig=sig;renderHybridTiles()}
    }
  }

  function boot(){css();tick();window.addEventListener('resize',()=>{window.__bwHybridSig='';tick()});setInterval(tick,700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();