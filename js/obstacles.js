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
    if (!moving && Math.random() < 0.45) pickups.push({ x: base, y, r: 10, spin: rand(0, 6) });
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
  // ---- deep sea only ----
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
// Deep sea obstacles. Most reuse a notebook obstacle's movement and collision with an underwater look
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
function seaPool(d) {
  const pool = [['coral', 3], ['urchins', 2], ['jellies', 1.4], ['starfish', 1.4], ['bubbles', 1]];
  if (d > 0.08) pool.push(['mine', 1.3]);
  if (d > 0.1) pool.push(['moray', 1.3]);
  if (d > 0.12) pool.push(['current', 1.1]);
  if (d > 0.15) pool.push(['clam', 1.3], ['sub', 1.2]);
  if (d > 0.2) pool.push(['zap', 1.2], ['kelp', 1.2]);
  return pool;
}

function spawnRow(y, d) {
  if (mapId === 'sea') return spawnFromPool(y, d, seaPool(d));
  const pool = [['gate', 3], ['blots', 2], ['pencil', 1 + 2 * d], ['protractor', 1.4], ['wad', 1 + d]];
  if (d > 0.08) pool.push(['clips', 1.4]);
  if (d > 0.12) pool.push(['scissors', 0.6 + 1.6 * d]);
  if (d > 0.18) pool.push(['fan', 1.1]);
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
  const extra = make[SEA_MAKERS[type] || type](y, d) || 0;
  const rowPal = {}, rowSea = {};    // obstacles of the same kind in one row share a colour
  for (let i = before; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (!o.pal) o.pal = rowPal[o.type] || (rowPal[o.type] = pickPal(o.type));
    if (mapId === 'sea') {
      o.sea = true;
      const cols = SEA_COLS[o.type];
      if (cols) o.seaCol = rowSea[o.type] || (rowSea[o.type] = cols[ri(0, cols.length - 1)]);
    }
  }
  if (type !== 'gate' && type !== 'coral' && type !== 'protractor' && Math.random() < 0.28) {
    pickups.push({ x: rand(40, W - 40), y: y + extra + rand(95, 125), r: 10, spin: rand(0, 6) });
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
