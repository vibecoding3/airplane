# Paper Nosedive — notes for Claude

Browser game: a paper plane always falls; the player steers left/right to dodge obstacles; score = depth in metres. Three maps: **Paper** (internal id `notebook`), **Deep sea** (`sea`) and **Space** (`space`). README.md is the full game spec — read only the section you need.

## Files
`index.html` (page + menus) · `style.css` · `js/*.js` (16 classic scripts, one shared global scope, run in the order `index.html` lists them; `main.js` last). README section 10 has the file map, a "where to change things" table and key names per file. Grep for a name rather than reading whole files.

## After every change
1. `node tools/test.js` — loads the game in headless Chrome, menus, deep runs on all maps (all obstacle types must appear), normal runs, pause/resume, page errors. Use `node tools/test.js 800` for a faster run (it skips the all-obstacle-types check, which needs 1,500 m+). Update `EXPECTED` in it when adding obstacles.
2. Screenshots only for visual changes: `node tools/shot.js <notebook|sea> <depth…>` or `node tools/shot.js title [sea]` → `tools/out/*.png` (phone size 412×860).
3. Bump the version label in `index.html` (`id="version">vN<`) and "Current version" in README for every pushed change. Keep README in sync with features.
4. Ask the user "Should I push vN to GitHub?" unless their message already says push. Commit as the repo's local git identity (vibecoding3), then confirm GitHub Pages serves the new `vN` (https://vibecoding3.github.io/airplane/, ~1 min).
5. Private claude.ai artifact copy (https://claude.ai/artifact/KJy3ncyQMyFFiAsPLhSYuf): `node tools/bundle.js` → publish `tools/out/paper-nosedive.html` to that URL.

Tools setup (once): `cd tools && npm install`. Chrome is auto-detected (or set `CHROME`).

## Player decisions — don't undo
- Controls: 3 drift positions only (left / straight / right); hold for a sharp turn. A 5-position version was rejected.
- No drop shadows anywhere (removed v29).
- Deep sea has no rock-wall side columns (removed v31) and no sun rays (removed v39). Background fish never collide; new ones are background only unless asked.
- Removed obstacles — avoid similar mechanics: pen wall line, stylus ripple rings, sharpener pull, whiteout patch, thumbtack rows, magnifier homing, coffee spill (soggy), rubber stamp (slam).
- No Shop (removed v46): magnet and shield are power-ups picked up during a run, 3 levels each, reset every run. Stars are a collected total (no metres). No skins: one classic white plane (skins removed v42).
- No plane trail (removed v36). No "How to play" section and no on-screen steering arrows (removed v44).
- No Sky dive / Skyscraper / single-journey map — dropped for good. New maps reuse the 20 mechanics in README section 6 with new art.

## Style
Talk to the user in short, plain language: what changed, what was verified, what wasn't.
