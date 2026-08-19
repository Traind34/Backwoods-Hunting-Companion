(function(){'use strict';
function loadBridge(){
  if(window.BackwoodsDataBridge)return Promise.resolve();
  return new Promise(function(resolve){
    var s=document.createElement('script');
    s.src='bw-v9-data-bridge.js';
    s.onload=function(){resolve()};
    s.onerror=function(){console.warn('Backwoods data bridge unavailable');resolve()};
    document.head.appendChild(s);
  });
}
function open(){window.dispatchEvent(new Event('bw:open-suite'))}
function init(){
  if(document.getElementById('bwCommandCenterButton'))return;
  loadBridge();
  var b=document.createElement('button');b.id='bwCommandCenterButton';b.type='button';b.textContent='Backwoods Command Center';b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9998;background:#283328;color:#fff;border:0;border-radius:12px;padding:12px 16px;font-weight:800;box-shadow:0 3px 12px #0003;cursor:pointer';b.onclick=open;document.body.appendChild(b)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();