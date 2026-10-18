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

// outline around the plane while it has a shield; its look shows the shield level
const SHIELD_LOOKS = [null,
  { col: '#6cc0f7', w: 3 },                                   // level 1: light blue, thin
  { col: '#1c3fa8', w: 4.5, edge: 'rgba(255,255,255,.85)' }, // level 2: dark blue, white edge so it shows in space
  { col: '#8b3fe0', w: 5, glow: 'rgba(160,90,255,.3)' }      // level 3: violet with a soft glow
];
function paintLifeOutline(c, lvl = 2) {
  const s = SHIELD_LOOKS[clamp(lvl, 1, 3)];
  planeOutline(c);
  c.lineJoin = 'round';
  if (s.glow) { c.strokeStyle = s.glow; c.lineWidth = 10; c.stroke(); }
  if (s.edge) { c.strokeStyle = s.edge; c.lineWidth = s.w + 3; c.stroke(); }
  c.strokeStyle = s.col; c.lineWidth = s.w; c.stroke();
}

// power-up icons, drawn in a 44px box: the shield is a blue crest with a small plane, the magnet a horseshoe
function paintPowerIcon(c, id) {
  c.translate(22, 22);
  if (id === 'superstar') {                     // a shining five-pointed star
    c.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 16, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r + 1); }
    c.closePath(); c.fillStyle = '#ffd23f'; c.fill();
    c.strokeStyle = COL.ink; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(-4, -3, 3, 5, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ff6fa8'; for (const [x, y] of [[-17, -12], [16, -14], [15, 13]]) { c.beginPath(); c.arc(x, y, 1.8, 0, Math.PI * 2); c.fill(); }
  } else if (id === 'slowmo') {                        // an hourglass
    c.fillStyle = '#efe6ff'; c.strokeStyle = COL.ink; c.lineWidth = 2; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-10, -14); c.lineTo(10, -14); c.lineTo(1.5, 0); c.lineTo(10, 14); c.lineTo(-10, 14); c.lineTo(-1.5, 0); c.closePath();
    c.fill(); c.stroke();
    c.fillStyle = '#e0b84a';                       // sand: a little left on top, a pile below
    c.beginPath(); c.moveTo(-5, -7); c.lineTo(5, -7); c.lineTo(0.5, -1.5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0, 6); c.lineTo(8, 13); c.lineTo(-8, 13); c.closePath(); c.fill();
    c.fillStyle = '#8a4fc2'; c.fillRect(-13, -17, 26, 4); c.fillRect(-13, 13, 26, 4);
  } else if (id === 'boost') {                         // a cartoon running shoe with speed lines
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.fillStyle = '#ffffff'; c.strokeStyle = COL.ink; c.lineWidth = 2;
    c.beginPath(); roundRectPath(-12, 5, 30, 7, 3.5); c.fill(); c.stroke();                       // sole
    c.fillStyle = '#e2493b';
    c.beginPath();
    c.moveTo(-12, 6); c.lineTo(-12, -6); c.quadraticCurveTo(-12, -12, -6, -12);                    // heel
    c.lineTo(-1, -11); c.lineTo(3, -4);                                                           // collar, down the tongue
    c.quadraticCurveTo(12, -2, 17, 3); c.lineTo(17, 6); c.closePath();                            // toe
    c.fill(); c.stroke();
    c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(-6, -2, 3.2, 4.2, 0.2, 0, Math.PI * 2); c.fill();   // white swoosh patch
    c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; c.beginPath();                                  // laces
    for (const [x, y] of [[2, -6], [5, -4], [8, -2.8]]) { c.moveTo(x - 2, y - 1.5); c.lineTo(x + 2, y + 1.5); }
    c.stroke();
    c.strokeStyle = COL.ink; c.lineWidth = 2; c.beginPath();                                       // speed lines
    c.moveTo(-21, -6); c.lineTo(-16, -6); c.moveTo(-22, 0); c.lineTo(-16, 0); c.moveTo(-21, 6); c.lineTo(-16, 6);
    c.stroke();
  } else if (id === 'shield') {
    c.beginPath();
    c.moveTo(-13, -11); c.lineTo(0, -16); c.lineTo(13, -11); c.lineTo(12, 2);
    c.quadraticCurveTo(9, 12, 0, 17); c.quadraticCurveTo(-9, 12, -12, 2); c.closePath();
    c.fillStyle = '#2f8fe0'; c.fill();
    c.strokeStyle = COL.ink; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke();
    c.save(); c.translate(0, 0.5); c.scale(0.5, 0.5); paintPlane(c, 0); c.restore();
  } else {
    // horseshoe magnet with silver tips, scaled so the whole shape sits inside the 44px icon
    c.translate(0, 3); c.rotate(0.55); c.scale(0.72, 0.72);
    const arm = y2 => {
      c.beginPath();
      c.arc(0, -6, 12, Math.PI, 0, false);
      c.moveTo(-12, -6); c.lineTo(-12, y2); c.moveTo(12, -6); c.lineTo(12, y2);
    };
    c.lineCap = 'butt';
    c.strokeStyle = COL.ink; c.lineWidth = 13; arm(16); c.stroke();
    c.strokeStyle = '#d9443a'; c.lineWidth = 9.5; arm(7); c.stroke();
    c.strokeStyle = '#c3c9d3';
    c.beginPath(); c.moveTo(-12, 7); c.lineTo(-12, 15); c.moveTo(12, 7); c.lineTo(12, 15); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2;   // shine along the curve
    c.beginPath(); c.arc(0, -6, 14, Math.PI * 1.15, Math.PI * 1.5, false); c.stroke();
  }
}
// a power-up pickup: its icon in a round white badge with a coloured rim, gently pulsing
function drawPower(p, sy) {
  const s = sharedSprite('power-' + p.kind, 48, 48, 24, 24, () => {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = POWER_RIMS[p.kind]; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.translate(-22, -22); paintPowerIcon(ctx, p.kind); ctx.restore();
  });
  const k = 1 + 0.07 * Math.sin(p.spin * 2.5);
  blit(s, p.x, sy, 0, k, k);
}

function drawPlane(x, y, ang) {

  ctx.save(); ctx.translate(x, y); ctx.rotate(-ang);
  if (plane.invuln > 0) ctx.globalAlpha = Math.floor(plane.invuln * 12) % 2 ? 0.3 : 1;
  if (plane.star > 0) {                          // invincible: a rainbow outline cycling through the colours
    const fading = plane.star < 1.5 && Math.floor(plane.star * 8) % 2;   // flickers just before it ends
    planeOutline(ctx); ctx.lineJoin = 'round';
    ctx.strokeStyle = `hsla(${(performance.now() * 0.6) % 360},95%,60%,${fading ? 0.3 : 0.55})`; ctx.lineWidth = 12; ctx.stroke();
    ctx.strokeStyle = `hsl(${(performance.now() * 0.6 + 120) % 360},95%,60%)`; ctx.lineWidth = 4.5; ctx.stroke();
  } else if (plane.lives > 0) paintLifeOutline(ctx, plane.lives);
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

// the magnet ring is a shade of the map colour behind the plane: darker on light pages, lighter on dark ones
const ringCache = new Map();
function ringColour(hex) {
  let c = ringCache.get(hex);
  if (!c) {
    const n = parseInt(hex.slice(1), 16), dark = isDark(hex);
    const mix = v => Math.round(dark ? v + (255 - v) * 0.55 : v * 0.6);
    c = `rgba(${mix(n >> 16)},${mix((n >> 8) & 255)},${mix(n & 255)},.7)`;
    ringCache.set(hex, c);
  }
  return c;
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
    if (o.dungeon) { drawDungeonObstacle(o, sy); continue; }
    switch (o.type) {
      case 'gate': {
        const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
        if (o.sea) { drawCoral(-10, l, sy, l, -1, o.seaCol); drawCoral(r, W + 10, sy, r, 1, o.seaCol); break; }
        if (o.space) { drawGirder(-10, l, sy, l, -1, o.spaceCol); drawGirder(r, W + 10, sy, r, 1, o.spaceCol); break; }
        drawRuler(-10, l, sy, l, -1, o.pal);
        drawRuler(r, W + 10, sy, r, 1, o.pal);
        break;
      }
      case 'erasers': {
        const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
        if (o.sea) { drawClam(-10, l, sy, l, -1, o.seaCol); drawClam(r, W + 10, sy, r, 1, o.seaCol); break; }
        if (o.space) { drawAirlock(-10, l, sy, l, -1, o.spaceCol); drawAirlock(r, W + 10, sy, r, 1, o.spaceCol); break; }
        drawEraser(-10, l, sy, l, -1, o.pal);
        drawEraser(r, W + 10, sy, r, 1, o.pal);
        break;
      }
      case 'pencil': o.space ? (o.look === 'iss' ? drawISS(o, sy) : drawGPS(o, sy)) : drawPencil(o, sy); break;
      case 'scissors': drawScissors(o, sy); break;
      case 'blot': o.space ? (o.look === 'blackhole' ? drawBlackHole(o, sy) : drawAsteroid(o, sy)) : o.sea ? drawUrchin(o, sy) : drawBlot(o, sy); break;
      case 'starfish': o.space ? drawTumbler(o, sy) : drawStarfish(o, sy); break;
      case 'zap': o.space ? drawLaser(o, sy) : drawZap(o, sy); break;
      case 'mine': drawMine(o, sy); break;
      case 'bubbles': o.space ? drawLowGrav(o, sy) : drawBubbleColumn(o, sy); break;
      case 'protractor': o.space ? (o.look === 'planet' ? drawPlanetEdge(o, sy) : o.look === 'station' ? drawBattleStation(o, sy) : drawMoonEdge(o, sy)) : drawProtractor(o, sy); break;
      case 'wad': o.space ? drawRocket(o, sy) : drawWad(o, sy); break;
      case 'clips': for (const x of clipXs(o)) o.space ? drawStarlink(x, sy) : drawClip(x, sy, o.col); break;
      case 'compass': o.space ? drawRobotArm(o, sy) : drawCompass(o, sy); break;
      case 'fan': drawFan(o, sy); break;
      case 'glue': o.space ? drawFighter(o, sy) : o.sea ? drawSub(o, sy) : drawGlue(o, sy); break;
      case 'cutter': o.space ? drawProbe(o, sy) : o.sea ? drawMoray(o, sy) : drawCutter(o, sy); break;
      case 'note': o.space ? drawIce(o, sy) : o.sea ? drawJelly(o, sy) : drawNote(o, sy); break;
      case 'setsquare': drawSetSquare(o, sy); break;
      case 'band': drawBand(o, sy); break;
      case 'paw': o.space ? drawEnergyBlade(o, sy) : o.sea ? drawKelp(o, sy) : drawPaw(o, sy); break;
    }
  }
  for (const p of pickups) p.kind ? drawPower(p, p.y - dist) : drawStar(p, p.y - dist);

  const py = planeScreenY();
  if (plane.magnet > 0 && plane.alive && state === 'play') {     // dotted ring showing the magnet's reach
    ctx.save();
    ctx.strokeStyle = ringColour(pageColor(pageIndexAt(dist + py))); ctx.lineWidth = 1.8; ctx.setLineDash([3, 7]);
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
  for (const f of floaters) {
    ctx.font = `700 ${f.size || 18}px Kalam, cursive`;
    ctx.globalAlpha = clamp(f.life, 0, 1);
    ctx.fillStyle = f.col || '#a8740f';
    // power-ups and shield saves follow the plane, just under it; milestones, medals and stars stay where they happened
    const x = f.follow ? clamp(plane.x, 90, W - 90) : f.x;
    const y = f.follow ? planeScreenY() + 52 + (1 - f.life) * 14 : f.y - dist - (1 - f.life) * 40;
    if (darkPage) {                              // a light outline keeps the coloured text readable on dark maps
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = f.size > 30 ? 5 : 4; ctx.lineJoin = 'round'; ctx.strokeText(f.text, x, y);
    }
    ctx.fillText(f.text, x, y);
  }
  ctx.globalAlpha = 1;
  if (plane.slowmo > 0 && state === 'play') { ctx.fillStyle = 'rgba(150,110,230,.10)'; ctx.fillRect(0, 0, W, H); }   // slow motion: a soft purple tint
  if (state === 'play') {
    // time left for each running timed power-up: bars stacked above the plane, each shrinking toward its centre
    let barY = planeScreenY() - 34;
    for (const [left, total, kind] of [[plane.slowmo, SLOWMO_TIME, 'slowmo'], [plane.star, STAR_TIME, 'superstar'], [plane.boost, BOOST_TIME, 'boost']]) {
      if (left <= 0) continue;
      const w = 110 * left / total;
      ctx.fillStyle = POWER_RIMS[kind]; ctx.beginPath(); roundRectPath(plane.x - w / 2, barY, w, 6, 3); ctx.fill();
      barY -= 10;
    }
  }
  if (flash > 0 && !reduceMotion) {           // milestone flash over the whole playfield
    ctx.fillStyle = `rgba(${flashCol},${(flash * 0.6).toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
  }
  syncHudPage();
}

// chevrons in the bottom corners show which way the plane is drifting

// switch the background between maps (the world's CSS class picks the ruling pattern)
function applyMap() {
  world.classList.toggle('map-sea', mapId === 'sea');
  world.classList.toggle('map-space', mapId === 'space');
  world.classList.toggle('map-dungeon', mapId === 'dungeon');
  best = bests[mapId];
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
