(function(){
'use strict';
if(window.__bwV70Events)return;window.__bwV70Events=true;
const D=()=>window.BackwoodsData;
function snapshot(){try{return JSON.stringify(D()?.get?.()||null)}catch(e){return''}}
let last=snapshot();
setInterval(function(){const now=snapshot();if(now&&now!==last){last=now;window.dispatchEvent(new CustomEvent('backwoods:data-change',{detail:{type:'external-data-change'}}));}},750);
window.BackwoodsDataEvents={version:1,refresh:function(){last=snapshot();window.dispatchEvent(new CustomEvent('backwoods:data-change',{detail:{type:'manual-refresh'}}))}};
})();
