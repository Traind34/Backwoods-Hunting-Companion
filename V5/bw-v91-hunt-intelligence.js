// V9.1: Hunt-window, access, thermal, and movement intelligence
(function(){
'use strict';
if(window.BackwoodsHuntIntelligence)return;
const DIRS=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const data=()=>window.BackwoodsData?.get?.()||{};
const dir=v=>{if(typeof v==='number'&&Number.isFinite(v))return DIRS[Math.round((((v%360)+360)%360)/22.5)%16];const s=String(v||'').toUpperCase(),m=s.match(/\b(N|NNE|NE|ENE|E|ESE|SE|SSE|S|SSW|SW|WSW|W|WNW|NW|NNW)\b/);return m?m[1]:null};
const idx=d=>DIRS.indexOf(String(d||'').toUpperCase());
const diff=(a,b)=>{const x=idx(a),y=idx(b);if(x<0||y<0)return 99;const n=Math.abs(x-y);return Math.min(n,16-n)};
const timeHour=v=>{if(!v)return null;const m=String(v).match(/^(\d{1,2})(?::(\d{2}))?/);if(!m)return null;const h=+m[1],mi=+(m[2]||0);return h+mi/60};
const labelHour=h=>{h=((h%24)+24)%24;const ap=h>=12?'PM':'AM',x=Math.round(h)%12||12;return x+' '+ap};
const thermalMode=()=>document.getElementById('bwThermal')?.value||'neutral';

function movementProfile(stand,state){
 const id=String(stand.id||'').toLowerCase(),name=String(stand.name||'').toLowerCase();
 const sightings=(state.deerSightings||[]).filter(x=>{
  const k=String(x?.standId||x?.stand||x?.location||x?.standName||'').toLowerCase();
  return k===id||k===name;
 });
 const bins=Array(24).fill(0);
 sightings.forEach(x=>{const h=timeHour(x.time||x.timestamp||x.dateTime);if(h!=null)bins[Math.floor(h)%24]+=1});
 const total=sightings.length;
 if(!total)return {windows:[{start:5.5,end:9,reason:'general morning movement window'},{start:15,end:18.5,reason:'general evening movement window'}],evidence:0};
 const ranked=bins.map((n,h)=>({h,n})).filter(x=>x.n).sort((a,b)=>b.n-a.n);
 const windows=[];
 ranked.slice(0,3).forEach(x=>windows.push({start:Math.max(0,x.h-.75),end:Math.min(24,x.h+1.25),reason:x.n+' recorded deer sighting'+(x.n===1?'':'s')+' near '+labelHour(x.h)}));
 return {windows,evidence:total};
}

function accessScore(stand,state,windDir){
 const routes=Array.isArray(state.accessRoutes)?state.accessRoutes:[];
 const textual=String(stand.route||stand.accessRoute||stand.entryRoute||'').toLowerCase();
 let score=0,reasons=[];
 if(textual){score+=4;reasons.push('stand has an entry/exit route');}
 const near=routes.filter(r=>String(r.standId||r.stand||'').toLowerCase()===String(stand.id||'').toLowerCase());
 if(near.length){score+=5;reasons.push('mapped access route');}
 if(windDir&&/downwind|upwind|crosswind|scent|wind/i.test(textual)){score+=2;reasons.push('route notes reference wind/scent');}
 return {points:clamp(score,0,10),reasons};
}

function thermalScore(stand,state,windDir){
 const mode=thermalMode();
 if(mode==='neutral')return {points:0,label:'Thermals neutral'};
 const profile=stand.idealWind||{};
 const notes=(profile.notes||[]).join(' ').toLowerCase();
 let points=0,label=mode==='rise'?'Morning rising':'Evening falling';
 if(notes.includes('thermal'))points+=2;
 const type=String(stand.type||stand.kind||'').toLowerCase();
 if(mode==='rise'&&/bedding|ridge|morning/.test(type))points+=2;
 if(mode==='fall'&&/water|food|evening|valley/.test(type))points+=2;
 return {points,label};
}

function evaluate(stand,state){
 const wind=window.BackwoodsStandWind?.scoreWind?window.BackwoodsStandWind.scoreWind(stand,state):{points:0,actual:null,ideal:[]};
 const movement=movementProfile(stand,state);
 const access=accessScore(stand,state,wind.actual);
 const thermal=thermalScore(stand,state,wind.actual);
 const total=clamp(access.points+thermal.points, -12, 12);
 const reasons=[];
 if(wind.label)reasons.push(wind.label);
 reasons.push(...access.reasons);
 reasons.push(...movement.windows.slice(0,2).map(x=>x.reason));
 if(thermal.points)reasons.push(thermal.label+' thermal adjustment');
 return {points:total,wind,movement,access,thermal,reasons};
}

const ORIGINAL_RANK=window.BackwoodsRecommendation?.rank;
function rank(state){
 if(!ORIGINAL_RANK)return [];
 const existing=ORIGINAL_RANK(state);
 return existing.map(x=>{
   const e=evaluate(x.stand,state);
   return {...x,huntIntelligence:e,score:clamp(Math.round(x.score+e.points),0,100),reasons:[...(x.reasons||[]),...e.reasons],factors:[...(x.factors||[]),{name:'hunt timing / access / thermals',points:e.points}]};
 }).sort((a,b)=>b.score-a.score);
}

function report(stand,state){
 const e=evaluate(stand,state);
 const best=e.movement.windows[0];
 return {stand:stand.name||'Stand',scoreImpact:e.points,idealWinds:e.wind.ideal,currentWind:e.wind.actual,currentWindStatus:e.wind.label,movementWindows:e.movement.windows,access:e.access,thermal:e.thermal,primaryWindow:best||null};
}

if(window.BackwoodsRecommendation?.rank){const base=window.BackwoodsRecommendation.rank;base.__bwHuntBase=true;window.BackwoodsRecommendation.rank=function(state){const ranked=rank(state);return ranked};}
window.BackwoodsHuntIntelligence={version:1,evaluate,rank,report,movementProfile};
window.dispatchEvent(new CustomEvent('backwoods:hunt-intelligence-ready'));
})();