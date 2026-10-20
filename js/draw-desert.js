// Paper Nosedive — Art for the Desert map obstacles.
'use strict';

// Desert obstacles reuse a Paper or Ocean obstacle's movement and collision (see DESERT_MAKERS) and only change the
// look (o.look, see DESERT_LOOKS) in a few colours (o.desCol); o.layer is the rock layer the obstacle is in. Every
// drawing stays inside the mechanic's collision shape, with a dark brown outline so it reads on sand and dark rock.
const DES_LINE = '#3a2414';
function desStroke(w = 1.6) { ctx.strokeStyle = DES_LINE; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
const desLight = a => `rgba(255,255,255,${a})`, desShade = a => `rgba(0,0,0,${a})`;
const CACTUS = '#5f9a4a', CACTUS_DARK = '#3f7a2a', SPINE = '#f4ecd0', DWOOD = '#8a5a32';

function drawDesertObstacle(o, sy) {
  if (DESERT_EXTRA[o.look] && DESERT_EXTRA[o.look](o, sy) !== false) return;   // the looks added in v129
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawDesertLedge(-10, l, sy, l, -1, o); drawDesertLedge(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawDesertSlab(-10, l, sy, l, -1, o); drawDesertSlab(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'blot': drawDesertHazard(o, sy); break;
    case 'protractor': drawDesertBulge(o, sy); break;
    case 'pencil': drawDesertCarpet(o, sy); break;
    case 'wad': drawDesertNut(o, sy); break;
    case 'note': drawDesertFlyer(o, sy); break;
    case 'clips': for (const x of clipXs(o)) drawDesertCamel(x, sy, o.v > 0 ? 1 : -1, o.desCol); break;
    case 'starfish': drawDesertTumble(o, sy); break;
    case 'scissors': drawDesertFronds(o, sy); break;
    case 'compass': drawDesertLever(o, sy); break;
    case 'cutter': drawDesertTongue(o, sy); break;
    case 'glue': drawDesertSpitter(o, sy); break;
    case 'zap': drawDesertGlint(o, sy); break;
    case 'paw': drawDesertScorpion(o, sy); break;
    case 'mine': drawDesertBurst(o, sy); break;
    case 'fan': drawDesertSandstorm(o, sy); break;
    case 'bubbles': drawDesertHeat(o, sy); break;
    case 'band': drawDesertRope(o, sy); break;
  }
}

// ---------- Gap Wall: layered sandstone ledges or adobe walls from each wall, 22 thick ----------
function drawDesertLedge(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.desCol || '#e0a060';
  ctx.save();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, o.look === 'adobe' ? 2 : 6); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  if (o.look === 'adobe') {                        // mud bricks with straw flecks and a wooden beam end
    ctx.strokeStyle = desShade(0.25); ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(x0, sy); ctx.lineTo(x1, sy);
    for (let x = innerX + outDir * 14, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * 14, i++) { const yy = i % 2 ? sy - 11 : sy; ctx.moveTo(x, yy); ctx.lineTo(x, yy + 11); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(240,210,140,.6)'; for (let x = Math.min(x0, x1) + 5; x < Math.max(x0, x1); x += 9) ctx.fillRect(x, sy - 6 + (x % 7), 3, 1.2);
    ctx.fillStyle = DWOOD; ctx.beginPath(); ctx.arc(innerX + outDir * 7, sy - 3, 4, 0, Math.PI * 2); ctx.fill();
  } else {                                         // sandstone: rock layers in bands and a rounded, wind-worn end
    for (const [y, h, a] of [[-11, 5, 0.2], [-2, 3, -0.15], [5, 6, -0.25]]) { ctx.fillStyle = a > 0 ? desLight(a) : desShade(-a); ctx.fillRect(x0, sy + y, x1 - x0, h); }
    ctx.strokeStyle = desShade(0.2); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, sy - 4); ctx.bezierCurveTo((x0 + x1) / 2, sy - 6, (x0 + x1) / 2, sy - 2, x1, sy - 4); ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, o.look === 'adobe' ? 2 : 6); desStroke(1.5);
  ctx.restore();
}

// ---------- Closing Jaws: sliding sandstone slabs or two mesa edges, 28 thick ----------
function drawDesertSlab(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.desCol || '#d08a4a', mesa = o.look === 'mesa';
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  if (mesa) {                                      // a mesa edge: a flat sandy top with a cactus, layered rock below
    ctx.fillStyle = '#f0d08a'; ctx.fillRect(x0, sy - 14, x1 - x0, 5);
    ctx.fillStyle = desShade(0.18); for (const y of [-2, 6]) ctx.fillRect(x0, sy + y, x1 - x0, 3);
    const cx = innerX + outDir * 22;
    ctx.fillStyle = CACTUS; ctx.fillRect(cx - 2.5, sy - 14, 5, 8);
  } else {                                         // a cut slab: chisel marks and a pale worn edge
    ctx.fillStyle = desLight(0.2); ctx.fillRect(x0, sy - 14, x1 - x0, 5);
    ctx.strokeStyle = desShade(0.25); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = innerX + outDir * 16; outDir > 0 ? x < x1 : x > x0; x += outDir * 20) { ctx.moveTo(x, sy - 10); ctx.lineTo(x + outDir * 5, sy + 10); }
    ctx.stroke();
    ctx.fillStyle = '#f0d0a0'; ctx.fillRect(Math.min(innerX, innerX + outDir * 4), sy - 14, 4, 28);
  }
  ctx.restore();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); desStroke(1.6);
  ctx.restore();
}

// ---------- Static Hazards: barrel cacti, prickly pears or boulders with a lizard; the collectible fossil stones ----------
// the Fossils, each on a round stone filling a 20-unit circle (also used by the Collections screen)
const FOSSIL_NAMES = { trilobite: 'Trilobite', ammonite: 'Ammonite', fern: 'Fossil fern', fish: 'Fossil fish', sharktooth: 'Shark tooth',
                       raptorclaw: 'Raptor claw', dinoskull: 'Dinosaur skull', amberleaf: 'Leaf in amber' };
function paintFossil(name) {
  const amber = name === 'amberleaf', mark = '#5a4630';
  ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.fillStyle = amber ? '#f0a830' : '#d8c8a8'; ctx.fill(); desStroke(1.6);
  ctx.fillStyle = amber ? 'rgba(255,240,180,.4)' : desLight(0.25); ctx.beginPath(); ctx.ellipse(-6, -7, 8, 4, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = mark; ctx.fillStyle = mark; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (name === 'trilobite') {                      // a segmented oval with a head shield and a middle ridge
    ctx.beginPath(); ctx.ellipse(0, 2, 9, 12, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -8, 9, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.beginPath(); for (let y = -4; y <= 10; y += 3) { ctx.moveTo(-8, y); ctx.lineTo(8, y); } ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2.5, -8); ctx.lineTo(-2.5, 12); ctx.moveTo(2.5, -8); ctx.lineTo(2.5, 12); ctx.stroke();
  } else if (name === 'ammonite') {                // a coiled shell with ribs
    ctx.beginPath(); for (let a = 0; a < Math.PI * 5; a += 0.15) { const r = 1 + a * 0.95; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); for (let a = 2; a < Math.PI * 5; a += 0.5) { const r = 1 + a * 0.95; ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * (r - 2.6), Math.sin(a) * (r - 2.6)); } ctx.stroke();
  } else if (name === 'fern') {
    ctx.beginPath(); ctx.moveTo(-2, 15); ctx.quadraticCurveTo(3, 0, -1, -15);
    for (let y = -12; y < 13; y += 4) { const k = 1 - Math.abs(y) / 18; ctx.moveTo(0, y); ctx.lineTo(10 * k, y - 4); ctx.moveTo(0, y); ctx.lineTo(-10 * k, y - 4); }
    ctx.stroke();
  } else if (name === 'fish') {                    // a fish skeleton
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(8, 0); for (let x = -9; x < 6; x += 3.5) { ctx.moveTo(x, 0); ctx.lineTo(x - 2, -6); ctx.moveTo(x, 0); ctx.lineTo(x - 2, 6); }
    ctx.moveTo(-12, 0); ctx.lineTo(-16, -5); ctx.moveTo(-12, 0); ctx.lineTo(-16, 5); ctx.stroke();
    ctx.beginPath(); ctx.arc(11, 0, 4, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(12, -1, 1, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'sharktooth') {              // a big dark tooth with a serrated edge
    ctx.fillStyle = '#4a4a50'; ctx.beginPath(); ctx.moveTo(-10, 8); ctx.quadraticCurveTo(-4, -4, 0, -14); ctx.quadraticCurveTo(4, -4, 10, 8); ctx.quadraticCurveTo(0, 4, -10, 8); ctx.fill(); desStroke(1.2);
    ctx.fillStyle = '#8a7a60'; ctx.beginPath(); ctx.moveTo(-10, 8); ctx.quadraticCurveTo(0, 4, 10, 8); ctx.lineTo(8, 12); ctx.lineTo(-8, 12); ctx.closePath(); ctx.fill(); desStroke(1);
  } else if (name === 'raptorclaw') {              // a long curved claw
    ctx.fillStyle = '#3a3036'; ctx.beginPath(); ctx.moveTo(-8, 10); ctx.quadraticCurveTo(-8, -10, 12, -12); ctx.quadraticCurveTo(-2, -4, 2, 12); ctx.closePath(); ctx.fill(); desStroke(1.2);
    ctx.strokeStyle = desLight(0.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, 6); ctx.quadraticCurveTo(-5, -6, 8, -10); ctx.stroke();
  } else if (name === 'dinoskull') {               // a small dinosaur skull in profile, a big eye hole and teeth
    ctx.fillStyle = '#efe2c8'; ctx.beginPath(); ctx.moveTo(-14, -2); ctx.quadraticCurveTo(-12, -12, 2, -11); ctx.quadraticCurveTo(14, -8, 16, 0); ctx.lineTo(-12, 6); ctx.closePath(); ctx.fill(); desStroke(1.2);
    ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(14, 3); ctx.lineTo(12, 8); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill(); desStroke(1.1);   // jaw
    ctx.fillStyle = mark; ctx.beginPath(); ctx.ellipse(-4, -5, 4, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(6, -4, 2.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; for (let x = -6; x < 12; x += 4) { ctx.beginPath(); ctx.moveTo(x, 5); ctx.lineTo(x + 1.5, 8); ctx.lineTo(x + 3, 5); ctx.fill(); }
  } else {                                         // a green leaf caught in amber
    ctx.fillStyle = '#6a8a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 5.5, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3f5a1a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-9, 6); ctx.lineTo(9, -6); for (const k of [-0.4, 0, 0.4]) { ctx.moveTo(k * 18, -k * 12); ctx.lineTo(k * 18 + 3, -k * 12 + 4); } ctx.stroke();
  }
}
function drawDesertHazard(o, sy) {
  if (o.fossil) {
    const k = o.r * 0.88 / 20;
    blit(sharedSprite('fossil-' + o.fossil, 44, 44, 22, 22, () => paintFossil(o.fossil)), o.x, sy, 0, k, k);
    return;
  }
  const col = o.desCol || CACTUS, R = o.r * 0.88, look = o.look || 'barrel';
  blit(ownSprite(o, 'spr', R * 2 + 8, R * 2 + 8, R + 4, R + 4, () => {
    if (look === 'boulder') {                      // a boulder with a lizard sunning on top
      ctx.beginPath(); ctx.ellipse(0, R * 0.15, R, R * 0.82, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); desStroke(1.5);
      ctx.fillStyle = desLight(0.2); ctx.beginPath(); ctx.ellipse(-R * 0.3, -R * 0.15, R * 0.45, R * 0.25, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = desShade(0.3); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(R * 0.2, R * 0.1); ctx.lineTo(R * 0.4, R * 0.5); ctx.stroke();
      ctx.fillStyle = '#6fae4a'; ctx.beginPath(); ctx.ellipse(0, -R * 0.55, R * 0.4, R * 0.12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(R * 0.45, -R * 0.57, R * 0.14, R * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'pear') {                  // prickly pear pads with spines and a pink fruit
      for (const [x, y, rx, ry, a] of [[0, R * 0.25, R * 0.55, R * 0.62, 0], [-R * 0.45, -R * 0.35, R * 0.38, R * 0.45, -0.5], [R * 0.45, -R * 0.4, R * 0.36, R * 0.43, 0.5]]) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); ctx.fill(); desStroke(1.3);
        ctx.fillStyle = SPINE; for (const [dx, dy] of [[-0.3, -0.3], [0.3, -0.1], [-0.1, 0.35], [0.25, 0.4]]) { ctx.beginPath(); ctx.arc(x + dx * rx, y + dy * ry, 1.2, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.fillStyle = '#e0406a'; ctx.beginPath(); ctx.ellipse(R * 0.62, -R * 0.82, R * 0.12, R * 0.15, 0.4, 0, Math.PI * 2); ctx.fill(); desStroke(1);
    } else {                                       // a round barrel cactus with ribs, spines and a flower
      ctx.beginPath(); ctx.ellipse(0, R * 0.05, R * 0.85, R * 0.92, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); desStroke(1.5);
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, R * 0.05, R * 0.85, R * 0.92, 0, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = CACTUS_DARK; ctx.lineWidth = 1.5;
      for (const k of [-0.6, -0.3, 0, 0.3, 0.6]) { ctx.beginPath(); ctx.ellipse(0, R * 0.05, Math.abs(k) * R * 0.85 + 0.1, R * 0.92, 0, k < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, k < 0 ? Math.PI * 1.5 : Math.PI * 0.5); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = SPINE; for (let i = 0; i < 14; i++) { const a = i * 2.4, d = R * (0.3 + 0.5 * ((i * 37) % 10) / 10); ctx.beginPath(); ctx.arc(Math.cos(a) * d * 0.85, Math.sin(a) * d, 1.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#ffb030'; ctx.beginPath(); ctx.arc(0, -R * 0.82, R * 0.14, 0, Math.PI * 2); ctx.fill(); desStroke(1);
    }
  }), o.x, sy);
}

// ---------- Wall Bulge: a sandstone outcrop, a termite mound or a dune, an exact half-disc ----------
function drawDesertBulge(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 4, i = -o.side;
  const s = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    const col = o.desCol || '#d08a4a', look = o.look || 'outcrop';
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    if (look === 'dune') {                         // smooth sand with wind ripples and a sunlit crest
      ctx.fillStyle = desLight(0.25); ctx.beginPath(); ctx.arc(-i * o.r * 0.2, -o.r * 0.25, o.r * 0.85, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(150,100,40,.35)'; ctx.lineWidth = 1.6;
      for (let y = -o.r; y < o.r; y += 11) { ctx.beginPath(); ctx.moveTo(-o.r, y); ctx.quadraticCurveTo(0, y + 6, o.r, y - 2); ctx.stroke(); }
    } else if (look === 'termite') {               // a tall knobbly termite mound with little holes
      ctx.fillStyle = desShade(0.12); for (let y = -o.r; y < o.r; y += 16) ctx.fillRect(-o.r, y, o.r * 2, 6);
      ctx.fillStyle = '#3a2414'; for (const [a, d] of [[-0.6, 0.5], [0.2, 0.7], [0.8, 0.4], [-0.2, 0.3]]) { ctx.beginPath(); ctx.ellipse(i * Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, 3, 4, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = desLight(0.15); for (const [a, d] of [[-1, 0.8], [1, 0.75], [0, 0.9]]) { ctx.beginPath(); ctx.arc(i * Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, o.r * 0.12, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a sandstone outcrop: curved rock layers and a small cactus on top
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? desShade(0.12) : desLight(0.1); ctx.beginPath(); ctx.arc(0, o.r * 0.4, o.r * (1.25 - k * 0.18), 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = CACTUS; ctx.beginPath(); roundRectPath(i * o.r * 0.5 - 3, -o.r * 0.92, 6, 16, 3); ctx.fill(); desStroke(1);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); desStroke(1.8);
  });
  blit(s, cx, sy);
}

// ---------- Bouncing Slider: a flying carpet or a bleached driftwood plank, 13 thick ----------
function drawDesertCarpet(o, sy) {
  const L = o.len / 2, col = o.desCol || '#c0303a', carpet = o.look !== 'driftwood';
  if (carpet) {                                    // a short, wide flying carpet (v132): border, a medallion, tassels on the short ends
    const hh = o.hh || 17;
    const s = ownSprite(o, 'spr', o.len + 8, hh * 2 + 8, L + 4, hh + 4, () => {
      const x0 = -L + 5, w = o.len - 10;
      ctx.beginPath(); roundRectPath(x0, -hh, w, hh * 2, 3); ctx.fillStyle = col; ctx.fill(); desStroke(1.4);
      ctx.save(); ctx.clip();
      ctx.strokeStyle = '#f4c430'; ctx.lineWidth = 3; ctx.strokeRect(x0 + 4, -hh + 4, w - 8, hh * 2 - 8);             // the gold border
      ctx.fillStyle = '#f4ecd0'; for (let x = x0 + 9; x < x0 + w - 6; x += 8) for (const y of [-hh + 4, hh - 4]) { ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#1f3f7a'; ctx.beginPath(); ctx.moveTo(0, -hh + 9); ctx.lineTo(L * 0.55, 0); ctx.lineTo(0, hh - 9); ctx.lineTo(-L * 0.55, 0); ctx.closePath(); ctx.fill();   // the medallion
      ctx.fillStyle = '#f4c430'; ctx.beginPath(); ctx.moveTo(0, -hh + 15); ctx.lineTo(L * 0.3, 0); ctx.lineTo(0, hh - 15); ctx.lineTo(-L * 0.3, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f4ecd0'; for (const sx of [-1, 1]) for (const sy2 of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * (L - 13), sy2 * (hh - 11), 2.4, 0, Math.PI * 2); ctx.fill(); }   // corner flowers
      ctx.restore();
      ctx.strokeStyle = '#f4c430'; ctx.lineWidth = 1.4; ctx.beginPath();                                               // tassels on the short ends
      for (const x of [x0, x0 + w]) for (let y = -hh + 3; y <= hh - 3; y += 5) { ctx.moveTo(x, y); ctx.lineTo(x + (x < 0 ? -4 : 4), y); }
      ctx.stroke();
    });
    blit(s, o.x, sy, o.a + Math.sin(time * 6 + o.len) * 0.02, 1, 1 + Math.sin(time * 9 + o.len) * 0.03);   // a gentle ripple as it flies
    return;
  }
  const s = ownSprite(o, 'spr', o.len + 8, 22, L + 4, 11, () => {   // bleached driftwood with a knot and cracks
    ctx.beginPath(); ctx.moveTo(-L, -3); ctx.quadraticCurveTo(0, -6.5, L, -2); ctx.lineTo(L, 3); ctx.quadraticCurveTo(0, 6.5, -L, 4); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); desStroke(1.3);
    ctx.strokeStyle = desShade(0.2); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-L + 6, 0); ctx.quadraticCurveTo(0, -2, L - 8, 1); ctx.stroke();
    ctx.fillStyle = desShade(0.3); ctx.beginPath(); ctx.ellipse(L * 0.3, 0, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  });
  blit(s, o.x, sy, o.a);
}

// ---------- Rising Projectile: coconuts, gourds or a beetle's rolling ball, thrown up the canyon ----------
function drawDesertNut(o, sy) {
  const col = o.desCol || '#7a5030', s = o.r / 16, look = o.look || 'coconut';
  blit(sharedSprite('d' + look + col, 36, 36, 18, 18, () => {
    if (look === 'gourd') {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 4, 10, 0, Math.PI * 2); ctx.fill(); desStroke(1.4);
      ctx.beginPath(); ctx.arc(0, -7, 6, 0, Math.PI * 2); ctx.fill(); desStroke(1.3);
      ctx.fillStyle = DWOOD; ctx.fillRect(-1.5, -15, 3, 4);
      ctx.fillStyle = desLight(0.45); ctx.beginPath(); ctx.ellipse(-4, 1, 2.5, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'beetleball') {            // a round ball of earth with a little beetle on top pushing it
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 2, 11.5, 0, Math.PI * 2); ctx.fill(); desStroke(1.4);
      ctx.fillStyle = desShade(0.2); for (const [x, y] of [[-4, 4], [4, 6], [2, -2], [-6, -3]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#2a3a4a'; ctx.beginPath(); ctx.ellipse(0, -11, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill(); desStroke(1);
      ctx.strokeStyle = '#2a3a4a'; ctx.lineWidth = 1; ctx.beginPath(); for (const d of [-1, 1]) { ctx.moveTo(d * 3, -9); ctx.lineTo(d * 6, -6); } ctx.stroke();
    } else {                                       // a hairy brown coconut with its three dots
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 12.5, 0, Math.PI * 2); ctx.fill(); desStroke(1.4);
      ctx.strokeStyle = 'rgba(200,150,90,.5)'; ctx.lineWidth = 1; ctx.beginPath(); for (let a = 0; a < 6.28; a += 0.5) { ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.lineTo(Math.cos(a + 0.2) * 12, Math.sin(a + 0.2) * 12); } ctx.stroke();
      ctx.fillStyle = '#3a2414'; for (const [x, y] of [[-3, -4], [3, -4], [0, 1]]) { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); }
    }
  }), o.x, sy, o.rot, s, s);
}

// ---------- Drifting Swarm: vultures, locusts or hawks gliding down, filling a 42-unit square ----------
function drawDesertFlyer(o, sy) {
  const col = o.desCol || '#4a3a3a', look = o.look || 'vulture';
  blit(sharedSprite('d' + look + col, 48, 48, 24, 24, () => {
    if (look === 'locust') {                       // a big grasshopper with spread wings
      ctx.fillStyle = 'rgba(230,220,180,.8)'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 10, -4, 11, 6, d * 0.3, 0, Math.PI * 2); ctx.fill(); desStroke(1); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 2, 5, 15, 0, 0, Math.PI * 2); ctx.fill(); desStroke(1.4);
      ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); for (const d of [-1, 1]) { ctx.moveTo(d * 3, 6); ctx.lineTo(d * 12, 2); ctx.lineTo(d * 14, 18); } ctx.stroke();
      ctx.strokeStyle = DES_LINE; ctx.lineWidth = 1; ctx.beginPath(); for (const d of [-1, 1]) { ctx.moveTo(d * 2, -12); ctx.lineTo(d * 8, -20); } ctx.stroke();
      ctx.fillStyle = '#1a1410'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 2.5, -10, 1.3, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a vulture (bald pink head, white ruff) or a hawk, wings spread wide
      const hawk = look === 'hawk';
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -4);
      ctx.quadraticCurveTo(-12, -14, -22, -6); ctx.lineTo(-18, -2); ctx.lineTo(-21, 2); ctx.lineTo(-15, 2); ctx.lineTo(-16, 6); ctx.quadraticCurveTo(-8, 4, 0, 8);
      ctx.quadraticCurveTo(8, 4, 16, 6); ctx.lineTo(15, 2); ctx.lineTo(21, 2); ctx.lineTo(18, -2); ctx.lineTo(22, -6); ctx.quadraticCurveTo(12, -14, 0, -4);
      ctx.fill(); desStroke(1.3);
      ctx.beginPath(); ctx.moveTo(-5, 6); ctx.lineTo(0, 18); ctx.lineTo(5, 6); ctx.fill(); desStroke(1.1);   // tail
      if (hawk) { ctx.fillStyle = '#efe2c8'; ctx.beginPath(); ctx.ellipse(0, 2, 4, 6, 0, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.fillStyle = '#f4ecd8'; ctx.beginPath(); ctx.ellipse(0, -5, 6, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = hawk ? col : '#e8a0a0'; ctx.beginPath(); ctx.arc(0, -9, 4, 0, Math.PI * 2); ctx.fill(); desStroke(1);
      ctx.fillStyle = '#f0c040'; ctx.beginPath(); ctx.moveTo(-1.5, -6); ctx.lineTo(0, -2); ctx.lineTo(1.5, -6); ctx.fill();
      ctx.fillStyle = '#1a1410'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 1.8, -10, 0.9, 0, Math.PI * 2); ctx.fill(); }
    }
  }), o.x, sy, o.rot);
}

// ---------- Conveyor: a camel caravan crossing (34 x 12 each, like a clip) ----------
function drawDesertCamel(x, sy, dir, col = '#c8a060') {
  blit(sharedSprite('dcamel' + dir + col, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(-3, 0, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-4, -3.5, 5, 3, 0, Math.PI, 0); ctx.fill();                     // hump
    ctx.beginPath(); ctx.moveTo(5, -1); ctx.quadraticCurveTo(11, -2, 12, -5); ctx.lineTo(16, -5); ctx.lineTo(16, -3); ctx.lineTo(13, -2); ctx.quadraticCurveTo(12, 2, 6, 2); ctx.fill();   // neck, head
    ctx.fillRect(-11, 2, 2, 4); ctx.fillRect(-6, 2, 2, 4); ctx.fillRect(1, 2, 2, 4); ctx.fillRect(5, 2, 2, 4);
    ctx.beginPath(); ctx.ellipse(-3, 0, 10, 4, 0, 0, Math.PI * 2); ctx.moveTo(1, -3.5); ctx.ellipse(-4, -3.5, 5, 3, 0, 0, Math.PI, true); desStroke(0.9);
    ctx.fillStyle = '#c0303a'; ctx.fillRect(-9, -2, 10, 3);                                     // a saddle blanket
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(14, -4.5, 0.7, 0, Math.PI * 2); ctx.fill();
  }), x, sy);
}

// ---------- Spinning Drifter: a tumbleweed or a spiky seed pod, filling a 20-unit circle ----------
function drawDesertTumble(o, sy) {
  const col = o.desCol || '#c8a46a', look = o.look || 'tumbleweed';
  blit(sharedSprite('dtumble' + look + col, 46, 46, 23, 23, () => {
    if (look === 'seedpod') {                      // a round seed pod with hooked spikes
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 18.5, Math.sin(a) * 18.5); ctx.lineTo(Math.cos(a + 0.15) * 17, Math.sin(a + 0.15) * 17); }
      ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); desStroke(1.4);
      ctx.strokeStyle = desShade(0.3); ctx.lineWidth = 1; ctx.beginPath(); for (const a of [0, 1.05, 2.1]) { ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(-Math.cos(a) * 12, -Math.sin(a) * 12); } ctx.stroke();
    } else {                                       // a tumbleweed: a ball of tangled dry twigs
      ctx.strokeStyle = DES_LINE; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      const tangle = () => { ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = i * 2.2, b = a + 2.4; ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); ctx.quadraticCurveTo(Math.cos(a + 1.2) * 6, Math.sin(a + 1.2) * 6, Math.cos(b) * 18, Math.sin(b) * 18); } ctx.stroke(); };
      tangle(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; tangle();
      ctx.beginPath(); ctx.arc(0, 0, 18.5, 0, Math.PI * 2); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    }
  }), o.x, sy, o.rot);
}

// ---------- Spinning Blades: two crossed palm fronds, or two windpump blades, spinning and scissoring ----------
function drawDesertFronds(o, sy) {
  const col = o.desCol || '#5fa846', pump = o.look === 'windpump';
  const piece = sharedSprite('dfrond' + o.look + col, 106, 26, 34, 13, () => {
    if (pump) {                                    // a metal windpump blade on an arm
      ctx.fillStyle = '#8a9098'; ctx.fillRect(-8, -1.5, 32, 3);
      ctx.beginPath(); ctx.moveTo(20, -4); ctx.lineTo(64, -3); ctx.lineTo(66, 0); ctx.lineTo(64, 3); ctx.lineTo(20, 4); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); desStroke(1.2);
      ctx.strokeStyle = desShade(0.25); ctx.lineWidth = 1; ctx.beginPath(); for (let x = 28; x < 62; x += 8) { ctx.moveTo(x, -3.5); ctx.lineTo(x, 3.5); } ctx.stroke();
      ctx.fillStyle = '#c0303a'; ctx.beginPath(); ctx.arc(-20, 0, 9, 0, Math.PI * 2); ctx.fill(); desStroke(1.3);
      ctx.fillStyle = '#e0e0e0'; ctx.beginPath(); ctx.arc(-20, 0, 3.5, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a palm frond: a stem with leaflets along it, a coconut at the base
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(64, 0); ctx.stroke();
      ctx.fillStyle = col;
      for (let x = -2; x < 60; x += 5) { const w = 3.4 - x / 40; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + 3, d * w * 0.6, 3.5, w * 0.55, d * 0.5, 0, Math.PI * 2); ctx.fill(); } }
      ctx.fillStyle = '#7a5030'; ctx.beginPath(); ctx.arc(-20, 0, 9.5, 0, Math.PI * 2); ctx.fill(); desStroke(1.3);
      ctx.fillStyle = '#3a2414'; for (const [x, y] of [[-22, -2], [-18, -2], [-20, 2]]) { ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); }
    }
  });
  for (const s of [-1, 1]) blit(piece, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = pump ? '#5a6068' : DWOOD; ctx.beginPath(); ctx.arc(o.x, sy, 3.2, 0, Math.PI * 2); ctx.fill(); desStroke(1);
}

// ---------- Sweeping Arm: a water-well lever with a bucket, or a windvane arm, turning round its post ----------
function drawDesertLever(o, sy) {
  const hh = o.hh || 5, col = o.desCol || DWOOD, vane = o.look === 'windvane';
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.ang);
  ctx.beginPath(); roundRectPath(4, -2.5, o.L - 14, 5, 2.5); ctx.fillStyle = col; ctx.fill(); desStroke(1.2);
  if (vane) {                                      // a metal vane at the end
    ctx.beginPath(); ctx.moveTo(o.L - 16, -hh); ctx.lineTo(o.L, -hh + 1); ctx.lineTo(o.L, hh - 1); ctx.lineTo(o.L - 16, hh); ctx.closePath(); ctx.fillStyle = '#c0303a'; ctx.fill(); desStroke(1.2);
  } else {                                         // a rope down to a wooden bucket at the end
    ctx.beginPath(); roundRectPath(o.L - 12, -hh, 12, hh * 2, 2); ctx.fillStyle = '#a0703a'; ctx.fill(); desStroke(1.2);
    ctx.fillStyle = '#5a6068'; ctx.fillRect(o.L - 12, -hh, 2, hh * 2); ctx.fillRect(o.L - 3, -hh, 2, hh * 2);
    ctx.fillStyle = '#7fc8f0'; ctx.fillRect(o.L - 9, -hh + 1.5, 5, hh * 2 - 3);
  }
  ctx.restore();
  ctx.fillStyle = '#b88a5a'; ctx.beginPath(); ctx.arc(o.x, sy, 8.5, 0, Math.PI * 2); ctx.fill(); desStroke(1.5);
  ctx.fillStyle = '#5a4030'; ctx.beginPath(); ctx.arc(o.x, sy, 3, 0, Math.PI * 2); ctx.fill();
}

// ---------- Wall Piston: a chameleon's tongue shooting out of its rock, or a sandstone column sliding out ----------
function drawDesertTongue(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, col = o.desCol || '#5fae4a', column = o.look === 'column';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    const tip = h + e;
    if (column) {                                  // a square sandstone column with layers
      ctx.beginPath(); ctx.rect(h - 6, -6, e + 4, 12); ctx.fillStyle = '#d08a4a'; ctx.fill(); desStroke(1.2);
      ctx.fillStyle = desShade(0.15); for (let x = h; x < tip - 4; x += 12) ctx.fillRect(x, -6, 4, 12);
      ctx.fillStyle = desLight(0.25); ctx.fillRect(h - 6, -6, e + 4, 2.5);
    } else {                                       // a long sticky pink tongue with a round tip
      ctx.strokeStyle = DES_LINE; ctx.lineWidth = 5.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(h - 4, 0); ctx.lineTo(tip - 6, 0); ctx.stroke();
      ctx.strokeStyle = '#ff7aa0'; ctx.lineWidth = 3.5; ctx.stroke();
      ctx.fillStyle = '#ff5a8a'; ctx.beginPath(); ctx.arc(tip - 6, 0, 5.5, 0, Math.PI * 2); ctx.fill(); desStroke(1.2);
      ctx.fillStyle = desLight(0.6); ctx.beginPath(); ctx.arc(tip - 8, -2, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  // the base on the wall: a rock ledge (with the chameleon sitting on it, its curly tail and big eye)
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 6); ctx.fillStyle = '#c07a40'; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = desShade(0.15); ctx.fillRect(-6, 4, h + 6, 8); ctx.restore();
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 6); desStroke(1.5);
  if (!column) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(46, -2, 22, 8, 0, 0, Math.PI * 2); ctx.fill(); desStroke(1.3);
    ctx.beginPath(); ctx.moveTo(62, -8); ctx.quadraticCurveTo(76, -6, 78, 0); ctx.quadraticCurveTo(74, 6, 62, 4); ctx.closePath(); ctx.fill(); desStroke(1.2);   // head
    ctx.strokeStyle = DES_LINE; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(26, -2); ctx.quadraticCurveTo(10, -4, 10, 4); ctx.arc(15, 4, 5, Math.PI, Math.PI * 2.6); ctx.stroke();   // curly tail
    ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(68, -3, 4, 0, Math.PI * 2); ctx.fill(); desStroke(1);
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(69.5, -3, 1.8, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(h - 4, -7, 4, 14);
  }
  ctx.restore();
}

// ---------- Wall Turret: a cactus shooting needles or a camel spitting (a cartoon) ----------
// the cactus bristles (or the camel puffs its cheeks) just before each shot
function drawDesertSpitter(o, sy) {
  const dir = inward(o), col = o.desCol || CACTUS, camel = o.look === 'camelspit';
  for (const b of o.blobs) {
    if (camel) {                                   // a splat of spit
      ctx.fillStyle = 'rgba(230,240,220,.9)'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.8, 0, Math.PI * 2); ctx.fill(); desStroke(0.9);
      ctx.fillStyle = 'rgba(230,240,220,.7)'; for (const k of [1.3, 2]) { ctx.beginPath(); ctx.arc(b.x - dir * b.r * k, sy + (k - 1.6) * 3, b.r * 0.3, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a bundle of three needles flying point first
      ctx.strokeStyle = SPINE; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
      for (const dy of [-3, 0, 3]) { ctx.moveTo(b.x - dir * b.r, sy + dy); ctx.lineTo(b.x + dir * b.r * 0.9, sy + dy * 0.4); }
      ctx.stroke(); ctx.strokeStyle = DES_LINE; ctx.lineWidth = 0.8; ctx.stroke();
    }
  }
  const head = sharedSprite('dspit' + o.look + dir + col, 170, 50, 85, 25, () => {
    ctx.scale(dir, 1);
    if (camel) {                                   // a camel's long neck and head poking out of a sandstone gap
      ctx.fillStyle = '#c07a40'; ctx.beginPath(); roundRectPath(-4, -11, 18, 22, 3); ctx.fill(); desStroke(1.3);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(10, -6); ctx.quadraticCurveTo(30, -10, 44, -8); ctx.lineTo(44, 6); ctx.quadraticCurveTo(30, 4, 10, 8); ctx.closePath(); ctx.fill(); desStroke(1.3);
      ctx.beginPath(); ctx.ellipse(54, -1, 12, 8, 0, 0, Math.PI * 2); ctx.fill(); desStroke(1.3);
      ctx.beginPath(); roundRectPath(62, -4, 14, 8, 3); ctx.fill(); desStroke(1.2);                       // muzzle
      ctx.beginPath(); ctx.ellipse(48, -9, 2.5, 3.5, -0.3, 0, Math.PI * 2); ctx.fill(); desStroke(1);    // ear
      ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(55, -3, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = DES_LINE; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(53, -5.5); ctx.lineTo(58, -5); ctx.stroke();   // a sleepy lid
      ctx.fillStyle = '#5a3a20'; ctx.beginPath(); ctx.arc(74, -1, 1.2, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a saguaro arm growing out of the wall, bristling with spines
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-4, -11, 66, 22, 11); ctx.fill(); desStroke(1.5);
      ctx.strokeStyle = CACTUS_DARK; ctx.lineWidth = 1.4; ctx.beginPath(); for (const y of [-5, 0, 5]) { ctx.moveTo(0, y); ctx.lineTo(56, y); } ctx.stroke();
      ctx.fillStyle = SPINE; for (let x = 6; x < 56; x += 8) for (const y of [-9, 9]) { ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(58, -4, 20, 8, 4); ctx.fill(); desStroke(1.2);
      ctx.fillStyle = '#ffb030'; ctx.beginPath(); ctx.arc(30, -12, 3, 0, Math.PI * 2); ctx.fill();
    }
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    const flick = Math.floor(o.timer * 20) % 2;
    ctx.fillStyle = camel ? (flick ? '#f0f4e8' : '#c8d8b8') : (flick ? SPINE : '#ffb030');
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 78, sy, 4, 0, Math.PI * 2); ctx.fill(); desStroke(1);
  }
}

// ---------- Charged Beam: sunlight flashing off a mirror-like rock, or a sand geyser blasting sideways ----------
function drawDesertGlint(o, sy) {
  const x0 = ZAP_BODY, L = o.len, geyser = o.look === 'geyser';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save();
    ctx.strokeStyle = geyser ? '#a07040' : '#e0a020'; ctx.globalAlpha = 0.3 + 0.6 * Math.min(1, o.t / 0.7); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.restore();
    if (geyser) { ctx.fillStyle = '#e8c890'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x0 + 2 + rand(0, 6), rand(-3, 3), 1.4, 0, Math.PI * 2); ctx.fill(); } }   // sand trickling out
  } else if (o.phase === 'zap') {
    if (geyser) {                                  // a blast of sand: a tan jet with grains flying
      ctx.fillStyle = 'rgba(232,200,144,.55)'; ctx.beginPath(); ctx.moveTo(x0, -4); ctx.lineTo(x0 + L, -6); ctx.lineTo(x0 + L, 6); ctx.lineTo(x0, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c8a060'; for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(x0 + rand(0, L), rand(-5, 5), rand(1, 2.2), 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a bright flash of sunlight
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#fff2a0'; ctx.globalAlpha = 0.45; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    }
  }
  ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 5); ctx.fillStyle = '#c07a40'; ctx.fill(); desStroke(1.4);
  if (geyser) {                                    // a crack full of sand
    ctx.fillStyle = '#3a2414'; ctx.beginPath(); ctx.moveTo(x0 - 18, -5); ctx.lineTo(x0 - 4, -3); ctx.lineTo(x0, 0); ctx.lineTo(x0 - 4, 3); ctx.lineTo(x0 - 18, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8c890'; ctx.beginPath(); ctx.ellipse(x0 - 10, 0, 6, 2.2, 0, 0, Math.PI * 2); ctx.fill();
  } else {                                         // a shiny mirror-like flake of rock
    ctx.fillStyle = o.phase === 'rest' ? '#c8d8e0' : '#ffffff'; ctx.beginPath(); ctx.moveTo(x0 - 18, -6); ctx.lineTo(x0 - 2, -4); ctx.lineTo(x0, 4); ctx.lineTo(x0 - 16, 6); ctx.closePath(); ctx.fill(); desStroke(1.1);
    ctx.strokeStyle = desLight(0.8); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 - 14, -3); ctx.lineTo(x0 - 6, 2); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Telegraphed Sweep: a scorpion's tail striking, or a swinging pickaxe, after a dashed wedge ----------
function drawDesertScorpion(o, sy) {
  const col = o.desCol || '#c06a2a', axe = o.look === 'pickaxe';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(2, 0, 7, 16, 0, 0, Math.PI * 2); ctx.fill();   // a hole in the rock
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = axe ? '#8a6a4a' : '#c06a2a'; ctx.globalAlpha = 0.35 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    if (axe) {                                     // a wooden handle and an iron pick head
      ctx.beginPath(); roundRectPath(-8, -4, len - 4, 8, 4); ctx.fillStyle = col; ctx.fill(); desStroke(1.2);
      ctx.translate(len, 0);
      ctx.fillStyle = '#7a8088'; ctx.beginPath(); ctx.moveTo(-4, -4); ctx.quadraticCurveTo(-2, -14, 6, -17); ctx.quadraticCurveTo(4, -8, 6, -4); ctx.lineTo(6, 4); ctx.quadraticCurveTo(4, 8, 6, 17); ctx.quadraticCurveTo(-2, 14, -4, 4); ctx.closePath(); ctx.fill(); desStroke(1.3);
      ctx.fillStyle = desLight(0.35); ctx.fillRect(-2, -3, 4, 6);
    } else {                                       // a segmented tail curving to a stinger
      for (let x = 0, i = 0; x < len - 14; x += 13, i++) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x + 6, 0, 8, 9 - i * 0.4, 0, 0, Math.PI * 2); ctx.fill(); desStroke(1.2);
      }
      ctx.translate(len, 0);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(-6, 0, 10, 8, 0, 0, Math.PI * 2); ctx.fill(); desStroke(1.3);
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(2, -4); ctx.quadraticCurveTo(16, -2, 14, 10); ctx.quadraticCurveTo(10, 2, 2, 4); ctx.closePath(); ctx.fill(); desStroke(1);
    }
  }
  ctx.restore();
}

// ---------- Proximity Blast: a cactus fruit bursting into spines, or a clay jar shattering ----------
function drawDesertBurst(o, sy) {
  const jar = o.look === 'jar', col = o.desCol || '#e0406a';
  if (o.phase === 'boom' || o.phase === 'gone') {
    const t = o.phase === 'boom' ? o.t : 0.35 + o.t;
    if (t > 0.65) return;
    const r = o.blast * Math.min(1, t / 0.12), fade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.3;
    ctx.save();
    ctx.globalAlpha = 0.3 * fade; ctx.fillStyle = jar ? '#e8c890' : '#ff9ab8'; ctx.beginPath(); ctx.arc(o.x, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade; ctx.strokeStyle = jar ? '#a07040' : col; ctx.lineWidth = 4; ctx.stroke();
    ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4, d = r * (0.3 + 0.6 * ((i * 37) % 10) / 10), x = o.x + Math.cos(a) * d, y = sy + Math.sin(a) * d;
      if (jar) { ctx.fillStyle = '#c87a4a'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 5, y + 2); ctx.lineTo(x + 1, y + 6); ctx.closePath(); ctx.fill(); }   // shards
      else { ctx.strokeStyle = SPINE; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); ctx.stroke(); }   // spines
    }
    ctx.restore();
    return;
  }
  const blink = o.phase === 'blink';
  if (blink) {
    ctx.save();
    ctx.strokeStyle = jar ? '#a07040' : col; ctx.globalAlpha = 0.35 + 0.5 * Math.min(1, o.t / 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  const swell = blink ? 1 + 0.08 * Math.sin(o.t * 40) : 1;
  blit(sharedSprite('dburst' + jar + col, 40, 40, 20, 20, () => {
    if (jar) {                                     // a round clay jar with a painted band
      ctx.fillStyle = '#c87a4a'; ctx.beginPath(); ctx.moveTo(-5, -12); ctx.lineTo(5, -12); ctx.lineTo(5, -9); ctx.quadraticCurveTo(14, -6, 13, 3); ctx.quadraticCurveTo(12, 13, 0, 13); ctx.quadraticCurveTo(-12, 13, -13, 3); ctx.quadraticCurveTo(-14, -6, -5, -9); ctx.closePath(); ctx.fill(); desStroke(1.4);
      ctx.fillStyle = '#5a3a20'; ctx.fillRect(-12, -1, 24, 3);
      ctx.fillStyle = '#f0d8b0'; for (let x = -9; x < 10; x += 6) { ctx.beginPath(); ctx.moveTo(x, 4); ctx.lineTo(x + 3, 8); ctx.lineTo(x + 6, 4); ctx.fill(); }
      ctx.fillStyle = desLight(0.35); ctx.beginPath(); ctx.ellipse(-6, -2, 2, 5, 0.2, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a plump cactus fruit covered in tiny spines
      ctx.fillStyle = CACTUS; ctx.beginPath(); ctx.ellipse(0, 10, 9, 4, 0, Math.PI, 0); ctx.fill(); desStroke(1.1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -1, 11, 13, 0, 0, Math.PI * 2); ctx.fill(); desStroke(1.4);
      ctx.fillStyle = SPINE; for (let i = 0; i < 12; i++) { const a = i * 2.4, d = 4 + (i % 3) * 3; ctx.beginPath(); ctx.arc(Math.cos(a) * d, -1 + Math.sin(a) * d * 1.1, 1.1, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#ffb030'; ctx.beginPath(); ctx.arc(0, -13, 3, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, blink ? Math.sin(o.t * 50) * 0.08 : 0, swell, swell);
}

// ---------- Push Zone (before 700 m only): a sandstorm gust, faint streaks of sand; nothing solid ----------
function drawDesertSandstorm(o, sy) {
  const dir = -o.side;
  ctx.save();
  ctx.strokeStyle = 'rgba(200,160,90,.55)'; ctx.fillStyle = 'rgba(180,140,80,.6)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 7; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 7;
    const run = (o.t * 190 + k * 63) % (W + 60);
    const x0 = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + dir * 20, yy - 4, x0 + dir * 40, yy); ctx.stroke();
    for (const k2 of [48, 54, 60]) { ctx.beginPath(); ctx.arc(x0 + dir * k2, yy + (k2 - 54) * 0.3, 1.3, 0, Math.PI * 2); ctx.fill(); }   // grains
  }
  ctx.restore();
}

// ---------- Effect Zone: rising heat shimmer that slows the fall (never hurts) ----------
function drawDesertHeat(o, sy) {
  const x0 = o.x - o.w / 2, y0 = sy - o.h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(255,190,110,.12)'; ctx.fillRect(x0, y0, o.w, o.h);
  ctx.strokeStyle = 'rgba(255,170,80,.6)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]); ctx.strokeRect(x0, y0, o.w, o.h); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,250,230,.75)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 5; k++) {                    // wavy lines of heat drifting up
    const ph = (o.t * 0.5 + k / 5) % 1, y = y0 + o.h - ph * o.h;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5);
    ctx.beginPath(); ctx.moveTo(x0 + 6, y);
    for (let x = x0 + 6; x <= x0 + o.w - 6; x += 4) ctx.lineTo(x, y + Math.sin((x - x0) * 0.35 + o.t * 6) * 2.5);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- Spring Line: a frayed rope between two wooden posts ----------
// the rope bounces the plane away; the post tops hurt
function drawDesertRope(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y;
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9);
  const bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + 5;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2);
  ctx.strokeStyle = DES_LINE; ctx.lineWidth = 4.4; ctx.stroke();
  ctx.strokeStyle = o.desCol || '#c9a66b'; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.strokeStyle = desShade(0.3); ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);   // twisted strands
  const mx = (o.x1 + 2 * cx + o.x2) / 4, my = (sy + dy1 + 2 * cy + sy + dy2) / 4;                                      // a frayed tuft in the middle
  ctx.strokeStyle = o.desCol || '#c9a66b'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const a of [-0.5, 0, 0.5]) { ctx.moveTo(mx, my); ctx.lineTo(mx + Math.sin(a) * 5, my + 6); } ctx.stroke();
  ctx.restore();
  const post = sharedSprite('dpost', 24, 24, 12, 12, () => {
    ctx.fillStyle = DWOOD; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); desStroke(1.4);
    ctx.fillStyle = '#d8b880'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,40,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, Math.PI * 2); ctx.stroke();
  });
  blit(post, o.x1, sy + dy1); blit(post, o.x2, sy + dy2);
}

// ---------- Looks added in v129 (DESERT_LOOKS / DESERT_LAYERS in obstacles.js) ----------
// a dry branch and, in the deep layers, a long fossil bone as sliders; date clusters from the oasis palms and, deep down,
// drops of amber as projectiles; a geode that cracks open in a burst of crystals as a proximity blast
const DESERT_EXTRA = {
  drybranch: (o, sy) => drawDesertBar(o, sy), bone: (o, sy) => drawDesertBar(o, sy),
  dates: (o, sy) => drawDesertDrop(o, sy), amber: (o, sy) => drawDesertDrop(o, sy),
  geode: (o, sy) => drawGeodeBurst(o, sy)
};

// Bouncing Slider: a forked dry branch, or a long fossil bone with knobbly ends, 13 thick
function drawDesertBar(o, sy) {
  const L = o.len / 2, col = o.desCol || (o.look === 'bone' ? '#ece2c8' : '#a08060');
  blit(ownSprite(o, 'sprX', o.len + 8, 22, L + 4, 11, () => {
    if (o.look === 'bone') {
      ctx.fillStyle = col;
      ctx.beginPath(); roundRectPath(-L + 8, -5, o.len - 16, 10, 4); ctx.fill(); desStroke(1.2);
      for (const s of [-1, 1]) for (const y of [-3, 3]) { ctx.beginPath(); ctx.arc(s * (L - 6), y, 4.6, 0, Math.PI * 2); ctx.fill(); desStroke(1.2); }
      ctx.beginPath(); roundRectPath(-L + 8, -5, o.len - 16, 10, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(160,130,90,.6)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = -L + 16; x < L - 16; x += 14) { ctx.moveTo(x, -2); ctx.lineTo(x + 5, 1.5); } ctx.stroke();
    } else {
      ctx.strokeStyle = DES_LINE; ctx.lineWidth = 12.4; ctx.lineCap = 'round';
      const path = () => { ctx.beginPath(); ctx.moveTo(-L + 2, 1); ctx.quadraticCurveTo(0, -2, L - 2, 0); ctx.moveTo(L * 0.25, -0.5); ctx.lineTo(L * 0.42, -1.5); ctx.moveTo(-L * 0.4, 0.5); ctx.lineTo(-L * 0.55, 1.5); };
      path(); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 10; path(); ctx.stroke();
      ctx.strokeStyle = desLight(0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-L + 6, -0.5); ctx.quadraticCurveTo(0, -3, L - 6, -1.5); ctx.stroke();
    }
  }), o.x, sy, o.a);
}

// Rising Projectile: a cluster of dates on a little stalk, or a glowing drop of amber with a tiny leaf inside
function drawDesertDrop(o, sy) {
  const s = o.r / 16, amber = o.look === 'amber', col = o.desCol || (amber ? '#e8a030' : '#7a3a20');
  blit(sharedSprite('ddrop' + o.look + col, 36, 36, 18, 18, () => {
    if (amber) {
      ctx.fillStyle = 'rgba(255,190,80,.35)'; ctx.beginPath(); ctx.arc(0, 1, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -13); ctx.quadraticCurveTo(12, -2, 10, 6); ctx.quadraticCurveTo(7, 13, 0, 13); ctx.quadraticCurveTo(-7, 13, -10, 6); ctx.quadraticCurveTo(-12, -2, 0, -13); ctx.fill(); desStroke(1.4);
      ctx.fillStyle = '#5a7a2a'; ctx.beginPath(); ctx.ellipse(0, 4, 4, 2, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = desLight(0.55); ctx.beginPath(); ctx.ellipse(-4, -2, 2, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, -6); ctx.stroke();
      for (const [x, y] of [[-6, -3], [6, -3], [0, -1], [-4, 6], [4, 6], [0, 11]]) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, 4.2, 5.5, x * 0.04, 0, Math.PI * 2); ctx.fill(); desStroke(1.1);
        ctx.fillStyle = desLight(0.4); ctx.beginPath(); ctx.arc(x - 1.5, y - 2, 1.2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }), o.x, sy, o.rot * (amber ? 0.4 : 1), s, s);
}

// Proximity Blast: a round rock that swells, shakes and cracks open in a burst of purple crystals
function drawGeodeBurst(o, sy) {
  const col = o.desCol || '#9a8a7a';
  if (o.phase === 'boom' || o.phase === 'gone') {
    const t = o.phase === 'boom' ? o.t : 0.35 + o.t;
    if (t > 0.65) return;
    const r = o.blast * Math.min(1, t / 0.12), fade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.3;
    ctx.save();
    ctx.globalAlpha = 0.3 * fade; ctx.fillStyle = '#c8a0f0'; ctx.beginPath(); ctx.arc(o.x, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade; ctx.strokeStyle = '#8a5ad8'; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 14; i++) {                 // crystal shards flying out
      const a = i * 2.4, d = r * (0.3 + 0.6 * ((i * 37) % 10) / 10), x = o.x + Math.cos(a) * d, y = sy + Math.sin(a) * d;
      ctx.fillStyle = i % 2 ? '#b07af0' : '#e8d8ff'; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); ctx.lineTo(x - Math.sin(a) * 2.5, y + Math.cos(a) * 2.5); ctx.lineTo(x + Math.sin(a) * 2.5, y - Math.cos(a) * 2.5); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    return;
  }
  const blink = o.phase === 'blink';
  if (blink) {
    ctx.save(); ctx.strokeStyle = '#8a5ad8'; ctx.globalAlpha = 0.35 + 0.5 * Math.min(1, o.t / 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  const swell = blink ? 1 + 0.08 * Math.sin(o.t * 40) : 1;
  blit(sharedSprite('geode' + col, 40, 40, 20, 20, () => {
    ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = i % 2 ? 12 : 13.5; ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); }
    ctx.closePath(); ctx.fill(); desStroke(1.4);
    ctx.fillStyle = desShade(0.15); for (const [x, y] of [[-5, 4], [4, -6], [6, 5]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#8a5ad8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(-3, 0); ctx.lineTo(2, -5); ctx.lineTo(9, -2); ctx.stroke();   // a crack showing purple inside
    ctx.strokeStyle = '#e8d8ff'; ctx.lineWidth = 0.8; ctx.stroke();
  }), o.x, sy, blink ? Math.sin(o.t * 50) * 0.08 : 0, swell, swell);
}
