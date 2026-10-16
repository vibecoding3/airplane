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
// plane skins: light/dark are the two wing faces (swapped when banking), keel is the centre fold
const SKINS = [
  { id: 'classic', name: 'Classic', light: '#ffffff', dark: '#e9e7dd', keel: '#d6d3c6', line: COL.ink },
  { id: 'notebook', name: 'Notebook', light: '#fbf9f1', dark: '#eeebdf', keel: '#dcd7c4', line: COL.ink, pattern: 'lines' },
  { id: 'news', name: 'Newspaper', light: '#ecebe5', dark: '#d8d6ce', keel: '#c3c0b5', line: '#2b2b2b', pattern: 'news' },
  { id: 'kraft', name: 'Kraft', light: '#d6ad7e', dark: '#c09463', keel: '#a97f4e', line: '#5a3b1c' },
  { id: 'red', name: 'Origami red', light: '#e2493b', dark: '#c4372b', keel: '#a82c22', line: '#5e1610' },
  { id: 'cash', name: 'Banknote', light: '#d3e6c7', dark: '#b8d3a9', keel: '#9cbd8b', line: '#2f5a2a', pattern: 'cash' },
  { id: 'gold', name: 'Gold foil', light: '#f6d66e', dark: '#dbb03a', keel: '#c49520', line: '#7a5508', pattern: 'shine' },
  { id: 'stealth', name: 'Stealth', light: '#3c414c', dark: '#2a2e37', keel: '#1d2027', line: '#0d0f13', pattern: 'stealth' }
];
const $ = id => document.getElementById(id);
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
const pageNow = $('pageNow'), pageNext = $('pageNext'), ruling = $('ruling'), raysEl = $('rays');
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
  ruling.style.height = Math.ceil((H + PAPER_REPEAT) * scale) + 'px';
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
