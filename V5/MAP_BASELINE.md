# Backwoods Map Baseline

The map section is considered stable and locked at the current V5.17 baseline.

## Current map behavior
- Road map
- Satellite map
- Backwoods Hybrid map
- Topographic map
- Interactive pan and zoom
- Parcel data and parcel selection
- My Property parcels persistently shaded light blue with blue outlines
- Property pins
- Boundary drawing
- Access-route drawing
- Add menu
- iPhone full-screen map layout
- Layers control

## Rule for future work
Do not modify the map rendering, map controls, parcel styling, or map-layer behavior while working on other app sections unless a specific map bug is identified and explicitly requested.

Future feature work should be isolated from the map code whenever possible so the stable map baseline is preserved.