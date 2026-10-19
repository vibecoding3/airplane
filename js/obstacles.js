// Paper Nosedive — Obstacle palettes, the makers for every obstacle, and row spawning for both maps.
'use strict';

// ---------- obstacle generation ----------
// a small round ink blot, used as the extra hazard next to desk fans
const inkBlot = (x, y, r = rand(14, 18)) => ({ type: 'blot', x, y, r, drops: [],
  bumps: Array.from({ length: 6 }, (_, j) => ({ t: j / 6 * 6.28, d: r * 0.7, r: r * 0.4 })) });
const CLIP_COLORS = ['#8d96a3', '#d9443a', '#2f6fd1', '#2f8f5b', '#e0a21a', '#f29fbd', '#8a4fc2', '#2b2b2b', '#00a3a3'];
const NOTE_COLORS = ['#fde58a', '#f7a8c4', '#b9e3a8', '#a8d4f2', '#ffc58a', '#d4b8f2', '#a8efe0'];
const SCISSOR_COLORS = ['#f07f1e', '#2f8f5b', '#8a4fc2', '#2f6fd1', '#d9443a', '#f29fbd', '#00a3a3', '#2b2b2b', '#e0a21a'];
const BAND_COLORS = ['#c0392b', '#e0a21a', '#2f6fd1', '#2f8f5b', '#b07a45', '#8a4fc2', '#f29fbd', '#00a3a3'];
const CAT_COLORS = ['#e8913a', '#9a9a9a', '#4a4a4a', '#efe2c8', '#8b5a2b', '#fbfbf7', '#c9b79c'];
// the classic green of school geometry sets: translucent plastic, darker edge, white markings
const GEO = { fill: 'rgba(0,135,85,.55)', edge: '#00573a', mark: 'rgba(255,255,255,.92)' };
const geo = (fill, edge) => ({ fill, edge, mark: 'rgba(255,255,255,.92)' });

// colour variants per obstacle; one is picked when an obstacle spawns (shared within a row)
const PALETTES = {
  gate: [   // rulers: wood, clear blue, geometry green, pink, metal, orange plastic
    { face: '#f3d88b', edge: '#e6c46a', mark: COL.ink },
    { face: 'rgba(150,200,238,.85)', edge: 'rgba(95,150,205,.85)', mark: COL.ink },
    { face: 'rgba(0,135,85,.6)', edge: 'rgba(0,95,60,.7)', mark: '#ffffff' },
    { face: '#f6b9cb', edge: '#e597ad', mark: COL.ink },
    { face: '#d7dbe1', edge: '#b3b9c2', mark: COL.ink },
    { face: 'rgba(246,155,70,.8)', edge: 'rgba(210,112,32,.85)', mark: COL.ink }
  ],
  erasers: [
    { rub: '#f2a7b5', shade: '#e48c9d', sleeve: '#3a66c4' },
    { rub: '#f4f4ef', shade: '#dcdcd4', sleeve: '#2f6fd1' },
    { rub: '#bfe3b0', shade: '#9fcd8d', sleeve: '#2f8f5b' },
    { rub: '#fbe38a', shade: '#efcb5c', sleeve: '#d9443a' },
    { rub: '#c9cdd3', shade: '#aeb3ba', sleeve: '#2b2b2b' },
    { rub: '#d9c8f2', shade: '#c2aae6', sleeve: '#8a4fc2' }
  ],
  pencil: [   // body facets light / mid / dark, plus the eraser tip
    { light: '#f8d75a', mid: '#f4c430', dark: '#d9a520', tip: '#f29fae' },
    { light: '#f38b83', mid: '#d9443a', dark: '#b8322a', tip: '#f29fae' },
    { light: '#86aeea', mid: '#2f6fd1', dark: '#2152a8', tip: '#f29fae' },
    { light: '#7fcf9a', mid: '#2f8f5b', dark: '#226b44', tip: '#f29fae' },
    { light: '#5b5f66', mid: '#2b2b2b', dark: '#141414', tip: '#d9443a' },
    { light: '#f9c9d8', mid: '#f29fbd', dark: '#d97a9c', tip: '#fbfbf7' },
    { light: '#c4a2e8', mid: '#8a4fc2', dark: '#6a3699', tip: '#f29fae' }
  ],
  blot: [   // ink colours
    { ink: '#1b2760' }, { ink: '#141414' }, { ink: '#a31d1d' }, { ink: '#1f6b3a' }, { ink: '#4b2370' }, { ink: '#0f4c81' }
  ],
  // geometry tools: the green stays the most common (half the time)
  protractor: null, setsquare: null,
  wad: [ { paper: '#e6e2d4' }, { paper: '#f6efb4' }, { paper: '#f7cbd8' }, { paper: '#cfe3f6' }, { paper: '#d3d3cd' }, { paper: '#d5efcc' } ],
  compass: [
    { leg: '#c3c9d3', hinge: '#8d939e', cap: '#c8463b' },
    { leg: '#dcc46e', hinge: '#b8963a', cap: '#2f6fd1' },
    { leg: '#c3c9d3', hinge: '#2f6fd1', cap: '#f4c430' },
    { leg: '#9aa0a8', hinge: '#2b2b2b', cap: '#2f8f5b' },
    { leg: '#e8b8aa', hinge: '#c07a6a', cap: '#8a4fc2' }
  ],
  fan: [
    { body: '#dfe3ea', blade: '#7fa7d9', hub: '#5b6474' },
    { body: '#f3dddb', blade: '#e06a5f', hub: '#8a2f28' },
    { body: '#dcefe0', blade: '#6cbf86', hub: '#2f6b44' },
    { body: '#f6efd2', blade: '#f2c84b', hub: '#8a6a14' },
    { body: '#f4f4f2', blade: '#c9cdd3', hub: '#5b6474' },
    { body: '#e8e0f4', blade: '#a688d8', hub: '#4b2370' }
  ],
  glue: [ { label: '#e8812f' }, { label: '#2f6fd1' }, { label: '#8a4fc2' }, { label: '#2f8f5b' }, { label: '#d9443a' }, { label: '#e0a21a' } ],
  cutter: [
    { handle: '#f2b233', slider: '#3b3f47' }, { handle: '#f07f1e', slider: '#3b3f47' }, { handle: '#2f6fd1', slider: '#f4c430' },
    { handle: '#2f8f5b', slider: '#3b3f47' }, { handle: '#2b2b2b', slider: '#d9443a' }, { handle: '#f29fbd', slider: '#3b3f47' },
    { handle: '#8a4fc2', slider: '#f4c430' }
  ],
};
PALETTES.protractor = PALETTES.setsquare = [
  GEO, GEO, GEO, GEO, GEO,
  geo('rgba(40,120,220,.5)', '#1d4f9a'), geo('rgba(240,130,30,.55)', '#a8540f'),
  geo('rgba(140,70,200,.5)', '#5a2a8c'), geo('rgba(70,75,85,.45)', '#2b2e35'), geo('rgba(230,80,140,.5)', '#9c2c5f')
];
const pickPal = type => {
  const list = PALETTES[type];
  return list ? list[Math.floor(Math.random() * list.length)] : null;
};
const PAW_SWEEP = 0.55;          // the cat paw swings this far (radians) above and below level
const PAW_TIMES = { rest: 0.6, swipe: 0.38, retract: 0.3 };
const make = {
  gate(y, d) {           // two rulers leaving a gap
    const gapW = lerp(170, 98, d) + rand(-10, 10);
    const base = rand(gapW / 2 + 24, W - gapW / 2 - 24);
    const moving = d > 0.28 && Math.random() < 0.5;
    const amp = moving ? Math.min(base - gapW / 2 - 12, W - base - gapW / 2 - 12, rand(40, 95)) : 0;
    obstacles.push({ type: 'gate', y, gapW, base, amp, gx: base, freq: rand(0.7, 1.3), ph: rand(0, 6.28) });
    if (!moving && Math.random() < 0.45) addStar(base, y);
  },
  pencil(y, d) {
    const len = rand(120, 165), a = rand(-0.3, 0.3);
    const ext = len / 2 * Math.cos(a);
    obstacles.push({ type: 'pencil', y, len, a, x: rand(ext + 6, W - ext - 6),
      vx: (Math.random() < 0.5 ? -1 : 1) * rand(50, 90 + 140 * d) });
  },
  scissors(y, d) {
    obstacles.push({ type: 'scissors', y, x: rand(90, W - 90), rot: rand(0, 6.28),
      spin: (Math.random() < 0.5 ? -1 : 1) * rand(0.8, 1.4 + 1.3 * d), open: 0.3,
      ph: rand(0, 6.28), vx: rand(-35, 35), col: SCISSOR_COLORS[ri(0, SCISSOR_COLORS.length - 1)] });
  },
  blots(y, d) {
    const n = 1 + (Math.random() < 0.4 + 0.4 * d ? 1 : 0) + (d > 0.5 && Math.random() < 0.4 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const r = rand(15, 27 + 9 * d);
      const bumps = [], drops = [];
      const nb = 5 + Math.floor(Math.random() * 4);
      for (let j = 0; j < nb; j++) {
        const t = (j / nb) * Math.PI * 2 + rand(-0.3, 0.3);
        bumps.push({ t, d: r * rand(0.6, 0.85), r: r * rand(0.3, 0.5) });
      }
      const nd = 3 + Math.floor(Math.random() * 4);
      for (let j = 0; j < nd; j++) {
        const t = rand(0, 6.28);
        drops.push({ x: Math.cos(t) * r * rand(1.25, 1.8), y: Math.sin(t) * r * rand(1.25, 1.8), r: rand(1.5, 4.5) });
      }
      obstacles.push({ type: 'blot', x: rand(30, W - 30), y: y + rand(-45, 45), r, bumps, drops });
    }
  },
  erasers(y, d) {        // two erasers that slide shut and open again
    const gapMax = lerp(190, 150, d), gapMin = lerp(74, 56, d);
    obstacles.push({ type: 'erasers', y, cx: rand(110, W - 110), gapMin, gapMax, gap: gapMax,
      freq: rand(1.2, 1.9), ph: rand(0, 6.28) });
  },
  // the generators below may return extra vertical room they need before the next row
  protractor(y, d) {     // half-disc stuck to an edge; deeper down they come in slalom pairs
    const side = Math.random() < 0.5 ? -1 : 1;
    obstacles.push({ type: 'protractor', y, side, r: rand(70, 95 + 15 * d) });
    if (d > 0.25 && Math.random() < 0.6) {
      obstacles.push({ type: 'protractor', y: y + rand(115, 150), side: -side, r: rand(70, 95 + 15 * d) });
      return 160;
    }
    return 40;
  },
  wad(y, d) {            // crumpled paper thrown up the page, bouncing off the edges
    const n = d > 0.45 && Math.random() < 0.5 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const creases = [];
      for (let j = 0; j < 3; j++) creases.push([rand(-0.6, 0.6), rand(-0.6, 0.6), rand(-0.6, 0.6), rand(-0.6, 0.6)]);
      obstacles.push({ type: 'wad', y: y + i * 70, x: rand(40, W - 40), r: rand(14, 18), creases,
        pts: Array.from({ length: 9 }, () => rand(0.82, 1.08)), active: false,
        vx: (Math.random() < 0.5 ? -1 : 1) * rand(50, 130), vy: -rand(50, 90 + 110 * d), rot: 0, vr: rand(-4, 4) });
    }
  },
  clips(y, d) {          // a conveyor of paper clips sliding across the page
    const sp = lerp(125, 92, d);
    obstacles.push({ type: 'clips', y, sp, n: Math.ceil((W + 40) / sp) + 1, off: rand(0, sp),
      v: (Math.random() < 0.5 ? -1 : 1) * rand(40, 70 + 80 * d), col: CLIP_COLORS[ri(0, CLIP_COLORS.length - 1)] });
  },
  compass(y, d) {        // a drawing compass sweeping its pencil leg around the needle
    const ang = rand(0, 6.28);
    obstacles.push({ type: 'compass', y, x: rand(105, W - 105), L: rand(80, 105), ang, a0: ang, swept: 0,
      spin: (Math.random() < 0.5 ? -1 : 1) * rand(1.1, 1.6 + 0.9 * d) });
    return 60;
  },
  fan(y, d) {            // a desk fan on one edge blows the plane sideways inside its wind band
    const side = Math.random() < 0.5 ? -1 : 1;
    obstacles.push({ type: 'fan', y, side, band: 170, force: lerp(450, 750, d), blade: 0, t: rand(0, 5) });
    if (d > 0.3) {       // and an ink blot waiting downwind
      obstacles.push(inkBlot(side < 0 ? rand(W * 0.6, W - 30) : rand(30, W * 0.4), y + rand(-30, 30)));
    }
    return 40;
  },
  glue(y, d) {           // a glue tube on one edge squirting blobs across the page
    obstacles.push({ type: 'glue', y, side: Math.random() < 0.5 ? -1 : 1, blobs: [], timer: rand(0.2, 0.8),
      every: lerp(1.6, 1.0, d), blobV: rand(130, 170 + 90 * d), squeeze: 0 });
    return 20;
  },
  cutter(y, d) {         // a snap-off cutter on one edge: the blade shoots out, holds, then slides back
    obstacles.push({ type: 'cutter', y, side: Math.random() < 0.5 ? -1 : 1, ext: 0,
      maxExt: rand(W * 0.22, W * 0.38), period: lerp(2.4, 1.6, d), t: rand(0, 2) });
  },
  notes(y, d) {          // sticky notes fluttering down the page, swaying side to side
    const n = d > 0.4 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      obstacles.push({ type: 'note', y: y + rand(-30, 30), bx: (i + 0.5) * W / n + rand(-25, 25), x: 0, rot: 0,
        amp: rand(25, 55), f: rand(1.2, 2.2), ph: rand(0, 6.28), fall: rand(0.3, 0.45),
        col: NOTE_COLORS[ri(0, NOTE_COLORS.length - 1)], scribble: rand(0.4, 0.9) });
    }
    return 80;
  },
  setsquare(y, d) {      // a green set square (45° or 30°/60°) spinning slowly as it drifts across
    const is45 = Math.random() < 0.5;
    const a = is45 ? 88 : 62, b = is45 ? 88 : 62 * Math.sqrt(3);     // the two legs
    // right angle at the first vertex; centre the triangle on its centroid so it spins in place
    const verts = [[0, 0], [b, 0], [0, -a]].map(([x, y]) => [x - b / 3, y + a / 3]);
    const R = Math.max(...verts.map(([x, y]) => Math.hypot(x, y)));
    obstacles.push({ type: 'setsquare', y, x: rand(R + 8, W - R - 8), verts, R, rot: rand(0, 6.28),
      spin: (Math.random() < 0.5 ? -1 : 1) * rand(0.35, 0.8 + 0.6 * d),
      vx: (Math.random() < 0.5 ? -1 : 1) * rand(15, 45 + 30 * d) });
    return 50;
  },
  band(y, d) {           // a rubber band between two tacks: the band bounces you, the tacks don't forgive
    const len = rand(130, 200), cx = rand(len / 2 + 20, W - len / 2 - 20), tilt = rand(-0.15, 0.15);
    const hx = Math.cos(tilt) * len / 2, hy = Math.sin(tilt) * len / 2;
    obstacles.push({ type: 'band', y, x1: cx - hx, y1: y - hy, x2: cx + hx, y2: y + hy,
      col: BAND_COLORS[ri(0, BAND_COLORS.length - 1)], wob: 0, hitX: cx, cool: 0, t: 0 });
    return 30;
  },
  paw(y, d) {            // a cat paw from one edge: shows where it will strike, then swipes in an arc
    obstacles.push({ type: 'paw', y, side: Math.random() < 0.5 ? -1 : 1, L: rand(W * 0.45, W * 0.58),
      phase: 'rest', t: rand(0, 0.6), warn: lerp(1.1, 0.7, d), ang: -PAW_SWEEP, ext: 0,
      col: CAT_COLORS[ri(0, CAT_COLORS.length - 1)] });
    return 120;
  },
  // ---- ocean only ----
  starfish(y, d) {       // a starfish spinning as it drifts sideways, bouncing off the rock walls
    const n = d > 0.4 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      obstacles.push({ type: 'starfish', y: y + i * 80, x: rand(40, W - 40), rot: rand(0, 6.28),
        spin: (Math.random() < 0.5 ? -1 : 1) * rand(0.5, 1.3 + 0.8 * d), vx: (Math.random() < 0.5 ? -1 : 1) * rand(20, 50 + 40 * d) });
    }
    return n === 2 ? 90 : 40;
  },
  zap(y, d) {            // an electric eel on one wall: charges (dashed preview), then zaps across
    obstacles.push({ type: 'zap', y, side: Math.random() < 0.5 ? -1 : 1, len: rand(W * 0.175, W * 0.275),
      phase: 'rest', t: rand(0, 0.8), rest: lerp(1.3, 0.8, d) });
    return 20;
  },
  mine(y, d) {           // naval mines on chains: blink when the plane is close, then blow up
    const n = d > 0.45 && Math.random() < 0.5 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? rand(50, W - 50) : i ? rand(W * 0.55, W - 45) : rand(45, W * 0.45);
      obstacles.push({ type: 'mine', y: y + i * 90, x, phase: 'idle', t: 0, blast: lerp(58, 72, d) });
    }
    return n === 2 ? 100 : 40;
  },
  bubbles(y, d) {        // a column of rising bubbles: flying through it slows the fall (never hurts)
    obstacles.push({ type: 'bubbles', y, x: rand(50, W - 50), h: rand(180, 240), w: 46, t: rand(0, 5) });
    return 60;
  }
};
const ZAP_BODY = 70;           // length of the electric eel lying along its wall

// geometry shared by drawing and collision for the edge-mounted tools (glue tube, cutter)
const wallX = o => (o.side < 0 ? 0 : W);
const inward = o => -o.side;
const CUTTER_HANDLE = 80;

function clipXs(o) {
  const span = o.n * o.sp, xs = [];
  for (let i = 0; i < o.n; i++) xs.push((((o.off + i * o.sp) % span) + span) % span - 20);
  return xs;
}

// depth (as difficulty d) at which each obstacle starts appearing, and how often
let lastType = '';
// Ocean obstacles. Most reuse a notebook obstacle's movement and collision with an underwater look
// (the generator named on the right); mines, electric eels, bubble columns and starfish are their own.
const SEA_MAKERS = { coral: 'gate', urchins: 'blots', jellies: 'notes', clam: 'erasers', moray: 'cutter',
                     kelp: 'paw', sub: 'glue', current: 'fan' };
const SEA_COLS = {
  gate: ['#f08a7e', '#f4a259', '#b07cc6', '#e9c46a', '#7fc8a9'],              // coral
  blot: ['#3b2a52', '#1f3b4d', '#5a1f3a', '#2d2d2d'],                         // urchin bodies
  note: ['rgba(240,140,200,.85)', 'rgba(170,140,240,.85)', 'rgba(120,190,240,.85)', 'rgba(250,170,110,.85)'],   // jellyfish
  erasers: ['#e9d3c4', '#f2c6c2', '#d8c8e8', '#cfe3d0'],                      // clam shells
  cutter: ['#5f7f3a', '#6b8e23', '#4a6b3a'],                                  // moray eels
  paw: ['#3f8f4f', '#2f7a5a', '#5a9a3a'],                                     // kelp
  glue: ['#e0a21a', '#7f8fa1', '#c0392b', '#3a66c4'],                         // submarine hulls
  starfish: ['#f28c28', '#e0503a', '#c75b9b', '#f2c84b', '#8a4fc2']
};
const MINERALS_LIST = ['iron', 'nickel', 'copper', 'gold', 'ice', 'amethyst'];   // asteroid minerals (art in draw-space.js)
// obstacles that push the plane with wind (desk fan, ocean current) stop appearing from this depth
const WIND_MAX_M = 700;
const windAllowed = y => y / PX_PER_M < WIND_MAX_M;

// Space obstacles: every one reuses a Paper or Ocean obstacle's movement and collision with space art
const SPACE_MAKERS = { girders: 'gate', asteroids: 'blots', ice: 'notes', airlock: 'erasers', probe: 'cutter',
                       gps: 'pencil', rocket: 'wad', starlink: 'clips', tumbler: 'starfish', arm: 'compass',
                       laser: 'zap', lowgrav: 'bubbles', moon: 'protractor',
                       fighter: 'glue', blade: 'paw', station: 'protractor' };   // no wind or explosions in space
// space-only shapes on existing mechanics: the ISS (a long slider), planets (wall bulges), black holes (static)
make.iss = (y, d) => {
  const len = rand(200, 235), a = rand(-0.12, 0.12), ext = len / 2 * Math.cos(a);
  obstacles.push({ type: 'pencil', look: 'iss', y, len, a, hh: 14, x: rand(ext + 6, W - ext - 6),
    vx: (Math.random() < 0.5 ? -1 : 1) * rand(35, 60 + 80 * d) });
  return 20;
};
// planets are collectibles: each appears at most once per run; once all 8 have, a planet spawn becomes a regular
// Wall Bulge (a moon edge), so the obstacle keeps appearing with its regular variant
const planetsLeft = () => Object.keys(PLANETS).filter(n => !runCollected.has('planet-' + n));
make.planet = (y, d) => {
  const names = planetsLeft();
  if (!names.length) {
    const before = obstacles.length, extra = make.protractor(y, d);
    for (let i = before; i < obstacles.length; i++) obstacles[i].look = 'moon';
    return extra;
  }
  const name = names[ri(0, names.length - 1)];
  runCollected.add('planet-' + name);
  obstacles.push({ type: 'protractor', look: 'planet', planet: name, y, side: Math.random() < 0.5 ? -1 : 1, r: PLANETS[name].r });
  return PLANETS[name].r > 90 ? 70 : 40;
};
make.blackhole = (y, d) => {
  obstacles.push({ type: 'blot', look: 'blackhole', x: rand(60, W - 60), y, r: 26, bumps: [], drops: [] });
  return 30;
};
const SPACE_COLS = {
  gate: ['#c9ced6', '#e0a21a', '#d9443a', '#8fa3b8'],                         // girders
  blot: MINERALS_LIST,                                                        // asteroid minerals
  note: ['#bfe8ff', '#d6f1ff', '#a8d8f0'],                                    // ice chunks
  erasers: ['#d9dde3', '#c0c7cf', '#e6e0d0'],                                 // airlock doors
  cutter: ['#c9ced6', '#e8913a', '#9fb3c8'],                                  // docking probes
  pencil: ['#4f8ff0', '#7a8cf0', '#3fb8c8'],                                  // GPS satellite panels
  wad: ['#e2493b', '#2f6fd1', '#f2c84b'],                                     // rockets
  clips: ['#f2c84b', '#c9ced6', '#e2493b'],                                   // tiny satellites
  starfish: MINERALS_LIST,                                                    // tumbling asteroids (minerals)
  glue: ['#c9ced6'],                                                          // fighters
  paw: ['#ff4a5a', '#3cff9a', '#4ab8ff', '#b77cf0'],                          // energy blades
  compass: ['#f2f2f2', '#f2c84b'],                                            // robot arms
  zap: ['#ff4a5a', '#3cff9a', '#4ab8ff'],                                     // laser beams
  protractor: ['#d8d4c8', '#c9b9a6', '#b8c4d0']                               // moons
};
function spacePool(d) {
  const pool = [['girders', 3], ['asteroids', 2], ['ice', 1.2], ['tumbler', 1.2], ['lowgrav', 1], ['gps', 1 + 1.2 * d]];
  pool.push(['planet', 1.3]);
  if (d > 0.06) pool.push(['rocket', 1.2]);
  if (d > 0.08) pool.push(['starlink', 1.3]);
  if (d > 0.1) pool.push(['moon', 0.9], ['iss', 1.2]);
  if (d > 0.15) pool.push(['airlock', 1.2], ['probe', 1.2], ['blackhole', 1.1]);
  if (d > 0.2) pool.push(['laser', 1.1], ['fighter', 1.2]);
  if (d > 0.25) pool.push(['blade', 1.2], ['station', 1]);
  if (d > 0.3) pool.push(['arm', 1.2]);
  return pool;
}
// Dungeon obstacles: ten in v68, eight more in v70; each on an existing mechanic with dungeon art (draw-dungeon.js)
const DUNGEON_MAKERS = { ledges: 'gate', crusher: 'erasers', spikeballs: 'blots', rock: 'protractor', plank: 'pencil',
                         skull: 'wad', ghosts: 'notes', spear: 'cutter', firebar: 'compass', dragon: 'glue',
                         daggers: 'clips', saw: 'starfish', swords: 'scissors', runebeam: 'zap', skelarm: 'paw',
                         curse: 'mine', draft: 'fan', web: 'band', flamethrower: 'cutter', rings: 'wad' };
// obstacles that always have one look, with their own spawn chance (v81): a flamethrower is a Wall Piston whose flame shoots out
// Origami collection (Paper map): sticky-note variants, each at most once per run
const ORIGAMI = ['crane', 'frog', 'boat', 'star', 'fox', 'butterfly'];
const origamiLeft = () => ORIGAMI.filter(n => !runCollected.has('origami-' + n));
// Seashells collection (Ocean map): sea-urchin variants, each at most once per run
const SHELLS = ['conch', 'scallop', 'nautilus', 'cowrie', 'sanddollar', 'pearl'];
const shellsLeft = () => SHELLS.filter(n => !runCollected.has('shell-' + n));
// Legendary swords collection (Dungeon): Spinning Blades variants, each at most once per run
const SWORDS = ['flame', 'frost', 'crystal', 'scimitar', 'rune', 'bone'];
const swordsLeft = () => SWORDS.filter(n => !runCollected.has('sword-' + n));
// Legendary fish collection (Ocean map): starfish variants, each at most once per run
const LEGEND_FISH = ['golden', 'narwhal', 'coelacanth', 'squideye', 'ghostshark'];
const fishLeft = () => LEGEND_FISH.filter(n => !runCollected.has('fish-' + n));
// collectibles appear at most once per run: the ring designs and the two mage staffs not yet seen this run
const ringsLeft = () => DUNGEON_SOLO.rings.cols.filter(d => !runCollected.has('ring-' + d));
// staff look → collection id; the ids are older than the looks' names (v111) and must not change, saves use them
const COLLECTIBLE_LOOKS = { crescent: 'staff-frieren', twisted: 'staff-fern' };
const CRESCENT_HEAD = 11;         // radius of the head of the crescent staff (drawn in draw-dungeon.js, hit area in physics.js)
const DUNGEON_SOLO = { flamethrower: { look: 'flamethrower', cols: ['#4a4f58', '#5e4a3a'] },
  // magic rings thrown up the shaft (Rising Projectile, v86); each colour entry is a ring design (RING_DESIGNS in draw-dungeon.js)
  rings: { look: 'ring', cols: ['emerald', 'sapphire', 'ruby', 'crystal', 'amethyst', 'amber', 'skull', 'zigzag', 'leaf'] } };
// each Dungeon mechanic has two to four looks that share its hit box, each with its own colours; a row of the
// same obstacle shares one look and colour (v73; Halloween and goblin looks added in v80)
const DUNGEON_LOOKS = {
  gate: { ledge: ['#b9ab8f', '#a9a59c', '#9fa88c', '#b5917a'], beam: ['#a06a3a', '#7a5030'], girder: ['#7d8590', '#8a5a44'], scaffold: ['#8a5a32', '#a06a3a'] },
  erasers: { crusher: ['#9a958c', '#8f8476', '#a39a86'], irondoor: ['#4f555e', '#5e4a3a'], ram: ['#8a5a32', '#6b4a2a'], barricade: ['#8a5a32', '#6b4a2a'] },
  blot: { spikeball: ['#5b6068', '#7a5a44', '#8a6a3a'], cauldron: ['#5fd16a', '#b77cf0', '#ff7a3a'], boulder: ['#8f877a', '#7f8288', '#93806a'], tombstone: ['#8f8a84', '#7a7f86'] },
  protractor: { rock: ['#8f877a', '#7f8288', '#93806a'], shield: ['#a0302a', '#2f5fa8', '#2f7a44', '#c79a2a'], barrel: ['#8a5a32', '#6b4a2a'], pumpkin: ['#f28c28', '#e8a33a'] },
  pencil: { plank: ['#a06a3a', '#8a5a32', '#b07c48'], bone: ['#efe6d0', '#e0d6bc'], staff: ['#b77cf0', '#4ab8ff', '#ff5a5a'], broom: ['#d9b25a', '#c99a3a'], crescent: ['#2f4a8a'], twisted: ['#8a5a32'] },
  wad: { skull: ['#efe6d0', '#e6dcc0', '#f4efe2'], pumpkin: ['#f28c28', '#e8a33a'], slime: ['#5fd16a', '#b77cf0', '#4ab8ff'], potion: ['#b77cf0', '#5fd16a', '#ff5a7a'] },
  note: { ghost: ['#eef2ff', '#dff7e6', '#e2ecff'], book: ['#a0302a', '#2f6b3a', '#5a2f8a', '#2f4f8a'], wisp: ['#7fd8ff', '#9dffb8', '#c79cff'], witchhat: ['#8a4fc2', '#f28c28', '#3f8f5a'], goblin: ['#6fae4a', '#8ab84a', '#5a9a6a'] },
  cutter: { spear: ['#8f877a', '#9a958c', '#7f8288'], trident: ['#8f877a', '#7f8288'], blade: ['#9a958c', '#8f8476'], club: ['#8f877a', '#7f8288'] },
  compass: { fire: ['orange', 'blue', 'green', 'purple'], chain: ['#9aa0a8', '#8a6a3a'] },
  glue: { dragon: ['#5f8f6a', '#8a8378', '#a0503c'], gargoyle: ['#8a8378', '#6f6a62'], cannon: ['#3a3f47', '#5a4a3a'], goblin: ['#6fae4a', '#8ab84a'] },
  clips: { daggers: ['#8a5a32', '#4a4f58', '#7a2a24'], arrows: ['#c0392b', '#2f6fd1', '#f2c84b'], keys: ['#e0b84a', '#9aa0a8'] },
  starfish: { saw: ['#c9ced6', '#b08a6a'], wheel: ['#8a5a32', '#6b4a2a'], eyeball: ['#4ab8ff', '#5fd16a', '#c0392b'], goblinshield: ['#8a5a32', '#7a2a24'] },
  scissors: { swords: ['#e0b84a', '#9aa0a8', '#c0392b'], spears: ['#8a5a32', '#5a3a22'], staves: ['#b77cf0', '#4ab8ff', '#ff5a5a'] },
  zap: { rune: ['#b77cf0', '#4fe0a0', '#4ab8ff'], crystal: ['#ff5a7a', '#4ab8ff', '#4fe0a0'] },
  paw: { skeleton: ['#efe6d0', '#e0d6bc'], tentacle: ['#8a4fc2', '#3f8f5a', '#c0507a'], vine: ['#3f7a3a', '#5a7a2a'], scythe: ['#5a3a22', '#3a2a1a'] },
  mine: { curse: ['#b77cf0', '#ff5a7a', '#4fe0a0'], mushroom: ['#4fe0a0', '#ff7ad0', '#ffb347'] },
  fan: { draft: ['#cdebff'], steam: ['#fff3e0'] },
  band: { web: ['#f5f5ff'], slime: ['#5fd16a', '#b77cf0'] }
};
function dungeonPool(d, y) {
  const pool = [['ledges', 3], ['spikeballs', 2], ['plank', 1 + 1.5 * d], ['rock', 1.4], ['skull', 1 + d]];
  if (d > 0.05) pool.push(['web', 1.2]);
  if (d > 0.06) pool.push(['ghosts', 1.3]);
  if (d > 0.08) pool.push(['saw', 1.2], ['daggers', 1.3]);
  if (d > 0.12) pool.push(['swords', 0.6 + 1.6 * d]);
  if (d > 0.12 && windAllowed(y)) pool.push(['draft', 1.1]);
  if (d > 0.18) pool.push(['curse', 1.2]);
  if (d > 0.2) pool.push(['runebeam', 1.2], ['skelarm', 1.3]);
  if (d > 0.18) pool.push(['flamethrower', 1.2]);
  if (d > 0.1) pool.push(['rings', 3]);            // weight 3 since v87; regular Rising Projectile looks once all 9 rings have appeared
  if (d > 0.1) pool.push(['dragon', 1.2]);
  if (d > 0.15) pool.push(['spear', 1.3]);
  if (d > 0.22) pool.push(['crusher', 1.4]);
  if (d > 0.3) pool.push(['firebar', 1.3]);
  return pool;
}
// Neon City obstacles (v113): every one reuses a Paper or Ocean obstacle's movement and collision with city art (draw-city.js)
const CITY_MAKERS = { signs: 'gate', shutters: 'erasers', cones: 'blots', bulge: 'protractor', tram: 'pencil', cans: 'wad',
                      drones: 'notes', taxis: 'clips', fanspin: 'starfish', rotors: 'scissors', crane: 'compass', ladder: 'cutter',
                      camera: 'glue', laser: 'zap', barrier: 'paw', transformer: 'mine', vent: 'fan', holo: 'bubbles', cable: 'band' };
// Neon signs collection: big round neon signs (Wall Bulge), each at most once per run; once all 8 have appeared,
// a sign spawn becomes a regular Wall Bulge (dish, AC unit or clock)
const NEON_SIGNS = ['ramen', 'cat', 'cassette', 'bolt', 'heart', 'note', 'coffee', 'palm'];
const neonLeft = () => NEON_SIGNS.filter(n => !runCollected.has('neon-' + n));
make.neon = (y, d) => {
  const left = neonLeft();
  if (!left.length) return make.protractor(y, d);
  const name = left[ri(0, left.length - 1)], r = rand(80, 100);
  runCollected.add('neon-' + name);
  obstacles.push({ type: 'protractor', neonSign: name, y, side: Math.random() < 0.5 ? -1 : 1, r });
  return r > 90 ? 70 : 40;
};
// each Neon City mechanic has two or three looks sharing its hit box, each in a few neon colours; a row shares one
const CITY_LOOKS = {
  gate: { sign: ['#ff4fd8', '#3ff0ff', '#b6ff3f', '#ffb03f'], balcony: ['#ffd36a', '#7fe8ff'] },
  erasers: { shutter: ['#8a93a8', '#a08a7a'], door: ['#ff4f6a', '#3fb0ff', '#ffb03f'] },
  blot: { cone: ['#ff7a1f', '#ff4fd8'], manhole: ['#3ff0ff', '#ff4fd8', '#b6ff3f'], vending: ['#ff3f5a', '#3f8fff', '#3fd17a'] },
  protractor: { dish: ['#c9cfdb', '#e6e0d0'], acunit: ['#9aa3b5', '#b8b0a0'], clock: ['#f4f1ea'] },
  pencil: { tram: ['#ff4fd8', '#3ff0ff', '#ffb03f'], tube: ['#ff4fd8', '#3ff0ff', '#b6ff3f', '#ff3f5a'] },
  wad: { can: ['#ff3f5a', '#3f8fff', '#b6ff3f', '#ff4fd8'], token: ['#ffd23f', '#c9cfdb'], ball: ['#ff4fd8', '#3ff0ff', '#b6ff3f'] },
  note: { drone: ['#3ff0ff', '#ff4fd8', '#b6ff3f'], lantern: ['#ff3f3f', '#ffb03f', '#ff4fd8'], umbrella: ['#ff4fd8', '#3ff0ff', '#ffd23f', '#9a7cff'] },
  clips: { taxi: ['#ffd23f', '#ff4fd8', '#3ff0ff'], pod: ['#e6ecf5', '#b6ff3f', '#ffb03f'] },
  starfish: { fan: ['#9aa3b5', '#7fe8ff'], hubcap: ['#3ff0ff', '#ff4fd8', '#b6ff3f'], record: ['#ff3f5a', '#ffd23f', '#3ff0ff'] },
  scissors: { rotor: ['#3ff0ff', '#ff4fd8', '#ffb03f'], neon: ['#ff4fd8', '#3ff0ff', '#b6ff3f'] },
  compass: { crane: ['#ffc21f', '#ff7a1f'], lamp: ['#c9cfdb', '#7f8aa0'] },
  cutter: { ladder: ['#8a93a8', '#a06a4a'], arrow: ['#ff4fd8', '#3ff0ff', '#b6ff3f'], antenna: ['#c9cfdb'] },
  glue: { camera: ['#ff3f5a', '#3ff0ff'], dumpling: ['#c8a46a'], spray: ['#ff4fd8', '#3ff0ff', '#b6ff3f', '#ffb03f'] },
  zap: { laser: ['#ff3f5a', '#3fff8a'], arc: ['#3ff0ff', '#ff4fd8', '#b6ff3f'] },
  paw: { barrier: ['#ff3f3f', '#ffc21f'], robot: ['#c9cfdb', '#ffb03f'] },
  mine: { transformer: ['#3ff0ff', '#b6ff3f'], hydrant: ['#ff3f3f', '#ffc21f', '#3f8fff'] },
  fan: { steam: ['#fff3e0'], ac: ['#cdebff'] },
  bubbles: { holo: ['#3ff0ff', '#ff4fd8'] },
  band: { cable: ['#2b2b3a'], lights: ['#ffd36a'] }
};
function cityPool(d, y) {
  const pool = [['signs', 3], ['cones', 2], ['tram', 1 + 1.5 * d], ['bulge', 1.1], ['neon', 1.3], ['cans', 1 + d], ['holo', 1]];
  if (d > 0.05) pool.push(['cable', 1.2]);
  if (d > 0.06) pool.push(['drones', 1.3]);
  if (d > 0.08) pool.push(['fanspin', 1.2], ['taxis', 1.3]);
  if (d > 0.1) pool.push(['camera', 1.2]);
  if (d > 0.12) pool.push(['rotors', 0.6 + 1.6 * d]);
  if (d > 0.12 && windAllowed(y)) pool.push(['vent', 1.1]);
  if (d > 0.15) pool.push(['ladder', 1.3]);
  if (d > 0.18) pool.push(['transformer', 1.2]);
  if (d > 0.2) pool.push(['laser', 1.2], ['barrier', 1.3]);
  if (d > 0.22) pool.push(['shutters', 1.4]);
  if (d > 0.3) pool.push(['crane', 1.3]);
  return pool;
}
// Forest obstacles (v114): every one reuses a Paper or Ocean obstacle's movement and collision with forest art (draw-forest.js)
const FOREST_MAKERS = { branches: 'gate', logs: 'erasers', nests: 'blots', trunk: 'protractor', twig: 'pencil', acorns: 'wad',
                        bees: 'notes', ducks: 'clips', husk: 'starfish', maple: 'scissors', swing: 'compass', snake: 'cutter',
                        squirrel: 'glue', sunbeam: 'zap', bear: 'paw', puffball: 'mine', breeze: 'fan', updraft: 'bubbles', vines: 'band' };
// the forest falls through the seasons: spring, summer (150 m), autumn (400 m), winter (800 m), then night (1,500 m)
const forestSeason = y => { const m = y / PX_PER_M; return m < 150 ? 0 : m < 400 ? 1 : m < 800 ? 2 : m < 1500 ? 3 : 4; };
// Forest birds collection: Drifting Swarm variants, each at most once per run
const FOREST_BIRDS = ['robin', 'bluejay', 'kingfisher', 'cardinal', 'hummingbird', 'goldfinch', 'snowyowl', 'magpie'];
const birdsLeft = () => FOREST_BIRDS.filter(n => !runCollected.has('bird-' + n));
// each Forest mechanic has one to four looks sharing its hit box; some only appear in certain seasons (FOREST_SEASONS)
const FOREST_LOOKS = {
  gate: { branch: ['#7a5030', '#6b4a2a'], log: ['#8a5a32', '#9a6a3a'] },
  erasers: { loghalf: ['#8a5a32', '#7a5030'], dam: ['#6b4a2a'] },
  blot: { hornets: ['#c9b48a', '#b8a07a'], pinecone: ['#8a5a32', '#6b4a2a'], thistle: ['#9a6ac8', '#c070c0'] },
  protractor: { trunk: ['#7a5030', '#6b5a48'], birch: ['#ece6da'], fungus: ['#d08a3a', '#c8a060'] },
  pencil: { stick: ['#7a5030', '#8a5a32'], frost: ['#6b5a50'] },
  wad: { acorn: ['#a0703a'], chestnut: ['#7a4a2a'], apple: ['#e0403a', '#8ac040'], snowball: ['#f4f8fc'] },
  note: { bee: ['#ffc21f'], owl: ['#a0805a', '#8a8a8a'], bat: ['#4a3a5a'] },
  clips: { duck: ['#3f8a4a', '#c08a4a'], goose: ['#8a8a8a'] },
  starfish: { husk: ['#8ab040'], seed: ['#c8a46a'], snowflake: ['#e8f4ff'] },
  scissors: { maple: ['#c8904a', '#e06a3a', '#9ab040'] },
  compass: { branch: ['#7a5030'], rope: ['#c9a66b'] },
  cutter: { snake: ['#5f9a3a', '#a08a3a'], woodpecker: ['#d9343a'] },
  glue: { squirrel: ['#c0703a', '#8a7a6a'], frog: ['#5fae4a', '#8ab040'] },
  zap: { sunbeam: ['#ffe58a'], frost: ['#bfe8ff'] },
  paw: { bear: ['#6b4a2a', '#3a3a3a'], fallbranch: ['#7a5030'] },
  mine: { puffball: ['#e8dcc0'], wasps: ['#e0b040'] },
  fan: { breeze: ['#ffffff'] },
  bubbles: { updraft: ['#ffffff'] },
  band: { web: ['#f5f5ff'], vine: ['#4f8a3a'] }
};
// looks tied to the seasons they belong to (0 spring, 1 summer, 2 autumn, 3 winter, 4 night); the rest appear all year
const FOREST_SEASONS = { snowball: [3, 4], frost: [3, 4], snowflake: [3, 4], bee: [0, 1, 2], bat: [4], sunbeam: [0, 1, 2], apple: [1, 2] };
function forestPool(d, y) {
  const pool = [['branches', 3], ['nests', 2], ['twig', 1 + 1.5 * d], ['trunk', 1.4], ['acorns', 1 + d], ['updraft', 1]];
  if (d > 0.05) pool.push(['vines', 1.2]);
  if (d > 0.06) pool.push(['bees', 1.4]);
  if (d > 0.08) pool.push(['husk', 1.2], ['ducks', 1.3]);
  if (d > 0.1) pool.push(['squirrel', 1.2]);
  if (d > 0.12) pool.push(['maple', 0.6 + 1.6 * d]);
  if (d > 0.12 && windAllowed(y)) pool.push(['breeze', 1.1]);
  if (d > 0.15) pool.push(['snake', 1.3]);
  if (d > 0.18) pool.push(['puffball', 1.2]);
  if (d > 0.2) pool.push(['sunbeam', 1.2], ['bear', 1.3]);
  if (d > 0.22) pool.push(['logs', 1.4]);
  if (d > 0.3) pool.push(['swing', 1.3]);
  return pool;
}
// Desert obstacles (v120): every one reuses a Paper or Ocean obstacle's movement and collision with desert art (draw-desert.js)
const DESERT_MAKERS = { sandLedges: 'gate', slabs: 'erasers', cacti: 'blots', outcrop: 'protractor', carpet: 'pencil', coconuts: 'wad',
                        vultures: 'notes', caravan: 'clips', tumbleweed: 'starfish', fronds: 'scissors', wellLever: 'compass',
                        tongue: 'cutter', spitter: 'glue', glint: 'zap', scorpion: 'paw', cactusPod: 'mine', sandstorm: 'fan',
                        heat: 'bubbles', rope: 'band' };
// the desert falls through the rock layers: dunes, canyon (150 m), oasis seep (400 m), fossil beds (800 m), then amber (1,500 m)
const desertLayer = y => { const m = y / PX_PER_M; return m < 150 ? 0 : m < 400 ? 1 : m < 800 ? 2 : m < 1500 ? 3 : 4; };
// Fossils collection: Static Hazards variants (fossil stones among the cacti), each at most once per run
const FOSSILS = ['trilobite', 'ammonite', 'fern', 'fish', 'sharktooth', 'raptorclaw', 'dinoskull', 'amberleaf'];
const fossilsLeft = () => FOSSILS.filter(n => !runCollected.has('fossil-' + n));
// each Desert mechanic has one to three looks sharing its hit box; some only appear in certain layers (DESERT_LAYERS)
const DESERT_LOOKS = {
  gate: { sandstone: ['#e0a060', '#d08a4a', '#c8b080'], adobe: ['#c88a5a', '#d8a070'] },
  erasers: { slab: ['#d08a4a', '#c07840'], mesa: ['#b86a3a'] },
  blot: { barrel: ['#5f9a4a', '#6aa85a'], pear: ['#7ab05a'], boulder: ['#b8a080', '#a08870'] },
  protractor: { outcrop: ['#d08a4a', '#c07a40'], termite: ['#b88a5a'], dune: ['#f0d08a', '#e8c070'] },
  pencil: { carpet: ['#c0303a', '#2f6fd1', '#8a4fc2'], driftwood: ['#c8b090'] },
  wad: { coconut: ['#7a5030'], gourd: ['#e0b040', '#9ab040'], beetleball: ['#8a6a4a'] },
  note: { vulture: ['#4a3a3a'], locust: ['#9ab040', '#c8a040'], hawk: ['#a0703a'] },
  clips: { camel: ['#c8a060', '#b08a50'] },
  starfish: { tumbleweed: ['#c8a46a', '#b08a50'], seedpod: ['#a07a40'] },
  scissors: { fronds: ['#5fa846', '#7ab05a'], windpump: ['#a0a8b0'] },
  compass: { lever: ['#8a5a32'], windvane: ['#a0a8b0'] },
  cutter: { tongue: ['#5fae4a', '#d8a030', '#3fa0a0'], column: ['#d08a4a'] },
  glue: { cactusgun: ['#5f9a4a'], camelspit: ['#c8a060'] },
  zap: { glint: ['#fff6c0'], geyser: ['#e8c890'] },
  paw: { scorpion: ['#c06a2a', '#3a3030'], pickaxe: ['#8a5a32'] },
  mine: { cactusfruit: ['#e0406a'], jar: ['#c87a4a'] },
  fan: { sandstorm: ['#f0dca0'] },
  bubbles: { heat: ['#ffb060'] },
  band: { rope: ['#c9a66b'] }
};
// looks tied to the layers they belong to (0 dunes, 1 canyon, 2 oasis, 3 fossil beds, 4 amber); the rest appear everywhere
const DESERT_LAYERS = { dune: [0, 1], adobe: [0, 1, 2], fronds: [1, 2], coconut: [1, 2, 3], column: [1, 2, 3, 4], camelspit: [0, 1, 2] };
function desertPool(d, y) {
  const pool = [['sandLedges', 3], ['cacti', 2], ['carpet', 1 + 1.5 * d], ['outcrop', 1.4], ['coconuts', 1 + d], ['heat', 1]];
  if (d > 0.05) pool.push(['rope', 1.2]);
  if (d > 0.06) pool.push(['vultures', 1.3]);
  if (d > 0.08) pool.push(['tumbleweed', 1.3], ['caravan', 1.3]);
  if (d > 0.1) pool.push(['spitter', 1.2]);
  if (d > 0.12) pool.push(['fronds', 0.6 + 1.6 * d]);
  if (d > 0.12 && windAllowed(y)) pool.push(['sandstorm', 1.1]);
  if (d > 0.15) pool.push(['tongue', 1.3]);
  if (d > 0.18) pool.push(['cactusPod', 1.2]);
  if (d > 0.2) pool.push(['glint', 1.2], ['scorpion', 1.3]);
  if (d > 0.22) pool.push(['slabs', 1.4]);
  if (d > 0.3) pool.push(['wellLever', 1.3]);
  return pool;
}
function seaPool(d, y) {
  const pool = [['coral', 3], ['urchins', 2], ['jellies', 1.4], ['starfish', 1.4], ['bubbles', 1]];
  if (d > 0.08) pool.push(['mine', 1.3]);
  if (d > 0.1) pool.push(['moray', 1.3]);
  if (d > 0.12 && windAllowed(y)) pool.push(['current', 1.1]);
  if (d > 0.15) pool.push(['clam', 1.3], ['sub', 1.2]);
  if (d > 0.2) pool.push(['zap', 1.2], ['kelp', 1.2]);
  return pool;
}

// a gold star, unless the last one is less than 50 m away (rows spawn top to bottom, so the last is the nearest)
function addStar(x, y) {
  if (Math.abs(y - lastStarY) < STAR_GAP) return;
  lastStarY = y;
  pickups.push({ x, y, r: 10, spin: rand(0, 6) });
}

// a power-up every so often: never one the plane already has at the top level, and never the same kind as the
// last one (v115); when the last kind is the only one left, the row gets no power-up
function pickPower(y) {
  if (y < 30 * PX_PER_M || y - lastPowerY < POWER_GAP || Math.random() > 0.3) return null;
  const options = [];
  if (plane.magnet < POWER_MAX) options.push('magnet');
  if (plane.lives < POWER_MAX) options.push('shield');
  if (plane.slowmo <= 0 && y / PX_PER_M >= SLOWMO_FROM_M) options.push('slowmo');
  if (plane.star <= 0 && y / PX_PER_M >= STAR_FROM_M && Math.random() < 0.5) options.push('superstar');   // the rarest
  if (plane.boost <= 0 && y / PX_PER_M >= BOOST_FROM_M) options.push('boost');
  if (plane.ink <= 0 && y / PX_PER_M >= INK_FROM_M) options.push('squid');   // a debuff, offered like the others
  const fresh = options.filter(k => k !== lastPowerKind);
  if (!fresh.length) return null;
  lastPowerY = y;
  return lastPowerKind = fresh[ri(0, fresh.length - 1)];
}

function spawnRow(y, d) {
  if (mapId === 'sea') return spawnFromPool(y, d, seaPool(d, y));
  if (mapId === 'space') return spawnFromPool(y, d, spacePool(d));
  if (mapId === 'dungeon') return spawnFromPool(y, d, dungeonPool(d, y));
  if (mapId === 'city') return spawnFromPool(y, d, cityPool(d, y));
  if (mapId === 'forest') return spawnFromPool(y, d, forestPool(d, y));
  if (mapId === 'desert') return spawnFromPool(y, d, desertPool(d, y));
  const pool = [['gate', 3], ['blots', 2], ['pencil', 1 + 2 * d], ['protractor', 1.4], ['wad', 1 + d]];
  if (d > 0.08) pool.push(['clips', 1.4]);
  if (d > 0.12) pool.push(['scissors', 0.6 + 1.6 * d]);
  if (d > 0.18 && windAllowed(y)) pool.push(['fan', 1.1]);
  if (d > 0.22) pool.push(['erasers', 1.4]);
  if (d > 0.3) pool.push(['compass', 1.3]);
  if (d > 0.1) pool.push(['glue', 1.2]);
  if (d > 0.15) pool.push(['cutter', 1.3]);
  if (d > 0.06) pool.push(['notes', 1.2]);
  if (d > 0.05) pool.push(['band', 1.2]);
  if (d > 0.08) pool.push(['setsquare', 1.2]);
  if (d > 0.2) pool.push(['paw', 1.3]);
  return spawnFromPool(y, d, pool);
}

function spawnFromPool(y, d, pool) {
  const choices = pool.filter(p => p[0] !== lastType);   // never the same obstacle twice in a row
  let r = Math.random() * choices.reduce((s, p) => s + p[1], 0), type = choices[0][0];
  for (const [t, w] of choices) { if ((r -= w) < 0) { type = t; break; } }
  lastType = type;
  const before = obstacles.length;
  const extra = make[SEA_MAKERS[type] || SPACE_MAKERS[type] || DUNGEON_MAKERS[type] || CITY_MAKERS[type] || FOREST_MAKERS[type] || DESERT_MAKERS[type] || type](y, d) || 0;
  const rowPal = {}, rowSea = {};    // obstacles of the same kind in one row share a colour
  for (let i = before; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (!o.pal) o.pal = rowPal[o.type] || (rowPal[o.type] = pickPal(o.type));
    if (mapId === 'sea') {
      o.sea = true;
      const cols = SEA_COLS[o.type];
      if (cols) o.seaCol = rowSea[o.type] || (rowSea[o.type] = cols[ri(0, cols.length - 1)]);
      if (o.type === 'blot') {
        const left = shellsLeft();
        if (left.length && Math.random() < 0.4) { o.shell = left[ri(0, left.length - 1)]; runCollected.add('shell-' + o.shell); }
      }
      if (o.type === 'starfish') {               // a legendary fish not yet seen this run (each once per run)
        const left = fishLeft();
        if (left.length && Math.random() < 0.5) { o.fish = left[ri(0, left.length - 1)]; runCollected.add('fish-' + o.fish); }
      }
    } else if (mapId === 'space') {
      o.space = true;
      o.look = o.look || type;                   // which space obstacle this is (several share a mechanic)
      const cols = SPACE_COLS[o.type];
      if (cols) o.spaceCol = rowSea[o.type] || (rowSea[o.type] = cols[ri(0, cols.length - 1)]);
      if (o.look === 'station') o.r = rand(95, 110);
    } else if (mapId === 'notebook' && o.type === 'note') {
      const left = origamiLeft();
      if (left.length && Math.random() < 0.5) { o.origami = left[ri(0, left.length - 1)]; runCollected.add('origami-' + o.origami); }
    } else if (mapId === 'dungeon') {
      o.dungeon = true;
      const looks = DUNGEON_LOOKS[o.type], solo = DUNGEON_SOLO[type];
      if (type === 'rings') {
        const left = ringsLeft();
        if (left.length) { o.look = 'ring'; o.dunCol = left[ri(0, left.length - 1)]; runCollected.add('ring-' + o.dunCol); continue; }
        const names = Object.keys(DUNGEON_LOOKS.wad);     // all 9 seen: a regular Rising Projectile instead
        o.look = names[ri(0, names.length - 1)]; o.dunCol = DUNGEON_LOOKS.wad[o.look][ri(0, DUNGEON_LOOKS.wad[o.look].length - 1)];
        continue;
      }
      if (solo && !rowSea[o.type]) rowSea[o.type] = [solo.look, solo.cols[ri(0, solo.cols.length - 1)]];
      if (looks && !rowSea[o.type]) {
        const names = Object.keys(looks).filter(l => !runCollected.has(COLLECTIBLE_LOOKS[l])), look = names[ri(0, names.length - 1)], cols = looks[look];
        if (COLLECTIBLE_LOOKS[look]) runCollected.add(COLLECTIBLE_LOOKS[look]);
        rowSea[o.type] = [look, cols[ri(0, cols.length - 1)]];
      }
      if (looks) [o.look, o.dunCol] = rowSea[o.type];
      if (o.look === 'crescent') o.headR = CRESCENT_HEAD;   // its big crescent head reaches past the 13-unit slider bar
      if (o.type === 'compass') o.hh = 7;        // the fire bar's flames are thicker than a compass leg
      if (o.type === 'scissors') {               // a pair of legendary swords not yet seen this run (each once per run)
        const left = swordsLeft();
        if (left.length && Math.random() < 0.7) { o.sword = left[ri(0, left.length - 1)]; runCollected.add('sword-' + o.sword); }
      }
    } else if (mapId === 'city') {
      o.city = true;
      if (o.neonSign) continue;                  // a collectible neon sign has its own art
      const looks = CITY_LOOKS[o.type];
      if (looks && !rowSea[o.type]) {
        const names = Object.keys(looks), look = names[ri(0, names.length - 1)], cols = looks[look];
        rowSea[o.type] = [look, cols[ri(0, cols.length - 1)]];
      }
      if (looks) [o.look, o.cityCol] = rowSea[o.type];
      if (o.type === 'compass') o.hh = 5;        // the crane boom is a little thicker than a compass leg
    } else if (mapId === 'forest') {
      o.forest = true;
      o.season = forestSeason(o.y);
      const looks = FOREST_LOOKS[o.type];
      if (looks && !rowSea[o.type]) {
        const all = Object.keys(looks), fit = all.filter(l => !FOREST_SEASONS[l] || FOREST_SEASONS[l].includes(o.season));
        const names = fit.length ? fit : all, look = names[ri(0, names.length - 1)], cols = looks[look];
        rowSea[o.type] = [look, cols[ri(0, cols.length - 1)]];
      }
      if (looks) [o.look, o.forCol] = rowSea[o.type];
      if (o.type === 'compass') o.hh = 5;        // a leafy branch is a little thicker than a compass leg
      if (o.type === 'note') {                   // a forest bird not yet seen this run (each once per run)
        const left = birdsLeft();
        if (left.length && Math.random() < 0.5) { o.bird = left[ri(0, left.length - 1)]; runCollected.add('bird-' + o.bird); }
      }
    } else if (mapId === 'desert') {
      o.desert = true;
      o.layer = desertLayer(o.y);
      const looks = DESERT_LOOKS[o.type];
      if (looks && !rowSea[o.type]) {
        const all = Object.keys(looks), fit = all.filter(l => !DESERT_LAYERS[l] || DESERT_LAYERS[l].includes(o.layer));
        const names = fit.length ? fit : all, look = names[ri(0, names.length - 1)], cols = looks[look];
        rowSea[o.type] = [look, cols[ri(0, cols.length - 1)]];
      }
      if (looks) [o.look, o.desCol] = rowSea[o.type];
      if (o.type === 'compass') o.hh = 5;        // the well lever is a little thicker than a compass leg
      if (o.type === 'blot') {                   // a fossil stone not yet seen this run (each once per run)
        const left = fossilsLeft();
        if (left.length && Math.random() < 0.4) { o.fossil = left[ri(0, left.length - 1)]; runCollected.add('fossil-' + o.fossil); }
      }
    }
  }
  if (!['gate', 'coral', 'girders', 'protractor', 'moon', 'planet', 'station', 'ledges', 'rock', 'signs', 'bulge', 'neon', 'branches', 'trunk', 'sandLedges', 'outcrop'].includes(type)) {
    const py = y + extra + rand(95, 125), power = pickPower(py);
    if (power) pickups.push({ kind: power, x: rand(50, W - 50), y: py, r: 15, spin: rand(0, 6) });
    else if (Math.random() < 0.28) addStar(rand(40, W - 40), py);
  }
  return extra;
}

function spawnRows() {
  const d = difficulty();
  while (nextRowY < dist + H + 80) {
    const extra = spawnRow(nextRowY, d);
    nextRowY += lerp(300, 185, d) + rand(0, 70) + extra;
  }
}
