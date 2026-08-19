const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const store={};
const listeners={};
const window={
  dispatchEvent(e){(listeners[e.type]||[]).forEach(fn=>fn(e));},
  addEventListener(type,fn){(listeners[type] ||= []).push(fn)},
  CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts&&opts.detail}}
};
const localStorage={
  getItem(k){return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null},
  setItem(k,v){store[k]=String(v)},
  removeItem(k){delete store[k]}
};
const context={window,localStorage,console,Date,Math,JSON};
vm.createContext(context);

function load(name){
  const file=path.join(__dirname,'..',name);
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}

load('bw-v11-field-data-contract.js');
assert.equal(context.window.BackwoodsFieldData.version,'11.0');

let s=context.window.BackwoodsFieldData.load();
s.properties=[{id:'p1',name:'North Property'}];
s.stands=[{id:'st1',name:'North Ridge',propertyId:'p1'}];
s.hunts=[{id:'h1',stand:'North Ridge'}];
s.sightings=[{id:'sg1',standId:'st1'}];
s.cameras=[{id:'c1',stand:'North Ridge'}];
s.deer=[];
s.conditions=[];
context.window.BackwoodsFieldData.link(s.hunts[0],s);
context.window.BackwoodsFieldData.link(s.sightings[0],s);
context.window.BackwoodsFieldData.link(s.cameras[0],s);
assert.equal(s.hunts[0].standId,'st1');
assert.equal(s.hunts[0].propertyId,'p1');
assert.equal(s.sightings[0].stand,'North Ridge');
assert.equal(s.sightings[0].propertyId,'p1');
assert.equal(s.cameras[0].standId,'st1');
assert.equal(s.cameras[0].propertyId,'p1');

context.window.BackwoodsFieldData.save(s);
const roundTrip=context.window.BackwoodsFieldData.load();
assert.equal(roundTrip.stands.length,1);
assert.equal(roundTrip.hunts[0].standId,'st1');
assert.equal(roundTrip.cameras[0].propertyId,'p1');

console.log('Phase 1 canonical data contract: PASS');
console.log('Property -> Stand -> Hunt/Sighting/Camera relationships: PASS');
console.log('Local persistence round-trip: PASS');
