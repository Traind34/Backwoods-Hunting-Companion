(function(){
'use strict';
if(window.BackwoodsAppCore)return;
const KEY='backwoods-planner-v6-data';
const LEGACY='backwoods-planner-map-v5';
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return {}}}
function normalize(){const v=read(KEY),l=read(LEGACY);v.properties=v.properties||[];v.stands=v.stands||[];v.cameras=v.cameras||[];v.hunts=v.hunts||[];v.deerSightings=v.deerSightings||[];if(!v.stands.length&&Array.isArray(l.pins))v.stands=l.pins.filter(p=>String(p?.type||'').toLowerCase().includes('stand')).map((p,i)=>({id:String(p.id??i),name:p.name||p.label||'Stand '+(i+1),lat:p.lat,lng:p.lng,type:'stand'}));return v}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));window.dispatchEvent(new CustomEvent('backwoods:data-changed',{detail:v}))}
function get(){return normalize()}
function refresh(){const v=get();save(v);return v}
function today(){return new Date().toISOString().slice(0,10)}
function huntDefaults(){return {date:today(),in:new Date().toTimeString().slice(0,5),temp:'',wind:'',weather:'',stand:''}}
window.BackwoodsAppCore={version:'7.0.0',key:KEY,get,save,refresh,today,huntDefaults};
window.BackwoodsAppCore.refresh();
})();
