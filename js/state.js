// Paper Nosedive — Game state, power-up levels, controls and speed rules.
'use strict';

// ---------- game state ----------
let state = 'title';          // title | play | paused | dying | over
let plane, obstacles, pickups, particles, floaters;
let dist, speed, time, nextRowY, stars, shake, overTimer;
// best depth per map (the medals depend on it); `best` is the current map's, set by applyMap
const bests = { notebook: +store.get('nosedive-best-notebook') || 0, sea: +store.get('nosedive-best-sea') || 0 };
if (store.get('nosedive-best-notebook') == null && +store.get('nosedive-best') > 0) {
  // before v49 there was one best for all maps: it goes to Paper, the original map
  bests.notebook = +store.get('nosedive-best');
  store.set('nosedive-best-notebook', String(bests.notebook));
}
let best = 0;
// medals per map, earned by reaching these depths
const MEDALS = [{ id: 'bronze', name: 'Bronze', m: 250 }, { id: 'silver', name: 'Silver', m: 750 }, { id: 'gold', name: 'Gold', m: 1500 }];
const medalsAnnounced = new Set();   // medals already celebrated this run

// ---------- power-ups: picked up during a run, three levels each, gone when the run ends ----------
// magnet: pulls stars in from further away at each level; shield: one spare life per level
const POWER_MAX = 3;
const MAGNET_RANGES = [0, 120, 180, 240];   // by magnet level
const magnetRange = () => MAGNET_RANGES[plane.magnet];
const POWER_GAP = 45 * PX_PER_M;           // at least ~45 m between power-ups
let lastPowerY = 0;
// stars caught in runs are added to a saved total
let bank = +store.get('nosedive-bank') || 0;
let titleTime = 0;
let passedBest = false;          // this run has gone deeper than the saved best
let lastMilestone = 0, flash = 0, flashCol = '';   // 100 m milestones and their screen flash

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
const score = () => Math.floor(dist / PX_PER_M);   // stars are a collected total, not metres

function reset() {
  plane = { x: W / 2, vx: 0, ang: 0, alive: true, lives: 0, magnet: 0, invuln: 0, bubbled: 0 };
  obstacles = []; pickups = []; particles = []; floaters = [];
  dist = 0; speed = 150; time = 0; stars = 0; shake = 0; overTimer = 0;
  nextRowY = H + 140; lastPowerY = 0; passedBest = false; lastMilestone = 0; flash = 0; medalsAnnounced.clear();
  formulas = []; nextFormulaY = 60; usedFormulas.clear(); fishes.length = 0; lastSceneryY = -1e9;
}
reset();
