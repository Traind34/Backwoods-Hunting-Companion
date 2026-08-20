(function(){
'use strict';
if(window.__bwV80TargetBuck)return;
window.__bwV80TargetBuck=true;
const KEY='backwoods-planner-v6-data';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch(e){return false}}
function hideHomeTargetBuck(){
  document.querySelectorAll('button,.tile,[role="button"]').forEach(el=>{
    const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(t==='target buck'||t.includes('target buck')){
      if(el.closest('nav'))return;
      el.style.display='none';
      el.setAttribute('aria-hidden','true');
    }
  });
}
function addStyle(){if(document.getElementById('bwV80Style'))return;const s=document.createElement('style');s.id='bwV80Style';s.textContent=`#bwV80TargetBuck{margin-top:10px;background:#fff;border:1px solid #d7d0c1;border-radius:14px;padding:13px}#bwV80TargetBuck h3{font:19px Georgia,serif;color:#2f3a2f;margin:0 0 8px}.bwV80Row{display:grid;gap:7px}.bwV80Row input,.bwV80Row textarea{width:100%;padding:10px;border:1px solid #d7d0c1;border-radius:9px;font:inherit}.bwV80Save{border:0;border-radius:9px;padding:10px 12px;background:#2f3a2f;color:#fff;font-weight:800}`;document.head.appendChild(s)}
function addPropertySetting(){
  const s=read();if(!s)return;
  const target=s.property?.targetBuck||{};
  const home=[...document.querySelectorAll('main .screen')].find(x=>/property/i.test(x.textContent||'')&&x.classList.contains('active'));
  if(!home||document.getElementById('bwV80TargetBuck'))return;
  addStyle();
  const box=document.createElement('section');box.id='bwV80TargetBuck';box.innerHTML='<h3>Target Buck</h3><div class="bw80Row"><input id="bwV80Name" placeholder="Buck name (optional)" value="'+esc(target.name||'')+'"><input id="bwV80Age" placeholder="Estimated age (optional)" value="'+esc(target.age||'')+'"><textarea id="bwV80Notes" placeholder="Notes">'+esc(target.notes||'')+'</textarea><button class="bwV80Save" type="button">Save Target Buck</button></div>';
  const host=home.querySelector('.card:last-child')||home.querySelector('main')||home;host.parentNode.insertBefore(box,host.nextSibling);
  box.querySelector('button').onclick=()=>{const fresh=read()||{};fresh.property=fresh.property||{};fresh.property.targetBuck={name:box.querySelector('#bwV80Name').value.trim(),age:box.querySelector('#bwV80Age').value.trim(),notes:box.querySelector('#bwV80Notes').value.trim()};write(fresh);box.querySelector('button').textContent='Saved';setTimeout(()=>box.querySelector('button').textContent='Save Target Buck',1000)};
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function run(){hideHomeTargetBuck();addPropertySetting()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setInterval(run,1200);
})();
