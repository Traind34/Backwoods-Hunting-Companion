# Backwoods Planner Co.

Backwoods Planner Co. hunting-property planning app.

## Current test build

The current working build is **V5.4**. It includes:

- Full-screen interactive property map
- Road, Topographic, and Satellite layers
- Pennsylvania parcel layer with tap-to-select
- Orange selected/saved parcel boundaries
- My Property persistence and Home-page property summary
- Add menu for Stand, Camera, Bedding, Food, Water, Scrape, Rub, Access Point, Parking, and Danger
- Center-pin placement workflow for hunting locations
- Property-boundary drawing
- Access-route drawing
- GPS location

## Deployment target

This repository is intended to be deployed with Vercel using the GitHub repository as the source. Vercel's Git integration can automatically deploy pushes and provide preview deployments for branches/PRs.

## Important

The current V5.4 build is a static HTML/CSS/JavaScript application. No Node/Next.js conversion is required for the current testing stage. Keep the existing `index.html`, `backwoods-brand.png`, and any PWA files together at the repository root.

The map uses external public map services, so the deployed site must be served over HTTPS for browser geolocation and related browser features.

## Deployment flow

1. Upload the contents of the current V5.4 package to this repository's `main` branch.
2. In Vercel, choose **Add New Project → Import Git Repository** and select `Traind34/Backwoods-Hunting-Companion`.
3. Leave the root directory as `/`.
4. For this static build, use no build command and publish the repository root as the output.
5. Deploy.
6. Test the production URL before making further feature changes.

Use feature branches for future changes so Vercel can create preview deployments before changes reach `main`.
