// V9.0: Stand-specific wind intelligence and wind-aware recommendation scoring
(function(){
'use strict';
if(window.BackwoodsStandWind)return;
const DATA=()=>window.BackwoodsData?.get?.()||{};
const DIRS=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const idx=d=>{const x=DIRS.indexOf(String(d||'').toUpperCase());return x<0?null:x};
const norm=d=>{const i=idx(d);return i==null?null:DIRS[i]};
const bearing=(a,b)=>{const r=Math.PI/180,la1=a.lat*r,la2=b.lat*r,dl=(b.lng-a.lng)*r;return (Math.atan2(Math.sin(dl)*Math.cos(la2),Math.cos(la1)*Math.sin(la2)-Math.sin(la1)*Math.cos(la2)*Math.cos(dl))/r+360)%360};
const toDir=d=>DIRS[Math.round(d/22.5)%16];
const distance=(a,b)=>{const r=3958.8,p=Math.PI/180,dLat=(b.lat-a.lat)*p,dLon=(b.lng-a.lng)*p;const x=Math.sin(dLat/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dLon/2)**2;return 2*r*Math.asin(Math.sqrt(x))};
const windFromValue=v=>{
 if(v==null)return null;
 if(typeof v==='number'&&Number.isFinite(v))return toDir(v);
 const s=String(v).toUpperCase();
 const m=s.match(/\b(N|NNE|NE|ENE|E|ESE|SE|SSE|S|SSW|SW|WSW|W|WNW|NW|NNW)\b/);
 return m?m[1]:null;
};
function nearbySources(stand,state){
 const sources=[];
 [['beddingAreas','bedding',1],['foodPlots','food',1.25],['waterSources','water',1.5],['deerSightings','sighting',.9],['cameras','camera',1.2]].forEach(([key,type,weight])=>{
  (state[key]||[]).forEach(x=>{
   const lat=Number(x.lat),lng=Number(x.lng); if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
   const dist=distance({lat:stand.lat,lng:stand.lng},{lat,lng});
   if(dist<=0.75)sources.push({type,dist,weight,dir:toDir(bearing({lat:stand.lat,lng:stand.lng},{lat,lng})),name:x.name||type});
  });
 });
 return sources.sort((a,b)=>(a.dist/a.weight)-(b.dist/b.weight));
}
function infer(stand,state){
 const explicit=windFromValue(stand.idealWind?.directions?.[0]||stand.wind||stand.primaryWind);
 const src=nearbySources(stand,state),candidates=[];
 const add=(d,reason,weight)=>{d=norm(d);if(!d)return;const x=candidates.find(c=>c.dir===d);if(x){x.weight+=weight;x.reasons.push(reason)}else candidates.push({dir:d,weight,reasons:[reason]})};
 if(explicit)add(explicit,'existing primary wind',4);
 src.filter(x=>x.type==='bedding').slice(0,2).forEach(x=>add(x.dir,'bedding-side scent protection',3));
 src.filter(x=>x.type==='food'||x.type==='water').slice(0,2).forEach(x=>add(x.dir,'food/water-side scent protection',2));
 src.filter(x=>x.type==='sighting'||x.type==='camera').slice(0,2).forEach(x=>add(x.dir,'documented deer activity nearby',1.5));
 candidates.sort((a,b)=>b.weight-a.weight);
 const directions=[...new Set(candidates.slice(0,4).map(x=>x.dir))];
 const notes=[];
 if(src.some(x=>x.type==='bedding'))notes.push('Morning: favors winds that carry scent away from nearby bedding.');
 if(src.some(x=>x.type==='food'||x.type==='water'))notes.push('Evening: favors winds that carry scent away from nearby food or water.');
 if(!src.length)notes.push('No nearby mapped movement feature was found; confirm this stand manually for the most accurate wind profile.');
 return {directions,inferred:!stand.idealWind?.directions?.length,sources:src.slice(0,6),notes,version:1,updatedAt:new Date().toISOString()};
}
function angleDiff(a,b){const x=idx(a),y=idx(b);if(x==null||y==null)return 99;const d=Math.abs(x-y);return Math.min(d,16-d)}
function matchScore(actual,ideal){
 if(!actual||!ideal?.length)return {points:0,label:'Wind not configured'};
 const best=Math.min(...ideal.map(x=>angleDiff(actual,x)));
 if(best===0)return {points:18,label:'Ideal wind'};
 if(best===1)return {points:10,label:'Near-ideal wind'};
 if(best===2)return {points:4,label:'Usable crosswind'};
 return {points:-12,label:'Unfavorable wind'};
}
function ensure(){
 const state=DATA(),stands=Array.isArray(state.stands)?state.stands:[];
 let changed=false;
 stands.forEach(s=>{
  if(!Number.isFinite(Number(s.lat))||!Number.isFinite(Number(s.lng)))return;
  if(!Array.isArray(s.idealWind?.directions)||!s.idealWind.directions.length){s.idealWind=infer(s,state);changed=true}
 });
 if(changed&&window.BackwoodsData?.set)window.BackwoodsData.set(state);
 return state;
}
function scoreWind(stand,state){
 const w=state.currentWeather?.wind||state.weather?.wind;
 const actual=windFromValue(typeof w==='object'?w.direction:w);
 const profile=stand.idealWind?.directions||[];
 return {...matchScore(actual,profile),actual,ideal:profile};
}
function renderModal(stand,state){
 let root=document.getElementById('bwStandWindModal');
 if(!root){
  root=document.createElement('div');root.id='bwStandWindModal';
  root.innerHTML='<div class="bwSWBackdrop"></div><div class="bwSWCard"><button class="bwSWClose">×</button><div id="bwSWBody"></div></div>';
  document.body.appendChild(root);
  root.querySelector('.bwSWBackdrop').onclick=()=>root.remove();
  root.querySelector('.bwSWClose').onclick=()=>root.remove();
 }
 const profile=stand.idealWind||infer(stand,state),weather=state.currentWeather||state.weather||{};
 const actual=windFromValue(typeof weather.wind==='object'?weather.wind.direction:weather.wind);
 const match=matchScore(actual,profile.directions);
 const src=(profile.sources||[]).map(x=>'<span class="bwSWTag">'+esc(x.type)+' • '+esc(x.dist.toFixed(2))+' mi • '+esc(x.dir)+'</span>').join('');
 root.querySelector('#bwSWBody').innerHTML='<div class="bwSWEyebrow">BACKWOODS WIND INTELLIGENCE</div><h2>'+esc(stand.name||'Stand')+'</h2><p class="bwSWLead">Recommended wind <b>FROM '+esc(profile.directions.join(' • ')||'SET MANUALLY')+'</b></p><div class="bwSWCompass">'+DIRS.map(d=>'<span class="'+(profile.directions.includes(d)?'active':'')+'">'+d+'</span>').join('')+'</div><div class="bwSWGrid"><div><small>CURRENT WIND</small><b>'+esc(actual||'Unavailable')+'</b></div><div><small>STAND STATUS</small><b>'+esc(match.label)+'</b></div></div><div class="bwSWReason"><b>Why these winds?</b><ul>'+((profile.notes||[]).map(x=>'<li>'+esc(x)+'</li>').join('')||'<li>Based on the stand profile and mapped deer-movement features.</li>')+'</ul></div>'+(src?'<div class="bwSWSources"><b>Nearby mapped factors</b><div>'+src+'</div></div>':'')+'<button class="bwSWEdit" type="button">Adjust ideal winds</button>';
 root.querySelector('.bwSWEdit').onclick=()=>editStand(stand);
 root.hidden=false;
}
function editStand(stand){
 const state=DATA(),profile=stand.idealWind||infer(stand,state),selected=new Set(profile.directions||[]);
 const choices=DIRS.map(d=>'<label><input type="checkbox" value="'+d+'" '+(selected.has(d)?'checked':'')+'> '+d+'</label>').join('');
 const root=document.getElementById('bwStandWindModal'),body=root.querySelector('#bwSWBody');
 body.innerHTML='<div class="bwSWEyebrow">SET IDEAL WINDS</div><h2>'+esc(stand.name||'Stand')+'</h2><p class="bwSWLead">Select every wind direction that keeps your scent away from the deer movement you expect. Directions mean the wind is <b>coming FROM</b> that direction.</p><div class="bwSWChoices">'+choices+'</div><button class="bwSWSave">Save Ideal Winds</button>';
 root.querySelector('.bwSWSave').onclick=()=>{
  const dirs=[...root.querySelectorAll('.bwSWChoices input:checked')].map(x=>x.value);
  if(!dirs.length){alert('Select at least one ideal wind direction.');return}
  const s=window.BackwoodsData.get(),found=s.stands.find(x=>String(x.id)===String(stand.id));
  if(found){found.idealWind={...found.idealWind,directions:dirs,inferred:false,updatedAt:new Date().toISOString()};window.BackwoodsData.set(s)}
  root.remove();window.dispatchEvent(new Event('backwoods:data-changed'));
 };
}
function enhancePins(){
 const data=ensure();
 document.querySelectorAll('.bwPropertyPin').forEach(el=>{
  if(el.dataset.bwWindBound==='1')return;
  const name=(el.querySelector('span')?.textContent||el.textContent||'').trim();
  const stand=data.stands.find(s=>String(s.name||'').trim()===name);
  if(!stand)return;
  el.dataset.bwWindBound='1';el.title='View ideal winds';
  el.onclick=e=>{e.preventDefault();e.stopPropagation();renderModal(stand,window.BackwoodsData.get())};
 });
}
function augmentRecommendation(){
 const old=window.BackwoodsRecommendation?.rank;if(!old||old.__bwWindWrapped)return;
 const wrapped=function(state){const s=state||DATA(),ranked=old(s);return ranked.map(x=>{const w=scoreWind(x.stand,s);return {...x,wind:w,score:clamp(Math.round(x.score+w.points),0,100),reasons:w.actual&&w.ideal.length?[...x.reasons,w.label+' ('+w.actual+' wind)']:x.reasons,factors:[...(x.factors||[]),{name:'stand wind',points:w.points}]}}).sort((a,b)=>b.score-a.score)};
 wrapped.__bwWindWrapped=true;window.BackwoodsRecommendation.rank=wrapped;
 const rec=window.BackwoodsRecommendation.recommendation;
 if(rec&&!rec.__bwWindWrapped){const rr=function(){const base=rec(),ranked=wrapped(DATA());return {...base,best:ranked[0]||null,ranked,windAware:true}};rr.__bwWindWrapped=true;window.BackwoodsRecommendation.recommendation=rr}
}
function style(){
 if(document.getElementById('bwStandWindStyle'))return;
 const s=document.createElement('style');s.id='bwStandWindStyle';s.textContent='#bwStandWindModal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}#bwStandWindModal[hidden]{display:none}.bwSWCard{width:min(620px,100%);max-height:88vh;overflow:auto;background:#f8f6f0;border-radius:22px 22px 0 0;padding:20px;box-shadow:0 -8px 30px rgba(0,0,0,.25);position:relative}.bwSWClose{position:absolute;right:14px;top:10px;border:0;background:none;font-size:30px;color:#2f3a2f}.bwSWEyebrow{font-size:10px;letter-spacing:2px;font-weight:900;color:#86754d}.bwSWCard h2{margin:4px 0 8px;font:28px Georgia,serif}.bwSWLead{font-size:14px;line-height:1.45}.bwSWCompass{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin:14px 0}.bwSWCompass span{background:#e8e4da;border-radius:8px;padding:7px 2px;text-align:center;font-size:10px;font-weight:800}.bwSWCompass span.active{background:#2f3a2f;color:#fff}.bwSWGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bwSWGrid div{background:#fff;border:1px solid #d7d0c1;border-radius:12px;padding:12px}.bwSWGrid small{display:block;font-size:9px;color:#6f756c;font-weight:900}.bwSWGrid b{display:block;margin-top:4px}.bwSWReason,.bwSWSources{background:#fff;border:1px solid #d7d0c1;border-radius:12px;padding:12px;margin-top:9px;font-size:12px}.bwSWReason ul{margin:7px 0 0;padding-left:18px}.bwSWTag{display:inline-block;background:#eeeae1;border-radius:8px;padding:5px 7px;margin:5px 5px 0 0;font-size:10px}.bwSWEdit,.bwSWSave{width:100%;margin-top:12px;border:0;border-radius:11px;background:#2f3a2f;color:#fff;padding:13px;font-weight:900}.bwSWChoices{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.bwSWChoices label{background:#fff;border:1px solid #d7d0c1;border-radius:9px;padding:9px;font-size:12px;font-weight:800}.bwSWChoices input{width:auto;margin-right:4px}@media(min-width:700px){#bwStandWindModal{align-items:center}.bwSWCard{border-radius:20px}}';document.head.appendChild(s)
}
function init(){style();ensure();enhancePins();augmentRecommendation();const o=document.getElementById('bwMapOverlay');if(o)new MutationObserver(enhancePins).observe(o,{childList:true});window.addEventListener('backwoods:data-changed',()=>{ensure();enhancePins()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));else setTimeout(init,250);
window.BackwoodsStandWind={version:1,infer,scoreWind,ensure};
})();