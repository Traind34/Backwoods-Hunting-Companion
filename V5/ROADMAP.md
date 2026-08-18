# Backwoods Planner Co. — V6 Roadmap

## Product north star
Build Backwoods Planner Co. into a field-first hunting operating system: plan, map, record, analyze, and improve every hunt.

## Current baseline
V5 already includes the core property/map experience, GPS-oriented mapping, map layers, parcel/property handling, hunting pins, hunt logging, automatic hunt date/time/weather fields, and stand selection. Preserve that working baseline while improving the product incrementally.

## V6 priorities
1. Harden the existing V5 field experience before adding broad feature surface area.
2. Make the Today/Hunt Intelligence experience the primary daily destination.
3. Establish a clean, durable data model for properties, stands, cameras, sightings, hunts, food plots, rut observations, and harvests.
4. Separate presentation from data/services so external APIs and cloud persistence can be added safely.
5. Make mobile/PWA behavior reliable for use in the field, including resilient local persistence and clear offline state.
6. Add a proprietary Backwoods stand/hunt scoring model using explainable inputs rather than opaque claims.
7. Introduce cloud accounts/sync only after the local data model is stable.
8. Add monetization after the core loop is reliable: free tier, Pro tier, then advanced intelligence.

## Core loop
Property → map → stands/cameras → observations → hunt → outcome → analysis → recommendation.

## Flagship experience
**Where should I hunt today?**

The recommendation should explain its score using observable factors such as wind, weather, access, historical activity, stand history, and user-entered observations. It must clearly distinguish measured data from inference and avoid unsupported claims of predictive accuracy.

## Product architecture target
- Today / Hunt Intelligence
- Properties
- Map
- Stands
- Cameras
- Deer & sightings
- Hunts
- Food plots
- Rut tracker
- Harvests
- Season review
- Settings / data backup

## Technical principles
- Do not replace the existing V5 map implementation wholesale.
- Preserve existing V5 functionality while changes are introduced incrementally.
- Prefer small, testable modules over continued growth of one monolithic HTML file.
- Keep private hunting locations private by default.
- Design data structures so cloud sync can be introduced without rewriting the domain model.
- Treat offline field use as a first-class requirement.

## Monetization path
1. Free: one property and core logging.
2. Pro: unlimited properties, advanced mapping, analytics, Hunt Intelligence, backup/sync.
3. Advanced: deeper intelligence, premium data integrations, and additional planning tools.

## National brand path
App → useful hunting intelligence → engaged community → physical planners/gear → content → ambassadors → retail.

## First major product milestone
Make the daily Today screen and Hunt Intelligence flow excellent before expanding into a large number of additional features.
