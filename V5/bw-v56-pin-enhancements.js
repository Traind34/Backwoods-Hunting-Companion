(function(){
  'use strict';
  const KEY='backwoods-planner-map-v5';
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
  function map(){return document.querySelector('#bwMapViewport')}
  function addMenuItems(){
    const m=document.querySelector('#bwAddMenu'); if(!m)return;
    [['Trail Camera','Trail Camera'],['Other','Other']].forEach(function(pair){
      if(m.querySelector('[data-add-type="'+pair[0]+'"]'))return;
      const b=document.createElement('button'); b.type='button'; b.setAttribute('data-add-type',pair[0]);
      b.innerHTML='<span class="bwMenuPin"></span>'+pair[1]; m.appendChild(b);
      b.addEventListener('click',function(){
        m.hidden=true;
        const box=document.querySelector('#bwPinPlacement'),title=document.querySelector('#bwPinPlacementTitle');
        if(title)title.textContent='Place '+pair[1];
        if(box)box.hidden=false;
        window.__bwStartPinType=pair[0];
      });
    });
  }
  function tagPins(){
    const s=state();
    document.querySelectorAll('#bwMapOverlay .bwPropertyPin').forEach(function(el,i){
      if(!el.dataset.pinId && s.pins && s.pins[i])el.dataset.pinId=s.pins[i].id;
    });
  }
  function bindDrag(){
    const o=document.querySelector('#bwMapOverlay'),v=map();
    if(!o||!v||o.dataset.bwV56Drag==='1')return;
    o.dataset.bwV56Drag='1';
    o.addEventListener('pointerdown',function(e){
      const el=e.target.closest('.bwPropertyPin'); if(!el)return;
      e.preventDefault(); e.stopPropagation();
      const s=state(),p=(s.pins||[]).find(x=>String(x.id)===String(el.dataset.pinId)); if(!p)return;
      const r=v.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,start={lat:p.lat,lng:p.lng},z=Number(s.zoom)||7,N=Math.pow(2,z);
      const X=lon=>(lon+180)/360*N,Y=lat=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*N;
      const LON=x=>x/N*360-180,LAT=y=>Math.atan(Math.sinh(Math.PI*(1-2*y/N)))*180/Math.PI;
      el.classList.add('bwDragging');el.setPointerCapture?.(e.pointerId);
      function move(ev){
        const dx=ev.clientX-sx,dy=ev.clientY-sy;
        p.lng=LON(X(start.lng)+dx/256);p.lat=LAT(Y(start.lat)+dy/256);
        const cx=X(s.center.lng),cy=Y(s.center.lat);
        el.style.left=((X(p.lng)-cx)*256+r.width/2)+'px';el.style.top=((Y(p.lat)-cy)*256+r.height/2)+'px';
      }
      function up(){el.classList.remove('bwDragging');save(s);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up)}
      el.addEventListener('pointermove',move);el.addEventListener('pointerup',up,{once:true});
    },true);
  }
  function injectCss(){
    if(document.getElementById('bw-v56-pin-drag-css'))return;
    const st=document.createElement('style');st.id='bw-v56-pin-drag-css';
    st.textContent='.bwPropertyPin{touch-action:none;user-select:none}.bwPropertyPin.bwDragging{filter:drop-shadow(0 3px 5px rgba(0,0,0,.45));transform:translate(-50%,-100%) scale(1.08)}';
    document.head.appendChild(st);
  }
  function run(){injectCss();addMenuItems();tagPins();bindDrag()}
  setInterval(run,500);run();
})();
