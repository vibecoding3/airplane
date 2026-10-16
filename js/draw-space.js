// Paper Nosedive — Art for the Space map obstacles.
'use strict';

// Space obstacles reuse a Paper / Deep sea obstacle's movement and collision (see SPACE_MAKERS) and only
// change the look. Space is dark, so outlines are pale instead of ink.
const SPACE_LINE = '#e6eeff';
function spaceStroke(w = 1.4) { ctx.strokeStyle = SPACE_LINE; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
// a lumpy rock outline, the same every time for a given seed
function rockPath(r, seed, n = 11) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2, k = 0.82 + 0.18 * Math.abs(Math.sin(seed * 12.9898 + i * 78.233));
    i ? ctx.lineTo(Math.cos(a) * r * k, Math.sin(a) * r * k) : ctx.moveTo(Math.cos(a) * r * k, Math.sin(a) * r * k);
  }
  ctx.closePath();
}
function craters(r, seed) {
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  for (let i = 0; i < 4; i++) {
    const a = seed * 3 + i * 1.9, d = r * (0.2 + 0.45 * ((i * 37 + seed * 11) % 10) / 10);
    ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * (0.1 + 0.06 * (i % 3)), 0, Math.PI * 2); ctx.fill();
  }
}

// station girders (Gap Wall): a truss from each side with an end plate at the gap
function drawGirder(x0, x1, sy, innerX, outDir, col = '#c9ced6') {
  if (x1 - x0 < 1) return;
  ctx.save();
  ctx.fillStyle = 'rgba(150,165,190,.28)'; ctx.fillRect(x0, sy - 11, x1 - x0, 22);
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(x0, sy - 10); ctx.lineTo(x1, sy - 10); ctx.moveTo(x0, sy + 10); ctx.lineTo(x1, sy + 10);
  for (let x = innerX, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * 18, i++) {
    ctx.moveTo(x, i % 2 ? sy - 10 : sy + 10); ctx.lineTo(x + outDir * 18, i % 2 ? sy + 10 : sy - 10);
  }
  ctx.stroke();
  // end plate with a warning light
  ctx.fillStyle = col; ctx.beginPath(); roundRectPath(innerX - (outDir > 0 ? 0 : 8), sy - 13, 8, 26, 2); ctx.fill(); spaceStroke(1.2);
  ctx.fillStyle = Math.floor(performance.now() / 500) % 2 ? '#ff5a4a' : '#7a2a24';
  ctx.beginPath(); ctx.arc(innerX + outDir * 4, sy, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// airlock doors (Closing Jaws): heavy slabs with hazard stripes at the closing edge
function drawAirlock(x0, x1, sy, innerX, outDir, col = '#d9dde3') {
  if (x1 - x0 < 1) return;
  ctx.save();
  ctx.fillStyle = col; ctx.beginPath(); roundRectPath(x0, sy - 14, x1 - x0, 28, 4); ctx.fill();
  ctx.save(); ctx.clip();
  const sx = outDir > 0 ? innerX : innerX - 22;
  ctx.fillStyle = '#f2c84b'; ctx.fillRect(sx, sy - 14, 22, 28);
  ctx.fillStyle = '#2b2b2b';
  for (let k = -2; k < 4; k++) { ctx.beginPath(); ctx.moveTo(sx + k * 10, sy + 14); ctx.lineTo(sx + k * 10 + 5, sy + 14); ctx.lineTo(sx + k * 10 + 15, sy - 14); ctx.lineTo(sx + k * 10 + 10, sy - 14); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x0, sy + 5, x1 - x0, 9);
  ctx.restore();
  ctx.beginPath(); roundRectPath(x0, sy - 14, x1 - x0, 28, 4); spaceStroke(1.4);
  ctx.restore();
}

// asteroid (Static Hazards, in place of an ink blot)
function drawAsteroid(o, sy) {
  const col = o.spaceCol || '#8a8178', R = o.r + 4;
  blit(ownSprite(o, 'spr', R * 2 + 6, R * 2 + 6, R + 3, R + 3, () => {
    rockPath(o.r, o.r); ctx.fillStyle = col; ctx.fill();
    craters(o.r, o.r);
    rockPath(o.r, o.r); spaceStroke(1.4);
  }), o.x, sy);
}

// tumbling asteroid (Spinning Drifter, in place of the starfish)
function drawTumbler(o, sy) {
  const col = o.spaceCol || '#9a7b62';
  blit(sharedSprite('tumbler' + col, 52, 52, 26, 26, () => {
    rockPath(22, 3.3, 9); ctx.fillStyle = col; ctx.fill();
    craters(22, 2); rockPath(22, 3.3, 9); spaceStroke(1.4);
  }), o.x, sy, o.rot);
}

// a chunk of ice (Drifting Swarm, in place of a sticky note)
function drawIce(o, sy) {
  const col = o.spaceCol || '#bfe8ff';
  blit(sharedSprite('ice' + col, 56, 56, 28, 28, () => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 22); }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(-2, -16); ctx.lineTo(-8, -2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 22); }
    ctx.closePath(); spaceStroke(1.3);
  }), o.x, sy, o.rot);
}

// satellite with long solar panels (Bouncing Slider, in place of the pencil)
function drawSatellite(o, sy) {
  const L = o.len / 2, col = o.spaceCol || '#2f6fd1';
  const s = ownSprite(o, 'spr', o.len + 10, 32, L + 5, 16, () => {
    for (const d of [-1, 1]) {
      const x0 = d < 0 ? -L : 14, w = L - 14;
      ctx.fillStyle = col; ctx.fillRect(x0, -6.5, w, 13);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = x0 + 10; x < x0 + w; x += 10) { ctx.moveTo(x, -6.5); ctx.lineTo(x, 6.5); }
      ctx.moveTo(x0, 0); ctx.lineTo(x0 + w, 0); ctx.stroke();
      ctx.beginPath(); ctx.rect(x0, -6.5, w, 13); spaceStroke(1.2);
    }
    ctx.fillStyle = '#e0b84a'; ctx.beginPath(); roundRectPath(-14, -10, 28, 20, 3); ctx.fill(); spaceStroke(1.3);
    ctx.strokeStyle = SPACE_LINE; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -15); ctx.stroke();
    ctx.fillStyle = '#ff5a4a'; ctx.beginPath(); ctx.arc(0, -15, 2, 0, Math.PI * 2); ctx.fill();
  });
  blit(s, o.x, sy, o.a);
}

// a little rocket launching up the screen (Rising Projectile, in place of the paper wad)
function drawRocket(o, sy) {
  const col = o.spaceCol || '#e2493b', s = o.r / 16;
  const body = sharedSprite('rocket' + col, 40, 64, 20, 30, () => {
    ctx.fillStyle = '#f2f2f2';
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(11, -12, 9, 14); ctx.lineTo(-9, 14); ctx.quadraticCurveTo(-11, -12, 0, -24); ctx.closePath(); ctx.fill(); spaceStroke(1.3);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(7, -17, 7.5, -12); ctx.lineTo(-7.5, -12); ctx.quadraticCurveTo(-7, -17, 0, -24); ctx.fill();
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 8, 4); ctx.lineTo(d * 15, 16); ctx.lineTo(d * 8, 14); ctx.closePath(); ctx.fill(); spaceStroke(1.1); }
    ctx.fillStyle = '#7fc8ff'; ctx.beginPath(); ctx.arc(0, -3, 4, 0, Math.PI * 2); ctx.fill(); spaceStroke(1.1);
  });
  const ang = Math.atan2(o.vy, o.vx) + Math.PI / 2;
  ctx.save(); ctx.translate(o.x, sy); ctx.rotate(ang);
  const fl = 8 + 4 * Math.sin(performance.now() / 40);           // flickering flame
  ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.moveTo(-5 * s, 14 * s); ctx.lineTo(0, (14 + fl + 6) * s); ctx.lineTo(5 * s, 14 * s); ctx.fill();
  ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.moveTo(-2.5 * s, 14 * s); ctx.lineTo(0, (14 + fl) * s); ctx.lineTo(2.5 * s, 14 * s); ctx.fill();
  ctx.restore();
  blit(body, o.x, sy, ang, s, s);
}

// a train of tiny satellites crossing (Conveyor, in place of paper clips)
function drawCubesat(x, sy, col) {
  blit(sharedSprite('cubesat' + col, 44, 22, 22, 11, () => {
    ctx.fillStyle = '#2f6fd1';
    for (const d of [-1, 1]) { ctx.fillRect(d < 0 ? -18 : 7, -4, 11, 8); ctx.beginPath(); ctx.rect(d < 0 ? -18 : 7, -4, 11, 8); spaceStroke(1); }
    ctx.fillStyle = col; ctx.fillRect(-7, -6, 14, 12); ctx.beginPath(); ctx.rect(-7, -6, 14, 12); spaceStroke(1.2);
  }), x, sy);
}

// a robotic station arm swinging round its base (Sweeping Arm, in place of the compass)
function drawRobotArm(o, sy) {
  const L = o.L, col = o.spaceCol || '#f2f2f2';
  const arm = ownSprite(o, 'spr', L + 16, 24, 12, 12, () => {
    ctx.fillStyle = col;
    ctx.beginPath(); roundRectPath(0, -4.5, L * 0.55, 9, 4); ctx.fill(); spaceStroke(1.2);
    ctx.beginPath(); roundRectPath(L * 0.5, -3.5, L * 0.42, 7, 3); ctx.fill(); spaceStroke(1.2);
    ctx.fillStyle = '#8fa3b8'; ctx.beginPath(); ctx.arc(L * 0.52, 0, 5, 0, Math.PI * 2); ctx.fill(); spaceStroke(1.1);
    ctx.strokeStyle = SPACE_LINE; ctx.lineWidth = 2; ctx.beginPath();                    // claw
    ctx.moveTo(L * 0.92, 0); ctx.lineTo(L, -5); ctx.moveTo(L * 0.92, 0); ctx.lineTo(L, 5); ctx.stroke();
    ctx.fillStyle = '#5a6270'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); spaceStroke(1.3);
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  });
  blit(arm, o.x, sy, o.ang);
}

// a docking probe shooting out of a hull (Wall Piston, in place of the cutter)
function drawProbe(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, col = o.spaceCol || '#c9ced6';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    ctx.fillStyle = '#9fb3c8'; ctx.fillRect(h - 8, -5, e + 2, 10); ctx.beginPath(); ctx.rect(h - 8, -5, e + 2, 10); spaceStroke(1.1);
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(h + e - 6, -7); ctx.lineTo(h + e + 4, 0); ctx.lineTo(h + e - 6, 7); ctx.closePath(); ctx.fill(); spaceStroke(1.1);
  }
  ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 5); ctx.fill(); spaceStroke(1.4);
  ctx.fillStyle = '#2b3a55'; for (let x = 8; x < h - 10; x += 16) { ctx.beginPath(); ctx.arc(x, 0, 3.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// a laser gate on the wall (Charged Beam, in place of the electric eel)
function drawLaser(o, sy) {
  const x0 = ZAP_BODY, L = o.len, col = o.spaceCol || '#ff4a5a';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    const k = Math.min(1, o.t / 0.7);
    ctx.save();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.3 + 0.6 * k; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.restore();
  } else if (o.phase === 'zap') {
    ctx.lineCap = 'round';
    ctx.strokeStyle = col; ctx.globalAlpha = 0.35; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.fillStyle = '#5a6270'; ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 4); ctx.fill(); spaceStroke(1.3);
  ctx.fillStyle = '#8fa3b8'; ctx.fillRect(8, -5, x0 - 26, 10);
  ctx.fillStyle = o.phase === 'rest' ? '#3a2a30' : col;
  ctx.beginPath(); ctx.arc(x0 - 6, 0, 6, 0, Math.PI * 2); ctx.fill(); spaceStroke(1.2);
  ctx.restore();
}

// the edge of a small moon (Wall Bulge, in place of the protractor)
function drawMoonEdge(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 6, col = o.spaceCol || '#d8d4c8';
  const s = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    for (const [a, d, r] of [[0.3, 0.45, 0.18], [1.4, 0.6, 0.12], [2.6, 0.35, 0.15], [3.9, 0.62, 0.1], [5.1, 0.5, 0.14]]) {
      ctx.beginPath(); ctx.arc(Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, o.r * r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); spaceStroke(1.6);
  });
  blit(s, cx, sy);
}

// a low-gravity field (helpful Effect Zone, in place of the bubble column): slows the fall
function drawLowGrav(o, sy) {
  ctx.save();
  ctx.fillStyle = 'rgba(170,140,255,.10)';
  ctx.fillRect(o.x - o.w / 2, sy - o.h / 2, o.w, o.h);
  ctx.strokeStyle = 'rgba(200,180,255,.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]);
  ctx.strokeRect(o.x - o.w / 2, sy - o.h / 2, o.w, o.h);
  ctx.setLineDash([]);
  ctx.fillStyle = '#e6dcff';
  for (let k = 0; k < 10; k++) {                    // sparkles drifting slowly up
    const ph = (o.t * 0.35 + k / 10) % 1;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5);
    const bx = o.x + Math.sin(k * 2.1 + o.t) * o.w * 0.3, by = sy + o.h / 2 - ph * o.h;
    ctx.beginPath(); ctx.arc(bx, by, 1.4 + (k % 3) * 0.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
