// Paper Nosedive — Art for the Neon City map obstacles.
'use strict';

// Neon City obstacles reuse a Paper or Ocean obstacle's movement and collision (see CITY_MAKERS) and only change
// the look (o.look, see CITY_LOOKS) in a few neon colours (o.cityCol). The streets are dark, so obstacles are dark
// metal with bright neon tubes, lit windows and warning lights. Every solid part stays inside the mechanic's
// collision shape; only the soft neon glow spills a little past it.
const CITY_LINE = '#0a0a14';
function cityStroke(w = 1.6) { ctx.strokeStyle = CITY_LINE; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
const METAL = '#3a3f58', METAL_HI = '#5a6180', HAZARD = '#ffc21f', GLASS = '#14203a';
const cityLight = a => `rgba(255,255,255,${a})`, cityShade = a => `rgba(0,0,0,${a})`;

function drawCityObstacle(o, sy) {
  if (CITY_EXTRA[o.look] && CITY_EXTRA[o.look](o, sy) !== false) return;   // the looks added in v129
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawCitySlab(-10, l, sy, l, -1, o); drawCitySlab(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawCityJaw(-10, l, sy, l, -1, o); drawCityJaw(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'blot': drawCityHazard(o, sy); break;
    case 'protractor': drawCityBulge(o, sy); break;
    case 'pencil': drawCitySlider(o, sy); break;
    case 'wad': drawCityProjectile(o, sy); break;
    case 'note': drawCitySwarm(o, sy); break;
    case 'clips': for (const x of clipXs(o)) drawCityCar(x, sy, o.v > 0 ? 1 : -1, o.cityCol, o.look); break;
    case 'starfish': drawCitySpinner(o, sy); break;
    case 'scissors': drawCityRotors(o, sy); break;
    case 'compass': drawCityCrane(o, sy); break;
    case 'cutter': drawCityPiston(o, sy); break;
    case 'glue': drawCityTurret(o, sy); break;
    case 'zap': drawCityBeam(o, sy); break;
    case 'paw': drawCityBarrier(o, sy); break;
    case 'mine': drawCityBlast(o, sy); break;
    case 'fan': drawCityVent(o, sy); break;
    case 'bubbles': drawHoloField(o, sy); break;
    case 'band': drawCityCable(o, sy); break;
  }
}

// ---------- Gap Wall: neon shop signs or steel balconies from each wall, 22 thick ----------
function drawCitySlab(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.cityCol || '#ff4fd8';
  const each = (step, f) => { for (let x = innerX + outDir * step, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * step, i++) f(x, i); };
  ctx.save();
  if (o.look === 'balcony') {                      // a railing on top of a slab with a strip of lit windows
    ctx.fillStyle = METAL; ctx.beginPath(); ctx.rect(x0, sy - 1, x1 - x0, 12); ctx.fill();
    ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(x0, sy + 3, x1 - x0, 3); ctx.globalAlpha = 1;
    ctx.fillStyle = cityShade(0.5); each(14, x => ctx.fillRect(x - 1, sy + 3, 2, 3));
    ctx.beginPath(); ctx.rect(x0, sy - 1, x1 - x0, 12); cityStroke(1.4);
    ctx.strokeStyle = METAL_HI; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x0, sy - 9.5); ctx.lineTo(x1, sy - 9.5);
    each(8, x => { ctx.moveTo(x, sy - 9.5); ctx.lineTo(x, sy - 1); });
    ctx.moveTo(innerX + outDir * 1.5, sy - 10.5); ctx.lineTo(innerX + outDir * 1.5, sy - 1);
    ctx.stroke();
  } else {                                         // a dark board with a neon tube border and neon "lettering"
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 4); ctx.fillStyle = '#17122b'; ctx.fill(); cityStroke(1.6);
    ctx.beginPath(); roundRectPath(x0 + 4, sy - 7, x1 - x0 - 8, 14, 4); neonStroke(col, 1.6, false);
    ctx.beginPath();
    each(15, (x, i) => { const len = 5 + (i * 7) % 6; ctx.moveTo(x, sy); ctx.lineTo(x + outDir * len, sy); });
    neonStroke(col, 1.8);
  }
  ctx.restore();
}

// ---------- Closing Jaws: rolling shop shutters or subway doors, 28 thick ----------
function drawCityJaw(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.cityCol || '#8a93a8';
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28);
  if (o.look === 'door') {                         // a subway door: a window, a coloured line and a black rubber edge
    ctx.fillStyle = '#c9d1dc'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = cityLight(0.3); ctx.fillRect(x0, sy - 14, x1 - x0, 4);
    ctx.fillStyle = col; ctx.fillRect(x0, sy + 4, x1 - x0, 4);
    const w0 = innerX + outDir * 12, w1 = innerX + outDir * 52;
    ctx.fillStyle = GLASS; ctx.fillRect(Math.min(w0, w1), sy - 10, 40, 11);
    ctx.strokeStyle = 'rgba(127,240,255,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(Math.min(w0, w1) + 8, sy); ctx.lineTo(Math.min(w0, w1) + 16, sy - 9); ctx.stroke();
    ctx.fillStyle = '#1a1a24'; ctx.fillRect(Math.min(innerX, innerX + outDir * 5), sy - 14, 5, 28);
    ctx.restore();
  } else {                                         // a rolling shutter: slats and a yellow and black edge
    ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = cityShade(0.3); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = innerX + outDir * 10; outDir > 0 ? x < x1 : x > x0; x += outDir * 5) { ctx.moveTo(x, sy - 14); ctx.lineTo(x, sy + 14); }
    ctx.stroke();
    ctx.fillStyle = cityLight(0.18); ctx.fillRect(x0, sy - 14, x1 - x0, 4);
    const e0 = Math.min(innerX, innerX + outDir * 10);
    ctx.fillStyle = HAZARD; ctx.fillRect(e0, sy - 14, 10, 28);
    ctx.fillStyle = '#1a1a24'; for (let k = -14; k < 14; k += 8) { ctx.beginPath(); ctx.moveTo(e0, sy + k); ctx.lineTo(e0 + 10, sy + k + 6); ctx.lineTo(e0 + 10, sy + k + 10); ctx.lineTo(e0, sy + k + 4); ctx.fill(); }
    ctx.restore();
  }
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); cityStroke(1.6);
  ctx.restore();
}

// ---------- Static Hazards: traffic cones, glowing manhole covers or vending machines, inside the hit circle ----------
function drawCityHazard(o, sy) {
  const col = o.cityCol || '#ff7a1f', R = o.r * 0.88, look = o.look || 'cone';
  blit(ownSprite(o, 'spr', R * 2 + 12, R * 2 + 12, R + 6, R + 6, () => {
    if (look === 'manhole') {                      // an iron cover with glowing slots
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = '#2a2d3a'; ctx.fill(); cityStroke(1.6);
      ctx.beginPath(); ctx.arc(0, 0, R * 0.8, 0, Math.PI * 2); ctx.strokeStyle = '#4a4f68'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 0.7, 0, Math.PI * 2); ctx.clip();
      ctx.beginPath(); for (let y = -R; y < R; y += R * 0.28) { ctx.moveTo(-R, y); ctx.lineTo(R, y); }
      neonStroke(col, Math.max(1.4, R * 0.07), false);
      ctx.restore();
      ctx.fillStyle = '#2a2d3a'; ctx.beginPath(); ctx.arc(0, 0, R * 0.22, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'vending') {               // a vending machine: a lit window of cans, a slot
      const w = R * 1.1, h = R * 1.6;
      ctx.beginPath(); roundRectPath(-w / 2, -h / 2, w, h, 3); ctx.fillStyle = col; ctx.fill(); cityStroke(1.5);
      ctx.fillStyle = GLASS; ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w * 0.62, h * 0.6);
      const cw = w * 0.62 / 4;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
        ctx.fillStyle = ['#ff4fd8', '#ffd23f', '#3ff0ff', '#b6ff3f'][(r + c) % 4];
        ctx.fillRect(-w / 2 + 4 + c * cw, -h / 2 + 6 + r * h * 0.2, cw - 2, h * 0.13);
      }
      ctx.fillStyle = cityLight(0.85); ctx.fillRect(w / 2 - w * 0.28, -h / 2 + 5, w * 0.2, h * 0.3);
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(-w / 2 + 4, h / 2 - h * 0.22, w - 8, h * 0.12);
    } else {                                       // a traffic cone with white stripes on a square base
      ctx.fillStyle = '#1a1a24'; ctx.beginPath(); roundRectPath(-R * 0.66, R * 0.5, R * 1.32, R * 0.22, 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-R * 0.5, R * 0.52); ctx.lineTo(-R * 0.12, -R * 0.9); ctx.lineTo(R * 0.12, -R * 0.9); ctx.lineTo(R * 0.5, R * 0.52); ctx.closePath();
      ctx.fillStyle = col; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-R, -R * 0.4, 2 * R, R * 0.2); ctx.fillRect(-R, R * 0.05, 2 * R, R * 0.2);
      ctx.fillStyle = cityLight(0.25); ctx.fillRect(-R * 0.2, -R, R * 0.12, 2 * R);
      ctx.restore();
      cityStroke(1.5);
    }
  }), o.x, sy);
}

// ---------- Wall Bulge: satellite dishes, round AC units or station clocks; the collectible neon signs ----------
// neon sign icons, drawn as neon tubes in a box of about ±20 units
const NEON_ICONS = {
  ramen: { col: '#ffb03f', ring: '#ff4fd8', name: 'Ramen bowl', paint() {
    ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(17, 0); ctx.arc(0, 0, 17, 0, Math.PI); ctx.closePath();
    ctx.moveTo(-4, -3); ctx.lineTo(14, -19); ctx.moveTo(1, -3); ctx.lineTo(18, -16);                     // chopsticks
    ctx.moveTo(-12, -4); ctx.quadraticCurveTo(-15, -9, -11, -12); ctx.quadraticCurveTo(-7, -15, -10, -19);   // steam
    ctx.moveTo(-5, 6); ctx.quadraticCurveTo(0, 2, 5, 6); ctx.quadraticCurveTo(9, 9, 12, 5);                  // noodles
  } },
  cat: { col: '#ff4fd8', ring: '#3ff0ff', name: 'Neon cat', paint() {
    ctx.beginPath(); ctx.moveTo(-14, -2); ctx.lineTo(-13, -18); ctx.lineTo(-5, -11); ctx.quadraticCurveTo(0, -13, 5, -11); ctx.lineTo(13, -18); ctx.lineTo(14, -2);
    ctx.quadraticCurveTo(14, 15, 0, 15); ctx.quadraticCurveTo(-14, 15, -14, -2);
    ctx.moveTo(-7, 0); ctx.lineTo(-4, 0); ctx.moveTo(4, 0); ctx.lineTo(7, 0);                                  // eyes
    ctx.moveTo(-2, 6); ctx.lineTo(0, 8); ctx.lineTo(2, 6);
    ctx.moveTo(-19, 4); ctx.lineTo(-10, 6); ctx.moveTo(19, 4); ctx.lineTo(10, 6);                              // whiskers
  } },
  cassette: { col: '#3ff0ff', ring: '#ff4fd8', name: 'Cassette', paint() {
    ctx.beginPath(); roundRectPath(-19, -13, 38, 26, 3);
    ctx.moveTo(-4, -2); ctx.arc(-8, -2, 4, 0, Math.PI * 2); ctx.moveTo(12, -2); ctx.arc(8, -2, 4, 0, Math.PI * 2);
    ctx.moveTo(-4, -6); ctx.lineTo(4, -6);
    ctx.moveTo(-11, 13); ctx.lineTo(-8, 7); ctx.lineTo(8, 7); ctx.lineTo(11, 13);
  } },
  bolt: { col: '#ffe03f', ring: '#9a7cff', name: 'Lightning bolt', paint() {
    ctx.beginPath(); ctx.moveTo(5, -19); ctx.lineTo(-10, 2); ctx.lineTo(0, 2); ctx.lineTo(-5, 19); ctx.lineTo(10, -3); ctx.lineTo(0, -3); ctx.closePath();
  } },
  heart: { col: '#ff3f6a', ring: '#3ff0ff', name: 'Heart', paint() {
    ctx.beginPath(); ctx.moveTo(0, 16); ctx.bezierCurveTo(-24, 0, -14, -20, 0, -8); ctx.bezierCurveTo(14, -20, 24, 0, 0, 16); ctx.closePath();
  } },
  note: { col: '#b6ff3f', ring: '#ff4fd8', name: 'Music notes', paint() {
    ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(-6, -14); ctx.lineTo(12, -18); ctx.lineTo(12, 6);
    ctx.moveTo(-6, -8); ctx.lineTo(12, -12);
    ctx.moveTo(-6, 10); ctx.ellipse(-10, 10, 4.5, 3.5, -0.3, 0, Math.PI * 2);
    ctx.moveTo(12, 6); ctx.ellipse(8, 6, 4.5, 3.5, -0.3, 0, Math.PI * 2);
  } },
  coffee: { col: '#c98aff', ring: '#3ff0ff', name: 'Coffee cup', paint() {
    ctx.beginPath(); ctx.moveTo(-13, -3); ctx.lineTo(-10, 15); ctx.lineTo(7, 15); ctx.lineTo(10, -3); ctx.closePath();
    ctx.moveTo(10, 1); ctx.arc(11, 5, 5, -Math.PI / 2, Math.PI / 2);
    ctx.moveTo(-6, -7); ctx.quadraticCurveTo(-9, -12, -5, -15); ctx.quadraticCurveTo(-2, -18, -5, -21);
    ctx.moveTo(2, -7); ctx.quadraticCurveTo(-1, -12, 3, -15); ctx.quadraticCurveTo(6, -18, 3, -21);
  } },
  palm: { col: '#3fffb0', ring: '#ffb03f', name: 'Palm tree', paint() {
    ctx.beginPath(); ctx.moveTo(4, 18); ctx.quadraticCurveTo(-4, 6, -1, -8);                                   // trunk
    ctx.moveTo(-1, -8); ctx.quadraticCurveTo(-10, -14, -19, -4); ctx.moveTo(-1, -8); ctx.quadraticCurveTo(-8, -20, -15, -18);
    ctx.moveTo(-1, -8); ctx.quadraticCurveTo(8, -20, 15, -17); ctx.moveTo(-1, -8); ctx.quadraticCurveTo(10, -12, 18, -2);
    ctx.moveTo(-15, 18); ctx.lineTo(16, 18);
  } }
};
// a round neon sign; i is the way the shaft is (the icon sits in the visible half), 0 centres it (Collections menu)
function paintNeonSign(name, r, i = 0) {
  const s = NEON_ICONS[name] || NEON_ICONS.heart;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = '#151026'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, r - 8, 0, Math.PI * 2); neonStroke(s.ring, 2.6);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); cityStroke(2);
  const k = (i ? r * 0.3 : r * 0.55) / 20;
  ctx.save(); ctx.translate(i * r * 0.48, 0); ctx.scale(k, k);
  s.paint(); neonStroke(s.col, 2.4);
  ctx.restore();
}
function drawCityBulge(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 8, i = -o.side;
  const s = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    if (o.neonSign) { paintNeonSign(o.neonSign, o.r, i); return; }
    const col = o.cityCol || '#c9cfdb', look = o.look || 'dish';
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    if (look === 'clock') {                        // a station clock showing the time it was put up
      ctx.strokeStyle = METAL; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, o.r - 4, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#1a1a24'; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let h = 0; h < 12; h++) { const a = h / 12 * Math.PI * 2, r0 = o.r * (h % 3 ? 0.8 : 0.72); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * o.r * 0.86, Math.sin(a) * o.r * 0.86); }
      ctx.stroke();
      const now = new Date(), ha = (now.getHours() % 12 + now.getMinutes() / 60) / 12 * Math.PI * 2 - Math.PI / 2, ma = now.getMinutes() / 60 * Math.PI * 2 - Math.PI / 2;
      ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha) * o.r * 0.45, Math.sin(ha) * o.r * 0.45); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ma) * o.r * 0.68, Math.sin(ma) * o.r * 0.68); ctx.stroke();
      ctx.fillStyle = '#ff3f3f'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'acunit') {                // a round AC unit: a fan behind a grill
      ctx.fillStyle = cityShade(0.35); ctx.beginPath(); ctx.arc(0, 0, o.r * 0.82, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = METAL_HI;
      for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.4; ctx.beginPath(); ctx.ellipse(Math.cos(a) * o.r * 0.4, Math.sin(a) * o.r * 0.4, o.r * 0.38, o.r * 0.16, a, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath();
      for (let y = -o.r; y < o.r; y += 7) { ctx.moveTo(-o.r, y); ctx.lineTo(o.r, y); }
      ctx.stroke();
      ctx.strokeStyle = cityShade(0.3); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.84, 0, Math.PI * 2); ctx.stroke();
    } else {                                       // a satellite dish: rings and a feed arm pointing into the street
      ctx.strokeStyle = cityShade(0.2); ctx.lineWidth = 2;
      for (const k of [0.3, 0.55, 0.8]) { ctx.beginPath(); ctx.arc(0, 0, o.r * k, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = cityLight(0.25); ctx.beginPath(); ctx.arc(i * o.r * 0.25, -o.r * 0.25, o.r * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#4a4f68'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, o.r * 0.5); ctx.lineTo(i * o.r * 0.55, 0); ctx.moveTo(0, -o.r * 0.5); ctx.lineTo(i * o.r * 0.55, 0); ctx.stroke();
      ctx.fillStyle = '#4a4f68'; ctx.beginPath(); ctx.arc(i * o.r * 0.55, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff3f3f'; ctx.beginPath(); ctx.arc(i * o.r * 0.55, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); cityStroke(2);
  });
  blit(s, cx, sy);
}

// ---------- Bouncing Slider: a hover tram or a flickering neon tube, 13 thick ----------
function drawCitySlider(o, sy) {
  const L = o.len / 2, col = o.cityCol || '#ff4fd8', tube = o.look === 'tube';
  const s = ownSprite(o, 'spr', o.len + 16, 30, L + 8, 15, () => {
    if (tube) {
      ctx.beginPath(); ctx.moveTo(-L + 9, 0); ctx.lineTo(L - 9, 0); neonStroke(col, 5);
      ctx.fillStyle = METAL; for (const x of [-L, L - 9]) { ctx.beginPath(); roundRectPath(x, -6, 9, 12, 2); ctx.fill(); cityStroke(1.3); }
      return;
    }
    ctx.beginPath(); roundRectPath(-L, -6.5, o.len, 13, 6.5); ctx.fillStyle = '#e6ecf5'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = GLASS; ctx.fillRect(-L + 9, -4.5, o.len - 18, 5);
    ctx.fillStyle = '#7ff0ff'; for (let x = -L + 12; x < L - 14; x += 11) ctx.fillRect(x, -3.5, 6, 3);
    ctx.fillStyle = col; ctx.fillRect(-L, 2, o.len, 2.5);
    ctx.restore();
    ctx.beginPath(); roundRectPath(-L, -6.5, o.len, 13, 6.5); cityStroke(1.5);
    ctx.fillStyle = '#fff6c0'; for (const x of [-L + 3.5, L - 3.5]) { ctx.beginPath(); ctx.arc(x, 0, 2, 0, Math.PI * 2); ctx.fill(); }
  });
  if (tube) {                                      // a tired neon tube: it hums and sometimes flickers
    const t = time * 9 + o.len;
    ctx.globalAlpha = Math.sin(t * 0.37) > 0.92 ? 0.35 : 0.85 + 0.15 * Math.sin(t);
  }
  blit(s, o.x, sy, o.a);
  ctx.globalAlpha = 1;
}

// ---------- Rising Projectile: soda cans, arcade tokens or glowing bouncy balls, spinning up the street ----------
function drawCityProjectile(o, sy) {
  const col = o.cityCol || '#ff3f5a', s = o.r / 16, look = o.look || 'can';
  blit(sharedSprite('c' + look + col, 36, 36, 18, 18, () => {
    if (look === 'token') {                        // an arcade token with a star stamped in it
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 13.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1.5);
      ctx.strokeStyle = cityShade(0.25); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 3 : 7, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath();
      ctx.fillStyle = cityShade(0.25); ctx.fill();
      ctx.fillStyle = cityLight(0.6); ctx.beginPath(); ctx.ellipse(-5, -7, 3.5, 1.8, -0.6, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'ball') {                  // a glowing bouncy ball
      ctx.fillStyle = col; ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(0, 0, 14.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); cityStroke(1.4);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 18, 18, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke();
      ctx.fillStyle = cityLight(0.75); ctx.beginPath(); ctx.arc(-4.5, -5, 2.6, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a soda can
      ctx.beginPath(); roundRectPath(-7.5, -12, 15, 24, 3); ctx.fillStyle = col; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#d6dbe3'; ctx.fillRect(-8, -12, 16, 3.5); ctx.fillRect(-8, 9, 16, 3);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-8, 2); ctx.quadraticCurveTo(-3, -4, 1, 1); ctx.quadraticCurveTo(5, 6, 8, 0); ctx.stroke();
      ctx.fillStyle = cityLight(0.35); ctx.fillRect(-5, -8, 2.5, 16);
      ctx.restore();
      ctx.beginPath(); roundRectPath(-7.5, -12, 15, 24, 3); cityStroke(1.4);
      ctx.fillStyle = '#9aa0a8'; ctx.beginPath(); ctx.ellipse(1.5, -12, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();   // the tab
    }
  }), o.x, sy, o.rot, s, s);
}

// ---------- Drifting Swarm: delivery drones, paper lanterns or umbrellas, filling a 42-unit square ----------
function drawCitySwarm(o, sy) {
  const col = o.cityCol || '#3ff0ff', look = o.look || 'drone';
  blit(sharedSprite('c' + look + col, 48, 48, 24, 24, () => {
    if (look === 'lantern') {                      // a glowing paper lantern on a string
      ctx.fillStyle = col; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(0, 1, 20, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = '#1a1a24'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -21); ctx.lineTo(0, -16); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 1, 15, 15, 0, 0, Math.PI * 2); ctx.fill(); cityStroke(1.4);
      ctx.strokeStyle = cityShade(0.3); ctx.lineWidth = 1.2; ctx.beginPath();
      for (const k of [-0.6, 0, 0.6]) { ctx.moveTo(0, -14); ctx.quadraticCurveTo(k * 26, 1, 0, 16); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,240,180,.55)'; ctx.beginPath(); ctx.ellipse(0, 1, 6, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1410'; ctx.fillRect(-7, -16, 14, 3); ctx.fillRect(-7, 15, 14, 3);
      ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 1.4; ctx.beginPath(); for (const x of [-2, 0, 2]) { ctx.moveTo(x, 18); ctx.lineTo(x * 1.5, 21); } ctx.stroke();
    } else if (look === 'umbrella') {              // an open umbrella floating down
      ctx.beginPath(); ctx.moveTo(-20, 2); ctx.quadraticCurveTo(-20, -18, 0, -19); ctx.quadraticCurveTo(20, -18, 20, 2);
      for (let k = 0; k < 4; k++) { const x = 20 - k * 10; ctx.quadraticCurveTo(x - 5, -3, x - 10, 2); }
      ctx.closePath(); ctx.fillStyle = col; ctx.fill(); cityStroke(1.5);
      ctx.strokeStyle = cityShade(0.3); ctx.lineWidth = 1.2; ctx.beginPath();
      for (const x of [-10, 0, 10]) { ctx.moveTo(0, -19); ctx.quadraticCurveTo(x * 0.6, -10, x, 2); }
      ctx.stroke();
      ctx.strokeStyle = '#1a1a24'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 15); ctx.arc(-3.5, 15, 3.5, 0, Math.PI); ctx.stroke();
    } else {                                       // a delivery drone: four rotors and a glowing light
      ctx.strokeStyle = '#4a4f68'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-13, -13); ctx.lineTo(13, 13); ctx.moveTo(13, -13); ctx.lineTo(-13, 13); ctx.stroke();
      for (const [x, y] of [[-13, -13], [13, -13], [-13, 13], [13, 13]]) {
        ctx.fillStyle = 'rgba(200,230,255,.45)'; ctx.beginPath(); ctx.arc(x, y, 7.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(200,230,255,.9)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = METAL; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath(); roundRectPath(-8, -7, 16, 14, 4); ctx.fillStyle = '#e6ecf5'; ctx.fill(); cityStroke(1.4);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cityLight(0.9); ctx.beginPath(); ctx.arc(-1, -1, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot);
}

// ---------- Conveyor: a line of hover taxis or pods crossing the street (34 x 12 each, like a clip) ----------
function drawCityCar(x, sy, dir, col = '#ffd23f', look = 'taxi') {
  blit(sharedSprite('car' + look + dir + col, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    if (look === 'pod') {                          // a round two-seat pod
      ctx.beginPath(); roundRectPath(-17, -6, 34, 12, 6); ctx.fillStyle = col; ctx.fill(); cityStroke(1.3);
      ctx.fillStyle = GLASS; ctx.beginPath(); roundRectPath(-3, -4.5, 16, 6, 3); ctx.fill();
      ctx.fillStyle = '#3ff0ff'; ctx.fillRect(-14, 3, 24, 1.6);
    } else {                                       // a hover taxi: a cabin with windows, a checker line, a headlight
      ctx.beginPath(); ctx.moveTo(-17, 5); ctx.lineTo(-17, -1); ctx.lineTo(-9, -2); ctx.lineTo(-5, -6); ctx.lineTo(7, -6); ctx.lineTo(11, -2); ctx.lineTo(17, -1); ctx.lineTo(17, 5); ctx.quadraticCurveTo(0, 7, -17, 5); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); cityStroke(1.3);
      ctx.fillStyle = GLASS; ctx.beginPath(); ctx.moveTo(-6.5, -2); ctx.lineTo(-4, -4.8); ctx.lineTo(0, -4.8); ctx.lineTo(0, -2); ctx.closePath(); ctx.moveTo(1.5, -2); ctx.lineTo(1.5, -4.8); ctx.lineTo(6.5, -4.8); ctx.lineTo(9, -2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1a1a24'; for (let k = 0; k < 8; k++) ctx.fillRect(-14 + k * 4, k % 2 ? 0.5 : 2, 2, 1.5);
      ctx.fillStyle = '#3ff0ff'; ctx.fillRect(-12, 5, 24, 1.2);
    }
    ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(15.5, 1.5, 1.6, 0, Math.PI * 2); ctx.fill();   // headlight, facing the way it goes
    ctx.fillStyle = '#ff3f3f'; ctx.fillRect(-17, 0, 1.6, 3);
  }), x, sy);
}

// ---------- Spinning Drifter: a vent fan, a glowing hubcap or a vinyl record, filling a 20-unit circle ----------
function drawCitySpinner(o, sy) {
  const col = o.cityCol || '#9aa3b5', look = o.look || 'fan';
  blit(sharedSprite('c' + look + col, 50, 50, 25, 25, () => {
    if (look === 'record') {                       // a vinyl record with a coloured label
      ctx.fillStyle = '#121218'; ctx.beginPath(); ctx.arc(0, 0, 19.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1.2);
      ctx.strokeStyle = cityLight(0.1); ctx.lineWidth = 1; for (const r of [10, 12.5, 15, 17.5]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.strokeStyle = cityLight(0.35); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 15, -2.4, -1.6); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cityLight(0.6); ctx.fillRect(-4, -3, 8, 1.5);
      ctx.fillStyle = '#121218'; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'hubcap') {                // a tyre with a neon rim and spokes
      ctx.fillStyle = '#1a1a24'; ctx.beginPath(); ctx.arc(0, 0, 19.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); neonStroke(col, 2.2, false);
      ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4); ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); }
      neonStroke(col, 1.6, false);
      ctx.fillStyle = METAL_HI; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a vent fan in a round frame
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 19.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1.4);
      ctx.fillStyle = '#1a1a24'; ctx.beginPath(); ctx.arc(0, 0, 15.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = METAL_HI;
      for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 7.5, Math.sin(a) * 7.5, 7.5, 3.6, a + 0.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1);
    }
  }), o.x, sy, o.rot);
}

// ---------- Spinning Blades: two drone rotor blades or two neon tubes, spinning and scissoring ----------
// each blade matches a scissor blade's hit box and each pod its handle circle
function drawCityRotors(o, sy) {
  const col = o.cityCol || '#3ff0ff', look = o.look || 'rotor';
  const piece = sharedSprite('crot' + look + col, 106, 26, 34, 13, () => {
    if (look === 'neon') {
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(62, 0); neonStroke(col, 5);
      ctx.fillStyle = METAL; ctx.beginPath(); ctx.arc(-22, 0, 9, 0, Math.PI * 2); ctx.fill(); cityStroke(1.3);
      ctx.beginPath(); ctx.arc(-22, 0, 5, 0, Math.PI * 2); neonStroke(col, 1.6, false);
      return;
    }
    ctx.beginPath(); ctx.moveTo(-6, -3.5); ctx.lineTo(56, -4); ctx.quadraticCurveTo(66, -2, 66, 0); ctx.quadraticCurveTo(66, 2, 56, 4); ctx.lineTo(-6, 3.5); ctx.closePath();
    ctx.fillStyle = '#2a2f44'; ctx.fill(); cityStroke(1.3);
    ctx.fillStyle = col; ctx.fillRect(48, -3.5, 6, 7);
    ctx.fillStyle = cityLight(0.2); ctx.fillRect(-4, -3, 52, 1.5);
    ctx.fillStyle = METAL_HI; ctx.beginPath(); ctx.arc(-22, 0, 9.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1.3);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-22, 0, 3.5, 0, Math.PI * 2); ctx.fill();
  });
  for (const s of [-1, 1]) blit(piece, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = METAL; ctx.beginPath(); ctx.arc(o.x, sy, 3.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1);
}

// ---------- Sweeping Arm: a construction crane boom or a street lamp arm turning around a hub ----------
function drawCityCrane(o, sy) {
  const col = o.cityCol || '#ffc21f', hh = o.hh || 5;
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.ang);
  if (o.look === 'lamp') {                         // a grey arm ending in a lamp head with a bright face
    ctx.beginPath(); ctx.rect(6, -2.5, o.L - 20, 5); ctx.fillStyle = col; ctx.fill(); cityStroke(1.2);
    ctx.beginPath(); roundRectPath(o.L - 16, -hh, 16, hh * 2, 3); ctx.fillStyle = '#4a4f68'; ctx.fill(); cityStroke(1.3);
    ctx.fillStyle = '#fff6c0'; ctx.fillRect(o.L - 4, -hh + 1.5, 3, hh * 2 - 3);
    ctx.fillStyle = 'rgba(255,246,192,.35)'; ctx.beginPath(); ctx.arc(o.L - 2, 0, hh + 2, -Math.PI / 2, Math.PI / 2); ctx.fill();
  } else {                                         // a lattice boom with a red light at the tip
    ctx.strokeStyle = CITY_LINE; ctx.lineWidth = 4.4; ctx.lineCap = 'round';
    const rails = () => { ctx.beginPath(); ctx.moveTo(6, -hh + 1.5); ctx.lineTo(o.L - 2, -hh + 1.5); ctx.moveTo(6, hh - 1.5); ctx.lineTo(o.L - 2, hh - 1.5); };
    rails(); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 2.4; rails(); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.beginPath();
    for (let x = 8, s = 1; x < o.L - 6; x += 7, s = -s) { ctx.moveTo(x, -hh * s + 1.5 * s); ctx.lineTo(x + 7, hh * s - 1.5 * s); }
    ctx.stroke();
    ctx.fillStyle = '#ff3f3f'; ctx.beginPath(); ctx.arc(o.L - 3, 0, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = METAL; ctx.beginPath(); ctx.arc(o.x, sy, 8.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1.5);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(o.x, sy, 3, 0, Math.PI * 2); ctx.fill();
}

// ---------- Wall Piston: a fire escape ladder, a neon arrow on a pole or a telescopic antenna shoots out ----------
function drawCityPiston(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, col = o.cityCol || '#8a93a8', look = o.look || 'ladder';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    const tip = h + e;
    if (look === 'arrow') {
      ctx.fillStyle = '#4a4f68'; ctx.beginPath(); ctx.rect(h - 6, -2.5, Math.max(0, e - 8), 5); ctx.fill(); cityStroke(1);
      ctx.beginPath(); ctx.moveTo(tip - Math.min(14, e), -5); ctx.lineTo(tip - 1, 0); ctx.lineTo(tip - Math.min(14, e), 5); ctx.closePath(); neonStroke(col, 2);
    } else if (look === 'antenna') {               // three telescopic sections, thinner each time, a red light at the tip
      const seg = e / 3;
      ctx.fillStyle = col;
      for (let k = 0; k < 3; k++) { const hw = 5 - k * 1.4; ctx.beginPath(); ctx.rect(h - 6 + k * seg, -hw, seg + 6, hw * 2); ctx.fill(); cityStroke(1); }
      ctx.fillStyle = '#ff3f3f'; ctx.beginPath(); ctx.arc(tip - 3, 0, 3, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a ladder: two rails and rungs
      ctx.strokeStyle = CITY_LINE; ctx.lineWidth = 3.6; ctx.beginPath();
      ctx.moveTo(h - 6, -4.5); ctx.lineTo(tip - 1, -4.5); ctx.moveTo(h - 6, 4.5); ctx.lineTo(tip - 1, 4.5); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
      ctx.lineWidth = 1.8; ctx.beginPath(); for (let x = h; x < tip - 2; x += 8) { ctx.moveTo(x, -4.5); ctx.lineTo(x, 4.5); } ctx.stroke();
    }
  }
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 3); ctx.fillStyle = look === 'arrow' ? '#17122b' : METAL; ctx.fill();
  ctx.save(); ctx.clip();
  if (look === 'arrow') { ctx.beginPath(); roundRectPath(2, -8, h - 8, 16, 3); neonStroke(col, 1.4, false); }
  else {
    ctx.fillStyle = cityLight(0.14); ctx.fillRect(-6, -12, h + 6, 4);
    ctx.strokeStyle = cityShade(0.35); ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = 8; x < h - 6; x += 6) { ctx.moveTo(x, -6); ctx.lineTo(x, 6); } ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#0c0b14'; ctx.fillRect(h - 4, -6, 4, 12);
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 3); cityStroke(1.6);
  ctx.restore();
}

// ---------- Wall Turret: a security camera firing laser bolts, a dumpling steamer or a spray can ----------
// each lights up (or puffs) at the nozzle just before it fires
function drawCityTurret(o, sy) {
  const dir = inward(o), col = o.cityCol || '#ff3f5a', look = o.look || 'camera';
  for (const b of o.blobs) {
    if (look === 'dumpling') {
      ctx.fillStyle = '#f4efe2'; ctx.beginPath(); ctx.ellipse(b.x, sy + 1, b.r * 0.95, b.r * 0.75, 0, 0, Math.PI * 2); ctx.fill(); cityStroke(1.1);
      ctx.strokeStyle = 'rgba(160,140,110,.8)'; ctx.lineWidth = 1; ctx.beginPath();
      for (const k of [-0.4, 0, 0.4]) { ctx.moveTo(b.x + k * b.r, sy - b.r * 0.6); ctx.lineTo(b.x + k * b.r * 0.6, sy - b.r * 0.1); }
      ctx.stroke();
    } else if (look === 'spray') {                 // blobs of paint
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(b.x - dir * b.r * 1.1, sy + 2, b.r * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cityLight(0.5); ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, sy - b.r * 0.3, b.r * 0.22, 0, Math.PI * 2); ctx.fill();
    } else {                                       // laser bolts with a short glowing trail
      ctx.fillStyle = col; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(b.x - dir * b.r * 1.2, sy, b.r * 1.8, b.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.ellipse(b.x, sy, b.r * 0.95, b.r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(b.x, sy, b.r * 0.55, b.r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  const head = sharedSprite('cturret' + look + dir + col, 170, 50, 85, 25, () => {
    ctx.scale(dir, 1);
    if (look === 'dumpling') {                     // a stack of bamboo steamers with a spout
      ctx.beginPath(); roundRectPath(-4, -11, 66, 22, 4); ctx.fillStyle = col; ctx.fill(); cityStroke(1.5);
      ctx.strokeStyle = 'rgba(90,60,30,.5)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (const x of [16, 36, 54]) { ctx.moveTo(x, -11); ctx.lineTo(x, 11); }
      for (let x = 0; x < 60; x += 4) { ctx.moveTo(x, -4); ctx.lineTo(x + 2, 4); }
      ctx.stroke();
      ctx.fillStyle = '#ff3f3f'; ctx.fillRect(20, -11, 12, 4);
      ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); roundRectPath(60, -4, 18, 8, 2); ctx.fill(); cityStroke(1.2);
    } else if (look === 'spray') {                 // a giant spray can lying on a wall bracket
      ctx.fillStyle = '#4a4f68'; ctx.fillRect(-4, -8, 10, 16);
      ctx.beginPath(); roundRectPath(4, -11, 50, 22, 7); ctx.fillStyle = col; ctx.fill(); cityStroke(1.5);
      ctx.fillStyle = '#f4f1ea'; ctx.fillRect(18, -11, 18, 22);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(27, 0, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cityLight(0.3); ctx.fillRect(8, -8, 44, 3);
      ctx.fillStyle = '#c9cfdb'; ctx.beginPath(); roundRectPath(54, -7, 10, 14, 2); ctx.fill(); cityStroke(1.2);
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(64, -3, 14, 6);
    } else {                                       // a security camera on a bracket, a lens and a red light
      ctx.fillStyle = '#4a4f68'; ctx.fillRect(-4, -6, 16, 12);
      ctx.beginPath(); roundRectPath(8, -11, 54, 22, 5); ctx.fillStyle = '#e6ecf5'; ctx.fill(); cityStroke(1.5);
      ctx.fillStyle = '#c9cfdb'; ctx.fillRect(10, 4, 50, 6);
      ctx.fillStyle = '#ff3f3f'; ctx.beginPath(); ctx.arc(20, -4, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a24'; ctx.beginPath(); roundRectPath(58, -4, 20, 8, 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(75, 0, 2.6, 0, Math.PI * 2); ctx.fill();
    }
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    const flick = Math.floor(o.timer * 20) % 2;
    ctx.fillStyle = look === 'dumpling' ? (flick ? 'rgba(255,255,255,.8)' : 'rgba(220,220,220,.5)') : flick ? col : '#ffffff';
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 78, sy, look === 'dumpling' ? 5 : 4, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Charged Beam: a laser emitter or a broken neon sign; a dashed line warns, then a beam or an arc fires ----------
function drawCityBeam(o, sy) {
  const x0 = ZAP_BODY, L = o.len, col = o.cityCol || '#ff3f5a', lit = o.phase !== 'rest', arc = o.look === 'arc';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.3 + 0.6 * Math.min(1, o.t / 0.7); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.restore();
  } else if (o.phase === 'zap') {
    ctx.beginPath(); ctx.moveTo(x0, 0);
    if (arc) { for (let x = x0 + 8; x < x0 + L; x += 8) ctx.lineTo(x, rand(-4.5, 4.5)); ctx.lineTo(x0 + L, 0); neonStroke(col, 2.4); }   // a crackling arc
    else { ctx.lineTo(x0 + L, 0); neonStroke(col, 4.5); }
  }
  ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 3); ctx.fillStyle = arc ? '#17122b' : METAL; ctx.fill(); cityStroke(1.5);
  if (arc) {                                       // a neon sign with a dead tube and a frayed end
    ctx.beginPath(); ctx.moveTo(4, 3); ctx.lineTo(12, -4); ctx.lineTo(20, 3); ctx.lineTo(28, -4); ctx.lineTo(36, 3); ctx.lineTo(44, -4);
    if (lit) neonStroke(col, 1.8); else { ctx.strokeStyle = 'rgba(160,150,190,.45)'; ctx.lineWidth = 1.8; ctx.stroke(); }
    ctx.strokeStyle = '#c9cfdb'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(54, 0); ctx.lineTo(x0 - 2, 0); ctx.moveTo(x0 - 4, 0); ctx.lineTo(x0, -3); ctx.moveTo(x0 - 4, 0); ctx.lineTo(x0, 3); ctx.stroke();
  } else {                                         // a steel emitter with hazard stripes and a lens
    ctx.save(); ctx.beginPath(); ctx.rect(4, -9, 20, 18); ctx.clip();
    ctx.fillStyle = HAZARD; ctx.fillRect(4, -9, 20, 18);
    ctx.fillStyle = '#1a1a24'; for (let k = -9; k < 30; k += 7) { ctx.beginPath(); ctx.moveTo(k, -9); ctx.lineTo(k + 4, -9); ctx.lineTo(k - 6, 9); ctx.lineTo(k - 10, 9); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = cityLight(0.15); ctx.fillRect(26, -8, 34, 3);
    ctx.fillStyle = lit ? col : '#3a2030'; ctx.beginPath(); ctx.arc(x0 - 7, 0, 5, 0, Math.PI * 2); ctx.fill(); cityStroke(1.1);
    if (lit) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x0 - 8, -1, 1.6, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

// ---------- Telegraphed Sweep: a striped traffic barrier with a STOP sign, or a street-sweeper robot arm ----------
function drawCityBarrier(o, sy) {
  const col = o.cityCol || '#ff3f3f', robot = o.look === 'robot';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = robot ? '#ffb03f' : '#ff6a6a'; ctx.globalAlpha = 0.3 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.save();
    ctx.rotate(o.ang);
    if (robot) {                                   // two jointed segments and a spinning brush
      ctx.lineCap = 'round';
      ctx.strokeStyle = CITY_LINE; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(len - 14, 0); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 11; ctx.stroke();
      ctx.strokeStyle = '#ffb03f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(len - 18, 0); ctx.stroke();
      ctx.fillStyle = METAL; ctx.beginPath(); ctx.arc(len * 0.5, 0, 8, 0, Math.PI * 2); ctx.fill(); cityStroke(1.3);
      ctx.translate(len, 0); ctx.rotate(time * 14);
      ctx.fillStyle = '#4a4f68'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill(); cityStroke(1.4);
      ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6); ctx.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); }
      ctx.stroke();
      ctx.fillStyle = METAL_HI; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a red and white striped boom with a STOP sign at the end
      ctx.beginPath(); ctx.rect(-6, -5, len - 8, 10); ctx.fillStyle = '#f4f1ea'; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = col; for (let x = -6; x < len; x += 16) { ctx.beginPath(); ctx.moveTo(x, -5); ctx.lineTo(x + 8, -5); ctx.lineTo(x + 2, 5); ctx.lineTo(x - 6, 5); ctx.fill(); }
      ctx.restore();
      ctx.beginPath(); ctx.rect(-6, -5, len - 8, 10); cityStroke(1.3);
      ctx.translate(len, 0); ctx.rotate(-o.ang);
      ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); } ctx.closePath();
      ctx.fillStyle = '#d9232a'; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke(); cityStroke(1);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-9, -2.5, 18, 5);
    }
    ctx.restore();
  }
  ctx.beginPath(); roundRectPath(-6, -14, 18, 28, 3); ctx.fillStyle = METAL; ctx.fill(); cityStroke(1.5);   // the post in the wall
  ctx.fillStyle = o.phase === 'warn' && Math.floor(o.t * 10) % 2 ? '#ffffff' : (robot ? '#ffb03f' : col);
  ctx.beginPath(); ctx.arc(4, 0, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Proximity Blast: an overloaded transformer box or a fire hydrant; it shakes near the plane, then bursts ----------
function drawCityBlast(o, sy) {
  const col = o.cityCol || '#3ff0ff', water = o.look === 'hydrant';
  if (o.phase === 'boom' || o.phase === 'gone') {
    const t = o.phase === 'boom' ? o.t : 0.35 + o.t;
    if (t > 0.65) return;
    const r = o.blast * Math.min(1, t / 0.12), fade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.3, ring = water ? '#bfe8ff' : col;
    ctx.save();
    ctx.globalAlpha = 0.35 * fade; ctx.fillStyle = water ? '#78c8ff' : col; ctx.beginPath(); ctx.arc(o.x, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade; ctx.strokeStyle = ring; ctx.lineWidth = 5; ctx.stroke();
    if (water) {                                   // a burst of water drops
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 16; i++) { const a = i * 2.4, d = r * (0.3 + 0.6 * ((i * 37) % 10) / 10); ctx.beginPath(); ctx.arc(o.x + Math.cos(a) * d, sy + Math.sin(a) * d, 2.4, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // electric bolts
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2 + o.x;
        ctx.moveTo(o.x + Math.cos(a) * r * 0.2, sy + Math.sin(a) * r * 0.2);
        ctx.lineTo(o.x + Math.cos(a + 0.25) * r * 0.55, sy + Math.sin(a + 0.25) * r * 0.55);
        ctx.lineTo(o.x + Math.cos(a - 0.1) * r * 0.9, sy + Math.sin(a - 0.1) * r * 0.9);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  const blink = o.phase === 'blink';
  if (blink) {
    ctx.save();
    ctx.strokeStyle = water ? '#9fd8ff' : col; ctx.globalAlpha = 0.35 + 0.5 * Math.min(1, o.t / 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  const jig = blink ? Math.sin(o.t * 60) * 1.5 : 0;   // it rattles before it goes
  blit(sharedSprite('cblast' + water + (water ? o.cityCol : ''), 40, 40, 20, 20, () => {
    if (water) {                                   // a fire hydrant
      ctx.fillStyle = o.cityCol || '#ff3f3f';
      ctx.beginPath(); ctx.arc(0, -7, 7, Math.PI, 0); ctx.rect(-6, -7, 12, 17); ctx.fill();
      ctx.beginPath(); roundRectPath(-12, -2, 24, 6, 2); ctx.fill(); cityStroke(1.2);
      ctx.beginPath(); ctx.arc(0, -7, 7, Math.PI, 0); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.closePath(); cityStroke(1.3);
      ctx.fillStyle = '#c9cfdb'; ctx.beginPath(); roundRectPath(-9, 9, 18, 4, 1.5); ctx.fill(); cityStroke(1.1);
      ctx.fillStyle = cityLight(0.4); ctx.fillRect(-4, -6, 2, 14);
      ctx.fillStyle = '#c9cfdb'; ctx.beginPath(); ctx.arc(0, -14, 2, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a grey transformer box with a warning sign and two insulators
      ctx.fillStyle = '#9aa3b5'; for (const x of [-6, 6]) { ctx.beginPath(); roundRectPath(x - 2, -15, 4, 5, 1.5); ctx.fill(); }
      ctx.beginPath(); roundRectPath(-12, -11, 24, 24, 3); ctx.fillStyle = '#5a6180'; ctx.fill(); cityStroke(1.5);
      ctx.fillStyle = cityLight(0.15); ctx.fillRect(-11, -10, 22, 3);
      ctx.fillStyle = HAZARD; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(8, 8); ctx.lineTo(-8, 8); ctx.closePath(); ctx.fill(); cityStroke(1);
      ctx.fillStyle = '#1a1a24'; ctx.beginPath(); ctx.moveTo(1, -2); ctx.lineTo(-2.5, 3); ctx.lineTo(0.5, 3); ctx.lineTo(-1, 7); ctx.lineTo(3, 1.5); ctx.lineTo(0, 1.5); ctx.closePath(); ctx.fill();
    }
  }), o.x + jig, sy);
  if (!water) {                                    // a status light: steady, then flashing as it overloads
    const on = blink ? Math.floor(o.t * 12) % 2 === 0 : Math.floor(o.t * 1.5) % 2 === 0;
    ctx.fillStyle = on ? col : '#2a3040'; ctx.beginPath(); ctx.arc(o.x + jig + 8, sy - 7, 2, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Push Zone (before 700 m only): steam from a street grate or the blast of an AC unit; nothing solid ----------
function drawCityVent(o, sy) {
  const cx = o.side < 0 ? 0 : W, dir = -o.side, ac = o.look === 'ac';
  ctx.save();
  ctx.strokeStyle = ac ? 'rgba(205,235,255,.55)' : 'rgba(255,240,225,.55)'; ctx.fillStyle = ac ? 'rgba(205,235,255,.5)' : 'rgba(255,245,235,.35)';
  ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 6;
    const run = (o.t * 170 + k * 71) % (W + 60);
    const x0 = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + dir * 18, yy - 5, x0 + dir * 36, yy); ctx.stroke();
    ctx.beginPath(); ctx.arc(x0 + dir * 46, yy + 3, ac ? 2 : 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.translate(cx, sy); ctx.scale(dir, 1);
  if (ac) {                                        // an AC unit on the wall: a fan behind a grill
    ctx.fillStyle = '#9aa3b5'; ctx.beginPath(); roundRectPath(-4, -24, 20, 48, 3); ctx.fill(); cityStroke(1.4);
    ctx.save(); ctx.translate(6, 0); ctx.rotate(o.blade);
    ctx.fillStyle = '#4a4f68'; for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.ellipse(0, -5, 2.4, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = cityShade(0.4); ctx.lineWidth = 1; ctx.beginPath(); for (let y = -20; y <= 20; y += 4) { ctx.moveTo(-2, y); ctx.lineTo(14, y); } ctx.stroke();
  } else {                                         // an iron grate in the wall
    ctx.fillStyle = '#2b2a30'; ctx.beginPath(); roundRectPath(-4, -26, 14, 52, 3); ctx.fill(); cityStroke(1.4);
    ctx.fillStyle = '#5a5f66'; for (let y = -20; y <= 18; y += 9.5) ctx.fillRect(-4, y, 14, 3);
  }
  ctx.restore();
}

// ---------- Effect Zone: a hologram field that slows the fall (never hurts) ----------
function drawHoloField(o, sy) {
  const col = o.cityCol || '#3ff0ff', x0 = o.x - o.w / 2, y0 = sy - o.h / 2;
  ctx.save();
  ctx.fillStyle = col; ctx.globalAlpha = 0.08; ctx.fillRect(x0, y0, o.w, o.h);
  ctx.globalAlpha = 0.25; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();   // scanlines rolling down
  for (let y = y0 + (o.t * 24) % 8; y < y0 + o.h; y += 8) { ctx.moveTo(x0, y); ctx.lineTo(x0 + o.w, y); }
  ctx.stroke();
  ctx.globalAlpha = 0.6; ctx.setLineDash([4, 6]); ctx.strokeRect(x0, y0, o.w, o.h); ctx.setLineDash([]);
  ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.beginPath();                              // corner brackets
  for (const [x, y, sx, sy2] of [[x0, y0, 1, 1], [x0 + o.w, y0, -1, 1], [x0, y0 + o.h, 1, -1], [x0 + o.w, y0 + o.h, -1, -1]]) {
    ctx.moveTo(x + sx * 9, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy2 * 9);
  }
  ctx.stroke();
  ctx.lineWidth = 1.8; ctx.beginPath();                                                 // chevrons floating up
  for (let k = 0; k < 4; k++) {
    const ph = (o.t * 0.4 + k / 4) % 1, y = y0 + o.h - ph * o.h;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5) * 0.8;
    ctx.beginPath(); ctx.moveTo(o.x - 7, y + 4); ctx.lineTo(o.x, y - 3); ctx.lineTo(o.x + 7, y + 4); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Spring Line: a power cable between two insulators, or a string of lights between two lamp brackets ----------
// the line bounces the plane away; the two anchors hurt
function drawCityCable(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, lights = o.look === 'lights';
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9);
  const bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + 5;   // a little sag
  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2);
  if (lights) {
    ctx.strokeStyle = '#2a2a3a'; ctx.lineWidth = 1.6; ctx.stroke();
    for (let i = 1; i < 9; i++) {                  // bulbs along the curve
      const t = i / 9, x = (1 - t) * (1 - t) * o.x1 + 2 * t * (1 - t) * cx + t * t * o.x2;
      const y = (1 - t) * (1 - t) * (sy + dy1) + 2 * t * (1 - t) * cy + t * t * (sy + dy2);
      ctx.fillStyle = NEON_MARKS[i % NEON_MARKS.length]; ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(x, y + 3, 5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y + 3, 2.6, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    ctx.strokeStyle = '#0c0b14'; ctx.lineWidth = 3.4; ctx.stroke();
    ctx.strokeStyle = 'rgba(160,170,200,.5)'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
  const anchor = lights
    ? sharedSprite('lampBracket', 24, 24, 12, 12, () => {
        ctx.fillStyle = '#2a2a3a'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1.2);
        ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = cityLight(0.8); ctx.beginPath(); ctx.arc(-1.5, -1.5, 1.4, 0, Math.PI * 2); ctx.fill();
      })
    : sharedSprite('insulator', 24, 24, 12, 12, () => {
        ctx.fillStyle = '#8f98b0'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); cityStroke(1.3);
        ctx.strokeStyle = cityShade(0.35); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ff3f3f'; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, Math.PI * 2); ctx.fill();
      });
  blit(anchor, o.x1, sy + dy1); blit(anchor, o.x2, sy + dy2);
}

// ---------- Looks added in v129, one per layer of the city (CITY_LAYERS in obstacles.js) ----------
// subway: pipes along the tunnel walls and ticket gates; arcade: a vending machine firing cans; data core: server racks
// and glowing data packets; anywhere: holographic warning signs. Each draws its whole obstacle inside the hit shape.
const CITY_EXTRA = {
  pipes: o => cityGate(o, drawCityPipes), racks: o => cityGate(o, drawCityRack),
  ticketgate: (o, sy) => { const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2; drawTicketGate(-10, l, sy, l, -1, o); drawTicketGate(r, W + 10, sy, r, 1, o); },
  holosign: (o, sy) => drawHoloSign(o, sy),
  datapackets: (o, sy) => { for (const x of clipXs(o)) drawDataPacket(x, sy, o.v > 0 ? 1 : -1, o.cityCol); },
  canmachine: (o, sy) => drawCanMachine(o, sy)
};
function cityGate(o, draw) {
  const sy = o.y - dist, l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
  draw(-10, l, sy, l, -1, o); draw(r, W + 10, sy, r, 1, o);
}

// Gap Wall (subway): two pipes along the tunnel wall with flanges and a red valve wheel near the gap, 22 thick
function drawCityPipes(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.cityCol || '#7a8aa0';
  ctx.save();
  for (const [y, h] of [[-11, 11], [1, 10]]) {
    ctx.beginPath(); roundRectPath(x0, sy + y, x1 - x0, h, h / 2); ctx.fillStyle = col; ctx.fill(); cityStroke(1.3);
    ctx.fillStyle = cityLight(0.25); ctx.fillRect(x0, sy + y + 2, x1 - x0, 2);
  }
  for (let x = innerX + outDir * 30; outDir > 0 ? x < x1 : x > x0; x += outDir * 44) {     // flanges
    ctx.fillStyle = METAL_HI; ctx.beginPath(); ctx.rect(x - 2.5, sy - 11, 5, 22); ctx.fill(); cityStroke(1);
  }
  ctx.fillStyle = METAL; ctx.beginPath(); ctx.arc(innerX + outDir * 6, sy, 6, 0, Math.PI * 2); ctx.fill(); cityStroke(1.1);   // the pipe end
  const vx = innerX + outDir * 16;                 // a valve wheel
  ctx.strokeStyle = '#ff3f3f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(vx, sy - 6, 4.5, 0, Math.PI * 2); ctx.moveTo(vx - 4.5, sy - 6); ctx.lineTo(vx + 4.5, sy - 6); ctx.moveTo(vx, sy - 10.5); ctx.lineTo(vx, sy - 1.5); ctx.stroke();
  ctx.restore();
}

// Gap Wall (data core): a server rack lying from the wall, rows of blinking lights, 22 thick
function drawCityRack(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.cityCol || '#3ff0ff', t = time;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 11, x1 - x0, 22); ctx.fillStyle = '#1a1f30'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = METAL; for (const y of [-11, -0.5]) ctx.fillRect(x0, sy + y, x1 - x0, 1.2);
  for (let x = innerX + outDir * 8, k = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * 7, k++) {
    for (const y of [-6, 5]) {
      const on = Math.sin(t * 6 + k * 1.7 + y) > 0.2;
      ctx.fillStyle = on ? col : 'rgba(80,90,120,.6)'; ctx.fillRect(x - 1.2, sy + y - 1.2, 2.4, 2.4);
    }
  }
  ctx.restore();
  ctx.beginPath(); ctx.rect(x0, sy - 11, x1 - x0, 22); cityStroke(1.4);
  ctx.strokeStyle = col; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(innerX, sy - 10); ctx.lineTo(innerX, sy + 10); ctx.stroke();
  ctx.restore();
}

// Closing Jaws (subway, arcade): ticket gates whose glass paddles slide shut and open, 28 thick
function drawTicketGate(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.cityCol || '#3fff8a';
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fillStyle = METAL; ctx.fill(); cityStroke(1.5);
  ctx.fillStyle = METAL_HI; ctx.fillRect(x0, sy - 14, x1 - x0, 5);
  const p0 = innerX + outDir * 2, p1 = innerX + outDir * 26;            // the glass paddle at the closing edge
  ctx.fillStyle = 'rgba(160,220,255,.55)'; ctx.beginPath(); ctx.rect(Math.min(p0, p1), sy - 12, 24, 24); ctx.fill(); cityStroke(1.1);
  ctx.fillStyle = cityLight(0.5); ctx.fillRect(Math.min(p0, p1) + 4, sy - 10, 3, 20);
  const lx = innerX + outDir * 36;                 // the green/red light and the card reader
  ctx.fillStyle = Math.sin(time * 3) > 0 ? col : '#ff3f5a'; ctx.beginPath(); ctx.arc(lx, sy - 5, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#14203a'; ctx.fillRect(lx - 4, sy + 2, 8, 6);
  ctx.restore();
}

// Static Hazards: a holographic warning sign: a flickering "!" triangle over a little projector, inside the hit circle
function drawHoloSign(o, sy) {
  const R = o.r * 0.88, col = o.cityCol || '#3ff0ff', flick = 0.75 + 0.25 * Math.sin(time * 17 + o.x);
  ctx.save();
  ctx.translate(o.x, sy);
  ctx.fillStyle = METAL; ctx.beginPath(); ctx.ellipse(0, R * 0.78, R * 0.45, R * 0.16, 0, 0, Math.PI * 2); ctx.fill(); cityStroke(1.2);   // the projector
  ctx.globalAlpha = flick;
  ctx.beginPath(); ctx.moveTo(0, -R * 0.85); ctx.lineTo(R * 0.8, R * 0.55); ctx.lineTo(-R * 0.8, R * 0.55); ctx.closePath();
  ctx.fillStyle = hexA(col, 0.28); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = cityLight(0.25); ctx.lineWidth = 1; ctx.beginPath(); for (let y = -R * 0.6; y < R * 0.5; y += 4) { ctx.moveTo(-R * 0.7, y); ctx.lineTo(R * 0.7, y); } ctx.stroke();
  ctx.fillStyle = col; ctx.fillRect(-R * 0.08, -R * 0.4, R * 0.16, R * 0.5); ctx.beginPath(); ctx.arc(0, R * 0.32, R * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// a #rrggbb colour with an alpha (also used by draw-forest.js)
const hexA = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

// Conveyor (data core): glowing data packets streaming across, each 34 x 12 with a trail of bits behind it
function drawDataPacket(x, sy, dir, col = '#3fff8a') {
  blit(sharedSprite('packet' + dir + col, 44, 16, 22, 8, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = hexA(col, 0.25); ctx.beginPath(); roundRectPath(-17, -6, 34, 12, 3); ctx.fill();
    ctx.fillStyle = '#0d1a20'; ctx.beginPath(); roundRectPath(-4, -5, 20, 10, 2); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = col; for (const [px, py] of [[0, -2], [4, -2], [8, 1], [12, -2], [0, 2], [8, -2]]) ctx.fillRect(px - 0.8, py - 0.8, 1.6, 1.6);
    for (const [px, w] of [[-8, 2.4], [-12, 1.8], [-16, 1.2]]) ctx.fillRect(px, -w / 2, w, w);
  }), x, sy);
}

// Wall Turret (streets to arcade): a vending machine on the wall shooting cans out of its slot; the slot flashes first
function drawCanMachine(o, sy) {
  const dir = inward(o), col = o.cityCol || '#ff3f5a';
  for (const b of o.blobs) {                       // flying soda cans, tumbling
    ctx.save(); ctx.translate(b.x, sy); ctx.rotate(b.wob);
    ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-b.r * 0.6, -b.r * 0.9, b.r * 1.2, b.r * 1.8, 2); ctx.fill(); cityStroke(1);
    ctx.fillStyle = '#e6ecf5'; ctx.fillRect(-b.r * 0.6, -b.r * 0.2, b.r * 1.2, b.r * 0.4);
    ctx.restore();
  }
  const body = sharedSprite('canmachine' + dir + col, 176, 52, 88, 26, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-4, -11, 64, 22, 3); ctx.fill(); cityStroke(1.4);
    ctx.fillStyle = GLASS; ctx.beginPath(); roundRectPath(2, -8, 34, 16, 2); ctx.fill();                     // the window of cans
    const tones = ['#ff3f5a', '#3f8fff', '#b6ff3f', '#ffd23f'];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) { ctx.fillStyle = tones[(r + c) % 4]; ctx.fillRect(4 + c * 5.4, -6 + r * 7, 3.6, 5); }
    ctx.fillStyle = '#e6ecf5'; ctx.fillRect(40, -7, 8, 5); ctx.fillStyle = '#1a1a24'; ctx.fillRect(42, 1, 4, 6);  // buttons and coin slot
    ctx.fillStyle = METAL; ctx.beginPath(); roundRectPath(58, -4, 20, 8, 2); ctx.fill(); cityStroke(1.1);          // the chute
    ctx.fillStyle = '#0a0a14'; ctx.fillRect(74, -3, 4, 6);
  });
  blit(body, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#ffffff' : col;
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 77, sy, 3.5, 0, Math.PI * 2); ctx.fill();
  }
}
