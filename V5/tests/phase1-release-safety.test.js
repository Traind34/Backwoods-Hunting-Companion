const assert=require('assert');
const FIELDS=['properties','stands','hunts','cameras','deer','sightings','conditions'];
function fresh(){global.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)}};global.window={dispatchEvent(){}};delete require.cache[require.resolve('../bw-v11-field-data-contract.js')];require('../bw-v11-field-data-contract.js');return window.BackwoodsFieldData}
const F=fresh(),s=F.load();FIELDS.forEach(k=>assert.ok(Array.isArray(s[k])));
s.properties=[{id:'p1',name:'Farm'}];s.stands=[{id:'s1',name:'Ridge',propertyId:'p1'}];s.hunts=[{id:'h1',standId:'s1'}];s.sightings=[{id:'x1',standId:'s1'}];s.cameras=[{id:'c1',standId:'s1'}];
s.hunts.forEach(x=>F.link(x,s));s.sightings.forEach(x=>F.link(x,s));s.cameras.forEach(x=>F.link(x,s));
assert.strictEqual(s.hunts[0].propertyId,'p1');assert.strictEqual(s.sightings[0].propertyId,'p1');assert.strictEqual(s.cameras[0].propertyId,'p1');
const bad={properties:[],stands:[{id:'s2',name:'Orphan',propertyId:'missing'}],hunts:[{id:'h2',standId:'missing'}],sightings:[],cameras:[],deer:[],conditions:[]};assert.ok(!F.property(bad,'missing'));assert.ok(!F.stand(bad,'missing'));
console.log('Phase 1 release safety tests passed');