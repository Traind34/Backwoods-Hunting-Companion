(function(){
  'use strict';
  const KEY='backwoods-planner-map-v5';
  const TOPO_KEY='backwoods-topo-overlay-v57';
  const TILE=256;
  const N=z=>Math.pow(2,z);
  const X=(lon,z)=>(lon+180)/360*N(z);
  const Y=(lat,z)=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*N(z);

  function state(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}
  }
  function saveOverlay(v){localStorage.setItem(TOPO_KEY,v?'1':'0')}
  function overlayEnabled(){return localStorage.getItem(TOPO_KEY)==='1'}
  function tile(x,y,z){return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`}

  function ensurePanelControl(){
    const old=document.querySelector('#bwTopo');
    if(!old)return null;
    if(old.type==='checkbox')return old;
    const label=old.closest('label');
    if(!label)return null;
    const replacement=document.createElement('input');
    replacement.type='checkbox';
    replacement.id='bwTopo';
    replacement.checked=overlayEnabled();
    old.replaceWith(replacement);
    const text=label.childNodes[label.childNodes.length-1];
    if(text)text.textContent=' Topographic overlay';
    replacement.addEventListener('change',function(){
      saveOverlay(this.checked);
      render();
      const h=document.querySelector('#bwMapHint');
      if(h)h.textContent=this.checked?'Topographic overlay enabled':'Topographic overlay disabled';
    });
    return replacement;
  }

  function ensureHost(){
    const v=document.querySelector('#bwMapViewport');
    if(!v)return null;
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
    const s=state(),z=Number(s.zoom)||7,center=s.center||{lat:41.2033,lng:-77.1945};
    const r=v.getBoundingClientRect();
    const cx=X(center.lng,z),cy=Y(center.lat,z),n=N(z);
    for(let tx=Math.floor(cx-r.width/512)-1;tx<=Math.ceil(cx+r.width/512)+1;tx++){
      for(let ty=Math.floor(cy-r.height/512)-1;ty<=Math.ceil(cy+r.height/512)+1;ty++){
        if(ty<0||ty>=n)continue;
        const x=((tx%n)+n)%n;
        const im=document.createElement('img');
        im.className='bwMapTopoTile';
        im.alt='';
        im.draggable=false;
        im.style.cssText=`position:absolute;width:${TILE}px;height:${TILE}px;left:${(tx-cx)*TILE+r.width/2}px;top:${(ty-cy)*TILE+r.height/2}px;opacity:.52;pointer-events:none;user-select:none;`;
        im.src=tile(x,ty,z);
        im.onerror=function(){
          if(!this.dataset.fallback){
            this.dataset.fallback='1';
            this.src=`https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/${z}/${ty}/${x}`;
          }else this.remove();
        };
        host.appendChild(im);
      }
    }
  }

  function normalizeBase(){
    const s=state();
    const topo=document.querySelector('#bwTopo');
    if(!topo)return;
    if(s.base==='topo'){
      saveOverlay(true);
      const sat=document.querySelector('#bwSatellite');
      if(sat){sat.checked=true;sat.dispatchEvent(new Event('change',{bubbles:true}))}
      topo.checked=true;
    }else{
      topo.checked=overlayEnabled();
    }
  }

  let last='';
  function tick(){
    ensurePanelControl();
    normalizeBase();
    const s=state();
    const sig=JSON.stringify([s.center?.lat,s.center?.lng,s.zoom,overlayEnabled()]);
    if(sig!==last){last=sig;render()}
  }

  function boot(){
    ensurePanelControl();
    normalizeBase();
    render();
    setInterval(tick,350);
    window.addEventListener('resize',render);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
