// Paper Nosedive — Art for the Ocean map obstacles.
'use strict';

// ---------- ocean obstacle art ----------
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
// seashells (Seashells collection, v103): sea-urchin variants on the Ocean map, drawn to fill a 20-unit circle and
// scaled to the urchin's hit circle (radius r × 0.88)
function paintShell(name) {
  const line = (w = 1.6) => inkStroke(w);
  if (name === 'conch') {                          // a spiral spire up-left, a wide body and a pink opening
    ctx.fillStyle = '#f6e3c8'; ctx.beginPath();
    ctx.moveTo(-17, -14); ctx.lineTo(-8, -18); ctx.quadraticCurveTo(14, -16, 19, 2); ctx.quadraticCurveTo(18, 18, 2, 19);
    ctx.quadraticCurveTo(-10, 18, -12, 6); ctx.quadraticCurveTo(-18, -2, -17, -14); ctx.closePath(); ctx.fill(); line();
    ctx.strokeStyle = 'rgba(150,100,60,.55)'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (const k of [0, 1, 2]) { ctx.moveTo(-16 + k * 5, -15 + k * 3); ctx.quadraticCurveTo(-8 + k * 6, -4 + k * 4, -12 + k * 5, 4 + k * 3); }
    ctx.stroke();
    ctx.fillStyle = '#f2a7a0'; ctx.beginPath(); ctx.ellipse(8, 8, 8, 10, -0.5, 0, Math.PI * 2); ctx.fill(); line(1.3);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(6, 6, 2.4, 4, -0.5, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'scallop') {                 // a ribbed fan from a hinge with two little ears
    ctx.fillStyle = '#f7c59f'; ctx.beginPath(); ctx.moveTo(-6, 17); ctx.lineTo(-19, -2); ctx.arc(0, 2, 19, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(6, 17); ctx.closePath(); ctx.fill(); line();
    ctx.strokeStyle = '#e0865a'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + i * 0.36; ctx.moveTo(0, 16); ctx.lineTo(Math.cos(a) * 17, 2 + Math.sin(a) * 17); }
    ctx.stroke();
    ctx.fillStyle = '#f7c59f'; ctx.beginPath(); ctx.rect(-10, 14, 20, 6); ctx.fill(); line(1.3);
  } else if (name === 'nautilus') {                // a round chambered shell with tiger stripes and an opening on the right
    ctx.fillStyle = '#f6ead6'; ctx.beginPath(); ctx.arc(-1, 0, 19, 0, Math.PI * 2); ctx.fill(); line();
    ctx.save(); ctx.beginPath(); ctx.arc(-1, 0, 19, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#b8683a'; for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(-2.2 + i * 0.45); ctx.fillRect(-2, -20, 4.5, 12); ctx.restore(); }
    ctx.restore();
    ctx.fillStyle = '#3a2a2a'; ctx.beginPath(); ctx.ellipse(13, 3, 6, 12, 0, 0, Math.PI * 2); ctx.fill(); line(1.3);
    ctx.strokeStyle = 'rgba(120,70,40,.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(-3, 0, 6, 0, Math.PI * 1.6); ctx.arc(-1, 0, 11, Math.PI * 1.6, Math.PI * 0.9, true); ctx.stroke();
  } else if (name === 'cowrie') {                  // a glossy spotted dome seen from above
    ctx.fillStyle = '#a8673a'; ctx.beginPath(); ctx.ellipse(0, 0, 19, 15, 0, 0, Math.PI * 2); ctx.fill(); line();
    ctx.fillStyle = '#f2dcc0'; for (const [x, y, r] of [[-9, -6, 2.6], [-2, -9, 2], [6, -6, 2.4], [11, 1, 2], [-12, 3, 2.2], [-4, 2, 2.6], [4, 6, 2.2], [-6, 9, 1.8]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-6, -8, 7, 3, -0.3, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'sanddollar') {              // a flat pale disc with a five-petal flower
    ctx.fillStyle = '#ecdfc2'; ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.fill(); line();
    ctx.fillStyle = '#d4c09a';
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 8, Math.sin(a) * 8, 2.6, 6, a + Math.PI / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#bfa77c'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
  } else {                                          // an open oyster with a white pearl
    ctx.save(); ctx.translate(-17, 0); ctx.rotate(-0.45); ctx.translate(17, 0);                // the lid, tipped open from its hinge
    ctx.fillStyle = '#8f8aa6'; ctx.beginPath(); ctx.moveTo(-18, -2);
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; ctx.lineTo(Math.cos(a) * 18, -2 + Math.sin(a) * (10 + (i % 2) * 1.6)); }
    ctx.closePath(); ctx.fill(); line(1.4);
    ctx.restore();
    ctx.fillStyle = '#b3aec8'; ctx.beginPath(); ctx.moveTo(-19, 2);                            // the lower shell, with a ruffled edge
    for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; ctx.lineTo(Math.cos(Math.PI - a) * 19, 2 + Math.sin(a) * (14 + (i % 2) * 1.8)); }
    ctx.closePath(); ctx.fill(); line();
    ctx.fillStyle = '#e6e0f0'; ctx.beginPath(); ctx.ellipse(0, 3, 14, 9, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 2, 6.5, 0, Math.PI * 2); ctx.fill(); line(1.2);
    ctx.fillStyle = 'rgba(200,190,230,.6)'; ctx.beginPath(); ctx.arc(1.6, 3.6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-2, 0, 1.8, 0, Math.PI * 2); ctx.fill();
  }
}
function drawUrchin(o, sy) {
  if (o.shell) {
    const k = o.r * 0.88 / 20;
    blit(sharedSprite('shell-' + o.shell, 44, 44, 22, 22, () => paintShell(o.shell)), o.x, sy, 0, k, k);
    return;
  }
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

// the Ocean's Charged Beam warning (v188): a bright orange dashed line on a dark edge, so it reads on the pale reef
// water and in the black abyss alike (the pale line in each look's own colour was barely visible)
function seaBeamWarn(x0, L, t) {
  const k = Math.min(1, t / 0.7);
  ctx.save(); ctx.setLineDash([8, 6]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0);
  ctx.globalAlpha = 0.55 + 0.45 * k;
  ctx.strokeStyle = 'rgba(20,10,30,.75)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = '#ff8a1a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

// electric eel: lies along its wall; charging shows a dashed preview, then a lightning bolt crosses
function drawZap(o, sy) {
  ctx.save();
  toolFrame(o, sy);
  const x0 = ZAP_BODY, L = o.len;
  if (o.phase === 'charge') {
    seaBeamWarn(x0, L, o.t);
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

// legendary fish (Legendary fish collection, v106): starfish variants (Spinning Drifter), drawn facing right inside a
// 20-unit circle (the starfish's hit circle)
function paintLegendFish(name) {
  const line = (w = 1.5) => inkStroke(w);
  const eye = (x, y, r = 3.4) => {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); line(1.1);
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x + r * 0.3, y, r * 0.5, 0, Math.PI * 2); ctx.fill();
  };
  const tail = (fill, x0, h) => {   // a forked tail from x0 back to the circle's edge
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(-19, -h); ctx.quadraticCurveTo(-14, 0, -19, h); ctx.closePath(); ctx.fill(); line(1.3);
  };
  if (name === 'golden') {                         // a round golden fish with a crown fin and sparkles
    tail('#f2b02a', -9, 13);
    ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.ellipse(2, 0, 15, 13, 0, 0, Math.PI * 2); ctx.fill(); line();
    ctx.fillStyle = '#f2b02a'; ctx.beginPath(); ctx.moveTo(-6, -11); ctx.lineTo(-4, -18); ctx.lineTo(0, -13); ctx.lineTo(3, -19); ctx.lineTo(6, -12.5); ctx.closePath(); ctx.fill(); line(1.2);
    ctx.strokeStyle = 'rgba(190,120,20,.6)'; ctx.lineWidth = 1.3; ctx.beginPath();
    for (const x of [-4, 2]) { ctx.moveTo(x, -9); ctx.quadraticCurveTo(x + 4, 0, x, 9); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(4, -6, 6, 2.4, -0.2, 0, Math.PI * 2); ctx.fill();
    eye(10, -3);
    ctx.fillStyle = '#ffffff'; for (const [x, y] of [[-12, -15], [15, 11]]) { ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 1, y - 1); ctx.lineTo(x + 3, y); ctx.lineTo(x + 1, y + 1); ctx.lineTo(x, y + 3); ctx.lineTo(x - 1, y + 1); ctx.lineTo(x - 3, y); ctx.lineTo(x - 1, y - 1); ctx.closePath(); ctx.fill(); }
  } else if (name === 'narwhal') {                 // a plump grey-blue whale with a spotted back and a long spiral tusk
    ctx.fillStyle = '#f3ead2'; ctx.beginPath(); ctx.moveTo(12, -4); ctx.lineTo(25, -9); ctx.lineTo(13, 0); ctx.closePath(); ctx.fill(); line(1.1);
    ctx.strokeStyle = 'rgba(140,120,80,.7)'; ctx.lineWidth = 0.9; ctx.beginPath(); for (const t of [0.3, 0.55, 0.8]) { const x = 12 + 13 * t, y = -4 - 5 * t; ctx.moveTo(x - 1, y - 1.6 + t); ctx.lineTo(x + 1, y + 2 - t); } ctx.stroke();
    ctx.fillStyle = '#7f9bb5'; ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(-20, -6); ctx.lineTo(-18, 2); ctx.lineTo(-20, 9); ctx.closePath(); ctx.fill(); line(1.3);
    ctx.fillStyle = '#7f9bb5'; ctx.beginPath(); ctx.ellipse(1, 1, 15, 12, 0, 0, Math.PI * 2); ctx.fill(); line();
    ctx.fillStyle = '#e4ecf2'; ctx.beginPath(); ctx.ellipse(3, 7, 11, 5, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = 'rgba(40,60,90,.35)'; for (const [x, y, r] of [[-6, -6, 1.8], [-1, -8, 1.4], [-9, -1, 1.5], [3, -5, 1.2]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#6a86a0'; ctx.beginPath(); ctx.ellipse(0, 6, 5, 2.4, 0.5, 0, Math.PI * 2); ctx.fill(); line(1);
    eye(9, -2, 2.6);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(11, 3, 3, 0.2, 1.4); ctx.stroke();
  } else if (name === 'coelacanth') {              // a stocky deep-blue living fossil with white flecks and lobed fins
    ctx.fillStyle = '#2f4f7a'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-19, -7); ctx.lineTo(-16, 0); ctx.lineTo(-19, 7); ctx.closePath(); ctx.fill(); line(1.3);
    ctx.fillStyle = '#3a5f8f';
    for (const [x, y, a] of [[-4, -12, -0.5], [-4, 12, 0.5], [6, 11, 0.9]]) { ctx.beginPath(); ctx.ellipse(x, y, 5, 3, a, 0, Math.PI * 2); ctx.fill(); line(1.1); }
    ctx.beginPath(); ctx.ellipse(3, 0, 16, 11, 0, 0, Math.PI * 2); ctx.fill(); line();
    ctx.fillStyle = '#e8f0ff'; for (const [x, y, r] of [[-6, -4, 1.6], [-1, 3, 1.4], [4, -6, 1.3], [-8, 5, 1.2], [8, 4, 1.5], [1, -1, 1]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = 'rgba(10,20,40,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(11, -8); ctx.quadraticCurveTo(8, 0, 11, 8); ctx.stroke();
    eye(14, -3, 3);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(15, 4); ctx.lineTo(19, 3); ctx.stroke();
  } else if (name === 'squideye') {               // a huge round eye in red squid skin, with tentacle tips curling around it
    ctx.fillStyle = '#c0392b';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(12, -4); ctx.quadraticCurveTo(21, -4, 20, 3); ctx.quadraticCurveTo(18, 6, 16, 3); ctx.lineTo(12, 4); ctx.closePath(); ctx.fill(); line(1.1); ctx.restore(); }
    ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); line();
    ctx.fillStyle = '#f7f2e4'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); line(1.2);
    ctx.fillStyle = '#e8b84a'; ctx.beginPath(); ctx.arc(1, 0, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.ellipse(1, 0, 2.6, 6.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-3, -4, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(120,20,20,.5)'; for (const [x, y] of [[-9, -11], [10, 11], [12, -9]]) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill(); }
  } else {                                          // ghost shark: a pale, see-through chubby shark with a glowing outline
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#dff4f2'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-20, -9); ctx.quadraticCurveTo(-15, 0, -19, 7); ctx.closePath(); ctx.fill(); line(1.3);
    ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(-1, -19); ctx.lineTo(5, -10); ctx.closePath(); ctx.fill(); line(1.2);
    ctx.beginPath(); ctx.moveTo(-14, 4); ctx.quadraticCurveTo(-6, -13, 8, -11); ctx.quadraticCurveTo(19, -8, 19, 0); ctx.quadraticCurveTo(18, 9, 6, 11); ctx.quadraticCurveTo(-8, 12, -14, 4); ctx.closePath(); ctx.fill(); line();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#b8e2de'; ctx.beginPath(); ctx.moveTo(-1, 5); ctx.lineTo(-6, 15); ctx.lineTo(4, 8); ctx.closePath(); ctx.fill(); line(1.1);
    ctx.strokeStyle = 'rgba(90,150,150,.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const x of [3, 6, 9]) { ctx.moveTo(x, -3); ctx.lineTo(x - 1, 3); } ctx.stroke();
    ctx.fillStyle = '#5fe0d8'; ctx.beginPath(); ctx.arc(12, -3, 2.8, 0, Math.PI * 2); ctx.fill(); line(1);
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(10, 5); ctx.lineTo(18, 3); ctx.lineTo(16, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(12, 4.6); ctx.lineTo(13, 6.2); ctx.lineTo(14, 4.2); ctx.closePath(); ctx.fill();
  }
}
function drawStarfish(o, sy) {
  if (o.fish) { blit(sharedSprite('fish-' + o.fish, 56, 56, 28, 28, () => paintLegendFish(o.fish)), o.x, sy, o.rot); return; }
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

// cartoon explosion: a spiky comic-book burst that pops in with an overshoot, speed lines,
// then puffy smoke clouds that drift up and fade. T is seconds since the blast (deadly for the first 0.35 s).
const BOOM_END = 0.95;
function paintBoomBurst() {
  const star = (n, tip, valley, rot) => {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = rot + i / (n * 2) * Math.PI * 2, r = i % 2 ? valley : i % 4 ? tip * 0.86 : tip;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  };
  ctx.lineJoin = 'round';
  star(12, 70, 48, 0); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.stroke();
  star(10, 50, 33, 0.35); ctx.fillStyle = '#ff8a2a'; ctx.fill();
  star(8, 30, 20, 0.1); ctx.fillStyle = '#fff3b0'; ctx.fill();
}
function drawBoom(o, sy, T) {
  const s = o.blast / 62;
  // smoke puffs behind the burst
  const p = clamp((T - 0.12) / (BOOM_END - 0.12), 0, 1);
  if (p > 0) {
    ctx.save();
    ctx.globalAlpha = 1 - p * p;
    ctx.fillStyle = '#eef1f3'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + o.x * 0.05, d = o.blast * (0.35 + 0.45 * p);
      const r = o.blast * (0.27 + 0.12 * (i % 2)) * (1 - 0.4 * p) * Math.min(1, p * 6);
      ctx.beginPath(); ctx.arc(o.x + Math.cos(a) * d, sy + Math.sin(a) * d - 30 * p, r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
  // the burst: pops past full size, settles, then shrinks away
  const pop = T < 0.1 ? (T / 0.1) * 1.25 : T < 0.2 ? 1.25 - (T - 0.1) / 0.1 * 0.25 : T < 0.4 ? 1 : 1 - (T - 0.4) / 0.2;
  if (pop > 0) {
    const burst = sharedSprite('boomBurst', 150, 150, 75, 75, paintBoomBurst);
    const k = s * pop;
    blit(burst, o.x, sy, Math.sin(T * 30) * 0.06, k, k);
  }
  // speed lines flying outward
  if (T < 0.3) {
    ctx.save();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.globalAlpha = 1 - T / 0.3;
    const r0 = o.blast * (1.1 + T * 1.5);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) / 8 * Math.PI * 2;
      ctx.moveTo(o.x + Math.cos(a) * r0, sy + Math.sin(a) * r0);
      ctx.lineTo(o.x + Math.cos(a) * (r0 + 14), sy + Math.sin(a) * (r0 + 14));
    }
    ctx.stroke();
    ctx.restore();
  }
}

// naval mine on a chain: blinks with its blast circle showing, then explodes
function drawMine(o, sy) {
  ctx.strokeStyle = 'rgba(70,80,92,.7)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); for (let y = 18; y < 130; y += 9) { ctx.moveTo(o.x - 2, sy + y); ctx.lineTo(o.x + 2, sy + y + 6); } ctx.stroke();
  if (o.phase === 'boom' || (o.phase === 'gone' && o.t < BOOM_END - 0.35)) {
    drawBoom(o, sy, o.phase === 'boom' ? o.t : 0.35 + o.t);
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
