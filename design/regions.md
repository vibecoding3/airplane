# Regions: a design system for maps

First written at v168, rewritten at v169 (2026-10-29) with three new parts: **music per region with a fade**, **regions in an endless run**, and **a collection set per region**. Updated at v175: a map's regions are either **sequential** or **looping** (section 4); the Ocean is sequential. Built so far on the Ocean: aligned lines (v169), one region table (v170), looping dives (v171, undone in v175), region music (v172), a collection set per region (v173), region looks (v174) and sequential regions (v175); see section 11. Everything else is a proposal.

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

The depth rules of some mechanics stay tied to the real depth too: no wind from 700 m, no conveyors from 1,500 m. So on a looping map, a first region visited a second time (say at 2,600 m) has no wind and no conveyor.

### 3.2 One set of lines
- Every region starts on a 100 m line, so each change lands on a dotted line with the name under it.
- Colour, art, scenery, specks, obstacle skins and the name switch **sharply on the line**. The music is the one exception: it **fades** across the line (section 5).
- Depth is measured the way the lines are drawn (`pageTop`: k × 100 m, plus the plane's screen offset), so a row drawn below the line gets the new region (fixed for the Ocean in v169).
- A row keeps the region of the depth where it spawned.

### 3.3 Full coverage
- Every mechanic the map uses has a skin in every region. Missing skins fall back to the map's **base skin** (the original look), so nothing breaks while a region is built.
- **Exactly one design per mechanic per region** (user's decision, v183; "one or two" until then), with colour variants instead of more designs: within a region a shape always means the same thing, and crossing a line changes every shape.
- A skin belongs to one region, or to two neighbouring ones when it truly fits both. It never skips a region.

### 3.4 Readability
- **Scenery never looks like an obstacle.** A creature or object that is an obstacle skin anywhere on the map stays out of that map's scenery (the Ocean's v124/v128 rule).
- **Skins stand out from their region.** Dark regions get pale, lit skins with ink outlines; light regions get dark outlines.
- **Nothing hides a hazard** (the whiteout rule). Fog, steam, ink and glow stay see-through.
- **A mechanic keeps its silhouette.** A Gap Wall is always two barriers with a hole; a Wall Turret always has a mouth that flashes before it fires.

### 3.5 Theme
- Original designs only: no famous places, characters or brands (Google Play rule). Exceptions decided by the user: the Volcano's Minecraft minerals (temporary), and the Ocean's Twenty Thousand Leagues Under the Sea looks (v174; Verne's novel is public domain, drawn from the book, never from a film).
- Each map keeps its own limits (Forest nature only, Volcano no dragons, Kitchen food and tools only…).

### 3.6 A checklist for a new region
1. Can I say its theme in one sentence, and does it follow from the region before it?
2. Does it change the colours, background art, scenery, specks and music, not just the name?
3. Does every mechanic have a skin here (or a deliberate fallback)?
4. Do the skins stand out against its colours?
5. Is anything in the scenery also an obstacle?
6. Does it have its collection set, and do its items fit the place?
7. On a looping map: does the region still make sense when it comes round again? On a sequential map: is the last region a believable "bottom" that can go on forever (section 4)?
8. Is every design original?

---

## 4. The endless run: sequential or looping regions

The game never ends, so every map needs an answer to "what comes after the last region?". There are two kinds of map (user's decision, v175):

| Kind | What happens after the last region | Use it when | Example |
|---|---|---|---|
| **Sequential** | Nothing: the last region goes on forever | The map is a journey **down** through one place: each region is deeper, darker or older than the one before, so coming back to the first one would make no sense | The Ocean: you sink from the surface to the abyss, and the abyss is the bottom |
| **Looping** | The first region starts again: one pass through all the regions is a **dive** | The map is a **cycle** in itself, so going round again is natural | The Forest's seasons: after the night, spring comes back |

A map's kind is chosen once, with its theme, and is part of its region table (section 8).

### 4.1 Sequential maps (the Ocean, since v175)

| # | Region | Depth |
|---|---|---|
| 1 | Sunlit reef | 0–200 m |
| 2 | Twilight zone | 200–400 m |
| 3 | Sunken ruins | 400–800 m |
| 4 | Dome city | 800–1,500 m |
| 5 | The abyss | 1,500 m and on, forever |

- The regions get longer with depth: new players see three or four places in their first runs, and the endless last region is where good players spend their long runs.
- **The last region must be a believable bottom** that can go on forever. The abyss works: total darkness with only living light, and nothing below it.
- The water colour follows the real depth and stays near-black in the abyss.
- **Collections:** each set is offered only in its one region; a long run is the way to see all of the abyss's set.
- Wind and conveyors stop at their usual depths, as on every map.

The Ocean looped every 2,500 m in v171–v174: the abyss "ended in a trench", the reef came back, and the line said "Sunlit reef · Dive 2". The user reconsidered: the plane goes **down** the ocean, so a reef below the abyss made no sense. Since v175 the Ocean is sequential.

### 4.2 Looping maps (none yet)
- One pass through all the regions is a **dive**, of a fixed length in metres (`REGION_DIVE`), so a region comes back at the same depth each time.
- **The loop needs a reason** the player can feel, or the first region coming back looks like a mistake (the Forest: the year turns).
- **The line at the start of a dive** names the dive as well as the region: "Spring · Dive 2". All other lines show only the region name.
- **The same in every dive:** looks, music, colours, scenery and collections. The colour goes back to the first region's at each new dive.
- **Still by the real depth:** difficulty keeps growing, so a second pass is harder than the first; wind and conveyors stop at their usual depths, so a second first region may have neither.
- **Collections:** in the second dive a region offers only the items that haven't appeared yet in this run.

The code for looping maps stays in `js/regions.js` (built and tested on the Ocean in v171): a map listed in `REGION_DIVE` loops, any other map is sequential.

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
- **Looping maps:** in the second dive, a region offers only the items that haven't appeared yet in this run. On a sequential map each set is offered only in its one region.
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
| The abyss | Total darkness, only living light; the bottom, going on forever | Near-black | Bioluminescent dots | Great white, giant squid, hatchetfish | Bioluminescence |

### 7.2 Skins per region

The plan as first written. All the **new** looks were drawn in v174 (`js/draw-ocean-deep.js`), which also added nine Twenty Thousand Leagues looks (section 11, step 6). The live table is `MAP_REGIONS.sea` in `js/regions.js`.

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
- The lanternfish school (800 m +) lost its place: the dome city is city skins only and conveyors stop at 1,500 m. It was removed in v179.

---

## 8. Data shape

One table per map replaces the depth functions and look tables spread over the code today.

```js
// js/regions.js: a map's regions in order. A sequential map's last region goes on forever; a looping map, listed in
// REGION_DIVE with its dive length in metres, starts again with its first region
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
- **A region log on the game-over screen:** "You reached the Dome city" reads better than only "1,012 m".
- **A sixth Ocean region** (undecided, see section 12): with the abyss endless, a deeper region (for example hydrothermal vents from 2,500 m) would break up the long abyss for the best players.

---

## 10. Sketches for the other maps (not now)

Kept for later; the Ocean comes first. Region names are the ones already shown in the game (v168).

Suggested kind for each map (section 4); the user decides when a map's regions are built.

| Map | Regions | Suggested kind | Why |
|---|---|---|---|
| Paper | Notebook page · Graph paper · Dot grid · Sheet music · Blueprint | Looping | Pages of a notebook: a new notebook starts |
| Space | Low orbit · Moon orbit · The planets · Deep space · Far galaxies | Sequential | Further and further from Earth; the far galaxies never end |
| Dungeon | The well · Torch halls · The crypt · Crystal caves · The underworld | Sequential | Deeper under the castle; the underworld is the bottom |
| Neon City | Rooftops · The streets · The subway · The arcade · The data core | Sequential | Down through the city's layers; the data core is its heart |
| Forest | Spring · Summer · Autumn · Winter · Night | Looping | The year turns: spring again |
| Desert | The dunes · The canyon · The oasis · Fossil beds · Amber | Sequential | Older and older rock; the amber is the deepest layer |
| Volcano | Jungle slope · Ash cloud · The crater · Lava tubes · Magma chamber | Sequential | Into the volcano; the magma chamber is the bottom |
| Kitchen | Top shelf · The countertop · The stove · The sink · The fridge | Sequential | Down the kitchen and into the fridge |

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
3. ~~**Cycles**~~ (done in v171, undone for the Ocean in v175): the Ocean looped every 2,500 m (`REGION_DIVE`), with "Sunlit reef · Dive 2" on the line. The deepest fish (viperfish, gulper eel, hatchetfish) joined the abyss scenery. `SIM_VERSION` 4. The looping code stays for looping maps.
4. ~~**Music**~~ (done in v172): four new Ocean themes (`seaReef`, `seaRuins`, `seaDome`, `seaAbyss`; the twilight keeps `sea`), each region's `music` in the table, and a 4-second linear cross-fade when the plane crosses a line. The music never touches the run's random numbers, so no `SIM_VERSION` bump. `tools/test.js` checks every theme's bars and that the run's theme follows the region in both dives.
5. ~~**Collections**~~ (done in v173): the Seashells, Legendary fish and Sunken treasures each live in one region now (reef, twilight, ruins), and two new sets were added: Dome inventions (8, on the dome city's air capsules) and Abyss lights (8, on the abyss's swarms). The Collections screen shows the Ocean's sets in region order, named with their region. One test spawns 300 rows in each set's region (both dives) and checks every item appears once, then 100 rows in each other region where none may appear. `SIM_VERSION` 5.
6. ~~**Skins**~~ (done in v174): the reef and the twilight zone split their shared looks, and the abyss got 12 looks of its own (`js/draw-ocean-deep.js`). Also added at the user's request: 9 looks from Jules Verne's *Twenty Thousand Leagues Under the Sea* (the Nautilus, Ned Land's harpoon, Nemo's divers and their electric rifles, the giant pearl oyster, the Maelstrom, Atlantis, the kraken, the Nautilus's searchlight), placed in the regions they fit. The oarfish, viperfish and gulper eel left the abyss scenery. `SIM_VERSION` 6.
7. ~~**Sequential**~~ (done in v175, the user's decision): the Ocean no longer loops (`REGION_DIVE` is empty); the abyss goes on forever, the water stays dark, and no line says "Dive 2". `SIM_VERSION` 7.
8. ~~**Second looks**~~ (done in v179): every obstacle in the twilight zone, the ruins and the dome city has two looks there (45 new, `js/draw-ocean-more.js`), and the three looks that could never spawn (the dome city's pump, the abyss's current and lanternfish) were removed. `SIM_VERSION` 8. Collectibles stay hard to find (user's decision: no higher chances), and no sixth region (user's decision: the five stay).
9. **Tests** in `tools/test.js` (built): every mechanic has a skin in every region and every skin exists; spawned obstacles use their region's looks; the Ocean doesn't loop and its abyss is endless (checked at 2,600, 5,100 and 9,000 m); each collection set appears only in its region; no scenery fish is an obstacle; the music theme follows the region (checked by name, not by sound).

---

## 12. Decisions so far (2026-10-29)

- **Ocean only for now**; every other map stays as it is until asked.
- **Aligned lines:** done on the Ocean in v169.
- **The name on the line is enough:** no separate "Entering…" banner.
- **No region discovery reward** for now.
- **The Dungeon's Halloween looks stay.**
- **A sixth region:** no; the Ocean keeps its five regions (user's decision, v179).
- **v169 rewrite** (user's requests): music changes per region with a fade; every region has its own collection set.
- **Sequential or looping (v175):** some maps have looping regions and others sequential ones. The Ocean is sequential, because the plane goes down the ocean (it looped in v171–v174).
- **Twenty Thousand Leagues Under the Sea looks on the Ocean (v174):** allowed although not original designs; the novel is public domain.
- **One design per obstacle per region (v183):** colours vary instead; the user picked the designs (README 5.2 lists them).
- **Collectibles stay hard to find (v179):** region-only sets with their current chances; finding a whole set takes many runs on purpose.
