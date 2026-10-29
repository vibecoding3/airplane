// Paper Nosedive — Regions (design/regions.md): a map is a journey through regions, and everything in one (its name on the
// depth line, background art, water colour, obstacle skins, background fish, drifting specks, collection sets) belongs to
// the same place and changes on the same 100 m line. The run never ends, so the regions loop: one pass is a dive, and the
// next dive starts again with the first region (v171). Only the Ocean uses this table so far (v170); the other maps keep
// their own depth tables (cityLayer, forestSeason… in obstacles.js, ART_BOUNDS in render.js, REGIONS in maps.js).
// Difficulty, wind (until 700 m) and conveyors (until 1,500 m) still go by the real depth, never by the region.
'use strict';

// Each region: `from` (metres, a multiple of 100), `art` (its depth-art.css class), `music` (its theme in js/music.js),
// `specks` (none / plankton / snow / bio),
// `scenery` (background fish and far-off silhouettes, never an obstacle species), `skins` (the looks each obstacle type
// can take there, in the order they are picked from; colours live in SEA_LOOKS) and `collections` (the collection sets
// found there and nowhere else; since v173 every Ocean region has its own).
const MAP_REGIONS = {
  sea: [
    { id: 'reef', name: 'Sunlit reef', from: 0, art: 'art-sea-0', music: 'seaReef', specks: 'none', collections: ['shells'],
      scenery: ['clown', 'tang', 'seahorse'],
      // bright life (v174: the reef and the twilight zone split the looks they shared); Nemo's divers walk the reef
      skins: { gate: ['coral', 'rockledge'], blot: ['urchin', 'anemone'], note: ['jelly', 'combjelly', 'diver'],
               erasers: ['clam'], cutter: ['moray'], paw: ['kelp'], glue: ['shrimp'],
               starfish: ['starfish'], zap: ['ray'], mine: ['navalmine'], bubbles: ['bubbles'],
               fan: ['current', 'drift'], clips: ['sardines', 'butterfly'], wad: ['puffer', 'turtle'], protractor: ['braincoral', 'rock'],
               pencil: ['swordfish', 'driftwood'], band: ['fishline'], compass: ['anchor'], scissors: ['crab'] } },
    { id: 'twilight', name: 'Twilight zone', from: 200, art: 'art-sea-1', music: 'sea', specks: 'plankton', collections: ['fish'],
      scenery: ['angel', 'parrot'],
      // wrecks and darker animals, and Twenty Thousand Leagues (v174): the Nautilus, Ned Land's harpoon, the giant pearl
      // oyster, a diver's electric rifle and the Maelstrom
      skins: { gate: ['wreck', 'rockledge'], blot: ['stonefish', 'urchin'], note: ['combjelly'],
               erasers: ['wreckhull', 'giantoyster'], cutter: ['mantis', 'harpoon'], paw: ['octopus'], glue: ['cannon', 'sub', 'riflediver'],
               starfish: ['brittlestar', 'wheel'], zap: ['eel'], mine: ['barrel'], bubbles: ['bubbles'],
               fan: ['current', 'maelstrom'], clips: ['sardines'], wad: ['puffer'], protractor: ['rock'],
               pencil: ['mast', 'swordfish', 'nautilus'], band: ['netline'], compass: ['anchor'], scissors: ['lobster'] } },
    { id: 'ruins', name: 'Sunken ruins', from: 400, art: 'art-sea-2', music: 'seaRuins', specks: 'snow', collections: ['treasures'],
      scenery: ['lion', 'barracuda', 'tuna', 'ucArch', 'ucTowers'],
      skins: { gate: ['columns'], blot: ['amphora'], note: ['lantern'], erasers: ['templedoors'], cutter: ['trident'], paw: ['statuearm'],
               glue: ['fishfountain'], starfish: ['calendar', 'coin'], zap: ['glyph'], mine: ['bubblemine'], bubbles: ['elevator'],
               fan: ['pump'], clips: ['msgcapsules'], wad: ['lanternfloat'], protractor: ['stoneface', 'atlantis'], pencil: ['oar'], band: ['mooring'],
               compass: ['clockhand'], scissors: ['millwheel'] } },
    { id: 'dome', name: 'Dome city', from: 800, art: 'art-sea-3', music: 'seaDome', specks: 'snow', collections: ['inventions'],
      scenery: ['reefshark', 'hammer', 'sunfish', 'ucDomes', 'ucChimney', 'ucTowers'],
      skins: { gate: ['tubewalk'], blot: ['orb'], note: ['mailpod'], erasers: ['hatch'], cutter: ['gangplank'], paw: ['claw'],
               glue: ['domecannon'], starfish: ['coin'], zap: ['cable'], mine: ['valve'], bubbles: ['elevator'], fan: ['pump'],
               clips: ['trampods'], wad: ['capsule'], protractor: ['domehouse'], pencil: ['tramcar'], band: ['glowcable'],
               compass: ['clockhand', 'crane'], scissors: ['fanprop'] } },
    { id: 'abyss', name: 'The abyss', from: 1500, art: 'art-sea-4', music: 'seaAbyss', specks: 'bio', collections: ['abysslights'],
      // the oarfish, viperfish and gulper eel became obstacles in v174, so they left the scenery (v171–v173 they swam here)
      scenery: ['white', 'squid', 'hatchet'],
      // its own deep looks since v174 (it reused the reef's before; art in draw-ocean-deep.js), plus the Nautilus, its
      // searchlight and the kraken from Twenty Thousand Leagues
      skins: { gate: ['glasssponge'], blot: ['glowurchin'], note: ['anglerfish'],
               erasers: ['gulper'], cutter: ['viperfish'], paw: ['kraken'], glue: ['glowshrimp'],
               starfish: ['ammonite'], zap: ['lure', 'searchlight'], mine: ['glowpuff'], bubbles: ['vent'],
               fan: ['current'], clips: ['lanternfish'], wad: ['glowbell'], protractor: ['whale'], pencil: ['oarfish', 'nautilus'],
               band: ['glowtentacle'], compass: ['tentacle'], scissors: ['spidercrab'] } }
  ]
};
// metres in one dive: after the last region the first one starts again (the Ocean: the abyss ends in a trench, and the
// plane falls out of it into another sea)
const REGION_DIVE = { sea: 2500 };

const hasRegions = map => !!MAP_REGIONS[map];
// the depth inside the current dive (0 above the start), and which dive a depth is in (1, 2, …)
const diveDepth = (map, m) => { const len = REGION_DIVE[map]; return Math.max(0, m) % len; };
const diveAtM = (map, m) => Math.floor(Math.max(0, m) / REGION_DIVE[map]) + 1;
// the region index at a depth in metres (the depth a line is labelled with)
function regionIndexAtM(map, m) {
  const list = MAP_REGIONS[map], d = diveDepth(map, m);
  let i = list.length - 1;
  while (i > 0 && list[i].from > d) i--;
  return i;
}
// where the region at a depth ends, in metres: the next region's line, or the start of the next dive
function regionEndM(map, m) {
  const list = MAP_REGIONS[map], i = regionIndexAtM(map, m), start = Math.max(0, m) - diveDepth(map, m);
  return start + (i + 1 < list.length ? list[i + 1].from : REGION_DIVE[map]);
}
// …and at a world y: the depth lines sit planeScreenY() below k × 100 m (pageTop), so depth is measured from there
const regionIndexAt = (map, y) => regionIndexAtM(map, (y - planeScreenY()) / PX_PER_M);
const regionAt = (map, y) => MAP_REGIONS[map][regionIndexAt(map, y)];
