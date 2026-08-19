# Backwoods V6 Recommendation Engine

## Product question
Where should I hunt today?

## Output
The engine returns a ranked list of mapped stands, an explainable score from 0–100, supporting reasons, factor points, and a confidence indicator.

## Current inputs
- Recorded hunts linked to a stand
- Deer sightings linked to a stand
- Camera coverage linked to a stand
- Target-location flag
- Stand notes
- Stored current weather when available

## Scoring principles
- Start from a neutral baseline.
- Reward repeated, directly recorded evidence.
- Keep the score bounded to 0–100.
- Never represent the score as a guaranteed deer-movement prediction.
- Show the reasons behind every recommendation.
- Confidence must remain conservative when the dataset is sparse.

## Planned inputs
1. Wind direction and speed
2. Stand wind preferences
3. Access-route impact
4. Historical weather matched to hunt outcomes
5. Time-of-day success
6. Deer movement observations
7. Camera activity trends
8. Rut observations
9. Target-buck history
10. Terrain and elevation context

## Future model
The deterministic scoring layer should remain available as an explainable baseline even after statistical/ML models are introduced. Any advanced model should be compared against this baseline and should expose uncertainty rather than fabricate precision.
