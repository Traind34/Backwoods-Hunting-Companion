(function(){
  'use strict';
  if(window.BackwoodsRecommendation)return;
  const DATA=()=>window.BackwoodsData?.get?.()||{};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const num=(v)=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const dir=(v)=>{const n=num(v);if(n==null)return null;const d=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];return d[Math.round((((n%360)+360)%360)/22.5)%16]};
  const wind=(v)=>{if(typeof v==='number')return {speed:v,direction:null};const s=String(v||'');const m=s.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:mph)?\s*([NSEW]{1,3})?/i);return m?{speed:num(m[1])||0,direction:m[2]?.toUpperCase()||null}:{speed:null,direction:null};};
  function huntStandId(h){return String(h?.standId||h?.stand||h?.standName||'').toLowerCase()}
  function scoreStand(stand,state){
    let score=50,reasons=[],factors=[];
    const id=String(stand.id||'').toLowerCase(),name=String(stand.name||'').toLowerCase();
    const hunts=(state.hunts||[]).filter(h=>huntStandId(h)===id||huntStandId(h)===name);
    const sightings=(state.deerSightings||[]).filter(x=>String(x?.standId||x?.stand||x?.location||'').toLowerCase()===id||String(x?.standName||'').toLowerCase()===name);
    const cameras=(state.cameras||[]).filter(x=>String(x?.standId||x?.nearStand||'').toLowerCase()===id);
    if(hunts.length){const pts=clamp(hunts.length*4,4,16);score+=pts;reasons.push(hunts.length+' recorded hunt'+(hunts.length===1?'':'s'));factors.push({name:'hunt history',points:pts});}
    if(sightings.length){const pts=clamp(sightings.length*3,3,15);score+=pts;reasons.push(sightings.length+' deer sighting'+(sightings.length===1?'':'s'));factors.push({name:'deer activity',points:pts});}
    if(cameras.length){score+=5;reasons.push('near a mapped camera');factors.push({name:'camera coverage',points:5});}
    if(stand.target===true||stand.targetBuck===true){score+=5;reasons.push('target location');factors.push({name:'target location',points:5});}
    if(stand.notes||stand.description){score+=1;factors.push({name:'field notes',points:1});}
    if(!reasons.length)reasons.push('limited historical data');
    return {score:clamp(Math.round(score),0,100),reasons,factors,hunts:hunts.length,sightings:sightings.length,cameras:cameras.length};
  }
  function rank(state){return (state.stands||[]).map(s=>({stand:s,...scoreStand(s,state)})).sort((a,b)=>b.score-a.score);}
  function recommendation(){
    const state=DATA();const ranked=rank(state);const best=ranked[0]||null;const w=wind(state.currentWeather?.wind||state.weather?.wind);const weather=state.currentWeather||state.weather||null;
    return {generatedAt:new Date().toISOString(),best,ranked,weather:{temperature:num(weather?.temperature)||num(weather?.temp),condition:weather?.condition||weather?.weather||null,wind:w},confidence:best?clamp(35+(best.hunts*3)+(best.sightings*3),35,90):0,limitations:['This is an explainable decision-support score, not a deer-movement prediction.','Weather is only used when reliable current weather has been stored or supplied.','More accurate recommendations require consistent hunt outcomes, stand conditions and historical weather.']};
  }
  window.BackwoodsRecommendation={version:1,recommendation,rank};
})();
