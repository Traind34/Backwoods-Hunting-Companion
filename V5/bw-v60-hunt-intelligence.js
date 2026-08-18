(function(){
  'use strict';
  if(window.__bwV60Intelligence)return;
  window.__bwV60Intelligence=true;
  const KEY='backwoods-planner-map-v5';
  const CSS_ID='bw-v60-intelligence-css';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function pins(){return read().pins||[]}
  function isStand(p){const t=String(p?.type||p?.kind||p?.category||p?.labelType||'').toLowerCase();return t==='stand'||t.includes('stand')}
  function isCamera(p){const t=String(p?.type||p?.kind||p?.category||p?.labelType||'').toLowerCase();return t.includes('camera')}
  function standName(p,i){return String(p?.name||p?.label||p?.title||p?.location||('Stand '+(i+1))).trim()}
  function historicalHunts(){
    const s=read();
    const candidates=[s.hunts,s.huntLogs,s.huntLog,s.huntRecords,s.records,s.data?.hunts,s.data?.huntLogs];
    for(const a of candidates)if(Array.isArray(a))return a;
    return [];
  }
  function scoreStand(p,i,hunts){
    let score=55, reasons=[];
    const name=standName(p,i).toLowerCase();
    const related=hunts.filter(h=>String(h?.stand||h?.standName||h?.location||'').toLowerCase()===name || String(h?.standId||'')===String(p?.id||''));
    if(related.length){score+=Math.min(18,related.length*4);reasons.push(related.length+' recorded hunt'+(related.length===1?'':'s'));}
    const activity=Number(p?.activity||p?.deerActivity||p?.sightings||0);
    if(Number.isFinite(activity)&&activity>0){score+=Math.min(15,activity*3);reasons.push('recorded activity');}
    if(p?.target===true||p?.targetBuck===true){score+=5;reasons.push('target location');}
    if(p?.notes||p?.description)score+=2;
    score=Math.max(0,Math.min(100,Math.round(score)));
    if(!reasons.length)reasons.push('limited historical data');
    return {score,reasons};
  }
  function direction(deg){
    const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const n=Number(deg);return Number.isFinite(n)?dirs[Math.round((((n%360)+360)%360)/22.5)%16]:'';
  }
  function weatherText(code){const c=Number(code);if(c===0)return'Clear';if([1,2,3].includes(c))return c===1?'Mainly clear':c===2?'Partly cloudy':'Overcast';if([45,48].includes(c))return'Fog';if([51,53,55,56,57].includes(c))return'Drizzle';if([61,63,65,66,67,80,81,82].includes(c))return'Rain';if([71,73,75,77,85,86].includes(c))return'Snow';if([95,96,99].includes(c))return'Thunderstorm';return'Unknown'}
  function injectCss(){if(document.getElementById(CSS_ID))return;const s=document.createElement('style');s.id=CSS_ID;s.textContent=`
#bwV60Today{position:fixed;right:12px;top:78px;z-index:75;border:0;border-radius:12px;background:#2f3a2f;color:#f3efe5;padding:10px 13px;font-weight:900;box-shadow:0 4px 16px rgba(0,0,0,.22)}
#bwV60Modal{position:fixed;inset:0;z-index:1000;background:rgba(25,31,26,.58);display:flex;align-items:flex-end;justify-content:center;padding:12px}
#bwV60Panel{width:min(720px,100%);max-height:88vh;overflow:auto;background:#eeeae1;border-radius:22px 22px 14px 14px;box-shadow:0 20px 60px rgba(0,0,0,.3);color:#20231e}
.bwV60Head{background:#2f3a2f;color:#f3efe5;padding:20px 18px;border-radius:22px 22px 0 0;display:flex;align-items:center;gap:10px}.bwV60Head h2{margin:0;font:25px Georgia,serif;flex:1}.bwV60Close{border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:9px;width:38px;height:38px;font-size:22px}
.bwV60Body{padding:15px}.bwV60Hero{background:#fff;border:1px solid #d7d0c1;border-radius:16px;padding:17px}.bwV60Eyebrow{font-size:10px;letter-spacing:1.8px;font-weight:900;color:#86754d}.bwV60Hero h3{font:30px Georgia,serif;color:#2f3a2f;margin:5px 0}.bwV60Meta{font-size:12px;color:#6f756c}.bwV60Score{font:28px Georgia,serif;color:#2f3a2f}.bwV60Grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.bwV60Card{background:#fff;border:1px solid #d7d0c1;border-radius:13px;padding:12px}.bwV60Card b{display:block;margin-bottom:5px}.bwV60Muted{font-size:11px;color:#6f756c;line-height:1.45}.bwV60List{display:grid;gap:8px;margin-top:10px}.bwV60Stand{background:#fff;border:1px solid #d7d0c1;border-radius:13px;padding:12px;display:flex;align-items:center;gap:12px}.bwV60Stand .n{flex:1}.bwV60Stand .s{font:23px Georgia,serif;color:#2f3a2f}.bwV60Note{margin-top:12px;background:#f7f3ea;border:1px solid #d7d0c1;border-radius:12px;padding:11px;font-size:11px;color:#5d625a;line-height:1.45}@media(max-width:600px){#bwV60Today{top:78px;right:8px}.bwV60Grid{grid-template-columns:1fr 1fr}.bwV60Panel{max-height:92vh}}
`;document.head.appendChild(s)}
  function ensureButton(){if(document.getElementById('bwV60Today'))return;const b=document.createElement('button');b.id='bwV60Today';b.type='button';b.textContent='TODAY';b.addEventListener('click',open);document.body.appendChild(b)}
  function close(){document.getElementById('bwV60Modal')?.remove()}
  function render(data){
    const stands=data.stands.map((x,i)=>({p:x,i, ...scoreStand(x,i,data.hunts)})).sort((a,b)=>b.score-a.score);
    const best=stands[0];
    const weather=data.weather;
    const title=best?standName(best.p,best.i):'Add a stand';
    const score=best?best.score:0;
    const why=best?best.reasons.join(' • '):'Add a stand on your property map to begin scoring.';
    const weatherLine=weather?(Math.round(weather.temp)+'°F • '+weatherText(weather.code)+' • '+Math.round(weather.wind)+' mph '+direction(weather.windDir)):'Weather unavailable';
    const list=stands.slice(0,5).map(x=>'<div class="bwV60Stand"><div class="n"><b>'+esc(standName(x.p,x.i))+'</b><div class="bwV60Muted">'+esc(x.reasons.join(' • '))+'</div></div><div class="s">'+x.score+'</div></div>').join('');
    return '<div id="bwV60Modal"><section id="bwV60Panel"><div class="bwV60Head"><h2>Hunt Intelligence</h2><button class="bwV60Close" type="button">×</button></div><div class="bwV60Body"><div class="bwV60Hero"><div class="bwV60Eyebrow">TODAY\'S STARTING POINT</div><h3>'+esc(title)+'</h3><div class="bwV60Score">'+score+'/100</div><div class="bwV60Meta">Foundation score • '+esc(weatherLine)+'</div><p><b>Why:</b> '+esc(why)+'</p></div><div class="bwV60Grid"><div class="bwV60Card"><b>'+data.stands.length+'</b><span class="bwV60Muted">Mapped stands</span></div><div class="bwV60Card"><b>'+data.cameras.length+'</b><span class="bwV60Muted">Trail cameras</span></div><div class="bwV60Card"><b>'+data.hunts.length+'</b><span class="bwV60Muted">Recorded hunts</span></div></div><h2>Stand rankings</h2><div class="bwV60List">'+(list||'<div class="bwV60Card">No stands yet.</div>')+'</div><div class="bwV60Note"><b>V6 foundation:</b> this score is intentionally explainable and conservative. It uses data already stored by the app and does not claim to predict deer movement. As Backwoods gains reliable historical weather, wind, activity and hunt-outcome data, the scoring model can become substantially more sophisticated.</div></div></section></div>';
  }
  function open(){
    close();injectCss();
    const s=read(),ps=pins(),stands=ps.filter(isStand),cameras=ps.filter(isCamera),hunts=historicalHunts();
    const root=document.createElement('div');root.innerHTML=render({stands,cameras,hunts,weather:null});document.body.appendChild(root.firstElementChild);
    document.querySelector('.bwV60Close').addEventListener('click',close);document.getElementById('bwV60Modal').addEventListener('click',e=>{if(e.target.id==='bwV60Modal')close()});
    const loc=s.gps||s.center;if(loc?.lat&&loc?.lng){fetch('https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(loc.lat)+'&longitude='+encodeURIComponent(loc.lng)+'&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto').then(r=>r.json()).then(w=>{const c=w.current||{};const modal=document.getElementById('bwV60Modal');if(!modal)return;const data={stands,cameras,hunts,weather:{temp:Number(c.temperature_2m)||0,code:c.weather_code,wind:Number(c.wind_speed_10m)||0,windDir:Number(c.wind_direction_10m)||0}};const wrap=document.createElement('div');wrap.innerHTML=render(data);const fresh=wrap.firstElementChild;modal.replaceWith(fresh);fresh.querySelector('.bwV60Close').addEventListener('click',close);fresh.addEventListener('click',e=>{if(e.target.id==='bwV60Modal')close()})}).catch(()=>{});}
  }
  function init(){injectCss();ensureButton()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.bwOpenHuntIntelligence=open;
})();
