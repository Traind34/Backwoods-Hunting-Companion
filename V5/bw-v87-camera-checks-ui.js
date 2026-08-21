(function(){
  'use strict';
  if(window.__bwV87CameraChecksUI)return;
  window.__bwV87CameraChecksUI=true;

  const SLOT_KEY='bwCameraSlotsV57';
  const DATA_KEY='backwoods-planner-v6-data';

  function readJson(key,fallback){
    try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v}catch(e){return fallback}
  }

  function cameras(){
    const out=[]; const seen=new Set();
    function add(c){
      if(!c||typeof c!=='object')return;
      const key=String(c.cameraId||c.id||c.name||'').trim().toLowerCase();
      if(!key||seen.has(key))return;
      seen.add(key);
      out.push({
        id:String(c.id||c.cameraId||''),
        name:String(c.name||c.cameraId||'Camera'),
        location:String(c.location||''),
        type:String(c.type||''),
        provider:String(c.provider||''),
        notes:String(c.notes||''),
        cameraId:String(c.cameraId||'')
      });
    }
    try{
      const bd=window.BackwoodsData?.get?.();
      if(Array.isArray(bd?.cameras))bd.cameras.forEach(add);
    }catch(e){}
    try{
      const core=window.BackwoodsAppCore?.get?.();
      if(Array.isArray(core?.cameras))core.cameras.forEach(add);
    }catch(e){}
    const v=readJson(DATA_KEY,{});
    if(Array.isArray(v.cameras))v.cameras.forEach(add);
    const slots=readJson(SLOT_KEY,[]);
    if(Array.isArray(slots))slots.forEach(add);
    return out;
  }

  function ensureStyles(){
    if(document.getElementById('bw-v87-camera-checks-css'))return;
    const s=document.createElement('style');
    s.id='bw-v87-camera-checks-css';
    s.textContent=`
      .bwCameraCheckStat{cursor:pointer;transition:transform .15s,box-shadow .15s;position:relative}
      .bwCameraCheckStat:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(47,58,47,.14)}
      .bwCameraCheckStat:active{transform:scale(.98)}
      .bwCameraCheckStat:after{content:'›';position:absolute;right:7px;top:6px;font-size:16px;color:#86754d}
      #bwCameraChecksOverlay{position:fixed;inset:0;background:rgba(24,30,25,.48);z-index:200;display:none;align-items:flex-end;justify-content:center;padding:12px}
      #bwCameraChecksOverlay.open{display:flex}
      #bwCameraChecksSheet{width:min(620px,100%);max-height:86vh;overflow:auto;background:#eeeae1;border-radius:20px 20px 12px 12px;padding:16px;box-shadow:0 15px 50px rgba(0,0,0,.28)}
      .bwCameraChecksHead{display:flex;align-items:center;gap:10px;margin-bottom:10px}
      .bwCameraChecksHead h2{margin:0;flex:1;font:25px Georgia,serif;color:#20231e}
      #bwCameraChecksClose{border:0;background:#fff;border:1px solid #d7d0c1;border-radius:10px;width:38px;height:38px;font-size:24px;color:#2f3a2f}
      .bwCameraChecksEmpty{background:#fff;border:1px solid #d7d0c1;border-radius:13px;padding:18px;text-align:center;color:#6f756c}
      .bwCameraItem{background:#fff;border:1px solid #d7d0c1;border-radius:14px;padding:14px;margin-top:9px}
      .bwCameraItemTop{display:flex;align-items:flex-start;gap:10px}
      .bwCameraIcon{font-size:24px;line-height:1}
      .bwCameraItemTitle{font:18px Georgia,serif;font-weight:700;color:#2f3a2f;flex:1}
      .bwCameraMeta{display:grid;gap:4px;margin-top:8px;font-size:12px;color:#5f665d}
      .bwCameraMeta b{color:#2f3a2f}
      .bwCameraNotes{margin-top:8px;padding-top:8px;border-top:1px solid #eee8dd;font-size:12px;color:#6f756c}
    `;
    document.head.appendChild(s);
  }

  function ensureOverlay(){
    if(document.getElementById('bwCameraChecksOverlay'))return;
    const o=document.createElement('div');
    o.id='bwCameraChecksOverlay';
    o.innerHTML='<div id="bwCameraChecksSheet" role="dialog" aria-modal="true" aria-label="Camera Checks"><div class="bwCameraChecksHead"><h2>Camera Checks</h2><button id="bwCameraChecksClose" aria-label="Close">×</button></div><div id="bwCameraChecksList"></div></div>';
    document.body.appendChild(o);
    o.addEventListener('click',e=>{if(e.target===o)close()});
    o.querySelector('#bwCameraChecksClose').addEventListener('click',close);
  }

  function render(){
    const list=document.getElementById('bwCameraChecksList');
    if(!list)return;
    const cs=cameras();
    if(!cs.length){
      list.innerHTML='<div class="bwCameraChecksEmpty">No cameras have been added yet.</div>';
      return;
    }
    list.innerHTML=cs.map((c,i)=>{
      const meta=[];
      if(c.location)meta.push('<div><b>Location:</b> '+esc(c.location)+'</div>');
      if(c.type)meta.push('<div><b>Type:</b> '+esc(c.type)+'</div>');
      if(c.provider)meta.push('<div><b>Provider:</b> '+esc(c.provider)+'</div>');
      if(c.cameraId)meta.push('<div><b>Camera ID:</b> '+esc(c.cameraId)+'</div>');
      return '<div class="bwCameraItem"><div class="bwCameraItemTop"><div class="bwCameraIcon">📷</div><div class="bwCameraItemTitle">'+esc(c.name||('Camera '+(i+1)))+'</div></div><div class="bwCameraMeta">'+(meta.join('')||'<div><b>Camera:</b> Added to your property</div>')+'</div>'+(c.notes?'<div class="bwCameraNotes">'+esc(c.notes)+'</div>':'')+'</div>';
    }).join('');
  }

  function esc(v){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
  function open(){ensureOverlay();render();document.getElementById('bwCameraChecksOverlay').classList.add('open');document.body.style.overflow='hidden'}
  function close(){const o=document.getElementById('bwCameraChecksOverlay');if(o)o.classList.remove('open');document.body.style.overflow=''}

  function bind(){
    ensureStyles();ensureOverlay();
    document.querySelectorAll('.stat').forEach(stat=>{
      const text=(stat.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      if(!text.includes('CAMERA')||!text.includes('CHECK'))return;
      if(stat.dataset.bwCameraChecksBound==='1')return;
      stat.dataset.bwCameraChecksBound='1';
      stat.classList.add('bwCameraCheckStat');
      stat.setAttribute('role','button');
      stat.setAttribute('tabindex','0');
      stat.setAttribute('aria-label','View camera checks');
      stat.addEventListener('click',open);
      stat.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
    });
  }

  function init(){
    bind();
    setTimeout(bind,500);setTimeout(bind,1500);setTimeout(bind,3000);
    setInterval(bind,3000);
    window.addEventListener('backwoods:data-changed',()=>{bind();if(document.getElementById('bwCameraChecksOverlay')?.classList.contains('open'))render()});
    window.addEventListener('storage',()=>{bind();if(document.getElementById('bwCameraChecksOverlay')?.classList.contains('open'))render()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
