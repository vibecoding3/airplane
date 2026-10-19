// Paper Nosedive — Art for the Forest map obstacles.
'use strict';

// Forest obstacles reuse a Paper or Ocean obstacle's movement and collision (see FOREST_MAKERS) and only change the
// look (o.look, see FOREST_LOOKS) in a few colours (o.forCol). Leaves follow the season the obstacle is in (o.season,
// LEAF_COLS): fresh green, deep green, orange, snow, then dark green at night. Every drawing stays inside the
// mechanic's collision shape, with a dark brown outline so it reads on light and dark backgrounds.
const FOR_LINE = '#2a1d12';
function forStroke(w = 1.6) { ctx.strokeStyle = FOR_LINE; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
const forLight = a => `rgba(255,255,255,${a})`, forShade = a => `rgba(0,0,0,${a})`;
const BARK = '#6b4a2a', WOOD = '#e0c08a';
const leafCol = o => LEAF_COLS[o.season || 0];

function drawForestObstacle(o, sy) {
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawForestBranch(-10, l, sy, l, -1, o); drawForestBranch(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawForestJaw(-10, l, sy, l, -1, o); drawForestJaw(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'blot': drawForestHazard(o, sy); break;
    case 'protractor': drawForestBulge(o, sy); break;
    case 'pencil': drawForestStick(o, sy); break;
    case 'wad': drawForestNut(o, sy); break;
    case 'note': drawForestFlyer(o, sy); break;
    case 'clips': for (const x of clipXs(o)) drawForestDuck(x, sy, o.v > 0 ? 1 : -1, o.forCol, o.look); break;
    case 'starfish': drawForestSpinner(o, sy); break;
    case 'scissors': drawForestMaple(o, sy); break;
    case 'compass': drawForestSwing(o, sy); break;
    case 'cutter': drawForestLunge(o, sy); break;
    case 'glue': drawForestThrower(o, sy); break;
    case 'zap': drawForestBeam(o, sy); break;
    case 'paw': drawForestSweep(o, sy); break;
    case 'mine': drawForestBlast(o, sy); break;
    case 'fan': drawForestBreeze(o, sy); break;
    case 'bubbles': drawForestUpdraft(o, sy); break;
    case 'band': drawForestVine(o, sy); break;
  }
}

// ---------- Gap Wall: leafy branches or fallen logs from each wall, 22 thick ----------
function drawForestBranch(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.forCol || BARK, [l1, l2] = leafCol(o);
  const each = (step, f) => { for (let x = innerX + outDir * step, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * step, i++) f(x, i); };
  ctx.save();
  if (o.look === 'log') {                          // a fallen log: bark, moss (or snow) on top, tree rings at the end
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 6); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = forShade(0.25); ctx.lineWidth = 1.2; ctx.beginPath();
    for (const y of [-4, 3]) { ctx.moveTo(x0, sy + y); ctx.lineTo(x1, sy + y + 1); }
    ctx.stroke();
    ctx.fillStyle = o.season === 3 ? '#f4f8fc' : '#6fae4a'; ctx.fillRect(x0, sy - 11, x1 - x0, 4);
    ctx.restore();
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 6); forStroke(1.5);
    const ex = innerX + outDir * 7;
    ctx.fillStyle = WOOD; ctx.beginPath(); ctx.ellipse(ex, sy, 6, 10.5, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.2);
    ctx.strokeStyle = 'rgba(120,80,40,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(ex, sy, 3.5, 6.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(ex, sy, 1.4, 2.6, 0, 0, Math.PI * 2); ctx.stroke();
  } else {                                         // a branch: bark, a lower layer of leaves, a cut end
    ctx.beginPath(); roundRectPath(x0, sy - 4, x1 - x0, 15, 6); ctx.fillStyle = col; ctx.fill(); forStroke(1.4);
    ctx.strokeStyle = forShade(0.3); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, sy + 3); ctx.lineTo(x1, sy + 4); ctx.stroke();
    each(13, (x, i) => {
      ctx.fillStyle = i % 2 ? l1 : l2; ctx.beginPath(); ctx.ellipse(x, sy - 5, 7.5, 5, (i % 3 - 1) * 0.4, 0, Math.PI * 2); ctx.fill(); forStroke(1);
    });
    ctx.fillStyle = WOOD; ctx.beginPath(); ctx.ellipse(innerX + outDir * 4, sy + 3.5, 3.5, 7, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.1);
  }
  ctx.restore();
}

// ---------- Closing Jaws: two sharpened log halves or a beaver dam of sticks, 28 thick ----------
function drawForestJaw(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.forCol || '#8a5a32';
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fillStyle = o.look === 'dam' ? '#5a4030' : col; ctx.fill();
  ctx.save(); ctx.clip();
  if (o.look === 'dam') {                          // sticks piled up in mud
    ctx.lineCap = 'round';
    for (let k = 0; k < 7; k++) {
      const y = sy - 11 + k * 3.8;
      ctx.strokeStyle = k % 2 ? '#8a5a32' : '#a0703a'; ctx.lineWidth = 3.6;
      ctx.beginPath(); ctx.moveTo(x0, y + (k % 3)); ctx.lineTo(x1, y - (k % 2) * 2); ctx.stroke();
    }
    ctx.fillStyle = WOOD; for (let x = innerX + outDir * 3, k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x, sy - 10 + k * 7, 2.2, 0, Math.PI * 2); ctx.fill(); }
  } else {                                         // half a log: bark on top, pale wood below
    ctx.fillStyle = WOOD; ctx.fillRect(x0, sy + 2, x1 - x0, 12);
    ctx.strokeStyle = 'rgba(140,90,40,.45)'; ctx.lineWidth = 1; ctx.beginPath();
    for (const y of [6, 10]) { ctx.moveTo(x0, sy + y); ctx.lineTo(x1, sy + y); }
    ctx.stroke();
    ctx.strokeStyle = forShade(0.3); ctx.beginPath();
    for (let x = innerX + outDir * 14; outDir > 0 ? x < x1 : x > x0; x += outDir * 18) { ctx.moveTo(x, sy - 14); ctx.lineTo(x + outDir * 4, sy + 2); }
    ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); forStroke(1.6);
  ctx.restore();
}

// ---------- Static Hazards: hornets' nests, pinecones or thistles, inside the hit circle ----------
function drawForestHazard(o, sy) {
  const col = o.forCol || '#c9b48a', R = o.r * 0.88, look = o.look || 'pinecone';
  blit(ownSprite(o, 'spr', R * 2 + 8, R * 2 + 8, R + 4, R + 4, () => {
    if (look === 'hornets') {                      // a papery nest with bands and a dark entrance
      ctx.beginPath(); ctx.ellipse(0, 0, R * 0.8, R, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(120,100,70,.55)'; ctx.lineWidth = 2;
      for (let y = -R; y < R; y += R * 0.3) { ctx.beginPath(); ctx.moveTo(-R, y); ctx.quadraticCurveTo(0, y + R * 0.15, R, y); ctx.stroke(); }
      ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, 0, R * 0.8, R, 0, 0, Math.PI * 2); forStroke(1.5);
      ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.ellipse(0, R * 0.55, R * 0.18, R * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffc21f'; for (const [x, y] of [[-0.45, -0.3], [0.4, 0.1]]) { ctx.beginPath(); ctx.ellipse(R * x, R * y, 3, 2, 0, 0, Math.PI * 2); ctx.fill(); forStroke(0.8); }
    } else if (look === 'thistle') {               // a purple spiky flower on a green cup
      ctx.fillStyle = col; ctx.beginPath();
      for (let i = 0; i < 18; i++) { const a = Math.PI + i / 17 * Math.PI, r = i % 2 ? R * 0.55 : R; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.9); }
      ctx.closePath(); ctx.fill(); forStroke(1.2);
      ctx.fillStyle = '#5f9a3a'; ctx.beginPath(); ctx.arc(0, R * 0.05, R * 0.55, 0, Math.PI); ctx.lineTo(-R * 0.55, R * 0.05); ctx.closePath(); ctx.fill(); forStroke(1.3);
      ctx.strokeStyle = '#3f7a2a'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (const x of [-0.3, 0, 0.3]) { ctx.moveTo(R * x - 3, R * 0.2); ctx.lineTo(R * x, R * 0.45); ctx.lineTo(R * x + 3, R * 0.2); }
      ctx.stroke();
      ctx.fillStyle = '#5f9a3a'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * R * 0.4, R * 0.4); ctx.lineTo(d * R * 0.85, R * 0.45); ctx.lineTo(d * R * 0.5, R * 0.6); ctx.fill(); }
    } else {                                       // a pinecone: rows of scales
      ctx.beginPath(); ctx.ellipse(0, 0, R * 0.68, R, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); forStroke(1.5);
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, R * 0.68, R, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#b07a48';
      for (let r = 0; r < 6; r++) for (let c = -2; c <= 2; c++) {
        const x = c * R * 0.3 + (r % 2) * R * 0.15, y = -R * 0.85 + r * R * 0.32;
        ctx.beginPath(); ctx.moveTo(x - R * 0.13, y); ctx.lineTo(x, y + R * 0.2); ctx.lineTo(x + R * 0.13, y); ctx.closePath(); ctx.fill(); forStroke(0.8);
      }
      ctx.restore();
      ctx.fillStyle = BARK; ctx.fillRect(-1.5, -R, 3, R * 0.15);
    }
  }), o.x, sy);
}

// ---------- Wall Bulge: a tree trunk (brown or birch) or a big shelf fungus, an exact half-disc ----------
function drawForestBulge(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 4, i = -o.side;
  const s = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    const col = o.forCol || '#7a5030', look = o.look || 'trunk';
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    if (look === 'fungus') {                       // shelves of a bracket fungus, lighter toward the edge
      for (const [k, c] of [[1, col], [0.78, '#e0a860'], [0.56, '#c88a40'], [0.34, '#a06a2a']]) {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, o.r * k, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = forShade(0.25); ctx.lineWidth = 1.5; ctx.stroke();
      }
      ctx.fillStyle = '#f4e6c8'; ctx.globalAlpha = 0.6;
      for (let a = -1.2; a <= 1.2; a += 0.6) { ctx.beginPath(); ctx.arc(i * Math.cos(a) * o.r * 0.9, Math.sin(a) * o.r * 0.9, 2.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
    } else {                                       // a trunk seen side-on: bark grooves and a knot hole facing the middle
      const birch = look === 'birch';
      ctx.strokeStyle = birch ? '#2a2a2a' : forShade(0.3); ctx.lineWidth = birch ? 3 : 2;
      for (let y = -o.r; y < o.r; y += birch ? 22 : 9) {
        ctx.beginPath();
        if (birch) { ctx.moveTo(i * o.r * 0.2, y); ctx.lineTo(i * o.r * 0.55, y + 3); }
        else { ctx.moveTo(-o.r, y); ctx.quadraticCurveTo(0, y + 4, o.r, y); }
        ctx.stroke();
      }
      ctx.fillStyle = birch ? '#5a5a5a' : '#2a1d12'; ctx.beginPath(); ctx.ellipse(i * o.r * 0.55, -o.r * 0.15, o.r * 0.12, o.r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6fae4a'; for (const a of [0.9, 1.3, 1.7]) { ctx.beginPath(); ctx.ellipse(i * Math.cos(a) * o.r, Math.sin(a) * o.r, 9, 4, a, 0, Math.PI * 2); ctx.fill(); }   // moss
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); forStroke(1.8);
  });
  blit(s, cx, sy);
}

// ---------- Bouncing Slider: a stick with leaves or a frosted stick with icicles, 13 thick ----------
function drawForestStick(o, sy) {
  const L = o.len / 2, col = o.forCol || BARK, frost = o.look === 'frost', [l1, l2] = leafCol(o);
  blit(ownSprite(o, 'spr', o.len + 8, 22, L + 4, 11, () => {
    ctx.beginPath(); roundRectPath(-L, -3.5, o.len, 7, 3.5); ctx.fillStyle = col; ctx.fill(); forStroke(1.3);
    ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath();
    for (const k of [-0.5, 0.1, 0.6]) { ctx.moveTo(k * L, 0); ctx.lineTo(k * L + 9, k > 0 ? -5.5 : 5.5); }
    ctx.stroke();
    if (frost) {
      ctx.fillStyle = '#f4f8fc'; ctx.beginPath(); roundRectPath(-L + 2, -5.5, o.len - 4, 3.5, 1.7); ctx.fill();
      ctx.fillStyle = '#cfeeff'; for (let x = -L + 10; x < L - 6; x += 16) { ctx.beginPath(); ctx.moveTo(x - 2, 3); ctx.lineTo(x, 6.5); ctx.lineTo(x + 2, 3); ctx.fill(); }
    } else {
      for (const [k, d] of [[-0.75, -1], [-0.2, 1], [0.35, -1], [0.85, 1]]) {
        ctx.fillStyle = d > 0 ? l1 : l2; ctx.beginPath(); ctx.ellipse(k * L, d * 3, 6, 3.2, d * 0.4, 0, Math.PI * 2); ctx.fill(); forStroke(0.9);
      }
    }
  }), o.x, sy, o.a);
}

// ---------- Rising Projectile: acorns, chestnuts, apples or snowballs, spinning up through the trees ----------
function drawForestNut(o, sy) {
  const col = o.forCol || '#a0703a', s = o.r / 16, look = o.look || 'acorn';
  blit(sharedSprite('f' + look + col, 36, 36, 18, 18, () => {
    if (look === 'chestnut') {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -13); ctx.quadraticCurveTo(14, -6, 12, 6); ctx.quadraticCurveTo(0, 14, -12, 6); ctx.quadraticCurveTo(-14, -6, 0, -13); ctx.fill(); forStroke(1.4);
      ctx.fillStyle = '#d8b88a'; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.quadraticCurveTo(0, 14, 12, 6); ctx.quadraticCurveTo(0, 9, -12, 6); ctx.fill();
      ctx.fillStyle = forLight(0.45); ctx.beginPath(); ctx.ellipse(-4, -5, 3, 5, 0.4, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'apple') {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -8); ctx.bezierCurveTo(10, -14, 16, -2, 10, 8); ctx.bezierCurveTo(6, 14, -6, 14, -10, 8); ctx.bezierCurveTo(-16, -2, -10, -14, 0, -8); ctx.fill(); forStroke(1.4);
      ctx.strokeStyle = BARK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(1, -13); ctx.stroke();
      ctx.fillStyle = '#5fae4a'; ctx.beginPath(); ctx.ellipse(5, -12, 4, 2, -0.4, 0, Math.PI * 2); ctx.fill(); forStroke(0.8);
      ctx.fillStyle = forLight(0.5); ctx.beginPath(); ctx.ellipse(-5, -3, 2.5, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'snowball') {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); forStroke(1.3);
      ctx.fillStyle = 'rgba(150,180,210,.45)'; ctx.beginPath(); ctx.arc(3, 3, 10, 0.2, 2.2); ctx.fill();
      ctx.fillStyle = 'rgba(160,190,220,.6)'; for (const [x, y] of [[-4, -5], [5, -2], [-1, 5]]) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // an acorn with its cap
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 3, 9.5, 11, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.4);
      ctx.fillStyle = '#7a5030'; ctx.beginPath(); ctx.arc(0, -3, 11.5, Math.PI, 0); ctx.closePath(); ctx.fill(); forStroke(1.3);
      ctx.strokeStyle = forShade(0.3); ctx.lineWidth = 1; ctx.beginPath(); for (let x = -8; x <= 8; x += 4) { ctx.moveTo(x, -3); ctx.lineTo(x + 2, -11); } ctx.stroke();
      ctx.fillStyle = BARK; ctx.fillRect(-1.2, -16, 2.4, 3);
      ctx.fillStyle = forLight(0.4); ctx.beginPath(); ctx.ellipse(-4, 4, 2.2, 4, 0.2, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot, s, s);
}

// ---------- Drifting Swarm: bees, owls or bats (and the Forest birds collectibles), filling a 42-unit square ----------
// the Forest birds, drawn round and plump inside the square (also used by the Collections screen)
const BIRD_LOOKS = {
  robin: { body: '#8a6a4a', belly: '#e0603a', wing: '#6b4a2a', beak: '#3a2a1a', name: 'Robin' },
  bluejay: { body: '#3f7fd0', belly: '#e8eef4', wing: '#2a5aa8', beak: '#2a2a2a', crest: true, name: 'Blue jay' },
  kingfisher: { body: '#1fa0c8', belly: '#f08a3a', wing: '#1a78a8', beak: '#2a2a2a', longBeak: true, name: 'Kingfisher' },
  cardinal: { body: '#d9283a', belly: '#e04a4a', wing: '#b01a2a', beak: '#f0a030', crest: true, mask: true, name: 'Cardinal' },
  hummingbird: { body: '#3fb070', belly: '#e8f4ec', wing: '#2a8a5a', beak: '#2a2a2a', longBeak: true, throat: '#e0306a', name: 'Hummingbird' },
  goldfinch: { body: '#f6d02a', belly: '#f8e070', wing: '#2a2a2a', beak: '#f0a080', cap: '#2a2a2a', name: 'Goldfinch' },
  snowyowl: { body: '#f4f4f0', belly: '#ffffff', wing: '#e0e0d8', beak: '#3a3a3a', owl: true, name: 'Snowy owl' },
  magpie: { body: '#1a1a24', belly: '#f4f4f4', wing: '#2a4a9a', beak: '#1a1a1a', tail: true, name: 'Magpie' }
};
function paintForestBird(name) {
  const b = BIRD_LOOKS[name] || BIRD_LOOKS.robin;
  if (b.tail) { ctx.fillStyle = b.wing; ctx.beginPath(); ctx.moveTo(-10, 4); ctx.lineTo(-21, 12); ctx.lineTo(-19, 16); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill(); forStroke(1.1); }
  else { ctx.fillStyle = b.wing; ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(-19, 8); ctx.lineTo(-11, 10); ctx.closePath(); ctx.fill(); forStroke(1.1); }
  ctx.fillStyle = b.body; ctx.beginPath(); ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.5);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = b.belly; ctx.beginPath(); ctx.ellipse(5, 7, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  if (b.throat) { ctx.fillStyle = b.throat; ctx.beginPath(); ctx.ellipse(10, 0, 4, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  if (b.cap) { ctx.fillStyle = b.cap; ctx.beginPath(); ctx.ellipse(8, -9, 7, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  if (b.crest) { ctx.fillStyle = b.body; ctx.beginPath(); ctx.moveTo(2, -8); ctx.lineTo(-2, -17); ctx.lineTo(8, -9); ctx.closePath(); ctx.fill(); forStroke(1.1); }
  if (b.owl) {                                     // a snowy owl: big round eyes, dark speckles
    ctx.fillStyle = '#2a2a2a'; for (const [x, y] of [[-6, 6], [-2, 10], [-9, 1], [2, 13]]) { ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI * 2); ctx.fill(); }
    for (const x of [2, 9]) { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, -3, 3.4, 0, Math.PI * 2); ctx.fill(); forStroke(0.9); ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(x, -3, 1.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = b.beak; ctx.beginPath(); ctx.moveTo(4.5, 0); ctx.lineTo(5.5, 3.5); ctx.lineTo(6.5, 0); ctx.fill();
  } else {
    ctx.fillStyle = b.wing; ctx.beginPath(); ctx.ellipse(-3, 3, 7, 5, -0.3, 0, Math.PI * 2); ctx.fill(); forStroke(1);
    if (b.mask) { ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.ellipse(11, -2, 4, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = b.beak; ctx.beginPath(); ctx.moveTo(13, -3); ctx.lineTo(b.longBeak ? 22 : 18, -1); ctx.lineTo(13, 1); ctx.closePath(); ctx.fill(); forStroke(0.9);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(8, -4, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(8.6, -4, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#c08a4a'; ctx.lineWidth = 1.4; ctx.beginPath(); for (const x of [-2, 3]) { ctx.moveTo(x, 13); ctx.lineTo(x, 17); } ctx.stroke();
}
function drawForestFlyer(o, sy) {
  if (o.bird) { blit(sharedSprite('bird-' + o.bird, 50, 48, 25, 24, () => paintForestBird(o.bird)), o.x, sy, o.rot * 0.5); return; }
  const col = o.forCol || '#ffc21f', look = o.look || 'bee';
  blit(sharedSprite('f' + look + col, 48, 48, 24, 24, () => {
    if (look === 'owl') {                          // a round owl, wings out
      ctx.fillStyle = col;
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 14, 4, 7, 12, d * 0.5, 0, Math.PI * 2); ctx.fill(); forStroke(1.2); }
      ctx.beginPath(); ctx.ellipse(0, 3, 13, 16, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.5);
      ctx.beginPath(); ctx.moveTo(-10, -9); ctx.lineTo(-8, -18); ctx.lineTo(-3, -11); ctx.moveTo(10, -9); ctx.lineTo(8, -18); ctx.lineTo(3, -11); ctx.fill();
      ctx.fillStyle = '#efe2c8'; ctx.beginPath(); ctx.ellipse(0, 9, 8, 8, 0, 0, Math.PI * 2); ctx.fill();
      for (const d of [-1, 1]) { ctx.fillStyle = '#f4ecd8'; ctx.beginPath(); ctx.arc(d * 5.5, -4, 5, 0, Math.PI * 2); ctx.fill(); forStroke(1); ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(d * 5.5, -4, 2.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#e0a020'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(0, 4); ctx.lineTo(2, 0); ctx.fill();
    } else if (look === 'bat') {                   // a little bat with spread wings
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -4);
      ctx.quadraticCurveTo(-10, -14, -21, -6); ctx.quadraticCurveTo(-16, -2, -18, 6); ctx.quadraticCurveTo(-10, 2, -7, 8); ctx.quadraticCurveTo(-3, 4, 0, 9);
      ctx.quadraticCurveTo(3, 4, 7, 8); ctx.quadraticCurveTo(10, 2, 18, 6); ctx.quadraticCurveTo(16, -2, 21, -6); ctx.quadraticCurveTo(10, -14, 0, -4);
      ctx.fill(); forStroke(1.3);
      ctx.beginPath(); ctx.arc(0, -1, 6, 0, Math.PI * 2); ctx.fill(); forStroke(1.2);
      ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(-4, -11); ctx.lineTo(-1, -6); ctx.moveTo(5, -4); ctx.lineTo(4, -11); ctx.lineTo(1, -6); ctx.fill();
      ctx.fillStyle = '#ffd23f'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 2.4, -2, 1.3, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a fat bumblebee
      ctx.fillStyle = 'rgba(230,245,255,.85)';
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 7, -10, 7, 10, d * 0.5, 0, Math.PI * 2); ctx.fill(); forStroke(1); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 4, 15, 12, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.5);
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 4, 15, 12, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#2a1d12'; for (const x of [-7, 3]) ctx.fillRect(x, -10, 5, 30);
      ctx.restore();
      ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.arc(15, 3, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(16.5, 1.5, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot);
}

// ---------- Conveyor: a line of ducks or geese flying across (34 x 12 each, like a clip) ----------
function drawForestDuck(x, sy, dir, col = '#3f8a4a', look = 'duck') {
  blit(sharedSprite('fduck' + look + dir + col, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    const goose = look === 'goose';
    ctx.fillStyle = goose ? '#9a9a92' : '#a08a6a'; ctx.beginPath(); ctx.ellipse(-3, 1, 12, 5, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.1);
    ctx.fillStyle = goose ? '#2a2a2a' : col; ctx.beginPath(); ctx.ellipse(9, -1, 3.5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -2.5, 3.4, 0, Math.PI * 2); ctx.fill(); forStroke(0.9);
    ctx.fillStyle = goose ? '#2a2a2a' : '#f0b030'; ctx.beginPath(); ctx.moveTo(16, -3.5); ctx.lineTo(17, -1); ctx.lineTo(16, 0); ctx.lineTo(16, -3.5); ctx.fill();
    if (goose) { ctx.fillStyle = '#ffffff'; ctx.fillRect(12, -1.5, 3, 1.6); }
    ctx.fillStyle = goose ? '#7a7a72' : '#8a7050'; ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(2, -1); ctx.lineTo(-4, -6); ctx.closePath(); ctx.fill(); forStroke(0.9);   // the wing up
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(14, -3.4, 0.9, 0, Math.PI * 2); ctx.fill();
  }), x, sy);
}

// ---------- Spinning Drifter: a spiky chestnut husk, a winged seed or a snowflake, filling a 20-unit circle ----------
function drawForestSpinner(o, sy) {
  const col = o.forCol || '#8ab040', look = o.look || 'husk';
  blit(sharedSprite('fspin' + look + col, 46, 46, 23, 23, () => {
    if (look === 'snowflake') {
      ctx.strokeStyle = col; ctx.lineCap = 'round';
      for (const [w, c] of [[5, 'rgba(120,160,200,.55)'], [2.6, col]]) {
        ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * Math.PI * 2, cx = Math.cos(a), sn = Math.sin(a);
          ctx.moveTo(0, 0); ctx.lineTo(cx * 18, sn * 18);
          for (const d of [-1, 1]) { const b = a + d * 0.6; ctx.moveTo(cx * 11, sn * 11); ctx.lineTo(cx * 11 + Math.cos(b) * 6, sn * 11 + Math.sin(b) * 6); }
        }
        ctx.stroke();
      }
    } else if (look === 'seed') {                  // a three-winged seed spinning like a little propeller
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.rotate(i / 3 * Math.PI * 2);
        ctx.fillStyle = 'rgba(220,190,130,.9)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -9, 19, -3); ctx.quadraticCurveTo(12, 3, 0, 0); ctx.fill(); forStroke(1);
        ctx.strokeStyle = 'rgba(120,80,40,.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(2, -1); ctx.lineTo(16, -3); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); forStroke(1.1);
    } else {                                       // a spiky green husk split open around a chestnut
      ctx.strokeStyle = '#6a8a2a'; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.lineTo(Math.cos(a) * 19.5, Math.sin(a) * 19.5); }
      ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); forStroke(1.4);
      ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 6, 0.6, 0, Math.PI * 2); ctx.fill(); forStroke(1.1);
      ctx.fillStyle = forLight(0.5); ctx.beginPath(); ctx.ellipse(-2, -2, 2, 3, 0.6, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot);
}

// ---------- Spinning Blades: two maple seeds ("helicopters") spinning and scissoring ----------
// each wing matches a scissor blade's hit box and each seed its handle circle
function drawForestMaple(o, sy) {
  const col = o.forCol || '#c8904a';
  const piece = sharedSprite('fmaple' + col, 106, 26, 34, 13, () => {
    ctx.beginPath(); ctx.moveTo(-8, -3); ctx.quadraticCurveTo(20, -5, 50, -4); ctx.quadraticCurveTo(66, -2, 65, 1);
    ctx.quadraticCurveTo(56, 4, 30, 3.5); ctx.lineTo(-8, 3); ctx.closePath();
    ctx.globalAlpha = 0.9; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1; forStroke(1.2);
    ctx.strokeStyle = forShade(0.3); ctx.lineWidth = 0.8; ctx.beginPath();
    for (let x = 4; x < 60; x += 8) { ctx.moveTo(x, -3.5); ctx.lineTo(x + 5, 3); }
    ctx.stroke();
    ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.ellipse(-20, 0, 9.5, 7.5, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.3);
    ctx.fillStyle = forLight(0.35); ctx.beginPath(); ctx.ellipse(-22, -2, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  });
  for (const s of [-1, 1]) blit(piece, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = BARK; ctx.beginPath(); ctx.arc(o.x, sy, 3.2, 0, Math.PI * 2); ctx.fill(); forStroke(1);
}

// ---------- Sweeping Arm: a leafy branch or a rope swing turning around a knot ----------
function drawForestSwing(o, sy) {
  const hh = o.hh || 5, [l1, l2] = leafCol(o);
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.ang);
  if (o.look === 'rope') {                         // a rope with a wooden seat at its end
    ctx.strokeStyle = FOR_LINE; ctx.lineWidth = 4.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(o.L - 14, 0); ctx.stroke();
    ctx.strokeStyle = o.forCol || '#c9a66b'; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.strokeStyle = forShade(0.35); ctx.lineWidth = 1; ctx.beginPath(); for (let x = 10; x < o.L - 16; x += 5) { ctx.moveTo(x, -1.3); ctx.lineTo(x + 2.5, 1.3); } ctx.stroke();
    ctx.fillStyle = '#a0703a'; ctx.beginPath(); roundRectPath(o.L - 14, -hh, 14, hh * 2, 2); ctx.fill(); forStroke(1.2);
  } else {                                         // a branch with leaves along it
    ctx.beginPath(); roundRectPath(4, -3, o.L - 4, 6, 3); ctx.fillStyle = BARK; ctx.fill(); forStroke(1.2);
    for (let x = 16, i = 0; x < o.L - 2; x += 11, i++) {
      ctx.fillStyle = i % 2 ? l1 : l2; ctx.beginPath(); ctx.ellipse(x, (i % 2 ? 1 : -1) * 2, 5.5, 3, (i % 2 ? 1 : -1) * 0.5, 0, Math.PI * 2); ctx.fill(); forStroke(0.8);
    }
  }
  ctx.restore();
  ctx.fillStyle = '#8a5a32'; ctx.beginPath(); ctx.arc(o.x, sy, 8.5, 0, Math.PI * 2); ctx.fill(); forStroke(1.5);
  ctx.strokeStyle = 'rgba(60,40,20,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(o.x, sy, 4.5, 0, Math.PI * 2); ctx.stroke();
}

// ---------- Wall Piston: a snake lunging out of a hollow log, or a woodpecker shooting out of its hole ----------
function drawForestLunge(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, col = o.forCol || '#5f9a3a', woody = o.look === 'woodpecker';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    const tip = h + e;
    if (woody) {                                   // black-and-white body stretching out, red head, sharp beak
      ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.rect(h - 8, -5, Math.max(0, e - 6), 10); ctx.fill(); forStroke(1);
      ctx.fillStyle = '#f4f4f0'; for (let x = h - 4; x < tip - 18; x += 8) ctx.fillRect(x, -2, 4, 4);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tip - 10, 0, 5.5, 0, Math.PI * 2); ctx.fill(); forStroke(1.1);
      ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.moveTo(tip - 6, -2.5); ctx.lineTo(tip, 0); ctx.lineTo(tip - 6, 2.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(tip - 10, -2, 1.5, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a wiggling snake with a forked tongue
      const wy = x => Math.sin(x * 0.18 + o.t * 8) * 1.5;
      ctx.lineCap = 'round';
      const body = () => { ctx.beginPath(); for (let x = h - 6; x <= tip - 8; x += 4) (x === h - 6 ? ctx.moveTo(x, wy(x)) : ctx.lineTo(x, wy(x))); };
      body(); ctx.strokeStyle = FOR_LINE; ctx.lineWidth = 9; ctx.stroke();
      body(); ctx.strokeStyle = col; ctx.lineWidth = 6.5; ctx.stroke();
      ctx.fillStyle = '#e8d870'; for (let x = h; x < tip - 14; x += 9) { ctx.beginPath(); ctx.arc(x, wy(x), 1.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(tip - 6, wy(tip - 6), 6.5, 5, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.1);
      ctx.strokeStyle = '#e0303a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tip, 0); ctx.lineTo(tip + 0.5, 0); ctx.stroke();
      ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(tip - 5, wy(tip) - 2, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  // a hollow log (or a piece of trunk with a hole) on the wall
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 6); ctx.fillStyle = woody ? '#7a5030' : '#8a5a32'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = forShade(0.3); ctx.lineWidth = 1.2; ctx.beginPath(); for (const y of [-5, 4]) { ctx.moveTo(-6, y); ctx.lineTo(h, y + 1); } ctx.stroke();
  ctx.fillStyle = o.season === 3 ? '#f4f8fc' : '#6fae4a'; ctx.fillRect(-6, -12, h + 6, 3.5);
  ctx.restore();
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 6); forStroke(1.6);
  ctx.fillStyle = WOOD; ctx.beginPath(); ctx.ellipse(h - 4, 0, 5, 11, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.2);
  ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.ellipse(h - 4, 0, 3, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Wall Turret: a squirrel throwing nuts or a frog spitting water ----------
// the squirrel holds up a nut (or the frog puffs its cheeks) just before each shot
function drawForestThrower(o, sy) {
  const dir = inward(o), col = o.forCol || '#c0703a', frog = o.look === 'frog';
  for (const b of o.blobs) {
    if (frog) {                                    // water drops
      ctx.fillStyle = '#7fc8f0'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(b.x - dir * b.r * 0.8, sy - b.r * 0.5); ctx.lineTo(b.x - dir * b.r * 1.5, sy); ctx.lineTo(b.x - dir * b.r * 0.8, sy + b.r * 0.5); ctx.fill();
      ctx.fillStyle = forLight(0.7); ctx.beginPath(); ctx.arc(b.x - b.r * 0.25, sy - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
    } else {                                       // acorns, spinning as they fly
      ctx.save(); ctx.translate(b.x, sy); ctx.rotate(b.wob * 0.5);
      ctx.fillStyle = '#a0703a'; ctx.beginPath(); ctx.ellipse(0, 1.5, b.r * 0.65, b.r * 0.8, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1);
      ctx.fillStyle = '#7a5030'; ctx.beginPath(); ctx.arc(0, -1, b.r * 0.8, Math.PI, 0); ctx.closePath(); ctx.fill(); forStroke(1);
      ctx.restore();
    }
  }
  const head = sharedSprite('fthrow' + o.look + dir + col, 170, 50, 85, 25, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = '#6b4a2a'; ctx.beginPath(); roundRectPath(-4, 4, 66, 7, 3); ctx.fill(); forStroke(1.2);   // a branch stub to sit on
    if (frog) {                                    // a frog on the branch, wide mouth toward the middle
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(34, -1, 22, 9, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.4);
      for (const x of [28, 42]) { ctx.beginPath(); ctx.arc(x, -8, 4.5, 0, Math.PI * 2); ctx.fill(); forStroke(1.1); ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(x + 0.8, -8, 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = col; }
      ctx.fillStyle = '#e8f0c8'; ctx.beginPath(); ctx.ellipse(36, 3, 14, 4, 0, 0, Math.PI); ctx.fill();
      ctx.strokeStyle = FOR_LINE; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(44, 1); ctx.quadraticCurveTo(52, 2, 56, -1); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(56, -3, 22, 6, 3); ctx.fill(); forStroke(1.1);   // a stretched-out lip as the nozzle
    } else {                                       // a squirrel, its big tail curled up behind it
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(14, 4); ctx.quadraticCurveTo(-2, 2, 2, -8); ctx.quadraticCurveTo(8, -12, 12, -6); ctx.quadraticCurveTo(10, 0, 18, 2); ctx.fill(); forStroke(1.2);   // tail
      ctx.beginPath(); ctx.ellipse(30, -2, 10, 8, 0, 0, Math.PI * 2); ctx.fill(); forStroke(1.3);
      ctx.beginPath(); ctx.arc(44, -4, 6.5, 0, Math.PI * 2); ctx.fill(); forStroke(1.2);
      ctx.beginPath(); ctx.moveTo(41, -9); ctx.lineTo(42, -11); ctx.lineTo(45, -9); ctx.fill();
      ctx.fillStyle = '#efe2c8'; ctx.beginPath(); ctx.ellipse(32, 1, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(46, -5, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(66, -1); ctx.stroke();   // the throwing arm
      ctx.strokeStyle = FOR_LINE; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(70, -1, 3, 0, Math.PI * 2); ctx.stroke();
    }
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    const flick = Math.floor(o.timer * 20) % 2;
    ctx.fillStyle = frog ? (flick ? '#bfe4ff' : '#7fc8f0') : (flick ? '#a0703a' : '#c8904a');
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 74, sy, 4, 0, Math.PI * 2); ctx.fill(); forStroke(1);
  }
}

// ---------- Charged Beam: a sunbeam through the leaves, or a frosty ray from an icy ledge ----------
function drawForestBeam(o, sy) {
  const x0 = ZAP_BODY, L = o.len, col = o.forCol || '#ffe58a', frost = o.look === 'frost', [l1, l2] = leafCol(o);
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save();
    ctx.strokeStyle = frost ? '#7fb8e0' : '#d0a020'; ctx.globalAlpha = 0.3 + 0.6 * Math.min(1, o.t / 0.7); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.restore();
  } else if (o.phase === 'zap') {
    ctx.lineCap = 'round';
    ctx.strokeStyle = col; ctx.globalAlpha = 0.45; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = frost ? '#7fb8e0' : '#d0a020'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, -6); ctx.lineTo(x0 + L, -6); ctx.moveTo(x0, 6); ctx.lineTo(x0 + L, 6); ctx.stroke();
  }
  if (frost) {                                     // an icy ledge with icicles hanging off it
    ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 12, 4); ctx.fillStyle = '#dff2fc'; ctx.fill(); forStroke(1.3);
    ctx.fillStyle = '#bfe8ff'; for (let x = 4; x < x0 - 4; x += 10) { ctx.beginPath(); ctx.moveTo(x - 3, 3); ctx.lineTo(x, 9); ctx.lineTo(x + 3, 3); ctx.fill(); }
    ctx.fillStyle = o.phase === 'rest' ? '#9fc8e0' : '#ffffff'; ctx.beginPath(); ctx.arc(x0 - 6, -3, 4, 0, Math.PI * 2); ctx.fill(); forStroke(1);
  } else {                                         // a clump of leaves with a gap the sunlight comes through
    for (const [x, y, a, c] of [[4, -4, 0.3, l1], [16, 3, -0.4, l2], [28, -5, 0.2, l1], [40, 4, -0.3, l2], [52, -3, 0.4, l1], [62, 3, -0.2, l2]]) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, 9, 5.5, a, 0, Math.PI * 2); ctx.fill(); forStroke(1);
    }
    ctx.fillStyle = o.phase === 'rest' ? '#e0c060' : '#fff6c0'; ctx.beginPath(); ctx.arc(x0 - 6, 0, 4.5, 0, Math.PI * 2); ctx.fill(); forStroke(1);
  }
  ctx.restore();
}

// ---------- Telegraphed Sweep: a bear's paw or a falling branch swiping out after a dashed wedge ----------
function drawForestSweep(o, sy) {
  const col = o.forCol || '#6b4a2a', bear = o.look !== 'fallbranch', [l1, l2] = leafCol(o);
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.ellipse(2, 0, 7, 16, 0, 0, Math.PI * 2); ctx.fill();   // a hollow in the trunk
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = bear ? '#a06a3a' : '#5f9a3a'; ctx.globalAlpha = 0.35 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    if (bear) {                                    // a furry arm and a big paw with claws
      ctx.beginPath(); roundRectPath(-10, -10, len, 20, 10); ctx.fillStyle = col; ctx.fill(); forStroke(1.4);
      ctx.strokeStyle = forShade(0.25); ctx.lineWidth = 1.4; ctx.beginPath(); for (let x = 4; x < len - 26; x += 10) { ctx.moveTo(x, -8); ctx.lineTo(x + 4, -3); } ctx.stroke();
      ctx.translate(len, 0);
      if (o.phase === 'swipe') {
        ctx.fillStyle = '#f4f0e6';
        for (const a of [-0.6, -0.2, 0.2, 0.6]) { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(12, -2); ctx.lineTo(18, 0); ctx.lineTo(12, 2); ctx.closePath(); ctx.fill(); forStroke(0.8); ctx.restore(); }
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); forStroke(1.4);
      ctx.fillStyle = '#3a2a1e'; ctx.beginPath(); ctx.ellipse(-2, 0, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
      for (const a of [-0.9, -0.3, 0.3, 0.9]) { ctx.beginPath(); ctx.arc(Math.cos(a) * 9, Math.sin(a) * 9, 2.6, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a falling branch: a thick limb with a big clump of leaves at the end
      ctx.beginPath(); roundRectPath(-10, -5, len - 4, 10, 5); ctx.fillStyle = BARK; ctx.fill(); forStroke(1.3);
      ctx.translate(len, 0);
      for (const [x, y, c] of [[-6, -8, l1], [6, -7, l2], [-8, 6, l2], [6, 8, l1], [0, 0, l1], [10, 0, l2]]) {
        ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, 8, 6, (x + y) * 0.05, 0, Math.PI * 2); ctx.fill(); forStroke(1);
      }
    }
  }
  ctx.restore();
}

// ---------- Proximity Blast: a puffball (a cloud of spores) or a wasps' nest (a burst of wasps) ----------
function drawForestBlast(o, sy) {
  const wasps = o.look === 'wasps';
  if (o.phase === 'boom' || o.phase === 'gone') {
    const t = o.phase === 'boom' ? o.t : 0.35 + o.t;
    if (t > 0.65) return;
    const r = o.blast * Math.min(1, t / 0.12), fade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.3;
    ctx.save();
    ctx.globalAlpha = 0.35 * fade; ctx.fillStyle = wasps ? '#f0c040' : '#c8a878'; ctx.beginPath(); ctx.arc(o.x, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade; ctx.strokeStyle = wasps ? '#2a1d12' : '#a08060'; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 16; i++) {
      const a = i * 2.4, d = r * (0.3 + 0.6 * ((i * 37) % 10) / 10), x = o.x + Math.cos(a) * d, y = sy + Math.sin(a) * d;
      if (wasps) { ctx.fillStyle = '#ffc21f'; ctx.beginPath(); ctx.ellipse(x, y, 3.2, 2.2, a, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2a1d12'; ctx.fillRect(x - 0.6, y - 2, 1.2, 4); }
      else { ctx.fillStyle = '#8a6a4a'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    return;
  }
  const blink = o.phase === 'blink';
  if (blink) {
    ctx.save();
    ctx.strokeStyle = wasps ? '#c08a10' : '#a08060'; ctx.globalAlpha = 0.35 + 0.5 * Math.min(1, o.t / 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  const swell = blink ? 1 + 0.08 * Math.sin(o.t * 40) : 1;   // it swells and shakes before it pops
  blit(sharedSprite('fblast' + wasps, 40, 40, 20, 20, () => {
    if (wasps) {                                   // a striped paper nest hanging from a twig
      ctx.strokeStyle = BARK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(0, -11); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 1, 11, 13, 0, 0, Math.PI * 2); ctx.fillStyle = '#d8c08a'; ctx.fill(); forStroke(1.4);
      ctx.save(); ctx.clip(); ctx.fillStyle = '#b89a60'; for (let y = -10; y < 14; y += 6) ctx.fillRect(-12, y, 24, 2.5); ctx.restore();
      ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.ellipse(0, 10, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a round puffball on a little stalk
      ctx.fillStyle = '#d8c8a8'; ctx.fillRect(-3, 6, 6, 8);
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fillStyle = '#efe4c8'; ctx.fill(); forStroke(1.4);
      ctx.fillStyle = 'rgba(160,130,90,.45)'; for (const [x, y] of [[-5, -4], [4, -6], [6, 3], [-3, 5], [0, -1]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = forLight(0.6); ctx.beginPath(); ctx.ellipse(-5, -6, 3, 2, -0.5, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, blink ? Math.sin(o.t * 50) * 0.08 : 0, swell, swell);
}

// ---------- Push Zone (before 700 m only): a breeze carrying leaves through the trees; nothing solid ----------
function drawForestBreeze(o, sy) {
  const dir = -o.side, [l1, l2] = leafCol(o);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 6;
    const run = (o.t * 170 + k * 71) % (W + 60);
    const x0 = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + dir * 18, yy - 5, x0 + dir * 36, yy); ctx.stroke();
    ctx.fillStyle = k % 2 ? l1 : l2;                 // a leaf riding the wind
    ctx.save(); ctx.translate(x0 + dir * 46, yy + 2); ctx.rotate(o.t * 6 + k);
    ctx.beginPath(); ctx.ellipse(0, 0, 4.5, 2.4, 0, 0, Math.PI * 2); ctx.fill(); forStroke(0.7);
    ctx.restore();
  }
  ctx.restore();
}

// ---------- Effect Zone: an updraft of rising leaves (or snow in winter and at night) that slows the fall ----------
function drawForestUpdraft(o, sy) {
  const x0 = o.x - o.w / 2, y0 = sy - o.h / 2, snowy = o.season >= 3, [l1, l2] = LEAF_COLS[o.season === 4 ? 1 : snowy ? 3 : o.season];
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x0, y0, o.w, o.h);
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]); ctx.strokeRect(x0, y0, o.w, o.h); ctx.setLineDash([]);
  for (let k = 0; k < 12; k++) {                   // leaves or snowflakes spiralling up
    const ph = (o.t * 0.45 + k / 12) % 1;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5);
    const bx = o.x + Math.sin(k * 2.1 + o.t * 2) * o.w * 0.32, by = y0 + o.h - ph * o.h;
    if (snowy) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bx, by, 1.6 + (k % 3) * 0.7, 0, Math.PI * 2); ctx.fill(); }
    else {
      ctx.fillStyle = k % 2 ? l1 : l2; ctx.save(); ctx.translate(bx, by); ctx.rotate(o.t * 3 + k);
      ctx.beginPath(); ctx.ellipse(0, 0, 4, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  ctx.restore();
}

// ---------- Spring Line: a spider web strand or a stretchy vine between two knots ----------
// the line bounces the plane away; the two knots hurt
function drawForestVine(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, vine = o.look === 'vine';
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9);
  const bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + (vine ? 6 : 0);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2);
  if (vine) {
    ctx.strokeStyle = FOR_LINE; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = o.forCol || '#4f8a3a'; ctx.lineWidth = 3; ctx.stroke();
    const [l1] = leafCol(o);
    for (let i = 1; i < 6; i++) {                  // little leaves along the vine
      const t = i / 6, x = (1 - t) * (1 - t) * o.x1 + 2 * t * (1 - t) * cx + t * t * o.x2;
      const y = (1 - t) * (1 - t) * (sy + dy1) + 2 * t * (1 - t) * cy + t * t * (sy + dy2);
      ctx.fillStyle = l1; ctx.beginPath(); ctx.ellipse(x, y + 4, 4, 2.2, i % 2 ? 0.6 : -0.6, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(120,120,140,.5)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = 'rgba(200,230,255,.9)'; ctx.beginPath(); ctx.arc(cx, cy - 1, 1.6, 0, Math.PI * 2); ctx.fill();   // a dew drop
  }
  ctx.restore();
  const knot = sharedSprite('fknot', 24, 24, 12, 12, () => {
    ctx.fillStyle = '#8a5a32'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); forStroke(1.4);
    ctx.fillStyle = WOOD; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,40,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, Math.PI * 2); ctx.stroke();
  });
  blit(knot, o.x1, sy + dy1); blit(knot, o.x2, sy + dy2);
}
