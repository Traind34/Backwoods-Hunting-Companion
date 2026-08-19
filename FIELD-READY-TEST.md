# Backwoods Planner Co. — Phase 1 Field Test

This is the release gate for the hunting-season build. Do not merge `development` into `main` until these workflows pass.

## Core data
- [ ] Create property and reload page.
- [ ] Add multiple stands and reload page.
- [ ] Existing map stands migrate into the suite.
- [ ] Log a hunt against a stand and verify it remains after reload.
- [ ] Add deer and record a sighting.
- [ ] Add camera and upload multiple photos to the correct camera.
- [ ] Record conditions and verify history.

## Intelligence
- [ ] Hunt Intelligence recognizes every saved stand.
- [ ] Stand ranking changes when hunt/sighting data changes.
- [ ] Recommendation explains the factors used.
- [ ] Empty-data state does not claim a recommendation exists.

## Season / reports
- [ ] Season totals match the underlying hunt records.
- [ ] Stand hunt counts match Hunt Journal.
- [ ] Harvest count matches recorded harvests.
- [ ] Dashboard counts match stored records.

## Backup
- [ ] Export backup.
- [ ] Clear a test dataset.
- [ ] Import backup.
- [ ] Verify properties, stands, hunts, cameras, deer, sightings and conditions return.

## Field reliability
- [ ] Mobile layout works at phone width.
- [ ] Forms reject required fields cleanly.
- [ ] Empty states are usable.
- [ ] Refreshing the page does not lose saved records.
- [ ] Camera photos remain associated with the correct camera.
- [ ] No console-blocking JavaScript errors during the core workflows.

## Release gate
A release is not considered field-ready until every item above passes in a clean browser profile and on a mobile-sized viewport.
