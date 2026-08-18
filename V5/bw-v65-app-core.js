(function(){
'use strict';
if(window.BackwoodsAppCore)return;
const DATA=()=>window.BackwoodsData;
const listeners=new Set();
function emit(type,detail){listeners.forEach(fn=>{try{fn({type,detail:detail||null})}catch(e){}});window.dispatchEvent(new CustomEvent('backwoods:data-change',{detail:{type,detail:detail||null}}))}
function get(){return DATA()?.get?.()||null}
function subscribe(fn){if(typeof fn!=='function')return()=>{};listeners.add(fn);return()=>listeners.delete(fn)}
function add(collection,item){const x=DATA().add(collection,item);emit('add',{collection,item:x});return x}
function update(collection,id,patch){const x=DATA().update(collection,id,patch);emit('update',{collection,id,item:x});return x}
function remove(collection,id){const x=DATA().remove(collection,id);emit('remove',{collection,id});return x}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function time(){const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function weatherText(code){const c=Number(code);if(c===0)return'Clear';if([1,2,3].includes(c))return c===1?'Mainly clear':c===2?'Partly cloudy':'Overcast';if([45,48].includes(c))return'Fog';if([51,53,55,56,57].includes(c))return'Drizzle';if([61,63,65,66,67,80,81,82].includes(c))return'Rain';if([71,73,75,77,85,86].includes(c))return'Snow';if([95,96,99].includes(c))return'Thunderstorm';return'Weather unavailable'}
function windDirection(degrees){const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];const n=Number(degrees);return Number.isFinite(n)?dirs[Math.round((((n%360)+360)%360)/22.5)%16]:''}
function currentWeather(form){if(!form||!navigator.geolocation)return;const status=form.querySelector('.bwAppWeatherStatus');navigator.geolocation.getCurrentPosition(pos=>{const u='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(pos.coords.latitude)+'&longitude='+encodeURIComponent(pos.coords.longitude)+'&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto';fetch(u).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{const c=data.current||{};const set=(name,value)=>{const el=form.querySelector('[name="'+name+'"]');if(el&&(el.value===''||el.dataset.bwAuto==='1')){el.value=value;el.dataset.bwAuto='1';el.dispatchEvent(new Event('input',{bubbles:true}))}};set('temp',c.temperature_2m==null?'':Math.round(c.temperature_2m)+'°F');const wd=windDirection(c.wind_direction_10m);set('wind',c.wind_speed_10m==null?'':Math.round(c.wind_speed_10m)+' mph'+(wd?' '+wd:''));set('weather',weatherText(c.weather_code));if(status)status.textContent='Weather automatically populated from your current location.'}).catch(()=>{if(status)status.textContent='Weather could not be loaded. Enter manually.'})},()=>{if(status)status.textContent='Location permission is needed for automatic weather.'},{enableHighAccuracy:false,maximumAge:300000,timeout:10000})}
function initHuntForm(){const form=document.querySelector('form[data-type="hunt"],#hunt form');if(!form)return;const set=(name,value)=>{const el=form.querySelector('[name="'+name+'"]');if(el&&(el.value===''||el.dataset.bwAuto==='1')){el.value=value;el.dataset.bwAuto='1'}};set('date',today());const stand=form.querySelector('select[name="stand"],select#huntStand');if(stand&&!stand.dataset.bwCoreBound){stand.dataset.bwCoreBound='1';stand.addEventListener('change',()=>{if(stand.value)set('in',time())})}if(document.querySelector('#hunt')?.classList.contains('active'))currentWeather(form)}
function init(){initHuntForm();if(window.MutationObserver){const o=new MutationObserver(initHuntForm);o.observe(document.body,{childList:true,subtree:true})}}
window.BackwoodsAppCore={version:1,get,add,update,remove,subscribe,today,time,currentWeather,initHuntForm,init,weatherText,windDirection};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
