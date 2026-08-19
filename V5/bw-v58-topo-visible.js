(function(){
'use strict';
const KEY='backwoods-planner-map-v5',TOPO='backwoods-topo-overlay-v57',T=256,N=z=>2**z,X=(l,z)=>(l+180)/360*N(z),Y=(a,z)=>(1-Math.asinh(Math.tan(a*Math.PI/180))/Math.PI)/2*N(z);
const state=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
const enabled=()=>localStorage.getItem(TOPO)==='1';
const save=v=>localStorage.setItem(TOPO,v?'1':'0');
const urls=(x,y,z)=>[`https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/${z}/${y}/${x}`,`https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`];
function host(){const v=document.querySelector('#bwMapViewport');if(!v)return null;let h=document.querySelector('#bwMapTopoOverlay');if(!h){h=document.createElement('div');h.id='bwMapTopoOverlay';h.style.cssText='position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none;background:transparent';v.insertBefore(h,document.querySelector('#bwMapOverlay')||null)}return h}
function control(){const c=document.querySelector('#bwTopo');if(!c)return;if(c.type!=='checkbox'){const l=c.closest('label'),n=document.createElement('input');if(!l)return;n.type='checkbox';n.id='bwTopo';n.checked=enabled();c.replaceWith(n);n.addEventListener('change',()=>{save(n.checked);render()})}else c.checked=enabled()}
function render(){const v=document.querySelector('#bwMapViewport'),h=host();if(!v||!h)return;h.innerHTML='';if(!enabled())return;const s=state(),z=+s.zoom||7,c=s.center||{lat:41.2033,lng:-77.1945},r=v.getBoundingClientRect(),cx=X(c.lng,z),cy=Y(c.lat,z),n=N(z);for(let tx=Math.floor(cx-r.width/512)-1;tx<=Math.ceil(cx+r.width/512)+1;tx++)for(let ty=Math.floor(cy-r.height/512)-1;ty<=Math.ceil(cy+r.height/512)+1;ty++){if(ty<0||ty>=n)continue;const x=((tx%n)+n)%n,im=new Image();im.className='bwMapTopoTile';im.draggable=false;im.style.cssText=`position:absolute;width:${T}px;height:${T}px;left:${(tx-cx)*T+r.width/2}px;top:${(ty-cy)*T+r.height/2}px;opacity:.58;mix-blend-mode:multiply;filter:sepia(.3) saturate(.7) contrast(1.25);pointer-events:none;background:transparent`;const u=urls(x,ty,z);im.src=u[0];im.onerror=()=>{if(im.dataset.f){im.remove()}else{im.dataset.f='1';im.src=u[1]}};h.appendChild(im)}}
function load(src){return new Promise(function(resolve){if(document.querySelector('script[src="'+src+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=function(){console.warn('Backwoods integration script unavailable:',src);resolve()};document.head.appendChild(s)})}
function boot(){control();render();setInterval(()=>{control();render()},700);addEventListener('resize',render);load('bw-v8-bridge.js')}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot);else boot();
})();
