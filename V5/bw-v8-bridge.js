(function(){'use strict';
function loadScript(src){return new Promise(function(resolve){var s=document.createElement('script');s.src=src;s.onload=function(){resolve(true)};s.onerror=function(){console.warn('Backwoods script unavailable:',src);resolve(false)};document.head.appendChild(s)})}
function loadBridge(){if(window.BackwoodsDataBridge)return Promise.resolve(true);return loadScript('bw-v9-data-bridge.js')}
function loadFieldContract(){if(window.BackwoodsFieldData)return Promise.resolve(true);return loadScript('bw-v11-field-data-contract.js')}
function loadIntegration(){return loadScript('bw-v10-phase1-integration.js')}
function loadSync(){return loadScript('bw-v12-seamless-sync.js')}
function loadIntelligence(){return loadScript('bw-v13-intelligence-views.js')}
function loadDashboard(){return loadScript('bw-v14-field-dashboard.js')}
function open(){window.dispatchEvent(new Event('bw:open-suite'))}
function init(){
 if(document.getElementById('bwCommandCenterButton'))return;
 loadBridge().then(function(){return loadFieldContract()}).then(function(){return loadIntegration()}).then(function(){return loadSync()}).then(function(){return loadIntelligence()}).then(function(){return loadDashboard()});
 var b=document.createElement('button');b.id='bwCommandCenterButton';b.type='button';b.textContent='Backwoods Command Center';b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9998;background:#283328;color:#fff;border:0;border-radius:12px;padding:12px 16px;font-weight:800;box-shadow:0 3px 12px #0003;cursor:pointer';b.onclick=open;document.body.appendChild(b)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();