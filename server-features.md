# Server features: is now the time?

*Written 2026-10-20, at v126. Player data is currently stored only on the device, in the browser's `localStorage` (see README section 13 and `store` in `js/core.js`).*

**Short answer:** not yet for your own server. There's one thing worth doing first, plus a cheaper middle path for when you want online features.

## Why wait
- **Nothing needs a server yet.** Right now a server would only protect saves and let them sync across devices. Those matter once you have players who would be upset to lose progress, and you don't have them yet.
- **The game is still changing fast.** You're adding maps, collections and rules almost daily. A server ties you to a save format and to keeping old versions working, which slows that down.
- **A server brings ongoing costs:**
  - Hosting, and keeping it running.
  - Accounts or player ids.
  - Cheat checks if you add leaderboards.
  - A privacy policy, and Google Play's "Data safety" form, as soon as you collect any player data.

## What to do now instead (small, no server)
- **Merge the save into one versioned record.** Today it's about 15 separate keys. One record with a version number would be much easier to sync or migrate later, and you're less likely to lose progress when you change things.
- **Optionally, add an export / import code** in settings, so a player can move progress to a new phone by hand. It's cheap and covers the worst case of losing everything.

## The middle path: Google Play Games Services
When you do want online features, consider Google Play Games Services before building your own server. For the Android app it gives you leaderboards, achievements and cloud saves tied to the player's Google account, for free. It has no backend for you to run and no accounts to build. The downside is that it only works in the Android app, not on the website.

## When a custom server becomes worth it
A custom server becomes worth it if you want things Play Games can't do, for example:
- Progress shared between the website and the app.
- Daily quests or events you control from the server (daily quests are on hold, decided 2026-10-19).
- Friends, or your own anti-cheat.

## Suggested order
1. Single versioned save now, and perhaps the export code.
2. Google Play Games Services around the Google Play release, if you want leaderboards.
3. A custom server only once there's a specific feature that needs it.
