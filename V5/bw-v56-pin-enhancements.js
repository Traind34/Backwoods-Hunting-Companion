(function(){
  'use strict';
  const KEY='backwoods-planner-map-v5';
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
  function map(){return document.querySelector('#bwMapViewport')}
  function addMenuItems(){
    const m=document.querySelector('#bwAddMenu'); if(!m)return;
    [['Trail Camera','Trail Camera'],['Other','Other']].forEach(function(pair){
      if(m.querySelector('[data-add-type="'+pair[0]+'"]'))return;
      const b=document.createElement('button'); b.type='button'; b.setAttribute('data-add-type',pair[0]);
      b.innerHTML='<span class="bwMenuPin"></span>'+pair[1]; m.appendChild(b);
      b.addEventListener('click',function(){
        m.hidden=true;
        const existing=m.querySelector('[data-add-type="Stand"]');
        if(existing){
          const old=existing.getAttribute('data-add-type');
          existing.setAttribute('data-add-type',pair[0]);
          existing.click();
          existing.setAttribute('data-add-type',old);
        }
      });
    });
  }
  function tagPins(){
    const s=state();
    document.querySelectorAll('#bwMapOverlay .bwPropertyPin').forEach(function(el,i){
      if(!el.dataset.pinId && s.pins && s.pins[i])el.dataset.pinId=s.pins[i].id;
    });
  }
  function bindDrag(){
    const o=document.querySelector('#bwMapOverlay'),v=map();
    if(!o||!v||o.dataset.bwV56Drag==='1')return;
    o.dataset.bwV56Drag='1';
    o.addEventListener('pointerdown',function(e){
      const el=e.target.closest('.bwPropertyPin'); if(!el)return;
      e.preventDefault(); e.stopPropagation();
      const s=state(),p=(s.pins||[]).find(x=>String(x.id)===String(el.dataset.pinId)); if(!p)return;
      const r=v.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,start={lat:p.lat,lng:p.lng},z=Number(s.zoom)||7,N=Math.pow(2,z);
      const X=lon=>(lon+180)/360*N,Y=lat=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*N;
      const LON=x=>x/N*360-180,LAT=y=>Math.atan(Math.sinh(Math.PI*(1-2*y/N)))*180/Math.PI;
      el.classList.add('bwDragging');el.setPointerCapture?.(e.pointerId);
      function move(ev){
        const dx=ev.clientX-sx,dy=ev.clientY-sy;
        p.lng=LON(X(start.lng)+dx/256);p.lat=LAT(Y(start.lat)+dy/256);
        const cx=X(s.center.lng),cy=Y(s.center.lat);
        el.style.left=((X(p.lng)-cx)*256+r.width/2)+'px';el.style.top=((Y(p.lat)-cy)*256+r.height/2)+'px';
      }
      function up(){el.classList.remove('bwDragging');save(s);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up)}
      el.addEventListener('pointermove',move);el.addEventListener('pointerup',up,{once:true});
    },true);
  }
  function injectCss(){
    if(document.getElementById('bw-v56-pin-drag-css'))return;
    const st=document.createElement('style');st.id='bw-v56-pin-drag-css';
    st.textContent='.bwPropertyPin{touch-action:none;user-select:none}.bwPropertyPin.bwDragging{filter:drop-shadow(0 3px 5px rgba(0,0,0,.45));transform:translate(-50%,-100%) scale(1.08)}';
    document.head.appendChild(st);
  }

  function standName(p,i){
    return String(p.name||p.label||p.title||p.location||('Stand '+(i+1))).trim();
  }
  function isStand(p){
    const t=String(p?.type||p?.kind||p?.category||p?.labelType||'').toLowerCase();
    return t==='stand'||t==='tree stand'||t==='hunting stand'||t.includes('stand');
  }
  function currentTimeValue(){
    const d=new Date();
    return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  }
  function ensureStandDropdown(){
    const form=document.querySelector('form[data-type="hunt"]');
    if(!form)return;
    const input=form.querySelector('input[name="stand"]');
    if(!input)return;
    let select=form.querySelector('select[name="stand"]');
    if(!select){
      select=document.createElement('select');
      select.name='stand';
      select.id='huntStand';
      select.className=input.className;
      select.style.cssText=input.style.cssText;
      input.replaceWith(select);
      const label=select.closest('label');
      if(label)label.childNodes[0].textContent='Stand';
      select.addEventListener('change',function(){
        if(!select.value)return;
        const time=form.querySelector('[name="in"]');
        if(time){time.value=currentTimeValue();time.dataset.bwAuto='1';}
      });
    }
    const pins=state().pins||[];
    const stands=pins.map(function(p,i){return {p:p,i:i}}).filter(x=>isStand(x.p));
    const previous=select.value;
    select.innerHTML='';
    const placeholder=document.createElement('option');
    placeholder.value='';
    placeholder.textContent=stands.length?'Select a stand…':'No stands added yet';
    placeholder.disabled=stands.length>0;
    placeholder.selected=true;
    select.appendChild(placeholder);
    stands.forEach(function(x){
      const o=document.createElement('option');
      o.value=String(x.p.id??x.i);
      o.textContent=standName(x.p,x.i);
      select.appendChild(o);
    });
    if(previous && stands.some(x=>String(x.p.id??x.i)===previous))select.value=previous;
  }

  function run(){injectCss();addMenuItems();tagPins();bindDrag();runHuntAutoFields();ensureStandDropdown()}
  setInterval(run,500);run();

  // Hunt section: populate today's local date and current weather from the user's location.
  // Weather data is fetched from Open-Meteo using browser geolocation; no location is stored by this script.
  let huntWeatherBusy=false;
  function localDateValue(d){
    const x=d||new Date();
    const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),day=String(x.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }
  function weatherText(code){
    const c=Number(code);
    if(c===0)return 'Clear';
    if([1,2,3].includes(c))return c===1?'Mainly clear':c===2?'Partly cloudy':'Overcast';
    if([45,48].includes(c))return 'Fog';
    if([51,53,55].includes(c))return 'Drizzle';
    if([56,57].includes(c))return 'Freezing drizzle';
    if([61,63,65].includes(c))return 'Rain';
    if([66,67].includes(c))return 'Freezing rain';
    if([71,73,75,77].includes(c))return 'Snow';
    if([80,81,82].includes(c))return 'Rain showers';
    if([85,86].includes(c))return 'Snow showers';
    if([95].includes(c))return 'Thunderstorm';
    if([96,99].includes(c))return 'Thunderstorm with hail';
    return 'Weather unavailable';
  }
  function windDirection(degrees){
    const d=Number(degrees);
    if(!Number.isFinite(d))return '';
    const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round((((d%360)+360)%360)/22.5)%16];
  }
  function setInput(form,name,value){
    const el=form?.querySelector('[name="'+name+'"]');
    if(el && (el.value==='' || el.dataset.bwAuto==='1')){el.value=value;el.dataset.bwAuto='1';}
  }
  function ensureWeatherStatus(form){
    if(!form)return null;
    let s=form.querySelector('.bwAutoWeatherStatus');
    if(!s){
      s=document.createElement('div');s.className='bwAutoWeatherStatus';
      s.style.cssText='grid-column:1/-1;font-size:11px;color:#6f756c;margin-top:-3px';
      const weather=form.querySelector('[name="weather"]')?.closest('label');
      if(weather)weather.after(s);else form.appendChild(s);
    }
    return s;
  }
  function populateHuntDate(){
    document.querySelectorAll('form[data-type="hunt"]').forEach(function(form){setInput(form,'date',localDateValue())});
  }
  function loadHuntWeather(){
    if(huntWeatherBusy||!navigator.geolocation)return;
    const hunt=document.querySelector('form[data-type="hunt"]');
    if(!hunt||document.querySelector('#hunt')?.classList.contains('active')===false)return;
    const status=ensureWeatherStatus(hunt);
    if(status && !status.dataset.loading)status.textContent='Getting local weather…';
    huntWeatherBusy=true;
    navigator.geolocation.getCurrentPosition(function(pos){
      const lat=pos.coords.latitude,lon=pos.coords.longitude;
      const url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(lat)+'&longitude='+encodeURIComponent(lon)+'&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto';
      fetch(url).then(function(r){if(!r.ok)throw Error(r.status);return r.json()}).then(function(data){
        const c=data.current||{};
        setInput(hunt,'temp',c.temperature_2m==null?'':Math.round(c.temperature_2m)+'°F');
        const direction=windDirection(c.wind_direction_10m);
        const wind=c.wind_speed_10m==null?'':Math.round(c.wind_speed_10m)+' mph'+(direction?' '+direction:'');
        setInput(hunt,'wind',wind);
        setInput(hunt,'weather',weatherText(c.weather_code));
        if(status){status.dataset.loading='done';status.textContent='Weather automatically populated from your current location.'}
      }).catch(function(){if(status){status.dataset.loading='done';status.textContent='Weather could not be loaded. You can enter it manually.'}}).finally(function(){huntWeatherBusy=false});
    },function(){
      if(status){status.dataset.loading='done';status.textContent='Location permission is needed for automatic weather.'}
      huntWeatherBusy=false;
    },{enableHighAccuracy:false,maximumAge:300000,timeout:10000});
  }
  function runHuntAutoFields(){
    const form=document.querySelector('form[data-type="hunt"]');
    if(!form)return;
    populateHuntDate();
    if(document.querySelector('#hunt')?.classList.contains('active'))loadHuntWeather();
  }
})();