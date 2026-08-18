# V6 Consolidation Status

- [x] Canonical V6 data model
- [x] Shared application core
- [x] Central Hunt controller
- [x] Legacy map compatibility adapter
- [x] Central property/location controller API
- [x] Shared data-change event bridge
- [ ] Route existing map create/edit/delete UI through PropertyController
- [ ] Route Hunt save/edit/delete through AppCore
- [ ] Route Intelligence exclusively through canonical data
- [ ] Remove duplicate V5/V6 Hunt synchronization
- [ ] Remove legacy localStorage writes from migrated UI
- [ ] Production migration and cloud persistence

## Rule
No production merge until all migrated CRUD paths use the canonical V6 store and the preview passes map, property, Hunt, weather, and intelligence regression tests.
