# Paper Nosedive — Game Status

Current version: **v29** (2026-10-15)
Live game: https://vibecoding3.github.io/airplane/
Repository: https://github.com/vibecoding3/airplane

---

## 1. Overview

Paper Nosedive is a 2D browser game. A paper airplane is always falling; the player steers it left and right to dodge obstacles and survive as deep as possible. The score is the depth reached, in metres.

- **Single file:** the whole game is `index.html` (about 3,400 lines of HTML, CSS and JavaScript). No build step and no dependencies, apart from two Google Fonts (Kalam and Patrick Hand).
- **Rendering:** HTML canvas 2D, plus a few CSS layers for the background.
- **Runs on:** desktop browsers and phones, in portrait.
- **Hosting:** GitHub Pages serves `index.html` from the `main` branch. Every push to `main` goes live within about a minute.
- **Version label:** the bottom-centre label (for example `v29 · 60 fps`) shows the version and the live frame rate. The version number goes up with every pushed change, so you can confirm a deployment has arrived.

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
- **Soggy** (Notebook map, coffee spill): for 2.5 seconds the plane falls 25% faster and steers at 60%. It turns the colour of the drink it flew through.
- **Bubbled** (Deep sea map, bubble column): the plane falls 50% slower while inside the column.

---

## 4. Maps

The map is chosen on the start screen (Map: Notebook / Deep sea) and saved per device. Obstacles, background art and background decorations all depend on the map.

### 4.1 Notebook
- **Background:** ruled notebook paper with a red margin and punched holes.
- **Page colour:** plain paper for the first 100 m, then pastel red, orange, yellow, green, blue, indigo and violet, changing every 100 m and repeating. A pencilled dashed line labelled "100 m", "200 m"… marks each change.
- **Background decoration:** pencilled maths and science formulas, faded so they read as background.
  - 264 formulas in 6 difficulty levels (levels start at 0, 150, 400, 800, 1,500 and 2,500 m). The topics are arithmetic, fractions and algebra, geometry and trigonometry, calculus, series and linear algebra, statistics and probability, number theory, physics, engineering and astronomy.
  - Four of the easiest entries generate random arithmetic.
  - Each formula appears at most once per run. When a level runs out, it borrows from harder levels first, then easier ones.
  - Formulas are tilted at random, never more than 45°, and some are underlined.

### 4.2 Deep sea
- **Water colour:** light turquoise at the surface, darkening every 100 m down to near-black navy by about 1,000 m, then staying there.
- **Background:** bubbles rising past the plane, and dark rock walls down both sides like an underwater trench.
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

### 5.1 Notebook map (18 types)

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
| Starfish | Spins while drifting, bouncing off the rock walls | New | 0 m |
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

## 6. Shop and progression

- **Star bank:** stars caught in a run are added to a saved bank when the run ends. The top bar shows the total during a run (bank plus stars caught so far).
- **Upgrades** (bought one level at a time):

| Upgrade | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| Extra life | 1 spare life per run — ★ 20 | 2 spare lives — ★ 40 | 3 spare lives — ★ 70 |
| Star magnet (pull range) | 120 units — ★ 10 | 180 units — ★ 25 | 240 units — ★ 45 |

- **Trails:** Pencil (free, default), Ink ★ 5, Dots ★ 5, Crayon ★ 10, Rainbow ★ 15, Sparkles ★ 20. Bought once, then switched with "Use".
- **Skins** (all free for now): Classic, Notebook, Newspaper, Kraft, Origami red, Banknote, Gold foil, Stealth. The trail, the crumpled ball and the paper scraps follow the skin colour.

---

## 7. Settings

| Setting | Where | Notes |
|---|---|---|
| Sound on/off | Top bar | Sound effects are generated in code (Web Audio) |
| Pause / Resume | Top bar, P, Esc | Also pauses automatically when the tab is hidden |
| Limit to 60 fps | Start screen | Keeps a steady 60 fps on 90, 120 and 144 Hz screens to save battery and heat |
| Map | Start screen | Notebook / Deep sea |

### Saved data (browser localStorage)
`nosedive-best`, `nosedive-bank`, `nosedive-upgrades` (upgrade levels and owned trails), `nosedive-skin`, `nosedive-trail`, `nosedive-map`, `nosedive-muted`, `nosedive-cap60`, `nosedive-res` (remembered render resolution). All of them are per browser and per device.

---

## 8. Performance and optimizations

| Optimization | What it does |
|---|---|
| Sprite cache | Rigid obstacle parts, fish, stars and plane-independent art are painted once into offscreen canvases at screen resolution (`sharedSprite` / `ownSprite`) and then copied each frame, rotated, flipped, stretched or cropped as needed. The cache is rebuilt on resize and when fonts finish loading. |
| No drop shadows | The game has no drop shadows (removed in v29), which saves a draw per obstacle each frame. The rubber stamp keeps its darkening landing spot because that is its warning. |
| Background as browser layers | The page colour, ruled lines, margin and holes (or bubbles and rock walls) are CSS layers behind a transparent canvas. The compositor slides them into place each frame, so the canvas only draws formulas, fish, markers, obstacles and the plane. Screen shake moves the whole playfield with one CSS transform. |
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

## 9. Code map (`index.html`)

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

## 10. Planned next: one continuous map

Agreed plan for the next version:

1. **Sky dive**, from 0 to 1,000 m: open sky going from space to blue to sunset to fields, with clouds and planes in the background and floating obstacles.
2. **Skyscraper**, from 1,000 to 2,000 m: falling down a city tower from day to night, with obstacles sticking out from the building sides.
3. **Deep sea**, from 2,000 m onward with no end: the existing sea map. Its look, fish and obstacle unlocks start again from the sea's own 0 m (clear water), while the depth counter, fall speed and difficulty keep following the total depth.

The Notebook map and the start-screen map selector will be deleted completely. The movement code that the sea obstacles reuse from notebook obstacles stays.
