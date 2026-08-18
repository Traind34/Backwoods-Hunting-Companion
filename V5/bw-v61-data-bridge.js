(function(){
  'use strict';
  if(window.__bwV61Bridge)return;
  window.__bwV61Bridge=true;
  const LEGACY='backwoods-planner-map-v5';
  function sync(){
    const d=window.BackwoodsData;if(!d)return;
    const s=d.get();
    let l={};try{l=JSON.parse(localStorage.getItem(LEGACY)||'{}')}catch(e){}
    const pins=[];
    const groups=[['stands','Stand'],['cameras','Trail Camera'],['beddingAreas','Bedding'],['foodPlots','Food'],['waterSources','Water'],['scrapes','Scrape'],['rubAreas','Rub'],['otherLocations','Other']];
    groups.forEach(([key,type])=>(s[key]||[]).forEach(p=>pins.push({...p,type:p.type||type,name:p.name,label:p.name})));
    l.pins=pins;
    l.hunts=s.hunts||[];
    l.propertyName=s.property?.name||l.propertyName||'';
    localStorage.setItem(LEGACY,JSON.stringify(l));
  }
  const d=window.BackwoodsData;
  if(!d){setTimeout(arguments.callee,50);return;}
  sync();
  ['set','add','update','remove','import'].forEach(name=>{
    const original=d[name];if(typeof original!=='function')return;
    d[name]=function(){const result=original.apply(this,arguments);sync();return result};
  });
  window.BackwoodsData.syncLegacy=sync;
})();
