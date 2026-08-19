# Backwoods V6 Consolidation

The v6-app-consolidation branch moves Backwoods toward one canonical application architecture.

## Current foundation
- `bw-v61-data-model.js` is the canonical data layer and migrates legacy V5 map/hunt data.
- `bw-v65-app-core.js` provides shared application state access, events, date/time utilities, and weather helpers.
- `bw-v66-hunt-controller.js` owns Hunt stand selection and Hunt defaults.
- `bw-v68-loader.js` loads the consolidated core modules in dependency order.

## Compatibility strategy
Existing V5 map and feature modules remain intact while the new core is introduced. Production is not changed by this branch.

## Next consolidation target
Route Property/Map create, update, and delete operations through `BackwoodsAppCore`/`BackwoodsData`, then retire duplicate V5/V6 synchronization bridges.
