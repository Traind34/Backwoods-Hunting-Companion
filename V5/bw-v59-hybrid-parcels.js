(function(){
  'use strict';
  const HYBRID_KEY='backwoods-hybrid-map-v59';

  function css(){
    if(document.getElementById('bwV59Style')) return;
    const s=document.createElement('style');
    s.id='bwV59Style';
    s.textContent=`
      /* V5.9 Backwoods Hybrid: one map mode, satellite base + terrain reference */
      #bwSatelliteLabel,#bwTopoLabel,.bwSatelliteLabel,.bwTopoLabel{ }
      #bwMapViewport .parcel,.bwmap .parcel{border-color:#fff!important;box-shadow:0 0 0 1px rgba(47,58,47,.55),0 0 3px rgba(0,0,0,.65)!important;}
      #bwMapViewport .parcel.selected,#bwMapViewport .parcel.active,.bwmap .parcel.selected,.bwmap .parcel.active{border-color:#f28c28!important;}
    `;
    document.head.appendChild(s);
  }

  function setHybrid(on){
    localStorage.setItem(HYBRID_KEY,on?'1':'0');
    const sat=document.querySelector('#bwSatellite');
    const topo=document.querySelector('#bwTopo');
    if(on){
      if(sat && !sat.checked) sat.click();
      if(topo && !topo.checked) topo.click();
    }else{
      if(topo && topo.checked) topo.click();
    }
    updateLabel();
  }

  function updateLabel(){
    const sat=document.querySelector('#bwSatellite');
    const topo=document.querySelector('#bwTopo');
    const on=localStorage.getItem(HYBRID_KEY)==='1' || !!(sat&&sat.checked&&topo&&topo.checked);
    const labels=document.querySelectorAll('label');
    labels.forEach(l=>{
      const text=(l.textContent||'').trim();
      if(/satellite/i.test(text) || /backwoods terrain/i.test(text)){
        const cb=l.querySelector('input');
        if(cb===sat || cb===topo){
          l.style.display='none';
        }
      }
    });
    let host=document.querySelector('#bwHybridControl');
    const panel=(sat&&sat.closest('label'))?.parentElement || topo?.closest('label')?.parentElement;
    if(!host && panel){
      host=document.createElement('label');
      host.id='bwHybridControl';
      host.style.cssText='display:flex;align-items:center;gap:8px;margin-top:7px;font-weight:800;';
      host.innerHTML='<input type="checkbox" id="bwHybridToggle"> Backwoods Hybrid';
      panel.appendChild(host);
      host.querySelector('input').addEventListener('change',e=>setHybrid(e.target.checked));
    }
    const cb=document.querySelector('#bwHybridToggle');
    if(cb) cb.checked=on;
  }

  function boot(){
    css();
    const hybrid=localStorage.getItem(HYBRID_KEY);
    if(hybrid==='1'){
      const sat=document.querySelector('#bwSatellite');
      const topo=document.querySelector('#bwTopo');
      if(sat && !sat.checked) sat.click();
      if(topo && !topo.checked) topo.click();
    }
    updateLabel();
    setInterval(updateLabel,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
