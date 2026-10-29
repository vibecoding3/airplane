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
    const blast = lerp(58, 72, d), put = (x, dy) => obstacles.push({ type: 'mine', y: y + dy, x, phase: 'idle', t: 0, blast });
    if (!(d > 0.45 && Math.random() < 0.5)) { put(rand(50, W - 50), 0); return 40; }
    // a pair comes in one of five layouts (v182; until then always the first). Two blast circles cover at most about 290 of
    // the 400 units, so there is always a way past
    const left = () => rand(45, W * 0.45), right = () => rand(W * 0.55, W - 45);
    switch (ri(0, 4)) {
      case 0: put(left(), 0); put(right(), 90); return 100;               // left, then right lower down
      case 1: put(right(), 0); put(left(), 90); return 100;               // right, then left lower down
      case 2: put(rand(45, W * 0.35), 0); put(rand(W * 0.65, W - 45), 0); return 40;   // side by side, the middle open
      case 3: { const x = Math.random() < 0.5 ? rand(45, W * 0.3) : rand(W * 0.7, W - 45);   // one above the other on one side
        put(x, 0); put(clamp(x + rand(-25, 25), 45, W - 45), 120); return 130; }
      default: { const x = rand(W * 0.35, W * 0.65); put(x, 0); put(x < W / 2 ? rand(W * 0.65, W - 45) : rand(45, W * 0.35), 150); return 160; }   // centre, then a far side
    }
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

// which obstacles can appear; since v125 every obstacle can appear at any depth (wind stops at 700 m, conveyors at
// 1,500 m) and since v127 they all have the same weight, so each is equally likely on its map
let lastType = '';
// the last few obstacle types, oldest first: a type can't come back within REPEAT_GAP rows (v165; until then only the
// row right before was blocked). Setting lastType to '' (a new run, a test) clears it on the next spawn.
const REPEAT_GAP = 3;
let recentTypes = [];
// Ocean obstacles. Most reuse a notebook obstacle's movement and collision with an underwater look
// (the generator named on the right); mines, electric eels, bubble columns and starfish are their own.
const SEA_MAKERS = { coral: 'gate', urchins: 'blots', jellies: 'notes', clam: 'erasers', moray: 'cutter',
                     kelp: 'paw', sub: 'glue', current: 'fan',
                     school: 'clips', puffer: 'wad', bigRock: 'protractor', swordfish: 'pencil', fishline: 'band',
                     anchor: 'compass', crab: 'scissors' };   // the seven added in v124
// Each Ocean mechanic has a few looks sharing its hit box (v124), each with its colours; the first one is the original
// look (art in draw-sea.js), the others are drawn in draw-ocean.js. A row of the same obstacle shares one look and colour.
const SEA_LOOKS = {
  gate: { coral: ['#f08a7e', '#f4a259', '#b07cc6', '#e9c46a', '#7fc8a9'], rockledge: ['#6b7a85', '#7a7068'], wreck: ['#8a6a4a', '#6f5236'], glasssponge: ['#cfe8f0'] },
  blot: { urchin: ['#3b2a52', '#1f3b4d', '#5a1f3a', '#2d2d2d'], anemone: ['#ff7a9a', '#ffa04a', '#b77cf0'], stonefish: ['#8a7a6a', '#7f6f5a'], glowurchin: ['#7fe8ff', '#b8ffcf', '#ff9ad8'] },
  note: { jelly: ['rgba(240,140,200,.85)', 'rgba(170,140,240,.85)', 'rgba(120,190,240,.85)', 'rgba(250,170,110,.85)'],
          combjelly: ['rgba(215,235,255,.75)'], anglerfish: ['#4a3a58', '#3a4a5a'], diver: ['#8a9a7a', '#9a8a6a'], helmetjelly: ['#c0392b'] },
  erasers: { clam: ['#e9d3c4', '#f2c6c2', '#d8c8e8', '#cfe3d0'], wreckhull: ['#7a5a3a', '#6a4e36'], gulper: ['#6a5a88'], giantoyster: ['#a8a090', '#9a9488'] },
  cutter: { moray: ['#5f7f3a', '#6b8e23', '#4a6b3a'], mantis: ['#3fb07a', '#e05a8a', '#3a9ad8'], viperfish: ['#6a8098'], harpoon: ['#a8743e'] },
  paw: { kelp: ['#3f8f4f', '#2f7a5a', '#5a9a3a'], octopus: ['#d9534a', '#b05ac0', '#e08a3a'], kraken: ['#8a2a4a', '#6a2a6a'], wreckboom: ['#8a6a4a'] },
  glue: { sub: ['#e0a21a', '#7f8fa1', '#c0392b', '#3a66c4'], shrimp: ['#ff7a5a', '#f0a040'], cannon: ['#4a4a52'], glowshrimp: ['#b03a4a'], riflediver: ['#7a8a6a', '#6a7a8a'] },
  starfish: { starfish: ['#f28c28', '#e0503a', '#c75b9b', '#f2c84b', '#8a4fc2'], brittlestar: ['#c75b9b', '#e0503a', '#8a4fc2'], wheel: ['#8a5a32'], ammonite: ['#d8b890', '#c8a0a0'] },
  zap: { eel: [''], ray: ['#c9a868', '#8a9aa8'], lure: ['#4a3a58'], searchlight: ['#c8a050'], wire: ['#b87333'] },
  mine: { navalmine: [''], barrel: ['#5a6a4a', '#7a4a3a'], glowpuff: ['#9fffd0', '#9fd8ff'], powderkeg: ['#8a5a32'] },
  bubbles: { bubbles: [''], vent: [''], airleak: [''] },
  fan: { current: [''], drift: [''], maelstrom: [''] },
  clips: { sardines: ['#b8ccd8'], butterfly: ['#f4c430', '#f08a3a'], mackerel: ['#3a6a9a'] },
  wad: { puffer: ['#e8c860', '#d8a860'], turtle: ['#6a9a5a', '#7a8a4a'], glowbell: ['#c89aff', '#9fd8ff', '#ff9ad8'], boxfish: ['#f4c430'] },
  protractor: { braincoral: ['#e8a0b0', '#d8c070', '#b0d090'], rock: ['#6b7a85', '#7a7068'], whale: ['#5a6f88', '#4a5a70'], wreckbow: ['#7a5a3a'] },
  pencil: { swordfish: ['#4a6a8a', '#5a7a9a'], driftwood: ['#a08a6a'], mast: ['#8a6a4a'], oarfish: ['#c8d4e0'], nautilus: ['#4a5260'] },
  band: { fishline: ['#e0403a', '#f4a020'], netline: ['#4fa88a', '#5a8ac8'], glowtentacle: ['#ff9ad8', '#9fd8ff'], lifering: ['#e0403a'] },
  compass: { anchor: ['#5a5f68'], tentacle: ['#c0392b', '#a04ab0'], grapple: ['#6a6a72'] },
  scissors: { crab: ['#e0503a', '#f08a3a'], lobster: ['#b02a2a', '#3a5aa8'], spidercrab: ['#e08a4a', '#d86a5a'], hermitcrab: ['#e07a4a'] }
};
// the sea gets darker as you sink, through its regions: the sunlit reef (0–200 m), the twilight zone (200–400 m), the
// sunken ruins (400–800 m), the dome city (800–1,500 m) and the abyss (1,500 m +). Which looks live in which region is
// in MAP_REGIONS.sea (js/regions.js, since v170; SEA_LAYERS and SEA_CITY here before). o.layer is the region's index.
const seaLayer = y => regionIndexAt('sea', y);
// The sunken city (v133) takes over the dark and midnight layers: ruins and temples from 400 m, the glowing dome city from
// 800 m to 1,500 m (art in draw-sunken-city.js). Its looks only live there, and the sea's own looks only above and below it.
const SEA_CITY_LOOKS = {
  gate: { columns: ['#e8e0d0'], tubewalk: ['#9fe0ff'], carvedbeam: ['#d8d0c0'], girder: ['#c8a050'] },
  erasers: { templedoors: ['#c8b898'], hatch: ['#8aa0b8'], goldgate: ['#a89c88'], bulkhead: ['#8aa0b8'] },
  blot: { amphora: ['#d0784a', '#c89a5a'], orb: ['#7fe8ff', '#ffd07a'], idol: ['#c8c0b0'], gauge: ['#c8a050'] },
  protractor: { stoneface: ['#c8c0b0'], domehouse: ['#9fe0ff'], atlantis: ['#c8bfa8'], clocktower: ['#c8a050'] },   // Atlantis (v174, from Twenty Thousand Leagues)
  pencil: { oar: ['#c8a070'], tramcar: ['#ffc24a', '#7fd0ff'], beam: ['#d8d0c0'], minisub: ['#c8a050'] },
  wad: { lanternfloat: ['#ffb04a'], capsule: ['#c9ced6'], flask: ['#c8784a'], divebot: ['#c8a050'] },
  note: { lantern: ['#ff8a5a', '#ffd04a'], mailpod: ['#7fe8ff'], tablet: ['#d8d0c0'], bulb: ['#ffd07a'] },
  clips: { msgcapsules: ['#d8c090'], trampods: ['#ffc24a', '#7fd0ff'], scrolls: [''], bubblecars: ['#c8a050'] },
  starfish: { calendar: ['#c8c0b0'], coin: ['#f4c430'], gear: ['#c8a050'] },
  scissors: { millwheel: ['#a8805a'], fanprop: ['#c9ced6'], bronzeblades: ['#b8864a'], gearblades: ['#c8a050'] },
  compass: { clockhand: ['#2a2a30'], crane: ['#ffc24a'], bronzestaff: ['#b8864a'] },
  cutter: { trident: ['#e0c060'], gangplank: ['#a8805a'], serpent: ['#b8b0a0'], piston: ['#c8a050'] },
  glue: { fishfountain: ['#c8c0b0'], domecannon: ['#8aa0b8'], urnspout: ['#c89a5a'], steamspout: ['#c8a050'] },
  zap: { glyph: ['#7fffd0'], cable: ['#ffe060'], crystal: ['#7fe8c0'], tesla: ['#ffc24a'] },
  paw: { statuearm: ['#c8c0b0'], claw: ['#ffc24a'], stonetail: ['#c8c0b0'], robotarm: ['#c8a050'] },
  mine: { bubblemine: ['#9fe0ff'], valve: ['#e04a3a'], sealedjar: ['#c8784a'], boiler: ['#8aa0b8'] },
  fan: { pump: [''], conch: [''] },
  bubbles: { elevator: [''], templevent: [''], airvent: [''] },
  band: { mooring: ['#c9a66b'], glowcable: ['#7fe8ff'], goldchain: [''], pipeline: ['#c8a050'] }
};
// the city looks, drawn by draw-sunken-city.js
const SEA_CITY = new Set(Object.values(SEA_CITY_LOOKS).flatMap(Object.keys));
for (const [type, looks] of Object.entries(SEA_CITY_LOOKS)) Object.assign(SEA_LOOKS[type], looks);
// Sunken treasures collection (Ocean, v133): Static Hazards variants in the sunken city, each at most once per run
const TREASURES = ['crown', 'scepter', 'coin', 'chalice', 'necklace', 'compass', 'musicbox', 'crystalkey'];
const treasuresLeft = () => TREASURES.filter(n => !runCollected.has('treasure-' + n));
const MINERALS_LIST = ['iron', 'nickel', 'copper', 'gold', 'ice', 'amethyst'];   // asteroid minerals (art in draw-space.js)
// obstacles that push the plane with wind (desk fan, ocean current) stop appearing from this depth
const WIND_MAX_M = 700;
const windAllowed = y => y / PX_PER_M < WIND_MAX_M;
// Conveyors (paper clips, fish schools, satellite trains, daggers, taxis, ducks, caravans, rolling rocks) stop at this depth (v126)
const CONVEYOR_MAX_M = 1500;
const conveyorAllowed = y => y / PX_PER_M < CONVEYOR_MAX_M;

// Space obstacles: every one reuses a Paper or Ocean obstacle's movement and collision with space art
const SPACE_MAKERS = { girders: 'gate', asteroids: 'blots', ice: 'notes', airlock: 'erasers', probe: 'cutter',
                       gps: 'pencil', rocket: 'wad', starlink: 'clips', tumbler: 'starfish', arm: 'compass',
                       laser: 'zap', lowgrav: 'bubbles', moon: 'protractor',
                       fighter: 'glue', blade: 'paw', station: 'protractor',
                       tether: 'band', panels: 'scissors' };   // no wind or explosions in space; tether and panels since v129
// original alternative looks (v129), picked half the time for a row of these obstacles: a wormhole instead of the black hole,
// a hull turret instead of the fighter, a welding torch instead of the energy blade, an asteroid base instead of the battle station
const SPACE_ALT = { blackhole: 'wormhole', fighter: 'turret', blade: 'torch', station: 'asteroidbase' };
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
function spacePool(d, y) {
  const pool = [['girders', 1], ['asteroids', 1], ['ice', 1], ['tumbler', 1], ['lowgrav', 1], ['gps', 1]];
  pool.push(['planet', 1]);
  pool.push(['rocket', 1]);
  if (conveyorAllowed(y)) pool.push(['starlink', 1]);
  pool.push(['moon', 1], ['iss', 1]);
  pool.push(['airlock', 1], ['probe', 1], ['blackhole', 1]);
  pool.push(['laser', 1], ['fighter', 1]);
  pool.push(['blade', 1], ['station', 1]);
  pool.push(['arm', 1]);
  pool.push(['tether', 1], ['panels', 1]);
  return pool;
}
// Dungeon obstacles: ten in v68, eight more in v70; each on an existing mechanic with dungeon art (draw-dungeon.js)
const DUNGEON_MAKERS = { ledges: 'gate', crusher: 'erasers', spikeballs: 'blots', rock: 'protractor', plank: 'pencil',
                         skull: 'wad', ghosts: 'notes', spear: 'cutter', firebar: 'compass', dragon: 'glue',
                         daggers: 'clips', saw: 'starfish', swords: 'scissors', runebeam: 'zap', skelarm: 'paw',
                         curse: 'mine', draft: 'fan', web: 'band', flamethrower: 'cutter', rings: 'wad',
                         fountain: 'bubbles' };   // the fountain mist (Effect Zone) since v129
// obstacles that always have one look, with their own spawn chance (v81): a flamethrower is a Wall Piston whose flame shoots out
// Paper looks (v129): the first look of each obstacle is the original one (drawn by draw-paper.js with its palette); the
// others, and the three mechanics Paper got in v129 (a laser pointer or desk lamp beam, a popping highlighter cap or party
// popper, a breath of air), have their own colours. A row of the same obstacle shares one look.
const PAPER_LOOKS = {
  gate: { ruler: [null], pencilcase: ['#3a66c4', '#c0392b', '#2f8f5b'] },
  blot: { ink: [null], coffee: ['#8a5a32'] },
  pencil: { pencil: [null], pen: ['#2f6fd1', '#c0392b', '#2b2b2b'] },
  wad: { wad: [null], crumbs: ['#f2a7b8', '#e8d070'] },
  note: { note: [null], card: ['#ffffff'] },
  zap: { pointer: ['#ff3a3a'], lamp: ['#ffe58a'] },
  mine: { cap: ['#f4e04a', '#ff7ac0', '#7ae070'], popper: ['#e0503a', '#3a8ad8'] },
  bubbles: { breath: ['#cfe3f6'] }
};
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
// Dome inventions (Ocean, dome city, v173): Rising Projectile variants; Abyss lights (Ocean, the abyss, v173): Drifting
// Swarm variants. Each at most once per run, like every set (art in draw-sunken-city.js and draw-ocean.js)
const INVENTIONS = ['helmet', 'watch', 'spyglass', 'snowglobe', 'toysub', 'lantern', 'windupfish', 'gramophone'];
const inventionsLeft = () => INVENTIONS.filter(n => !runCollected.has('invention-' + n));
const ABYSS_LIGHTS = ['vampiresquid', 'barreleye', 'dumbo', 'seaangel', 'fireflysquid', 'glasssquid', 'seapig', 'isopod'];
const abyssLightsLeft = () => ABYSS_LIGHTS.filter(n => !runCollected.has('abysslight-' + n));
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
  bubbles: { mist: ['#9fe0ff', '#b8ffcf'] },                               // a magic fountain's mist (v129)
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
  const pool = [['ledges', 1], ['spikeballs', 1], ['plank', 1], ['rock', 1], ['skull', 1]];
  pool.push(['web', 1]);
  pool.push(['ghosts', 1]);
  pool.push(['saw', 1]);
  if (conveyorAllowed(y)) pool.push(['daggers', 1]);
  pool.push(['swords', 1]);
  if (windAllowed(y)) pool.push(['draft', 1]);
  pool.push(['curse', 1]);
  pool.push(['runebeam', 1], ['skelarm', 1]);
  pool.push(['flamethrower', 1]);
  pool.push(['rings', 1]);            // regular Rising Projectile looks once all 9 rings have appeared (weight 3 in v87–v126)
  pool.push(['dragon', 1]);
  pool.push(['spear', 1]);
  pool.push(['crusher', 1]);
  pool.push(['firebar', 1]);
  pool.push(['fountain', 1]);
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
  gate: { sign: ['#ff4fd8', '#3ff0ff', '#b6ff3f', '#ffb03f'], balcony: ['#ffd36a', '#7fe8ff'], pipes: ['#7a8aa0', '#a07a5a'], racks: ['#3ff0ff', '#3fff8a'] },
  erasers: { shutter: ['#8a93a8', '#a08a7a'], door: ['#ff4f6a', '#3fb0ff', '#ffb03f'], ticketgate: ['#3fff8a'] },
  blot: { cone: ['#ff7a1f', '#ff4fd8'], manhole: ['#3ff0ff', '#ff4fd8', '#b6ff3f'], vending: ['#ff3f5a', '#3f8fff', '#3fd17a'], holosign: ['#3ff0ff', '#ffb03f'] },
  protractor: { dish: ['#c9cfdb', '#e6e0d0'], acunit: ['#9aa3b5', '#b8b0a0'], clock: ['#f4f1ea'] },
  pencil: { tram: ['#ff4fd8', '#3ff0ff', '#ffb03f'], tube: ['#ff4fd8', '#3ff0ff', '#b6ff3f', '#ff3f5a'] },
  wad: { can: ['#ff3f5a', '#3f8fff', '#b6ff3f', '#ff4fd8'], token: ['#ffd23f', '#c9cfdb'], ball: ['#ff4fd8', '#3ff0ff', '#b6ff3f'] },
  note: { drone: ['#3ff0ff', '#ff4fd8', '#b6ff3f'], lantern: ['#ff3f3f', '#ffb03f', '#ff4fd8'], umbrella: ['#ff4fd8', '#3ff0ff', '#ffd23f', '#9a7cff'] },
  clips: { taxi: ['#ffd23f', '#ff4fd8', '#3ff0ff'], pod: ['#e6ecf5', '#b6ff3f', '#ffb03f'], datapackets: ['#3fff8a', '#3ff0ff'] },
  starfish: { fan: ['#9aa3b5', '#7fe8ff'], hubcap: ['#3ff0ff', '#ff4fd8', '#b6ff3f'], record: ['#ff3f5a', '#ffd23f', '#3ff0ff'] },
  scissors: { rotor: ['#3ff0ff', '#ff4fd8', '#ffb03f'], neon: ['#ff4fd8', '#3ff0ff', '#b6ff3f'] },
  compass: { crane: ['#ffc21f', '#ff7a1f'], lamp: ['#c9cfdb', '#7f8aa0'] },
  cutter: { ladder: ['#8a93a8', '#a06a4a'], arrow: ['#ff4fd8', '#3ff0ff', '#b6ff3f'], antenna: ['#c9cfdb'] },
  glue: { camera: ['#ff3f5a', '#3ff0ff'], dumpling: ['#c8a46a'], spray: ['#ff4fd8', '#3ff0ff', '#b6ff3f', '#ffb03f'], canmachine: ['#ff3f5a', '#3f8fff'] },
  zap: { laser: ['#ff3f5a', '#3fff8a'], arc: ['#3ff0ff', '#ff4fd8', '#b6ff3f'] },
  paw: { barrier: ['#ff3f3f', '#ffc21f'], robot: ['#c9cfdb', '#ffb03f'] },
  mine: { transformer: ['#3ff0ff', '#b6ff3f'], hydrant: ['#ff3f3f', '#ffc21f', '#3f8fff'] },
  fan: { steam: ['#fff3e0'], ac: ['#cdebff'] },
  bubbles: { holo: ['#3ff0ff', '#ff4fd8'] },
  band: { cable: ['#2b2b3a'], lights: ['#ffd36a'] }
};
// the city's layers (v129): rooftops (0–200 m), streets (200–400 m), the subway (400–800 m), the underground arcade
// (800–1,500 m), the data core (1,500 m +); looks listed here only appear in those layers, the rest anywhere
const cityLayer = y => { const m = y / PX_PER_M; return m < 200 ? 0 : m < 400 ? 1 : m < 800 ? 2 : m < 1500 ? 3 : 4; };
const CITY_LAYERS = { sign: [0, 1, 2, 3], balcony: [0, 1], pipes: [2], racks: [4], door: [2], ticketgate: [2, 3],
                      cone: [0, 1], manhole: [1], vending: [1, 2, 3], dish: [0], clock: [1, 2], tram: [0, 1, 2],
                      can: [1, 2, 3], token: [3], lantern: [1, 2, 3], umbrella: [0, 1], taxi: [0, 1], pod: [1, 2, 3],
                      datapackets: [4], hubcap: [1, 2], record: [3], crane: [0, 1], ladder: [0, 1], antenna: [0],
                      dumpling: [1], spray: [1, 2], canmachine: [1, 2, 3], barrier: [1, 2], hydrant: [1], steam: [1, 2], lights: [1, 3] };
function cityPool(d, y) {
  const pool = [['signs', 1], ['cones', 1], ['tram', 1], ['bulge', 1], ['neon', 1], ['cans', 1], ['holo', 1]];
  pool.push(['cable', 1]);
  pool.push(['drones', 1]);
  pool.push(['fanspin', 1]);
  if (conveyorAllowed(y)) pool.push(['taxis', 1]);
  pool.push(['camera', 1]);
  pool.push(['rotors', 1]);
  if (windAllowed(y)) pool.push(['vent', 1]);
  pool.push(['ladder', 1]);
  pool.push(['transformer', 1]);
  pool.push(['laser', 1], ['barrier', 1]);
  pool.push(['shutters', 1]);
  pool.push(['crane', 1]);
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
  erasers: { loghalf: ['#8a5a32', '#7a5030'], dam: ['#6b4a2a'], beavers: ['#8a5a32'] },
  blot: { hornets: ['#c9b48a', '#b8a07a'], pinecone: ['#8a5a32', '#6b4a2a'], thistle: ['#9a6ac8', '#c070c0'], mushrooms: ['#5ff0d0', '#9ad0ff'] },
  protractor: { trunk: ['#7a5030', '#6b5a48'], birch: ['#ece6da'], fungus: ['#d08a3a', '#c8a060'] },
  pencil: { stick: ['#7a5030', '#8a5a32'], frost: ['#6b5a50'] },
  wad: { acorn: ['#a0703a'], chestnut: ['#7a4a2a'], apple: ['#e0403a', '#8ac040'], snowball: ['#f4f8fc'] },
  note: { bee: ['#ffc21f'], owl: ['#a0805a', '#8a8a8a'], bat: ['#4a3a5a'], fireflies: ['#fff070'] },
  clips: { duck: ['#3f8a4a', '#c08a4a'], goose: ['#8a8a8a'] },
  starfish: { husk: ['#8ab040'], seed: ['#c8a46a'], snowflake: ['#e8f4ff'] },
  scissors: { maple: ['#c8904a', '#e06a3a', '#9ab040'] },
  compass: { branch: ['#7a5030'], rope: ['#c9a66b'], spider: ['#3a3040'] },
  cutter: { snake: ['#5f9a3a', '#a08a3a'], woodpecker: ['#d9343a'] },
  glue: { squirrel: ['#c0703a', '#8a7a6a'], frog: ['#5fae4a', '#8ab040'] },
  zap: { sunbeam: ['#ffe58a'], frost: ['#bfe8ff'], spring: ['#8ad0ff'], sap: ['#e8a030'] },
  paw: { bear: ['#6b4a2a', '#3a3a3a'], fallbranch: ['#7a5030'], owlswoop: ['#a0805a', '#8a8a8a'] },
  mine: { puffball: ['#e8dcc0'], wasps: ['#e0b040'] },
  fan: { breeze: ['#ffffff'] },
  bubbles: { updraft: ['#ffffff'] },
  band: { web: ['#f5f5ff'], vine: ['#4f8a3a'] }
};
// looks tied to the seasons they belong to (0 spring, 1 summer, 2 autumn, 3 winter, 4 night); the rest appear all year
const FOREST_SEASONS = { snowball: [3, 4], frost: [3, 4], snowflake: [3, 4], bee: [0, 1, 2], bat: [4], sunbeam: [0, 1, 2], apple: [1, 2],
                         spring: [0, 1, 2, 4], sap: [0, 1, 2], fireflies: [4], mushrooms: [4], owlswoop: [4] };   // added in v129
function forestPool(d, y) {
  const pool = [['branches', 1], ['nests', 1], ['twig', 1], ['trunk', 1], ['acorns', 1], ['updraft', 1]];
  pool.push(['vines', 1]);
  pool.push(['bees', 1]);
  pool.push(['husk', 1]);
  if (conveyorAllowed(y)) pool.push(['ducks', 1]);
  pool.push(['squirrel', 1]);
  pool.push(['maple', 1]);
  if (windAllowed(y)) pool.push(['breeze', 1]);
  pool.push(['snake', 1]);
  pool.push(['puffball', 1]);
  pool.push(['sunbeam', 1], ['bear', 1]);
  pool.push(['logs', 1]);
  pool.push(['swing', 1]);
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
  pencil: { carpet: ['#c0303a', '#2f6fd1', '#8a4fc2'], driftwood: ['#c8b090'], drybranch: ['#a08060'], bone: ['#ece2c8'] },
  wad: { coconut: ['#7a5030'], gourd: ['#e0b040', '#9ab040'], beetleball: ['#8a6a4a'], dates: ['#7a3a20'], amber: ['#e8a030'] },
  note: { vulture: ['#4a3a3a'], locust: ['#9ab040', '#c8a040'], hawk: ['#a0703a'] },
  clips: { camel: ['#c8a060', '#b08a50'] },
  starfish: { tumbleweed: ['#c8a46a', '#b08a50'], seedpod: ['#a07a40'] },
  scissors: { fronds: ['#5fa846', '#7ab05a'], windpump: ['#a0a8b0'] },
  compass: { lever: ['#8a5a32'], windvane: ['#a0a8b0'] },
  cutter: { tongue: ['#5fae4a', '#d8a030', '#3fa0a0'], column: ['#d08a4a'] },
  glue: { cactusgun: ['#5f9a4a'], camelspit: ['#c8a060'] },
  zap: { glint: ['#fff6c0'], geyser: ['#e8c890'] },
  paw: { scorpion: ['#c06a2a', '#3a3030'], pickaxe: ['#8a5a32'] },
  mine: { cactusfruit: ['#e0406a'], jar: ['#c87a4a'], geode: ['#9a8a7a'] },
  fan: { sandstorm: ['#f0dca0'] },
  bubbles: { heat: ['#ffb060'] },
  band: { rope: ['#c9a66b'] }
};
// looks tied to the layers they belong to (0 dunes, 1 canyon, 2 oasis, 3 fossil beds, 4 amber); the rest appear everywhere
const DESERT_LAYERS = { dune: [0, 1], adobe: [0, 1, 2], fronds: [1, 2], coconut: [1, 2, 3], column: [1, 2, 3, 4], camelspit: [0, 1, 2],
                       dates: [1, 2], bone: [3, 4], amber: [3, 4] };   // dates by the oasis palms, bones and amber in the deepest layers (v129)
function desertPool(d, y) {
  const pool = [['sandLedges', 1], ['cacti', 1], ['carpet', 1], ['outcrop', 1], ['coconuts', 1], ['heat', 1]];
  pool.push(['rope', 1]);
  pool.push(['vultures', 1]);
  pool.push(['tumbleweed', 1]);
  if (conveyorAllowed(y)) pool.push(['caravan', 1]);
  pool.push(['spitter', 1]);
  pool.push(['fronds', 1]);
  if (windAllowed(y)) pool.push(['sandstorm', 1]);
  pool.push(['tongue', 1]);
  pool.push(['cactusPod', 1]);
  pool.push(['glint', 1], ['scorpion', 1]);
  pool.push(['slabs', 1]);
  pool.push(['wellLever', 1]);
  return pool;
}
// Volcano obstacles (v121): every one reuses a Paper or Ocean obstacle's movement and collision with volcano art (draw-volcano.js)
const VOLCANO_MAKERS = { basaltLedges: 'gate', plates: 'erasers', bombs: 'blots', dome: 'protractor', raft: 'pencil', lavaBombs: 'wad',
                         moths: 'notes', rollers: 'clips', spindle: 'starfish', shards: 'scissors', steamArm: 'compass',
                         lavaTongue: 'cutter', lavaVent: 'glue', lightning: 'zap', lavaWave: 'paw', mudPot: 'mine', ashGust: 'fan',
                         steamColumn: 'bubbles', ropeLava: 'band' };
// the volcano gets hotter as you fall: jungle slope, ash cloud (150 m), crater (400 m), lava tubes (800 m), then the magma
// chamber (1,500 m)
const volcanoLayer = y => { const m = y / PX_PER_M; return m < 150 ? 0 : m < 400 ? 1 : m < 800 ? 2 : m < 1500 ? 3 : 4; };
// Volcanic stones collection: Rising Projectile variants (among the lava bombs), each at most once per run
const VOLC_STONES = ['obsidian', 'pumice', 'basalt', 'sulfur', 'olivine', 'geode', 'peleshair', 'spindlebomb'];
const stonesLeft = () => VOLC_STONES.filter(n => !runCollected.has('stone-' + n));
// Minecraft minerals collection (v150; ores in v148–v149): Static Hazard variants (among the bombs, sulfur and pumice),
// each at most once per run. The save ids are still `ore-<name>`, so items found as ores stay found.
const VOLC_MINERALS = ['coal', 'iron', 'copper', 'gold', 'redstone', 'lapis', 'emerald', 'diamond', 'quartz', 'debris'];
const mineralsLeft = () => VOLC_MINERALS.filter(n => !runCollected.has('ore-' + n));
// each Volcano mechanic has one to three looks sharing its hit box; some only appear in certain layers (VOLCANO_LAYERS)
const VOLCANO_LOOKS = {
  gate: { basalt: ['#3a3a42', '#46464e'], crust: ['#2a2420'] },
  erasers: { plates: ['#4a4440', '#3a3632'], obsidian: ['#1e1a24'] },
  blot: { bomb: ['#3a302a'], sulfur: ['#f0d030'], pumice: ['#d8d0c0'] },
  protractor: { dome: ['#3a2a24'], columns: ['#3a3a42'], mound: ['#8a7a6a'] },
  pencil: { charlog: ['#2a2420'], lavaraft: ['#3a302a'] },
  wad: { lavabomb: ['#3a2a24'], glowrock: ['#ff7a2a'] },
  note: { moth: ['#8a6a5a'], beetle: ['#2a2a30'], ashpuff: ['#9a968e'], embers: ['#ff8a2a'] },
  clips: { rollers: ['#3a302a'], beetles: ['#2a2a30'] },
  starfish: { spindle: ['#3a2a24'], obsstar: ['#1e1a24'] },
  scissors: { obsidian: ['#1e1a24', '#2a2034'] },
  compass: { steam: ['#ffffff'], lavaspout: ['#ff7a2a'] },
  cutter: { lavatongue: ['#ff6a1e'], column: ['#3a3a42'] },
  glue: { vent: ['#3a302a'], lavafrog: ['#c84a2a'], fumarole: ['#b8a878'] },
  zap: { lightning: ['#d8e8ff'], steambeam: ['#ffffff'] },
  paw: { lavawave: ['#ff6a1e'], pillar: ['#3a3a42'] },
  mine: { mudpot: ['#8a6a5a'], gaspocket: ['#c8c040'] },
  fan: { ashgust: ['#8a8680'] },
  bubbles: { steam: ['#ffffff'] },
  band: { ropelava: ['#3a2a24'], vine: ['#4f8a3a'] }
};
// looks tied to the layers they belong to (0 jungle, 1 ash cloud, 2 crater, 3 lava tubes, 4 magma); the rest appear everywhere
const VOLCANO_LAYERS = { vine: [0, 1], ropelava: [1, 2, 3, 4], charlog: [0, 1, 2], ashpuff: [1, 2], lightning: [1, 2, 3], lavafrog: [2, 3, 4], moth: [0, 1, 2] };
function volcanoPool(d, y) {
  const pool = [['basaltLedges', 1], ['bombs', 1], ['raft', 1], ['dome', 1], ['lavaBombs', 1], ['steamColumn', 1]];
  pool.push(['ropeLava', 1]);
  pool.push(['moths', 1]);
  pool.push(['spindle', 1]);
  if (conveyorAllowed(y)) pool.push(['rollers', 1]);
  pool.push(['lavaVent', 1]);
  pool.push(['shards', 1]);
  if (windAllowed(y)) pool.push(['ashGust', 1]);
  pool.push(['lavaTongue', 1]);
  pool.push(['mudPot', 1]);
  pool.push(['lightning', 1], ['lavaWave', 1]);
  pool.push(['plates', 1]);
  pool.push(['steamArm', 1]);
  return pool;
}
// ---------- Kitchen (v130) ----------
// A paper plane folded from a recipe card falls down a giant cartoon kitchen. Every obstacle reuses a Paper or Ocean
// mechanic (generator on the right) with kitchen art in draw-kitchen.js.
const KITCHEN_MAKERS = { shelves: 'gate', drawers: 'erasers', produce: 'blots', platter: 'protractor', rollingPin: 'pencil',
                         popcorn: 'wad', pancakes: 'notes', ants: 'clips', cutterWheel: 'starfish', shears: 'scissors', ladle: 'compass',
                         knifeBlock: 'cutter', toaster: 'glue', tap: 'zap', spatula: 'paw', kernel: 'mine', hood: 'fan',
                         potSteam: 'bubbles', spaghetti: 'band' };
// the kitchen from top to bottom: the top shelf, the countertop (150 m), the stove (400 m), the sink (800 m), then inside the
// fridge (1,500 m)
const kitchenLayer = y => { const m = y / PX_PER_M; return m < 150 ? 0 : m < 400 ? 1 : m < 800 ? 2 : m < 1500 ? 3 : 4; };
// Pastries collection: Static Hazards variants (among the produce), each at most once per run
const PASTRIES = ['croissant', 'donut', 'macaron', 'cupcake', 'eclair', 'pretzel', 'cinnamonroll', 'mooncake'];
const pastriesLeft = () => PASTRIES.filter(n => !runCollected.has('pastry-' + n));
// each Kitchen mechanic has one to three looks sharing its hit box; some only appear in certain layers (KITCHEN_LAYERS)
const KITCHEN_LOOKS = {
  gate: { shelf: ['#c8915a', '#b07a48'], board: ['#d8a868', '#c89858'], fridgeshelf: ['#dff2fa'] },
  erasers: { drawer: ['#d8a868', '#9ac0d8', '#e8d0a8'], waffle: ['#8a8f98'] },
  blot: { pineapple: ['#f2c43a'], peppermill: ['#7a4a2a', '#2b2b2b'], icecube: ['#d8f0fa'] },
  protractor: { cake: ['#f7c8d8', '#f4e0b0'], pizza: ['#f2c060'], melon: ['#5fae4a'] },
  pencil: { rollingpin: ['#e0b878'], spoon: ['#c8925a'] },
  wad: { popcorn: ['#fff6dc'], cork: ['#c8a070'] },
  note: { pancake: ['#e8b060'], lettuce: ['#8ad060'], bubble: ['#d8f0ff'] },
  clips: { ants: ['#3a2a20'], sausages: ['#c0603a'] },
  starfish: { cutterwheel: ['#c9ced6'], lemon: ['#f4e04a', '#a0d050'] },
  scissors: { shears: ['#c9ced6'], beaters: ['#d8dde4'] },
  compass: { ladle: ['#c9ced6', '#d8743a'], timer: ['#e04a3a'] },
  cutter: { knife: ['#d8dde4'], tongs: ['#c9ced6'] },
  glue: { toaster: ['#e0e4ea', '#e05a4a', '#6ab0e0'], ketchup: ['#d8342a'] },
  zap: { tap: ['#8ad0ff'], torch: ['#5ab8ff'], coldair: ['#cfefff'] },
  paw: { spatula: ['#3a3a42', '#e05a4a'], whisk: ['#c9ced6'] },
  mine: { kernel: ['#f4c430'], soda: ['#3fae5a', '#e05a4a'] },
  fan: { draft: ['#ffffff'] },
  bubbles: { steam: ['#ffffff'], chill: ['#cfefff'] },
  band: { spaghetti: ['#f0d080'], cheese: ['#f4c840'] }
};
// looks tied to layers (0 top shelf, 1 countertop, 2 stove, 3 sink, 4 fridge); the rest appear everywhere
const KITCHEN_LAYERS = { shelf: [0, 2, 3], board: [1, 2], fridgeshelf: [4], waffle: [1, 2], pineapple: [0, 1, 2], peppermill: [0, 1, 2, 3],
                         icecube: [3, 4], cake: [0, 1], pizza: [1, 2, 3], melon: [3, 4], popcorn: [0, 1, 2, 3], pancake: [0, 1, 2],
                         lettuce: [1, 4], bubble: [3], sausages: [2], timer: [2], toaster: [0, 1, 2], tap: [3], torch: [0, 1, 2],
                         coldair: [4], kernel: [0, 1, 2], steam: [0, 1, 2, 3], chill: [4], cheese: [2] };
function kitchenPool(d, y) {
  const pool = [['shelves', 1], ['produce', 1], ['rollingPin', 1], ['platter', 1], ['popcorn', 1], ['potSteam', 1], ['spaghetti', 1],
                ['pancakes', 1], ['cutterWheel', 1], ['toaster', 1], ['shears', 1], ['knifeBlock', 1], ['kernel', 1], ['tap', 1],
                ['spatula', 1], ['drawers', 1], ['ladle', 1]];
  if (conveyorAllowed(y)) pool.push(['ants', 1]);
  if (windAllowed(y)) pool.push(['hood', 1]);
  return pool;
}
function seaPool(d, y) {
  const pool = [['coral', 1], ['urchins', 1], ['jellies', 1], ['starfish', 1], ['bubbles', 1],
                ['swordfish', 1], ['bigRock', 1], ['puffer', 1]];
  pool.push(['fishline', 1]);
  if (conveyorAllowed(y)) pool.push(['school', 1]);
  pool.push(['crab', 1]);
  pool.push(['anchor', 1]);
  pool.push(['mine', 1]);
  pool.push(['moray', 1]);
  if (windAllowed(y)) pool.push(['current', 1]);
  pool.push(['clam', 1], ['sub', 1]);
  pool.push(['zap', 1], ['kelp', 1]);
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
  if (mapId === 'space') return spawnFromPool(y, d, spacePool(d, y));
  if (mapId === 'dungeon') return spawnFromPool(y, d, dungeonPool(d, y));
  if (mapId === 'city') return spawnFromPool(y, d, cityPool(d, y));
  if (mapId === 'forest') return spawnFromPool(y, d, forestPool(d, y));
  if (mapId === 'desert') return spawnFromPool(y, d, desertPool(d, y));
  if (mapId === 'volcano') return spawnFromPool(y, d, volcanoPool(d, y));
  if (mapId === 'kitchen') return spawnFromPool(y, d, kitchenPool(d, y));
  const pool = [['gate', 1], ['blots', 1], ['pencil', 1], ['protractor', 1], ['wad', 1], ['zap', 1], ['mine', 1], ['bubbles', 1]];
  if (conveyorAllowed(y)) pool.push(['clips', 1]);
  pool.push(['scissors', 1]);
  if (windAllowed(y)) pool.push(['fan', 1]);
  pool.push(['erasers', 1]);
  pool.push(['compass', 1]);
  pool.push(['glue', 1]);
  pool.push(['cutter', 1]);
  pool.push(['notes', 1]);
  pool.push(['band', 1]);
  pool.push(['setsquare', 1]);
  pool.push(['paw', 1]);
  return spawnFromPool(y, d, pool);
}

// the generator (mechanic) behind a pool entry: 'gate' for every Gap Wall, 'notes' for every Drifting Swarm, and so on
const makerOf = type => SEA_MAKERS[type] || SPACE_MAKERS[type] || DUNGEON_MAKERS[type] || CITY_MAKERS[type] || FOREST_MAKERS[type] ||
                        DESERT_MAKERS[type] || VOLCANO_MAKERS[type] || KITCHEN_MAKERS[type] || type;
// a wall-to-wall row (Gap Wall, Closing Jaws) never comes right after a Drifting Swarm (v131): the slow swarm could still be
// sitting in its gap when the plane gets there
const WALL_MAKERS = new Set(['gate', 'erasers']);
function spawnFromPool(y, d, pool) {
  if (!lastType) recentTypes = [];
  let choices = pool.filter(p => !recentTypes.includes(p[0]));   // no obstacle again within REPEAT_GAP rows
  if (!choices.length) choices = pool.filter(p => p[0] !== lastType);
  if (makerOf(lastType) === 'notes') { const open = choices.filter(p => !WALL_MAKERS.has(makerOf(p[0]))); if (open.length) choices = open; }
  let r = Math.random() * choices.reduce((s, p) => s + p[1], 0), type = choices[0][0];
  for (const [t, w] of choices) { if ((r -= w) < 0) { type = t; break; } }
  lastType = type;
  recentTypes.push(type);
  if (recentTypes.length > REPEAT_GAP) recentTypes.shift();
  const before = obstacles.length;
  const extra = make[makerOf(type)](y, d) || 0;
  const rowPal = {}, rowSea = {};    // obstacles of the same kind in one row share a colour
  for (let i = before; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (!o.pal) o.pal = rowPal[o.type] || (rowPal[o.type] = pickPal(o.type));
    if (mapId === 'sea') {
      o.sea = true;
      o.layer = seaLayer(o.y);
      const looks = SEA_LOOKS[o.type];
      if (looks && !rowSea[o.type]) {
        const fit = MAP_REGIONS.sea[o.layer].skins[o.type] || [];   // the region's skins for this obstacle
        const names = fit.length ? fit : Object.keys(looks), look = names[ri(0, names.length - 1)], cols = looks[look];
        rowSea[o.type] = [look, cols[ri(0, cols.length - 1)]];
      }
      if (looks) [o.look, o.seaCol] = rowSea[o.type];
      if (o.type === 'compass') o.hh = 7;        // an anchor chain is thicker than a compass leg
      // each region has its own collection set (v173; MAP_REGIONS.sea[…].collections): an item not yet seen this run
      const sets = MAP_REGIONS.sea[o.layer].collections, pick = (has, left, chance) => {
        const l = sets.includes(has) ? left() : [];
        return l.length && Math.random() < chance ? l[ri(0, l.length - 1)] : null;
      };
      if (o.type === 'blot') {                   // a treasure in the ruins, a seashell on the reef
        if ((o.treasure = pick('treasures', treasuresLeft, 0.4))) runCollected.add('treasure-' + o.treasure);
        else if ((o.shell = pick('shells', shellsLeft, 0.4))) runCollected.add('shell-' + o.shell);
      }
      if (o.type === 'starfish' && (o.fish = pick('fish', fishLeft, 0.5))) runCollected.add('fish-' + o.fish);   // twilight zone
      if (o.type === 'wad' && (o.invention = pick('inventions', inventionsLeft, 0.4))) runCollected.add('invention-' + o.invention);   // dome city
      if (o.type === 'note' && (o.abyssLight = pick('abysslights', abyssLightsLeft, 0.4))) runCollected.add('abysslight-' + o.abyssLight);   // abyss
    } else if (mapId === 'space') {
      o.space = true;
      o.look = o.look || type;                   // which space obstacle this is (several share a mechanic)
      if (SPACE_ALT[o.look]) { if (rowSea.alt == null) rowSea.alt = Math.random() < 0.5; if (rowSea.alt) o.look = SPACE_ALT[o.look]; }
      const cols = SPACE_COLS[o.type];
      if (cols) o.spaceCol = rowSea[o.type] || (rowSea[o.type] = cols[ri(0, cols.length - 1)]);
      if (o.look === 'station' || o.look === 'asteroidbase') o.r = rand(95, 110);
    } else if (mapId === 'notebook') {
      o.paper = true;
      const looks = PAPER_LOOKS[o.type];
      if (looks && !rowSea[o.type]) { const names = Object.keys(looks), look = names[ri(0, names.length - 1)], cols = looks[look]; rowSea[o.type] = [look, cols[ri(0, cols.length - 1)]]; }
      if (looks) [o.look, o.paperCol] = rowSea[o.type];
      if (o.type === 'note') {                   // an origami not yet seen this run (each once per run)
        const left = origamiLeft();
        if (left.length && Math.random() < 0.5) { o.origami = left[ri(0, left.length - 1)]; runCollected.add('origami-' + o.origami); }
      }
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
      o.layer = cityLayer(o.y);
      if (o.neonSign) continue;                  // a collectible neon sign has its own art
      const looks = CITY_LOOKS[o.type];
      if (looks && !rowSea[o.type]) {
        const all = Object.keys(looks), fit = all.filter(l => !CITY_LAYERS[l] || CITY_LAYERS[l].includes(o.layer));
        const names = fit.length ? fit : all, look = names[ri(0, names.length - 1)], cols = looks[look];
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
      if (o.look === 'carpet') {                 // a flying carpet is a short, wide rug (v132): 80–100 long, 34 tall, barely tilted
        o.len = rand(80, 100); o.hh = 17; o.a *= 0.4;
        const ext = o.len / 2 * Math.cos(o.a); o.x = clamp(o.x, ext + 6, W - ext - 6);
      }
      if (o.type === 'blot') {                   // a fossil stone not yet seen this run (each once per run)
        const left = fossilsLeft();
        if (left.length && Math.random() < 0.4) { o.fossil = left[ri(0, left.length - 1)]; runCollected.add('fossil-' + o.fossil); }
      }
    } else if (mapId === 'volcano') {
      o.volcano = true;
      o.layer = volcanoLayer(o.y);
      const looks = VOLCANO_LOOKS[o.type];
      if (looks && !rowSea[o.type]) {
        const all = Object.keys(looks), fit = all.filter(l => !VOLCANO_LAYERS[l] || VOLCANO_LAYERS[l].includes(o.layer));
        const names = fit.length ? fit : all, look = names[ri(0, names.length - 1)], cols = looks[look];
        rowSea[o.type] = [look, cols[ri(0, cols.length - 1)]];
      }
      if (looks) [o.look, o.volCol] = rowSea[o.type];
      if (o.type === 'compass') o.hh = 5;        // a steam jet is a little thicker than a compass leg
      if (o.type === 'wad') {                    // a volcanic stone not yet seen this run (each once per run)
        const left = stonesLeft();
        if (left.length && Math.random() < 0.5) { o.stone = left[ri(0, left.length - 1)]; runCollected.add('stone-' + o.stone); }
      }
      if (o.type === 'blot') {                   // a Minecraft mineral not yet seen this run (each once per run)
        const left = mineralsLeft();
        if (left.length && Math.random() < 0.4) { o.mineral = left[ri(0, left.length - 1)]; runCollected.add('ore-' + o.mineral); }
      }
    } else if (mapId === 'kitchen') {
      o.kitchen = true;
      o.layer = kitchenLayer(o.y);
      const looks = KITCHEN_LOOKS[o.type];
      if (looks && !rowSea[o.type]) {
        const all = Object.keys(looks), fit = all.filter(l => !KITCHEN_LAYERS[l] || KITCHEN_LAYERS[l].includes(o.layer));
        const names = fit.length ? fit : all, look = names[ri(0, names.length - 1)], cols = looks[look];
        rowSea[o.type] = [look, cols[ri(0, cols.length - 1)]];
      }
      if (looks) [o.look, o.kitCol] = rowSea[o.type];
      if (o.type === 'compass') o.hh = 5;        // a ladle is a little thicker than a compass leg
      if (o.type === 'blot') {                   // a pastry not yet seen this run (each once per run)
        const left = pastriesLeft();
        if (left.length && Math.random() < 0.4) { o.pastry = left[ri(0, left.length - 1)]; runCollected.add('pastry-' + o.pastry); }
      }
    }
  }
  if (!['gate', 'coral', 'bigRock', 'girders', 'protractor', 'moon', 'planet', 'station', 'ledges', 'rock', 'signs', 'bulge', 'neon', 'branches', 'trunk', 'sandLedges', 'outcrop', 'basaltLedges', 'dome', 'shelves', 'platter'].includes(type)) {
    const py = y + extra + rand(95, 125), power = pickPower(py);
    if (power) pickups.push({ kind: power, x: rand(50, W - 50), y: py, r: 15, spin: rand(0, 6) });
    else if (Math.random() < 0.28) addStar(rand(40, W - 40), py);
  }
  return extra;
}

function spawnRows() {
  if (daily) { spawnDailyRows(); return; }
  const d = difficulty();
  while (nextRowY < dist + H + 80) {
    const extra = spawnRow(nextRowY, d);
    nextRowY += lerp(300, 185, d) + rand(0, 70) + extra;
  }
}
// the Daily dive (v160): each row comes from its own random numbers, made from the day and the row's number, at a
// difficulty set by the row's own depth, and its gap is drawn first, so the course is the same for everyone whatever
// they pick up or however they fly (only the power-ups and stars on a row can differ: they depend on the plane)
function spawnDailyRows() {
  while (nextRowY < dist + H + 80) {
    const keep = Math.random;
    Math.random = seededRandom((daily.seed ^ Math.imul(dailyRow + 1, 0x9E3779B1)) >>> 0);
    try {
      const y = nextRowY, d = 1 - Math.exp(-y / PX_PER_M / 600);
      const gap = lerp(300, 185, d) + rand(0, 70);
      nextRowY = y + gap + spawnRow(y, d);
    } finally { Math.random = keep; }
    dailyRow++;
  }
}
