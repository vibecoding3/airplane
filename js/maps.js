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
// deep sea: the water darkens every 100 m and stays at the darkest shade below 1,000 m
const SEA = ['#c4ecf4', '#a3dcec', '#80c8e2', '#5daed3', '#3f92c0', '#2c76a6', '#205c88', '#18456b', '#123352', '#0d253d', '#091a2c'];
const MAPS = {
  notebook: { name: 'Paper', colour: k => (k < 1 ? COL.paper : RAINBOW[(k - 1) % RAINBOW.length]), formulas: true },
  sea: { name: 'Deep sea', colour: k => SEA[clamp(k, 0, SEA.length - 1)], formulas: false }
};
let mapId = MAPS[store.get('nosedive-map')] ? store.get('nosedive-map') : 'notebook';
const pageColor = k => MAPS[mapId].colour(k);
// light text and markers on dark water
const isDark = hex => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
};
let darkPage = false;

let hudPage = '';
function syncHudPage() {         // the HUD's fade matches the page colour behind it
  const c = pageColor(pageIndexAt(dist + 40));
  if (c === hudPage) return;
  hudPage = c;
  wrap.style.setProperty('--page', c);
  darkPage = c.startsWith('#') && isDark(c);
  wrap.classList.toggle('dark-page', darkPage);
}

// the page colour, ruled lines, margin and punched holes are browser layers behind the canvas
// (see syncPaperLayers); the canvas only adds the pencilled formulas and the depth markers
function drawPaper() {
  if (MAPS[mapId].formulas) drawFormulas();
  else { drawSeaParticles(); drawFishes(); }
  drawDepthMarkers();
  drawBestLine();
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
  const left = mapId === 'sea' ? 12 : 66, text = 'Your best · ' + fmt(best) + ' m';
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

function drawDepthMarkers() {
  for (let k = Math.max(1, pageIndexAt(dist - 20) + 1), y; (y = pageTop(k) - dist) < H + 20; k++) {
    const col = isDark(pageColor(k)) ? '#d8eefa' : COL.graphite;
    ctx.save();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.3; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(mapId === 'sea' ? 24 : 60, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col; ctx.font = '700 15px Kalam, cursive'; ctx.textAlign = 'right';
    ctx.fillText(fmt(k * PAGE_M) + ' m', W - 10, y - 6);
    ctx.restore();
  }
}
