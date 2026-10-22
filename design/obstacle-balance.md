# Obstacle balance across maps: status and suggestions

Written at v152; moved from docs/ to design/ in v154 (2026-10-22). Goal: every map has the same number of obstacles, each with the same number of variants (looks).

**How this was measured:** in the game itself (headless Chrome), every obstacle type in each map's pool was spawned 400 times at depths spread from 0 to 3,000 m, recording each look it appeared with. Collectibles are counted separately. Colour variants (the same shape in another colour) aren't counted as looks.

## 1. Summary

| Map | Types in the pool | Mechanics used | Looks | Looks per mechanic | Collectibles |
|---|---|---|---|---|---|
| Paper | 19 | 19 | 26 | 1.4 | 6 (Origami) |
| Ocean | 19 | 19 | **82** | 4.3 | 19 (Seashells 6, Sunken treasures 8, Legendary fish 5) |
| Space | 21 | **17** | **24** | 1.4 | 8 (Planets) |
| Dungeon | 21 | 19 | 63 | 3.3 | 17 (Mage staffs 2, Enchanted rings 9, Legendary swords 6) |
| Neon City | 20 | 19 | 50 | 2.6 | 8 (Neon signs) |
| Forest | 19 | 19 | 48 | 2.5 | 8 (Forest birds) |
| Desert | 19 | 19 | 43 | 2.3 | 8 (Fossils) |
| Volcano | 19 | 19 | 40 | 2.1 | 18 (Volcanic stones 8, Minecraft minerals 10) |
| Kitchen | 19 | 19 | 42 | 2.2 | 8 (Pastries) |

There are 20 mechanics in the catalogue (README section 6), but **Telegraphed Slam** is unused on every map (the rubber stamp was removed in v37), so 19 are in use.

## 2. Looks per mechanic

A `*` means the map has more than one obstacle type for that mechanic (see 3.2). `—` means the mechanic isn't used on that map.

| Mechanic | Paper | Ocean | Space | Dungeon | Neon City | Forest | Desert | Volcano | Kitchen |
|---|---|---|---|---|---|---|---|---|---|
| Gap Wall | 2 | 5 | 1 | 4 | 4 | 2 | 2 | 2 | 3 |
| Closing Jaws | 1 | 4 | 1 | 4 | 3 | 3 | 2 | 2 | 2 |
| Static Hazards | 2 | 5 | 3* | 4 | 4 | 4 | 3 | 3 | 3 |
| Wall Bulge | 1 | 5 | 3* | 4 | 3* | 3 | 3 | 3 | 3 |
| Bouncing Slider | 2 | 5 | 2* | 4 | 2 | 2 | 4 | 2 | 2 |
| Rising Projectile | 2 | 4 | 1 | 4* | 3 | 4 | 5 | 2 | 2 |
| Drifting Swarm | 2 | 5 | 1 | 5 | 3 | 4 | 3 | 4 | 3 |
| Conveyor | 1 | 5 | 1 | 3 | 3 | 2 | 1 | 2 | 2 |
| Spinning Drifter | 1 | 5 | 1 | 4 | 3 | 3 | 2 | 2 | 2 |
| Spinning Blades | 1 | 4 | 1 | 3 | 2 | 1 | 2 | 1 | 2 |
| Sweeping Arm | 1 | 4 | 1 | 2 | 2 | 3 | 2 | 2 | 2 |
| Wall Piston | 1 | 4 | 1 | 5* | 3 | 2 | 2 | 2 | 2 |
| Wall Turret | 1 | 5 | 2 | 4 | 4 | 2 | 2 | 3 | 2 |
| Charged Beam | 2 | 4 | 1 | 2 | 2 | 4 | 2 | 2 | 3 |
| Telegraphed Sweep | 1 | 4 | 2 | 4 | 2 | 3 | 2 | 2 | 2 |
| Proximity Blast | 2 | 4 | — | 2 | 2 | 2 | 3 | 2 | 2 |
| Push Zone | 1 | 3 | — | 2 | 2 | 1 | 1 | 1 | 1 |
| Effect Zone | 1 | 3 | 1 | 1 | 1 | 1 | 1 | 1 | 2 |
| Spring Line | 1 | 4 | 1 | 2 | 2 | 2 | 1 | 2 | 2 |
| **Total** | **26** | **82** | **24** | **63** | **50** | **48** | **43** | **40** | **42** |

## 3. What stands out

### 3.1 Mechanics
- 8 maps use all 19 live mechanics. **Space uses 17**: it has no Push Zone (wind) and no Proximity Blast (explosion). That is a player decision from v55 ("Space has no wind or explosion obstacles at all").

### 3.2 Obstacle types per mechanic
Most maps have exactly one type per mechanic, but three don't:
- **Space** (21 types): Static Hazards has asteroids + black hole; Bouncing Slider has GPS satellite + ISS; Wall Bulge has moon edge + battle station + planet.
- **Dungeon** (21 types): Wall Piston has spear + flamethrower; Rising Projectile has skulls + the Enchanted rings.
- **Neon City** (20 types): Wall Bulge has the bulge + the neon signs.

Some of these types exist only to carry a collection (planets, rings, neon signs): once the set is complete in a run, they turn into a regular look.

**This changes how often mechanics appear.** Since v127 every pool entry has the same spawn weight, so a mechanic with two or three types is picked two or three times as often. On Space, a Wall Bulge row comes up about 3 times in 21 instead of once in 19, as on the other maps.

### 3.3 Looks
- **Spread:** from 24 (Space) to 82 (Ocean), more than three times as many.
- **Ocean is high** partly because of the sunken city (v133): from 400 to 1,500 m every Ocean obstacle switches to city looks. Its reef and abyss looks only appear in their own layers, so at any one depth an Ocean mechanic rotates through fewer looks than the total suggests.
- **Thinnest mechanics everywhere:** Effect Zone (1 look on 7 maps), Push Zone (1 look on 5 maps) and Spinning Blades (1 look on 4 maps).
- **Thinnest maps:** Space (14 of its 17 mechanics have 1 look) and Paper (12 of 19).

### 3.4 Not counted here
- **Colour variants:** for example, the Paper obstacles' palettes or the per-look colours on other maps. They add variety without new art.
- **Layer rules:** many looks only appear in some depth layers, so early runs see fewer looks than the totals.
- **Collectibles:** they're special variants of obstacles, counted in the summary only.

## 4. Suggestions

### 4.1 Pick one target for every map
| Target | What it means | Work: looks to add (and to drop, if strict) |
|---|---|---|
| **3 looks per mechanic (recommended)** | 57 looks per map (Space: 51 with its 17 mechanics) | Paper +31, Space +27, Volcano +18, Desert +17, Kitchen +15, Forest +13, Neon City +10, Dungeon +7. Over target: Ocean 25, Dungeon 13, Forest 4, Neon City 3, Desert 3, Volcano 1 |
| 4 looks per mechanic | 76 per map (Space: 68) | Paper +50, Space +44, Volcano +36, Desert +34, Kitchen +34, Forest +28, Neon City +26, Dungeon +15, Ocean +2. Over target: Ocean 8, Dungeon 2, Desert 1 |
| 2 looks per mechanic | 38 per map (Space: 34) | Least drawing, but Ocean, Dungeon and Neon City would lose a lot of art |

Each new look is one drawing function on the existing hit box; the movement and collision code stays the same.

### 4.2 One type per mechanic
To make every mechanic equally frequent, fold the extra types into looks of a single type:
- **Space:** black hole → a look of the asteroids (Static Hazards); ISS → a look of the GPS satellite (Bouncing Slider); battle station and planets → looks of the moon edge (Wall Bulge).
- **Dungeon:** flamethrower → a look of the spear piston (Wall Piston); the rings stay as collectible variants of the skulls (Rising Projectile).
- **Neon City:** the neon signs stay as collectible variants of the bulge.

The collectible save ids stay the same, so nobody loses found items. Every map then has 19 types (Space 17), and each mechanic shows up once in 19 rows.

### 4.3 Over-target maps (Ocean, Dungeon)
Deleting finished art seems wasteful. Two options:
- **Count per layer (recommended):** the rule becomes "at any depth, each mechanic rotates through 3 looks". Ocean already works this way with its reef / sunken city / abyss layers; Dungeon would need its looks assigned to layers.
- **Strict:** remove looks until each mechanic has exactly 3.

### 4.4 Space
Equal mechanics on every map would mean adding a Push Zone and a Proximity Blast to Space, which goes against the v55 decision. Either keep Space at 17 mechanics as a documented exception (recommended: the reasons still hold), or lift the rule, for example a solar-wind band and a proximity space mine.

### 4.5 Suggested order
1. **Space**: fewest looks, plus the extra types to fold in.
2. **Paper**: the starting map, so new players see it most.
3. Volcano, Desert, Kitchen, Forest, Neon City (most to least work).
4. Ocean and Dungeon last: only layer bookkeeping or trimming.

### 4.6 Ideas for the thinnest maps
These are original designs, following each map's rules in CLAUDE.md.

**Space** (to reach 3 per mechanic):
- Gap Wall: a wall of solar panels, an asteroid belt ridge.
- Closing Jaws: cargo bay doors, a pair of drifting hull plates.
- Drifting Swarm: space debris (bolts, panels), frozen comet fragments.
- Conveyor: a train of cargo pods, a chain of satellites.
- Spinning Drifter: a spinning satellite dish, a tumbling fuel tank.
- Spinning Blades: rotating antenna arms, a spinning solar sail.
- Sweeping Arm: a rotating radar boom, a crane on a space station.
- Wall Piston: a docking clamp, a telescoping antenna.
- Charged Beam: a tractor beam, a radio-telescope beam.
- Effect Zone: a nebula cloud, a magnetic field.
- Spring Line: a fuel hose, a cable between two buoys.

**Paper** (to reach 3 per mechanic):
- Gap Wall: a row of stacked books.
- Closing Jaws: two staplers, a bulldog clip.
- Wall Bulge: a roll of tape, a coaster.
- Conveyor: a row of pushpin heads, a row of binder clips.
- Spinning Drifter: a spinning bottle cap, a coin.
- Spinning Blades: a pencil sharpener's blades (no pulling, so it isn't the removed sharpener), a hole punch.
- Sweeping Arm: a desk-lamp arm, a clock hand.
- Wall Piston: a retractable tape measure, a stapler arm.
- Wall Turret: a rubber-band shooter, a spitball straw.
- Telegraphed Sweep: a hand with an eraser, a ruler swat.
- Push Zone: a paper fan, a hair dryer (before 700 m, like all wind).
- Effect Zone: a page-turn breeze, a steam cloud from a mug.
- Spring Line: a string between two thumbtack-free clips, a shoelace.

### 4.7 Keep it balanced with a test
Add a check to `tools/test.js` that counts looks per mechanic on every map (the same way as this report) and fails if any map drifts from the target. New obstacles would then have to keep the balance.

## 5. Decisions needed from you
1. **Target:** 3 looks per mechanic (recommended), 4, or 2?
2. **Extra types:** fold them into looks so every mechanic is equally frequent (4.2)?
3. **Ocean and Dungeon:** count looks per layer (keeps all art) or trim to the target?
4. **Space:** keep 17 mechanics (no wind, no explosions), or add the two missing ones?
5. **Colours:** should a colour variant ever count as a look, or only new shapes?
