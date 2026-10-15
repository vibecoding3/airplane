# Paper Nosedive — Game Status

Current version: **v32** (2026-10-15)
Live game: https://vibecoding3.github.io/airplane/
Repository: https://github.com/vibecoding3/airplane

---

## 1. Overview

Paper Nosedive is a 2D browser game. A paper airplane is always falling; the player steers it left and right to dodge obstacles and survive as deep as possible. The score is the depth reached, in metres.

- **Files:** `index.html` (the page and menus), `style.css`, and 12 plain script files in `js/` (about 3,400 lines in all). No build step and no dependencies, apart from two Google Fonts (Kalam and Patrick Hand). Opening `index.html` straight from disk works too.
- **Rendering:** HTML canvas 2D, plus a few CSS layers for the background.
- **Runs on:** desktop browsers and phones, in portrait.
- **Hosting:** GitHub Pages serves `index.html` from the `main` branch. Every push to `main` goes live within about a minute.
- **Version label:** the bottom-centre label (for example `v32 · 60 fps`) shows the version and the live frame rate. The version number goes up with every pushed change, so you can confirm a deployment has arrived.

---

## 2. Controls

One scheme for every device. A press can be a tap or click on the left or right half of the screen, or the ← / → keys (A / D):

| Action | Result |
|---|---|
| Press a side once | The drift steps one notch toward that side: left → straight down → right |
| Press the other side | Steps back: from a left drift, one press goes straight, a second press drifts right |
| Hold a side (longer than 0.22 s) | Sharp turn; when released, the plane keeps drifting that way |
| P or Esc | Pause / resume |
| Space or Enter | Start or resume from the menus |

The arrows in the bottom corners show the current drift, and get darker while a side is held.

---

## 3. Core rules

| Rule | Value |
|---|---|
| Depth | 30 world units = 1 metre. The score is the depth reached. |
| Fall speed | `150 + 11 × √depth` units per second. It keeps rising with no cap (about 5 m/s at the start, 17 m/s at 1,000 m, 28 m/s at 4,000 m). |
| Sideways speed | `300 + 0.4 × (fall speed − 150)`, so steering keeps up at depth |
| Sideways slowdown | Gliding sideways at full speed makes the plane fall up to 40% slower |
| Difficulty | `1 − e^(−depth / 600)`. It controls when obstacles unlock, gap sizes, row spacing and obstacle speeds, and is nearly maxed by about 2,000 m. |
| Obstacle rows | Rows spawn ahead of the plane. The same obstacle type never appears twice in a row. |
| Stars | About 28% of rows carry a gold star. Stars are Shop currency only and add nothing to the score. |
| Fast-fall safety | At high speed each frame is split into sub-steps, so the plane can't skip through thin obstacles |
| Best score | Saved per device |

### Plane states
- **Extra life** (Shop upgrade): the plane has a blue outline while a spare life is ready. When a life is used, the plane blinks and can't be hit for 2 seconds.
- **Soggy** (Paper map, coffee spill): for 2.5 seconds the plane falls 25% faster and steers at 60%. It turns the colour of the drink it flew through.
- **Bubbled** (Deep sea map, bubble column): the plane falls 50% slower while inside the column.

---

## 4. Maps

The map is chosen with two picture tiles, **Paper** and **Deep sea**, on the start screen and on the game-over screen (so you can switch between runs). The choice takes effect immediately and is saved per device. In the code the Paper map's id is still `notebook`. Obstacles, background art and background decorations all depend on the map.

### 4.1 Paper
- **Background:** ruled notebook paper with a red margin and punched holes.
- **Page colour:** plain paper for the first 100 m, then pastel red, orange, yellow, green, blue, indigo and violet, changing every 100 m and repeating. A pencilled dashed line labelled "100 m", "200 m"… marks each change.
- **Background decoration:** pencilled maths and science formulas, faded so they read as background.
  - 264 formulas in 6 difficulty levels (levels start at 0, 150, 400, 800, 1,500 and 2,500 m). The topics are arithmetic, fractions and algebra, geometry and trigonometry, calculus, series and linear algebra, statistics and probability, number theory, physics, engineering and astronomy.
  - Four of the easiest entries generate random arithmetic.
  - Each formula appears at most once per run. When a level runs out, it borrows from harder levels first, then easier ones.
  - Formulas are tilted at random, never more than 45°, and some are underlined.

### 4.2 Deep sea
- **Water colour:** light turquoise at the surface, darkening every 100 m down to near-black navy by about 1,000 m, then staying there.
- **Background:** bubbles rising past the plane (no side walls; they were removed in v31). What else you see changes with depth:

| Depth | Background |
|---|---|
| 0–100 m | Sun rays slanting down from the surface with a bright glow at the top. They sway slowly and fade out by 100 m (one CSS layer, no canvas drawing). |
| 100–400 m | Tiny green plankton specks |
| 400–1,000 m | White "marine snow" sinking slowly |
| 1,000 m + | Bioluminescence: twinkling blue and green lights |
| 100–800 m | Now and then, a huge faded whale silhouette gliding far behind the fish |
| 600 m + | Now and then, a faded shipwreck resting in the dark |

  The specks are placed by a hash of the page position, so nothing is stored per speck. Whales and wrecks are kept at least about 30 m apart, so two never share the screen.
- **Readability:** on dark water, the top bar, the steering arrows and the depth markers switch to light colours.
- **Background decoration:** fish instead of formulas. They are faded, never collide with the plane, swim slowly sideways, and get more dangerous with depth:

| Depth | Fish |
|---|---|
| 0–150 m | Clownfish, blue tang, a small school of silver fish |
| 150–400 m | Pufferfish, angelfish, jellyfish |
| 400–800 m | Lionfish, barracuda, moray eel |
| 800–1,500 m | Stingray, swordfish, reef shark |
| 1,500–2,500 m | Great white shark, giant squid |
| 2,500 m + | Anglerfish (with a pulsing glowing lure), viperfish, gulper eel |

The shallow reef fish are drawn 35% larger so they read well on a phone. Deep fish have pale outlines so they show against dark water. About 20% of the time a fish from the level above appears, for variety.

---

## 5. Obstacles

"Starts at" is the depth where an obstacle first joins the pool of possible obstacles. Every obstacle picks a colour variant when it spawns, and obstacles of the same kind in one row share that colour.

### 5.1 Paper map (18 types)

| Obstacle | Behaviour | Starts at |
|---|---|---|
| Rulers | Two rulers from the walls with a gap; deeper down the gap moves side to side | 0 m |
| Ink blots | 1–3 static ink splats | 0 m |
| Pencil | Slides sideways and bounces off the edges | 0 m |
| Protractor | Green half-disc stuck to an edge; deeper down they come in slalom pairs | 0 m |
| Paper wad | Crumpled ball thrown up the page, bouncing off the edges | 0 m |
| Rubber band | Between two tacks. The band bounces the plane sideways (it doesn't crash you); the tacks are deadly | ~30 m |
| Sticky notes | 2–3 notes fluttering down the page | ~35 m |
| Paper clips | A row of clips sliding across the page | ~50 m |
| Set square | 45° or 30/60° triangle spinning while it drifts | ~50 m |
| Glue tube | Sits on an edge and squirts blobs across the page | ~65 m |
| Coffee spill | Doesn't crash you, but makes the plane soggy. Comes in coffee, espresso, tea, cola, matcha or juice | ~65 m |
| Scissors | Spin and snap open and shut while drifting | ~75 m |
| Cutter | Blade shoots out from an edge (22–38% of the width), holds, then slides back | ~100 m |
| Desk fan | Wind band that pushes the plane sideways; the fan itself is deadly | ~120 m |
| Cat paw | A dashed wedge warns where it will strike, then the paw swipes from an edge | ~135 m |
| Erasers | Two erasers from the walls that slide shut and open again | ~150 m |
| Rubber stamp | A darkening spot and a dashed target warn where it will land, then it slams down and leaves a mark ("A+", "B+", "OK!" or "10/10") | ~150 m |
| Drawing compass | Spins its leg in a circle, pencilling the arc as it goes | ~215 m |

The extra hazard next to desk fans and below coffee spills deeper down is a small ink blot.

### 5.2 Deep sea map (12 types)
Eight sea obstacles reuse the movement and collision of a notebook obstacle with new art (see `SEA_MAKERS` in the code). Four are new mechanics.

| Sea obstacle | Behaviour | Based on | Starts at |
|---|---|---|---|
| Coral ledges | Coral from both walls with a gap | Rulers | 0 m |
| Sea urchins | Static spiky balls | Ink blots | 0 m |
| Jellyfish | Pulsing jellyfish drifting down the water | Sticky notes | 0 m |
| Starfish | Spins while drifting, bouncing off the screen edges | New | 0 m |
| Air bubble column | Slows the fall while inside and never hurts | New | 0 m |
| Naval mine | On a chain. When the plane approaches it blinks and shows a dashed blast circle, then explodes so the blast lands as the plane arrives | New | ~50 m |
| Moray eel | Lunges out of a hole in the rock wall | Cutter | ~65 m |
| Ocean current | Moving water pushes the plane sideways (no body to hit) | Desk fan | ~75 m |
| Giant clam | Two shell lips that snap shut and open | Erasers | ~100 m |
| Submarine | Fires torpedoes across; its bow light blinks just before | Glue tube | ~100 m |
| Electric eel | Charges with a dashed preview line, then zaps a lightning bolt across | New | ~135 m |
| Kelp | Seaweed frond sweeps out from the wall after a green dashed warning | Cat paw | ~135 m |

### 5.3 Removed obstacles (history)
These were built and then removed at the player's request: the pen (drew a wall line from the side), the stylus (expanding ripple rings), the pencil sharpener (pulled the plane), the whiteout patch (hid hazards), thumbtack rows, and the magnifying glass (its sun spot chased the plane). Avoid these kinds of mechanics in future obstacles.

---

## 6. Generalized obstacles

Every obstacle in the game is one of the **20 mechanics** below, dressed in a map's art. A mechanic defines how something moves, what hurts, how it warns the player, and what can be tuned. A map's obstacle is just *mechanic + look*. The goal is to build new maps (Sky dive, Skyscraper and later ones) by reusing these mechanics with new drawings, instead of writing new movement and collision code each time.

In the code, the mechanic lives in the generator (`make.<name>`), the movement (`updateObstacle`) and the collision (`computeShapes`). The look lives in the `draw*` / `paint*` functions. The Deep sea map already works this way: `SEA_MAKERS` maps each sea obstacle to the notebook generator whose mechanic it reuses.

### 6.1 Mechanic catalogue

| # | Mechanic | How it works | Warning | What hurts | Paper | Deep sea |
|---|---|---|---|---|---|---|
| 1 | **Gap Wall** | Two barriers from both walls leaving one gap; deeper down the gap slides side to side | The gap is visible | Both barriers | Rulers | Coral ledges |
| 2 | **Closing Jaws** | Two blocks from both walls whose gap keeps opening and closing | The rhythm is visible | Both blocks | Erasers | Giant clam |
| 3 | **Static Hazards** | 1–3 round hazards that don't move | — | The hazards | Ink blots | Sea urchins |
| 4 | **Wall Bulge** | A large half-disc stuck to one wall; deeper down a pair on opposite walls forms a slalom | — | The bulge | Protractor | — |
| 5 | **Bouncing Slider** | A long bar sliding sideways and bouncing off the walls | — | The bar | Pencil | — |
| 6 | **Rising Projectile** | Thrown up the screen toward the plane, bouncing off the walls | — | The projectile | Paper wad | — |
| 7 | **Drifting Swarm** | 2–3 items sinking slower than the plane while swaying side to side | — | Each item | Sticky notes | Jellyfish |
| 8 | **Conveyor** | A row of evenly spaced pieces sliding across the screen | The gaps move with the row | Each piece | Paper clips | — |
| 9 | **Spinning Drifter** | One shape spinning while it drifts sideways and bounces off the walls | — | The shape (triangle or circle) | Set square | Starfish |
| 10 | **Spinning Blades** | Two blades spinning around a pivot while opening and closing, drifting slowly | — | Blades and handles | Scissors | — |
| 11 | **Sweeping Arm** | An arm rotating all the way around a fixed pivot | The arc it traces | Arm and pivot | Drawing compass | — |
| 12 | **Wall Piston** | Shoots out from a wall, holds, then retracts on a loop | The body at the wall | Base and extended part | Cutter | Moray eel |
| 13 | **Wall Turret** | Mounted on a wall, fires projectiles straight across on a timer | Bow or nozzle cue before firing (sea version) | Base and projectiles | Glue tube | Submarine |
| 14 | **Charged Beam** | On a wall; charges, then a beam crosses part of the screen for a moment | Dashed preview line while charging | Base and beam | — | Electric eel |
| 15 | **Telegraphed Sweep** | A dashed wedge shows the danger area, then an arm swipes through it in an arc from a wall | Dashed wedge | The arm and its tip, only mid-swipe | Cat paw | Kelp |
| 16 | **Telegraphed Slam** | A target appears at a spot, then something slams down there, lifts, and moves to a new spot | Darkening spot and dashed target | Only the moment it is down | Rubber stamp | — |
| 17 | **Proximity Blast** | Sits still; when the plane gets close it arms, shows its blast radius, then explodes as the plane arrives | Fast blinking and a dashed blast circle | The body, then the blast | — | Naval mine |
| 18 | **Push Zone** | A horizontal band that pushes the plane sideways while inside it; may have a solid source on the wall | Moving streaks | Only the source, if there is one | Desk fan (fan is solid) | Ocean current (no source) |
| 19 | **Effect Zone** | A zone that never hurts but changes the plane for a while: a debuff or a buff | The zone itself | Nothing (can be paired with a hazard placed after it) | Coffee spill (falls faster, steers worse) | Bubble column (falls slower) |
| 20 | **Spring Line** | A line between two anchors; touching the line kicks the plane sideways instead of crashing it | — | Only the anchors | Rubber band | — |

### 6.2 Tunable parameters

Every mechanic is already tuned by depth through `difficulty()`. The knobs each map can change:

- **Size and spacing:** gap width, hazard radius, bar length, number of pieces, distance between pieces.
- **Speed and timing:** drift, spin and slide speed, turret fire rate and projectile speed, piston cycle length, sweep and slam warning time, mine trigger distance.
- **Reach:** piston and beam length, sweep radius, blast radius, push strength and band height.
- **Unlock depth:** when the mechanic joins that map's obstacle pool, and how often it is picked.

### 6.3 Reuse ideas for the planned sections

| Mechanic | Sky dive (0–1,000 m) | Skyscraper (1,000–2,000 m) |
|---|---|---|
| Gap Wall | Cloud banks from both sides | Balconies or scaffolding from both sides |
| Closing Jaws | Two storm clouds drifting together and apart | Sliding window shutters or elevator doors |
| Static Hazards | Hailstones or floating balloons | Flower pots or bricks on ledges |
| Wall Bulge | A thundercloud bulging from the edge | An AC unit or a rounded balcony |
| Bouncing Slider | A glider or small plane crossing | A window-washer platform sliding along |
| Rising Projectile | A firework rocket or a loose balloon rising | A pigeon flying up |
| Drifting Swarm | Falling leaves or paper lanterns | Falling laundry or loose papers |
| Conveyor | Geese flying across in a line | Cable-car cabins on a wire |
| Spinning Drifter | A spinning maple seed | A tumbling frisbee or hubcap |
| Spinning Blades | A helicopter rotor | A rooftop ventilation turbine |
| Sweeping Arm | A windmill blade | A construction crane boom |
| Wall Piston | — (no walls; could become a drone that darts in) | An extending window-washer ladder or flagpole |
| Wall Turret | A cloud spitting hail sideways | A sprinkler or water jet from a window |
| Charged Beam | Lightning arcing between two clouds | A security laser or welding spark |
| Telegraphed Sweep | A kite tail swinging | A swinging sign or crane hook |
| Telegraphed Slam | A lightning strike on a marked spot | A falling flower pot with its landing spot marked |
| Proximity Blast | A firework that bursts as you pass | A sparking neon sign that shorts out |
| Push Zone | A wind gust | An AC exhaust or air vent blast |
| Effect Zone | Warm updraft (falls slower) or rain cloud (soggy) | Steam vent (falls slower) or a paint spill (debuff) |
| Spring Line | A kite string or power line | A shop awning that bounces you |

Sky dive has no walls at its edges, so wall-based mechanics there need a floating source on the side (a cloud, a balloon basket) or a different mechanic.

## 7. Shop and progression

- **Star bank:** stars caught in a run are added to a saved bank when the run ends. The top bar shows the total during a run (bank plus stars caught so far).
- **Upgrades** (bought one level at a time):

| Upgrade | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| Extra life | 1 spare life per run — ★ 20 | 2 spare lives — ★ 40 | 3 spare lives — ★ 70 |
| Star magnet (pull range) | 120 units — ★ 10 | 180 units — ★ 25 | 240 units — ★ 45 |

- **Trails:** Pencil (free, default), Ink ★ 5, Dots ★ 5, Crayon ★ 10, Rainbow ★ 15, Sparkles ★ 20. Bought once, then switched with "Use".
- **Skins** (all free for now): Classic, Notebook, Newspaper, Kraft, Origami red, Banknote, Gold foil, Stealth. The trail, the crumpled ball and the paper scraps follow the skin colour.

---

## 8. Settings

| Setting | Where | Notes |
|---|---|---|
| Sound on/off | Top bar (speaker icon, crossed out when muted) | Sound effects are generated in code (Web Audio) |
| Pause / Resume | Top bar (pause icon, becomes a play icon while paused), P, Esc | Also pauses automatically when the tab is hidden |
| Limit to 60 fps | Start screen | Keeps a steady 60 fps on 90, 120 and 144 Hz screens to save battery and heat |
| Map | Start and game-over screens | Paper / Deep sea picture tiles |

### Saved data (browser localStorage)
`nosedive-best`, `nosedive-bank`, `nosedive-upgrades` (upgrade levels and owned trails), `nosedive-skin`, `nosedive-trail`, `nosedive-map`, `nosedive-muted`, `nosedive-cap60`, `nosedive-res` (remembered render resolution). All of them are per browser and per device.

---

## 9. Performance and optimizations

| Optimization | What it does |
|---|---|
| Sprite cache | Rigid obstacle parts, fish, stars and plane-independent art are painted once into offscreen canvases at screen resolution (`sharedSprite` / `ownSprite`) and then copied each frame, rotated, flipped, stretched or cropped as needed. The cache is rebuilt on resize and when fonts finish loading. |
| No drop shadows | The game has no drop shadows (removed in v29), which saves a draw per obstacle each frame. The rubber stamp keeps its darkening landing spot because that is its warning. |
| Background as browser layers | The page colour, ruled lines, margin and holes (or the rising bubbles and the sea's sun rays) are CSS layers behind a transparent canvas. The compositor slides them into place each frame, so the canvas only draws formulas, fish, markers, obstacles and the plane. Screen shake moves the whole playfield with one CSS transform. |
| No per-frame gradients | Scissor blades, glows and blasts use pre-painted sprites instead of creating gradients every frame |
| Fewer large see-through fills | The desk fan's wind band tint was removed, and the cat paw and kelp warnings are dashed outlines |
| Less garbage collection | Lists are pruned in place, and the plane's hit circles, trail points and static collision shapes are reused. The top bar only touches the page when a number changes. |
| Adaptive resolution | Render resolution goes up to 2×. Screens denser than 2.5× start at 1.5×. If play stays below about 48 fps for 1.5 s, the resolution steps down by 0.25 (never below 1×) and is remembered. |
| Frame pacing | Gameplay runs at the display rate (or 60 fps with the option on); menus draw at 30 fps and the pause screen at 4 fps |
| Text drawn directly | Measurements showed formula text is cheap to draw directly (the browser caches glyphs), so it isn't cached |

### Measurement notes
- On the development PC every version runs well above 60 fps, even with CPU throttled 6× to phone level. Phone performance depends mostly on the graphics chip, which headless testing can't reproduce.
- Use the fps reading in the version label on a real phone to judge performance.

---

## 10. Code map

Since v32 the game is split into files. The scripts are ordinary `<script src>` files (not ES modules), so they share one global scope and run in the order `index.html` lists them. Each file only uses names from earlier files while it loads; anything else is used later, once the game is running. `main.js` loads last and starts the game.

| File | What it holds |
|---|---|
| `index.html` | The page: playfield layers, HUD, menu cards (title, skins, shop, pause, game over) |
| `style.css` | All styling, including the paper / sea / sun-ray background layers |
| `js/core.js` | Constants, helpers, saved settings (`store`), screen sizing, sprite cache |
| `js/audio.js` | Sound effects (Web Audio, no sound files) |
| `js/paper-background.js` | Pencil formulas by depth tier |
| `js/sea-background.js` | Background fish, specks, whale and shipwreck silhouettes |
| `js/state.js` | Game state, upgrade and trail data, controls, speed and difficulty rules, `reset` |
| `js/obstacles.js` | Obstacle palettes, the `make` generators, sea obstacle pool, row spawning |
| `js/physics.js` | Collision shapes, obstacle movement, steering, the per-frame `update`, crashes |
| `js/draw-paper.js` | Page colours, `MAPS`, paper background drawing, Paper obstacle art |
| `js/draw-sea.js` | Deep sea obstacle art |
| `js/render.js` | Plane, skins, trails, screen shake, `render`, map switching |
| `js/ui.js` | HUD, menu cards, start / pause / game over, skin picker, shop |
| `js/main.js` | Keyboard and touch input, frame pacing, main loop (loaded last) |

Key names by area:


| Area | Key names |
|---|---|
| Constants and helpers | `W` (playfield width 400), `PX_PER_M`, `COL`, `rand`, `clamp`, `lerp`, `prune`, `store` |
| Canvas and resolution | `resize`, `dprCap`, `watchFrameRate` |
| Sprite cache | `makeSprite`, `sharedSprite`, `ownSprite`, `blit`, `invalidateSprites` |
| Background | `syncPaperLayers`, `drawPaper`, `drawFormulas`, `drawFishes`, `drawDepthMarkers`, `MAPS`, `SEA`, `RAINBOW` |
| Formulas and fish | `FORMULA_TIERS`, `pickFormula`, `spawnFormula`, `FISH`, `FISH_TIERS`, `spawnFish`, `updateFormulas` |
| Obstacles | `make` (generators), `seaPool`, `SEA_MAKERS`, `spawnRow`, `spawnFromPool`, `computeShapes` / `shapes` (collision), `updateObstacle`, `draw*` / `paint*` functions |
| Collision | `circleHits` (circles, rotated boxes, convex polygons), `planeCircles` |
| Game loop | `update`, `steer`, `render`, `frame`, `frameInterval` |
| Shop and UI | `UPGRADES`, `TRAILS`, `SKINS`, `renderShop`, `buyUpgrade`, `chooseTrail`, `showCard`, `updateHud` |

---

## 11. Direction

**Current focus (since v30): two maps, Paper and Deep sea,** each chosen from the menu.

**On hold: one continuous map.** An earlier plan is paused, not cancelled:

1. **Sky dive**, from 0 to 1,000 m: open sky going from space to blue to sunset to fields, with clouds and planes in the background and floating obstacles.
2. **Skyscraper**, from 1,000 to 2,000 m: falling down a city tower from day to night, with obstacles sticking out from the building sides.
3. **Deep sea**, from 2,000 m onward with no end: the existing sea map. Its look, fish and obstacle unlocks start again from the sea's own 0 m (clear water), while the depth counter, fall speed and difficulty keep following the total depth.

In that plan the Paper map would be removed. Any new map or section should be built from the mechanics in section 6, with new art. Section 6.3 lists a starting idea for each mechanic.
