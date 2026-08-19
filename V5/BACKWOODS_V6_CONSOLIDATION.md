# Backwoods V6 Consolidation

## Goal
One Backwoods application with one canonical data model. Legacy V5 storage remains only as a compatibility bridge during migration.

## Canonical source
`window.BackwoodsData` owns properties, locations, stands, cameras, hunts, sightings, and observations.

## Application core
`window.BackwoodsAppCore` owns shared state events, CRUD wrappers, date/time helpers, and common weather behavior.

## Controllers
`window.BackwoodsHuntController` owns Hunt form synchronization. New UI should call the controller/core rather than directly manipulating V5 Hunt state.

## Map migration
`window.BackwoodsMapAdapter` imports legacy V5 pins into the canonical model and can publish canonical locations back to legacy storage while older map rendering remains in place.

## Rules
1. New features read/write `BackwoodsData`.
2. Do not create a second localStorage database.
3. Legacy V5 storage is compatibility-only.
4. Do not merge the consolidation branch into production until map/property CRUD has been validated.
5. Remove compatibility adapters only after the legacy UI no longer depends on them.
