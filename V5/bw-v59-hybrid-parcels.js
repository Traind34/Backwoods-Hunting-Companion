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
    if(document.getElementById('bwV59Style'))return;
    const s=document.createElement('style');s.id='bwV59Style';s.textContent=`
      #bwMapViewport .bwParcelPoly{stroke:#fff!important;stroke-width:2.5!important;paint-order:stroke fill;filter:drop-shadow(0 0 1px rgba(0,0,0,.8))}
      #bwMapViewport .bwSelectedParcel{stroke:#f28c28!important;stroke-width:4!important}
      #bwHybridControl{display:flex;align-items:center;gap:8px;margin-top:7px;font-weight:800}
    `;document.head.appendChild(s)
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

  function setMode(mode){
    localStorage.setItem(HYBRID_KEY,mode==='hybrid'?'1':'0');
    setStateBase(mode);
    const v=document.querySelector('#bwMapViewport');if(v)v.classList.remove('bw-hybrid-active');
    const h=document.querySelector('#bwHybrid');if(h)h.checked=mode==='hybrid';
    if(mode==='hybrid'){
      const road=document.querySelector('#bwRoad'),sat=document.querySelector('#bwSatellite'),topo=document.querySelector('#bwTopo');
      if(road)road.checked=false;if(sat)sat.checked=false;if(topo)topo.checked=false;
      renderHybridTiles();
    }
  }

  function bindStandardMode(cb,mode){
    if(!cb||cb.dataset.v59Bound)return;
    cb.dataset.v59Bound='1';
    cb.addEventListener('change',()=>{
      if(!cb.checked)return;
      localStorage.setItem(HYBRID_KEY,'0');
      const h=document.querySelector('#bwHybrid');if(h)h.checked=false;
      setStateBase(mode);
      const t=document.querySelector('#bwMapTiles');if(t)t.style.display='';
    });
  }

  function updateControls(){
    const sat=document.querySelector('#bwSatellite'),topo=document.querySelector('#bwTopo'),road=document.querySelector('#bwRoad');if(!sat||!topo||!road)return;
    // V5.9 originally hid Satellite/Topo to force Hybrid. Restore all three standard modes.
    [sat,topo,road].forEach(cb=>{const l=cb.closest('label');if(l)l.style.display='flex'});
    bindStandardMode(road,'road');
    bindStandardMode(sat,'satellite');
    bindStandardMode(topo,'topo');

    let host=document.querySelector('#bwHybridControl');
    if(!host){
      host=document.createElement('label');host.id='bwHybridControl';
      host.innerHTML='<input type="radio" name="bwBase" id="bwHybrid"> Backwoods Hybrid';
      const rl=road.closest('label');if(rl&&rl.parentElement)rl.parentElement.appendChild(host);
      host.querySelector('input').addEventListener('change',e=>{if(e.target.checked)setMode('hybrid')});
    }

    const mode=state().base;
    const hybridOn=localStorage.getItem(HYBRID_KEY)==='1'||mode==='hybrid';
    const h=document.querySelector('#bwHybrid');if(h)h.checked=hybridOn;

    if(hybridOn){
      localStorage.setItem(HYBRID_KEY,'1');
      if(road)road.checked=false;if(sat)sat.checked=false;if(topo)topo.checked=false;
      renderHybridTiles();
    }else{
      localStorage.setItem(HYBRID_KEY,'0');
      if(mode==='satellite')sat.checked=true;
      else if(mode==='topo')topo.checked=true;
      else road.checked=true;
    }
  }

  function tick(){
    updateControls();
    if(localStorage.getItem(HYBRID_KEY)==='1'){
      const s=state(),sig=`${s.center?.lat}|${s.center?.lng}|${s.zoom}|${document.querySelector('#bwMapViewport')?.clientWidth}|${document.querySelector('#bwMapViewport')?.clientHeight}`;
      if(sig!==window.__bwHybridSig){window.__bwHybridSig=sig;renderHybridTiles()}
    }
  }

  function boot(){css();tick();window.addEventListener('resize',()=>{window.__bwHybridSig='';tick()});setInterval(tick,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();