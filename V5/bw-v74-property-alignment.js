(function(){
'use strict';
if(window.__bwV74PropertyAlignment)return;
window.__bwV74PropertyAlignment=true;

function install(){
  if(!document.getElementById('bwV74PropertyAlignmentCss')){
    const s=document.createElement('style');
    s.id='bwV74PropertyAlignmentCss';
    s.textContent=`
      /* One canonical property shape: the map engine's boundary geometry. */
      #bwMapVector .bwMyPropertyPath,
      #bwMyPropertyOverlay{display:none!important}
      #bwMapVector .bwSelectedParcel{
        fill:transparent!important;
        stroke:transparent!important;
        stroke-width:0!important;
        filter:none!important;
      }
      #bwMapVector .bwBoundaryPoly{
        fill:rgba(108,188,224,.22)!important;
        stroke:#5aa9d1!important;
        stroke-width:3!important;
        vector-effect:non-scaling-stroke!important;
        filter:drop-shadow(0 0 1px rgba(0,0,0,.55))!important;
      }
    `;
    document.head.appendChild(s);
  }
  const cleanup=()=>{
    const host=document.getElementById('bwMyPropertyOverlay');
    if(host)host.remove();
  };
  cleanup();
  if(!window.__bwV74PropertyAlignmentTimer){
    window.__bwV74PropertyAlignmentTimer=setInterval(cleanup,350);
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
