(function(){
'use strict';
if(window.BackwoodsCanonicalIntelligence)return;
function getData(){return window.BackwoodsData&&window.BackwoodsData.get?window.BackwoodsData.get():{stands:[],hunts:[],deerSightings:[]};}
function key(h){return String(h&& (h.standId||h.stand||h.standName)||'').toLowerCase();}
function score(stand,data){
 var id=String(stand.id||'').toLowerCase(), name=String(stand.name||'').toLowerCase();
 var hunts=(data.hunts||[]).filter(function(h){var k=key(h);return k===id||k===name;});
 var sightings=(data.deerSightings||[]).filter(function(x){var k=String(x&& (x.standId||x.stand||x.location||x.standName)||'').toLowerCase();return k===id||k===name;});
 var value=50,reasons=[];
 if(hunts.length){value+=Math.min(16,hunts.length*4);reasons.push(hunts.length+' recorded hunt'+(hunts.length===1?'':'s'));}
 if(sightings.length){value+=Math.min(15,sightings.length*3);reasons.push(sightings.length+' deer sighting'+(sightings.length===1?'':'s'));}
 if(stand.target||stand.targetBuck){value+=5;reasons.push('target location');}
 if(!reasons.length)reasons.push('limited historical data');
 return {stand:stand,score:Math.min(100,Math.round(value)),reasons:reasons,hunts:huntCount(hunts),sightings:sightings.length};
}
function huntCount(a){return a.length;}
function rank(){var data=getData();return (data.stands||[]).map(function(s){return score(s,data);}).sort(function(a,b){return b.score-a.score;});}
function recommendation(){var ranked=rank(),best=ranked[0]||null;return {generatedAt:new Date().toISOString(),best:best,ranked:ranked,standCount:ranked.length,confidence:best?Math.min(90,35+best.hunts*3+best.sightings*3):0};}
window.BackwoodsCanonicalIntelligence={version:1,rank:rank,recommendation:recommendation,count:function(){return getData().stands.length;}};
window.BackwoodsRecommendation=Object.assign(window.BackwoodsRecommendation||{}, {rank:rank,recommendation:recommendation});
window.dispatchEvent(new CustomEvent('backwoods:intelligence-ready',{detail:{standCount:window.BackwoodsCanonicalIntelligence.count()}}));
})();

/* V7.4 property alignment patch */
(function(){
  'use strict';
  if(window.__bwV74Loader)return;
  window.__bwV74Loader=true;
  function load(){
    if(document.querySelector('script[data-bw-v74="1"]'))return;
    const s=document.createElement('script');
    s.src='bw-v74-property-alignment.js';
    s.async=false;
    s.dataset.bwV74='1';
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();

/* V7.5: canonical hunt-area parcel alignment */
(function(){
  'use strict';
  if(window.__bwV75Loader)return;
  window.__bwV75Loader=true;
  function load(){
    if(document.querySelector('script[data-bw-v75="1"]'))return;
    const s=document.createElement('script');
    s.src='bw-v75-hunt-area-parcel-alignment.js';
    s.async=false;
    s.dataset.bwV75='1';
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();

/* V7.6: restore canonical blue My Property outlines + Hunt Today control position */
(function(){
  'use strict';
  if(window.__bwV76Loader)return;
  window.__bwV76Loader=true;
  function load(){
    if(document.querySelector('script[data-bw-v76="1"]'))return;
    const s=document.createElement('script');
    s.src='bw-v76-property-outline-ui.js';
    s.async=false;
    s.dataset.bwV76='1';
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
