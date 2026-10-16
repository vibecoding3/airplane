# Paper Nosedive — Game Status

Current version: **v56** (2026-10-15)
Live game: https://vibecoding3.github.io/airplane/
Repository: https://github.com/vibecoding3/airplane

---

## 1. Overview

Paper Nosedive is a 2D browser game. A paper airplane is always falling; the player steers it left and right to dodge obstacles and survive as deep as possible. The score is the depth reached, in metres.

- **Files:** `index.html`, `style.css` and 16 plain script files in `js/` (about 3,400 lines in all). No build step and no dependencies, apart from two Google Fonts (Kalam and Patrick Hand). See section 10 for the file structure.
- **Start menu:** a regular game menu (big title, best score and star count, map tiles and Play; the "How to play" section was removed in v44) over an illustrated sky full of paper airplanes (`img/menu-bg.svg`). It is not tied to either map; the game itself is not drawn behind it. The pause and game-over screens use the same menu style over the dimmed game: game over shows the depth in big numbers, a "New best!" badge, the best depth, the stars caught this run and the star total, the map tiles and Play again (the run time was removed in v45). There is no Shop (removed in v46).
- **Rendering:** HTML canvas 2D, plus a few CSS layers for the background.
- **Runs on:** desktop browsers and phones, in portrait.
- **Hosting:** GitHub Pages serves the repository root of the `main` branch. Every push to `main` goes live within about a minute.
- **Version label:** the bottom-centre label (for example `v56 · 60 fps`) shows the version and the live frame rate. The version number goes up with every pushed change, so you can confirm a deployment has arrived.

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

There are no on-screen steering arrows (removed in v44).

---

## 3. Core rules

| Rule | Value |
|---|---|
| Depth | 30 world units = 1 metre. The score is the depth reached. |
| Fall speed | `150 + 11 × √depth` units per second, rising until 600 m and then capped at that speed (since v55; before it was capped at the 800 m speed, 15.4 m/s): about 5 m/s at the start, 10 m/s at 200 m and 14.0 m/s from 600 m on. Sideways speed is capped with it. Difficulty (gaps, spacing, obstacle speeds) still keeps rising after that |
| Sideways speed | `300 + 0.4 × (fall speed − 150)`, so steering keeps up at depth |
| Sideways slowdown | Gliding sideways at full speed makes the plane fall up to 40% slower |
| Difficulty | `1 − e^(−depth / 600)`. It controls when obstacles unlock, gap sizes, row spacing and obstacle speeds, and is nearly maxed by about 2,000 m. |
| Obstacle rows | Rows spawn ahead of the plane. The same obstacle type never appears twice in a row. |
| Pickup pull | Since v51, any star or power-up that comes within 60 units (2 m) of the plane is pulled in, so near misses still count. The magnet power-up extends this for stars and (since v54) power-ups |
| Stars | About 28% of rows carry a gold star. Stars are a collected total (shown in the menu and top bar) and add nothing to the score. |
| Fast-fall safety | At high speed each frame is split into sub-steps, so the plane can't skip through thin obstacles |
| Best score | Saved per device and per map (since v49; the old single best went to Paper). During a run, a gold dashed line labelled "Your best · N m" marks the record depth, so you can see it coming; passing it pops "New best!" with a short fanfare |
| Medals | Each map has bronze / silver / gold medals for reaching 250 / 750 / 1,500 m. They show as three coins on the map tiles (start and game-over screens), lit once earned. The first time a run reaches a medal depth on that map, "Bronze medal!" (or Silver / Gold) pops up with a fanfare |
| Milestones | Every 100 m: "100 m!" pops up, the screen flashes white for a moment, the depth counter bounces and a two-note chime plays. Every 500 m it is bigger: a gold flash, a larger gold "500 m!", a burst of coloured sparks, a bigger bounce and a four-note arpeggio. Flashes and bounces are skipped when the device asks for reduced motion |

### Plane states
- **Shielded** (shield power-up): the plane has a blue outline while it has at least one shield level, and its look shows the level: pale thin sky blue (1), bright blue (2), deep blue with a soft glow (3). A hit uses one level instead of ending the run: the plane blinks and can't be hit for 2 seconds.
- **Magnet** (magnet power-up): a dotted ring shows how far stars and power-ups are pulled in. Since v56 the ring is a shade of the map colour behind the plane (darker on light pages and shallow water, lighter on deep water and space), so it matches every map.
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
| 0–100 m | Clear water: only the fish and bubbles (the sun rays were removed in v39) |
| 100–400 m | Tiny green plankton specks |
| 400–1,000 m | White "marine snow" sinking slowly |
| 1,000 m + | Bioluminescence: twinkling blue and green lights |
| 100–800 m | Now and then, a huge faded whale silhouette gliding far behind the fish |
| 600 m + | Now and then, a faded shipwreck resting in the dark |

  The specks are placed by a hash of the page position, so nothing is stored per speck. Whales and wrecks are kept at least about 30 m apart, so two never share the screen.
- **Readability:** on dark water, the top bar and the depth markers switch to light colours.
- **Background decoration:** fish instead of formulas. They are faded, never collide with the plane, swim slowly sideways, and get more dangerous with depth:

| Depth | Fish |
|---|---|
| 0–150 m | Clownfish, tang, a small school of fish, butterflyfish, seahorse |
| 150–400 m | Pufferfish, angelfish, jellyfish, parrotfish, sea turtle |
| 400–800 m | Lionfish, barracuda, moray eel, octopus, tuna |
| 800–1,500 m | Stingray, swordfish, reef shark, hammerhead shark, ocean sunfish |
| 1,500–2,500 m | Great white shark, giant squid, oarfish |
| 2,500 m + | Anglerfish (with a pulsing glowing lure), viperfish, gulper eel, lanternfish, hatchetfish |

The shallow reef fish are drawn 35% larger so they read well on a phone. Deep fish have pale outlines so they show against dark water. About 20% of the time a fish from the level above appears, for variety.

**Colour variants:** most species come in 2–4 colour schemes, picked at random when each fish appears (60 looks across 28 species). For example: clownfish in orange, maroon, dark-banded or golden; tangs in blue, yellow or purple; jellyfish in pink, blue, violet or amber; octopuses in red, purple or orange; lanternfish with blue, green or pink lights. Background fish never collide with the plane.

### 4.3 Space (since v53)
The plane is thrown out of orbit and falls away from Earth into deeper and stranger space. Cartoon and playful in tone.
- **Background colour:** deep blue sky at the start, turning to black by about 300 m, then faintly tinted nebula darks (purple, teal), near-black below 1,000 m.
- **Stars:** a field of small stars of a few sizes slides past (one CSS layer, like the sea bubbles).
- **Earth:** its glowing blue edge curves across the top of the first screen and slides away.
- **Background scenery** (faded, never collides):

| Depth | Scenery |
|---|---|
| 0–150 m | Small satellites, the space station, a waving astronaut |
| 150–400 m | Satellites, astronauts, the Moon, comets |
| 400–800 m | Mars, Saturn, the Moon, comets |
| 800–1,500 m | Saturn, Mars, spiral galaxies, comets |
| 1,500 m + | Galaxies, a black hole with a glowing ring, comets, and deeper down a whale made of stars |
| Anywhere below 300 m | Rarely, a small UFO zipping past |

---

## 5. Obstacles

"Starts at" is the depth where an obstacle first joins the pool of possible obstacles. Every obstacle picks a colour variant when it spawns, and obstacles of the same kind in one row share that colour.

### 5.1 Paper map (16 types)

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
| Scissors | Spin and snap open and shut while drifting | ~75 m |
| Cutter | Blade shoots out from an edge (22–38% of the width), holds, then slides back | ~100 m |
| Desk fan | Wind band that pushes the plane sideways; the fan itself is deadly. Only appears before 700 m (since v55) | ~120 m |
| Cat paw | A dashed wedge warns where it will strike, then the paw swipes from an edge | ~135 m |
| Erasers | Two erasers from the walls that slide shut and open again | ~150 m |
| Drawing compass | Spins its leg in a circle, pencilling the arc as it goes | ~215 m |

The extra hazard next to desk fans deeper down is a small ink blot.

### 5.2 Deep sea map (12 types)
Eight sea obstacles reuse the movement and collision of a notebook obstacle with new art (see `SEA_MAKERS` in `js/obstacles.js`). Four are new mechanics.

| Sea obstacle | Behaviour | Based on | Starts at |
|---|---|---|---|
| Coral ledges | Coral from both walls with a gap | Rulers | 0 m |
| Sea urchins | Static spiky balls | Ink blots | 0 m |
| Jellyfish | Pulsing jellyfish drifting down the water | Sticky notes | 0 m |
| Starfish | Spins while drifting, bouncing off the screen edges | New | 0 m |
| Air bubble column | Slows the fall while inside and never hurts | New | 0 m |
| Naval mine | On a chain. When the plane approaches it blinks and shows a dashed blast circle, then explodes so the blast lands as the plane arrives. The explosion is a cartoon burst (a spiky yellow and orange star) with speed lines and puffs of smoke | New | ~50 m |
| Moray eel | Lunges out of a hole in the rock wall | Cutter | ~65 m |
| Ocean current | Moving water pushes the plane sideways (no body to hit). Only appears before 700 m (since v55) | Desk fan | ~75 m |
| Giant clam | Two shell lips that snap shut and open | Erasers | ~100 m |
| Submarine | Fires torpedoes across; its bow light blinks just before | Glue tube | ~100 m |
| Electric eel | Charges with a dashed preview line, then zaps a short lightning bolt out from the wall (14–22% of the width) | New | ~135 m |
| Kelp | Seaweed frond sweeps out from the wall after a green dashed warning | Cat paw | ~135 m |

### 5.3 Space map (13 types, since v53)
Every Space obstacle reuses the movement and collision of a Paper or Deep sea obstacle (see `SPACE_MAKERS` in `js/obstacles.js`) with new art in `js/draw-space.js`. Outlines are pale so they read on black. Space has no wind or explosions: the solar wind and the space mine were removed in v55.

| Space obstacle | Behaviour | Based on | Starts at |
|---|---|---|---|
| Station girders | Steel trusses from both walls with a gap; red lights blink on the end plates | Rulers | 0 m |
| Asteroids | 1–3 cratered rocks that stay put | Ink blots | 0 m |
| Ice chunks | 2–3 hexagonal ice chunks drifting down and swaying | Sticky notes | 0 m |
| Tumbling asteroid | Spins while drifting, bouncing off the screen edges | Starfish | 0 m |
| Satellite | A satellite with long solar panels sliding side to side | Pencil | 0 m |
| Low-gravity field | A dashed purple zone with rising sparkles; slows the fall, never hurts | Bubble column | 0 m |
| Rocket | A small rocket with a flickering flame launched up toward the plane | Paper wad | ~35 m |
| Satellite train | A line of tiny satellites crossing | Paper clips | ~50 m |
| Moon edge | A cratered moon bulging in from one side; slalom pairs deeper down | Protractor | ~65 m |
| Airlock doors | Two heavy doors with hazard stripes sliding shut and open | Erasers | ~100 m |
| Docking probe | Shoots out of a hull, holds, slides back | Cutter | ~100 m |
| Laser gate | Charges with a dashed line, then fires a short laser beam from the wall | Electric eel | ~135 m |
| Robot arm | A station arm with a claw swinging all the way round its base | Drawing compass | ~215 m |

### 5.4 Removed obstacles (history)
These were built and then removed at the player's request: the pen (drew a wall line from the side), the stylus (expanding ripple rings), the pencil sharpener (pulled the plane), the whiteout patch (hid hazards), thumbtack rows, the magnifying glass (its sun spot chased the plane), and in v37 the coffee spill (made the plane soggy) and the rubber stamp (slammed down on a marked spot). Avoid these kinds of mechanics in future obstacles.

---

## 6. Generalized obstacles

Every obstacle in the game is one of the **20 mechanics** below, dressed in a map's art. A mechanic defines how something moves, what hurts, how it warns the player, and what can be tuned. A map's obstacle is just *mechanic + look*. The goal is to build any new map by reusing these mechanics with new drawings, instead of writing new movement and collision code each time.

In the code, the mechanic lives in the generator (`make.<name>` in `js/obstacles.js`), the movement (`updateObstacle`) and the collision (`computeShapes`), both in `js/physics.js`. The look lives in the `draw*` / `paint*` functions in `js/draw-paper.js` and `js/draw-sea.js`. The Deep sea map already works this way: `SEA_MAKERS` maps each sea obstacle to the notebook generator whose mechanic it reuses.

### 6.1 Mechanic catalogue

| # | Mechanic | How it works | Warning | What hurts | Paper | Deep sea | Space |
|---|---|---|---|---|---|---|---|
| 1 | **Gap Wall** | Two barriers from both walls leaving one gap; deeper down the gap slides side to side | The gap is visible | Both barriers | Rulers | Coral ledges | Station girders |
| 2 | **Closing Jaws** | Two blocks from both walls whose gap keeps opening and closing | The rhythm is visible | Both blocks | Erasers | Giant clam | Airlock doors |
| 3 | **Static Hazards** | 1–3 round hazards that don't move | — | The hazards | Ink blots | Sea urchins | Asteroids |
| 4 | **Wall Bulge** | A large half-disc stuck to one wall; deeper down a pair on opposite walls forms a slalom | — | The bulge | Protractor | — | Moon edge |
| 5 | **Bouncing Slider** | A long bar sliding sideways and bouncing off the walls | — | The bar | Pencil | — | Satellite |
| 6 | **Rising Projectile** | Thrown up the screen toward the plane, bouncing off the walls | — | The projectile | Paper wad | — | Rocket |
| 7 | **Drifting Swarm** | 2–3 items sinking slower than the plane while swaying side to side | — | Each item | Sticky notes | Jellyfish | Ice chunks |
| 8 | **Conveyor** | A row of evenly spaced pieces sliding across the screen | The gaps move with the row | Each piece | Paper clips | — | Satellite train |
| 9 | **Spinning Drifter** | One shape spinning while it drifts sideways and bounces off the walls | — | The shape (triangle or circle) | Set square | Starfish | Tumbling asteroid |
| 10 | **Spinning Blades** | Two blades spinning around a pivot while opening and closing, drifting slowly | — | Blades and handles | Scissors | — | — |
| 11 | **Sweeping Arm** | An arm rotating all the way around a fixed pivot | The arc it traces | Arm and pivot | Drawing compass | — | Robot arm |
| 12 | **Wall Piston** | Shoots out from a wall, holds, then retracts on a loop | The body at the wall | Base and extended part | Cutter | Moray eel | Docking probe |
| 13 | **Wall Turret** | Mounted on a wall, fires projectiles straight across on a timer | Bow or nozzle cue before firing (sea version) | Base and projectiles | Glue tube | Submarine | — |
| 14 | **Charged Beam** | On a wall; charges, then a beam crosses part of the screen for a moment | Dashed preview line while charging | Base and beam | — | Electric eel | Laser gate |
| 15 | **Telegraphed Sweep** | A dashed wedge shows the danger area, then an arm swipes through it in an arc from a wall | Dashed wedge | The arm and its tip, only mid-swipe | Cat paw | Kelp | — |
| 16 | **Telegraphed Slam** | A target appears at a spot, then something slams down there, lifts, and moves to a new spot | Darkening spot and dashed target | Only the moment it is down | — (was the rubber stamp, removed in v37) | — | — |
| 17 | **Proximity Blast** | Sits still; when the plane gets close it arms, shows its blast radius, then explodes as the plane arrives | Fast blinking and a dashed blast circle | The body, then the blast | — | Naval mine | — |
| 18 | **Push Zone** | A horizontal band that pushes the plane sideways while inside it; may have a solid source on the wall | Moving streaks | Only the source, if there is one | Desk fan (fan is solid) | Ocean current (no source) | — |
| 19 | **Effect Zone** | A zone that never hurts but changes the plane for a while: a debuff or a buff | The zone itself | Nothing (can be paired with a hazard placed after it) | — (was the coffee spill, removed in v37) | Bubble column (falls slower) | Low-gravity field (falls slower) |
| 20 | **Spring Line** | A line between two anchors; touching the line kicks the plane sideways instead of crashing it | — | Only the anchors | Rubber band | — | — |

### 6.2 Tunable parameters

Every mechanic is already tuned by depth through `difficulty()`. The knobs each map can change:

- **Size and spacing:** gap width, hazard radius, bar length, number of pieces, distance between pieces.
- **Speed and timing:** drift, spin and slide speed, turret fire rate and projectile speed, piston cycle length, sweep and slam warning time, mine trigger distance.
- **Reach:** piston and beam length, sweep radius, blast radius, push strength and band height.
- **Unlock depth:** when the mechanic joins that map's obstacle pool, and how often it is picked.

---

## 7. Power-ups and progression

There is no Shop (removed in v46). Instead, power-ups appear in the map during a run, picked up by flying through them like stars. Each pickup raises that power one level, up to level 3. Levels last for the rest of the run only; every run starts with none.

| Power-up | Looks like | Level 1 | Level 2 | Level 3 |
|---|---|---|---|---|
| Magnet | White badge with a red rim and a horseshoe magnet | Pulls stars and power-ups from 120 units away | 180 units | 240 units |
| Shield | White badge with a blue rim and a blue shield crest | 1 spare life | 2 spare lives | 3 spare lives |

**Slow motion** (since v54, timed, no levels): a white badge with a purple rim and an hourglass. Picking it up runs the whole game at half speed for 4 seconds (falling, obstacles, steering), with a soft purple tint and a purple bar above the plane showing the time left, plus a falling "whoosh" sound. It is only offered when slow motion is not already running.

- **Spawning:** from about 30 m on, a row can carry a power-up instead of a star, with at least about 45 m between power-ups (so roughly one every 50–80 m). A magnet or shield already at level 3 is not offered (a used shield level can be picked up again); once both are at level 3, slow motion is the only power-up still offered.
- **Feedback:** "Magnet level 2!", "Shield level 3!" or "Slow motion!" pops up in the power's colour, with a burst of sparks and a chime. Using a shield shows "Shield used! N left".
- **Stars:** stars caught in a run are added to a saved total when the run ends. The top bar shows the total during a run.
- **Plane:** one classic white paper plane; the crumpled ball and paper scraps match it. There are no skins (removed in v42) and no trail (removed in v36).

---

## 8. Music

Background music is composed and played in code (`js/music.js`), in the style of a fantasy MMORPG soundtrack such as Knight Online's: minor keys, harp arpeggios, string pads and flute or horn leads. The melodies are original.

| Theme | Plays | Feel |
|---|---|---|
| Title | Start menu and game over | Slow, noble horn melody in E minor over strings, with a soft drum (72 bpm, about 27 s loop) |
| Paper | During Paper runs | Light pastoral town theme in D minor: flute over flowing harp eighths (88 bpm, about 22 s loop) |
| Deep sea | During Deep sea runs | Slow and dark in A minor: echoing harp, low lonely flute, deep bass (64 bpm, about 30 s loop) |
| Space | During Space runs | Dreamy and floating: shimmering echoing harp over soft major-seventh chords and a slow, high, wavering lead (70 bpm, about 27 s loop) |

- Themes cross-fade when they change. Pausing lowers the music to 30%; hiding the tab silences it.
- The music sits below the sound effects (peaks about 0.08 against about 0.10 for a star chime).
- Each theme is 8 bars; notes are scheduled half a second ahead of the audio clock, so the game loop is not involved.

## 8b. Settings

| Setting | Where | Notes |
|---|---|---|
| Sound on/off | Top bar (speaker icon, crossed out when muted) | Mutes sound effects and music together. Both are generated in code (Web Audio), with no audio files |
| Pause / Resume | Top bar (pause icon, becomes a play icon while paused), P, Esc | Also pauses automatically when the tab is hidden |
| Map | Start and game-over screens | Paper / Deep sea picture tiles |

### Saved data (browser localStorage)
`nosedive-best-notebook`, `nosedive-best-sea`, `nosedive-best-space` (best depth per map), `nosedive-bank`, `nosedive-map`, `nosedive-muted`, `nosedive-res` (remembered render resolution). All of them are per browser and per device.

---

## 9. Performance and optimizations

| Optimization | What it does |
|---|---|
| Sprite cache | Rigid obstacle parts, fish, stars and plane-independent art are painted once into offscreen canvases at screen resolution (`sharedSprite` / `ownSprite`) and then copied each frame, rotated, flipped, stretched or cropped as needed. The cache is rebuilt on resize and when fonts finish loading. |
| No drop shadows | The game has no drop shadows (removed in v29), which saves a draw per obstacle each frame. |
| Background as browser layers | The page colour, ruled lines, margin and holes (or the rising bubbles) are CSS layers behind a transparent canvas. The compositor slides them into place each frame, so the canvas only draws formulas, fish, markers, obstacles and the plane. Screen shake moves the whole playfield with one CSS transform. |
| No per-frame gradients | Scissor blades, glows and blasts use pre-painted sprites instead of creating gradients every frame |
| Fewer large see-through fills | The desk fan's wind band tint was removed, and the cat paw and kelp warnings are dashed outlines |
| Less garbage collection | Lists are pruned in place, and the plane's hit circles and static collision shapes are reused. The top bar only touches the page when a number changes. |
| Adaptive resolution | Render resolution goes up to 2×. Screens denser than 2.5× start at 1.5×. If play stays below about 48 fps for 1.5 s, the resolution steps down by 0.25 (never below 1×) and is remembered. |
| Frame pacing | Gameplay is always capped at 60 fps (since v43; before it was an option), so 90, 120 and 144 Hz screens don't draw extra frames; menus draw at 30 fps and the pause screen at 4 fps |
| Audio ready before play | The audio engine is built while the title screen is up and switched on by the first tap or key press. Building it on the first sound used to freeze the start of the first run for 50–85 ms. The crash / explosion noise is generated once and reused instead of rebuilt on every crash, extra life and mine blast. |
| Text drawn directly | Measurements showed formula text is cheap to draw directly (the browser caches glyphs), so it isn't cached |

### Measurement notes
- On the development PC every version runs well above 60 fps, even with CPU throttled 6× to phone level. Phone performance depends mostly on the graphics chip, which headless testing can't reproduce.
- Use the fps reading in the version label on a real phone to judge performance.

---

## 10. Project structure

### 10.1 Files

```
airplane/
├── index.html              the page: playfield layers, top bar, menu cards; loads everything below
├── style.css               all styling, including the paper and sea background layers and the start menu
├── img/menu-bg.svg         start-menu background picture (paper airplanes in a sunset sky)
├── README.md               this document
├── CLAUDE.md               short working notes for Claude Code (loaded automatically)
├── tools/                  dev-only test, screenshot and bundle scripts (see 10.5)
└── js/                     16 game scripts, listed in the order they load
    ├── core.js             constants, helpers, saved settings, screen sizing, sprite cache
    ├── audio.js            sound effects
    ├── music.js            background music for the menus and each map
    ├── paper-background.js Paper map: pencil formulas by depth
    ├── sea-background.js   Deep sea map: fish, specks, whales, shipwrecks
    ├── space-background.js Space map: Earth glow, satellites, planets, comets, galaxies
    ├── state.js            game state, power-up levels, controls, speed and difficulty rules
    ├── obstacles.js        obstacle generators and row spawning, for all maps
    ├── physics.js          collision, obstacle movement, steering, per-frame update
    ├── maps.js             map definitions, page and water colours, paper background drawing
    ├── draw-paper.js       Paper obstacle art
    ├── draw-sea.js         Deep sea obstacle art
    ├── draw-space.js       Space obstacle art
    ├── render.js           plane, screen shake, frame drawing, map switching
    ├── ui.js               top bar, menus, start / pause / game over
    └── main.js             keyboard and touch input, main loop (loads last, starts the game)
```

There is no build step and nothing to install. To play locally, open `index.html` in a browser (straight from disk works) or serve the folder with any static server, for example `python -m http.server`.

### 10.2 How the scripts fit together

- The scripts are ordinary `<script src>` files, not ES modules, so they all share **one global scope**: a name declared in one file (`const`, `let` or `function`) can be used from any other file.
- They run **in the order `index.html` lists them**. While a file is loading it may only use names from files above it; code inside functions can use names from anywhere, because it only runs once the game is going.
- `main.js` must stay **last**: it starts the main loop.
- Each file starts with `'use strict'` and a one-line description.
- Global names must not clash with built-in browser globals such as `top`, `window` or `location`.

### 10.3 Where to change things

| To change… | Look in |
|---|---|
| Speed, difficulty, controls, starting state | `js/state.js` (`baseFallSpeed`, `difficulty`, `HOLD_MS`, `reset`) |
| Which obstacles spawn, when they unlock, their colours | `js/obstacles.js` (`make`, `PALETTES`, `seaPool`, `SEA_MAKERS`, `spawnRow`) |
| How an obstacle moves or what counts as a hit | `js/physics.js` (`updateObstacle`, `computeShapes`) |
| How an obstacle looks | `js/draw-paper.js` or `js/draw-sea.js` (`draw*` / `paint*`) |
| Background decorations | `js/paper-background.js` (formulas) or `js/sea-background.js` (fish, specks, silhouettes) |
| Page and water colours, a new map entry | `js/maps.js` (`MAPS`, `RAINBOW`, `SEA`) and the map tiles in `index.html` |
| Plane look | `js/core.js` (`PLANE` colours), `js/render.js` (`paintPlane`) |
| Power-ups | `js/state.js` (`POWER_MAX`, `MAGNET_RANGES`, `POWER_GAP`, `SLOWMO_TIME`, `timeScale`), `js/obstacles.js` (`pickPower`), `js/physics.js` (`collectPower`, `useExtraLife`), `js/render.js` (`drawPower`, `paintPowerIcon`) |
| Menus, top bar, buttons | `index.html`, `style.css`, `js/ui.js`; start-menu picture in `img/menu-bg.svg` |
| Sounds | `js/audio.js` (`sfx`) |
| Music | `js/music.js` (`THEMES`: chords, melody and tempo per theme; `setMusic`, `duckMusic`) |
| Frame rate, resolution, input | `js/main.js`, plus `resize` in `js/core.js` |
| Version label | `index.html` (`id="version"`) |

### 10.4 Key names by file

| File | Key names |
|---|---|
| `core.js` | `W` (playfield width 400), `PX_PER_M`, `COL`, `PLANE`, `rand`, `clamp`, `lerp`, `prune`, `store`, `resize`, `dprCap`, `makeSprite`, `sharedSprite`, `ownSprite`, `blit`, `invalidateSprites` |
| `audio.js` | `sfx`, `tone`, `muted`, `audioEngine` |
| `music.js` | `THEMES`, `CH` (chords), `setMusic`, `duckMusic`, `syncMusicVolume`, `playBar` |
| `paper-background.js` | `FORMULA_TIERS`, `pickFormula`, `spawnFormula`, `updateFormulas` |
| `sea-background.js` | `FISH`, `FISH_TIERS`, `spawnFish`, `drawFishes`, `drawSeaParticles` |
| `state.js` | `state`, `plane`, `obstacles`, `dist`, `speed`, `POWER_MAX`, `MAGNET_RANGES`, `press` / `release`, `depthM`, `difficulty`, `baseFallSpeed`, `reset` |
| `obstacles.js` | `make` (generators), `PALETTES`, `SEA_MAKERS`, `seaPool`, `spawnRow`, `spawnFromPool`, `spawnRows` |
| `physics.js` | `computeShapes` / `shapes`, `circleHits` (circles, rotated boxes, convex polygons), `planeCircles`, `updateObstacle`, `steer`, `update`, `crash` |
| `maps.js` | `MAPS`, `mapId`, `SEA`, `RAINBOW`, `isDark`, `syncHudPage`, `drawPaper`, `drawFormulas`, `drawDepthMarkers` |
| `draw-paper.js` | Paper obstacle `draw*` / `paint*` functions (`drawRuler`, `paintPencil`, `drawScissors`, `drawFan`, `drawPaw`, …) |
| `draw-sea.js` | `drawCoral`, `drawClam`, `drawUrchin`, `drawJelly`, `drawMoray`, `drawZap`, `drawKelp`, `drawSub`, `drawStarfish`, `drawMine`, `drawBubbleColumn` |
| `render.js` | `paintPlane`, `drawPlane`, `syncPaperLayers`, `render`, `applyMap` |
| `ui.js` | `updateHud`, `showCard`, `start`, `pause`, `resume`, `gameOver` |
| `main.js` | `watchFrameRate`, `frameInterval`, `frame` |

### 10.5 Dev tools (`tools/`)

Not used by the game; for testing during development. Set up once with `cd tools && npm install` (installs puppeteer-core; Chrome must be installed, or set `CHROME` to its path). Output goes to `tools/out/`, which git ignores.

| Command | What it does |
|---|---|
| `node tools/test.js [depth]` | Loads the game in headless Chrome and checks: title screen, menus, deep runs on all three maps to 2,500 m (or `depth`) with every obstacle type appearing, normal runs ending in game over, pause and resume, no page errors. Exits with code 1 on any problem. |
| `node tools/shot.js <notebook|sea> <depth…>` | Phone-size (412×860) gameplay screenshots at those depths |
| `node tools/shot.js title [sea]` | Title screen screenshot |
| `node tools/bundle.js [out.html]` | Inlines `style.css` (with `img/` pictures as data URLs) and the scripts into one page (for a single-file copy) |

---

## 11. Direction

**Current focus: three maps, Paper, Deep sea and Space,** each chosen from the menu. Any new map should be built from the mechanics in section 6, with new art.

---

## 12. Ideas to make it more fun

Suggestions; only the ones marked ✅ are built. They respect the decisions recorded so far (no trails, no skins, no tutorial screens or steering arrows, no shadows, and none of the removed obstacle mechanics). Effort: **S** = an hour or two, **M** = an evening, **L** = several sessions.

### 12.1 Top picks

| # | Idea | Why it is fun | Effort |
|---|---|---|---|
| 1 | **Best-depth line** ✅ built in v47 (see section 3) | A dashed line with "Your best" appears in the world at your record depth. Seeing it coming is the strongest "one more run" pull a high-score game has. | S |
| 2 | **Close calls** | Passing very near an obstacle without touching it pops "Close call!" and gives a bonus star. It rewards risky lines instead of only safe ones. | M |
| 3 | **Star paths** | Instead of single stars, place short lines or arcs of stars that lead through gaps or around hazards, so collecting them is a small route-finding puzzle. | S |
| 4 | **"Crumpled by…" on game over** | Name what got you ("Crumpled by the scissors at 138 m", "Zapped by an electric eel"). It feels fairer and is often funny. | S |
| 5 | **Daily dive** | One run per day with the same obstacle sequence for everyone (seeded from the date) and its own best score. Gives a reason to come back each day. | M |

### 12.2 More things to do during a run
- **More power-ups** next to the magnet, shield and slow motion (✅ built in v54) (rare pickups, a few seconds each): a star rush that turns the next rows into stars, or a tiny plane that fits through narrow gaps.
- **Breathers and rushes:** every few hundred metres, a calm stretch with only stars, followed by a short "rush" of tightly packed obstacles. Changing the pace makes runs feel less flat than a constant difficulty curve.
- **Milestone moments** ✅ built in v48 (see section 3): a small chime and flash each 100 m (and a bigger one each 500 m), so progress feels rewarding before the run ends.
- **Rare big star** worth 5, placed in a slightly risky spot.

### 12.3 Goals between runs
- **Missions:** three small goals at a time, replaced when done ("Pass 3 mines in one run", "Collect 10 stars", "Reach 300 m in Deep sea"). They pay stars and point players at things they would not try on their own.
- **Medals per map** ✅ built in v49 (see section 3): bronze / silver / gold at 250 / 750 / 1,500 m, shown on the map tiles.
- **A use for stars** now that the Shop is gone: for example unlocking the second map, or medals at star totals.

### 12.4 Feel and polish
- **Phone vibration** on crashes, close calls and mine blasts (the Vibration API, Android only; easy to switch off).
- **A simple music loop** generated in code like the sound effects, getting a little faster with depth, with its own on/off toggle.
- **Speed feel at depth:** faint motion streaks at the screen edges once the fall gets fast (screen-edge streaks, not a trail behind the plane).
- **Share button** on game over (the Web Share API on phones): "I fell 1,240 m in Paper Nosedive!" with the game link.

### 12.5 New maps
New maps should reuse the 20 mechanics in section 6 with new art (see 11). Settings that suit a falling paper plane and are not the dropped Sky dive / Skyscraper ideas:
- **Kitchen:** falling past shelves, with knives (Wall Piston), a whisk (Spinning Blades), steam from pots (Effect Zone) and rolling oranges (Bouncing Slider).
- **Library:** tall bookshelves as Gap Walls, a swinging reading lamp (Telegraphed Sweep), falling loose pages (Drifting Swarm) and a book cart conveyor.
- **Space** (worked out in section 13): drifting asteroids (Static Hazards and Spinning Drifter), satellites with solar panels (Sweeping Arm), laser gates (Charged Beam) and solar wind bands (Push Zone).

### 12.6 Suggested order
1. Best-depth line, "Crumpled by…", star paths (quick wins that change how runs feel).
2. Close calls and milestone moments.
3. Missions and medals.
4. Power-ups and breathers / rushes.
5. Daily dive, music, a third map.

---

## 13. Space map — brainstorm (built in v53)

The original ideas for the third map, kept for reference. **Built in v53** as described in sections 4.3 and 5.3, with these choices: premise **A. Re-entry**, a **cartoon and playful** tone, the name **Space**, and 15 of the obstacles below (Spinning Blades, Telegraphed Sweep and Spring Line were left out). In v55 the solar wind and space mine were removed too, leaving 13.

### 13.1 The premise: why is the plane falling in space?

| Option | Idea | Feel |
|---|---|---|
| **A. Re-entry** (recommended) | The plane is thrown from a space station and falls back toward Earth: near orbit first, then deeper and stranger space as the depth grows. | Fits "how deep can you fall" best. |
| B. Station shaft | Falling down the inside of a huge space station. | Lots of walls and machines, but feels like a building (close to the dropped Skyscraper idea). |
| C. Deep space dive | Falling "down" toward a black hole, getting stranger with depth. | Dramatic, but the black hole could only be scenery: a pull toward it would be too close to the removed sharpener. |

Name ideas: **Space**, **Orbit**, **Starfall**.

### 13.2 Background by depth

Like the water darkening in Deep sea, the background changes every so often:

| Depth | Look |
|---|---|
| 0–100 m | Dark blue upper sky fading to black, the curve of Earth glowing at the edge |
| 100–400 m | Black space with twinkling stars sliding slowly past (one cheap CSS layer, like the sea bubbles) |
| 400–1,000 m | Soft coloured nebula clouds: purple, teal, pink |
| 1,000 m + | Deep space: distant spiral galaxies, rare shooting stars |

**Background scenery** (never collides, like the fish):

| Depth | Scenery |
|---|---|
| Shallow | Small satellites, the space station, a floating astronaut waving |
| Middle | Saturn, Mars and the Moon drifting by, comets with tails |
| Deep | Galaxies, a faint black hole with a glowing ring |
| Rare surprises | A tiny distant UFO, a "space whale" made of stars |

### 13.3 Obstacles, reusing the 20 mechanics (section 6)

| Mechanic | Space obstacle |
|---|---|
| Gap Wall | Station girders from both sides with a gap |
| Closing Jaws | Airlock doors sliding shut and open |
| Static Hazards | Small asteroids and space junk |
| Wall Bulge | A half-moon or planet edge bulging in from the side |
| Bouncing Slider | A satellite with long solar panels sliding side to side |
| Rising Projectile | A small rocket launching up toward the plane |
| Drifting Swarm | Floating ice chunks or lost astronaut tools |
| Conveyor | A train of mini satellites crossing in a line |
| Spinning Drifter | A tumbling asteroid |
| Spinning Blades | A rotating satellite with two solar-panel blades |
| Sweeping Arm | A robotic station arm swinging around its base |
| Wall Piston | A docking probe shooting out from a hull |
| Charged Beam | A laser gate that charges (dashed line), then fires |
| Telegraphed Sweep | A UFO searchlight sweeping across after a warning |
| Proximity Blast | A space mine or unstable fuel pod that bursts as the plane passes |
| Push Zone | A band of solar wind pushing the plane sideways |
| Effect Zone (helpful only) | A low-gravity bubble that slows the fall (like the sea's bubble column) |
| Spring Line | A loose tether cable that bounces the plane sideways |

About 12 of these would be a good set (Deep sea has 12).

**Avoid** (too close to removed obstacles):
- Black holes or gravity wells that pull the plane in (like the removed sharpener).
- Meteors that slam onto a marked spot (like the removed rubber stamp).
- Anything that chases the plane (like the removed magnifier).
- Zones that make the plane worse to control (like the removed coffee spill).

### 13.4 Extras

- **Pickups:** gold stars fit space naturally. The magnet could look like a tractor beam and the shield like a force field.
- **Music:** a slow, dreamy synth theme with a soft arpeggio: still fantasy-flavoured, but more cosmic than the harp themes.
- **Map tile:** black with tiny stars and a small ringed planet.
- **Space moments:** every 500 m a comet streaks across the screen; a rare UFO in the distance beams up stars (decoration only).

### 13.5 Open questions

1. Premise: **re-entry**, station shaft, or deep space dive?
2. Tone: **cartoon and playful** (aliens, UFOs) or more **realistic** (NASA-style)?
3. Name: Space, Orbit, Starfall, or something else?
4. Which obstacles to keep or drop from the list above?
