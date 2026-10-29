// Paper Nosedive — Regions (design/regions.md): a map is a journey through regions, and everything in one (its name on the
// depth line, background art, obstacle skins, background fish, drifting specks, collection sets) belongs to the same
// place and changes on the same 100 m line. Only the Ocean uses this table so far (v170); the other maps keep their
// own depth tables (cityLayer, forestSeason… in obstacles.js, ART_BOUNDS in render.js, REGIONS in maps.js).
'use strict';

// Each region: `from` (metres, a multiple of 100), `art` (its depth-art.css class), `specks` (none / plankton / snow / bio),
// `scenery` (background fish and far-off silhouettes, never an obstacle species), `skins` (the looks each obstacle type
// can take there, in the order they are picked from; colours live in SEA_LOOKS) and `collections` (sets found there).
const MAP_REGIONS = {
  sea: [
    { id: 'reef', name: 'Sunlit reef', from: 0, art: 'art-sea-0', specks: 'none', collections: [],
      scenery: ['clown', 'tang', 'seahorse'],
      skins: { gate: ['coral', 'rockledge', 'wreck'], blot: ['urchin', 'anemone', 'stonefish'], note: ['jelly', 'combjelly'],
               erasers: ['clam', 'wreckhull'], cutter: ['moray', 'mantis'], paw: ['kelp', 'octopus'], glue: ['sub', 'shrimp', 'cannon'],
               starfish: ['starfish', 'brittlestar', 'wheel'], zap: ['eel', 'ray'], mine: ['navalmine', 'barrel'], bubbles: ['bubbles'],
               fan: ['current', 'drift'], clips: ['sardines', 'butterfly'], wad: ['puffer', 'turtle'], protractor: ['braincoral', 'rock'],
               pencil: ['swordfish', 'driftwood'], band: ['fishline', 'netline'], compass: ['anchor'], scissors: ['crab', 'lobster'] } },
    { id: 'twilight', name: 'Twilight zone', from: 200, art: 'art-sea-1', specks: 'plankton', collections: [],
      scenery: ['angel', 'parrot'],
      skins: { gate: ['coral', 'rockledge', 'wreck'], blot: ['urchin', 'anemone', 'stonefish'], note: ['jelly', 'combjelly'],
               erasers: ['clam', 'wreckhull'], cutter: ['moray', 'mantis'], paw: ['kelp', 'octopus'], glue: ['sub', 'shrimp', 'cannon'],
               starfish: ['starfish', 'brittlestar', 'wheel'], zap: ['eel', 'ray'], mine: ['navalmine', 'barrel'], bubbles: ['bubbles'],
               fan: ['current', 'drift'], clips: ['sardines', 'butterfly'], wad: ['puffer', 'turtle'], protractor: ['braincoral', 'rock'],
               pencil: ['swordfish', 'driftwood', 'mast'], band: ['fishline', 'netline'], compass: ['anchor'], scissors: ['crab', 'lobster'] } },
    { id: 'ruins', name: 'Sunken ruins', from: 400, art: 'art-sea-2', specks: 'snow', collections: ['treasures'],
      scenery: ['lion', 'barracuda', 'tuna', 'ucArch', 'ucTowers'],
      skins: { gate: ['columns'], blot: ['amphora'], note: ['lantern'], erasers: ['templedoors'], cutter: ['trident'], paw: ['statuearm'],
               glue: ['fishfountain'], starfish: ['calendar', 'coin'], zap: ['glyph'], mine: ['bubblemine'], bubbles: ['elevator'],
               fan: ['pump'], clips: ['msgcapsules'], wad: ['lanternfloat'], protractor: ['stoneface'], pencil: ['oar'], band: ['mooring'],
               compass: ['clockhand'], scissors: ['millwheel'] } },
    { id: 'dome', name: 'Dome city', from: 800, art: 'art-sea-3', specks: 'snow', collections: ['treasures'],
      scenery: ['reefshark', 'hammer', 'sunfish', 'ucDomes', 'ucChimney', 'ucTowers'],
      skins: { gate: ['tubewalk'], blot: ['orb'], note: ['mailpod'], erasers: ['hatch'], cutter: ['gangplank'], paw: ['claw'],
               glue: ['domecannon'], starfish: ['coin'], zap: ['cable'], mine: ['valve'], bubbles: ['elevator'], fan: ['pump'],
               clips: ['trampods'], wad: ['capsule'], protractor: ['domehouse'], pencil: ['tramcar'], band: ['glowcable'],
               compass: ['clockhand', 'crane'], scissors: ['fanprop'] } },
    { id: 'abyss', name: 'The abyss', from: 1500, art: 'art-sea-4', specks: 'bio', collections: [],
      scenery: ['white', 'squid', 'oarfish'],
      skins: { gate: ['coral', 'rockledge', 'wreck'], blot: ['urchin', 'stonefish'], note: ['jelly', 'combjelly', 'anglerfish'],
               erasers: ['clam', 'wreckhull'], cutter: ['moray', 'mantis'], paw: ['kelp', 'octopus'], glue: ['sub', 'shrimp', 'cannon'],
               starfish: ['starfish', 'brittlestar', 'wheel'], zap: ['eel', 'ray'], mine: ['navalmine', 'barrel'], bubbles: ['bubbles', 'vent'],
               fan: ['current'], clips: ['lanternfish'], wad: ['puffer'], protractor: ['rock', 'whale'], pencil: ['swordfish', 'mast'],
               band: ['netline'], compass: ['anchor', 'tentacle'], scissors: ['crab', 'lobster'] } }
  ]
};
// the deepest fish, from 2,500 m (inside the abyss for now; the looping dives of design/regions.md will decide their place)
const SEA_DEEP_FISH = { from: 2500, scenery: ['viper', 'gulper', 'hatchet'] };

const hasRegions = map => !!MAP_REGIONS[map];
// the region index at a depth in metres (the depth a line is labelled with)
function regionIndexAtM(map, m) {
  const list = MAP_REGIONS[map];
  let i = list.length - 1;
  while (i > 0 && list[i].from > m) i--;
  return i;
}
// …and at a world y: the depth lines sit planeScreenY() below k × 100 m (pageTop), so depth is measured from there
const regionIndexAt = (map, y) => regionIndexAtM(map, (y - planeScreenY()) / PX_PER_M);
const regionAt = (map, y) => MAP_REGIONS[map][regionIndexAt(map, y)];
