// Paper Nosedive — Art for the Deep sea map obstacles.
'use strict';

// ---------- deep sea obstacle art ----------
// coral ledge: a bumpy strip measured from its rounded inner tip, cropped to length like the rulers
function coralStrip(col, outDir) {
  return sharedSprite('coral' + outDir + col, RULER_LEN + 4, 34, outDir > 0 ? 2 : RULER_LEN + 2, 17, () => {
    ctx.scale(outDir, 1);
    const path = () => {
      ctx.beginPath(); ctx.moveTo(11, -11);
      for (let x = 11; x < RULER_LEN; x += 12) ctx.quadraticCurveTo(x + 6, -16, x + 12, -11);
      ctx.lineTo(RULER_LEN, 11);
      for (let x = RULER_LEN; x > 11; x -= 12) ctx.quadraticCurveTo(x - 6, 16, x - 12, 11);
      ctx.arc(11, 0, 11, Math.PI / 2, Math.PI * 1.5);
      ctx.closePath();
    };
    ctx.fillStyle = col; path(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let x = 16, i = 0; x < RULER_LEN; x += 9, i++) {
      ctx.beginPath(); ctx.arc(x, ((i * 7) % 13) - 6, 1.6 + (i % 3) * 0.6, 0, Math.PI * 2); ctx.fill();
    }
    path(); inkStroke(1.3);
  });
}
function drawCoral(x0, x1, sy, innerX, outDir, col = '#f08a7e') {
  const len = Math.min(x1 - x0, RULER_LEN);
  if (len < 1) return;
  const s = coralStrip(col, outDir), r = spriteRes;
  if (outDir > 0) ctx.drawImage(s.c, 0, 0, (len + 2) * r, s.c.height, innerX - 2, sy - 17, len + 2, 34);
  else ctx.drawImage(s.c, (RULER_LEN + 2 - len) * r, 0, (len + 2) * r, s.c.height, innerX - len, sy - 17, len + 2, 34);
}

// giant clam: two ridged shell lips from the walls that snap together
function drawClam(x0, x1, sy, innerX, outDir, col = '#e9d3c4') {
  if (x1 - x0 < 1) return;
  ctx.fillStyle = col; ctx.beginPath(); roundRectPath(x0, sy - 14, x1 - x0, 28, 12); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x0, sy + 6, x1 - x0, 8);
  ctx.strokeStyle = 'rgba(120,90,80,.45)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let x = innerX + outDir * 9; outDir > 0 ? x < x1 : x > x0; x += outDir * 9) { ctx.moveTo(x, sy - 12); ctx.lineTo(x - outDir * 3, sy + 12); }
  ctx.stroke();
  ctx.beginPath(); roundRectPath(x0, sy - 14, x1 - x0, 28, 12); inkStroke(1.4);
}

// sea urchin (in place of an ink blot): spiky ball, same footprint
function drawUrchin(o, sy) {
  const R = o.r * 1.15 + 4, col = o.seaCol || '#3b2a52';
  blit(ownSprite(o, 'sprU', R * 2, R * 2, R, R, () => {
    ctx.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2, L = o.r * (i % 2 ? 0.95 : 1.1);
      ctx.strokeStyle = '#1d1d29'; ctx.lineWidth = 1.7;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * o.r * 0.5, Math.sin(a) * o.r * 0.5); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke();
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.62, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(-o.r * 0.2, -o.r * 0.22, o.r * 0.18, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy);
}

// jellyfish (in place of a sticky note): pulsing dome with trailing tentacles
function drawJelly(o, sy) {
  const col = o.seaCol || 'rgba(240,140,200,.85)';
  const s = sharedSprite('jelly' + col, 58, 74, 29, 26, () => {
    ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    for (const x of [-14, -7, 0, 7, 14]) {
      ctx.beginPath(); ctx.moveTo(x, 2); ctx.quadraticCurveTo(x + 6, 16, x - 2, 26); ctx.quadraticCurveTo(x - 7, 36, x + 1, 44); ctx.stroke();
    }
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(0, 0, 22, Math.PI, 0);
    for (let x = 22; x > -22; x -= 11) ctx.quadraticCurveTo(x - 5.5, 7, x - 11, 0);
    ctx.closePath(); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-8, -10, 6, 3, -0.5, 0, Math.PI * 2); ctx.fill();
  });
  const pulse = 1 + Math.sin(o.ph * 2) * 0.07;
  blit(s, o.x, sy, o.rot * 0.5, 1 / pulse, pulse);
}

// moray eel (in place of the cutter): lunges out of a hole in the rock wall
function drawMoray(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, col = o.seaCol || '#5f7f3a';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#4a5563';
  ctx.beginPath(); ctx.moveTo(-8, -18); ctx.quadraticCurveTo(40, -24, 82, -10); ctx.quadraticCurveTo(90, 0, 82, 12);
  ctx.quadraticCurveTo(40, 22, -8, 18); ctx.closePath(); ctx.fill(); inkStroke(1.3);
  ctx.fillStyle = '#1a2028'; ctx.beginPath(); ctx.ellipse(72, 0, 7, 10, 0, 0, Math.PI * 2); ctx.fill();
  if (e > 1) {
    const wy = x => Math.sin(x * 0.12 + o.t * 6) * 3;
    const tip = h + e - 8;
    ctx.beginPath(); for (let x = 70; x <= tip; x += 5) (x === 70 ? ctx.moveTo(x, wy(x)) : ctx.lineTo(x, wy(x)));
    ctx.lineTo(tip, wy(tip));
    ctx.lineCap = 'round'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 13; ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(tip + 2, wy(tip), 11, 8, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = '#7a1d16'; ctx.beginPath(); ctx.moveTo(tip + 13, wy(tip) - 1); ctx.lineTo(tip + 2, wy(tip) + 2); ctx.lineTo(tip + 12, wy(tip) + 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(tip + 4, wy(tip) - 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.arc(tip + 4.5, wy(tip) - 3, 1.1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// electric eel: lies along its wall; charging shows a dashed preview, then a lightning bolt crosses
function drawZap(o, sy) {
  ctx.save();
  toolFrame(o, sy);
  const x0 = ZAP_BODY, L = o.len;
  if (o.phase === 'charge') {
    const k = Math.min(1, o.t / 0.7);
    ctx.save();
    ctx.strokeStyle = `rgba(255,236,120,${0.25 + 0.6 * k})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#fff3a0'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < 3; i++) { const a = rand(-1, 1); ctx.moveTo(x0, 0); ctx.lineTo(x0 + Math.cos(a) * 10, Math.sin(a) * 10); }
    ctx.stroke();
  } else if (o.phase === 'zap') {
    const pts = [];
    for (let x = x0; x < x0 + L; x += 12) pts.push([x, x === x0 ? 0 : rand(-6, 6)]);
    pts.push([x0 + L, 0]);
    const bolt = () => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    bolt(); ctx.strokeStyle = 'rgba(255,240,120,.35)'; ctx.lineWidth = 9; ctx.stroke();
    bolt(); ctx.strokeStyle = '#fff3a0'; ctx.lineWidth = 3.5; ctx.stroke();
    bolt(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  // the eel itself
  ctx.fillStyle = '#c9b458';
  ctx.beginPath(); ctx.moveTo(-6, -9); ctx.quadraticCurveTo(35, -12, x0 + 2, -5); ctx.quadraticCurveTo(x0 + 8, 0, x0 + 2, 5);
  ctx.quadraticCurveTo(35, 12, -6, 9); ctx.closePath(); ctx.fill(); inkStroke(1.3);
  ctx.fillStyle = '#8a7a2e'; for (let x = 6; x < x0 - 8; x += 10) { ctx.beginPath(); ctx.arc(x, -2, 1.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x0 - 6, -3, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.arc(x0 - 5.5, -3, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// kelp (in place of the cat paw): a seaweed frond that sweeps out from the wall after a warning
function drawKelp(o, sy) {
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = `rgba(120,220,140,${0.3 + 0.55 * k})`; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext, col = o.seaCol || '#3f8f4f';
    ctx.rotate(o.ang);
    const wy = x => Math.sin(x * 0.08 + o.t * 5) * 4;
    ctx.beginPath(); for (let x = -10; x <= len; x += 6) (x === -10 ? ctx.moveTo(x, wy(x)) : ctx.lineTo(x, wy(x)));
    ctx.lineCap = 'round'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 9; ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 6.5; ctx.stroke();
    ctx.fillStyle = col;
    for (let x = 14, i = 0; x < len - 12; x += 20, i++) {    // leaves alternating sides
      const s = i % 2 ? 1 : -1;
      ctx.beginPath(); ctx.ellipse(x + 4, wy(x) + s * 8, 9, 4, s * 0.6, 0, Math.PI * 2); ctx.fill(); inkStroke(0.9);
    }
    ctx.beginPath(); ctx.ellipse(len, wy(len), 16, 11, 0.3, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(len - 3, wy(len) - 3, 7, 3, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// submarine (in place of the glue tube): fires torpedoes across; its bow light blinks just before
function drawSub(o, sy) {
  const dir = inward(o);
  for (const b of o.blobs) {                       // torpedoes with a bubble trail
    ctx.save(); ctx.translate(b.x, sy); ctx.scale(dir, 1);
    ctx.fillStyle = 'rgba(235,250,255,.7)';
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(-12 - k * 7, Math.sin(b.wob + k) * 2, 1.5 + k * 0.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#8d939e'; ctx.beginPath(); roundRectPath(-11, -3.5, 20, 7, 3.5); ctx.fill(); inkStroke(1);
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(9, 0, 3.4, -Math.PI / 2, Math.PI / 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-11, -3.5); ctx.lineTo(-15, -6); ctx.moveTo(-11, 3.5); ctx.lineTo(-15, 6); inkStroke(1);
    ctx.restore();
  }
  const col = o.seaCol || '#e0a21a';
  const hull = sharedSprite('sub' + dir + col, 176, 52, 88, 30, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = col;
    ctx.beginPath(); roundRectPath(-6, -11, 88, 22, 11); ctx.fill(); inkStroke(1.4);
    ctx.beginPath(); roundRectPath(22, -21, 22, 12, 3); ctx.fill(); inkStroke(1.2);
    ctx.beginPath(); ctx.moveTo(36, -21); ctx.lineTo(36, -28); ctx.lineTo(42, -28); inkStroke(1.4);
    ctx.fillStyle = '#bfe3f2';
    for (const x of [14, 52, 64]) { ctx.beginPath(); ctx.arc(x, 0, 3.2, 0, Math.PI * 2); ctx.fill(); inkStroke(1); }
  });
  blit(hull, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {          // bow light: a torpedo is coming
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#ff5a4a' : '#ffd0c8';
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 78, sy, 3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawStarfish(o, sy) {
  const col = o.seaCol || '#f28c28';
  blit(sharedSprite('starfish' + col, 60, 60, 30, 30, () => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 10 : 26, a = -Math.PI / 2 + i * Math.PI / 5;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.lineJoin = 'round'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      for (const r of [7, 13, 18]) { ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.3, 0, Math.PI * 2); ctx.fill(); }
    }
  }), o.x, sy, o.rot);
}

// naval mine on a chain: blinks with its blast circle showing, then explodes
function drawMine(o, sy) {
  ctx.strokeStyle = 'rgba(70,80,92,.7)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); for (let y = 18; y < 130; y += 9) { ctx.moveTo(o.x - 2, sy + y); ctx.lineTo(o.x + 2, sy + y + 6); } ctx.stroke();
  if (o.phase === 'boom' || (o.phase === 'gone' && o.t < 0.5)) {
    const k = o.phase === 'boom' ? Math.min(1, o.t / 0.12) : 1;
    const glow = sharedSprite('blast', 132, 132, 66, 66, () => {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 64);
      g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.35, 'rgba(255,190,80,.95)');
      g.addColorStop(0.75, 'rgba(240,100,40,.6)'); g.addColorStop(1, 'rgba(240,100,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 64, 0, Math.PI * 2); ctx.fill();
    });
    ctx.save();
    ctx.globalAlpha = o.phase === 'boom' ? 1 : 1 - o.t / 0.5;
    const sc = o.blast * k / 62;
    blit(glow, o.x, sy, 0, sc, sc);
    ctx.restore();
    return;
  }
  if (o.phase === 'gone') return;
  if (o.phase === 'blink') {                       // where the blast will reach
    ctx.save();
    ctx.strokeStyle = `rgba(230,60,50,${0.35 + 0.5 * Math.min(1, o.t / 0.6)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  blit(sharedSprite('mine', 50, 50, 25, 25, () => {
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 19, Math.sin(a) * 19); ctx.stroke();
      ctx.fillStyle = '#6b727c'; ctx.beginPath(); ctx.arc(Math.cos(a) * 19, Math.sin(a) * 19, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#4a4f58'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(-4, -4, 4, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy);
  const on = o.phase === 'blink' ? Math.floor(o.t * 12) % 2 === 0 : Math.floor(o.t * 1.5) % 2 === 0;
  ctx.fillStyle = on ? '#ff4a3a' : '#7a2a24';
  ctx.beginPath(); ctx.arc(o.x, sy - 13, 2.6, 0, Math.PI * 2); ctx.fill();
}

// a column of rising bubbles (slows the fall, never hurts)
function drawBubbleColumn(o, sy) {
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  ctx.fillRect(o.x - o.w / 2, sy - o.h / 2, o.w, o.h);
  ctx.strokeStyle = 'rgba(240,252,255,.75)'; ctx.lineWidth = 1.3;
  for (let k = 0; k < 14; k++) {
    const ph = (o.t * 0.8 + k / 14) % 1;
    const by = sy + o.h / 2 - ph * o.h, bx = o.x + Math.sin(k * 2.3 + o.t * 2) * o.w * 0.32;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5);
    ctx.beginPath(); ctx.arc(bx, by, 2 + (k % 4) * 1.2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
