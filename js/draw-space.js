// Paper Nosedive — Art for the Space map obstacles.
'use strict';

// Space obstacles reuse a Paper / Ocean obstacle's movement and collision (see SPACE_MAKERS) and only
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
  const m = MINERALS[o.spaceCol] || MINERALS.nickel, R = o.r + 4;
  blit(ownSprite(o, 'spr', R * 2 + 6, R * 2 + 6, R + 3, R + 3, () => {
    rockPath(o.r, o.r); ctx.fillStyle = m.rock; ctx.fill();
    craters(o.r, o.r);
    paintMinerals(o.r, o.r, m);
    rockPath(o.r, o.r); spaceStroke(1.4);
  }), o.x, sy);
}

// tumbling asteroid (Spinning Drifter, in place of the starfish)
function drawTumbler(o, sy) {
  const key = o.spaceCol || 'iron', m = MINERALS[key] || MINERALS.iron;
  blit(sharedSprite('tumbler' + key, 52, 52, 26, 26, () => {
    rockPath(22, 3.3, 9); ctx.fillStyle = m.rock; ctx.fill();
    craters(22, 2); paintMinerals(22, 3.3, m); rockPath(22, 3.3, 9); spaceStroke(1.4);
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

// ---------- more Space obstacles (v57) ----------

// asteroid minerals: the rock colour plus flecks / veins / crystals of what it is made of
const MINERALS = {
  iron:     { rock: '#8a6a58', min: '#c0503a', style: 'veins' },
  nickel:   { rock: '#7d8590', min: '#e6edf4', style: 'flecks' },
  copper:   { rock: '#7a6f62', min: '#3fbf9a', style: 'patches' },
  gold:     { rock: '#6f6a73', min: '#ffd23f', style: 'flecks' },
  ice:      { rock: '#9fb8c8', min: '#f2fbff', style: 'patches' },
  amethyst: { rock: '#6a5d70', min: '#b77cf0', style: 'crystals' }
};
function paintMinerals(r, seed, m) {
  const h = i => Math.abs(Math.sin(seed * 91.7 + i * 13.3));
  ctx.save(); rockPath(r, seed); ctx.clip();
  ctx.fillStyle = m.min; ctx.strokeStyle = m.min;
  for (let i = 0; i < 7; i++) {
    const a = h(i) * 6.28, d = r * (0.15 + 0.7 * h(i + 7)), x = Math.cos(a) * d, y = Math.sin(a) * d;
    if (m.style === 'veins') { ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 5, y - 2); ctx.quadraticCurveTo(x, y + 3, x + 6, y - 1); ctx.stroke(); }
    else if (m.style === 'patches') { ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.ellipse(x, y, r * 0.16, r * 0.1, a, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    else if (m.style === 'crystals') { ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 3, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 3, y); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(x, y, 1.3 + h(i + 3) * 1.4, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

// the eight planets of the Solar System, in their real colours; sizes keep the real order, squeezed to fit
const PLANETS = {
  mercury: { r: 42, col: '#9c9690', paint(r) { craters(r, 5); } },
  venus:   { r: 58, col: '#e8c98a', bands: ['rgba(255,240,200,.45)', 'rgba(190,150,80,.25)'] },
  earth:   { r: 60, col: '#2f6fd1', paint(r) {
    ctx.fillStyle = '#3f9a4f';
    for (const [x, y, w, h] of [[-0.3, -0.25, 0.32, 0.22], [0.25, 0.1, 0.28, 0.35], [-0.15, 0.35, 0.22, 0.14]]) { ctx.beginPath(); ctx.ellipse(x * r, y * r, w * r, h * r, 0.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (const [x, y, w] of [[-0.1, -0.55, 0.4], [0.3, 0.55, 0.35], [-0.45, 0.1, 0.25]]) { ctx.beginPath(); ctx.ellipse(x * r, y * r, w * r, 0.06 * r, 0.1, 0, Math.PI * 2); ctx.fill(); }
  } },
  mars:    { r: 48, col: '#c8603a', paint(r) {
    ctx.fillStyle = 'rgba(120,40,20,.35)'; ctx.fillRect(-r, -0.1 * r, 2 * r, 0.12 * r);
    ctx.fillStyle = '#f4ece6'; ctx.beginPath(); ctx.ellipse(0, -0.9 * r, 0.35 * r, 0.12 * r, 0, 0, Math.PI * 2); ctx.fill();
  } },
  jupiter: { r: 120, col: '#d9a066', bands: ['#c08850', '#ead2a8', '#b9784a', '#e6c79a', '#c08850'], paint(r) {
    ctx.fillStyle = '#b5543a'; ctx.beginPath(); ctx.ellipse(0.25 * r, 0.3 * r, 0.2 * r, 0.11 * r, 0, 0, Math.PI * 2); ctx.fill();   // the Great Red Spot
  } },
  saturn:  { r: 100, col: '#e3c27a', bands: ['#cfa95f', '#f0dcaa', '#d4b06a'], ring: '#e8d7a8' },
  uranus:  { r: 76, col: '#9fe0e8', bands: ['rgba(255,255,255,.18)'] },
  neptune: { r: 74, col: '#3f62d6', bands: ['rgba(120,160,255,.35)'], paint(r) {
    ctx.fillStyle = 'rgba(20,30,90,.55)'; ctx.beginPath(); ctx.ellipse(-0.2 * r, 0.2 * r, 0.18 * r, 0.1 * r, 0, 0, Math.PI * 2); ctx.fill();
  } }
};
function paintPlanet(p, r) {
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = p.col; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  if (p.bands) p.bands.forEach((b, i) => { ctx.fillStyle = b; ctx.fillRect(-r, -r + (i + 0.6) * (2 * r / (p.bands.length + 0.6)), 2 * r, r * 0.16); });
  if (p.paint) p.paint(r);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.arc(r * 0.35, r * 0.35, r * 1.05, 0, Math.PI * 2); ctx.fill();   // night side
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); spaceStroke(1.6);
}
// a planet bulging in from the edge (Wall Bulge); Saturn's ring is drawn faint because only the planet is solid
// a whole planet centred on (0, 0), with Saturn's faint ring behind and in front (also used by the Collections screen)
function paintPlanetFull(name, r) {
  const p = PLANETS[name];
  if (p.ring) { ctx.globalAlpha = 0.45; ctx.strokeStyle = p.ring; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.8, r * 0.45, -0.3, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  paintPlanet(p, r);
  if (p.ring) {                                    // the front half of the ring over the planet
    ctx.globalAlpha = 0.45; ctx.strokeStyle = p.ring; ctx.lineWidth = r * 0.12;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.8, r * 0.45, -0.3, 0.05 * Math.PI, 0.95 * Math.PI); ctx.stroke(); ctx.globalAlpha = 1;
  }
}
function drawPlanetEdge(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r * 1.9;
  blit(sharedSprite('planet-' + o.planet, R * 2, R * 2, R, R, () => paintPlanetFull(o.planet, o.r)), cx, sy);
}

// a black hole (static hazard): a black core inside a bright photon ring and a spinning accretion disc.
// It does not pull the plane; touching it ends the run.
function drawBlackHole(o, sy) {
  const disc = sharedSprite('bhDisc', 96, 40, 48, 20, () => {
    ctx.strokeStyle = '#ff9a3c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 42, 13, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ffe2a0'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([6, 10]); ctx.strokeStyle = '#fff3c8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 36, 10, 0, 0, Math.PI * 2); ctx.stroke();
  });
  const t = performance.now() / 1000;
  blit(disc, o.x, sy, -0.25 + Math.sin(t * 0.7) * 0.05, 1, 1);
  ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(o.x, sy, o.r * 0.85, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffcf7a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(o.x, sy, o.r * 0.9, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,207,122,.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(o.x, sy, o.r * 1.02, t * 2, t * 2 + 4); ctx.stroke();
}

// the International Space Station (a long Bouncing Slider): truss, modules and golden solar arrays
function drawISS(o, sy) {
  const L = o.len / 2;
  const s = ownSprite(o, 'spr', o.len + 12, 40, L + 6, 20, () => {
    ctx.fillStyle = '#c9ced6'; ctx.fillRect(-L, -2.5, o.len, 5);                        // the main truss
    for (const k of [-0.85, -0.55, 0.55, 0.85]) {                                     // four pairs of solar arrays
      const x = k * L;
      for (const d of [-1, 1]) {
        ctx.fillStyle = '#d99a3a'; ctx.fillRect(x - 7, d < 0 ? -14 : 2.5, 14, 11.5);
        ctx.strokeStyle = 'rgba(120,60,10,.6)'; ctx.lineWidth = 0.8; ctx.beginPath();
        for (let yy = 0; yy < 11; yy += 3) { const y0 = (d < 0 ? -14 : 2.5) + yy; ctx.moveTo(x - 7, y0); ctx.lineTo(x + 7, y0); }
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#f2f2f2';                                                           // the pressurised modules in the middle
    ctx.beginPath(); roundRectPath(-22, -6, 44, 12, 5); ctx.fill(); spaceStroke(1.1);
    ctx.beginPath(); roundRectPath(-5, -13, 10, 26, 4); ctx.fill(); spaceStroke(1.1);
    ctx.fillStyle = '#ffffff'; for (const x of [-0.3, 0.3]) ctx.fillRect(x * L - 4, -12, 8, 24);   // radiators
    ctx.beginPath(); ctx.rect(-L, -2.5, o.len, 5); spaceStroke(1);
  });
  blit(s, o.x, sy, o.a);
}

// a GPS satellite (Bouncing Slider): gold-foil body, a white antenna panel, blue solar wings
function drawGPS(o, sy) {
  const L = o.len / 2, col = o.spaceCol || '#4f8ff0';
  const s = ownSprite(o, 'spr', o.len + 10, 34, L + 5, 17, () => {
    for (const d of [-1, 1]) {
      const x0 = d < 0 ? -L : 16, w = L - 16;
      ctx.fillStyle = col; ctx.fillRect(x0, -6.5, w, 13);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = x0 + 9; x < x0 + w; x += 9) { ctx.moveTo(x, -6.5); ctx.lineTo(x, 6.5); }
      ctx.stroke(); ctx.beginPath(); ctx.rect(x0, -6.5, w, 13); spaceStroke(1.2);
      ctx.strokeStyle = SPACE_LINE; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(d * 10, 0); ctx.lineTo(d * 16, 0); ctx.stroke();
    }
    ctx.fillStyle = '#e0b84a'; ctx.beginPath(); roundRectPath(-11, -11, 22, 22, 2); ctx.fill(); spaceStroke(1.3);
    ctx.fillStyle = '#f2f2f2'; ctx.fillRect(-7, -7, 14, 14);                             // antenna array
    ctx.fillStyle = '#8fa3b8'; for (const [x, y] of [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
  });
  blit(s, o.x, sy, o.a);
}

// a Starlink satellite (one of a train crossing): a flat dark body with one long solar panel
function drawStarlink(x, sy) {
  blit(sharedSprite('starlink', 44, 20, 22, 10, () => {
    ctx.fillStyle = '#3a3f4a'; ctx.beginPath(); roundRectPath(-17, -3, 14, 6, 1.5); ctx.fill(); spaceStroke(1);
    ctx.fillStyle = '#2b4fa8'; ctx.fillRect(-3, -4.5, 20, 9);
    ctx.strokeStyle = 'rgba(160,190,255,.6)'; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let xx = 1; xx < 17; xx += 4) { ctx.moveTo(xx, -4.5); ctx.lineTo(xx, 4.5); }
    ctx.stroke(); ctx.beginPath(); ctx.rect(-3, -4.5, 20, 9); spaceStroke(1);
  }), x, sy);
}

// --- sci-fi movie style (original designs) ---
// a twin-wing fighter parked at the wall, firing red laser bolts across (Wall Turret)
function drawFighter(o, sy) {
  const dir = inward(o);
  for (const b of o.blobs) {                       // laser bolts
    ctx.save(); ctx.translate(b.x, sy); ctx.scale(dir, 1);
    ctx.fillStyle = 'rgba(255,60,60,.35)'; ctx.beginPath(); roundRectPath(-14, -5, 28, 10, 5); ctx.fill();
    ctx.fillStyle = '#ff4040'; ctx.beginPath(); roundRectPath(-11, -2.5, 22, 5, 2.5); ctx.fill();
    ctx.fillStyle = '#ffd6d6'; ctx.fillRect(-8, -1, 16, 2);
    ctx.restore();
  }
  const ship = sharedSprite('fighter' + dir, 180, 64, 90, 32, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = '#7d8590'; ctx.fillRect(4, -2, 54, 4);                              // the strut
    for (const x of [8, 44]) {                                                          // two hexagonal wing panels
      ctx.fillStyle = '#4a4f58';
      ctx.beginPath(); ctx.moveTo(x, -26); ctx.lineTo(x + 10, -18); ctx.lineTo(x + 10, 18); ctx.lineTo(x, 26); ctx.lineTo(x - 2, 0); ctx.closePath(); ctx.fill(); spaceStroke(1.2);
      ctx.strokeStyle = 'rgba(200,210,225,.5)'; ctx.lineWidth = 0.8; ctx.beginPath();
      for (let yy = -18; yy <= 18; yy += 6) { ctx.moveTo(x + 1, yy); ctx.lineTo(x + 9, yy); } ctx.stroke();
    }
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.arc(31, 0, 11, 0, Math.PI * 2); ctx.fill(); spaceStroke(1.3);   // cockpit ball
    ctx.fillStyle = '#2b3a55'; ctx.beginPath(); ctx.arc(31, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2b3a55'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.moveTo(31, 0); ctx.lineTo(31 + Math.cos(a) * 6, Math.sin(a) * 6); } ctx.stroke();
    ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(66, 0, 3, 0, Math.PI * 2); ctx.fill();   // gun
  });
  blit(ship, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {          // the gun glows just before it fires
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#ff5a4a' : '#ffd0c8';
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 66, sy, 4, 0, Math.PI * 2); ctx.fill();
  }
}
// a grey battle-station sphere with a dish, bulging in from the edge (Wall Bulge)
function drawBattleStation(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 6;
  blit(ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = '#8f96a0'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-o.r, -2, o.r * 2, 5);                     // the equator trench
    ctx.strokeStyle = 'rgba(40,45,55,.35)'; ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(-o.r, i * o.r * 0.2); ctx.lineTo(o.r, i * o.r * 0.2 + 2); ctx.stroke(); }
    const dx = o.r * 0.3 * -o.side;                                                           // the dish faces the playfield
    ctx.fillStyle = '#70777f'; ctx.beginPath(); ctx.arc(dx, -o.r * 0.4, o.r * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a6068'; ctx.beginPath(); ctx.arc(dx, -o.r * 0.4, o.r * 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.arc(o.r * 0.35, o.r * 0.35, o.r * 1.05, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); spaceStroke(1.6);
  }), cx, sy);
}
// a glowing energy blade swinging out of a hilt on the wall after a dashed warning (Telegraphed Sweep)
function drawEnergyBlade(o, sy) {
  const col = o.spaceCol || '#ff4a5a';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.3 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  ctx.rotate(o.ext > 0 ? o.ang : 0);
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.lineCap = 'round';
    ctx.strokeStyle = col; ctx.globalAlpha = 0.35; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(len, 0); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 8; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.fillStyle = '#b8c0cc'; ctx.beginPath(); roundRectPath(-6, -5, 26, 10, 2); ctx.fill(); spaceStroke(1.2);   // the hilt
  ctx.fillStyle = '#4a4f58'; for (const x of [2, 7, 12]) ctx.fillRect(x, -5, 2, 10);
  ctx.restore();
}

// ---------- Space's added looks and mechanics (v129) ----------
// Original alternatives (SPACE_ALT in obstacles.js) to the looks that echo famous films, picked half the time: a wormhole,
// a hull turret, a robotic welding torch and an asteroid base; plus two mechanics Space had not used: a tether cable
// between two little satellites (Spring Line) and a satellite spinning two solar panels (Spinning Blades).
// Returns false for every other look, so render.js draws it.
function drawSpaceExtra(o, sy) {
  switch (o.look) {
    case 'wormhole': drawWormhole(o, sy); return true;
    case 'turret': drawHullTurret(o, sy); return true;
    case 'torch': drawWeldingTorch(o, sy); return true;
    case 'asteroidbase': drawAsteroidBase(o, sy); return true;
    case 'tether': drawTether(o, sy); return true;
    case 'panels': drawSolarPanels(o, sy); return true;
  }
  return false;
}

// Static Hazards: a wormhole, swirling rings around a bright core (deadly to touch, pulls nothing), in the hit circle
function drawWormhole(o, sy) {
  const R = o.r * 0.88, t = performance.now() / 1000;
  ctx.save();
  ctx.translate(o.x, sy);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#b48cff'); g.addColorStop(0.7, '#3a2a8a'); g.addColorStop(1, 'rgba(40,20,90,.2)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {                    // spiral arms turning
    ctx.strokeStyle = k % 2 ? 'rgba(120,220,255,.8)' : 'rgba(220,180,255,.8)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let s = 0; s <= 1; s += 0.08) { const a = t * 1.5 + k * Math.PI / 2 + s * 3.2, d = R * (0.15 + 0.8 * s); ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); }
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); spaceStroke(1.6);
  ctx.restore();
}

// Wall Turret: a gun turret bolted to the station hull, firing blue plasma balls; its muzzle glows before each shot
function drawHullTurret(o, sy) {
  const dir = inward(o);
  for (const b of o.blobs) {
    ctx.fillStyle = 'rgba(90,180,255,.35)'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7fd0ff'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.85, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  const gun = sharedSprite('hullturret' + dir, 180, 52, 90, 26, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = '#8d96a3'; ctx.beginPath(); ctx.moveTo(-4, -11); ctx.lineTo(40, -11); ctx.quadraticCurveTo(58, -10, 60, 0); ctx.quadraticCurveTo(58, 10, 40, 11); ctx.lineTo(-4, 11); ctx.closePath(); ctx.fill(); spaceStroke(1.3);
    ctx.fillStyle = '#e8b030'; for (let x = 0; x < 30; x += 8) { ctx.beginPath(); ctx.moveTo(x, 11); ctx.lineTo(x + 4, 11); ctx.lineTo(x + 8, 5); ctx.lineTo(x + 4, 5); ctx.closePath(); ctx.fill(); }   // hazard stripes
    ctx.fillStyle = '#5a6270'; ctx.beginPath(); ctx.arc(34, -2, 6, 0, Math.PI * 2); ctx.fill(); spaceStroke(1);                                              // the sensor eye
    ctx.fillStyle = '#7fd0ff'; ctx.beginPath(); ctx.arc(34, -2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); roundRectPath(56, -4, 22, 8, 2); ctx.fill(); spaceStroke(1.1);                                             // the barrel
    ctx.fillStyle = '#2b3240'; ctx.fillRect(74, -2.5, 4, 5);
  });
  blit(gun, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#7fd0ff' : '#ffffff';
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 78, sy, 4, 0, Math.PI * 2); ctx.fill();
  }
}

// Telegraphed Sweep: a robotic welding arm swinging out of a hatch, a blue flame at its nozzle, after a dashed wedge
function drawWeldingTorch(o, sy) {
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save(); ctx.strokeStyle = '#7fd0ff'; ctx.globalAlpha = 0.3 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke(); ctx.restore();
  }
  ctx.rotate(o.ext > 0 ? o.ang : 0);
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); roundRectPath(10, -7, len - 34, 14, 5); ctx.fill(); spaceStroke(1.2);   // the arm
    ctx.fillStyle = '#e8b030'; for (let x = 24; x < len - 30; x += 26) ctx.fillRect(x, -7, 5, 14);                       // joints
    ctx.fillStyle = '#8d96a3'; ctx.beginPath(); ctx.moveTo(len - 26, -9); ctx.lineTo(len - 14, -5); ctx.lineTo(len - 14, 5); ctx.lineTo(len - 26, 9); ctx.closePath(); ctx.fill(); spaceStroke(1.1);   // the nozzle
    ctx.fillStyle = 'rgba(90,180,255,.4)'; ctx.beginPath(); ctx.ellipse(len - 3, 0, 15, 11, 0, 0, Math.PI * 2); ctx.fill();   // the flame
    ctx.fillStyle = '#7fd0ff'; ctx.beginPath(); ctx.moveTo(len - 14, -5); ctx.quadraticCurveTo(len + 10, 0, len - 14, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(len - 14, -2.5); ctx.quadraticCurveTo(len, 0, len - 14, 2.5); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#5a6270'; ctx.beginPath(); roundRectPath(-6, -10, 22, 20, 3); ctx.fill(); spaceStroke(1.2);           // the hatch it comes out of
  ctx.restore();
}

// Wall Bulge: a cratered asteroid with a little base on it: domes, an antenna and lit windows (an exact half-disc)
function drawAsteroidBase(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 6, i = -o.side;
  const s = ownSprite(o, 'sprA', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = '#8a7f74'; ctx.fill();
    ctx.save(); ctx.clip();
    craters(o.r, 3);
    ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.arc(-i * o.r * 0.2, -o.r * 0.3, o.r * 0.7, 0, Math.PI * 2); ctx.fill();
    for (const [a, d, r] of [[-0.5, 0.55, 16], [0.15, 0.62, 12], [0.6, 0.5, 10]]) {          // domes with lit windows
      const x = i * Math.cos(a) * o.r * d, y = Math.sin(a) * o.r * d;
      ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); spaceStroke(1.2);
      ctx.fillStyle = '#ffe58a'; for (const k of [-0.4, 0, 0.4]) ctx.fillRect(x + k * r - 1.5, y - 1.5, 3, 3);
    }
    const ax = i * o.r * 0.35, ay = -o.r * 0.6;    // a dish antenna on a mast
    ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay + 10); ctx.lineTo(ax, ay - 2); ctx.stroke();
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.ellipse(ax, ay - 4, 8, 3.5, -0.4, 0, Math.PI * 2); ctx.fill(); spaceStroke(1);
    ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(ax + 3, ay - 9, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); spaceStroke(1.6);
  });
  blit(s, cx, sy);
}

// Spring Line: a tether cable between two little satellites; the cable bounces the plane, the satellites hurt
function drawTether(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y;
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9), bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + 3;
  const line = () => { ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); };
  ctx.save(); ctx.lineCap = 'round';
  line(); ctx.strokeStyle = 'rgba(230,238,255,.5)'; ctx.lineWidth = 4; ctx.stroke();
  line(); ctx.strokeStyle = '#e8b030'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  const sat = sharedSprite('tethersat', 24, 24, 12, 12, () => {
    ctx.fillStyle = '#4f8ff0'; ctx.fillRect(-9, -3, 4, 6); ctx.fillRect(5, -3, 4, 6);
    ctx.fillStyle = '#e0b040'; ctx.beginPath(); roundRectPath(-5, -5, 10, 10, 2); ctx.fill(); spaceStroke(1.1);
    ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill();
  });
  blit(sat, o.x1, sy + dy1); blit(sat, o.x2, sy + dy2);
}

// Spinning Blades: a satellite spinning two long solar panels that open and close, a counterweight pod behind each
function drawSolarPanels(o, sy) {
  const wing = sharedSprite('solarwing', 106, 26, 34, 13, () => {
    ctx.fillStyle = '#c9ced6'; ctx.fillRect(-2, -1.5, 10, 3);                                       // the boom
    ctx.fillStyle = '#2f5fb8'; ctx.beginPath(); ctx.rect(8, -4, 58, 8); ctx.fill(); spaceStroke(1.1);   // the panel
    ctx.strokeStyle = 'rgba(200,220,255,.6)'; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let x = 15; x < 66; x += 7) { ctx.moveTo(x, -4); ctx.lineTo(x, 4); } ctx.moveTo(8, 0); ctx.lineTo(66, 0); ctx.stroke();
    ctx.fillStyle = '#e0b040'; ctx.beginPath(); ctx.arc(-22, 0, 9, 0, Math.PI * 2); ctx.fill(); spaceStroke(1.2);   // the pod
    ctx.fillStyle = '#c9ced6'; ctx.fillRect(-14, -1.5, 12, 3);
    ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(-22, 0, 2, 0, Math.PI * 2); ctx.fill();
  });
  for (const s of [-1, 1]) blit(wing, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.arc(o.x, sy, 5, 0, Math.PI * 2); ctx.fill(); spaceStroke(1.1);
}
