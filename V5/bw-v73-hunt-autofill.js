(function(){
'use strict';
if(window.BackwoodsHuntAutofill)return;
function findForm(){return document.querySelector('form[data-type="hunt"],#hunt form');}
function field(form,names){for(var i=0;i<names.length;i++){var x=form.querySelector('[name="'+names[i]+'"],#'+names[i]);if(x)return x;}return null;}
function setIfEmpty(x,value){if(x&&value!=null&&String(x.value||'')===''){x.value=value;x.dispatchEvent(new Event('input',{bubbles:true}));}}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function time(){var d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function fill(){var f=findForm();if(!f)return;setIfEmpty(field(f,['date']),today());var stands=window.BackwoodsData&&window.BackwoodsData.get?window.BackwoodsData.get().stands||[]:[];var select=field(f,['stand','huntStand']);if(select&&select.tagName==='SELECT'){var old=select.value;var opts='<option value="">'+(stands.length?'Select a stand…':'No stands added yet')+'</option>';stands.forEach(function(s){opts+='<option value="'+String(s.id).replace(/"/g,'&quot;')+'">'+String(s.name||'Stand').replace(/</g,'&lt;')+'</option>';});if(select.innerHTML!==opts){select.innerHTML=opts;if(old)select.value=old;}}
var weather=window.BackwoodsData&&window.BackwoodsData.get?window.BackwoodsData.get().currentWeather||window.BackwoodsData.get().weather:null;
if(weather){setIfEmpty(field(f,['temp','temperature']),weather.temperature!=null?weather.temperature+'°F':weather.temp);setIfEmpty(field(f,['weather','condition']),weather.condition||weather.weather);setIfEmpty(field(f,['wind']),weather.wind);}
if(select&&!select.dataset.bwAutofillBound){select.dataset.bwAutofillBound='1';select.addEventListener('change',function(){setIfEmpty(field(f,['in','startTime','start']),time());});}
}
window.BackwoodsHuntAutofill={version:1,fill:fill};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fill);else fill();
new MutationObserver(fill).observe(document.body,{childList:true,subtree:true});
})();
