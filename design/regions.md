# Regions: a design system for maps

First written at v168, rewritten at v169 (2026-10-29) with three new parts: **music per region with a fade**, **regions that cycle** in an endless run, and **a collection set per region**. Built so far on the Ocean: aligned lines (v169), one region table (v170), looping dives (v171) and region music (v172); see section 11. Everything else is a proposal.

**The idea in one line:** a map is a journey through one place, made of **regions**. Inside a region, everything the player sees and hears (colours, background pattern, scenery, specks, obstacle skins, music, collectibles and the name on the depth line) belongs to the same theme. The player should always be able to answer "where am I?" by looking and listening.

**Scope (user's decision, 2026-10-29):** the Ocean only for now. Other maps stay as they are until asked; section 10 keeps sketches for them.

---

## 1. Why regions

Paper Nosedive has no story text, so a run's story comes from what changes on the way down. On the Ocean it already works: a bright reef, darker water with wrecks, stone ruins, a glowing dome city, then the black abyss. When everything changes together, a run feels like a trip. When the parts disagree, the map feels like random stickers.

Before v169 the parts disagreed: obstacle looks and fish changed at 150 m, the background and the name at 200 m, the specks at 100, 400 and 1,000 m. The bright reef coral, kelp and starfish appeared again in the abyss. The music never changed at all.

One rule fixes this: **each map has one set of region lines, and everything switches on them.**

---

## 2. What a region is

A region is one row in the map's table. Everything the game shows or plays at a depth comes from that row.

| Field | What it is | Ocean example: Sunken ruins |
|---|---|---|
| `id` | Code name, never shown, never changed | `ruins` |
| `name` | Shown under the depth line | Sunken ruins |
| `length` | How many metres it lasts, a multiple of 100 m | 400 m |
| `theme` | One sentence: what this place is and how it feels | "The flooded temples of a lost city: pale stone, gold and glowing carved symbols." |
| `colours` | The water colours for its 100 m bands | Deep blues getting darker |
| `art` | The faint background pattern (`depth-art.css`) | Ruin stone blocks |
| `scenery` | Harmless background creatures and props | Lionfish, barracuda, tuna; far-off towers and broken arches |
| `specks` | The drifting particles | Marine snow |
| `skins` | One or two skins for every mechanic the map uses | Gap Wall: fallen columns; Closing Jaws: temple doors… |
| `music` | The region's theme (section 5) | Slow, echoing, temple chimes |
| `collection` | The collection set found only here (section 6) | Sunken treasures |

**The same everywhere:** the plane, gold stars, power-ups, the squid debuff and the HUD. The player must always recognise them at a glance.

---

## 3. Rules

### 3.1 Skins only, never new rules
A region changes how an obstacle **looks**, never how it **plays**: hit box, movement, warning, timing and spawn weight stay the same in every region. This keeps the player's decisions:
- every obstacle can appear at any depth (v125);
- every obstacle on a map has the same chance (v127);
- difficulty only comes from speed, size and how often rows come, and it keeps going by the **real depth**, never by the region (section 4.3).

The depth rules of some mechanics stay tied to the real depth too: no wind from 700 m, no conveyors from 1,500 m. So a reef visited a second time at 2,600 m has no current and no school of fish.

### 3.2 One set of lines
- Every region starts on a 100 m line, so each change lands on a dotted line with the name under it.
- Colour, art, scenery, specks, obstacle skins and the name switch **sharply on the line**. The music is the one exception: it **fades** across the line (section 5).
- Depth is measured the way the lines are drawn (`pageTop`: k × 100 m, plus the plane's screen offset), so a row drawn below the line gets the new region (fixed for the Ocean in v169).
- A row keeps the region of the depth where it spawned.

### 3.3 Full coverage
- Every mechanic the map uses has a skin in every region. Missing skins fall back to the map's **base skin** (the original look), so nothing breaks while a region is built.
- Aim for **one or two skins per mechanic per region**. Fewer than that looks repetitive; more is hard to learn at speed.
- A skin belongs to one region, or to two neighbouring ones when it truly fits both. It never skips a region.

### 3.4 Readability
- **Scenery never looks like an obstacle.** A creature or object that is an obstacle skin anywhere on the map stays out of that map's scenery (the Ocean's v124/v128 rule).
- **Skins stand out from their region.** Dark regions get pale, lit skins with ink outlines; light regions get dark outlines.
- **Nothing hides a hazard** (the whiteout rule). Fog, steam, ink and glow stay see-through.
- **A mechanic keeps its silhouette.** A Gap Wall is always two barriers with a hole; a Wall Turret always has a mouth that flashes before it fires.

### 3.5 Theme
- Original designs only: no famous places, characters or brands (Google Play rule).
- Each map keeps its own limits (Forest nature only, Volcano no dragons, Kitchen food and tools only…).

### 3.6 A checklist for a new region
1. Can I say its theme in one sentence, and does it follow from the region before it?
2. Does it change the colours, background art, scenery, specks and music, not just the name?
3. Does every mechanic have a skin here (or a deliberate fallback)?
4. Do the skins stand out against its colours?
5. Is anything in the scenery also an obstacle?
6. Does it have its collection set, and do its items fit the place?
7. Does the region still make sense when it comes round again (section 4)?
8. Is every design original?

---

## 4. Cycles: the endless run

The game never ends, so a map's regions **repeat in a loop**. One pass through all the regions is a **dive**. When the last region ends, the first one starts again, and the loop goes on for as long as the plane survives.

### 4.1 The Ocean's dive

| # | Region | Length | 1st dive | 2nd dive | 3rd dive |
|---|---|---|---|---|---|
| 1 | Sunlit reef | 200 m | 0–200 m | 2,500–2,700 m | 5,000–5,200 m |
| 2 | Twilight zone | 200 m | 200–400 m | 2,700–2,900 m | 5,200–5,400 m |
| 3 | Sunken ruins | 400 m | 400–800 m | 2,900–3,300 m | 5,400–5,800 m |
| 4 | Dome city | 700 m | 800–1,500 m | 3,300–4,000 m | 5,800–6,500 m |
| 5 | The abyss | 1,000 m | 1,500–2,500 m | 4,000–5,000 m | 6,500–7,500 m |

One dive is **2,500 m**. Every dive uses the same lengths, so the lines are easy to predict: a region comes back exactly 2,500 m later.

The first dive starts with short regions (new players see three or four places in their first runs) and ends with long ones (the abyss is a reward for good players). The 1,000 m abyss is long enough to feel like the bottom of the world before the loop.

### 4.2 Why the loop makes sense
The cycle needs a reason, or a reef at 2,600 m feels like a mistake. For the Ocean: **the abyss ends in a deep trench, and the plane falls out of it into another sea**: a new reef with the same bright water. Each dive is a new ocean, deeper in the world but the same journey.

How the player sees it:
- **The line at the start of a dive** names the dive as well as the region: "Sunlit reef · Dive 2". Only this line changes; all others show the region name as now.
- **No other new signal.** The name on the line is enough (user's decision).

### 4.3 What changes from dive to dive
- **Looks, music and collections:** the same in every dive. A region looks and sounds the same each time.
- **Difficulty:** keeps growing with the real depth, as now (speed is capped at the 600 m value; size and frequency keep going). A second reef is harder than the first one, not easier.
- **Collections:** each item still appears at most once per run, so a set can't be found twice in one run (section 6.2).
- **Water colour:** follows the region, not the real depth, so the second reef is bright turquoise again. Today the water darkens every 100 m until about 1,000 m and then stays near-black; with cycles it has to come back to light at each new dive.

---

## 5. Music per region

### 5.1 One theme per region
Each region has its own theme, so the player hears the place change as well as sees it. The themes of one map are **variations of the map's theme**: the same family of keys and instruments, each with its own mood. That way the fade between two of them sounds like one piece changing, not two songs fighting.

All music stays generated in code (`js/music.js`, Web Audio), with original melodies.

| Ocean region | Mood | Key and tempo | Instruments |
|---|---|---|---|
| Sunlit reef | Bright, playful, sunlit | A Dorian (minor with a raised 6th, sounds lighter), 76 bpm | Flute lead, quick harp eighths, a soft shaker |
| Twilight zone | Calm and a little lonely | A minor, 64 bpm (today's Ocean theme) | Echoing harp, low flute, deep bass |
| Sunken ruins | Ancient and mysterious | A Phrygian (minor with a flat 2nd), 60 bpm | A slow horn, temple-bell chimes, long echoes |
| Dome city | Warm, magical, a little mechanical | A minor turning to C major, 72 bpm | A music-box lead (bell-like plucks), string pads, a soft ticking pulse |
| The abyss | Dark, vast, almost silent | A minor, 52 bpm, very sparse | Deep drones, slow single notes, a faint sonar-like ping now and then |

### 5.2 The fade
- The change starts **when the plane crosses the region line**, so the sound changes where the player sees the line.
- The old theme fades out and the new one fades in **at the same time over about 4 seconds** (a cross-fade). At top speed the plane falls about 55 m in that time, about a fifth of the shortest region.
- The new theme starts at the **beginning of its loop**, so it always enters with its opening bar, not mid-phrase.
- `setMusic` already cross-fades between themes (in about 1.5 seconds, for menu ↔ run changes). Region changes use a slower fade; menu and game-over changes keep the quick one.

### 5.3 Other moments
- **Start of a run:** the first region's theme (the reef), faded in from the title theme as today.
- **Pause:** lowered to 30% as now. **Game over:** back to the title theme with the quick fade.
- **Replays:** the music follows the region of the replay's depth, like a live run. The music never touches the game's random numbers, so replays stay exact.
- **Daily dive:** the same, following the day's map.
- **Mute:** silences all of it, as now.

---

## 6. A collection set per region

### 6.1 One set per region
Every region has its own collection set, and its items **only appear in that region**. What a player finds tells them where they have been. Each region's set rides on **one mechanic**, as a special look of that obstacle (the existing collectible rule).

| Ocean region | Set | Items | Rides on | Status |
|---|---|---|---|---|
| Sunlit reef | **Seashells** | 6: conch, scallop, nautilus, cowrie, sand dollar, pearl oyster | Static Hazards (urchin rows) | Exists; today it appears at every depth outside the city, will be **reef only** |
| Twilight zone | **Legendary fish** | 5: golden fish, narwhal, coelacanth, giant squid eye, ghost shark | Spinning Drifter (starfish rows) | Exists; today it appears outside the city, will be **twilight only** |
| Sunken ruins | **Sunken treasures** | 8: crown, sceptre, gold coin, chalice, necklace, compass, music box, crystal key | Static Hazards (amphora rows) | Exists; today in both city regions, will be **ruins only** |
| Dome city | **Dome inventions** (new) | 8 brass-and-glass gadgets: diving helmet, pocket watch, spyglass, snow globe, toy submarine, glass lantern, wind-up fish, gramophone | Rising Projectile (air capsule rows) | New |
| The abyss | **Abyss lights** (new) | 8 glowing deep-sea animals, as original designs: vampire squid, barreleye fish, dumbo octopus, sea angel, firefly squid, glass squid, sea pig, giant isopod | Drifting Swarm (anglerfish rows) | New |

The two new sets need their art, their names in the Collections screen, and their tests, like every existing set.

### 6.2 Rules
- **Once per run:** each item appears at most once per run. When a region's whole set has appeared in a run, that obstacle goes back to its region's regular skins (the existing rule: "rings become skulls").
- **Cycles:** in the second dive, a region offers only the items that haven't appeared yet in this run. A long run is the only way to see a whole set in one go, which rewards going deep.
- **Save ids never change.** Items found today stay found: `shell-*`, `fish-*` and `treasure-*` keep their ids. New sets get new ids (`invention-*`, `abysslight-*`).
- **Collections screen:** the Ocean's sets are listed in region order (reef → abyss), with the region name above each.

---

## 7. Worked example: the Ocean

### 7.1 The regions

| Region | Theme | Colours | Background art | Scenery | Specks |
|---|---|---|---|---|---|
| Sunlit reef | A bright, warm coral reef just under the waves | Turquoise | Sunlight ripples | Clownfish, tang, seahorse | Clear water |
| Twilight zone | The reef's edge drops away; old shipwrecks rest on the slope | Blue | Sand ripples | Angelfish, parrotfish; a whale far away | Green plankton |
| Sunken ruins | The flooded temples of a lost city | Deep blue | Ruin stone blocks | Lionfish, barracuda, tuna; far-off towers and broken arches | Marine snow |
| Dome city | A city still alive under glass domes, warm windows in the dark | Navy | Hexagon dome glass | Reef sharks, hammerheads, sunfish; far-off domes and chimneys | Marine snow |
| The abyss | Total darkness, only living light; it ends in a trench to the next sea | Near-black | Bioluminescent dots | Great white, giant squid, oarfish; deeper: viperfish, gulper eel, hatchetfish | Bioluminescence |

### 7.2 Skins per region

**new** = to be drawn. Everything else exists in `SEA_LOOKS` / `SEA_CITY_LOOKS`.

| Mechanic | Sunlit reef | Twilight zone | Sunken ruins | Dome city | The abyss |
|---|---|---|---|---|---|
| Gap Wall | Coral ledges, rock ledge | Shipwreck planks, rock ledge | Fallen columns | Glass tube walkway | **new:** glowing glass-sponge ledges |
| Closing Jaws | Giant clam | Shipwreck hull halves | Temple doors | Dome hatches | **new:** gulper eel jaws |
| Static Hazards | Sea urchins, anemones (+ seashells) | Stonefish, urchins | Amphoras (+ treasures) | Glass orbs | **new:** glowing deep-sea urchins |
| Wall Bulge | Brain coral, mossy rock | Mossy rock | Stone face | Half dome house | Sleeping whale |
| Bouncing Slider | Swordfish, driftwood | Broken mast, swordfish | Stone oar | Tram car | **new:** oarfish |
| Rising Projectile | Pufferfish, sea turtle | Pufferfish | Lantern float | Air capsule (+ inventions) | **new:** a glowing jellyfish bell |
| Drifting Swarm | Jellyfish, comb jellies | Comb jellies | Paper lanterns | Mail pods | Anglerfish (+ abyss lights) |
| Conveyor (before 1,500 m) | Sardines, butterflyfish | Sardines | Message capsules | Tram pods | — |
| Spinning Drifter | Starfish | Brittle star, ship's wheel (+ legendary fish) | Stone calendar, gold coin | Gold coin | **new:** glowing ammonite shell |
| Spinning Blades | Crab | Lobster | Water-mill paddles | Dome fan blades | **new:** deep-sea spider crab |
| Sweeping Arm | Anchor | Anchor | Clock-tower hand | Clock hand, harbour crane | Giant squid tentacle |
| Wall Piston | Moray eel | Mantis shrimp | Statue's trident | Gangplank | **new:** viperfish lunge |
| Wall Turret | Pistol shrimp | Shipwreck cannon, submarine | Fish fountain | Dome cannon | **new:** glowing shrimp spitting light |
| Charged Beam | Electric ray | Electric eel | Glowing glyph | Power cable | **new:** an anglerfish lure flashing |
| Telegraphed Sweep | Kelp | Octopus arm | Statue arm | Crane claw | Squid tentacle |
| Proximity Blast | Naval mine | Depth-charge barrel | Bubble mine | Steam valve | **new:** a glowing puffball of light |
| Push Zone (before 700 m) | Current with kelp | Current | Pump | — | — |
| Effect Zone | Bubble column | Bubble column | Elevator | Elevator | Warm vent |
| Spring Line | Fishing line | Net strand | Mooring rope | Glowing cable | **new:** a glowing tentacle between two light bulbs |

Notes:
- Reef and twilight split today's shared looks: bright life on the reef, wrecks and darker animals in the twilight. The submarine moves to the twilight with the wrecks.
- The abyss stops reusing reef looks. It needs about 11 new skins; until they are drawn it keeps today's abyss looks (whale, anglerfish, tentacle, vent) and falls back to the twilight skins for the rest.
- The lanternfish school (today 800 m +) loses its place: the dome city is city skins only and conveyors stop at 1,500 m. It can become abyss scenery.

---

## 8. Data shape

One table per map replaces the depth functions and look tables spread over the code today.

```js
// js/regions.js (new): a map's regions in order; the list repeats forever (one pass = a dive)
const MAP_REGIONS = {
  sea: [
    { id: 'reef', name: 'Sunlit reef', length: 200, art: 'sea-ripples', music: 'seaReef', collection: 'shells',
      skins: { gate: ['coral', 'rockledge'], blot: ['urchin', 'anemone'], note: ['jelly', 'combjelly'] /* … */ } },
    { id: 'twilight', name: 'Twilight zone', length: 200, music: 'sea', collection: 'fish' /* … */ },
    { id: 'ruins', name: 'Sunken ruins', length: 400, music: 'seaRuins', collection: 'treasures' /* … */ },
    { id: 'dome', name: 'Dome city', length: 700, music: 'seaDome', collection: 'inventions' /* … */ },
    { id: 'abyss', name: 'The abyss', length: 1000, music: 'seaAbyss', collection: 'abysslights' /* … */ }
  ]
};
// the region at a world y, measured like the depth lines (pageTop), and which dive it is in
function regionAt(map, y) {
  const list = MAP_REGIONS[map], dive = list.reduce((s, r) => s + r.length, 0);
  let m = (y - planeScreenY()) / PX_PER_M;
  const n = Math.floor(m / dive); m -= n * dive;
  let i = 0;
  while (m >= list[i].length) m -= list[i++].length;
  return { region: list[i], index: i, dive: n + 1 };
}
```

| Today (Ocean) | Where | Becomes |
|---|---|---|
| `seaLayer` | `js/obstacles.js` | `regionAt` |
| `SEA_LAYERS`, `SEA_CITY` | `js/obstacles.js` | each region's `skins` |
| `SEA_FISH_DEPTHS`, the speck depths | `js/sea-background.js` | each region's `scenery`, `specks` |
| `ART_BOUNDS` for the Ocean | `js/render.js` | each region's `art` |
| `REGIONS.sea` (names) | `js/maps.js` | each region's `name` |
| The water colour by depth | `js/maps.js` (`MAPS.sea.colour`) | each region's `colours` |
| One Ocean theme | `js/music.js` | each region's `music` |

**Replays:** skins and collectibles are picked with the run's random numbers while rows spawn. Any change to which skins or items can be picked changes that sequence, so it needs a `SIM_VERSION` bump in `js/replay.js`. The music doesn't touch it.

---

## 9. Ideas for later
- **Region music on the title screen:** the menu could play the theme of the region of the player's best depth on the picked map.
- **A region log on the game-over screen:** "You reached the Dome city, dive 2" reads better than only "3,412 m".
- **A sixth Ocean region** inside the dive (undecided, see section 12).

---

## 10. Sketches for the other maps (not now)

Kept for later; the Ocean comes first. Region names are the ones already shown in the game (v168).

| Map | Regions | Possible loop reason |
|---|---|---|
| Paper | Notebook page · Graph paper · Dot grid · Sheet music · Blueprint | A new notebook starts |
| Space | Low orbit · Moon orbit · The planets · Deep space · Far galaxies | A wormhole drops you near another planet |
| Dungeon | The well · Torch halls · The crypt · Crystal caves · The underworld | A portal back to another castle's well |
| Neon City | Rooftops · The streets · The subway · The arcade · The data core | The core uploads you to another city's roof |
| Forest | Spring · Summer · Autumn · Winter · Night | The year turns: spring again |
| Desert | The dunes · The canyon · The oasis · Fossil beds · Amber | A sinkhole opens onto another desert |
| Volcano | Jungle slope · Ash cloud · The crater · Lava tubes · Magma chamber | An eruption throws you out onto another island |
| Kitchen | Top shelf · The countertop · The stove · The sink · The fridge | The fridge door opens onto another kitchen's shelf |

Skin ideas per region, from the first version of this document:
- **Paper:** stationery, then maths tools (set squares, calculators), art tools (paint, crayons, origami), music (notes, metronome, piano keys), engineering (T-squares, bolts, a desk lamp arm).
- **Space:** stations and satellites, Moon rocks and landers, planets and comets, nebulas and probes, wormholes and pulsars.
- **Dungeon:** buckets and ropes, spears and shields, skulls and coffins, crystals and slimes, lava and runes. The Halloween looks stay (user's decision).
- **Neon City:** antennas and drones, billboards and taxis, ticket gates and train doors, claw machines and pinball flippers, server racks and lasers.
- **Forest:** blossoms and bees, butterflies and apples, leaves and acorns, icicles and snowballs, owls and fireflies.
- **Desert:** tumbleweeds and cacti, rock arches and eagles, palms and frogs, fossils and ammonites, amber and crystals.
- **Volcano:** vines and moths, ash and lightning, basalt and steam, rope lava and drips, magma bubbles and lava bombs.
- **Kitchen:** jars and cakes, cutting boards and rolling pins, ladles and toasters, the tap and soap bubbles, glass shelves and ice cubes.

---

## 11. How to build it (Ocean)

Each step is its own version. Every step that changes spawning needs a `SIM_VERSION` bump.

1. ~~**Align the lines**~~ (done in v169): looks, fish and specks change at 200/400/800/1,500 m, measured like the depth lines.
2. ~~**One table**~~ (done in v170): `js/regions.js` holds the Ocean's `MAP_REGIONS` (name, line, art, specks, background fish, the looks of every obstacle and the collections of each region) and `regionAt`. `SEA_LAYERS`, `SEA_CITY` as a depth table, `SEA_FISH_DEPTHS` and the Ocean's names list are gone. No visible change: 400 seeded rows and 400 fish came out identical before and after, so no `SIM_VERSION` bump. The fish deeper than 2,500 m (`SEA_DEEP_FISH`) wait for step 3. `tools/test.js` checks the table.
3. ~~**Cycles**~~ (done in v171): the Ocean loops every 2,500 m (`REGION_DIVE`); the water colour, art, looks, fish, whale and wreck silhouettes, specks, collections and names follow the dive depth; the line at a new dive reads "Sunlit reef · Dive 2". The deepest fish (viperfish, gulper eel, hatchetfish) joined the abyss scenery. `SIM_VERSION` 4.
4. ~~**Music**~~ (done in v172): four new Ocean themes (`seaReef`, `seaRuins`, `seaDome`, `seaAbyss`; the twilight keeps `sea`), each region's `music` in the table, and a 4-second linear cross-fade when the plane crosses a line. The music never touches the run's random numbers, so no `SIM_VERSION` bump. `tools/test.js` checks every theme's bars and that the run's theme follows the region in both dives.
5. **Collections:** tie the three existing sets to their regions, then add the Dome inventions and the Abyss lights (art, names, Collections screen, tests).
6. **Skins:** split the reef and twilight looks, then draw the new abyss skins.
7. **Tests** in `tools/test.js`:
   - every mechanic has a skin in every region (or a declared fallback);
   - in a deep run past 2,500 m, every obstacle's skin and collectible belongs to its region, and the second dive matches the first;
   - nothing in the scenery is also an obstacle skin;
   - the music theme follows the region (checked by name, not by sound).

---

## 12. Decisions so far (2026-10-29)

- **Ocean only for now**; every other map stays as it is until asked.
- **Aligned lines:** done on the Ocean in v169.
- **The name on the line is enough:** no separate "Entering…" banner.
- **No region discovery reward** for now.
- **The Dungeon's Halloween looks stay.**
- **A sixth region:** undecided.
- **New in this version** (user's requests): music changes per region with a fade; the regions loop forever; every region has its own collection set.
