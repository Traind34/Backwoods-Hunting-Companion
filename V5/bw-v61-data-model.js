(function(){
  'use strict';
  if(window.BackwoodsData)return;
  const KEY='backwoods-planner-v6-data';
  const LEGACY='backwoods-planner-map-v5';
  const VERSION=1;
  const now=()=>new Date().toISOString();
  const uid=(p)=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  function blank(propertyId){return {schemaVersion:VERSION,updatedAt:now(),propertyId:propertyId||'default',property:{id:propertyId||'default',name:'',notes:''},boundary:null,accessRoutes:[],stands:[],cameras:[],beddingAreas:[],foodPlots:[],waterSources:[],scrapes:[],rubAreas:[],otherLocations:[],hunts:[],deerSightings:[],observations:[]};}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
  function write(s){s.schemaVersion=VERSION;s.updatedAt=now();localStorage.setItem(KEY,JSON.stringify(s));return s}
  function legacy(){try{return JSON.parse(localStorage.getItem(LEGACY)||'{}')}catch(e){return {}}}
  function normalizePin(p,i){const t=String(p?.type||p?.kind||p?.category||p?.labelType||'other').trim().toLowerCase();const name=String(p?.name||p?.label||p?.title||('Location '+(i+1)));return {id:String(p?.id||uid('loc')),name,type:t,lat:Number.isFinite(Number(p?.lat))?Number(p.lat):null,lng:Number.isFinite(Number(p?.lng))?Number(p.lng):null,x:Number.isFinite(Number(p?.x))?Number(p.x):null,y:Number.isFinite(Number(p?.y))?Number(p.y):null,notes:String(p?.notes||p?.description||''),createdAt:p?.createdAt||now(),updatedAt:now()};}
  function syncLegacyStandPins(s){
    const l=legacy();
    const pins=Array.isArray(l.pins)?l.pins:[];
    const mapPins=pins.filter(p=>String(p?.type||'').trim().toLowerCase()==='stand');
    const ids=new Set(mapPins.map(p=>String(p?.id??'')));
    s.stands=Array.isArray(s.stands)?s.stands:[];
    s.stands=s.stands.filter(x=>x?.source!=='map-pin'||ids.has(String(x.id)));
    mapPins.forEach((p,i)=>{
      const id=String(p?.id??'');
      if(!id)return;
      const n=normalizePin(p,i);n.source='map-pin';
      const existing=s.stands.find(x=>String(x.id)===id);
      if(existing)Object.assign(existing,n);
      else s.stands.push(n);
    });
    return s;
  }
  function migrate(){let s=read();if(s&&s.schemaVersion===VERSION)return s;s=blank(read()?.propertyId||'default');const l=legacy();s.propertyId=l.selectedPropertyId||l.bwCurrentPropertyId||s.propertyId;s.property.name=l.propertyName||l.name||'';const pins=Array.isArray(l.pins)?l.pins:[];pins.forEach((p,i)=>{const n=normalizePin(p,i);const t=n.type;if(t.includes('stand'))s.stands.push(n);else if(t.includes('camera'))s.cameras.push(n);else if(t.includes('bedding'))s.beddingAreas.push(n);else if(t.includes('food'))s.foodPlots.push(n);else if(t.includes('water'))s.waterSources.push(n);else if(t.includes('scrape'))s.scrapes.push(n);else if(t.includes('rub'))s.rubAreas.push(n);else s.otherLocations.push(n)});const hunts=[l.hunts,l.huntLogs,l.huntLog,l.huntRecords,l.records,l.data?.hunts,l.data?.huntLogs].find(Array.isArray)||[];s.hunts=hunts.map((h)=>({...h,id:String(h?.id||uid('hunt')),createdAt:h?.createdAt||now(),updatedAt:now()}));return write(s)}
  function get(){const s=migrate();syncLegacyStandPins(s);write(s);return s}
  function set(next){return write(JSON.parse(JSON.stringify(next)))}
  function add(collection,item){const s=get();if(!Array.isArray(s[collection]))throw Error('Unknown collection: '+collection);const x={id:String(item?.id||uid(collection)),createdAt:item?.createdAt||now(),updatedAt:now(),...item};s[collection].push(x);write(s);return x}
  function update(collection,id,patch){const s=get(),a=s[collection];if(!Array.isArray(a))throw Error('Unknown collection: '+collection);const i=a.findIndex(x=>String(x.id)===String(id));if(i<0)return null;a[i]={...a[i],...patch,updatedAt:now()};write(s);return a[i]}
  function remove(collection,id){const s=get(),a=s[collection];if(!Array.isArray(a))throw Error('Unknown collection: '+collection);s[collection]=a.filter(x=>String(x.id)!==String(id));write(s);return s}
  function exportData(){return JSON.stringify(get(),null,2)}
  function importData(text){const incoming=typeof text==='string'?JSON.parse(text):text;if(!incoming||incoming.schemaVersion!==VERSION)throw Error('Unsupported Backwoods V6 data version');return set(incoming)}
  window.BackwoodsData={version:VERSION,key:KEY,get,set,add,update,remove,export:exportData,import:importData,migrate,syncLegacyStandPins};
  migrate();
})();

/* V8: Target Buck is a property-level setting, not a Home shortcut. */
(function(){
  'use strict';
  if(window.__bwV80Loader)return;
  window.__bwV80Loader=true;
  function load(){if(document.querySelector('script[data-bw-v80="1"]'))return;const s=document.createElement('script');s.src='bw-v80-target-buck-property-setting.js';s.async=false;s.dataset.bwV80='1';document.head.appendChild(s)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
