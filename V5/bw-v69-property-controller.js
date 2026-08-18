(function(){
'use strict';
if(window.BackwoodsPropertyController)return;
const C=()=>window.BackwoodsAppCore,D=()=>window.BackwoodsData;
function property(){return D()?.get?.()||null}
function saveProperty(patch){const s=property();if(!s)return null;const next={...s,property:{...(s.property||{}),...patch}};D().set(next);window.dispatchEvent(new CustomEvent('backwoods:data-change',{detail:{type:'property-update',property:next.property}}));return next.property}
function addLocation(collection,item){if(!D())return null;const x=C()?.add?.(collection,item)||D().add(collection,item);window.dispatchEvent(new CustomEvent('backwoods:location-created',{detail:{collection,item:x}}));window.BackwoodsMapAdapter?.publish?.();return x}
function updateLocation(collection,id,patch){const x=C()?.update?.(collection,id,patch)||D().update(collection,id,patch);window.dispatchEvent(new CustomEvent('backwoods:location-updated',{detail:{collection,id,item:x}}));window.BackwoodsMapAdapter?.publish?.();return x}
function removeLocation(collection,id){const x=C()?.remove?.(collection,id)||D().remove(collection,id);window.dispatchEvent(new CustomEvent('backwoods:location-removed',{detail:{collection,id}}));window.BackwoodsMapAdapter?.publish?.();return x}
window.BackwoodsPropertyController={version:1,property,saveProperty,addLocation,updateLocation,removeLocation};
})();
