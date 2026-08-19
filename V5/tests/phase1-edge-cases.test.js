const assert=require('assert');
const KEY='backwoods-suite-v8';
function fresh(){global.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}};global.window={dispatchEvent(){}};delete require.cache[require.resolve('../bw-v11-field-data-contract.js')];require('../bw-v11-field-data-contract.js');return window.BackwoodsFieldData}
const F=fresh();
let s=F.load();
assert.deepStrictEqual(s.properties,[]);assert.deepStrictEqual(s.stands,[]);assert.deepStrictEqual(s.hunts,[]);assert.deepStrictEqual(s.cameras,[]);
const p={id:'p1',name:'North Farm'},st={id:'s1',name:'North Ridge',propertyId:'p1'};s.properties=[p];s.stands=[st];s.hunts=[{id:'h1',stand:'North Ridge'}];s.sightings=[{id:'x1',standId:'s1'}];s.cameras=[{id:'c1',stand:'North Ridge'}];
s.hunts.forEach(x=>F.link(x,s));s.sightings.forEach(x=>F.link(x,s));s.cameras.forEach(x=>F.link(x,s));
assert.strictEqual(s.hunts[0].standId,'s1');assert.strictEqual(s.hunts[0].propertyId,'p1');assert.strictEqual(s.sightings[0].stand,'North Ridge');assert.strictEqual(s.sightings[0].propertyId,'p1');assert.strictEqual(s.cameras[0].standId,'s1');assert.strictEqual(s.cameras[0].propertyId,'p1');
F.save(s);const loaded=F.load();assert.strictEqual(loaded.hunts[0].standId,'s1');assert.strictEqual(loaded.cameras[0].propertyId,'p1');
const orphan={id:'h2',standId:'missing'};F.link(orphan,loaded);assert.strictEqual(orphan.standId,'missing');assert.strictEqual(orphan.stand,undefined);
console.log('Phase 1 edge-case contract tests passed');