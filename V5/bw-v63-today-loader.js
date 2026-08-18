(function(){
  'use strict';
  function load(src,key){if(document.querySelector('script[data-'+key+']'))return;const s=document.createElement('script');s.src=src;s.async=true;s.setAttribute('data-'+key,'1');document.head.appendChild(s)}
  function init(){load('bw-v62-recommendation-engine.js','bw-v62');setTimeout(()=>load('bw-v63-today.js','bw-v63'),50)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
