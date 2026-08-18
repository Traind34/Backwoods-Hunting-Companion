(function(){
  'use strict';
  if(window.__bwV64StandSync)return;
  window.__bwV64StandSync=true;

  function readLegacy(){try{return JSON.parse(localStorage.getItem('backwoods-planner-map-v5')||'{}')}catch(e){return {}}}
  function readV6(){try{return window.BackwoodsData?.get?.()||null}catch(e){return null}}
  function isStand(p){const t=String(p?.type||p?.kind||p?.category||p?.labelType||'').toLowerCase();return t==='stand'||t.includes('tree stand')||t.includes('hunting stand')||t.includes('stand')}
  function name(p,i){return String(p?.name||p?.label||p?.title||('Stand '+(i+1))).trim()}
  function collect(){
    const out=[],seen=new Set(),v6=readV6();
    (v6?.stands||[]).forEach((p,i)=>{if(!p||!isStand(p))return;const id=String(p.id??'');if(id&&!seen.has(id)){seen.add(id);out.push({id:id,name:name(p,i)})}});
    const legacy=readLegacy();
    (legacy.pins||[]).forEach((p,i)=>{if(!p||!isStand(p))return;const id=String(p.id??i);if(!seen.has(id)){seen.add(id);out.push({id:id,name:name(p,i)})}});
    return out;
  }
  function forms(){return [...new Set([...document.querySelectorAll('form[data-type="hunt"],#hunt form')])];}
  function setIfAuto(form,n,v){const el=form?.querySelector('[name="'+n+'"]');if(el&&(el.value===''||el.dataset.bwAuto==='1')){el.value=v;el.dataset.bwAuto='1';el.dispatchEvent(new Event('input',{bubbles:true}));}return el}
  function localDate(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function currentTime(){const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
  function weatherText(c){c=Number(c);if(c===0)return'Clear';if([1,2,3].includes(c))return c===1?'Mainly clear':c===2?'Partly cloudy':'Overcast';if([45,48].includes(c))return'Fog';if([51,53,55,56,57].includes(c))return'Drizzle';if([61,63,65,66,67,80,81,82].includes(c))return'Rain';if([71,73,75,77,85,86].includes(c))return'Snow';if([95,96,99].includes(c))return'Thunderstorm';return'Weather unavailable'}
  function windDir(d){const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];d=Number(d);return Number.isFinite(d)?dirs[Math.round((((d%360)+360)%360)/22.5)%16]:''}
  let weatherBusy=false,lastWeather=0;
  function autoWeather(form){
    if(weatherBusy||Date.now()-lastWeather<300000||!navigator.geolocation)return;
    weatherBusy=true;
    navigator.geolocation.getCurrentPosition(function(pos){
      const u='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(pos.coords.latitude)+'&longitude='+encodeURIComponent(pos.coords.longitude)+'&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto';
      fetch(u).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{const c=data.current||{};setIfAuto(form,'temp',c.temperature_2m==null?'':Math.round(c.temperature_2m)+'°F');const wd=windDir(c.wind_direction_10m);setIfAuto(form,'wind',c.wind_speed_10m==null?'':Math.round(c.wind_speed_10m)+' mph'+(wd?' '+wd:''));setIfAuto(form,'weather',weatherText(c.weather_code));lastWeather=Date.now()}).catch(()=>{}).finally(()=>{weatherBusy=false})
    },()=>{weatherBusy=false},{enableHighAccuracy:false,maximumAge:300000,timeout:10000});
  }
  function sync(form){
    if(!form)return;
    let field=form.querySelector('select[name="stand"],select#huntStand');
    const input=form.querySelector('input[name="stand"]');
    if(!field&&input){field=document.createElement('select');field.name='stand';field.id='huntStand';field.className=input.className;field.style.cssText=input.style.cssText;input.replaceWith(field)}
    if(field){
      const stands=collect(),previous=field.value;field.innerHTML='';
      const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=stands.length?'Select a stand…':'No stands added yet';field.appendChild(placeholder);
      stands.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;field.appendChild(o)});
      if(previous&&stands.some(s=>String(s.id)===String(previous)))field.value=previous;
      if(!field.dataset.bwStandBound){field.dataset.bwStandBound='1';field.addEventListener('change',()=>{if(field.value)setIfAuto(form,'in',currentTime())})}
      const label=field.closest('label');if(label){const text=[...label.childNodes].find(n=>n.nodeType===3&&String(n.textContent).trim());if(text)text.textContent='Stand'}
    }
    setIfAuto(form,'date',localDate());
    const time=form.querySelector('[name="in"]');if(time&&!time.value){time.value=currentTime();time.dataset.bwAuto='1'}
    if(document.querySelector('#hunt')?.classList.contains('active'))autoWeather(form);
  }
  function run(){forms().forEach(sync)}
  run();setInterval(run,1000);
  window.BackwoodsHuntStandSync={version:2,sync:run};
})();
