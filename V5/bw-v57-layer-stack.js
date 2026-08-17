(function(){
  'use strict';
  const KEY='backwoods-planner-map-v5';
  const TOPO_KEY='backwoods-topo-overlay-v57';
  const MERC=20037508.342789244;

  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function saveOverlay(v){localStorage.setItem(TOPO_KEY,v?'1':'0')}
  function overlayEnabled(){return localStorage.getItem(TOPO_KEY)==='1'}

  function lonToM(lon){return lon*MERC/180}
  function latToM(lat){
    const r=lat*Math.PI/180;
    return Math.log(Math.tan(Math.PI/4+r/2))*MERC/Math.PI;
  }
  function pxToLon(px,z){return px/(256*Math.pow(2,z))*360-180}
  function pxToLat(py,z){
    const n=Math.PI-2*Math.PI*py/(256*Math.pow(2,z));
    return 180/Math.PI*Math.atan(Math.sinh(n));
  }

  function ensurePanelControl(){
    const old=document.querySelector('#bwTopo'); if(!old)return null;
    if(old.type==='checkbox')return old;
    const label=old.closest('label'); if(!label)return null;
    const replacement=document.createElement('input');
    replacement.type='checkbox'; replacement.id='bwTopo'; replacement.checked=overlayEnabled();
    old.replaceWith(replacement);
    const text=label.childNodes[label.childNodes.length-1];
    if(text)text.textContent=' Backwoods Terrain';
    replacement.addEventListener('change',function(){
      saveOverlay(this.checked); render();
      const h=document.querySelector('#bwMapHint');
      if(h)h.textContent=this.checked?'Backwoods terrain enabled':'Backwoods terrain disabled';
    });
    return replacement;
  }

  function ensureHost(){
    const v=document.querySelector('#bwMapViewport'); if(!v)return null;
    let host=document.querySelector('#bwMapTopoOverlay');
    if(!host){
      host=document.createElement('div');
      host.id='bwMapTopoOverlay';
      host.setAttribute('aria-hidden','true');
      host.style.cssText='position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none;';
      v.insertBefore(host,document.querySelector('#bwMapOverlay')||null);
    }
    return host;
  }

  function render(){
    const v=document.querySelector('#bwMapViewport'),host=ensureHost();
    if(!v||!host)return;
    host.innerHTML='';
    if(!overlayEnabled())return;
    const s=state(),z=Math.max(5,Math.min(16,Number(s.zoom)||7));
    const center=s.center||{lat:41.2033,lng:-77.1945};
    const r=v.getBoundingClientRect();
    const w=Math.max(320,Math.min(2048,Math.round(r.width)));
    const h=Math.max(320,Math.min(2048,Math.round(r.height)));
    const world=256*Math.pow(2,z);
    const cx=(center.lng+180)/360*world;
    const sin=Math.sin(center.lat*Math.PI/180);
    const cy=(0.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*world;
    const leftPx=cx-w/2, rightPx=cx+w/2, topPx=cy-h/2, bottomPx=cy+h/2;
    const west=pxToLon(leftPx,z), east=pxToLon(rightPx,z);
    const north=pxToLat(topPx,z), south=pxToLat(bottomPx,z);
    const bbox=[lonToM(west),latToM(south),lonToM(east),latToM(north)].join(',');
    const url='https://cartowfs.nationalmap.gov/arcgis/rest/services/contours/MapServer/export'
      +'?bbox='+encodeURIComponent(bbox)
      +'&bboxSR=3857&imageSR=3857'
      +'&size='+w+','+h
      +'&format=png32&transparent=true'
      +'&layers=show:9,14,19&dpi=96&f=image';
    const im=document.createElement('img');
    im.className='bwMapTopoHybrid'; im.alt=''; im.draggable=false;
    im.style.cssText='position:absolute;inset:0;width:100%;height:100%;opacity:.82;mix-blend-mode:multiply;filter:saturate(.85) sepia(.18) hue-rotate(335deg) contrast(1.12);pointer-events:none;user-select:none;';
    im.onload=function(){
      host.innerHTML=''; host.appendChild(im);
    };
    im.onerror=function(){
      host.innerHTML='';
      const h=document.querySelector('#bwMapHint');
      if(h)h.textContent='Backwoods terrain could not be loaded';
    };
    im.src=url+'&_='+Date.now();
  }

  function normalizeBase(){
    const s=state(),topo=document.querySelector('#bwTopo'); if(!topo)return;
    if(s.base==='topo'){
      saveOverlay(true);
      const sat=document.querySelector('#bwSatellite');
      if(sat){sat.checked=true;sat.dispatchEvent(new Event('change',{bubbles:true}))}
      topo.checked=true;
    }else topo.checked=overlayEnabled();
  }

  let last='';
  function tick(){
    ensurePanelControl(); normalizeBase();
    const s=state();
    const sig=JSON.stringify([s.center?.lat,s.center?.lng,s.zoom,overlayEnabled()]);
    if(sig!==last){last=sig;render()}
  }
  function boot(){
    ensurePanelControl(); normalizeBase(); render();
    setInterval(tick,350); window.addEventListener('resize',render);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
