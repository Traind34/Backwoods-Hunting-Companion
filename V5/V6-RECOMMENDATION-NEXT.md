# Next intelligence inputs

The current V6 engine is intentionally conservative. The next implementation should add structured stand conditions and historical matching rather than increasing the score with arbitrary heuristics.

Priority order:
1. Store stand wind preference and access direction.
2. Store hunt start/end times and outcome consistently.
3. Capture weather snapshot with every saved hunt.
4. Normalize deer sightings and camera observations by timestamp and stand/property.
5. Add rut-stage observations.
6. Match current conditions against the hunter's own successful historical hunts.
7. Add confidence based on sample size and evidence quality.
8. Keep exact property locations private by default.
