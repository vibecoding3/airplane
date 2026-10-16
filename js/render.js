// Paper Nosedive — The plane, screen shake, the frame renderer and map switching.
'use strict';

function planeOutline(c = ctx) {
  c.beginPath();
  c.moveTo(0, 20); c.lineTo(-14, -14); c.lineTo(-2, -9); c.lineTo(0, -12);
  c.lineTo(2, -9); c.lineTo(14, -14); c.closePath();
}

// the plane at the origin, nose pointing down (+y); bank > 0 means it is moving right
function paintPlane(c, bank) {
  const s = PLANE;
  c.lineJoin = 'round'; c.lineCap = 'round';
  c.fillStyle = bank > 0 ? s.dark : s.light;
  c.beginPath(); c.moveTo(0, 20); c.lineTo(-14, -14); c.lineTo(-2, -9); c.closePath(); c.fill();
  c.fillStyle = bank > 0 ? s.light : s.dark;
  c.beginPath(); c.moveTo(0, 20); c.lineTo(14, -14); c.lineTo(2, -9); c.closePath(); c.fill();
  c.fillStyle = s.keel;
  c.beginPath(); c.moveTo(0, 20); c.lineTo(-2, -9); c.lineTo(0, -12); c.lineTo(2, -9); c.closePath(); c.fill();
  c.strokeStyle = s.line;
  planeOutline(c); c.lineWidth = 1.4; c.stroke();
  c.beginPath(); c.moveTo(0, 20); c.lineTo(0, -12); c.lineWidth = 1; c.stroke();
}

// blue glow around the plane while the Extra life is still unused
function paintLifeOutline(c) {
  planeOutline(c);
  c.lineJoin = 'round';
  c.strokeStyle = 'rgba(47,143,224,.35)'; c.lineWidth = 9; c.stroke();
  c.strokeStyle = '#2f8fe0'; c.lineWidth = 4.5; c.stroke();
}

function drawPlane(x, y, ang) {

  ctx.save(); ctx.translate(x, y); ctx.rotate(-ang);
  if (plane.invuln > 0) ctx.globalAlpha = Math.floor(plane.invuln * 12) % 2 ? 0.3 : 1;
  if (plane.lives > 0) paintLifeOutline(ctx);
  paintPlane(ctx, clamp(plane.vx / 400, -1, 1));
  ctx.restore();
}

function drawCrumple(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = PLANE.light;
  ctx.beginPath();
  const pts = [[0, -13], [9, -10], [13, -1], [10, 9], [1, 13], [-9, 10], [-13, 1], [-10, -9]];
  pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b));
  ctx.closePath(); ctx.fill(); inkStroke(1.4);
  ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(2, -2); ctx.lineTo(8, -6);
  ctx.moveTo(2, -2); ctx.lineTo(0, 7); ctx.moveTo(-8, 3); ctx.lineTo(0, 7); ctx.lineTo(7, 5);
  inkStroke(0.9);
  ctx.restore();
}

// screen shake moves the whole playfield (paper layers + canvas) in one compositor transform
let shaking = false;
function applyShake() {
  if (shake > 0 && !reduceMotion) {
    world.style.transform = `translate(${(rand(-shake, shake) * scale).toFixed(1)}px, ${(rand(-shake, shake) * scale).toFixed(1)}px)`;
    shaking = true;
  } else if (shaking) {
    world.style.transform = '';
    shaking = false;
  }
}

// slide the paper layers to match the scroll position; only the transforms change each frame
let pageNowCol = '', pageNextCol = '';
function syncPaperLayers() {
  const px = v => Math.round(v * scale * dpr) / dpr;           // whole device pixels keep the lines crisp
  ruling.style.transform = `translate3d(0, ${px(-(dist % PAPER_REPEAT))}px, 0)`;
  const k = pageIndexAt(dist);
  const now = pageColor(k), next = pageColor(k + 1);
  if (now !== pageNowCol) pageNow.style.background = pageNowCol = now;
  if (next !== pageNextCol) pageNext.style.background = pageNextCol = next;
  const boundary = pageTop(k + 1) - dist;                         // where the next colour starts on screen
  pageNext.style.transform = `translate3d(0, ${px(Math.min(boundary, H + 10))}px, 0)`;
}

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  applyShake();
  syncPaperLayers();
  drawPaper();

  for (const o of obstacles) {
    const sy = o.y - dist;
    if (sy < -120 || sy > H + 120) continue;
    switch (o.type) {
      case 'gate': {
        const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
        if (o.sea) { drawCoral(-10, l, sy, l, -1, o.seaCol); drawCoral(r, W + 10, sy, r, 1, o.seaCol); break; }
        drawRuler(-10, l, sy, l, -1, o.pal);
        drawRuler(r, W + 10, sy, r, 1, o.pal);
        break;
      }
      case 'erasers': {
        const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
        if (o.sea) { drawClam(-10, l, sy, l, -1, o.seaCol); drawClam(r, W + 10, sy, r, 1, o.seaCol); break; }
        drawEraser(-10, l, sy, l, -1, o.pal);
        drawEraser(r, W + 10, sy, r, 1, o.pal);
        break;
      }
      case 'pencil': drawPencil(o, sy); break;
      case 'scissors': drawScissors(o, sy); break;
      case 'blot': o.sea ? drawUrchin(o, sy) : drawBlot(o, sy); break;
      case 'starfish': drawStarfish(o, sy); break;
      case 'zap': drawZap(o, sy); break;
      case 'mine': drawMine(o, sy); break;
      case 'bubbles': drawBubbleColumn(o, sy); break;
      case 'protractor': drawProtractor(o, sy); break;
      case 'wad': drawWad(o, sy); break;
      case 'clips': for (const x of clipXs(o)) drawClip(x, sy, o.col); break;
      case 'compass': drawCompass(o, sy); break;
      case 'fan': drawFan(o, sy); break;
      case 'glue': o.sea ? drawSub(o, sy) : drawGlue(o, sy); break;
      case 'cutter': o.sea ? drawMoray(o, sy) : drawCutter(o, sy); break;
      case 'note': o.sea ? drawJelly(o, sy) : drawNote(o, sy); break;
      case 'setsquare': drawSetSquare(o, sy); break;
      case 'band': drawBand(o, sy); break;
      case 'paw': o.sea ? drawKelp(o, sy) : drawPaw(o, sy); break;
    }
  }
  for (const p of pickups) drawStar(p, p.y - dist);

  const py = planeScreenY();
  if (has('magnet') && plane.alive && state === 'play') {     // faint ring showing the magnet's reach
    ctx.save();
    ctx.strokeStyle = 'rgba(200,70,59,.18)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 7]);
    ctx.beginPath(); ctx.arc(plane.x, py, magnetRange(), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (plane.alive) drawPlane(plane.x, py, plane.ang);
  else drawCrumple(plane.x, py);

  for (const p of particles) {
    const sy = p.y - dist;
    ctx.save(); ctx.globalAlpha = clamp(p.life, 0, 1);
    ctx.translate(p.x, sy); ctx.rotate(p.rot);
    if (p.kind === 'scrap') {
      ctx.fillStyle = PLANE.light;
      ctx.beginPath(); ctx.moveTo(-p.size, -p.size * 0.6); ctx.lineTo(p.size, -p.size * 0.3); ctx.lineTo(p.size * 0.4, p.size * 0.7); ctx.closePath();
      ctx.fill(); inkStroke(1);
    } else {
      ctx.fillStyle = p.col || '#f2b53a';
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }
  ctx.textAlign = 'center';
  ctx.font = '700 18px Kalam, cursive';
  for (const f of floaters) {
    ctx.globalAlpha = clamp(f.life, 0, 1);
    ctx.fillStyle = f.col || '#a8740f';
    ctx.fillText(f.text, f.x, f.y - dist - (1 - f.life) * 40);
  }
  ctx.globalAlpha = 1;
  if (state === 'play') drawSteerHints();
  syncHudPage();
}

// chevrons in the bottom corners show which way the plane is drifting
function drawSteerHints() {
  const y = H - 46;
  for (const side of [-1, 1]) {
    const x = side < 0 ? 44 : W - 44;
    const active = drift === side;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = active ? (holdSide === side ? 0.75 : 0.5) : 0.18;
    ctx.beginPath();
    for (const o of [-7, 7]) {
      ctx.moveTo(o - side * 6, -12); ctx.lineTo(o + side * 6, 0); ctx.lineTo(o - side * 6, 12);
    }
    inkStroke(4);
    if (darkPage) { ctx.strokeStyle = '#d8eefa'; ctx.stroke(); }   // light arrows on dark water
    ctx.restore();
  }
}

// switch the background between maps (the world's CSS class picks the ruling pattern)
function applyMap() {
  world.classList.toggle('map-sea', mapId === 'sea');
  // swap the background decorations right away: clear them and refill from just above the screen
  formulas = []; fishes.length = 0; lastSceneryY = -1e9;
  nextFormulaY = Math.ceil(dist / 30) * 30;
  hudPage = ''; pageNowCol = ''; pageNextCol = '';   // force the colours to refresh
  for (const b of document.querySelectorAll('[data-map]')) b.setAttribute('aria-pressed', String(b.dataset.map === mapId));
}
for (const b of document.querySelectorAll('[data-map]')) {
  b.addEventListener('click', () => {
    mapId = b.dataset.map;
    store.set('nosedive-map', mapId);
    applyMap();
  });
}
applyMap();
