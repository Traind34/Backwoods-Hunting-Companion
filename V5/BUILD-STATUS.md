# Backwoods Development Build

`development` is the active workshop. `main` remains the stable production baseline.

## Phase 1 release scope

- Dashboard
- Property and stands
- Existing map-stand bridge
- Hunt journal
- Deer and field sightings
- Camera records and per-camera photo library
- Conditions
- Season history
- Reports and analytics
- Hunt intelligence
- Local backup and restore
- Mobile/offline-friendly local-first behavior

## Current implementation

The Field Command Center is version 8.1. Structured hunting data is stored locally and camera images use IndexedDB so image files are not forced into localStorage.

## Release gate

The app is **not marked field-ready until** the complete workflow is manually exercised in a browser on desktop and mobile-sized layouts, including reload/persistence, map-to-stand recognition, hunt logging, camera creation/photo upload/reload, deer and sightings, conditions, intelligence ranking, reports, backup/restore, and empty/error states.

A static JavaScript syntax workflow is also included for the Phase 1 scripts. `main` must not be changed until these checks and the manual integration pass are complete.

Cloud accounts, cellular-camera ingestion, multi-device sync, and community features are intentionally out of Phase 1.