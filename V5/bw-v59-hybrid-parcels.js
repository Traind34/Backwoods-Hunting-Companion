(function(){
  'use strict';
  const KEY='backwoods-planner-map-v5';
  const HYBRID_KEY='backwoods-hybrid-map-v59';
  const TOPO_KEY='backwoods-topo-overlay-v57';
  const MERC=20037508.342789244;
  const cache=new Map();
  let canvas=null,ctx=null,lastSig='';

  function readState(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function isHybrid(){return localStorage.getItem(HYBRID_KEY)==='1'}
  function setHybrid(v){localStorage.setItem(HYBRID_KEY,v?'1':'0')}
  function setStateBase(base){const s=readState();s.base=base;localStorage.setItem(KEY,JSON.stringify(s))}
  function css(){
    if(document.getElementById('bwV59Style'))return;
    const s=document.createElement('style');s.id='bwV59Style';s.textContent=`
      #bwMapViewport.bw-hybrid-active #bwMapTiles{display:none!important}
      #bwMapViewport.bw-hybrid-active #bwHybridCanvas{display:block!important}
      #bwHybridCanvas{position:absolute;inset:0;width:100%;height:100%;display:none;pointer-events:none;z-index:0}
      #bwMapVector{z-index:3!important}
      #bwMapOverlay{z-index:4!important}
      #bwMapViewport .bwParcelPoly{stroke:#fff!important;stroke-width:2.5!important;paint-order:stroke fill;filter:drop-shadow(0 0 1px rgba(0,0,0,.8))}
      #bwMapViewport .bwSelectedParcel{stroke:#f28c28!important;stroke-width:4!important}
      #bwHybridControl{display:flex;align-items:center;gap:8px;margin-top:7px;font-weight:800}
    `;document.head.appendChild(s)
  }
  function mercX(lng){return lng*MERC/180}
  function mercY(lat){const r=lat*Math.PI/180;return Math.log(Math.tan(Math.PI/4+r/2))*MERC/Math.PI}
  function lonFromPx(px,z){return px/(256*Math.pow(2,z))*360-180}
  function latFromPx(py,z){const n=Math.PI-2*Math.PI*py/(256*Math.pow(2,z));return 180/Math.PI*Math.atan(Math.sinh(n))}
  function ensureCanvas(){
    const v=document.querySelector('#bwMapViewport');if(!v)return null;
    if(!canvas){canvas=document.createElement('canvas');canvas.id='bwHybridCanvas';canvas.setAttribute('aria-hidden','true');v.insertBefore(canvas,document.querySelector('#bwMapTiles'))}
    const r=v.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
    ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h}
  }
  function tileUrl(x,y,z){const n=Math.pow(2,z);if(y<0||y>=n)return null;const xx=((x%n)+n)%n;return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${xx}`}
  function image(url){if(cache.has(url))return cache.get(url);const im=new Image();im.crossOrigin='anonymous';im.src=url;const p=new Promise(resolve=>{im.onload=()=>resolve(im);im.onerror=()=>resolve(null)});cache.set(url,p);return p}
  function contourLayers(z){if(z<=8)return'show:0';if(z<=11)return'show:9';if(z===12)return'show:14';return'show:19'}
  function contourUrl(center,z,w,h){
    const world=256*Math.pow(2,z),cx=(center.lng+180)/360*world,sin=Math.sin(center.lat*Math.PI/180),cy=(0.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*world;
    const west=lonFromPx(cx-w/2,z),east=lonFromPx(cx+w/2,z),north=latFromPx(cy-h/2,z),south=latFromPx(cy+h/2,z),bbox=[mercX(west),mercY(south),mercX(east),mercY(north)].join(',');
    return 'https://cartowfs.nationalmap.gov/arcgis/rest/services/contours/MapServer/export?bbox='+encodeURIComponent(bbox)+'&bboxSR=3857&imageSR=3857&size='+Math.min(2048,w)+','+Math.min(2048,h)+'&format=png32&transparent=true&layers='+encodeURIComponent(contourLayers(z))+'&dpi=96&f=image'
  }
  async function renderHybrid(){
    if(!isHybrid())return;
    const v=document.querySelector('#bwMapViewport'),box=ensureCanvas();if(!v||!box||!ctx)return;
    const s=readState(),z=Math.max(3,Math.min(19,Number(s.zoom)||7)),center=s.center||{lat:41.2033,lng:-77.1945},w=box.w,h=box.h;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#53604f';ctx.fillRect(0,0,w,h);
    const world=256*Math.pow(2,z),cx=(center.lng+180)/360*world,sin=Math.sin(center.lat*Math.PI/180),cy=(0.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*world,urls=[];
    for(let tx=Math.floor(cx-w/512)-1;tx<=Math.ceil(cx+w/512)+1;tx++)for(let ty=Math.floor(cy-h/512)-1;ty<=Math.ceil(cy+h/512)+1;ty++){const url=tileUrl(tx,ty,z);if(url)urls.push({url,x:(tx-cx)*256+w/2,y:(ty-cy)*256+h/2})}
    const imgs=await Promise.all(urls.map(t=>image(t.url).then(im=>({t,im}))));if(!isHybrid())return;
    imgs.forEach(({t,im})=>{if(im)ctx.drawImage(im,t.x,t.y,256,256)});
    const c=await image(contourUrl(center,z,w,h));if(c){ctx.save();ctx.globalAlpha=.78;ctx.drawImage(c,0,0,w,h);ctx.restore()}
  }
  function disableLegacyTopo(){
    localStorage.setItem(TOPO_KEY,'0');
    const topo=document.querySelector('#bwTopo');if(topo)topo.checked=false;
    const legacy=document.querySelector('#bwMapTopoOverlay');if(legacy)legacy.remove();
  }
  function updateControls(){
    const sat=document.querySelector('#bwSatellite'),topo=document.querySelector('#bwTopo'),road=document.querySelector('#bwRoad');if(!sat||!topo||!road)return;
    [sat,topo].forEach(cb=>{const l=cb.closest('label');if(l)l.style.display='none'});
    let host=document.querySelector('#bwHybridControl');
    if(!host){
      host=document.createElement('label');host.id='bwHybridControl';host.innerHTML='<input type="radio" name="bwBase" id="bwHybrid"> Backwoods Hybrid';
      const roadLabel=road.closest('label');if(roadLabel&&roadLabel.parentElement)roadLabel.parentElement.insertBefore(host,roadLabel.nextSibling);else if(road.parentElement)road.parentElement.appendChild(host);
      host.querySelector('input').addEventListener('change',()=>{
        if(!host.querySelector('input').checked)return;
        setHybrid(true);disableLegacyTopo();setStateBase('satellite');
        if(sat&&!sat.checked){sat.checked=true;sat.dispatchEvent(new Event('change',{bubbles:true}))}
        const v=document.querySelector('#bwMapViewport');if(v)v.classList.add('bw-hybrid-active');
        renderHybrid();
      })
    }
    const cb=document.querySelector('#bwHybrid');if(cb)cb.checked=isHybrid();
    if(isHybrid()){disableLegacyTopo();const v=document.querySelector('#bwMapViewport');if(v)v.classList.add('bw-hybrid-active')}
    if(road.checked&&!isHybrid()){const v=document.querySelector('#bwMapViewport');if(v)v.classList.remove('bw-hybrid-active')}
  }
  function bindRoad(){const road=document.querySelector('#bwRoad');if(!road||road.dataset.v59)return;road.dataset.v59='1';road.addEventListener('change',()=>{setHybrid(false);disableLegacyTopo();const v=document.querySelector('#bwMapViewport');if(v)v.classList.remove('bw-hybrid-active');const cb=document.querySelector('#bwHybrid');if(cb)cb.checked=false})}
  function tick(){
    updateControls();bindRoad();
    const v=document.querySelector('#bwMapViewport');if(!v)return;
    const s=readState(),sig=JSON.stringify([s.center?.lat,s.center?.lng,s.zoom,isHybrid(),v.clientWidth,v.clientHeight]);
    if(sig!==lastSig){lastSig=sig;if(isHybrid())renderHybrid()}
  }
  function boot(){css();updateControls();bindRoad();tick();window.addEventListener('resize',()=>{lastSig='';tick()});setInterval(tick,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
