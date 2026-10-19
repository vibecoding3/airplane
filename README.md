# Paper Nosedive — Game Status

Current version: **v112** (2026-10-19)
Live game: https://vibecoding3.github.io/airplane/
Repository: https://github.com/vibecoding3/airplane

---

## 1. Overview

Paper Nosedive is a 2D browser game. A paper airplane is always falling; the player steers it left and right to dodge obstacles and survive as deep as possible. The score is the depth reached, in metres.

- **Files:** `index.html`, `style.css` and 19 plain script files in `js/` (about 5,800 lines in all). No build step and no dependencies. The two fonts (Kalam and Patrick Hand, SIL Open Font License) are bundled in `fonts/` since v110, so the game looks right offline and in an app; before, they loaded from Google Fonts. See section 10 for the file structure.
- **Start menu:** a regular game menu (big title, best score and star count, map tiles and Play; the "How to play" section was removed in v44) over an illustrated sky full of paper airplanes (`img/menu-bg.svg`). It is not tied to either map; the game itself is not drawn behind it. The pause and game-over screens use the same menu style over the dimmed game: game over shows the depth in big numbers, a "New best!" badge, the best depth, the stars caught this run and the star total, the map tiles, Play again and (since v107) a Main Menu button back to the start menu (the run time was removed in v45). There is no Shop (removed in v46).
- **Rendering:** HTML canvas 2D, plus a few CSS layers for the background.
- **Runs on:** desktop browsers and phones, in portrait.
- **Hosting:** GitHub Pages serves the repository root of the `main` branch. Every push to `main` goes live within about a minute.
- **Version label:** the bottom-centre label (for example `v102 · 60 fps`) shows the version and the live frame rate; during a run it also shows the plane's current fall speed in m/s, left of the frame rate (since v102, for example `v102 · 11.5 m/s · 60 fps`; slow motion halves it). The version number goes up with every pushed change, so you can confirm a deployment has arrived.

---

## 2. Controls

One scheme for every device. A press can be a tap or click on the left or right half of the screen, or the ← / → keys (A / D):

| Action | Result |
|---|---|
| Press a side once | The drift steps one notch toward that side: left → straight down → right |
| Press the other side | Steps back: from a left drift, one press goes straight, a second press drifts right |
| Hold a side (longer than 0.22 s) | Sharp turn; when released, the plane keeps drifting that way |
| Hit a screen edge | The drift into that edge is cancelled (the plane falls straight), so one press the other way turns it at once |
| P or Esc | Pause / resume |
| Space or Enter | Start or resume from the menus; during a run, Space pauses (since v67, replacing P) |
| Phone Back button (Android app) | One step back (since v110, `goBack` in `js/main.js`): a run pauses, the pause menu resumes, game over goes to the start menu, Collections closes. On the start menu it returns false and the app closes. The website does not use it yet; the Android app will call it |

There are no on-screen steering arrows (removed in v44).

---

**Control tips** (since v91): for the first 100 m of a run, a tip shows in the top bar (bold 17 px since v108, was 13 px) to the left of the sound button, changing every 3 seconds and fading out over the last 10 m. Keyboards: "← → or A D to steer", "Space to pause". Phones and tablets (coarse pointer): "Tap left or right to steer" only (the "Hold for a sharp turn" tip was removed in v95, "Tap ⏸ to pause" in v96) (`HINTS` in `js/ui.js`). The separate "How to play" section stays removed (v44).

## 3. Core rules

| Rule | Value |
|---|---|
| Depth | 30 world units = 1 metre. The score is the depth reached. |
| Fall speed | `150 + 11 × √depth` units per second, rising until 600 m and then capped at that speed (since v55; before it was capped at the 800 m speed, 15.4 m/s): about 5 m/s at the start, 10 m/s at 200 m and 14.0 m/s from 600 m on. Sideways speed is capped with it. Difficulty (gaps, spacing, obstacle speeds) still keeps rising after that |
| Sideways speed | `300 + 0.4 × (fall speed − 150)`, so steering keeps up at depth |
| Sideways slowdown | Gliding sideways at full speed makes the plane fall up to 40% slower |
| Difficulty | `1 − e^(−depth / 600)`. It controls when obstacles unlock, gap sizes, row spacing and obstacle speeds, and is nearly maxed by about 2,000 m. |
| Obstacle rows | Rows spawn ahead of the plane. The same obstacle type never appears twice in a row. |
| Pickup pull | Since v51, any star or power-up that comes within 60 units (2 m) of the plane is pulled in, so near misses still count. The magnet power-up extends this for stars and (since v54) power-ups. The squid (a debuff, v109) is never pulled in |
| Stars | About 28% of rows carry a gold star. Stars are a collected total (shown in the menu and top bar) and add nothing to the score. |
| Fast-fall safety | At high speed each frame is split into sub-steps, so the plane can't skip through thin obstacles |
| Best score | Saved per device and per map (since v49; the old single best went to Paper). During a run, a gold dashed line labelled "Your best · N m" marks the record depth, so you can see it coming; passing it pops "New best!" with a short fanfare |
| Ranked Score | Since v104: the best depth of every map added up (a map not played yet counts as 0), for example Paper 800 + Ocean 260 + Space 0 + Dungeon 412 = 1,472. Shown as "Ranked" on the start screen (next to Best and the stars) and on the game-over screen (next to Best, so a new record shows straight away) (`rankedScore` in `js/state.js`) |
| Medals | Each map has bronze / silver / gold medals for reaching 250 / 750 / 1,500 m. They show as three coins on the map tiles (start and game-over screens), lit once earned. The first time a run reaches a medal depth on that map, "Bronze medal!" (or Silver / Gold) pops up with a fanfare |
| Milestones | Every 100 m: "100 m!" pops up, the screen flashes white for a moment, the depth counter bounces and a two-note chime plays. Every 500 m it is bigger: a gold flash, a larger gold "500 m!", a burst of coloured sparks, a bigger bounce and a four-note arpeggio. Flashes and bounces are skipped when the device asks for reduced motion |

### Plane states
- **Shielded** (shield power-up): the plane has a coloured outline while it has at least one shield level, and its look shows the level: thin light blue (1), dark blue with a thin white edge (2), violet with a soft glow (3; colours since v63). A hit uses one level instead of ending the run: the plane blinks and can't be hit for 2 seconds.
- **Magnet** (magnet power-up): a dotted ring shows how far stars and power-ups are pulled in. Since v56 the ring is a shade of the map colour behind the plane (darker on light pages and shallow water, lighter on deep water and space), so it matches every map.
- **Bubbled** (Ocean map, bubble column): the plane falls 50% slower while inside the column.

---

## 4. Maps

Since v100–v101 the tiles show new icons (Paper: colourful sticky notes on a notebook page; Ocean: the surface with waves and a paper boat; Space: a big ringed planet and its moon; Dungeon: a stone archway between two torches); options were drawn as sheets in `ref/map-icons/` to choose from. The map is chosen with four picture tiles, **Paper**, **Ocean**, **Space** and **Dungeon**, on the start screen and on the game-over screen (so you can switch between runs). The choice takes effect immediately and is saved per device. In the code the Paper map's id is still `notebook`. Obstacles, background art and background decorations all depend on the map.

### 4.1 Paper
- **Background:** ruled notebook paper with a red margin and punched holes.
- **The start** (since v71): the plane sets off from the top of the notebook page: a wooden desk with a pencil and an eraser above the page edge, the spiral binding across the top, and a handwritten header ("Name: Paper plane", "Date: today"). It slides up out of view within the first ~35 m, like the Earth in Space; formulas are only drawn below the header while it shows, and the top bar has no background fade.
- **Page colour:** plain paper for the first 100 m, then pastel red, orange, yellow, green, blue, indigo and violet, changing every 100 m and repeating. A pencilled dashed line labelled "100 m", "200 m"… marks each change.
- **Background decoration:** pencilled maths and science formulas, faded so they read as background.
  - 264 formulas in 6 difficulty levels (levels start at 0, 150, 400, 800, 1,500 and 2,500 m). The topics are arithmetic, fractions and algebra, geometry and trigonometry, calculus, series and linear algebra, statistics and probability, number theory, physics, engineering and astronomy.
  - Four of the easiest entries generate random arithmetic.
  - Each formula appears at most once per run. When a level runs out, it borrows from harder levels first, then easier ones.
  - Formulas are tilted at random, never more than 45°, and some are underlined.

### 4.2 Ocean (called "Deep sea" until v78; the internal id is still `sea`)
- **Water colour:** light turquoise at the surface, darkening every 100 m down to near-black navy by about 1,000 m, then staying there.
- **The start** (since v71): the plane dives in from the surface: sky with clouds above, waves with a line of foam, a paper boat bobbing on the water off to one side, and sunlit shallows with ripples of light below. It slides up out of view within the first ~35 m; fish are only drawn below the water line while it shows, and the top bar has no background fade.
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
- **Earth** (since v64): the plane starts just below the Earth, a big curved cap across the top of the first screen with ocean, dark green and brown continents, thin cloud streaks, a glowing atmosphere edge and a pale-blue haze below it. As the plane falls away the Earth slides up and shrinks a little, gone by about 35 m. The top bar has no background fade while the Earth is in view, so it does not cover it.
- **Background scenery** (faded, never collides):

| Depth | Scenery |
|---|---|
| 0–150 m | Small satellites, the space station, a waving astronaut |
| 150–400 m | Satellites, astronauts, the Moon, comets |
| 400–800 m | Mars, Saturn, the Moon, comets |
| 800–1,500 m | Saturn, Mars, spiral galaxies, comets |
| 1,500 m + | Galaxies, a black hole with a glowing ring, comets, and deeper down a whale made of stars |
| Anywhere below 300 m | Rarely, a small UFO zipping past |

### 4.4 Dungeon (since v68)
The plane is dropped down a deep, ancient dungeon well and falls past torch-lit stone, into caverns, then down to a lava-lit underworld. Cartoon and playful: friendly skeletons, not gore. (The brainstorm is in section 14.)
- **Walls:** stone bricks (rows of 37.5 units, one CSS layer like the sea bubbles; since v79 every mortar line is the same thickness, before that every fourth row was half as thick because it sat on the tile edge) over a colour that changes every 100 m: grey stone in the well, warm torch-lit browns, cold blue-purple caverns from about 400 m, then deep reds of the underworld below 800 m.
- **The well opening:** at the start, a disc of blue sky with a cloud sits in the stone ring above the plane, with a rope and bucket hanging below the rim and a soft beam of daylight falling down the shaft. It slides up out of view within the first ~35 m (like the Earth in Space); the top bar has no background fade while it is in view.
- **Drifting specks:** dust motes in the torchlight (100–400 m), water drips falling (400–1,000 m), then embers rising and flickering.
- **Background scenery** (faded, never collides):

| Depth | Scenery |
|---|---|
| 0–150 m | Wall torches with a flickering glow, bats, cobwebs in the corners, hanging chains |
| 150–400 m | Torches, bats, a rat, chains, a treasure chest with coins |
| 400–800 m | Bats, glowing crystals (blue, purple or green), cobwebs, yellow eyes in the dark, glowing mushrooms |
| 800–1,500 m | Crystals, eyes, mushrooms, a sitting skeleton (faint grey, so it never reads as a skull obstacle) |
| 1,500 m + | Eyes, skeletons, lava falls, crystals |
| Anywhere below 300 m | Rarely, a dragon's silhouette gliding far behind |

---

## 5. Obstacles

"Starts at" is the depth where an obstacle first joins the pool of possible obstacles. Every obstacle picks a colour variant when it spawns, and obstacles of the same kind in one row share that colour.

### 5.0 All obstacles at a glance
One row per mechanic (section 6), names only; the details are in 5.1–5.4. For Dungeon, the looks of each obstacle are separated by " / ". No map uses the Telegraphed Slam.

| Mechanic | Paper | Ocean | Space | Dungeon |
|---|---|---|---|---|
| Gap Wall | Rulers | Coral ledges | Station girders | Stone ledges / wooden beams / iron girders / goblin scaffolding |
| Closing Jaws | Erasers | Giant clam | Airlock doors | Spiked crushers / spiked iron doors / battering rams / goblin barricade |
| Static Hazards | Ink blots | Sea urchins | Asteroids, black hole | Spiked iron balls / cauldrons / boulders / tombstones |
| Wall Bulge | Protractor | — | Moon edge, planets, battle station | Rock outcrop / giant shield / barrel end / giant jack-o'-lantern |
| Bouncing Slider | Pencil | — | GPS satellite, ISS | Wooden plank / long bone / wizard staff / witch's broom / crescent staff / twisted staff |
| Rising Projectile | Paper wad | — | Rocket | Skull / jack-o'-lantern / slime ball / potion flask; magic rings |
| Drifting Swarm | Sticky notes | Jellyfish | Ice chunks | Ghosts / spellbooks / will-o'-wisps / witch hats / goblins |
| Conveyor | Paper clips | — | Starlink train | Daggers / arrows / keys |
| Spinning Drifter | Set square | Starfish | Tumbling asteroid | Saw blade / spiked wheel / eyeball / spiked goblin shield |
| Spinning Blades | Scissors | — | — | Crossed swords / spears / staffs |
| Sweeping Arm | Drawing compass | — | Robot arm | Fire bar / chain with a spiked ball |
| Wall Piston | Cutter | Moray eel | Docking probe | Spear / trident / sword blade / goblin club; flamethrower |
| Wall Turret | Glue tube | Submarine | Twin-wing fighter | Dragon head / gargoyle / cannon / goblin with a slingshot |
| Charged Beam | — | Electric eel | Laser gate | Rune stone / crystal cluster |
| Telegraphed Sweep | Cat paw | Kelp | Energy blade | Skeleton arm / tentacle / thorny vine / reaper's scythe |
| Proximity Blast | — | Naval mine | — | Cursed rune / spore mushroom |
| Push Zone | Desk fan | Ocean current | — | Cold draft / steam vent |
| Effect Zone | — | Bubble column | Low-gravity field | — |
| Spring Line | Rubber band | — | — | Spider web / slime strand |
| **Total** | **16** | **12** | **19 kinds on 15 mechanics** | **20 obstacles, 65 looks** |

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

### 5.2 Ocean map (12 types)
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

### 5.3 Space map (19 kinds on 15 mechanics, since v53; 6 added in v57)
Every Space obstacle reuses the movement and collision of a Paper or Ocean obstacle (see `SPACE_MAKERS` in `js/obstacles.js`) with new art in `js/draw-space.js`. Outlines are pale so they read on black. Space has no wind or explosions: the solar wind and the space mine were removed in v55.

| Space obstacle | Behaviour | Based on | Starts at |
|---|---|---|---|
| Station girders | Steel trusses from both walls with a gap; red lights blink on the end plates | Rulers | 0 m |
| Asteroids | 1–3 cratered rocks that stay put. Each shows a mineral: iron (red veins), nickel (silver flecks), copper (green patches), gold (gold flecks), ice (white patches) or amethyst (purple crystals) | Ink blots | 0 m |
| Ice chunks | 2–3 hexagonal ice chunks drifting down and swaying | Sticky notes | 0 m |
| Tumbling asteroid | Spins while drifting, bouncing off the screen edges; also shows a mineral | Starfish | 0 m |
| Planet | One of the eight planets bulging in from a side, in its real colours (Jupiter with its Great Red Spot, Saturn with a faint ring that is not solid, Earth with land and clouds). Sizes keep the real order, squeezed to fit: Jupiter 120, Saturn 100, Uranus 76, Neptune 74, Earth 60, Venus 58, Mars 48, Mercury 42 units | Protractor | 0 m |
| GPS satellite | Gold-foil body with an antenna panel and blue solar wings, sliding side to side | Pencil | 0 m |
| Low-gravity field | A dashed purple zone with rising sparkles; slows the fall, never hurts | Bubble column | 0 m |
| Rocket | A small rocket with a flickering flame launched up toward the plane | Paper wad | ~35 m |
| Starlink train | A line of flat Starlink satellites crossing | Paper clips | ~50 m |
| Moon edge | A cratered moon bulging in from one side; slalom pairs deeper down | Protractor | ~65 m |
| International Space Station | A long ISS (truss, white modules, golden solar arrays) sliding side to side; thicker than the GPS satellite | Pencil | ~65 m |
| Airlock doors | Two heavy doors with hazard stripes sliding shut and open | Erasers | ~100 m |
| Docking probe | Shoots out of a hull, holds, slides back | Cutter | ~100 m |
| Black hole | A black core in a bright photon ring with a spinning accretion disc. Deadly to touch, but it does **not** pull the plane (pulling was removed with the sharpener) | Ink blot | ~100 m |
| Laser gate | Charges with a dashed line, then fires a short laser beam from the wall | Electric eel | ~135 m |
| Twin-wing fighter | A sci-fi fighter parked at a wall firing red laser bolts across; its gun glows before each shot (original design in a space-opera style) | Glue tube | ~135 m |
| Energy blade | A glowing blade (red, green, blue or purple) swings out of a hilt on the wall after a dashed warning | Cat paw | ~170 m |
| Battle station | A big grey sphere with a dish and a trench bulging in from a side (original design in a space-opera style) | Protractor | ~170 m |
| Robot arm | A station arm with a claw swinging all the way round its base | Drawing compass | ~215 m |

### 5.4 Dungeon map (20 kinds on 18 mechanics: 10 in v68, 8 more in v70, the flamethrower in v81, the magic rings in v86)
Every mechanic in section 6 except the Telegraphed Slam and the Effect Zone (left out on purpose, see 14.3). Every Dungeon obstacle reuses the movement and collision of a Paper obstacle (see `DUNGEON_MAKERS` in `js/obstacles.js`) with new art in `js/draw-dungeon.js`, and every drawing stays inside its collision shape (a sword's crossguard pokes out a few units, harmlessly). The walls are dark, so obstacles are light stone, bone, wood and fire with a dark outline.

| Dungeon obstacle | Behaviour | Based on | Starts at |
|---|---|---|---|
| Stone ledges | Mossy stone slabs from both walls with a gap (sandstone, grey, mossy or reddish) | Rulers | 0 m |
| Spiked iron balls | 1–3 spiked balls (iron, rust or bronze) that stay put | Ink blots | 0 m |
| Wooden plank | An iron-banded plank sliding side to side | Pencil | 0 m |
| Rock outcrop | A cracked, mossy boulder bulging in from one side; slalom pairs deeper down | Protractor | 0 m |
| Bouncing skull | A grinning skull thrown up toward the plane, spinning and bouncing off the walls | Paper wad | 0 m |
| Ghosts | 2–3 little ghosts ("ooo" mouths, pink cheeks) drifting down and swaying | Sticky notes | ~35 m |
| Dragon statue | A dragon head on the wall spitting fireballs across; embers glow in its mouth before each shot | Glue tube | ~65 m |
| Spear trap | A stone block in the wall shoots out a spear, holds, pulls it back | Cutter | ~100 m |
| Spiked crusher | Two stone blocks with spiked faces sliding shut and open | Erasers | ~150 m |
| Fire bar | A chain of fireballs turning all the way round a stone pivot (orange, or magic blue or green fire); its flames are thicker than a compass leg, so its hit box is too | Drawing compass | ~215 m |
| Spider web (v70) | A silk strand between two little spiders: the strand bounces the plane sideways, the spiders hurt | Rubber band | ~30 m |
| Spinning saw blade (v70) | A toothed blade (steel or rusty) spinning as it drifts sideways, bouncing off the walls | Starfish | ~50 m |
| Flying daggers (v70) | A row of daggers crossing the shaft, each pointing the way the row moves | Paper clips | ~50 m |
| Crossed swords (v70) | Two swords spinning round a rivet and scissoring open and shut | Scissors | ~80 m |
| Cold draft (v70) | Icy streaks and snowflakes blowing out of a frosted crack; pushes the plane sideways, nothing solid to hit. Only before 700 m, like all wind | Ocean current | ~80 m |
| Cursed rune (v70) | A floating stone disc with a glowing eye: as the plane comes near it flickers and shows its blast circle, then bursts in a ring of magic (purple, pink or green) | Naval mine | ~120 m |
| Rune beam (v70) | A rune stone on the wall: its runes light up and a dashed line shows the path, then a magic beam fires | Electric eel | ~135 m |
| Skeleton arm (v70) | A dashed wedge shows its reach, then a bony arm swipes out of a crack in the wall | Cat paw | ~135 m |
| Flamethrower (v81) | An iron nozzle in the wall with a flickering blue pilot light; a jet of flame shoots out, holds, then dies back. Its own obstacle (own spawn chance), always this look | Cutter | ~120 m |
| Magic rings (v86) | Cartoon rings after a sheet of fantasy rings, thrown up the shaft spinning and bouncing off the walls. 9 designs: emerald (gold, big green gem), sapphire (silver, blue oval), ruby (gold, red gem with two side gems), crystal (silver, long blue crystal), amethyst (dark, a row of purple gems), amber (silver, orange hexagon), skull (dark, skull with purple eyes), zigzag (gold, engraved), leaf (silver, green leaves). Its own obstacle; since v87 its spawn weight is 3 (was 1.2), so rings are about 10% of rows, as common as the stone ledges, about 5–6 rings per run to 500 m | Paper wad | ~65 m |

**Looks and colours** (since v73): every Dungeon obstacle comes in two to five different objects that share its mechanic and hit box, each in a few colours (64 looks in all; 12 Halloween and goblin looks added in v80, two mage staffs in v82; `DUNGEON_LOOKS` in `js/obstacles.js`). A row of the same obstacle shares one look and colour.

| Obstacle | Looks |
|---|---|
| Gap Wall | Mossy stone ledges (4 stones), wooden beams with iron brackets, riveted iron girders, rope-lashed goblin scaffolding |
| Closing Jaws | Spiked stone crushers, spiked riveted iron doors, wooden battering rams with an iron cap, goblin barricades of sharpened stakes |
| Static Hazards | Spiked iron balls (iron, rust, bronze), bubbling cauldrons (green, purple, orange brew), cracked boulders, "RIP" tombstones |
| Wall Bulge | Rock outcrops, giant round shields (red, blue, green, gold) with an iron rim and boss, huge barrel ends, a giant jack-o'-lantern with its glowing face turned to the shaft |
| Bouncing Slider | Wooden planks, long bones, wizard staffs with a glowing gem (purple, blue, red), witch's brooms, and since v82 two mage staffs: the crescent staff (night-blue shaft, silver crescent around a blue gem, blue cloth wrap; since v85 the head is twice as big, with its own round hit area of radius 11 so the larger head stays fair while the shaft keeps the thin bar) and the twisted staff (crooked wood with a little zigzag in the middle since v85, green wraps, silver bands). Until v110 they copied two anime characters' staffs (names, colours and a hanging red crystal); v111 made them original before the Android release |
| Rising Projectile | Grinning skulls, jack-o'-lanterns, slime balls with a face (green, purple, blue), bubbling potion flasks (purple, green, pink) |
| Drifting Swarm | Ghosts, flying spellbooks (red, green, purple, blue covers), will-o'-wisps (blue, green, violet), flying witch hats (purple, orange, green band), grinning goblins |
| Wall Piston | Spear, trident, sword blade, nail-studded goblin club |
| Sweeping Arm | Fire bar (orange, or magic blue, green or purple fire), iron chain with a spiked ball |
| Wall Turret | Dragon head spitting fireballs, stone gargoyle spitting green acid, iron cannon firing cannonballs, goblin leaning out of a hole with a slingshot firing rocks |
| Conveyor | Daggers, arrows (red, blue, yellow fletching), old keys (gold, silver) |
| Spinning Drifter | Saw blades (steel, rusty), spiked cart wheels, rolling eyeballs (blue, green, red iris), spiked goblin shields with a painted tooth mark |
| Spinning Blades | Crossed swords, crossed spears, crossed wizard staffs |
| Charged Beam | Rune stone, crystal cluster (pink, blue, green) |
| Telegraphed Sweep | Skeleton arm, tentacle with suckers (purple, green, pink), thorny vine with a snapping flower, the grim reaper's scythe |
| Proximity Blast | Cursed rune stone (ring of magic), glowing spore mushroom (puff of spores) |
| Push Zone | Cold draft from a frosted crack, hot steam from an iron grate |
| Spring Line | Spider web between two spiders, slime strand between two slimes |

Also fixed in v73: the spiked crusher blocks reached 9 units past their hit box (with their spikes hidden inside), so the gap looked narrower than it was; the spikes now sit at the closing edge, inside the hit box.

### 5.5 Removed obstacles (history)
These were built and then removed at the player's request: the pen (drew a wall line from the side), the stylus (expanding ripple rings), the pencil sharpener (pulled the plane), the whiteout patch (hid hazards), thumbtack rows, the magnifying glass (its sun spot chased the plane), and in v37 the coffee spill (made the plane soggy) and the rubber stamp (slammed down on a marked spot). Avoid these kinds of mechanics in future obstacles.

---

## 6. Generalized obstacles

Every obstacle in the game is one of the **20 mechanics** below, dressed in a map's art. A mechanic defines how something moves, what hurts, how it warns the player, and what can be tuned. A map's obstacle is just *mechanic + look*. The goal is to build any new map by reusing these mechanics with new drawings, instead of writing new movement and collision code each time.

In the code, the mechanic lives in the generator (`make.<name>` in `js/obstacles.js`), the movement (`updateObstacle`) and the collision (`computeShapes`), both in `js/physics.js`. The look lives in the `draw*` / `paint*` functions in `js/draw-paper.js` and `js/draw-sea.js`. The Ocean map already works this way: `SEA_MAKERS` maps each sea obstacle to the notebook generator whose mechanic it reuses.

### 6.1 Mechanic catalogue

| # | Mechanic | How it works | Warning | What hurts | Paper | Ocean | Space |
|---|---|---|---|---|---|---|---|
| 1 | **Gap Wall** | Two barriers from both walls leaving one gap; deeper down the gap slides side to side | The gap is visible | Both barriers | Rulers | Coral ledges | Station girders |
| 2 | **Closing Jaws** | Two blocks from both walls whose gap keeps opening and closing | The rhythm is visible | Both blocks | Erasers | Giant clam | International Space Station | A long ISS (truss, white modules, golden solar arrays) sliding side to side; thicker than the GPS satellite | Pencil | ~65 m |
| Airlock doors |
| 3 | **Static Hazards** | 1–3 round hazards that don't move | — | The hazards | Ink blots | Sea urchins | Asteroids (minerals), black hole |
| 4 | **Wall Bulge** | A large half-disc stuck to one wall; deeper down a pair on opposite walls forms a slalom | — | The bulge | Protractor | — | Moon edge, planets, battle station |
| 5 | **Bouncing Slider** | A long bar sliding sideways and bouncing off the walls | — | The bar | Pencil | — | GPS satellite, ISS |
| 6 | **Rising Projectile** | Thrown up the screen toward the plane, bouncing off the walls | — | The projectile | Paper wad | — | Rocket |
| 7 | **Drifting Swarm** | 2–3 items sinking slower than the plane while swaying side to side | — | Each item | Sticky notes | Jellyfish | Ice chunks |
| 8 | **Conveyor** | A row of evenly spaced pieces sliding across the screen | The gaps move with the row | Each piece | Paper clips | — | Starlink train |
| 9 | **Spinning Drifter** | One shape spinning while it drifts sideways and bounces off the walls | — | The shape (triangle or circle) | Set square | Starfish | Tumbling asteroid |
| 10 | **Spinning Blades** | Two blades spinning around a pivot while opening and closing, drifting slowly | — | Blades and handles | Scissors | — | — |
| 11 | **Sweeping Arm** | An arm rotating all the way around a fixed pivot | The arc it traces | Arm and pivot | Drawing compass | — | Twin-wing fighter | A sci-fi fighter parked at a wall firing red laser bolts across; its gun glows before each shot (original design in a space-opera style) | Glue tube | ~135 m |
| Energy blade | A glowing blade (red, green, blue or purple) swings out of a hilt on the wall after a dashed warning | Cat paw | ~170 m |
| Battle station | A big grey sphere with a dish and a trench bulging in from a side (original design in a space-opera style) | Protractor | ~170 m |
| Robot arm |
| 12 | **Wall Piston** | Shoots out from a wall, holds, then retracts on a loop | The body at the wall | Base and extended part | Cutter | Moray eel | Docking probe |
| 13 | **Wall Turret** | Mounted on a wall, fires projectiles straight across on a timer | Bow or nozzle cue before firing (sea version) | Base and projectiles | Glue tube | Submarine | Twin-wing fighter |
| 14 | **Charged Beam** | On a wall; charges, then a beam crosses part of the screen for a moment | Dashed preview line while charging | Base and beam | — | Electric eel | Black hole | A black core in a bright photon ring with a spinning accretion disc. Deadly to touch, but it does **not** pull the plane (pulling was removed with the sharpener) | Ink blot | ~100 m |
| Laser gate |
| 15 | **Telegraphed Sweep** | A dashed wedge shows the danger area, then an arm swipes through it in an arc from a wall | Dashed wedge | The arm and its tip, only mid-swipe | Cat paw | Kelp | Energy blade |
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

**Slow motion** (since v54, timed, no levels): a white badge with a purple rim and an hourglass. Picking it up runs the whole game at half speed for 4 seconds (falling, obstacles, steering), with a soft purple tint and a purple bar just above the plane that shrinks toward its centre as time runs out (since v58), plus a falling "whoosh" sound. It only appears from 300 m on (since v58), and only when slow motion is not already running.

**Invincibility star** (since v59, timed, no levels; an original design inspired by the classic platformer star): a white badge with a gold rim and a shining yellow star. For 6 seconds nothing can hurt or move the plane: it flies straight through obstacles (wind, rubber bands and bubbles don't push or slow it either, since v62) with a rainbow outline cycling through the colours, rainbow sparkles and a gold bar over the plane showing the time left. The outline flickers in the last 1.5 seconds as a warning. Picking it up shows "Invincible!" with a quick twinkling run of notes. It is the rarest power-up (offered half as often as the others), appears from 150 m on, and only when no star is running.

**Speed boost** (since v69, timed, no levels): a white badge with a green rim and a red cartoon running shoe with speed lines. Picking it up makes the plane fall 10% faster for 5 seconds (real seconds, so slow motion does not stretch it); steering is unchanged. During the boost the plane can go 10% above the usual top speed (the 600 m cap). Shows "Speed boost!" in green with a rising whoosh. It appears from 100 m on, and only when no boost is running. There are no speed lines behind the plane (the plane trail was removed in v36).

**The Squid** (since v109, a debuff, timed, no levels): a white badge with a dark ink rim and a pink cartoon squid with a puff of ink. Flying through it splats 3–4 big ink blobs over the screen for 3 seconds (real seconds): they pop in at random spots below the plane (where obstacles come from, never over the plane), hide whatever is under them, and fade out over the last second. On dark maps the ink is a lighter purple with a pale edge so it reads as ink. Shows "Inked!" with a low splat sound. Nothing pulls the squid in (neither the magnet nor the near-miss pull), the invincibility star flies straight through it, and a shield does not block it (it is not a crash). It appears on every map from 200 m on, offered as often as the other power-ups, and only when no ink is on screen (`INK_TIME`, `INK_FROM_M` in `js/state.js`, `inkSplats` in `js/physics.js`, `drawInk` in `js/render.js`).

**Time-left bars:** each running timed power-up shows a bar above the plane that shrinks toward its centre: slow motion (purple) nearest the plane, then the invincibility star (gold), then the speed boost (green), then the squid's ink (dark), stacked without gaps.

- **Spawning:** from about 30 m on, a row can carry a power-up instead of a star, with at least about 45 m between power-ups (so roughly one every 50–80 m). A magnet or shield already at level 3 is not offered (a used shield level can be picked up again); once both are at level 3, only the timed power-ups (slow motion, the star and the speed boost) are still offered.
- **Feedback:** "Magnet level 2!", "Shield level 3!", "Slow motion!", "Invincible!" or "Speed boost!" pops up in the power's colour, with a burst of sparks and a chime. Since v72 the message appears just under the plane and follows it as it fades, so it is easy to read (before, it stayed where the power-up was caught and scrolled up past the plane). Since v75 "Shield used!" appears there too. On dark maps every pop-up text (power-ups, shield saves, the "100 m!" milestones, medals, "New best!" and "+1 ★") gets a light outline so the coloured text stays readable (since v78; power-up messages only in v75). Using a shield shows "Shield used! N left".
- **Stars:** stars caught in a run are added to a saved total when the run ends. The top bar shows the total during a run. Since v74 two gold stars never spawn less than 50 m apart (`STAR_GAP` in `js/state.js`), which roughly halved how many appear: about 1 every 50–100 m instead of every 25–35 m. Power-ups are not counted as stars.
- **Experience and levels** (since v65): every metre of a run is 1 XP, added to a saved total when the run ends (on any map). The player starts at level 1; level 1 → 2 needs 300 XP and each level after needs 200 XP more than the one before (300, 500, 700, 900 …, so level 5 at 2,400 XP and level 10 at 9,900 XP). The start screen shows a yellow level badge beside a green bar and "440 / 700 XP" toward the next level. The game-over screen shows the same box with "+234 XP", the bar filling up; on a level up it fills to the end, starts over at the new level, and a green "Level up! Level N" badge appears with a rising fanfare. Change the curve in `js/state.js` (`xpNeed`).
- **Collections** (since v88): a "Collections" button (no count since v105) under Play on the start screen, and only there since v107 (it was also on the game-over screen in v89–v106 and in the pause menu in v97–v98; the game-over screen now has a Main Menu button instead) opens a screen of sets of special obstacles. An item is found the first time it appears on screen during a run (even if you then crash into it); found items are saved per device. Locked items show as black silhouettes, found ones in full colour with the game's own art, and tapping one shows it large with its name. No pop-up when something is found and no reward for completing a set (player's choice). Since v92 collectibles appear at most once per run: each staff and each ring design spawns once (two rings in one row get different designs), and once both staffs have appeared the Bouncing Slider only uses its other looks. Since v98 the rule is the same for every set: collectibles are obstacles with a specific variant which only appear once per run, and when all collectibles of an obstacle have appeared, the obstacle still appears with its regular variants. Once all 9 rings have appeared (usually by 700–1,000 m), ring spawns become regular Rising Projectiles (skull, jack-o'-lantern, slime ball, potion). Since v94 each set panel names its map, and the screen says "Find these in your runs to unlock them." The Collections screen says "Collectibles are obstacles that only appear once per run." (`runCollected` in `js/state.js`, `ringsLeft` in `js/obstacles.js`). Esc or Back returns to the screen it was opened from. Sets (`COLLECTIONS` in `js/collections.js`):

  | Set | Items |
  |---|---|
  | Mage staffs | Crescent staff, twisted staff (Dungeon, Bouncing Slider looks). Called "Frieren" until v110; the save ids `staff-frieren` and `staff-fern` were kept so found items stay found (`COLLECTIBLE_LOOKS` in `js/obstacles.js`) |
  | Enchanted rings | The 9 Dungeon magic rings: emerald, sapphire, ruby, crystal, amethyst, amber, skull, zigzag, leaf (called "Rings of Power" until v110) |
  | Origami (v102) | Six folded-paper figures on the Paper map: crane, frog, boat, star, fox, butterfly (Drifting Swarm variants of the sticky notes, faceted in three paper tones). In a sticky-note row each note has a 50% chance to be an origami not yet seen this run; once all 6 have appeared the notes are plain sticky notes again |
  | Seashells (v103) | Six shells in the Ocean: conch, scallop, nautilus, cowrie, sand dollar, pearl oyster (Static Hazards variants of the sea urchins, scaled to the urchin's hit circle). Each urchin has a 40% chance to be a shell not yet seen this run; once all 6 have appeared the urchins are plain again |
  | Legendary fish (v106) | Five fish in the Ocean: golden fish, narwhal, coelacanth, giant squid eye, ghost shark (Spinning Drifter variants of the starfish: they spin and drift like a starfish and are drawn inside its hit circle). Each starfish has a 50% chance to be a fish not yet seen this run; once all 5 have appeared the starfish are plain again. Unlike the background fish, these collide |
  | Legendary swords (v105) | Six original swords in the Dungeon: flame sword, frost blade, crystal sword, desert scimitar, rune blade, bone sword (Spinning Blades variants of the crossed swords; both blades of the pair are the same sword, drawn inside the blade hit shape). Each Spinning Blades obstacle has a 70% chance to be a sword not yet seen this run; once all 6 have appeared it uses its regular looks again |
  | Planets (v94) | The 8 Space planets, Mercury to Neptune (Wall Bulge). Each appears at most once per run; once all 8 have, planet spawns become regular moon edges (since v98; in v94 planets stopped). In the menu they are drawn whole (Saturn with its ring) on a dark-space background |

- **Plane:** one classic white paper plane; the crumpled ball and paper scraps match it. There are no skins (removed in v42) and no trail (removed in v36).

---

## 8. Music

Background music is composed and played in code (`js/music.js`), in the style of a fantasy MMORPG soundtrack such as Knight Online's: minor keys, harp arpeggios, string pads and flute or horn leads. The melodies are original.

| Theme | Plays | Feel |
|---|---|---|
| Title | Start menu and game over | Slow, noble horn melody in E minor over strings, with a soft drum (72 bpm, about 27 s loop) |
| Paper | During Paper runs | Light pastoral town theme in D minor: flute over flowing harp eighths (88 bpm, about 22 s loop) |
| Ocean | During Ocean runs | Slow and dark in A minor: echoing harp, low lonely flute, deep bass (64 bpm, about 30 s loop) |
| Space | During Space runs | Dreamy and floating: shimmering echoing harp over soft major-seventh chords and a slow, high, wavering lead (70 bpm, about 27 s loop) |
| Dungeon | During Dungeon runs | Slow and mysterious in D minor: a low horn melody over echoing harp, with a soft drum on the downbeats (66 bpm, about 29 s loop) |

- Themes cross-fade when they change. Pausing lowers the music to 30%; hiding the tab silences it.
- The music sits below the sound effects (peaks about 0.08 against about 0.10 for a star chime).
- Each theme is 8 bars; notes are scheduled half a second ahead of the audio clock, so the game loop is not involved.

## 8b. Settings

| Setting | Where | Notes |
|---|---|---|
| Sound on/off | Top bar (speaker icon, crossed out when muted) | Mutes sound effects and music together. Both are generated in code (Web Audio), with no audio files |
| Pause / Resume | Top bar (pause icon, becomes a play icon while paused), Space bar, Esc (P no longer pauses since v67) | Also pauses automatically when the tab is hidden |
| Exit run | Pause menu, under Resume (since v71) | Ends the run and goes straight to the start menu. The run keeps what it earned, like a crash: a new best depth, its stars, and its metres as XP |
| Map | Start and game-over screens | Paper / Ocean / Space / Dungeon picture tiles |

### Saved data (browser localStorage)
`nosedive-best-notebook`, `nosedive-best-sea`, `nosedive-best-space`, `nosedive-best-dungeon` (best depth per map), `nosedive-bank`, `nosedive-xp` (total experience), `nosedive-collection` (ids of the collection items found), `nosedive-map`, `nosedive-muted`, `nosedive-res` (remembered render resolution). All of them are per browser and per device.

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
├── fonts/                  Kalam and Patrick Hand (woff2, Latin + Latin Extended), fonts.css and their OFL licence files
├── README.md               this document
├── CLAUDE.md               short working notes for Claude Code (loaded automatically)
├── tools/                  dev-only test, screenshot and bundle scripts (see 10.5)
├── app/                    the Android app: Capacitor wrapper and build script (see section 18)
└── js/                     19 game scripts, listed in the order they load
    ├── core.js             constants, helpers, saved settings, screen sizing, sprite cache
    ├── audio.js            sound effects
    ├── music.js            background music for the menus and each map
    ├── paper-background.js Paper map: pencil formulas by depth
    ├── sea-background.js   Ocean map: fish, specks, whales, shipwrecks
    ├── space-background.js Space map: the Earth at the start, satellites, planets, comets, galaxies
    ├── dungeon-background.js Dungeon map: the well opening, torches, bats, crystals, lava falls, dust and embers
    ├── state.js            game state, power-up levels, controls, speed and difficulty rules
    ├── obstacles.js        obstacle generators and row spawning, for all maps
    ├── physics.js          collision, obstacle movement, steering, per-frame update
    ├── maps.js             map definitions, page and water colours, paper background drawing
    ├── draw-paper.js       Paper obstacle art
    ├── draw-sea.js         Ocean obstacle art
    ├── draw-space.js       Space obstacle art
    ├── draw-dungeon.js     Dungeon obstacle art
    ├── render.js           plane, screen shake, frame drawing, map switching
    ├── ui.js               top bar, menus, start / pause / game over
    ├── collections.js      Collections: the sets, finding items during a run, the Collections screen
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
| Which obstacles spawn, when they unlock, their colours | `js/obstacles.js` (`make`, `PALETTES`, `seaPool`, `SEA_MAKERS`, `spacePool`, `SPACE_MAKERS`, `dungeonPool`, `DUNGEON_MAKERS`, `DUNGEON_LOOKS`, `spawnRow`) |
| How an obstacle moves or what counts as a hit | `js/physics.js` (`updateObstacle`, `computeShapes`) |
| How an obstacle looks | `js/draw-paper.js`, `js/draw-sea.js`, `js/draw-space.js` or `js/draw-dungeon.js` (`draw*` / `paint*`) |
| Background decorations | `js/paper-background.js` (formulas), `js/sea-background.js` (fish, specks, silhouettes), `js/space-background.js` or `js/dungeon-background.js` (scenery, specks, the opening at the start) |
| Page and water colours, a new map entry | `js/maps.js` (`MAPS`, `RAINBOW`, `SEA`, `SPACE`, `DUNGEON`) and the map tiles in `index.html` |
| Plane look | `js/core.js` (`PLANE` colours), `js/render.js` (`paintPlane`) |
| Power-ups | `js/state.js` (`POWER_MAX`, `MAGNET_RANGES`, `POWER_GAP`, `SLOWMO_TIME`, `STAR_TIME`, `timeScale`), `js/obstacles.js` (`pickPower`), `js/physics.js` (`collectPower`, `useExtraLife`), `js/render.js` (`drawPower`, `paintPowerIcon`) |
| Collections (sets, items, the screen) | `js/collections.js` (`COLLECTIONS`, `noteFound`, `renderCollections`, `paintCollectionItem`) |
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
| `state.js` | `state`, `plane`, `obstacles`, `dist`, `speed`, `POWER_MAX`, `MAGNET_RANGES`, `press` / `release`, `depthM`, `difficulty`, `baseFallSpeed`, `reset`, `xp`, `xpNeed`, `levelInfo` |
| `obstacles.js` | `make` (generators), `PALETTES`, `DUNGEON_LOOKS`, `SEA_MAKERS`, `seaPool`, `spawnRow`, `spawnFromPool`, `spawnRows` |
| `physics.js` | `computeShapes` / `shapes`, `circleHits` (circles, rotated boxes, convex polygons), `planeCircles`, `updateObstacle`, `steer`, `update`, `crash` |
| `maps.js` | `MAPS`, `mapId`, `SEA`, `RAINBOW`, `isDark`, `syncHudPage`, `drawPaper`, `drawFormulas`, `drawDepthMarkers` |
| `draw-paper.js` | Paper obstacle `draw*` / `paint*` functions (`drawRuler`, `paintPencil`, `drawScissors`, `drawFan`, `drawPaw`, …) |
| `draw-dungeon.js` | `drawDungeonObstacle` (picks the art for each mechanic), `paintSlider` and `paintRing` (also used by the Collections screen), `drawLedge`, `drawCrusher`, `drawSpikeBall`, `drawRockOutcrop`, `drawPlank`, `drawSkull`, `drawGhost`, `drawSpear`, `drawFireBar`, `drawDragonHead` |
| `dungeon-background.js` | `DUNGEON_TIERS`, `spawnDungeonThing`, `wellOpeningY`, `drawDungeonDetails`, `drawDungeonParticles` (scenery joins the `FISH` table) |
| `draw-sea.js` | `drawCoral`, `drawClam`, `drawUrchin`, `drawJelly`, `drawMoray`, `drawZap`, `drawKelp`, `drawSub`, `drawStarfish`, `drawMine`, `drawBubbleColumn` |
| `render.js` | `paintPlane`, `drawPlane`, `syncPaperLayers`, `render`, `applyMap` |
| `ui.js` | `updateHud`, `showCard`, `setXp`, `animateXp`, `start`, `pause`, `resume`, `exitRun`, `keepRunProgress`, `gameOver` |
| `collections.js` | `COLLECTIONS`, `COLLECTION_TOTAL`, `collectionFound`, `noteFound`, `paintCollectionItem`, `renderCollections`, `openCollections` |
| `main.js` | `watchFrameRate`, `frameInterval`, `frame` |

### 10.5 Dev tools (`tools/`)

Not used by the game; for testing during development. Set up once with `cd tools && npm install` (installs puppeteer-core; Chrome must be installed, or set `CHROME` to its path). Output goes to `tools/out/`, which git ignores.

| Command | What it does |
|---|---|
| `node tools/test.js [depth]` | Loads the game in headless Chrome and checks: title screen, menus, deep runs on all four maps to 2,500 m (or `depth`) with every obstacle type appearing, normal runs ending in game over, pause and resume, no page errors. Exits with code 1 on any problem. |
| `node tools/shot.js <notebook|sea> <depth…>` | Phone-size (412×860) gameplay screenshots at those depths |
| `node tools/shot.js title [sea]` | Title screen screenshot |
| `node tools/bundle.js [out.html]` | Inlines `style.css` (with `img/` pictures as data URLs), the bundled fonts (as data URLs) and the scripts into one page (for a single-file copy) |

---

## 11. Direction

**Current focus: three maps, Paper, Ocean and Space,** each chosen from the menu. Any new map should be built from the mechanics in section 6, with new art.

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
- **Missions:** three small goals at a time, replaced when done ("Pass 3 mines in one run", "Collect 10 stars", "Reach 300 m in Ocean"). They pay stars and point players at things they would not try on their own.
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
- **Dungeon** (built in v68 and v70 with 18 obstacles, see 4.4 and 5.4; brainstorm in section 14): stone ledges, pendulum blades, spear traps, fireballs and bat swarms, from a torch-lit well down to a lava-lit underworld.

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

Like the water darkening in Ocean, the background changes every so often:

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

About 12 of these would be a good set (Ocean has 12).

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

---

## 14. Dungeon map — brainstorm (built: 10 obstacles in v68, the other 8 in v70; see 4.4 and 5.4)

A fourth map, following the rule in 12.5: reuse the 20 mechanics in section 6 with new art.

### 14.1 The premise

The plane is dropped down a deep, ancient dungeon well and falls past torch-lit stone, into caverns, then down to a lava-lit underworld. Cartoon and playful like the other maps: friendly skeletons, not gore.

### 14.2 Background by depth

Like the water darkening in Ocean:

| Depth | Look |
|---|---|
| 0–100 m | Daylight from the well's opening at the top fading into grey stone bricks (like the Earth at the start of Space) |
| 100–400 m | Torch-lit dungeon: warm flickering light, mossy bricks, chains |
| 400–1,000 m | Dark caverns: crystals glowing blue and purple, dripping water |
| 1,000 m + | The underworld: deep red glow from lava far below, embers drifting up |

**Background scenery** (never collides, like the fish): bats fluttering, wall torches, a rat on a ledge, cobwebs, a sleepy ghost, a treasure chest, glowing eyes in the dark. Rare surprise: a dragon's silhouette passing far behind.

### 14.3 Obstacles, reusing the mechanics (section 6)

| Mechanic | Dungeon look |
|---|---|
| Gap Wall | Stone ledges from both walls with a gap |
| Closing Jaws | A spiked portcullis or two crushing stone blocks |
| Static Hazards | Spiked iron balls, skulls |
| Wall Bulge | A rounded rock outcrop or a big barrel |
| Bouncing Slider | A wooden beam or log sliding side to side |
| Rising Projectile | A fireball thrown up from below, bouncing off the walls |
| Drifting Swarm | Bats or ghosts drifting down |
| Conveyor | A row of swinging blades, or a moving chain of spiked links |
| Spinning Drifter | A spinning throwing axe or shuriken |
| Spinning Blades | Two crossed swords spinning |
| Sweeping Arm | A huge pendulum blade on a pivot |
| Wall Piston | A spear trap shooting out of the wall |
| Wall Turret | A dragon-head statue spitting fireballs, or an arrow trap |
| Charged Beam | A magic rune that charges, then fires a beam |
| Telegraphed Sweep | A giant tentacle or skeleton arm swiping out of the wall |
| Proximity Blast | A cursed rune on the floor that glows, then blasts |
| Push Zone | Cold draft from a crack in the wall (only before 700 m, like all wind obstacles) |
| Spring Line | A spider web stretched between two anchors that bounces the plane away |

Left out on purpose: **Telegraphed Slam** (the rubber stamp was removed, so no falling crusher) and **Effect Zone** (a slowing debuff is close to the removed coffee spill). That gives about 18 obstacle types, more than Space (15).

### 14.4 Extras

- **Music:** a slow, mysterious theme in a minor key with low drums and an echo, like the Ocean theme.
- **Map tile:** grey stone bricks with a torch and an orange glow.
- **Colours:** light text and markers on the dark stone, as in Ocean.

### 14.5 Open questions

1. Mood: **caves and lava** as above, or a **castle dungeon** (chains, knights' armour, prison cells)?
2. Keep the **Proximity Blast** (cursed rune)? Explosions were removed from Space (v55).
3. Build all ~18 obstacles at once, or start with a **smaller set** (about 10) to try first?

---

## 15. Recommended next changes (review at v75, not built yet)

A review of the whole game after v75. Nothing here goes against the player decisions in CLAUDE.md (no shop, no skins, no trail, no tutorial, three drift positions). Ordered by value.

1. **Give stars and levels a purpose (the biggest gap).** Stars pile up with nothing to spend them on, and levels unlock nothing. Since v74 stars are rarer, so they feel more valuable, but they still do nothing. Two ideas that fit the rules:
   - **Levels unlock maps:** for example Ocean at level 2, Space at level 4, Dungeon at level 6. Every run then has a goal, and new content is paced.
   - **Stars buy a one-time "second chance" per run,** offered on the crash screen for a cost. It is a single in-run choice, not a shop.
2. **"Crumpled by…" on the game-over screen** (note: the "Crumpled!" heading was removed in v84 because players know they crashed; if this is built, show only what hit you, for example "Fire bar · 412 m", without a crash heading), for example "Crumpled by a fire bar at 412 m". Knowing what got you makes a crash feel fair and teaches the obstacles, which matters more now that there are 60+ looks. Also a top pick in 12.1, and cheap.
3. **Close-call rewards:** passing very close to a hazard without touching it shows "Close!" with a small sparkle, and now and then a bonus star. Rewards skilled steering, the core of the game (see 12.2).
4. ✅ **Done in v78.** **Readability on dark maps:** the "100 m!" milestone text and the medal pop-ups are dark blue and hard to read on Dungeon, Space and ocean. The light outline added to the messages under the plane in v75 would fix it. Quick.
5. **Separate music and sound toggles:** one button mutes both today; many players want the effects without the music, or the other way round. Small.
6. **Phone vibration on a crash and on a shield save:** a short buzz makes hits feel real (works on Android; iPhones ignore it harmlessly). Very small.

**Smaller things noticed along the way:**
- In Space, an Earth planet obstacle can appear right after the plane leaves the real Earth; it could be blocked for the first 100 m.
- The speed boost goes 10% past the top-speed cap (v55); it could be limited if the cap should always hold.
- Two test checks fail at random now and then (the desk fan, which only appears before 700 m, and the power-up counts in short 800 m runs); making them reliable means a failure always means something real. ✅ The wind check is fixed in v87: when a deep run misses its wind obstacle, the test looks again in up to 6 short runs to 760 m. The short-run power-up counts can still miss.
- Dungeon has 18 obstacle types against 12–16 on the other maps; worth a few play-throughs to see if it feels harder, and if so its obstacles could unlock a little later.

**Suggested first three:** 1 (a purpose for stars and levels), 2 ("Crumpled by…") and 4 (readability).

---

## 16. Daily quests — brainstorm (on hold: not to be built for now, player's decision of 2026-10-19)

A planned "Daily quests" section in the main menu. The ideas below use things the game already tracks, so most are cheap to add. Three a day works well: one easy, one medium, one hard.

### 16.1 Quest ideas

**Distance**
- Reach 200 m in one run (easy) / 500 m (medium) / 1,000 m (hard)
- Fall 1,500 m in total today, across all runs
- Reach 300 m on a specific map ("Reach 300 m in the Ocean")
- Beat your best on any map

**Stars**
- Collect 5 / 10 / 20 stars today
- Collect 3 stars in a single run

**Power-ups**
- Pick up 3 power-ups in one run
- Use the speed boost 2 times today
- Get the magnet or shield to level 3 in one run
- Catch an invincibility star
- Get saved by a shield 2 times today

**Maps**
- Play a run on every map today
- Play 3 runs in the Dungeon
- Earn a medal you don't have yet

**Skill**
- Reach 150 m without picking up any power-up
- Reach 250 m without getting the shield
- Reach 300 m while staying out of the left half of the screen (needs new tracking, but fun)

**Light, for casual days**
- Play 5 runs today
- Gain 1,000 XP today

### 16.2 Suggested design

- **Rewards:** quests pay XP, for example 150 / 300 / 600 by difficulty. That gives a level-up feel without going against the "no shop" decision. Stars as a reward only make sense once stars have a use (see section 15).
- **Reset:** new quests at local midnight, picked at random from the pool, never the same quest twice in one day.
- **Menu:** a "Daily quests" button on the start screen opens a card with the three quests, each with a progress bar ("3 / 5 stars") and a tick when done. When a quest completes mid-run, a pop-up appears under the plane ("Quest done! +300 XP"), like the power-up messages.
- **Bonus:** finishing all three gives an extra reward, for example +500 XP.

### 16.3 Open questions

1. Which quests from the list to use (or all of them)?
2. Rewards: XP, stars, or both?
3. Three quests a day, or a different number?
4. Allow swapping one unwanted quest once per day?

---

## 17. More collection sets — ideas (not built yet)

Ideas for new Collections sets (see Collections in section 7). The best fit is one set per map, so every map has a reason to be played, not only the Dungeon. Like the current sets, these items would be collectibles: each appears at most once per run, and is found the first time it shows on screen.

### 17.1 Cheap: the art already exists

- ✅ **Built in v94.** **Space · Planets (8):** Mercury to Neptune are already Wall Bulge obstacles; making them collectible is mostly bookkeeping, and the Collections screen would show them in their real colours. A rare **Pluto** could be a ninth, hard-to-find item.
- **Dungeon · Potions (6):** the potion flask (Rising Projectile) already exists in three colours; it could become six named potions: Healing (red), Mana (blue), Poison (green), Invisibility (clear), Fire (orange), Luck (gold).

### 17.2 New art, existing mechanics

- ✅ **Built in v102.** **Paper · Origami (6):** a paper crane, frog, boat, star, fox and butterfly drifting down the page (Drifting Swarm, like the sticky notes). Fits a game about a paper plane.
- ✅ **Built in v103.** **Ocean · Seashells (6):** a conch, scallop, nautilus, cowrie, sand dollar and a pearl in an open oyster, resting in the water (Static Hazards, like the sea urchins).
- ✅ **Built in v106.** **Ocean · Legendary fish (5):** a golden fish, a narwhal, a coelacanth, a giant squid eye and a ghost shark (Spinning Drifter, like the starfish).
- **Space · Space probes (5):** Sputnik, Voyager, Hubble, the Apollo capsule and a Mars rover (Bouncing Slider, like the GPS satellite).
- ✅ **Built in v105.** **Dungeon · Legendary swords (6):** six original swords (flame, ice, crystal, curved, rune, bone), scissoring like the crossed swords (Spinning Blades).

### 17.3 More fantasy sets

- Built the same way as the mage staffs and the rings, for example another staff or weapon. Designs must be original: no characters, names or recognizable designs from anime, films or games (the game is headed for Google Play; see v111). Reference pictures can still go in `ref/` (which git ignores) for general inspiration, drawn in the game's cartoon style.

### 17.4 Suggested next three

**Planets** (almost free), **Origami** (fits the game best) and **Seashells** (gives the Ocean a set): every map would then have at least one collection.

---

## 18. Android app (since v112)

The same game, wrapped as an Android app with **Capacitor 8**. The website at the repo root stays the source: every build copies it into the app, so a change to the game reaches both.

- **App ID:** `io.github.vibecoding3.papernosedive` (permanent once published on Google Play). **Name:** Paper Nosedive.
- **Portrait only** (`screenOrientation` in `app/android/app/src/main/AndroidManifest.xml`).
- **Back button:** `app/native.js` (app only, never on the website) sends the phone's Back button to `goBack()` in `js/main.js`; on the start menu the app closes.
- **Saves** are the app's own `localStorage`, separate from the website's.

### 18.1 Files

```
app/
├── package.json            Capacitor packages (@capacitor/core, android, app; cli)
├── capacitor.config.json   app ID, name, web folder
├── copy-web.js             copies index.html, style.css, js/, img/, fonts/ into app/www and adds native.js
├── native.js               app-only script: the Back button
├── build.js                one command for the whole build (see 18.3)
├── www/                    the copied game (git ignores it; rebuilt every time)
└── android/                the native Android project (Gradle). Committed; its build output is ignored
```

### 18.2 One-time setup (per computer)

No Android Studio needed. Installed in `%LOCALAPPDATA%\Android` (no admin rights):

- **JDK 21** (Eclipse Temurin) in `jdk-21`. Capacitor 8 is built for JDK 21; a separate newer JDK on the PATH is fine.
- **Android SDK** in `Sdk`: command-line tools, then `platform-tools`, `platforms;android-36`, `build-tools;36.0.0` (Gradle adds build-tools 35 itself on the first build). Use the classic `sdkmanager` (command-line tools 13114758, in `Sdk/cmdline-tools/classic`): from 16111833 on, `sdkmanager` is a wrapper that first downloads Google's new "Android CLI".
- `cd app && npm install`.

`build.js` finds both by default; elsewhere set `JAVA_HOME_21` and `ANDROID_HOME`.

### 18.3 Build and install

| Command | What it does |
|---|---|
| `node app/build.js` | Copies the game, `cap sync android`, builds the debug APK: `app/android/app/build/outputs/apk/debug/app-debug.apk` (about 4.4 MB) |
| `node app/build.js --install` | Also installs it on the phone connected over USB (Developer options → USB debugging on) |

The first build downloads Gradle and its libraries (a few minutes); later builds take seconds.
