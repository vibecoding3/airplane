// Paper Nosedive — Regions (design/regions.md): a map is a journey through regions, and everything in one (its name on the
// depth line, background art, water colour, obstacle skins, background fish, drifting specks, collection sets) belongs to
// the same place and changes on the same 100 m line. The run never ends, so a map's regions are either sequential (a
// journey down one place: the last region goes on forever) or looping (one pass is a dive, and the next dive starts again
// with the first region; REGION_DIVE). The Ocean is sequential since v175 (it looped in v171–v174): the plane sinks
// through one ocean, so the abyss is its bottom. Only the Ocean uses this table so far (v170); the other maps keep
// their own depth tables (cityLayer, forestSeason… in obstacles.js, ART_BOUNDS in render.js, REGIONS in maps.js).
// Difficulty, wind (until 700 m) and conveyors (until 1,500 m) still go by the real depth, never by the region.
'use strict';

// Each region: `from` (metres, a multiple of 100), `art` (its depth-art.css class), `music` (its theme in js/music.js),
// `specks` (none / plankton / snow / bio),
// `scenery` (background fish and far-off silhouettes, never an obstacle species), `skins` (the looks each obstacle type
// can take there, in the order they are picked from; colours live in SEA_LOOKS; no wind looks from 700 m and no
// conveyor looks from 1,500 m, since those never spawn there) and `collections` (the collection sets
// found there and nowhere else; since v173 every Ocean region has its own).
const MAP_REGIONS = {
  sea: [
    { id: 'reef', name: 'Sunlit reef', from: 0, art: 'art-sea-0', music: 'seaReef', specks: 'none', collections: ['shells'],
      // background fish at the depths they really live (v186): reef fish, dolphins and reef sharks in the sunlit water
      scenery: ['clown', 'tang', 'seahorse', 'angel', 'parrot', 'lion', 'triggerfish', 'grouper', 'barracuda', 'dolphin', 'reefshark'],
      // one design per obstacle (v183, the user's picks; the art of the dropped looks stays, unused), colours vary
      skins: { gate: ['coral'], blot: ['anemone'], note: ['jelly'], erasers: ['clam'], cutter: ['moray'],
               paw: ['kelp'], glue: ['shrimp'], starfish: ['starfish'], zap: ['ray'], mine: ['navalmine'],
               bubbles: ['bubbles'], fan: ['current'], clips: ['butterfly'], wad: ['puffer'],
               protractor: ['braincoral'], pencil: ['swordfish'], band: ['fishline'], compass: ['anchor'],
               scissors: ['crab'] } },
    { id: 'twilight', name: 'Twilight zone', from: 200, art: 'art-sea-1', music: 'sea', specks: 'plankton', collections: ['fish'],
      scenery: ['tuna', 'hammer', 'sunfish', 'opah', 'cutlass', 'lanternfish'],   // open-water hunters and the first mid-water fish
      // one design per obstacle (v183): wrecks, darker animals and Twenty Thousand Leagues (the Nautilus, Ned Land's
      // harpoon, the Maelstrom)
      skins: { gate: ['wreck'], blot: ['stonefish'], note: ['combjelly'], erasers: ['wreckhull'],
               cutter: ['harpoon'], paw: ['octopus'], glue: ['sub'], starfish: ['brittlestar'], zap: ['eel'],
               mine: ['barrel'], bubbles: ['airleak'], fan: ['maelstrom'], clips: ['sardines'], wad: ['boxfish'],
               protractor: ['wreckbow'], pencil: ['nautilus'], band: ['netline'], compass: ['grapple'],
               scissors: ['hermitcrab'] } },
    { id: 'ruins', name: 'Sunken ruins', from: 400, art: 'art-sea-2', music: 'seaRuins', specks: 'snow', collections: ['treasures'],
      scenery: ['hatchet', 'lanternfish', 'goblin', 'chimaera', 'ucArch', 'ucTowers'],   // mid-water fish, the city far behind
      // one design per obstacle (v183), with Atlantis and, since v184, one of Nemo's divers with his rifle
      skins: { gate: ['columns'], blot: ['amphora'], note: ['lantern'], erasers: ['templedoors'],
               cutter: ['trident'], paw: ['statuearm'], glue: ['riflediver'], starfish: ['calendar'],
               zap: ['glyph'], mine: ['bubblemine'], bubbles: ['templevent'], fan: ['pump'], clips: ['scrolls'],
               wad: ['lanternfloat'], protractor: ['atlantis'], pencil: ['beam'], band: ['mooring'],
               compass: ['bronzestaff'], scissors: ['millwheel'] } },
    { id: 'dome', name: 'Dome city', from: 800, art: 'art-sea-3', music: 'seaDome', specks: 'snow', collections: ['inventions'],
      scenery: ['white', 'sixgill', 'frilled', 'blobfish', 'ucDomes', 'ucChimney', 'ucTowers'],   // deep sharks and the blobfish
      // one design per obstacle (v183)
      skins: { gate: ['tubewalk'], blot: ['orb'], note: ['bulb'], erasers: ['hatch'], cutter: ['piston'],
               paw: ['robotarm'], glue: ['domecannon'], starfish: ['gear'], zap: ['tesla'], mine: ['valve'],
               bubbles: ['airvent'], clips: ['bubblecars'], wad: ['capsule'], protractor: ['domehouse'],
               pencil: ['tramcar'], band: ['glowcable'], compass: ['crane'], scissors: ['fanprop'] } },
    { id: 'abyss', name: 'The abyss', from: 1500, art: 'art-sea-4', music: 'seaAbyss', specks: 'bio', collections: ['abysslights'],
      // the oarfish, viperfish and gulper eel became obstacles in v174, so they left the scenery (v171–v173 they swam here)
      scenery: ['rattail', 'tripod', 'snailfish', 'fangtooth'],   // the deep-sea floor and the deepest fish (the giant squid left in v181)
      // one design per obstacle (v183): its own deep looks (v174) and the kraken
      skins: { gate: ['glasssponge'], blot: ['glowurchin'], note: ['anglerfish'], erasers: ['gulper'],
               cutter: ['viperfish'], paw: ['kraken'], glue: ['glowshrimp'], starfish: ['ammonite'], zap: ['lure'],
               mine: ['glowpuff'], bubbles: ['vent'], wad: ['glowbell'], protractor: ['whale'], pencil: ['oarfish'],
               band: ['glowtentacle'], compass: ['tentacle'], scissors: ['spidercrab'] } }
  ]
};
// looping maps only: metres in one dive, after which the first region starts again. A map not listed is sequential: its
// last region never ends. (The Ocean was listed with 2,500 m in v171–v174.)
const REGION_DIVE = {};

const hasRegions = map => !!MAP_REGIONS[map];
const loops = map => !!REGION_DIVE[map];
// the depth inside the current dive (0 above the start; on a sequential map just the depth), and which dive it is in (1, 2, …)
const diveDepth = (map, m) => loops(map) ? Math.max(0, m) % REGION_DIVE[map] : Math.max(0, m);
const diveAtM = (map, m) => loops(map) ? Math.floor(Math.max(0, m) / REGION_DIVE[map]) + 1 : 1;
// the region index at a depth in metres (the depth a line is labelled with)
function regionIndexAtM(map, m) {
  const list = MAP_REGIONS[map], d = diveDepth(map, m);
  let i = list.length - 1;
  while (i > 0 && list[i].from > d) i--;
  return i;
}
// where the region at a depth ends, in metres: the next region's line, the start of the next dive, or never (the last
// region of a sequential map)
function regionEndM(map, m) {
  const list = MAP_REGIONS[map], i = regionIndexAtM(map, m), start = Math.max(0, m) - diveDepth(map, m);
  if (i + 1 < list.length) return start + list[i + 1].from;
  return loops(map) ? start + REGION_DIVE[map] : Infinity;
}
// …and at a world y: the depth lines sit planeScreenY() below k × 100 m (pageTop), so depth is measured from there
const regionIndexAt = (map, y) => regionIndexAtM(map, (y - planeScreenY()) / PX_PER_M);
const regionAt = (map, y) => MAP_REGIONS[map][regionIndexAt(map, y)];
