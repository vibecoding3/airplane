# Paper Nosedive — notes for Claude

Browser game: a paper plane always falls; the player steers left/right to dodge obstacles; score = depth in metres. Seven maps: **Paper** (internal id `notebook`), **Ocean** (`sea`, called Deep sea until v78), **Space** (`space`), **Dungeon** (`dungeon`), **Neon City** (`city`, v113: falls through the city's layers, rooftops to data core — not a Skyscraper map) **Forest** (`forest`, v114: falls through the seasons, spring to night; nature only, no Dungeon-style magic) and **Desert** (`desert`, v120: falls through the rock layers, dunes to amber; no quicksand pull, no sandworm). README.md is the full game spec — read only the section you need.

## Files
`index.html` (page + menus) · `style.css` · `js/*.js` (25 classic scripts, one shared global scope, run in the order `index.html` lists them; `main.js` last). README section 10 has the file map, a "where to change things" table and key names per file. Grep for a name rather than reading whole files.

## After every change
1. `node tools/test.js` — loads the game in headless Chrome, menus, deep runs on all maps (all obstacle types must appear), normal runs, pause/resume, page errors. Use `node tools/test.js 800` for a faster run (it skips the all-obstacle-types check, which needs 1,500 m+). Update `EXPECTED` in it when adding obstacles.
2. Screenshots only for visual changes: `node tools/shot.js <notebook|sea|space|dungeon|city|forest|desert> <depth…>` or `node tools/shot.js title [map]` → `tools/out/*.png` (phone size 412×860).
3. Bump the version label in `index.html` (`id="version">vN<`) and "Current version" in README for every pushed change. Keep README in sync with features.
4. Push every change to GitHub without asking (user's standing instruction, 2026-10-18). Commit as the repo's local git identity (vibecoding3), then confirm GitHub Pages serves the new `vN` (https://vibecoding3.github.io/airplane/, ~1 min).
5. Don't update the private claude.ai artifact copy (https://claude.ai/artifact/KJy3ncyQMyFFiAsPLhSYuf) anymore (user's decision, 2026-10-20; last updated at v119). `tools/bundle.js` still works if it's ever asked for.

Tools setup (once): `cd tools && npm install`. Chrome is auto-detected (or set `CHROME`).

## Android app (`app/`, since v112)
Capacitor 8 wrapper around the game in the repo root; README section 18 has the setup. `node app/build.js` copies the game into `app/www` and builds the debug APK; `--install` puts it on the USB-connected phone. Rebuild it after game changes when the user is testing on the phone. App-only code goes in `app/native.js`, never in `js/`. `app/www` is generated: never edit it. The app ID `io.github.vibecoding3.papernosedive` is permanent.

## Player decisions — don't undo
- Controls: 3 drift positions only (left / straight / right); hold for a sharp turn. A 5-position version was rejected.
- No drop shadows anywhere (removed v29).
- Ocean has no rock-wall side columns (removed v31) and no sun rays (removed v39). Background fish never collide; new ones are background only unless asked.
- Removed obstacles — avoid similar mechanics: pen wall line, stylus ripple rings, sharpener pull, whiteout patch, thumbtack rows, magnifier homing, coffee spill (soggy), rubber stamp (slam).
- No Shop (removed v46): magnet and shield are power-ups picked up during a run, 3 levels each, reset every run; slow motion (4 s at half speed, from 300 m), the invincibility star (6 s, from 150 m, rarest) and the speed boost (+10% fall speed for 5 s, from 100 m, v69) are timed power-ups. The Squid (v109) is a debuff pickup asked for by the player: ink splats below the plane for 3 s, all maps, from 200 m; the star flies through it, nothing pulls it in. It is the one allowed exception to "avoid hiding hazards" (whiteout patch). Stars are a collected total (no metres). No skins: one classic white plane (skins removed v42).
- No wind obstacles (desk fan, ocean current) from 700 m on; Space has no wind or explosion obstacles at all (v55).
- Top fall speed is capped at the 600 m value (14.0 m/s, v55).
- No "Crumpled!" heading on the game-over screen (removed v84): players know they crashed; the card starts with the distance.
- No plane trail (removed v36). No "How to play" section and no on-screen steering arrows (removed v44). Exception asked for in v91: short control tips in the top bar, left of the sound button, for the first 200 m of a run only (100 m until v117). No pause button in the top bar (removed v118): pause is Space / Esc, the app's Back button, or automatic when the tab or window loses focus.
- Collectibles are obstacles with a specific variant which only appear once per run. When all collectibles of an obstacle have appeared, the obstacle still appears with the regular variants (rings become skulls, pumpkins, slimes or potions; planets become moon edges; staffs leave the slider's regular looks). New collection sets must follow this.
- Map selection is only on the main menu (decided v119): no map tiles on the game-over screen.
- Daily quests are on hold (decided 2026-10-19): don't build or start the quest system until the player asks; README section 16 keeps the ideas.
- No Sky dive / Skyscraper / single-journey map — dropped for good. New maps reuse the 20 mechanics in README section 6 with new art.
- Original designs only (decided 2026-10-19, v111, for the Google Play release): no names, characters or recognizable designs from anime, films, games or other brands. The former Frieren and Rings of Power sets are now "Mage staffs" and "Enchanted rings". Never change a collection item's save id (e.g. `staff-frieren`): players' found items are stored under it.

## Style
Talk to the user in short, plain language: what changed, what was verified, what wasn't.
