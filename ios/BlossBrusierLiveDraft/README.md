# Bloss Brusier Live Draft Companion

Native iPhone companion for the Bloss Brusier fantasy football draft.

## Goal
Keep ESPN Fantasy open while a Live Activity in the Dynamic Island shows the current draft recommendation.

## Architecture
- SwiftUI iOS app
- ActivityKit Live Activity
- URLSession polling to the existing Backwoods draft API
- Keychain for any user-provided league configuration
- No ESPN password or session cookie is stored by the project

## Important
A native iOS app must be signed and installed through Xcode/TestFlight/App Store distribution. Vercel hosts the web/API side but cannot install a signed iOS app on an iPhone.

Apple documents that ActivityKit Live Activities can display current data in the Dynamic Island and Lock Screen. See https://developer.apple.com/documentation/activitykit/.
