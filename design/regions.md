# Regions: a design system for maps

Written at v168 (2026-10-29). A proposal: nothing here is built yet except what section 6 marks as "today".

**The idea in one line:** a map is a journey down through one place, and that place is made of **regions**. Inside a region, everything on screen (the colour, the background pattern, the scenery, every obstacle's skin, the collectibles and the name on the depth line) belongs to the same theme. The player should always be able to answer "where am I?" just by looking.

---

## 1. Why regions

Paper Nosedive has no story text, so a run's story comes from what the player sees change on the way down. On the Ocean it already works: a reef, then darker water, then stone ruins, then a glowing dome city, then the abyss. Each step feels like going deeper. When everything changes together, the run feels like a trip. When the parts disagree, the map feels like a pile of random stickers.

Today the parts sometimes disagree:
- **Different change depths.** On most maps the page colour and the obstacle looks change at 150 m, but the background art and the region name change at 200 m. Between 150 and 200 m the player is in two places at once.
- **Looks in the wrong place.** On the Ocean, every sea look that isn't tied to a depth also appears in the abyss, so bright reef coral, kelp and starfish show up at 2,000 m, where there is no light.
- **Maps with no regions for obstacles.** Paper, Space and Dungeon choose their obstacle looks at random at every depth. The background and the name change, but the obstacles stay the same.

Regions fix this with one rule: **one set of change depths per map, and everything switches there.**

---

## 2. What a region is

A region is one row in a map's table. Everything the game shows at a depth comes from that row.

| Field | What it is | Example (Ocean, Sunken ruins) |
|---|---|---|
| `id` | Stable code name, never shown | `ruins` |
| `name` | Shown under the depth line | Sunken ruins |
| `from` | The depth where it starts, always a multiple of 100 m; it ends where the next one starts | 400 m |
| `theme` | One sentence: what this place is and how it feels | "The flooded temples of a lost city: pale stone, gold and glowing carved symbols, half buried in silt." |
| `colours` | The page colours for its 100 m bands (still one colour per band) | Deep blues getting darker |
| `art` | The faint background pattern (`depth-art.css`) | Ruin stone blocks |
| `scenery` | Harmless background creatures and props | Lionfish, barracuda, tuna; far-off towers and broken arches |
| `specks` | The drifting particles | Marine snow |
| `skins` | One or more skins for every mechanic the map uses | Gap Wall: fallen columns; Closing Jaws: temple doors… |
| `collectibles` | Optional: a collection set that only lives here | Sunken treasures |
| `mood` | Optional: a music colour (tempo, instrument, key) | Slow, echoing |

**Not part of a region:** the plane, gold stars, power-ups, the squid debuff and the HUD. They look the same everywhere so the player always recognises them at a glance.

---

## 3. Rules

### 3.1 Skins only, never new rules
A region changes how an obstacle **looks**, never how it **plays**. The hit box, movement, warning, timing and spawn weight stay exactly the same as the map's mechanic in every region. This keeps the player's decisions:
- every obstacle can appear at any depth (v125);
- every obstacle on a map has the same chance (v127);
- difficulty only comes from speed, size and how often rows come.

The existing depth exceptions stay as they are: wind stops at 700 m, conveyors stop at 1,500 m. They are rules about the mechanic, not about the region.

### 3.2 One set of change depths
- Every region starts on a 100 m line, so its change always lands on a dotted line with a name under it.
- The colour, background art, scenery, specks, obstacle skins and name all switch at the same depth.
- A row takes the skins of the region at its spawn depth. A row spawned at 395 m keeps its look even after the plane passes 400 m (this is already how `spawnFromPool` works).
- The last region never ends.

### 3.3 Full coverage
- Every mechanic the map uses has at least one skin in every region. If a region has no skin yet for a mechanic, it uses the map's **base skin** (the original look), so nothing breaks while a region is being built.
- Aim for **two skins per mechanic per region**. One looks repetitive over 400 m; four or more is hard to learn at speed.
- A skin belongs to **one region**, or to neighbouring regions when it really makes sense in both (a giant gold coin in both city regions). It never skips a region: no reef coral in the abyss.

### 3.4 Readability
- **Scenery never looks like an obstacle.** A species or object that is an obstacle skin anywhere on the map stays out of that map's scenery (the Ocean's v124/v128 rule, now for all maps).
- **Skins stand out from their region's background.** Dark regions get pale, lit skins with ink outlines (as in the dome city). Light regions get dark outlines.
- **Nothing hides a hazard** (the whiteout rule). Fog, steam, ash and ink stay see-through.
- **Same mechanic, same silhouette family.** Each region dresses a mechanic differently, but the shape should still say what the mechanic does: a Gap Wall is always two barriers with a hole, and a Wall Turret always has a visible mouth that flashes before it fires.

### 3.5 Theme
- Original designs only: no famous places, characters or brands (the Google Play rule). The Volcano's Minecraft exception stays a temporary exception.
- Each map keeps its own limits: Forest is nature only, Volcano is rock, ash, steam and lava with no dragons, Kitchen is food and kitchen tools, and so on.
- A collection set can belong to a region, as the Sunken treasures already belong to the city. It still follows the collectible rule: each item appears at most once per run, then the regular skins return.

### 3.6 A checklist for a new region
1. Can I say its theme in one sentence, and does it follow from the region above it ("deeper / older / colder / stranger")?
2. Does it change the page colours, background art, scenery and specks, not just the name?
3. Does every mechanic the map uses have a skin here (or a deliberate fallback)?
4. Do the skins stand out against the region's colours?
5. Is anything in the scenery also an obstacle?
6. Is every design original?

---

## 4. How many regions

Five per map today, at 0, 200, 400, 800 and 1,500 m. The regions get longer as the run goes deeper: early regions pass in about 15 seconds, deep ones last minutes. That suits the game: new players see three or four places in their first runs, and the deep regions are a reward for good players.

The system allows any number of regions. Good candidates for a **sixth region** are deep runs (2,500 m +), which only the best players reach and where the last region currently repeats for a long time:

| Map | Possible 6th region (2,500 m +) | Why it follows |
|---|---|---|
| Ocean | Hydrothermal vents: black smoker chimneys, tube worms, glowing shrimp | The scenery already changes at 2,500 m (viperfish, gulper eel) |
| Space | The edge of the universe: faint lines of light, a soft glow | Further than the far galaxies |
| Dungeon | The heart of the mountain: giant roots of crystal, slow-burning lava light | Below the underworld |
| Neon City | The mainframe: pure light, wireframes, glitches | Beneath the data core |
| Forest | First light: dawn after the night | The seasons then the day come round |
| Desert | The crystal cave: a geode you fall into | Deeper than the amber |
| Volcano | The planet's mantle: slow glowing currents | Below the magma chamber |
| Kitchen | The freezer: ice trays, frozen peas, frost | Further into the fridge |
| Paper | Back of the notebook: the cardboard cover, then the desk | The end of the notebook |

Keep regions at least 200 m long so the player has time to notice each one.

---

## 5. Data shape

Today each map spreads its regions over several places in the code. The table below would replace all of them:

| Today | Where | Becomes |
|---|---|---|
| `seaLayer`, `cityLayer`, `forestSeason`, `desertLayer`, `volcanoLayer`, `kitchenLayer` (150 m first change, except the city) | `js/obstacles.js` | One `regionAt(map, y)` |
| `SEA_LAYERS`, `SEA_CITY`, `CITY_LAYERS`, `FOREST_SEASONS`, `DESERT_LAYERS`, `VOLCANO_LAYERS`, `KITCHEN_LAYERS` | `js/obstacles.js` | Each region's `skins` |
| `ART_BOUNDS`, `ART_BASE`, `ART_NONE` | `js/render.js` | Each region's `from` and `art` |
| `REGIONS` (names) | `js/maps.js` | Each region's `name` |
| The scenery depth tables | the `*-background.js` files | Each region's `scenery` |

One region, written as data:

```js
// js/regions.js (new): one list per map, top to bottom
const MAP_REGIONS = {
  sea: [
    { id: 'reef', name: 'Sunlit reef', from: 0, art: 'sea-ripples',
      skins: { gate: ['coral', 'rockledge'], blot: ['urchin', 'anemone'], note: ['jelly', 'combjelly'], /* … */ } },
    { id: 'twilight', name: 'Twilight zone', from: 200, /* … */ },
    { id: 'ruins', name: 'Sunken ruins', from: 400, art: 'sea-ruins', collectibles: 'treasures',
      skins: { gate: ['columns'], erasers: ['templedoors'], blot: ['amphora'], /* … */ } },
    // …
  ]
};
const regionAt = (map, y) => { const m = y / PX_PER_M, r = MAP_REGIONS[map]; let i = r.length - 1; while (r[i].from > m) i--; return r[i]; };
```

The art and colours of each skin stay in the `draw-*.js` files. The table only says which skins live where.

**Replays:** skins are picked with the run's random numbers while rows spawn. Any change to the region table that changes which skins can be picked changes the random sequence, so it needs a `SIM_VERSION` bump in `js/replay.js`.

---

## 6. Today's maps: what fits and what doesn't

| Map | Obstacles change with depth today? | First change | Problems |
|---|---|---|---|
| Paper | No: every look at any depth | Background at 200 m | The background changes 5 times (ruled, graph, dot grid, staff, blueprint) while the stationery stays the same. Only 1–2 looks per mechanic |
| Ocean | Yes, the best example | Looks at 150 m, art and name at 200 m | The abyss reuses most reef looks (coral, kelp, starfish, crab); sunlit and twilight share almost the same looks; the background specks change at 100, 400 and 1,000 m, not on region lines |
| Space | No | 200 m | Planets, satellites and the station all appear in "Far galaxies" |
| Dungeon | No | 200 m | Torches and goblin scaffolding in the crystal caves; crystals in the well. Halloween looks (pumpkins, witch hats) don't belong to any region |
| Neon City | Yes, partly | 200 m everywhere (already aligned) | Some looks span many regions (neon signs 0–1,500 m) |
| Forest | Partly (seasonal looks only) | 150 m | Most looks appear in every season; the region change and the season change are 50 m apart |
| Desert | Partly | 150 m | As Forest |
| Volcano | Partly | 150 m | As Forest |
| Kitchen | Partly | 150 m | As Forest |

---

## 7. Worked example: the Ocean

The Ocean already has most of what it needs. This section moves its existing skins into regions and points out the gaps (marked **new**). All named skins without **new** already exist in `SEA_LOOKS` or `SEA_CITY_LOOKS`.

### 7.1 The regions

| Region | Depth | Theme | Colours | Background art | Scenery | Specks |
|---|---|---|---|---|---|---|
| Sunlit reef | 0–200 m | A bright, warm coral reef just under the waves | Turquoise | Sunlight ripples | Clownfish, tang, seahorse | Clear water, a few bubbles |
| Twilight zone | 200–400 m | The reef's edge drops off; old shipwrecks rest on the slope | Blue | Sand ripples | Angelfish, parrotfish; whale silhouettes | Green plankton |
| Sunken ruins | 400–800 m | The flooded temples of a lost city | Deep blue | Ruin stone blocks | Lionfish, barracuda, tuna; far-off towers and broken arches | Marine snow |
| Dome city | 800–1,500 m | A city that still lives under glass domes, warm windows in the dark | Navy | Hexagon dome glass | Reef sharks, hammerheads, sunfish; far-off domes and chimneys | Marine snow and the first glowing dots |
| The abyss | 1,500 m + | Total darkness; only living light | Near-black | Bioluminescent dots | Great white, giant squid, oarfish; deeper: viperfish, gulper eel | Bioluminescence |

### 7.2 Skins per region

| Mechanic | Sunlit reef | Twilight zone | Sunken ruins | Dome city | The abyss |
|---|---|---|---|---|---|
| Gap Wall | Coral ledges, rock ledge | Shipwreck planks, rock ledge | Fallen columns | Glass tube walkway | **new:** glowing glass sponge ledges |
| Closing Jaws | Giant clam | Shipwreck hull halves | Temple doors | Dome hatches | **new:** gulper eel jaws |
| Static Hazards | Sea urchins, anemones | Stonefish, urchins | Amphoras (+ treasures) | Glass orbs (+ treasures) | **new:** glowing spiky deep-sea urchins |
| Wall Bulge | Brain coral, mossy rock | Mossy rock | Stone face | Half dome house | Sleeping whale |
| Bouncing Slider | Swordfish, driftwood | Broken mast, swordfish | Stone oar | Tram car | **new:** oarfish |
| Rising Projectile | Pufferfish, sea turtle | Pufferfish | Lantern float | Air capsule | **new:** glowing jellyfish bell rising |
| Drifting Swarm | Jellyfish, comb jellies | Comb jellies | Paper lanterns | Mail pods | Anglerfish |
| Conveyor | Sardines, butterflyfish | Sardines | Message capsules | Tram pods | — (conveyors end at 1,500 m) |
| Spinning Drifter | Starfish (+ legendary fish) | Brittle star, ship's wheel (+ legendary fish) | Stone calendar, gold coin | Gold coin | **new:** glowing ammonite shell |
| Spinning Blades | Crab | Lobster | Water-mill paddles | Dome fan blades | **new:** deep-sea spider crab |
| Sweeping Arm | Anchor | Anchor | Clock-tower hand | Clock hand, harbour crane | Giant squid tentacle |
| Wall Piston | Moray eel | Mantis shrimp | Statue's trident | Gangplank | **new:** viperfish lunge |
| Wall Turret | Pistol shrimp | Shipwreck cannon, submarine | Fish fountain | Dome cannon | **new:** glowing deep-sea shrimp spitting light |
| Charged Beam | Electric ray | Electric eel | Glowing glyph | Power cable | **new:** a glowing anglerfish lure flashing |
| Telegraphed Sweep | Kelp | Octopus arm | Statue arm | Crane claw | Squid tentacle |
| Proximity Blast | Naval mine | Depth-charge barrel | Bubble mine | Steam valve | **new:** a glowing puffball of light |
| Push Zone (before 700 m) | Current with kelp | Current | Pump | — (wind ends at 700 m) | — |
| Effect Zone | Bubble column | Bubble column | Elevator | Elevator | Warm vent |
| Spring Line | Fishing line | Net strand | Mooring rope | Glowing cable | **new:** a glowing jellyfish tentacle between two glowing bulbs |

**What changes against today:**
- The reef and the twilight zone each keep only the skins that fit them: bright life on the reef, wrecks and darker animals in the twilight.
- The abyss stops reusing reef skins. It needs about 11 new deep-sea skins; until they exist, it keeps today's abyss-only skins (whale, anglerfish, lanternfish, tentacle, vent) and falls back to the twilight skins for the rest.
- The seashells (a reef collection) belong to the sunlit reef and the twilight zone; the legendary fish can stay everywhere outside the city.
- The lanternfish school (today 800 m +) has no place left: the dome city is city skins only and conveyors stop at 1,500 m. It could become abyss scenery instead.
- The submarine moves to the twilight zone, with the wrecks, which also answers the old note that a submarine on a bright reef felt out of place.

---

## 8. Sketches for the other maps

The names are the ones already shown in the game (v168). For each region: the theme, then the main skin ideas. Paper, Space and Dungeon need the most work, because their obstacles don't change with depth at all today.

### Paper
| Region | Theme | Skin ideas |
|---|---|---|
| Notebook page | A school notebook on a desk | Today's stationery: rulers, ink blots, erasers, paper clips, sticky notes |
| Graph paper | A maths class: geometry and numbers | Set squares, protractors, compasses, calculators, number tiles drifting |
| Dot grid | An art class: drawing and craft | Paint blobs, crayons, brushes, glue tube, origami |
| Sheet music | A music class | Notes and rests drifting, a metronome arm (Sweeping Arm), piano keys (Closing Jaws), a recorder (Bouncing Slider) |
| Blueprint | An engineer's desk | Steel rulers, T-squares, pencil compasses, nuts and bolts, a desk lamp arm |

### Space
| Region | Theme | Skin ideas |
|---|---|---|
| Low orbit | Busy space around the planet | Station girders, satellites, rockets, satellite trains, astronauts |
| Moon orbit | Quiet grey space by the Moon | Moon rocks, landers, Moon edge, lunar buggies |
| The planets | Travelling past the planets | Planets, ringed rocks, ice chunks, comets |
| Deep space | Far from everything, nebulas | Nebula clouds as Effect Zones, crystal asteroids, drifting probes |
| Far galaxies | The universe at its strangest | Wormhole, glowing star clusters, pulsars as Charged Beams |

### Dungeon
| Region | Theme | Skin ideas |
|---|---|---|
| The well | An old stone well at the top of the castle | Stone ledges, buckets, ropes, wooden beams |
| Torch halls | The castle's torch-lit halls and armoury | Spear traps, shields, armour, dragon statues, swords |
| The crypt | Tombs and the restless dead | Skulls, bones, ghosts, tombstones, coffins (Closing Jaws) |
| Crystal caves | Glowing caverns under the castle | Crystals, glowing mushrooms, wisps, slimes |
| The underworld | Fire and the deepest magic | Lava falls, rune stones, flamethrowers, cursed gold |

Halloween looks (pumpkins, witch hats, brooms) don't fit a region. Either drop them or keep them for a seasonal event in October.

### Neon City
| Region | Theme | Skin ideas |
|---|---|---|
| Rooftops | Rain on the roofs, neon signs, antennas | Antennas, water tanks, drones, neon signs |
| The streets | Shops, traffic, crowds | Billboards, cans, taxis, street lamps, shop signs |
| The subway | Tunnels and platforms | Ticket gates, train doors, tunnel lamps, pipes |
| The arcade | An underground arcade, music and lights | Claw machines, pinball flippers, pixel blocks, tokens |
| The data core | The city's computers | Server racks, circuit chips, data packets, lasers |

### Forest
| Region | Theme | Skin ideas |
|---|---|---|
| Spring | Blossoms and new leaves | Blossom branches, bees, pollen, nesting birds |
| Summer | Deep green and warm | Full branches, butterflies, apples, sunbeams |
| Autumn | Orange leaves and harvest | Falling leaves, acorns, mushrooms, squirrels |
| Winter | Snow on the branches | Icicles, snowballs, frosted sticks, snowflakes |
| Night | Moonlit forest | Owls, bats, fireflies, glowing moss |

### Desert
| Region | Theme | Skin ideas |
|---|---|---|
| The dunes | Sun and sand on the surface | Dunes, tumbleweeds, cacti, lizards |
| The canyon | Steep orange rock walls | Rock arches, falling boulders, eagles, palm fronds |
| The oasis | Water seeping through the rock | Palm trunks, water drips, frogs, reeds |
| Fossil beds | Old bones in grey rock | Fossils, bones, ammonites, ferns in stone |
| Amber | Golden glowing rock | Amber drops, trapped insects, crystals |

### Volcano
| Region | Theme | Skin ideas |
|---|---|---|
| Jungle slope | Green slopes around the volcano | Vines, charred logs, moths, falling rocks |
| Ash cloud | Grey ash and lightning | Ash puffs, lightning, falling cinders |
| The crater | Dark rock and steam vents | Basalt columns, steam vents, lava frogs |
| Lava tubes | Tunnels with glowing seams | Rope lava, lava drips, glowing cracks |
| Magma chamber | Pure molten rock | Magma bubbles, lava bombs, glowing stones |

### Kitchen
| Region | Theme | Skin ideas |
|---|---|---|
| Top shelf | Jars and cakes on the shelf | Jars, cake tins, pineapples, peppermills |
| The countertop | Chopping and baking | Cutting boards, knife blocks, rolling pins, flour |
| The stove | Pots, pans and heat | Ladles, pot steam, toasters, popcorn |
| The sink | Water and washing up | The tap, soap bubbles, sponges, plates |
| The fridge | Cold food and glass shelves | Glass shelves, ice cubes, lettuce, melon, fridge chill |

---

## 9. Ideas that build on regions (for later)

- **An entry moment.** When the plane crosses into a new region, the name grows for a second in the middle of the screen ("Sunken ruins"), with a short sound. It shouldn't cover obstacles: keep it faint and brief.
- **Region discovery.** The first time a player reaches a region, it's saved and shown on the map tile (e.g. "3 / 5 regions"). This gives new players a reason to go deeper than their best.
- **A region log on the game-over screen.** "You reached the Dome city" reads better than just "937 m".
- **Region music.** Each region shifts the generated music a little (tempo, instrument, key). `js/music.js` already builds the music in code.
- **Daily dive by region.** "Today: start in the Twilight zone" (needs a decision on how scores would compare).

---

## 10. How to get there

Each step is its own version. Steps 1–3 change spawning, so each needs a `SIM_VERSION` bump.

1. **Align the change depths.** Move the 150 m first change to 200 m on Ocean, Forest, Desert, Volcano and Kitchen (layer functions and page colours), so everything matches the names and the background art. Small and visible right away.
2. **One table.** Add `js/regions.js` with `MAP_REGIONS` and `regionAt`, and move the names, the art depths and the look-to-layer tables into it. No visible change; the tests compare skins before and after.
3. **Ocean first.** Apply section 7: tidy the reef and twilight skins, then add the abyss skins.
4. **Paper, Space, Dungeon.** Give them region skins (section 8), reusing today's looks where they fit and drawing new ones where they don't.
5. **The rest.** Tighten Forest, Desert, Volcano, Kitchen and Neon City so each look belongs to its region.
6. **Tests** in `tools/test.js`:
   - every mechanic has a skin in every region (or a declared fallback);
   - in a deep run, every obstacle's skin belongs to the region of its depth;
   - nothing in a map's scenery list is also an obstacle skin.

---

## 11. Decisions (2026-10-29)

- **Ocean only for now.** The Regions system is built on the Ocean first; every other map stays as it is until asked.
- **Step 1 done on the Ocean (v169):** the first change moved from 150 m to 200 m, and the specks moved to the region lines (clear to 200 m, plankton to 400 m, marine snow to 1,500 m, then bioluminescence). Whale and shipwreck silhouettes keep their own depths.
- 1. A sixth region: undecided.
- 2. No entry moment: the name on the line is enough.
- 3. No region discovery for now.
- 4. The Dungeon's Halloween looks stay.
- 5. The first step was aligning the change depths.

## 12. Open questions (as first asked)

1. **More than five regions?** Is a sixth region from 2,500 m (section 4) worth drawing, given how few players get that deep?
2. **An entry moment** (section 9): yes, or is the name on the line enough?
3. **Region discovery** as a reward: does it fit next to the medals and collections?
4. **Halloween looks** in the Dungeon: remove, or keep for an October event?
5. **The first step:** align the change depths (quick), or start with the Ocean (most visible)?
