// Paper Nosedive — Art for the Paper map obstacles.
'use strict';

function inkStroke(w = 1.3) { ctx.strokeStyle = COL.ink; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }

// a ruler is a pre-painted strip (face, edge band, ticks, numbers) measured from its inner end;
// each frame just shows as much of the strip as the ruler is long
const RULER_LEN = 470;
function rulerStrip(p, outDir) {
  return sharedSprite('ruler' + outDir + palKey(p), RULER_LEN, 24, outDir > 0 ? 0 : RULER_LEN, 12, () => {
    const xa = outDir > 0 ? 0 : -RULER_LEN;
    ctx.fillStyle = p.face; ctx.fillRect(xa, -11, RULER_LEN, 22);
    ctx.fillStyle = p.edge; ctx.fillRect(xa, 6, RULER_LEN, 5);
    ctx.strokeStyle = p.mark; ctx.lineWidth = 1; ctx.fillStyle = p.mark;
    ctx.font = '9px Kalam, cursive'; ctx.textAlign = 'center';
    ctx.beginPath();
    for (let t = 4, i = 0; t < RULER_LEN; t += 6, i++) {
      const x = outDir * t;
      const len = i % 10 === 0 ? 9 : (i % 5 === 0 ? 6 : 3.5);
      ctx.moveTo(x, -11); ctx.lineTo(x, -11 + len);
      if (i % 10 === 0 && i > 0) ctx.fillText(String(i / 10), x, 5);
    }
    ctx.stroke();
  });
}
function drawRuler(x0, x1, sy, innerX, outDir, p = PALETTES.gate[0]) {
  const len = Math.min(x1 - x0, RULER_LEN);
  if (len < 1) return;
  const s = rulerStrip(p, outDir), r = spriteRes;
  // crop the strip from its inner end: the left end for rulers pointing right, the right end otherwise
  const srcX = outDir > 0 ? 0 : (RULER_LEN - len) * r;
  const dstX = outDir > 0 ? innerX : innerX - len;
  ctx.drawImage(s.c, srcX, 0, len * r, s.c.height, dstX, sy - 12, len, 24);
  ctx.beginPath(); ctx.rect(x0, sy - 11, x1 - x0, 22); inkStroke(1.4);
}

function drawEraser(x0, x1, sy, innerX, outDir, p = PALETTES.erasers[0]) {
  if (x1 - x0 < 1) return;
  ctx.fillStyle = p.rub;
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fill();
  ctx.fillStyle = p.shade; ctx.fillRect(x0, sy + 8, x1 - x0, 6);
  // paper sleeve a little back from the inner (rubbing) end
  const s0 = innerX + outDir * 26, s1 = innerX + outDir * 120;
  const a = Math.max(x0, Math.min(s0, s1)), b = Math.min(x1, Math.max(s0, s1));
  if (b > a) {
    ctx.fillStyle = p.sleeve; ctx.fillRect(a, sy - 14, b - a, 28);
    ctx.fillStyle = '#fbf9f1'; ctx.font = '700 12px Kalam, cursive'; ctx.textAlign = 'center';
    if (b - a > 60) ctx.fillText('ERASER', (a + b) / 2, sy + 5);
  }
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); inkStroke(1.4);
}

function paintPencil(o, sy) {
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.a);
  if (o.vx < 0) ctx.scale(-1, 1);
  const L = o.len / 2, h = 6.5;
  const p = o.pal || PALETTES.pencil[0];
  // eraser + ferrule
  ctx.fillStyle = p.tip; ctx.fillRect(-L, -h, 12, h * 2);
  ctx.fillStyle = '#b9bec6'; ctx.fillRect(-L + 12, -h, 11, h * 2);
  // body facets
  ctx.fillStyle = p.light; ctx.fillRect(-L + 23, -h, o.len - 49, h * 0.66);
  ctx.fillStyle = p.mid; ctx.fillRect(-L + 23, -h + h * 0.66, o.len - 49, h * 0.68);
  ctx.fillStyle = p.dark; ctx.fillRect(-L + 23, h - h * 0.66, o.len - 49, h * 0.66);
  // wood cone & graphite
  ctx.fillStyle = '#ecc99a';
  ctx.beginPath(); ctx.moveTo(L - 26, -h); ctx.lineTo(L, 0); ctx.lineTo(L - 26, h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath(); ctx.moveTo(L - 9, -h * 0.35); ctx.lineTo(L, 0); ctx.lineTo(L - 9, h * 0.35); ctx.closePath(); ctx.fill();
  // outline
  ctx.beginPath(); ctx.moveTo(-L, -h); ctx.lineTo(L - 26, -h); ctx.lineTo(L, 0); ctx.lineTo(L - 26, h); ctx.lineTo(-L, h); ctx.closePath();
  ctx.moveTo(-L + 12, -h); ctx.lineTo(-L + 12, h);
  ctx.moveTo(-L + 23, -h); ctx.lineTo(-L + 23, h);
  ctx.moveTo(L - 26, -h); ctx.lineTo(L - 26, h);
  ctx.moveTo(-L + 15, -h); ctx.lineTo(-L + 15, h); ctx.moveTo(-L + 19, -h); ctx.lineTo(-L + 19, h);
  inkStroke(1.2);
  ctx.restore();
}

// scissors: curved steel blades with a bevelled cutting edge, chunky plastic handles, brass pivot
function bladePath() {
  ctx.beginPath();
  ctx.moveTo(-4, -5);
  ctx.quadraticCurveTo(38, -7, 67, 0);   // curved back of the blade
  ctx.lineTo(-4, 4);                      // straight cutting edge
  ctx.closePath();
}
function handlePath(oval) {
  ctx.beginPath();
  if (oval) ctx.ellipse(-23, 0, 12.5, 8.5, 0, 0, Math.PI * 2);   // finger loop
  else ctx.arc(-21, 0, 9.5, 0, Math.PI * 2);                    // thumb loop
}
// each half of the scissors (blade + handle) is a sprite; only the two angles change per frame
function scissorHalf(col, s) {
  return sharedSprite('scissor' + s + col, 116, 30, 44, 15, () => {
    const g = ctx.createLinearGradient(0, -6, 0, 5);
    g.addColorStop(0, '#f1f3f7'); g.addColorStop(0.55, s < 0 ? '#c4cad4' : '#b3bac6'); g.addColorStop(1, '#8e97a5');
    ctx.fillStyle = g; bladePath(); ctx.fill(); inkStroke(1.1);
    ctx.beginPath(); ctx.moveTo(2, 2.4); ctx.lineTo(60, 0.6);
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1; ctx.stroke();       // bevel glint
    // plastic neck and loop
    ctx.fillStyle = col;
    ctx.beginPath(); roundRectPath(-14, -4, 13, 8, 3); ctx.fill(); inkStroke(1.1);
    handlePath(s > 0);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 8.5; ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.stroke();   // plastic sheen
  });
}
function drawScissors(o, sy) {
  const col = o.col || '#f07f1e';
  for (const s of [-1, 1]) blit(scissorHalf(col, s), o.x, sy, o.rot + s * o.open / 2);
  // brass pivot screw
  ctx.fillStyle = '#c9a54a'; ctx.beginPath(); ctx.arc(o.x, sy, 4, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
  ctx.save(); ctx.translate(o.x, sy); ctx.rotate(o.rot);
  ctx.beginPath(); ctx.moveTo(-2.5, 0); ctx.lineTo(2.5, 0); inkStroke(1.2);
  ctx.restore();
}

function paintBlot(o, sy) {
  ctx.save(); ctx.translate(o.x, sy);
  ctx.fillStyle = (o.pal || PALETTES.blot[0]).ink;
  ctx.globalAlpha = 0.93;
  ctx.beginPath(); ctx.arc(0, 0, o.r * 0.8, 0, Math.PI * 2); ctx.fill();
  for (const b of o.bumps) {
    ctx.beginPath(); ctx.arc(Math.cos(b.t) * b.d, Math.sin(b.t) * b.d, b.r, 0, Math.PI * 2); ctx.fill();
  }
  for (const d of o.drops) { ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.beginPath(); ctx.ellipse(-o.r * 0.3, -o.r * 0.35, o.r * 0.28, o.r * 0.14, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawTack(o, sy) {
  ctx.fillStyle = o.col;
  ctx.beginPath(); ctx.arc(o.x, sy, o.r, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath(); ctx.arc(o.x, sy, o.r * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath(); ctx.arc(o.x - 3, sy - 3, 2.2, 0, Math.PI * 2); ctx.fill();
}

function paintStar(p, sy) {
  ctx.save(); ctx.translate(p.x, sy); ctx.rotate(Math.sin(p.spin) * 0.35);
  const path = () => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 5 : 11.5, a = -Math.PI / 2 + i * Math.PI / 5;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  };
  ctx.fillStyle = '#f2b53a'; path(); ctx.fill();
  ctx.strokeStyle = '#a8740f'; ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.beginPath(); ctx.arc(-3, -3, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function paintProtractor(o, sy) {
  const cx = o.side < 0 ? 0 : W, a0 = o.side < 0 ? -Math.PI / 2 : Math.PI / 2;
  const GEO = o.pal || PALETTES.protractor[0];
  ctx.fillStyle = GEO.fill;
  ctx.beginPath(); ctx.arc(cx, sy, o.r, a0, a0 + Math.PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = GEO.edge; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, sy, o.r * 0.58, a0, a0 + Math.PI);
  ctx.strokeStyle = GEO.mark; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = COL.paper;
  ctx.beginPath(); ctx.arc(cx, sy, 7, a0, a0 + Math.PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = GEO.edge; ctx.lineWidth = 1; ctx.stroke();
  ctx.save();
  ctx.fillStyle = GEO.mark; ctx.strokeStyle = GEO.mark; ctx.lineWidth = 1;
  ctx.font = '700 8px Kalam, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.beginPath();
  for (let i = 1; i < 18; i++) {           // degree ticks every 10°, labels every 30°
    const a = a0 + i * Math.PI / 18, c = Math.cos(a), s = Math.sin(a), len = i % 3 === 0 ? 9 : 5;
    ctx.moveTo(cx + c * o.r, sy + s * o.r); ctx.lineTo(cx + c * (o.r - len), sy + s * (o.r - len));
    if (i % 3 === 0) ctx.fillText(String(i * 10), cx + c * (o.r - 17), sy + s * (o.r - 17));
  }
  ctx.stroke();
  ctx.restore();
}

// a spinning set square in the same green plastic, with the usual triangular cut-out
function drawSetSquare(o, sy) {
  const GEO = o.pal || PALETTES.setsquare[0];
  const tri = (k, dx = 0, dy = 0) => {
    o.verts.forEach(([x, y], i) => (i ? ctx.lineTo(x * k + dx, y * k + dy) : ctx.moveTo(x * k + dx, y * k + dy)));
    ctx.closePath();
  };
  const R = o.R + 4;
  const body = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); tri(1); tri(0.42);
    ctx.fillStyle = GEO.fill; ctx.fill('evenodd');
    ctx.strokeStyle = GEO.edge; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke();
    // centimetre ticks along the bottom leg (from the right angle along +x)
    const [x0, y0] = o.verts[0], [x1] = o.verts[1];
    ctx.strokeStyle = GEO.mark; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = x0 + 6, i = 1; x < x1 - 10; x += 6, i++) {
      ctx.moveTo(x, y0); ctx.lineTo(x, y0 - (i % 5 === 0 ? 8 : 4));
    }
    ctx.stroke();
  });
  blit(body, o.x, sy, o.rot);
}

function drawWad(o, sy) {
  const R = o.r * 1.15 + 3;
  const s = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    ctx.fillStyle = (o.pal || PALETTES.wad[0]).paper;
    ctx.beginPath();
    o.pts.forEach((k, i) => {
      const a = i / o.pts.length * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * o.r * k, Math.sin(a) * o.r * k);
    });
    ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.beginPath();
    for (const [x1, y1, x2, y2] of o.creases) { ctx.moveTo(x1 * o.r, y1 * o.r); ctx.lineTo(x2 * o.r, y2 * o.r); }
    inkStroke(0.8);
  });
  blit(s, o.x, sy, o.rot);
}

function roundRectPath(x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintClip(x, sy, col) {
  ctx.save(); ctx.translate(x, sy);
  for (const [dx, dy, w, c] of [[0, 0, 4, COL.ink], [0, 0, 2.2, col]]) {
    ctx.beginPath();
    roundRectPath(-17 + dx, -6 + dy, 34, 12, 6);
    roundRectPath(-12 + dx, -3 + dy, 25, 6, 3);
    ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke();
  }
  ctx.restore();
}

function drawCompass(o, sy) {
  const dir = o.spin > 0 ? 1 : -1, L = o.L;
  ctx.save();
  // the circle it has pencilled so far
  ctx.strokeStyle = 'rgba(85,88,94,.45)'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(o.x, sy, L, o.a0, o.a0 + dir * o.swept, dir < 0); ctx.stroke();
  ctx.restore();
  const p = o.pal || PALETTES.compass[0];
  const arm = ownSprite(o, 'spr', L + 14, 20, 10, 10, () => {
    ctx.fillStyle = p.leg;
    ctx.beginPath(); ctx.moveTo(0, -4.5); ctx.lineTo(L - 16, -2.5); ctx.lineTo(L - 16, 2.5); ctx.lineTo(0, 4.5); ctx.closePath();
    ctx.fill(); inkStroke(1.2);
    // pencil stub held at the end of the leg
    ctx.fillStyle = '#f4c430'; ctx.fillRect(L - 16, -3, 9, 6);
    ctx.fillStyle = '#ecc99a'; ctx.beginPath(); ctx.moveTo(L - 7, -3); ctx.lineTo(L, 0); ctx.lineTo(L - 7, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.moveTo(L - 3, -1.2); ctx.lineTo(L, 0); ctx.lineTo(L - 3, 1.2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.rect(L - 16, -3, 9, 6); ctx.moveTo(L - 7, -3); ctx.lineTo(L, 0); ctx.lineTo(L - 7, 3); inkStroke(1);
    // hinge over the needle
    ctx.fillStyle = p.hinge; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = p.cap; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
  });
  blit(arm, o.x, sy, o.ang);
}

function drawFan(o, sy) {
  const cx = o.side < 0 ? 0 : W, dir = -o.side;
  // the wind band: gusts travelling away from the fan (no full-width tint, which costs a large blended fill)
  ctx.save();
  ctx.strokeStyle = o.sea ? 'rgba(225,245,255,.6)' : 'rgba(90,130,190,.6)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 6;
    const run = (o.t * 170 + k * 71) % (W + 60);
    const x0 = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + dir * 18, yy - 5, x0 + dir * 36, yy); ctx.stroke();
    if (o.sea) {                     // little swirls riding the current
      ctx.beginPath(); ctx.arc(x0 + dir * 46, yy - 2, 3.5, 0, Math.PI * 1.5); ctx.stroke();
    }
  }
  ctx.restore();
  if (o.sea) return;                 // an ocean current: just moving water, no fan
  // the fan, half off the page edge: a still body plus a spinning blade sprite
  const p = o.pal || PALETTES.fan[0], k = palKey(p);
  const body = sharedSprite('fanBody' + k, 64, 68, 30, 30, () => {
    ctx.fillStyle = p.body; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
  });
  const blades = sharedSprite('fanBlades' + k, 52, 52, 26, 26, () => {
    ctx.fillStyle = p.blade;
    for (let b = 0; b < 3; b++) {
      ctx.rotate(Math.PI * 2 / 3);
      ctx.beginPath(); ctx.ellipse(12, 0, 11, 5.5, 0.3, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
    }
    ctx.fillStyle = p.hub; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
  });
  blit(body, cx, sy);
  blit(blades, cx, sy, o.blade);
}

// edge-mounted tools draw in a frame where +x points from their wall into the page
function toolFrame(o, sy) {
  ctx.translate(wallX(o), sy);
  ctx.scale(inward(o), 1);
}

function drawGlue(o, sy) {
  // blobs in flight
  for (const b of o.blobs) {
    const sx = 1 + Math.sin(b.wob) * 0.12;
    ctx.fillStyle = '#fbfbf7';
    ctx.beginPath(); ctx.ellipse(b.x, sy, b.r * sx, b.r / sx, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(110,120,140,.9)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(160,190,230,.7)';
    ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, sy - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
  }
  // the tube is pre-painted per colour and edge; squeezing just squashes the sprite vertically
  const p = o.pal || PALETTES.glue[0], dir = inward(o);
  const tube = sharedSprite('glue' + dir + palKey(p), 168, 34, 84, 14, () => {
    ctx.scale(dir, 1);
    // nozzle
    ctx.fillStyle = '#f4f2ea';
    ctx.beginPath(); ctx.moveTo(60, -7); ctx.lineTo(78, -3); ctx.lineTo(78, 3); ctx.lineTo(60, 7); ctx.closePath();
    ctx.fill(); inkStroke(1.2);
    // body with a printed label and a crimped end at the wall
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); roundRectPath(-4, -11, 66, 22, 5); ctx.fill();
    ctx.fillStyle = p.label; ctx.fillRect(16, -11, 30, 22);
    ctx.beginPath(); roundRectPath(-4, -11, 66, 22, 5); inkStroke(1.3);
    ctx.beginPath();
    for (let x = 2; x < 12; x += 3) { ctx.moveTo(x, -11); ctx.lineTo(x, 11); }
    inkStroke(0.8);
    ctx.translate(31, 0); ctx.scale(dir, 1);       // keep the label readable on either edge
    ctx.fillStyle = '#ffffff'; ctx.font = '700 10px Kalam, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('GLUE', 0, 1);
  });
  blit(tube, wallX(o), sy, 0, 1, 1 - 0.18 * o.squeeze);   // squeezed on every squirt
}

function drawCutter(o, sy) {
  ctx.save();
  toolFrame(o, sy);
  const h = CUTTER_HANDLE, e = o.ext;
  if (e > 1) {
    // snap-off blade with its score lines and angled tip
    ctx.fillStyle = '#cfd5de';
    ctx.beginPath(); ctx.moveTo(h - 10, -6); ctx.lineTo(h + e, -6); ctx.lineTo(h + e - 10, 6); ctx.lineTo(h - 10, 6); ctx.closePath();
    ctx.fill(); inkStroke(1.2);
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(120,130,145,.8)'; ctx.lineWidth = 0.9; ctx.beginPath();
    for (let x = h + 4; x < h + e; x += 12) { ctx.moveTo(x, -6); ctx.lineTo(x - 7, 6); }
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  // handle, pre-painted per colour and edge
  const p = o.pal || PALETTES.cutter[0], dir = inward(o);
  const handle = sharedSprite('cutter' + dir + palKey(p), 180, 34, 90, 17, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = p.handle;
    ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 6); ctx.fill(); inkStroke(1.4);
    ctx.beginPath();
    for (let x = 6; x < 34; x += 5) { ctx.moveTo(x, -8); ctx.lineTo(x, 8); }
    inkStroke(0.9);
    ctx.fillStyle = p.slider;                       // slider button
    ctx.beginPath(); roundRectPath(h - 30, -15, 14, 7, 2); ctx.fill(); inkStroke(1);
  });
  blit(handle, wallX(o), sy);
}


function paintNote(o, sy) {
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.rot);
  ctx.fillStyle = o.col; ctx.fillRect(-22, -22, 44, 44);
  ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.fillRect(-22, -22, 44, 9);       // sticky strip
  ctx.fillStyle = 'rgba(255,255,255,.35)';                                 // curled corner
  ctx.beginPath(); ctx.moveTo(22, 12); ctx.lineTo(22, 22); ctx.lineTo(12, 22); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.rect(-22, -22, 44, 44); inkStroke(1.1);
  ctx.strokeStyle = 'rgba(85,88,94,.55)'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, -3); ctx.lineTo(-14 + 28 * o.scribble, -3);
  ctx.moveTo(-14, 5); ctx.lineTo(10, 5);
  ctx.moveTo(-14, 13); ctx.lineTo(-14 + 22 * o.scribble, 13);
  ctx.stroke();
  ctx.restore();
}


function drawBand(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y;
  // the band wobbles after a hit: bend it at the hit point, perpendicular to its length
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9);
  const bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend;
  ctx.save();
  ctx.lineCap = 'round';
  for (const off of [-2, 2]) {             // two strands of the loop
    ctx.strokeStyle = o.col; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1 + off); ctx.quadraticCurveTo(cx, cy + off, o.x2, sy + dy2 + off); ctx.stroke();
  }
  ctx.restore();
  drawTack({ x: o.x1, r: 9, col: '#8d939e' }, sy + dy1);
  drawTack({ x: o.x2, r: 9, col: '#8d939e' }, sy + dy2);
}

function drawPaw(o, sy) {
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'warn') {                // dashed outline of the wedge the paw is about to swing through
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = `rgba(200,60,40,${0.3 + 0.55 * k})`; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    // furry arm with stripes
    ctx.fillStyle = o.col;
    ctx.beginPath(); roundRectPath(-20, -11, len + 6, 22, 10); ctx.fill(); inkStroke(1.3);
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = 6; x < len - 24; x += 18) { ctx.moveTo(x, -9); ctx.lineTo(x + 5, 0); }
    ctx.stroke();
    // the paw: round pad, pink beans, claws out while swiping
    ctx.translate(len, 0);
    if (o.phase === 'swipe') {
      ctx.fillStyle = '#fbfbf7';
      for (const a of [-0.6, -0.2, 0.2, 0.6]) {
        ctx.save(); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(16, -2.5); ctx.lineTo(27, 0); ctx.lineTo(16, 2.5); ctx.closePath(); ctx.fill(); inkStroke(0.8);
        ctx.restore();
      }
    }
    ctx.fillStyle = o.col;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#f2a1b0';
    ctx.beginPath(); ctx.ellipse(-3, 0, 6.5, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    for (const a of [-0.9, -0.3, 0.3, 0.9]) {
      ctx.beginPath(); ctx.arc(Math.cos(a) * 11, Math.sin(a) * 11, 3.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// ---------- sprite-backed versions of rigid obstacles ----------
// Each paints the original drawing once at the origin (unrotated), then blits it with the live transform.
function drawPencil(o, sy) {
  const L = o.len / 2;
  const s = ownSprite(o, 'spr', o.len + 12, 26, L + 3, 10, () => paintPencil({ ...o, x: 0, a: 0, vx: 1 }, 0));
  blit(s, o.x, sy, o.a, o.vx < 0 ? -1 : 1);
}
function drawBlot(o, sy) {
  const R = o.r * 1.85 + 6;
  blit(ownSprite(o, 'spr', R * 2, R * 2, R, R, () => paintBlot({ ...o, x: 0 }, 0)), o.x, sy);
}
function drawStar(p, sy) {
  blit(sharedSprite('star', 32, 32, 14, 14, () => paintStar({ x: 0, spin: 0 }, 0)), p.x, sy, Math.sin(p.spin) * 0.35);
}
function drawProtractor(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 8;
  const s = ownSprite(o, 'spr', R * 2, R * 2 + 4, R, R - 2, () => { ctx.translate(-cx, 0); paintProtractor(o, 0); });
  blit(s, cx, sy);
}
// origami figures (Origami collection, v102): sticky-note variants on the Paper map, inside its 42-unit square.
// Each is a few flat paper facets in a light, a mid and a dark tone with an ink outline.
const ORIGAMI_COLS = {
  crane: ['#fbe9ef', '#f2c0d0', '#e094ad'], frog: ['#d3eebf', '#9fd387', '#6fb35d'], boat: ['#dbeaf8', '#a9cdf0', '#6fa7de'],
  star: ['#fff4b8', '#fde27a', '#efc04a'], fox: ['#ffd8b0', '#f7a35a', '#e07a2a'], butterfly: ['#ebdcfa', '#c9a8f0', '#9a6fd8']
};
function paintOrigami(name) {
  const [lt, md, dk] = ORIGAMI_COLS[name] || ORIGAMI_COLS.crane;
  const facet = (col, pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); inkStroke(1.5); };
  // the shorter figures are stretched to fill the square they collide as
  const FIT = { crane: [4, 1.35], frog: [3, 1.4], boat: [3, 1.25], butterfly: [0, 1.3] }[name];
  ctx.save(); if (FIT) { ctx.translate(0, FIT[0]); ctx.scale(1, FIT[1]); }
  if (name === 'crane') {
    facet(dk, [[-18, 0], [0, 10], [18, 0], [0, 4]]);                    // body
    facet(lt, [[-3, 3], [-13, -19], [-1, -2]]);                          // wings up
    facet(md, [[3, 3], [13, -19], [1, -2]]);
    facet(md, [[-13, 2], [-20, -11], [-17, -13], [-10, 0]]);             // neck and head
    facet(lt, [[13, 2], [20, -9], [17, -1]]);                            // tail
  } else if (name === 'frog') {
    facet(md, [[-14, 12], [14, 12], [10, -4], [-10, -4]]);               // body
    facet(lt, [[-10, -4], [0, -16], [10, -4]]);                          // head
    facet(dk, [[-14, 12], [-21, 5], [-11, 2]]); facet(dk, [[14, 12], [21, 5], [11, 2]]);   // back legs
    ctx.fillStyle = '#ffffff'; for (const x of [-5, 5]) { ctx.beginPath(); ctx.arc(x, -8, 2.6, 0, Math.PI * 2); ctx.fill(); inkStroke(1); }
    ctx.fillStyle = COL.ink; for (const x of [-5, 5]) { ctx.beginPath(); ctx.arc(x, -8, 1.1, 0, Math.PI * 2); ctx.fill(); }
  } else if (name === 'boat') {
    facet(md, [[-20, 2], [20, 2], [13, 14], [-13, 14]]);                 // hull
    facet(lt, [[-12, 2], [0, -18], [0, 2]]); facet(dk, [[0, 2], [0, -18], [12, 2]]);   // sail, folded down the middle
  } else if (name === 'star') {
    const p = i => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 8 : 20; return [Math.cos(a) * r, Math.sin(a) * r + 1]; };
    for (let i = 0; i < 10; i++) facet(i % 2 ? md : lt, [[0, 1], p(i), p(i + 1)]);   // ten facets around the centre
  } else if (name === 'fox') {
    facet(md, [[-18, -10], [18, -10], [0, 16]]);                         // face
    facet(dk, [[-18, -10], [-13, -21], [-6, -10]]); facet(dk, [[18, -10], [13, -21], [6, -10]]);   // ears
    facet(lt, [[-18, -10], [-6, -10], [-4, 4]]); facet(lt, [[18, -10], [6, -10], [4, 4]]);   // white cheeks
    ctx.fillStyle = COL.ink; for (const x of [-6, 6]) { ctx.beginPath(); ctx.arc(x, -4, 1.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 13, 1.8, 0, Math.PI * 2); ctx.fill();
  } else {                                                               // butterfly
    facet(lt, [[0, -1], [-20, -15], [-14, 4]]); facet(lt, [[0, -1], [20, -15], [14, 4]]);   // upper wings
    facet(md, [[0, 0], [-16, 6], [-6, 16]]); facet(md, [[0, 0], [16, 6], [6, 16]]);         // lower wings
    facet(dk, [[-2, -10], [2, -10], [2, 12], [-2, 12]]);                 // body
  }
  ctx.restore();
}
function drawNote(o, sy) {
  if (o.origami) { blit(sharedSprite('origami-' + o.origami, 48, 48, 24, 24, () => paintOrigami(o.origami)), o.x, sy, o.rot); return; }
  blit(ownSprite(o, 'spr', 56, 58, 26, 26, () => paintNote({ ...o, x: 0, rot: 0 }, 0)), o.x, sy, o.rot);
}
function drawClip(x, sy, col) {
  blit(sharedSprite('clip' + col, 48, 26, 21, 10, () => paintClip(0, 0, col)), x, sy);
}

// ---------- Paper's added looks and mechanics (v129) ----------
// PAPER_LOOKS in obstacles.js: the first look of each obstacle is drawn above; this draws the others and the three
// mechanics added in v129 (beam, blast, slow zone). Desk things only, ink outlines. Returns false for an original look.
function drawPaperLook(o, sy) {
  const look = o.look, col = o.paperCol;
  switch (o.type) {
    case 'gate': {
      if (look !== 'pencilcase') return false;
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawPencilCase(-10, l, sy, l, -1, col); drawPencilCase(r, W + 10, sy, r, 1, col);
      return true;
    }
    case 'blot': if (look !== 'coffee') return false; drawCoffeeRing(o, sy); return true;
    case 'pencil': if (look !== 'pen') return false; drawPen(o, sy); return true;
    case 'wad': if (look !== 'crumbs') return false; drawCrumbBall(o, sy); return true;
    case 'note': if (look !== 'card' || o.origami) return false; drawIndexCard(o, sy); return true;
    case 'zap': drawDeskBeam(o, sy); return true;
    case 'mine': drawPopper(o, sy); return true;
    case 'bubbles': drawBreath(o, sy); return true;
  }
  return false;
}

// Gap Wall: a zipped fabric pencil case, the zip pull at the gap, 22 thick
function drawPencilCase(x0, x1, sy, innerX, outDir, col) {
  if (x1 - x0 < 1) return;
  col = col || '#3a66c4';
  ctx.save();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 8); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x0, sy - 11, x1 - x0, 5);
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x0, sy + 5, x1 - x0, 6);
  ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x0, sy - 1); ctx.lineTo(x1, sy - 1); ctx.stroke();   // the zip
  ctx.strokeStyle = '#8d939e'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 5) { ctx.moveTo(x, sy - 2.5); ctx.lineTo(x, sy + 0.5); }
  ctx.stroke();
  ctx.restore();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 8); inkStroke(1.4);
  const px = innerX + outDir * 9;                  // the zip pull hanging from the slider
  ctx.fillStyle = '#c9ced6'; ctx.beginPath(); roundRectPath(px - 3, sy - 3, 6, 5, 1.5); ctx.fill(); inkStroke(1);
  ctx.beginPath(); roundRectPath(px - 2, sy + 1, 4, 8, 2); ctx.fill(); inkStroke(1);
  ctx.restore();
}

// Static Hazards: a coffee-cup ring stain with a drip, inside the hit circle (only a look: nothing gets soggy)
function drawCoffeeRing(o, sy) {
  const R = o.r * 0.88, col = o.paperCol || '#8a5a32';
  blit(ownSprite(o, 'sprP', R * 2 + 8, R * 2 + 8, R + 4, R + 4, () => {
    ctx.fillStyle = 'rgba(160,110,60,.22)'; ctx.beginPath(); ctx.arc(0, 0, R * 0.95, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = R * 0.16; ctx.beginPath(); ctx.arc(0, 0, R * 0.86, 0.2, Math.PI * 1.9); ctx.stroke();
    ctx.lineWidth = R * 0.08; ctx.beginPath(); ctx.arc(R * 0.04, 0, R * 0.78, Math.PI * 1.95, Math.PI * 2.15); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(R * 0.55, R * 0.55, R * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(R * 0.3, R * 0.7, R * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, R * 0.95, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(34,53,107,.5)'; ctx.lineWidth = 1; ctx.stroke();
  }), o.x, sy);
}

// Bouncing Slider: a ballpoint pen with a clip and a cap, 13 thick, pointing the way it slides
function drawPen(o, sy) {
  const L = o.len / 2, col = o.paperCol || '#2f6fd1';
  blit(ownSprite(o, 'sprP', o.len + 8, 20, L + 4, 10, () => {
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.moveTo(L - 12, -3); ctx.lineTo(L, 0); ctx.lineTo(L - 12, 3); ctx.closePath(); ctx.fill(); inkStroke(1);   // the tip
    ctx.fillStyle = '#f6f6f2'; ctx.beginPath(); roundRectPath(-L, -5, o.len - 12, 10, 4); ctx.fill(); inkStroke(1.3);                         // the barrel
    ctx.fillStyle = col; ctx.fillRect(-L + 2, -1.2, o.len - 22, 2.4);                                                                        // the ink tube
    ctx.beginPath(); roundRectPath(-L, -6, o.len * 0.32, 12, 4); ctx.fill(); inkStroke(1.3);                                                  // the cap
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); roundRectPath(-L + 4, -6.5, o.len * 0.24, 3, 1.5); ctx.fill(); inkStroke(0.9);               // its clip
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-L + 3, -4, o.len * 0.26, 1.6);
  }), o.x, sy, o.a, o.vx < 0 ? -1 : 1, 1);
}

// Rising Projectile: a ball of rubbed-off eraser crumbs
function drawCrumbBall(o, sy) {
  const col = o.paperCol || '#f2a7b8', R = o.r;
  blit(ownSprite(o, 'sprP', R * 2 + 8, R * 2 + 8, R + 4, R + 4, () => {
    const bits = [[0, 0, 0.55], [-0.45, -0.3, 0.42], [0.45, -0.28, 0.4], [-0.4, 0.4, 0.4], [0.42, 0.42, 0.38], [0, -0.6, 0.34], [0, 0.6, 0.34], [-0.66, 0.05, 0.3], [0.66, 0.05, 0.3]];
    ctx.beginPath(); for (const [x, y, r] of bits) { ctx.moveTo(x * R + r * R * 0.9, y * R); ctx.ellipse(x * R, y * R, r * R * 0.9, r * R * 0.7, x + y, 0, Math.PI * 2); }
    ctx.fillStyle = col; ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; for (const [x, y, r] of bits.slice(0, 5)) { ctx.beginPath(); ctx.arc(x * R - r * R * 0.25, y * R - r * R * 0.25, r * R * 0.2, 0, Math.PI * 2); ctx.fill(); }
  }), o.x, sy, o.rot);
}

// Drifting Swarm: a lined index card with a red top line, in the 42-unit square
function drawIndexCard(o, sy) {
  blit(sharedSprite('indexcard', 48, 48, 24, 24, () => {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.rect(-20, -15, 40, 30); ctx.fill(); inkStroke(1.3);
    ctx.strokeStyle = '#e06a6a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-20, -9); ctx.lineTo(20, -9); ctx.stroke();
    ctx.strokeStyle = '#9ab8e0'; ctx.lineWidth = 0.9; ctx.beginPath(); for (const y of [-3, 3, 9]) { ctx.moveTo(-20, y); ctx.lineTo(20, y); } ctx.stroke();
    ctx.strokeStyle = COL.graphite; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-15, -13); ctx.quadraticCurveTo(-8, -15, 0, -12.5); ctx.moveTo(-15, 1); ctx.lineTo(4, 0.5); ctx.moveTo(-15, 7); ctx.lineTo(10, 6.5); ctx.stroke();
  }), o.x, sy, o.rot);
}

// Charged Beam: a laser pointer clipped to the edge (red dot beam), or a desk lamp switching on (a warm light band)
function drawDeskBeam(o, sy) {
  const x0 = ZAP_BODY, L = o.len, lamp = o.look === 'lamp', col = o.paperCol || (lamp ? '#ffe58a' : '#ff3a3a');
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save(); ctx.strokeStyle = lamp ? '#d8a020' : '#ff3a3a'; ctx.globalAlpha = 0.3 + 0.6 * Math.min(1, o.t / 0.7); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke(); ctx.restore();
  } else if (o.phase === 'zap') {
    if (lamp) {
      ctx.fillStyle = 'rgba(255,229,138,.45)'; ctx.fillRect(x0, -6, L, 12);
      ctx.fillStyle = 'rgba(255,245,200,.85)'; ctx.fillRect(x0, -3, L, 6);
      ctx.strokeStyle = 'rgba(216,160,32,.6)'; ctx.lineWidth = 1; ctx.strokeRect(x0, -6, L, 12);
    } else {
      ctx.fillStyle = 'rgba(255,60,60,.3)'; ctx.fillRect(x0, -4, L, 8);
      ctx.fillStyle = col; ctx.fillRect(x0, -1.5, L, 3);
      ctx.fillStyle = '#ffd0d0'; ctx.beginPath(); ctx.arc(x0 + L, 0, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0 + L, 0, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (lamp) {                                      // an arm from the edge and a round shade facing the page
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(28, -4); ctx.lineTo(x0 - 18, 2); ctx.stroke();
    ctx.strokeStyle = '#8d939e'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.fillStyle = '#2f8f5b'; ctx.beginPath(); ctx.moveTo(x0 - 22, -8); ctx.lineTo(x0, -9); ctx.lineTo(x0, 9); ctx.lineTo(x0 - 22, 8); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = o.phase === 'zap' ? '#fff6c0' : '#d8d4c8'; ctx.beginPath(); ctx.ellipse(x0, 0, 2.5, 8, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
  } else {                                         // a metal pointer clipped along the edge, its button lit when charging
    ctx.fillStyle = '#9aa3b0'; ctx.beginPath(); roundRectPath(-6, -5, x0 + 6, 10, 5); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, -3.5, x0 - 10, 2);
    ctx.fillStyle = '#2b2b2b'; ctx.beginPath(); ctx.arc(x0 - 3, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = o.phase === 'rest' ? '#7a2a24' : '#ff3a3a'; ctx.beginPath(); ctx.arc(x0 * 0.45, -5, 2.6, 0, Math.PI * 2); ctx.fill(); inkStroke(0.9);
  }
  ctx.restore();
}

// Proximity Blast: a highlighter cap that shakes and pops off in a splash, or a party popper that bursts in confetti
function drawPopper(o, sy) {
  const popper = o.look === 'popper', col = o.paperCol || '#f4e04a';
  if (o.phase === 'boom' || (o.phase === 'gone' && o.t < BOOM_END - 0.35)) {
    const T = o.phase === 'boom' ? o.t : 0.35 + o.t;
    drawBoom(o, sy, T);
    if (T < 0.7) {                                 // confetti or highlighter splats flying out
      ctx.save(); ctx.globalAlpha = 1 - T / 0.7;
      const tones = popper ? ['#e0503a', '#f4c430', '#3a8ad8', '#2f8f5b', '#c75b9b'] : [col];
      for (let i = 0; i < 16; i++) {
        const a = i * 2.39, d = o.blast * (0.4 + 0.9 * T + 0.2 * (i % 3));
        ctx.fillStyle = tones[i % tones.length]; ctx.save(); ctx.translate(o.x + Math.cos(a) * d, sy + Math.sin(a) * d); ctx.rotate(a + T * 8);
        if (popper) ctx.fillRect(-3, -1.5, 6, 3); else { ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      ctx.restore();
    }
    return;
  }
  if (o.phase === 'gone') return;
  if (o.phase === 'blink') {
    ctx.save(); ctx.strokeStyle = `rgba(230,60,50,${0.35 + 0.5 * Math.min(1, o.t / 0.6)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  const shake = o.phase === 'blink' ? Math.sin(o.t * 50) * 0.15 : 0;
  blit(sharedSprite('popper' + o.look + col, 36, 36, 18, 18, () => {
    if (popper) {                                  // a striped cone with a string at its base
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-9, -13); ctx.lineTo(9, -13); ctx.lineTo(2, 12); ctx.lineTo(-2, 12); ctx.closePath(); ctx.fill(); inkStroke(1.3);
      ctx.fillStyle = '#ffffff'; for (const y of [-7, 0]) { const w1 = 9 - (y + 13) * 0.28, w2 = 9 - (y + 16) * 0.28; ctx.beginPath(); ctx.moveTo(-w1, y); ctx.lineTo(w1, y); ctx.lineTo(w2, y + 3); ctx.lineTo(-w2, y + 3); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#f4c430'; ctx.beginPath(); ctx.ellipse(0, -13, 9, 2.6, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 12); ctx.quadraticCurveTo(4, 15, 2, 15.5); ctx.stroke();
    } else {                                       // a chunky fluorescent cap with a clip
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-8, -13, 16, 26, 4); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-6, -11, 3, 20);
      ctx.beginPath(); roundRectPath(5, -11, 4, 16, 2); ctx.fillStyle = col; ctx.fill(); inkStroke(1);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-8, 7, 16, 2);
    }
  }), o.x, sy, shake);
}

// Effect Zone: a breath of air blowing up the page: wavy puffs rising (slows the fall, never hurts)
function drawBreath(o, sy) {
  const x0 = o.x - o.w / 2, y0 = sy - o.h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(160,200,240,.1)'; ctx.fillRect(x0, y0, o.w, o.h);
  ctx.strokeStyle = 'rgba(90,130,190,.5)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]); ctx.strokeRect(x0, y0, o.w, o.h); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(90,130,190,.6)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 7; k++) {                    // little curls of air drifting up
    const ph = (o.t * 0.7 + k / 7) % 1, x = o.x + Math.sin(k * 2.3) * o.w * 0.3, y = y0 + o.h - ph * o.h;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5);
    ctx.beginPath(); ctx.moveTo(x - 8, y + 4); ctx.quadraticCurveTo(x - 4, y - 4, x + 2, y); ctx.arc(x + 4, y - 2, 3, Math.PI * 0.8, Math.PI * 2.4); ctx.stroke();
  }
  ctx.restore();
}
