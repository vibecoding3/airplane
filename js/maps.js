// Paper Nosedive — Map definitions (page and water colours), HUD contrast, and the paper background drawing.
'use strict';

// ---------- drawing ----------
// every 100 m the page turns the next rainbow colour; the first 100 m stay plain paper.
// Boundaries line up with the plane, so the colour changes as the depth counter passes 100, 200, ...
const PAGE_M = 100;
const RAINBOW = ['#fde2de', '#fee8d2', '#fcf3c6', '#e1f3d8', '#d9eaf9', '#e0def6', '#eedff5'];
const pageIndexAt = wy => Math.floor((wy - planeScreenY()) / (PAGE_M * PX_PER_M));
const pageTop = k => k * PAGE_M * PX_PER_M + planeScreenY();
// ---------- maps: only the background changes; obstacles and rules stay the same ----------
// ocean: the water darkens every 100 m and stays at the darkest shade below 1,000 m
const SEA = ['#c4ecf4', '#a3dcec', '#80c8e2', '#5daed3', '#3f92c0', '#2c76a6', '#205c88', '#18456b', '#123352', '#0d253d', '#091a2c'];
// space: deep blue sky turning to black, then faintly tinted nebula darks, near-black below 1,000 m
// dungeon: grey stone in the well, warm torch-lit browns, cold blue-purple caverns, then the red underworld
const DUNGEON = ['#57514a', '#4a3f37', '#3d342e', '#332c27', '#262c38', '#20263a', '#1f1b30', '#19172a', '#2a1410', '#311410', '#36120b'];
// neon city: night-blue rooftops, purple streets, the teal subway (400 m), the magenta arcade (800 m), then the
// near-black data core (1,500 m)
const CITY = ['#1c2350', '#1e1f4c', '#261b4e', '#2b1850', '#11303a', '#0f2b34', '#0d262e', '#0b2129', '#2a0f33', '#260d30',
              '#220b2c', '#1f0a29', '#1c0926', '#190823', '#160720', '#071a1c', '#06161a', '#051318', '#041016'];
// the depth markers glow in a different neon colour every 100 m on the Neon City map
const NEON_MARKS = ['#ff4fd8', '#3ff0ff', '#b6ff3f', '#ffb03f', '#9a7cff'];
// forest: through the seasons, a few shades each: spring greens, summer greens (150 m), autumn oranges (400 m),
// winter blue-greys (800 m), then the dark teal night (1,500 m)
const FOREST = ['#d4ecb4', '#c4e4a2', '#9fcf78', '#8cc266', '#ecc07a', '#e6ad66', '#dc9a58', '#d08a4e', '#d4dee4', '#c6d2da',
                '#b8c6d0', '#aabac6', '#9caebc', '#8ea2b2', '#8296a8', '#1f3d3c', '#1a3534', '#162e2e', '#122828'];
// desert: through the rock layers: dune sand, canyon sandstone (150 m), the cool oasis seep (400 m), grey-brown fossil
// beds (800 m), then the golden amber (1,500 m)
const DESERT = ['#f4dc9c', '#f0d08a', '#eab070', '#e09a5c', '#9cc8b0', '#8cbea4', '#7cb498', '#6caa8c', '#b0a490', '#a69a86',
                '#9c907c', '#928672', '#887c68', '#7e725e', '#746854', '#c8862a', '#b8761e', '#a86814', '#985a0c'];
// volcano: hotter and brighter as you fall: jungle greens, ash greys (150 m), dark crater basalt (400 m), near-black lava
// tubes (800 m), then the glowing orange magma chamber (1,500 m)
const VOLCANO = ['#a8d890', '#98cc80', '#b4b0aa', '#a29e98', '#5a5650', '#504c46', '#46423c', '#3e3a34', '#2e2220', '#2c1e1a',
                 '#2a1a16', '#281612', '#26140f', '#24120c', '#22100a', '#c8501e', '#d05a1e', '#d8641e', '#e06e1e'];
// kitchen: the cream top shelf, the warm wooden countertop (150 m), the peach stove (400 m), the blue-white tiles of the sink
// (800 m), then the icy inside of the fridge (1,500 m); all light, so the ink outlines read everywhere
const KITCHEN = ['#fbf1dc', '#f8ecd4', '#f2dfc0', '#eed8b4', '#f8d4b8', '#f6ccac', '#f4c4a2', '#f2bc98', '#d8ecf4', '#d2e8f2',
                 '#cce4f0', '#c6e0ee', '#c0dcec', '#bad8ea', '#b4d4e8', '#e8f6fc', '#e2f2fa', '#dceef8', '#d6eaf6'];
const SPACE = ['#2a5298', '#1a3570', '#10204a', '#0b1432', '#140f33', '#0a1b2e', '#1a0e2c', '#0c1533', '#120a28', '#0a1026', '#06070f'];
const MAPS = {
  notebook: { name: 'Paper', colour: k => (k < 1 ? COL.paper : RAINBOW[(k - 1) % RAINBOW.length]), formulas: true },
  sea: { name: 'Ocean', colour: k => SEA[clamp(k, 0, SEA.length - 1)], formulas: false },
  space: { name: 'Space', colour: k => SPACE[clamp(k, 0, SPACE.length - 1)], formulas: false },
  dungeon: { name: 'Dungeon', colour: k => DUNGEON[clamp(k, 0, DUNGEON.length - 1)], formulas: false },
  city: { name: 'Neon City', colour: k => CITY[clamp(k, 0, CITY.length - 1)], formulas: false },
  forest: { name: 'Forest', colour: k => FOREST[clamp(k, 0, FOREST.length - 1)], formulas: false },
  desert: { name: 'Desert', colour: k => DESERT[clamp(k, 0, DESERT.length - 1)], formulas: false },
  volcano: { name: 'Volcano', colour: k => VOLCANO[clamp(k, 0, VOLCANO.length - 1)], formulas: false },
  kitchen: { name: 'Kitchen', colour: k => KITCHEN[clamp(k, 0, KITCHEN.length - 1)], formulas: false }
};
let mapId = MAPS[store.get('nosedive-map')] ? store.get('nosedive-map') : 'notebook';
const pageColor = k => MAPS[mapId].colour(k);
// light text and markers on dark water
const isDark = hex => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
};
let darkPage = false;

// where each map's starting scene is on screen (its lowest point); it slides away within the first ~35 m
const START_SCENES = { notebook: () => paperStartY(), sea: () => seaStartY(), space: () => earthLimbY(), dungeon: () => wellOpeningY(), city: () => cityStartY(), forest: () => forestStartY(), desert: () => desertStartY(), volcano: () => volcanoStartY(), kitchen: () => kitchenStartY() };
const DARK_SCENES = new Set(['space', 'dungeon', 'city']);   // starting scenes the HUD needs light text over
let hudPage = '';
function syncHudPage() {         // the HUD has no background (v135): its text turns light over dark pages
  // while the map's starting scene is in view the text stays dark over the light paper and sky, light over Earth and the well
  const scene = START_SCENES[mapId]() > -150;
  const c = scene ? 'transparent' : pageColor(pageIndexAt(dist + 40));
  if (c === hudPage) return;
  hudPage = c;
  darkPage = scene ? DARK_SCENES.has(mapId) : c.startsWith('#') && isDark(c);
  wrap.classList.toggle('dark-page', darkPage);
}

// the page colour, ruled lines, margin and punched holes are browser layers behind the canvas
// (see syncPaperLayers); the canvas only adds the pencilled formulas and the depth markers
function drawPaper() {
  if (MAPS[mapId].formulas) { belowLine(paperStartY() + 52, drawFormulas); drawPaperStart(); }   // no formulas over the header
  else if (mapId === 'sea') { drawSeaStart(); drawSeaParticles(); belowLine(seaStartY() + 8, drawFishes); }   // no fish in the sky
  else if (mapId === 'kitchen') { drawKitchenStart(); drawKitchenParticles(); belowLine(kitchenStartY() + 4, drawFishes); }   // no scenery over the cupboard
  else if (mapId === 'volcano') { drawVolcanoStart(); drawVolcanoParticles(); belowLine(volcanoStartY() + 4, drawFishes); }   // no scenery over the crater rim
  else if (mapId === 'desert') { drawDesertStart(); drawDesertParticles(); belowLine(desertStartY() + 4, drawFishes); }   // no scenery over the mesa
  else if (mapId === 'forest') { drawForestStart(); drawForestParticles(); belowLine(forestStartY() + 4, drawFishes); }   // no scenery over the treetops
  else if (mapId === 'city') { drawCityStart(); drawCityParticles(); belowLine(cityStartY() + 4, drawFishes); }   // no scenery over the rooftop
  else { mapId === 'space' ? drawSpaceDetails() : drawDungeonDetails(); drawFishes(); }
  drawDepthMarkers();
  drawBestLine();
}

// draw only below a line on screen (keeps formulas off the notebook header and fish out of the sky at the start)
function belowLine(y, draw) {
  if (y <= 0) { draw(); return; }
  ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, H - y + 200); ctx.clip(); draw(); ctx.restore();
}

function drawFormulas() {
  // pencilled math homework (text is cheap to draw directly; the browser caches the glyphs)
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = COL.graphite; ctx.strokeStyle = COL.graphite; ctx.lineWidth = 1.2;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let font = '';
  for (const f of formulas) {
    const sy = f.y - dist;
    if (sy < -f.ext / 2 - 20 || sy > H + f.ext / 2 + 20) continue;
    ctx.translate(f.x, sy); ctx.rotate(f.rot);
    const fnt = formulaFont(f.size);
    if (fnt !== font) ctx.font = font = fnt;      // only re-parse the font when it changes
    ctx.fillText(f.text, 0, 0);
    if (f.underline) {
      const u = f.size * 0.5;
      ctx.beginPath(); ctx.moveTo(-f.w / 2 - 2, u); ctx.quadraticCurveTo(0, u + 3, f.w / 2 + 3, u - 1); ctx.stroke();
    }
    ctx.rotate(-f.rot); ctx.translate(-f.x, -sy);  // undo, keeping the font set
  }
  ctx.restore();
}

// dashed marker where each new colour starts (pencil on paper, pale sonar line in deep water)
// your record depth as a gold dashed line with a label, so you can see it coming during a run
function drawBestLine() {
  if (best <= 0 || !(state === 'play' || state === 'paused' || state === 'dying')) return;
  const y = best * PX_PER_M + planeScreenY() - dist;   // where the plane will be when the depth reaches the record
  if (y < -30 || y > H + 30) return;
  const left = mapId === 'notebook' ? 66 : 12, text = 'Your best · ' + fmt(best) + ' m';
  ctx.save();
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.setLineDash([14, 8]);
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '700 16px Kalam, cursive'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const w = ctx.measureText(text).width + 20;
  ctx.beginPath(); roundRectPath(left, y - 26, w, 22, 11);
  ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = COL.ink; ctx.fillText(text, left + 10, y - 14);
  ctx.restore();
}

// Ocean only (v166): under each depth marker, the name of the region below it, one per depth-art layer (ART_BOUNDS)
const SEA_REGIONS = ['Sunlit reef', 'Twilight zone', 'Sunken ruins', 'Dome city', 'The abyss'];
function drawDepthMarkers() {
  for (let k = Math.max(1, pageIndexAt(dist - 20) + 1), y; (y = pageTop(k) - dist) < H + 20; k++) {
    const col = mapId === 'city' ? NEON_MARKS[(k - 1) % NEON_MARKS.length] : isDark(pageColor(k)) ? '#d8eefa' : COL.graphite;
    ctx.save();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.3; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col; ctx.font = '700 15px Kalam, cursive'; ctx.textAlign = 'right';
    ctx.fillText(fmt(k * PAGE_M) + ' m', W - 10, y - 6);
    if (mapId === 'sea') {
      ctx.font = '700 13px Kalam, cursive';
      ctx.fillText(SEA_REGIONS[ART_BOUNDS.filter(b => b <= k * PAGE_M).length], W - 10, y + 16);
    }
    ctx.restore();
  }
}
