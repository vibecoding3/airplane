// Paper Nosedive — Constants, small helpers, screen sizing and the sprite cache.
'use strict';

// ---------- constants & helpers ----------
const W = 400;              // logical playfield width; height follows the screen
const PX_PER_M = 30;        // world units per metre of depth
const SIDE_SLOWDOWN = 0.4;  // at full sideways speed the plane falls 40% slower
const COL = {
  paper: '#fbf9f1', rule: '#bcd3ea', margin: '#e7a1a1', ink: '#22356b',
  graphite: '#55585e', hole: '#24313f', inkBlot: '#1b2760'
};
// the plane's paper: light/dark are the two wing faces (swapped when banking), keel is the centre fold
const PLANE = { light: '#ffffff', dark: '#e9e7dd', keel: '#d6d3c6', line: COL.ink };
const $ = id => document.getElementById(id);
// Replays (v157) run each game on its own seeded random sequence: during a run's updates Math.random is swapped for it
// (simFrame in replay.js). Sound and music keep the real one, so muting never changes a run.
const realRandom = Math.random;
function seededRandom(seed) {                     // mulberry32: small, fast, and the same on every browser
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
// drop items in place (no new array each frame, so less garbage for the browser to collect)
function prune(arr, keep) {
  let j = 0;
  for (let i = 0; i < arr.length; i++) if (keep(arr[i])) arr[j++] = arr[i];
  arr.length = j;
}
const fmt = n => Math.floor(n).toLocaleString('en-US');
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
};

// the canvas is transparent: the paper behind it is a set of browser layers (see #world in the CSS)
const stage = $('stage'), wrap = $('wrap'), canvas = $('game'), world = $('world');
const pageNow = $('pageNow'), pageNext = $('pageNext'), ruling = $('ruling'), artA = $('artA'), artB = $('artB');
let ctx = canvas.getContext('2d');   // `let`: sprites temporarily swap it (see makeSprite)
let H = 640, scale = 1, dpr = 1;

// Rendering resolution: never more than 2×; very dense phone screens start at 1.5× (hard to tell apart
// on a moving game, about half the pixels). Lowered further automatically on devices that can't keep up,
// and remembered between visits. Never below 1×.
const MAX_DPR = Math.min(window.devicePixelRatio || 1, 2);
const START_DPR = (window.devicePixelRatio || 1) >= 2.5 ? 1.5 : MAX_DPR;
let dprCap = clamp(+store.get('nosedive-res') || START_DPR, 1, MAX_DPR);

function resize() {
  const sw = stage.clientWidth, sh = stage.clientHeight;
  const cw = sw < 560 ? sw : Math.min(sw, sh * 0.66);
  wrap.style.width = cw + 'px';
  wrap.style.height = sh + 'px';
  dpr = dprCap;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(sh * dpr);
  scale = cw / W;
  H = sh / scale;
  // paper layers: one world unit = `scale` CSS px; the ruling layer is one pattern repeat taller than the view
  world.style.setProperty('--u', scale + 'px');
  ruling.style.height = artA.style.height = artB.style.height = Math.ceil((H + PAPER_REPEAT) * scale) + 'px';
  invalidateSprites();
}
// the ruling pattern repeats every 750 units: lines every 30, punched holes every 250
const PAPER_REPEAT = 750;

// ---------- sprite cache ----------
// Static drawings (paper pattern, formulas, rigid obstacle parts) are painted once into small offscreen
// canvases at screen resolution and then just copied each frame, which is far cheaper than redrawing
// paths and text 60 times a second.
let spriteRes = 1, spriteGen = 0;
const spriteCache = new Map();
function invalidateSprites() {
  spriteRes = scale * dpr;
  spriteGen++;
  spriteCache.clear();
}
// w,h: size in world units; (ox,oy): where the drawing's origin sits inside the sprite
function makeSprite(w, h, ox, oy, paint) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w * spriteRes));
  c.height = Math.max(1, Math.ceil(h * spriteRes));
  const g = c.getContext('2d');
  g.scale(spriteRes, spriteRes);
  g.translate(ox, oy);
  const screen = ctx;
  ctx = g;                       // the existing draw helpers all paint into `ctx`
  try { paint(); } finally { ctx = screen; }
  return { c, w, h, ox, oy, gen: spriteGen };
}
// shared by every obstacle with the same look (key = shape + colours)
function sharedSprite(key, w, h, ox, oy, paint) {
  let s = spriteCache.get(key);
  if (!s) spriteCache.set(key, s = makeSprite(w, h, ox, oy, paint));
  return s;
}
// unique to one object (random shape); rebuilt after a resize
function ownSprite(o, slot, w, h, ox, oy, paint) {
  let s = o[slot];
  if (!s || s.gen !== spriteGen) s = o[slot] = makeSprite(w, h, ox, oy, paint);
  return s;
}
function blit(s, x, y, rot = 0, sx = 1, sy = 1) {
  if (!rot && sx === 1 && sy === 1) { ctx.drawImage(s.c, x - s.ox, y - s.oy, s.w, s.h); return; }
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
  ctx.drawImage(s.c, -s.ox, -s.oy, s.w, s.h);
  ctx.restore();
}
const palKey = p => (p ? Object.values(p).join('|') : '');

window.addEventListener('resize', resize);
resize();
// sprites with text were painted before the handwriting font arrived: repaint them once it has
if (document.fonts) {
  document.fonts.ready.then(invalidateSprites);
  document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', invalidateSprites);
}
