// Paper Nosedive — Game state, shop data (upgrades), controls and speed rules.
'use strict';

// ---------- game state ----------
let state = 'title';          // title | play | paused | dying | over
let plane, obstacles, pickups, particles, floaters;
let dist, speed, time, nextRowY, stars, shake, overTimer;
let best = +store.get('nosedive-best') || 0;

// ---------- shop: stars collected in runs go into a bank and buy permanent upgrades ----------
// each upgrade has three levels, bought one after another
const UPGRADES = [
  { id: 'life', name: 'Extra life', levels: [
    { price: 20, desc: 'Survive 1 crash every run. Your plane glows blue while a spare life is ready.' },
    { price: 40, desc: 'Survive 2 crashes every run.' },
    { price: 70, desc: 'Survive 3 crashes every run.' }
  ] },
  { id: 'magnet', name: 'Star magnet', levels: [
    { price: 10, desc: 'Stars near your plane fly straight to it.' },
    { price: 25, desc: 'Pulls stars from 1.5× as far away.' },
    { price: 45, desc: 'Pulls stars from twice as far away.' }
  ] }
];
const MAGNET_RANGES = [0, 120, 180, 240];   // by magnet level
let bank = +store.get('nosedive-bank') || 0;
let owned = {};
try { owned = JSON.parse(store.get('nosedive-upgrades') || '{}') || {}; } catch (e) { owned = {}; }
// older saves stored a bought upgrade as `true`, which counts as level 1
const level = id => (owned[id] === true ? 1 : Math.max(0, Math.floor(+owned[id] || 0)));
const has = id => level(id) > 0;
const magnetRange = () => MAGNET_RANGES[Math.min(level('magnet'), MAGNET_RANGES.length - 1)];
let titleTime = 0;

// One control scheme for every device (tap/click a screen side, or press an arrow key):
// each press steps the drift one notch toward that side (left -> straight -> right);
// holding past HOLD_MS steers hard and leaves the plane drifting that way.
const HOLD_MS = 220;
let drift = 0, holdSide = 0, holdSource = null, holdStart = 0;

function press(side, source) {
  if (state !== 'play') return;
  holdSide = side;
  holdSource = source;
  holdStart = performance.now();
  drift = clamp(drift + side, -1, 1);
}
function release(source) {
  if (source !== holdSource) return;
  holdSide = 0;
  holdSource = null;
}
function clearControls() { drift = 0; holdSide = 0; holdSource = null; }

const planeScreenY = () => H * 0.28;
// everything scales with depth: the deeper the plane gets, the faster it falls, with no cap
const depthM = () => dist / PX_PER_M;
const difficulty = () => 1 - Math.exp(-depthM() / 600);
const baseFallSpeed = () => 150 + 11 * Math.sqrt(depthM());
const maxSideSpeed = () => 300 + 0.4 * (baseFallSpeed() - 150);
const score = () => Math.floor(dist / PX_PER_M);   // stars are Shop money, not metres

function reset() {
  plane = { x: W / 2, vx: 0, ang: 0, alive: true, lives: level('life'), invuln: 0, bubbled: 0 };
  obstacles = []; pickups = []; particles = []; floaters = [];
  dist = 0; speed = 150; time = 0; stars = 0; shake = 0; overTimer = 0;
  nextRowY = H + 140;
  formulas = []; nextFormulaY = 60; usedFormulas.clear(); fishes.length = 0; lastSceneryY = -1e9;
}
reset();
