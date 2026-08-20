(function(){
'use strict';
if(window.__bwV76PropertyOutlineUI)return;
window.__bwV76PropertyOutlineUI=true;
const KEY='backwoods-planner-map-v5';
const VIEW='#bwMapViewport',SVG='#bwMapVector';
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function N(z){return Math.pow(2,z)}
function X(lng,z){return (lng+180)/360*N(z)}
function Y(lat,z){return (1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*N(z)}
function project(lat,lng,s,r){const z=Number(s.zoom)||7,cx=X(s.center?.lng??-77.1945,z),cy=Y(s.center?.lat??41.2033,z);return{x:(X(lng,z)-cx)*256+r.width/2,y:(Y(lat,z)-cy)*256+r.height/2}}
function drawRing(host,ring,s,r){if(!ring||ring.length<3)return;const d=ring.map((c,i)=>{const q=project(c[1],c[0],s,r);return(i?'L':'M')+' '+q.x+' '+q.y}).join(' ')+' Z';const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class','bwV76MyProperty');p.setAttribute('fill','rgba(90,169,209,.12)');p.setAttribute('stroke','#5aa9d1');p.setAttribute('stroke-width','3');p.setAttribute('vector-effect','non-scaling-stroke');p.setAttribute('pointer-events','none');host.appendChild(p)}
function drawGeometry(host,g,s,r){if(!g)return;if(g.type==='Polygon')(g.coordinates||[]).forEach(ring=>drawRing(host,ring,s,r));if(g.type==='MultiPolygon')(g.coordinates||[]).forEach(poly=>(poly||[]).forEach(ring=>drawRing(host,ring,s,r)))}
function renderProperty(){const v=document.querySelector(VIEW),svg=document.querySelector(SVG);if(!v||!svg)return;let host=document.querySelector('#bwV76PropertyOverlay');if(!host){host=document.createElementNS('http://www.w3.org/2000/svg','g');host.id='bwV76PropertyOverlay';host.setAttribute('pointer-events','none');svg.appendChild(host)}host.innerHTML='';const s=state(),r=v.getBoundingClientRect();(Array.isArray(s.myParcels)?s.myParcels:[]).forEach(parcel=>drawGeometry(host,parcel.geometry||parcel.geojson||parcel.geoJson,s,r))}
function style(){if(document.getElementById('bwV76Style'))return;const st=document.createElement('style');st.id='bwV76Style';st.textContent=`
#bwMapVector .bwV76MyProperty{fill:rgba(90,169,209,.12)!important;stroke:#5aa9d1!important;stroke-width:3px!important;vector-effect:non-scaling-stroke!important;display:block!important}
#bwMapVector .bwSelectedParcel{fill:rgba(90,169,209,.12)!important;stroke:#5aa9d1!important;stroke-width:3px!important;display:block!important;vector-effect:non-scaling-stroke!important}
#bwMapVector .bwMyPropertyPath{fill:rgba(90,169,209,.12)!important;stroke:#5aa9d1!important;stroke-width:3px!important;display:block!important;vector-effect:non-scaling-stroke!important}
#bwMapViewport .bwV76HuntTodayFixed{position:absolute!important;right:10px!important;top:116px!important;bottom:auto!important;left:auto!important;z-index:155!important;transform:none!important;margin:0!important}
@media(min-width:601px){#bwMapViewport .bwV76HuntTodayFixed{top:164px!important}}
` ;document.head.appendChild(st)}
function moveHuntToday(){const v=document.querySelector(VIEW);if(!v)return;const els=[...document.querySelectorAll('button')].filter(b=>/hunt\s*today/i.test((b.textContent||'').trim()));els.forEach(el=>{if(el.parentElement!==v)v.appendChild(el);el.classList.add('bwV76HuntTodayFixed');el.style.position='absolute';el.style.right='10px';el.style.top='116px';el.style.bottom='auto';el.style.left='auto';el.style.zIndex='155';el.style.transform='none';el.style.margin='0'})}
function tick(){style();renderProperty();moveHuntToday()}
function boot(){tick();window.addEventListener('resize',tick);window.addEventListener('storage',tick);setInterval(tick,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
