(function(){
'use strict';
if(window.__bwV75HuntAreaAlignment)return;
window.__bwV75HuntAreaAlignment=true;

const KEY='backwoods-planner-map-v5';
const VIEW='#bwMapViewport', SVG='#bwMapVector';
let lastSig='';

function read(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'{}');
    s.center=s.center||{lat:41.2033,lng:-77.1945};
    s.zoom=Number(s.zoom)||7;
    s.myParcels=s.myParcels||[];
    s.pins=s.pins||[];
    return s;
  }catch(e){return {center:{lat:41.2033,lng:-77.1945},zoom:7,myParcels:[],pins:[]};}
}
function N(z){return Math.pow(2,z)}
function X(lng,z){return (lng+180)/360*N(z)}
function Y(lat,z){return (1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*N(z)}
function screen(lat,lng,s,r){
  const cx=X(s.center.lng,s.zoom),cy=Y(s.center.lat,s.zoom);
  return {x:(X(lng,s.zoom)-cx)*256+r.width/2,y:(Y(lat,s.zoom)-cy)*256+r.height/2};
}
function pointInRing(p,ring){
  let inside=false,x=p.lng,y=p.lat;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[i],b=ring[j];
    const hit=((a[1]>y)!=(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1]+Number.EPSILON)+a[0]);
    if(hit)inside=!inside;
  }
  return inside;
}
function contains(p,g){
  if(!g)return false;
  if(g.type==='Polygon'){
    const r=g.coordinates||[];
    return !!r.length&&pointInRing(p,r[0])&&!r.slice(1).some(x=>pointInRing(p,x));
  }
  if(g.type==='MultiPolygon'){
    return (g.coordinates||[]).some(a=>a.length&&pointInRing(p,a[0])&&!a.slice(1).some(x=>pointInRing(p,x)));
  }
  return false;
}
function parcelPath(g,s,r){
  const parts=[];
  function ringPath(ring){
    if(!ring||ring.length<3)return '';
    return ring.map((c,i)=>{const q=screen(c[1],c[0],s,r);return (i?'L':'M')+' '+q.x+' '+q.y}).join(' ')+' Z';
  }
  if(g.type==='Polygon')return (g.coordinates||[]).map(ringPath).filter(Boolean).join(' ');
  if(g.type==='MultiPolygon'){
    (g.coordinates||[]).forEach(poly=>(poly||[]).forEach(ring=>{const d=ringPath(ring);if(d)parts.push(d)}));
  }
  return parts.join(' ');
}
function isMyParcel(f,s){
  const pin=String(f&&f.properties&&f.properties.PIN||'');
  return !!pin&&s.myParcels.some(p=>String(p.PIN)===pin);
}
function huntPins(){
  return read().pins.filter(p=>{
    const t=String(p.type||'').toLowerCase(),n=String(p.name||'').toLowerCase();
    return t==='stand'||t==='blind'||t==='hunt'||n.includes('blind')||n.includes('stand');
  });
}
function render(){
  const V=document.querySelector(VIEW),G=document.querySelector(SVG);
  if(!V||!G)return;
  const parcelToggle=document.querySelector('#bwShowParcels');
  if(parcelToggle&&parcelToggle.checked===false)return;
  const s=read(),geo=s.parcelGeo;
  if(!geo||!geo.features)return;
  const r=V.getBoundingClientRect();
  const pins=huntPins();
  const wanted=[];
  geo.features.forEach(f=>{
    if(isMyParcel(f,s)){wanted.push({f,reason:'property'});return;}
    if(pins.some(p=>contains({lat:Number(p.lat),lng:Number(p.lng)},f.geometry)))wanted.push({f,reason:'hunt'});
  });
  const sig=s.zoom+'|'+s.center.lat+'|'+s.center.lng+'|'+wanted.map(x=>String(x.f.properties&&x.f.properties.PIN||'')).join(',')+'|'+r.width+'x'+r.height;
  if(sig===lastSig)return;
  lastSig=sig;
  G.querySelectorAll('.bwV75HuntArea').forEach(x=>x.remove());
  G.querySelectorAll('.bwBoundaryPoly').forEach(x=>x.style.display='none');
  G.querySelectorAll('.bwSelectedParcel').forEach(x=>x.style.display='none');
  wanted.forEach(({f,reason})=>{
    const d=parcelPath(f.geometry,s,r);
    if(!d)return;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',d);
    p.setAttribute('class','bwV75HuntArea');
    p.setAttribute('fill',reason==='property'?'rgba(90,169,209,.23)':'rgba(90,169,209,.18)');
    p.setAttribute('stroke','#5aa9d1');
    p.setAttribute('stroke-width','3');
    p.setAttribute('vector-effect','non-scaling-stroke');
    p.setAttribute('pointer-events','none');
    G.appendChild(p);
  });
}
function boot(){
  if(!document.querySelector('#bwV75HuntAreaStyle')){
    const st=document.createElement('style');
    st.id='bwV75HuntAreaStyle';
    st.textContent='.bwV75HuntArea{vector-effect:non-scaling-stroke!important;pointer-events:none!important}.bwBoundaryPoly,.bwSelectedParcel{display:none!important}';
    document.head.appendChild(st);
  }
  render();
  setInterval(render,600);
  window.addEventListener('resize',function(){lastSig='';render()});
  window.addEventListener('storage',function(){lastSig='';render()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
