// Paper Nosedive — Art for the Dungeon map obstacles.
'use strict';

// Dungeon obstacles reuse a Paper obstacle's movement and collision (see DUNGEON_MAKERS) and only change
// the look. Each mechanic has two or three looks (o.look, see DUNGEON_LOOKS) in a few colours (o.dunCol); every
// drawing stays inside the mechanic's collision shape. The walls are dark, so obstacles are light stone, bone,
// wood, metal and magic with a dark outline.
const DUN_LINE = '#1a1410';
function dunStroke(w = 1.6) { ctx.strokeStyle = DUN_LINE; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
const dunShade = (a) => `rgba(0,0,0,${a})`, dunLight = (a) => `rgba(255,255,255,${a})`;
const IRON = '#4a4f58', STEEL = '#d6dbe3', RIVET = '#9aa0a8';

function drawDungeonObstacle(o, sy) {
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawLedge(-10, l, sy, l, -1, o.dunCol, o.look); drawLedge(r, W + 10, sy, r, 1, o.dunCol, o.look);
      break;
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawCrusher(-10, l, sy, l, -1, o.dunCol, o.look); drawCrusher(r, W + 10, sy, r, 1, o.dunCol, o.look);
      break;
    }
    case 'blot': drawSpikeBall(o, sy); break;
    case 'protractor': drawRockOutcrop(o, sy); break;
    case 'pencil': drawPlank(o, sy); break;
    case 'wad': drawSkull(o, sy); break;
    case 'note': drawGhost(o, sy); break;
    case 'cutter': drawSpear(o, sy); break;
    case 'compass': drawFireBar(o, sy); break;
    case 'glue': drawDragonHead(o, sy); break;
    case 'clips': for (const x of clipXs(o)) drawDagger(x, sy, o.v > 0 ? 1 : -1, o.dunCol, o.look); break;
    case 'starfish': drawSawBlade(o, sy); break;
    case 'scissors': drawSwords(o, sy); break;
    case 'zap': drawRuneBeam(o, sy); break;
    case 'paw': drawSkeletonArm(o, sy); break;
    case 'mine': drawCurse(o, sy); break;
    case 'fan': drawDraft(o, sy); break;
    case 'band': drawWeb(o, sy); break;
  }
}

// ---------- Gap Wall: stone ledges, wooden beams or iron girders from each wall, 22 thick ----------
function drawLedge(x0, x1, sy, innerX, outDir, col = '#b9ab8f', look = 'ledge') {
  if (x1 - x0 < 1) return;
  const each = (step, f) => { for (let x = innerX + outDir * step, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * step, i++) f(x, i); };
  ctx.save();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, look === 'girder' ? 2 : 5); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  if (look === 'beam') {                            // a wooden beam with grain and iron brackets
    ctx.strokeStyle = dunShade(0.25); ctx.lineWidth = 1.2; ctx.beginPath();
    for (const y of [-4, 3]) { ctx.moveTo(x0, sy + y); ctx.bezierCurveTo((x0 + x1) / 2, sy + y - 3, (x0 + x1) / 2, sy + y + 3, x1, sy + y); }
    ctx.stroke();
    ctx.fillStyle = dunLight(0.15); ctx.fillRect(x0, sy - 11, x1 - x0, 4);
    ctx.fillStyle = IRON; each(56, x => ctx.fillRect(x - 4, sy - 11, 8, 22));
    ctx.fillStyle = RIVET; each(56, x => { for (const y of [-6, 6]) { ctx.beginPath(); ctx.arc(x, sy + y, 1.6, 0, Math.PI * 2); ctx.fill(); } });
  } else if (look === 'girder') {                   // an iron girder: flanges top and bottom, a row of rivets
    ctx.fillStyle = dunShade(0.3); ctx.fillRect(x0, sy - 11, x1 - x0, 5); ctx.fillRect(x0, sy + 6, x1 - x0, 5);
    ctx.fillStyle = dunLight(0.2); ctx.fillRect(x0, sy - 11, x1 - x0, 1.5);
    ctx.fillStyle = RIVET; each(16, x => { ctx.beginPath(); ctx.arc(x, sy, 1.8, 0, Math.PI * 2); ctx.fill(); });
  } else {                                          // stone blocks with moss along the top
    ctx.fillStyle = dunLight(0.22); ctx.fillRect(x0, sy - 11, x1 - x0, 5);
    ctx.fillStyle = dunShade(0.22); ctx.fillRect(x0, sy + 5, x1 - x0, 6);
    ctx.strokeStyle = dunShade(0.35); ctx.lineWidth = 1.4; ctx.beginPath();
    each(34, x => { ctx.moveTo(x, sy - 11); ctx.lineTo(x, sy + 11); });
    ctx.stroke();
    ctx.fillStyle = '#5f8a3e';
    each(47, (x, i) => { if (i % 2 === 0) { ctx.beginPath(); ctx.ellipse(x, sy - 10, 7, 2.6, 0, 0, Math.PI * 2); ctx.fill(); } });
  }
  ctx.restore();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, look === 'girder' ? 2 : 5); dunStroke(1.6);
  ctx.restore();
}

// ---------- Closing Jaws: spiked stone crushers, spiked iron doors or wooden battering rams, 28 thick ----------
function drawCrusher(x0, x1, sy, innerX, outDir, col = '#9a958c', look = 'crusher') {
  if (x1 - x0 < 1) return;
  const SP = look === 'ram' ? 12 : 9;              // the spikes (or the ram's iron cap) sit inside the hit box
  const bodyEnd = innerX + outDir * SP;            // outDir points from the gap toward the wall
  const bx0 = outDir > 0 ? bodyEnd : x0, bx1 = outDir > 0 ? x1 : bodyEnd;
  ctx.save();
  if (look === 'ram') {                            // a flat iron cap on the end of the log
    ctx.fillStyle = '#5a5f66'; ctx.beginPath(); roundRectPath(Math.min(bodyEnd, innerX), sy - 13, SP, 26, 3); ctx.fill(); dunStroke(1.3);
    ctx.fillStyle = RIVET; for (const y of [-7, 0, 7]) { ctx.beginPath(); ctx.arc((bodyEnd + innerX) / 2, sy + y, 1.6, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.fillStyle = '#c9ced6'; ctx.beginPath();
    for (let k = 0; k < 4; k++) { const y = sy - 14 + 3.5 + k * 7; ctx.moveTo(bodyEnd, y - 3.5); ctx.lineTo(innerX, y); ctx.lineTo(bodyEnd, y + 3.5); }
    ctx.fill(); dunStroke(1.2);
  }
  if (bx1 - bx0 > 0) {
    const r = look === 'ram' ? 12 : 3;
    ctx.beginPath(); roundRectPath(bx0, sy - 14, bx1 - bx0, 28, r); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = dunLight(0.18); ctx.fillRect(bx0, sy - 14, bx1 - bx0, 5);
    ctx.fillStyle = dunShade(0.2); ctx.fillRect(bx0, sy + 8, bx1 - bx0, 6);
    if (look === 'irondoor') {                     // riveted iron plates
      ctx.strokeStyle = dunShade(0.4); ctx.lineWidth = 1.2; ctx.beginPath();
      for (let x = bodyEnd + outDir * 30; outDir > 0 ? x < bx1 : x > bx0; x += outDir * 30) { ctx.moveTo(x, sy - 14); ctx.lineTo(x, sy + 14); }
      ctx.stroke();
      ctx.fillStyle = RIVET;
      for (let x = bodyEnd + outDir * 6; outDir > 0 ? x < bx1 : x > bx0; x += outDir * 15) for (const y of [-9, 9]) { ctx.beginPath(); ctx.arc(x, sy + y, 1.5, 0, Math.PI * 2); ctx.fill(); }
    } else if (look === 'ram') {                   // bark lines and two iron hoops
      ctx.strokeStyle = dunShade(0.25); ctx.lineWidth = 1.2; ctx.beginPath();
      for (const y of [-6, 1, 7]) { ctx.moveTo(bx0, sy + y); ctx.lineTo(bx1, sy + y + 1); }
      ctx.stroke();
      ctx.fillStyle = IRON; for (const k of [18, 60]) ctx.fillRect(bodyEnd + outDir * k - 3, sy - 14, 6, 28);
    } else {                                       // an iron band near the face
      ctx.fillStyle = IRON;
      const band = outDir > 0 ? bodyEnd + 6 : bodyEnd - 14;
      ctx.fillRect(band, sy - 14, 8, 28);
      ctx.fillStyle = RIVET; for (const y of [-8, 0, 8]) { ctx.beginPath(); ctx.arc(band + 4, sy + y, 1.6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    ctx.beginPath(); roundRectPath(bx0, sy - 14, bx1 - bx0, 28, r); dunStroke(1.6);
  }
  ctx.restore();
}

// ---------- Static Hazards: spiked iron balls, bubbling cauldrons or boulders, inside the hit circle ----------
function drawSpikeBall(o, sy) {
  const col = o.dunCol || '#5b6068', R = o.r * 0.88, look = o.look || 'spikeball';
  blit(ownSprite(o, 'spr', R * 2 + 8, R * 2 + 8, R + 4, R + 4, () => {
    if (look === 'cauldron') {                     // a black pot with a bubbling brew
      ctx.beginPath(); ctx.arc(0, R * 0.12, R * 0.86, Math.PI * 0.05, Math.PI * 0.95); ctx.lineTo(-R * 0.86, -R * 0.2);
      ctx.lineTo(R * 0.86, -R * 0.2); ctx.closePath(); ctx.fillStyle = '#2b2a30'; ctx.fill(); dunStroke(1.5);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -R * 0.2, R * 0.8, R * 0.24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dunLight(0.55);
      for (const [x, y, r] of [[-0.3, -0.5, 0.14], [0.15, -0.62, 0.1], [0.35, -0.45, 0.08]]) { ctx.beginPath(); ctx.arc(R * x, R * y, R * r, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#4a4950'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -R * 0.2, R * 0.86, R * 0.27, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = dunLight(0.2); ctx.beginPath(); ctx.ellipse(-R * 0.4, R * 0.2, R * 0.12, R * 0.3, 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'boulder') {               // a round stone with cracks
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = dunLight(0.16); ctx.beginPath(); ctx.arc(-R * 0.3, -R * 0.3, R * 0.75, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dunShade(0.18); ctx.beginPath(); ctx.arc(R * 0.3, R * 0.25, R * 0.25, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = dunShade(0.45); ctx.lineWidth = 1.4; ctx.beginPath();
      ctx.moveTo(-R * 0.2, -R); ctx.lineTo(0, -R * 0.4); ctx.lineTo(-R * 0.25, 0); ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); dunStroke(1.6);
    } else {                                       // a spiked iron ball
      const n = 10;
      ctx.beginPath();
      for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? R * 0.66 : R; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fillStyle = '#c9ced6'; ctx.fill(); dunStroke(1.2);
      ctx.beginPath(); ctx.arc(0, 0, R * 0.68, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); dunStroke(1.5);
      ctx.fillStyle = dunLight(0.35); ctx.beginPath(); ctx.arc(-R * 0.22, -R * 0.22, R * 0.2, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy);
}

// ---------- Wall Bulge: rock outcrops, giant round shields or barrel ends, an exact half-disc ----------
function drawRockOutcrop(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 4, col = o.dunCol || '#8f877a', look = o.look || 'rock';
  const s = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    if (look === 'shield') {                       // painted planks, an iron rim and a boss in the middle
      ctx.strokeStyle = dunShade(0.3); ctx.lineWidth = 1.5; ctx.beginPath();
      for (let x = -o.r; x < o.r; x += o.r / 3) { ctx.moveTo(x, -o.r); ctx.lineTo(x, o.r); }
      ctx.stroke();
      ctx.fillStyle = dunLight(0.12); ctx.beginPath(); ctx.arc(-o.r * 0.3, -o.r * 0.3, o.r * 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5a5f66'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, o.r - 5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = RIVET; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * (o.r - 5), Math.sin(a) * (o.r - 5), 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#9aa0a8'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.22, 0, Math.PI * 2); ctx.fill(); dunStroke(1.4);
      ctx.fillStyle = dunLight(0.5); ctx.beginPath(); ctx.arc(-o.r * 0.07, -o.r * 0.07, o.r * 0.07, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'barrel') {                // the end of a huge barrel: staves and two iron hoops
      ctx.strokeStyle = dunShade(0.3); ctx.lineWidth = 1.5; ctx.beginPath();
      for (let x = -o.r; x < o.r; x += o.r / 4) { ctx.moveTo(x, -o.r); ctx.lineTo(x, o.r); }
      ctx.stroke();
      ctx.strokeStyle = IRON; ctx.lineWidth = 6;
      for (const k of [0.92, 0.62]) { ctx.beginPath(); ctx.arc(0, 0, o.r * k, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#2b2018'; ctx.beginPath(); ctx.arc(0, -o.r * 0.3, o.r * 0.08, 0, Math.PI * 2); ctx.fill();   // bung hole
    } else {                                       // a rock: cracks, chips and moss
      ctx.fillStyle = dunLight(0.15); ctx.beginPath(); ctx.arc(-o.r * 0.25, -o.r * 0.3, o.r * 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dunShade(0.15);
      for (const [a, d, r] of [[0.4, 0.5, 0.16], [1.6, 0.62, 0.12], [2.7, 0.4, 0.14], [4.0, 0.6, 0.1], [5.2, 0.45, 0.13]]) {
        ctx.beginPath(); ctx.arc(Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, o.r * r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = dunShade(0.45); ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(-o.r * 0.1, -o.r * 0.9); ctx.lineTo(o.r * 0.05, -o.r * 0.5); ctx.lineTo(-o.r * 0.12, -o.r * 0.2);
      ctx.moveTo(o.r * 0.3, o.r * 0.2); ctx.lineTo(o.r * 0.5, o.r * 0.45); ctx.lineTo(o.r * 0.42, o.r * 0.75);
      ctx.stroke();
      ctx.fillStyle = '#5f8a3e';
      for (const a of [-2.4, -1.9, -1.2, -0.7]) { ctx.beginPath(); ctx.ellipse(Math.cos(a) * o.r, Math.sin(a) * o.r, 9, 4, a + Math.PI / 2, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); dunStroke(1.8);
  });
  blit(s, cx, sy);
}

// ---------- Bouncing Slider: wooden planks, long bones or wizard staffs, 13 thick ----------
function drawPlank(o, sy) {
  const L = o.len / 2, col = o.dunCol || '#a06a3a', look = o.look || 'plank';
  const s = ownSprite(o, 'spr', o.len + 8, 22, L + 4, 11, () => {
    if (look === 'bone') {                         // a long bone with knobbly ends
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.rect(-L + 7, -4.5, o.len - 14, 9);
      for (const x of [-L + 5, L - 5]) for (const y of [-2.2, 2.2]) { ctx.moveTo(x + 4.3, y); ctx.arc(x, y, 4.3, 0, Math.PI * 2); }
      ctx.fill();
      ctx.beginPath(); ctx.moveTo(-L + 9, -4.5); ctx.lineTo(L - 9, -4.5); ctx.moveTo(-L + 9, 4.5); ctx.lineTo(L - 9, 4.5);
      for (const x of [-L + 5, L - 5]) for (const y of [-2.2, 2.2]) { ctx.moveTo(x + 4.3, y); ctx.arc(x, y, 4.3, 0, Math.PI * 2); }
      dunStroke(1.3);
      ctx.fillStyle = dunLight(0.4); ctx.fillRect(-L + 12, -2.5, o.len - 24, 1.5);
    } else if (look === 'staff') {                 // a wizard's staff with a glowing gem in a claw
      ctx.fillStyle = '#7a5030'; ctx.beginPath(); roundRectPath(-L, -4.5, o.len - 12, 9, 4.5); ctx.fill(); dunStroke(1.2);
      ctx.strokeStyle = dunShade(0.3); ctx.lineWidth = 1; ctx.beginPath();
      for (let x = -L + 14; x < L - 20; x += 14) { ctx.moveTo(x, -4.5); ctx.lineTo(x + 5, 4.5); }
      ctx.stroke();
      ctx.fillStyle = col; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(L - 6.5, 0, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(L - 6.5, 0, 5.5, 0, Math.PI * 2); ctx.fill(); dunStroke(1.1);
      ctx.fillStyle = dunLight(0.7); ctx.beginPath(); ctx.arc(L - 8, -1.5, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e0b84a'; ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.moveTo(L - 13, -3); ctx.lineTo(L - 7, -6.2); ctx.moveTo(L - 13, 3); ctx.lineTo(L - 7, 6.2); ctx.stroke();
    } else {                                       // a plank with grain, iron bands and nails
      ctx.beginPath(); roundRectPath(-L, -6.5, o.len, 13, 2.5); ctx.fillStyle = col; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = dunShade(0.25); ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(-L, -2); ctx.bezierCurveTo(-L * 0.4, -4, L * 0.2, 0, L, -3);
      ctx.moveTo(-L, 2.5); ctx.bezierCurveTo(-L * 0.2, 1, L * 0.3, 4, L, 2);
      ctx.stroke();
      ctx.fillStyle = dunLight(0.18); ctx.fillRect(-L, -6.5, o.len, 2.5);
      ctx.fillStyle = IRON; for (const k of [-0.7, 0.7]) ctx.fillRect(k * L - 4, -6.5, 8, 13);
      ctx.fillStyle = RIVET; for (const k of [-0.7, 0.7]) for (const y of [-3, 3]) { ctx.beginPath(); ctx.arc(k * L, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      ctx.beginPath(); roundRectPath(-L, -6.5, o.len, 13, 2.5); dunStroke(1.5);
    }
  });
  blit(s, o.x, sy, o.a);
}

// ---------- Rising Projectile: grinning skulls, jack-o'-lanterns or slime balls, spinning up the shaft ----------
function drawSkull(o, sy) {
  const col = o.dunCol || '#efe6d0', s = o.r / 16, look = o.look || 'skull';
  blit(sharedSprite(look + col, 36, 36, 18, 18, () => {
    if (look === 'pumpkin') {
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 1.5, 13.5, 12.5, 0, 0, Math.PI * 2); ctx.fill(); dunStroke(1.5);
      ctx.strokeStyle = dunShade(0.25); ctx.lineWidth = 1.2; ctx.beginPath();
      for (const k of [-0.5, 0, 0.5]) { ctx.moveTo(k * 13, -10); ctx.quadraticCurveTo(k * 20, 1.5, k * 13, 13); }
      ctx.stroke();
      ctx.fillStyle = '#4f8a3e'; ctx.fillRect(-1.5, -14, 3, 5);
      ctx.fillStyle = '#ffd23f';                    // a glowing carved face
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 3, -3); ctx.lineTo(d * 8, -3); ctx.lineTo(d * 5.5, -7); ctx.closePath(); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(-8, 3); ctx.lineTo(8, 3); ctx.lineTo(5, 8); ctx.lineTo(2, 6); ctx.lineTo(0, 8.5); ctx.lineTo(-2, 6); ctx.lineTo(-5, 8); ctx.closePath(); ctx.fill();
    } else if (look === 'slime') {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-13, 9);
      ctx.quadraticCurveTo(-15, -12, 0, -13); ctx.quadraticCurveTo(15, -12, 13, 9); ctx.quadraticCurveTo(0, 14, -13, 9); ctx.fill(); dunStroke(1.5);
      ctx.fillStyle = dunLight(0.55); ctx.beginPath(); ctx.ellipse(-6, -7, 3.5, 2, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1410'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 4.5, 0, 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#1a1410'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 3, 3, 0.2, Math.PI - 0.2); ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-13, 2); ctx.arc(0, -1, 13.5, Math.PI * 0.95, Math.PI * 0.05);
      ctx.lineTo(9, 9); ctx.lineTo(6, 13.5); ctx.lineTo(-6, 13.5); ctx.lineTo(-9, 9); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); dunStroke(1.5);
      ctx.fillStyle = '#2a211b';
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 5.5, 0, 3.8, 4.4, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(-2, 7.5); ctx.lineTo(2, 7.5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2a211b'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(-5.5, 10.5); ctx.lineTo(5.5, 10.5);
      for (const x of [-3, 0, 3]) { ctx.moveTo(x, 9.5); ctx.lineTo(x, 13); }
      ctx.stroke();
      ctx.fillStyle = dunLight(0.6); ctx.beginPath(); ctx.ellipse(-6, -9, 3, 1.8, -0.5, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot, s, s);
}

// ---------- Drifting Swarm: ghosts, flying spellbooks or will-o'-wisps, filling a 42-unit square ----------
function drawGhost(o, sy) {
  const col = o.dunCol || '#eef2ff', look = o.look || 'ghost';
  blit(sharedSprite(look + col, 48, 48, 24, 24, () => {
    if (look === 'book') {                         // an open spellbook flapping its covers
      for (const d of [-1, 1]) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(d * 20, 4); ctx.lineTo(d * 20, -16); ctx.lineTo(0, -8); ctx.closePath(); ctx.fill(); dunStroke(1.4);
        ctx.fillStyle = '#f4efe2'; ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(d * 17, 2); ctx.lineTo(d * 17, -14); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill(); dunStroke(1);
        ctx.strokeStyle = 'rgba(80,60,40,.5)'; ctx.lineWidth = 1; ctx.beginPath();
        for (const y of [-8, -4, 0]) { ctx.moveTo(d * 4, y - 1); ctx.lineTo(d * 14, y - 4); }
        ctx.stroke();
      }
      ctx.fillStyle = '#e0b84a'; ctx.beginPath(); ctx.arc(0, 14, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'wisp') {                  // a floating blue-white flame
      const g = ctx.createRadialGradient(0, 2, 2, 0, 2, 20);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, col); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 2, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-10, 6); ctx.quadraticCurveTo(-12, -8, 0, -20); ctx.quadraticCurveTo(12, -8, 10, 6); ctx.quadraticCurveTo(0, 16, -10, 6); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-5, 6); ctx.quadraticCurveTo(-6, -2, 0, -10); ctx.quadraticCurveTo(6, -2, 5, 6); ctx.quadraticCurveTo(0, 11, -5, 6); ctx.fill();
      ctx.fillStyle = '#2a2440'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 2.5, 2, 1.4, 0, Math.PI * 2); ctx.fill(); }
    } else {
      ctx.beginPath();
      ctx.moveTo(-20, 20); ctx.lineTo(-20, -2); ctx.arc(0, -2, 20, Math.PI, 0); ctx.lineTo(20, 20);
      for (let k = 0; k < 4; k++) { const x = 20 - k * 10; ctx.quadraticCurveTo(x - 2.5, 14, x - 5, 18); ctx.quadraticCurveTo(x - 7.5, 22, x - 10, 18); }
      ctx.closePath();
      ctx.globalAlpha = 0.92; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1; dunStroke(1.5);
      ctx.fillStyle = '#2a2440';
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 7, -4, 3, 4.2, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(0, 6, 3.4, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(240,140,170,.55)';
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 13, 2, 3, 2, 0, 0, Math.PI * 2); ctx.fill(); }
    }
  }), o.x, sy, o.rot);
}

// ---------- Wall Piston: a stone block shoots out a spear, a trident or a sword blade, holds, pulls it back ----------
function drawSpear(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, col = o.dunCol || '#8f877a', look = o.look || 'spear';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    const tip = h + e;
    if (look === 'blade') {                        // a long sword blade, tapering to its point
      ctx.fillStyle = STEEL; ctx.beginPath(); ctx.moveTo(h - 8, -4); ctx.lineTo(tip - 10, -4); ctx.lineTo(tip, 0); ctx.lineTo(tip - 10, 4); ctx.lineTo(h - 8, 4); ctx.closePath(); ctx.fill(); dunStroke(1.1);
      ctx.strokeStyle = dunShade(0.22); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(h - 6, 0); ctx.lineTo(tip - 8, 0); ctx.stroke();
    } else {
      const head = Math.min(look === 'trident' ? 16 : 18, e);
      ctx.fillStyle = '#8a5a32'; ctx.beginPath(); ctx.rect(h - 8, -3, Math.max(0, e - head + 8), 6); ctx.fill(); dunStroke(1.1);
      ctx.fillStyle = '#c9ced6';
      if (look === 'trident') {                    // three prongs, the outer two inside the 12-unit hit box
        ctx.beginPath(); ctx.rect(tip - head, -6, 3, 12); ctx.fill(); dunStroke(1);
        for (const y of [-4.5, 0, 4.5]) { ctx.beginPath(); ctx.moveTo(tip - head + 3, y - 1.4); ctx.lineTo(tip - (y ? 3 : 0), y); ctx.lineTo(tip - head + 3, y + 1.4); ctx.closePath(); ctx.fill(); dunStroke(0.9); }
      } else {
        ctx.beginPath(); ctx.moveTo(tip - head, -6); ctx.lineTo(tip, 0); ctx.lineTo(tip - head, 6); ctx.lineTo(tip - head + 3, 0); ctx.closePath(); ctx.fill(); dunStroke(1.1);
      }
    }
  }
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 3); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = dunLight(0.18); ctx.fillRect(-6, -12, h + 6, 5);
  ctx.strokeStyle = dunShade(0.35); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(h * 0.45, -12); ctx.lineTo(h * 0.45, 12); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#1e1813'; ctx.fillRect(h - 4, -4, 4, 8);
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 3); dunStroke(1.6);
  ctx.restore();
}

// ---------- Sweeping Arm: a fire bar (orange, or magic blue, green or purple) or a chain with a spiked ball ----------
const FIRE_COLS = { orange: ['#ff8a2a', '#ffd25a'], blue: ['#3f8fff', '#bfe4ff'], green: ['#3fd16a', '#d6ffb0'], purple: ['#a855f7', '#ead6ff'] };
function drawFireBar(o, sy) {
  const c = Math.cos(o.ang), s = Math.sin(o.ang), r = (o.hh || 7);
  ctx.save();
  if (o.look === 'chain') {                        // iron links, then a spiked ball at the end
    const col = o.dunCol || '#9aa0a8';
    ctx.strokeStyle = col; ctx.lineWidth = 3.6;
    for (let d = 12, i = 0; d <= o.L - 16; d += 10, i++) {
      ctx.save(); ctx.translate(o.x + c * d, sy + s * d); ctx.rotate(o.ang);
      ctx.beginPath(); ctx.ellipse(0, 0, 6.5, i % 2 ? 2.2 : 5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    const bx = o.x + c * (o.L - r), by = sy + s * (o.L - r);
    ctx.fillStyle = '#c9ced6'; ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + o.ang, rr = i % 2 ? r * 0.65 : r; ctx.lineTo(bx + Math.cos(a) * rr, by + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); dunStroke(1);
    ctx.fillStyle = IRON; ctx.beginPath(); ctx.arc(bx, by, r * 0.62, 0, Math.PI * 2); ctx.fill(); dunStroke(1.2);
  } else {
    const [outer, inner] = FIRE_COLS[o.dunCol] || FIRE_COLS.orange, t = performance.now() / 90;
    for (let d = 16; d <= o.L - r + 0.5; d += 13) {
      const x = o.x + c * d, y = sy + s * d, fl = 1 + 0.12 * Math.sin(t + d);
      ctx.globalAlpha = 0.35; ctx.fillStyle = outer; ctx.beginPath(); ctx.arc(x, y, r * 1.25 * fl, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, r * fl, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = '#6f6a62'; ctx.beginPath(); ctx.arc(o.x, sy, 9, 0, Math.PI * 2); ctx.fill(); dunStroke(1.6);
  ctx.fillStyle = '#3a342e'; ctx.beginPath(); ctx.arc(o.x, sy, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Wall Turret: a dragon head spitting fireballs, a gargoyle spitting acid, or a cannon firing balls ----------
// each glows (or smokes) at the mouth just before it fires
function drawDragonHead(o, sy) {
  const dir = inward(o), col = o.dunCol || '#5f8f6a', look = o.look || 'dragon';
  for (const b of o.blobs) {
    if (look === 'cannon') {                       // iron cannonballs
      ctx.fillStyle = '#2b2a30'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.9, 0, Math.PI * 2); ctx.fill(); dunStroke(1.2);
      ctx.fillStyle = dunLight(0.35); ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, sy - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
    } else {
      const acid = look === 'gargoyle', fl = 1 + 0.15 * Math.sin(b.wob);
      ctx.fillStyle = acid ? 'rgba(130,230,80,.3)' : 'rgba(255,120,30,.35)';
      ctx.beginPath(); ctx.ellipse(b.x - dir * b.r * 0.9, sy, b.r * 1.7, b.r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = acid ? '#7fe05a' : '#ff8a2a'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.95 * fl, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = acid ? '#e6ffb0' : '#ffe07a'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  const head = sharedSprite(look + dir + col, 170, 50, 85, 25, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = col;
    if (look === 'cannon') {                       // a barrel on a wall bracket, inside the body and muzzle boxes
      ctx.fillStyle = '#5a3a22'; ctx.beginPath(); roundRectPath(-4, -11, 26, 22, 3); ctx.fill(); dunStroke(1.4);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(14, -9); ctx.lineTo(62, -6); ctx.lineTo(62, 6); ctx.lineTo(14, 9); ctx.closePath(); ctx.fill(); dunStroke(1.5);
      ctx.beginPath(); roundRectPath(60, -4, 18, 8, 2); ctx.fill(); dunStroke(1.3);
      ctx.fillStyle = dunLight(0.2); ctx.fillRect(16, -7, 44, 3);
      ctx.fillStyle = IRON; for (const x of [28, 46]) ctx.fillRect(x, -8, 4, 16);
      ctx.fillStyle = '#120e0b'; ctx.beginPath(); ctx.ellipse(77, 0, 1.5, 3, 0, 0, Math.PI * 2); ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(-4, -11); ctx.lineTo(40, -11); ctx.quadraticCurveTo(52, -10, 60, -5); ctx.lineTo(77, -4);
    ctx.lineTo(77, 4); ctx.lineTo(60, 5); ctx.quadraticCurveTo(52, 10, 40, 11); ctx.lineTo(-4, 11); ctx.closePath();
    ctx.fill(); dunStroke(1.6);
    if (look === 'gargoyle') {                     // a stone gargoyle: two stubby horns, a heavy brow, a grimace
      for (const x of [14, 30]) { ctx.beginPath(); ctx.moveTo(x, -11); ctx.lineTo(x - 4, -17); ctx.lineTo(x + 6, -11); ctx.closePath(); ctx.fill(); dunStroke(1.2); }
      ctx.fillStyle = dunShade(0.3); ctx.fillRect(-4, 4, 46, 7);
      ctx.strokeStyle = dunShade(0.45); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(16, 2); ctx.moveTo(24, -6); ctx.lineTo(28, 1); ctx.stroke();
      ctx.fillStyle = '#4a4540'; ctx.fillRect(36, -9, 14, 3);
      ctx.fillStyle = '#7fe05a'; ctx.beginPath(); ctx.arc(44, -3, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(60, 1); ctx.lineTo(77, 1); ctx.stroke();
      ctx.fillStyle = '#ffffff'; for (const x of [62, 67, 72]) { ctx.beginPath(); ctx.moveTo(x, 1); ctx.lineTo(x + 2, -2); ctx.lineTo(x + 4, 1); ctx.fill(); }
      return;
    }
    ctx.beginPath(); ctx.moveTo(18, -11); ctx.lineTo(8, -20); ctx.lineTo(28, -11); ctx.closePath(); ctx.fill(); dunStroke(1.3);
    ctx.fillStyle = dunShade(0.25); ctx.fillRect(-4, 4, 46, 7);
    ctx.strokeStyle = dunShade(0.4); ctx.lineWidth = 1.2; ctx.beginPath();
    for (const x of [6, 16, 26]) { ctx.moveTo(x, -6); ctx.quadraticCurveTo(x + 4, -2, x, 2); }
    ctx.stroke();
    ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(77, 0); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    for (const x of [64, 70]) { ctx.beginPath(); ctx.moveTo(x, -0.5); ctx.lineTo(x + 2, 2.5); ctx.lineTo(x + 4, -0.5); ctx.fill(); }
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(44, -4, 3.2, 2.4, 0, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
    ctx.fillStyle = '#1a1410'; ctx.fillRect(43.6, -6, 1, 4);
    ctx.beginPath(); ctx.arc(72, -2.5, 1, 0, Math.PI * 2); ctx.fill();
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    const flick = Math.floor(o.timer * 20) % 2;
    ctx.fillStyle = look === 'cannon' ? (flick ? 'rgba(220,220,220,.8)' : 'rgba(160,160,160,.6)') : look === 'gargoyle' ? (flick ? '#7fe05a' : '#e6ffb0') : (flick ? '#ff8a2a' : '#ffe07a');
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 78, sy, 4, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Conveyor: a row of daggers, arrows or old keys crossing the shaft (34 x 12 each, like a clip) ----------
function drawDagger(x, sy, dir, col = '#8a5a32', look = 'daggers') {
  blit(sharedSprite(look + dir + col, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    if (look === 'arrows') {                       // an arrow pointing the way the row moves
      ctx.strokeStyle = '#8a5a32'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(10, 0); ctx.stroke();
      ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.moveTo(8, -5.5); ctx.lineTo(17, 0); ctx.lineTo(8, 5.5); ctx.closePath(); ctx.fill(); dunStroke(1);
      ctx.fillStyle = col; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-17, d * 6); ctx.lineTo(-12, 0); ctx.closePath(); ctx.fill(); }
    } else if (look === 'keys') {                  // an old key: a ring, a shaft and a toothed bit
      ctx.strokeStyle = col; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.arc(-12, 0, 4.3, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = col; ctx.fillRect(-7.5, -2.4, 23, 4.8); ctx.fillRect(8.5, 2.4, 3.5, 3.6); ctx.fillRect(13, 2.4, 3, 2.8);
      ctx.beginPath(); ctx.rect(-7.5, -2.4, 23, 4.8); dunStroke(0.9);
    } else {
      ctx.beginPath(); ctx.moveTo(-2, -3.5); ctx.lineTo(11, -3.5); ctx.lineTo(17, 0); ctx.lineTo(11, 3.5); ctx.lineTo(-2, 3.5); ctx.closePath();
      ctx.fillStyle = STEEL; ctx.fill(); dunStroke(1.2);
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(13, 0); ctx.stroke();
      ctx.fillStyle = '#e0b84a'; ctx.beginPath(); ctx.rect(-5, -6, 3, 12); ctx.fill(); dunStroke(1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.rect(-14, -2.5, 9, 5); ctx.fill(); dunStroke(1);
      ctx.fillStyle = '#e0b84a'; ctx.beginPath(); ctx.arc(-15.5, 0, 2.8, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
    }
  }), x, sy);
}

// ---------- Spinning Drifter: a saw blade, a spiked cart wheel or a rolling eyeball, filling a 20-unit circle ----------
function drawSawBlade(o, sy) {
  const col = o.dunCol || '#c9ced6', look = o.look || 'saw';
  blit(sharedSprite(look + col, 46, 46, 23, 23, () => {
    if (look === 'wheel') {                        // a wooden wheel with iron spikes round the rim
      ctx.fillStyle = '#c9ced6'; ctx.beginPath();
      for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, rr = i % 2 ? 15 : 20; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill(); dunStroke(1);
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); } ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 15.5, 0, Math.PI * 2); ctx.arc(0, 0, 10.5, 0, Math.PI * 2, true); dunStroke(1.1);
      ctx.fillStyle = IRON; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
    } else if (look === 'eyeball') {               // a big rolling eyeball with red veins
      ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.arc(0, 0, 19.5, 0, Math.PI * 2); ctx.fill(); dunStroke(1.5);
      ctx.strokeStyle = 'rgba(200,50,50,.6)'; ctx.lineWidth = 1; ctx.beginPath();
      for (const a of [2.2, 3.4, 4.6, 5.6]) { ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); ctx.quadraticCurveTo(Math.cos(a + 0.3) * 13, Math.sin(a + 0.3) * 13, Math.cos(a) * 10, Math.sin(a) * 10); }
      ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(5, -2, 8, 0, Math.PI * 2); ctx.fill(); dunStroke(1.1);
      ctx.fillStyle = '#120e0b'; ctx.beginPath(); ctx.arc(6, -2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(3.5, -4.5, 1.8, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a toothed saw blade
      const n = 14;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2, b = (i + 0.7) / n * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * 16.5, Math.sin(a) * 16.5); ctx.lineTo(Math.cos(b) * 20, Math.sin(b) * 20);
      }
      ctx.closePath(); ctx.fillStyle = col; ctx.fill(); dunStroke(1.4);
      ctx.strokeStyle = dunShade(0.3); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = dunShade(0.45);
      for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = IRON; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
      ctx.fillStyle = dunLight(0.45); ctx.beginPath(); ctx.ellipse(-7, -8, 4, 2, -0.7, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot);
}

// ---------- Spinning Blades: two crossed swords, spears or wizard staffs, spinning and scissoring ----------
// each blade matches a scissor blade's hit box and each pommel (butt, gem) its handle circle
function drawSwords(o, sy) {
  const col = o.dunCol || '#e0b84a', look = o.look || 'swords';
  const piece = sharedSprite(look + col, 106, 26, 34, 13, () => {
    if (look === 'spears') {
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-22, -3.5, 82, 7, 3.5); ctx.fill(); dunStroke(1.1);
      ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.moveTo(52, -4); ctx.lineTo(66, 0); ctx.lineTo(52, 4); ctx.closePath(); ctx.fill(); dunStroke(1.1);
      ctx.fillStyle = IRON; ctx.beginPath(); ctx.arc(-22, 0, 5, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
    } else if (look === 'staves') {
      ctx.fillStyle = '#7a5030'; ctx.beginPath(); roundRectPath(-16, -3.5, 78, 7, 3.5); ctx.fill(); dunStroke(1.1);
      ctx.strokeStyle = '#7a5030'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(62, -3, 4, Math.PI * 0.5, Math.PI * 2); ctx.stroke();   // curled top
      ctx.fillStyle = col; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(-22, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(-22, 0, 6, 0, Math.PI * 2); ctx.fill(); dunStroke(1.1);
      ctx.fillStyle = dunLight(0.7); ctx.beginPath(); ctx.arc(-24, -2, 1.6, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(-6, -3.5); ctx.lineTo(58, -3.5); ctx.lineTo(66, 0); ctx.lineTo(58, 3.5); ctx.lineTo(-6, 3.5); ctx.closePath();
      ctx.fillStyle = '#e1e5ea'; ctx.fill(); dunStroke(1.3);
      ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(60, 0); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.rect(-9, -7, 4, 14); ctx.fill(); dunStroke(1.1);
      ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.rect(-18, -2.5, 9, 5); ctx.fill(); dunStroke(1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-22, 0, 6, 0, Math.PI * 2); ctx.fill(); dunStroke(1.2);
    }
  });
  for (const s of [-1, 1]) blit(piece, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = IRON; ctx.beginPath(); ctx.arc(o.x, sy, 3.2, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
}

// ---------- Charged Beam: a rune stone or a crystal cluster on the wall; it glows, a dashed line warns, then a beam fires ----------
function drawRuneBeam(o, sy) {
  const x0 = ZAP_BODY, L = o.len, col = o.dunCol || '#b77cf0', lit = o.phase !== 'rest';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.3 + 0.6 * Math.min(1, o.t / 0.7); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.restore();
  } else if (o.phase === 'zap') {
    ctx.lineCap = 'round';
    ctx.strokeStyle = col; ctx.globalAlpha = 0.35; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.stroke();
  }
  if (o.look === 'crystal') {                      // crystals growing along the wall, the last one pointing out
    ctx.fillStyle = '#5a5560'; ctx.beginPath(); roundRectPath(-6, 2, x0 - 4, 7, 3); ctx.fill(); dunStroke(1.2);
    for (const [x, h, w] of [[8, 11, 6], [22, 14, 7], [38, 12, 6], [52, 16, 8]]) {
      ctx.fillStyle = lit ? col : 'rgba(150,140,170,.85)';
      ctx.beginPath(); ctx.moveTo(x - w / 2, 4); ctx.lineTo(x - w / 2, 4 - h + 4); ctx.lineTo(x, 4 - h); ctx.lineTo(x + w / 2, 4 - h + 4); ctx.lineTo(x + w / 2, 4); ctx.closePath(); ctx.fill(); dunStroke(1);
    }
    ctx.fillStyle = lit ? col : 'rgba(150,140,170,.85)';
    ctx.beginPath(); ctx.moveTo(x0 - 14, -6); ctx.lineTo(x0 - 2, -3); ctx.lineTo(x0 + 2, 0); ctx.lineTo(x0 - 2, 3); ctx.lineTo(x0 - 14, 6); ctx.closePath(); ctx.fill(); dunStroke(1.2);
    ctx.fillStyle = dunLight(0.55); ctx.fillRect(x0 - 12, -3, 8, 1.6);
    ctx.restore();
    return;
  }
  ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 3); ctx.fillStyle = '#8f877a'; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = dunLight(0.18); ctx.fillRect(-6, -9, x0 + 2, 4); ctx.restore();
  ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 3); dunStroke(1.5);
  ctx.strokeStyle = lit ? col : 'rgba(40,30,50,.6)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(12, -5); ctx.lineTo(12, 5); ctx.moveTo(12, -5); ctx.lineTo(17, 0);
  ctx.moveTo(26, -5); ctx.lineTo(31, 5); ctx.moveTo(31, -5); ctx.lineTo(26, 5);
  ctx.moveTo(42, 5); ctx.lineTo(45, -5); ctx.lineTo(48, 5);
  ctx.stroke();
  ctx.fillStyle = lit ? col : '#3a2a40'; ctx.beginPath(); ctx.arc(x0 - 7, 0, 5, 0, Math.PI * 2); ctx.fill(); dunStroke(1.1);
  ctx.restore();
}

// ---------- Telegraphed Sweep: a skeleton arm, a tentacle or a thorny vine swiping out of a crack after a dashed wedge ----------
function drawSkeletonArm(o, sy) {
  const col = o.dunCol || '#efe6d0', look = o.look || 'skeleton';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#120e0b'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(7, -6); ctx.lineTo(3, 0); ctx.lineTo(8, 8); ctx.lineTo(0, 16); ctx.closePath(); ctx.fill();
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = look === 'skeleton' ? 'rgba(240,228,200,1)' : col; ctx.globalAlpha = 0.3 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    ctx.lineCap = 'round';
    if (look === 'tentacle') {                     // a thick wavy tentacle with suckers, tapering to a curled tip
      const wy = x => Math.sin(x * 0.06 + o.t * 6) * 3;
      const path = () => { ctx.beginPath(); for (let x = -10; x <= len - 10; x += 6) (x === -10 ? ctx.moveTo(x, wy(x)) : ctx.lineTo(x, wy(x))); };
      path(); ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 20; ctx.stroke();
      path(); ctx.strokeStyle = col; ctx.lineWidth = 17; ctx.stroke();
      ctx.fillStyle = 'rgba(255,220,230,.7)';
      for (let x = 4; x < len - 20; x += 12) { ctx.beginPath(); ctx.arc(x, wy(x) + 4, 2.4, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(len - 4, wy(len - 4), 14, 0, Math.PI * 2); ctx.fill(); dunStroke(1.5);
      ctx.strokeStyle = 'rgba(255,220,230,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(len - 4, wy(len - 4), 6, 0, Math.PI * 1.5); ctx.stroke();
    } else if (look === 'vine') {                  // a thorny vine ending in a snapping flower
      ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(len - 12, 0); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.stroke();
      ctx.fillStyle = '#e8e0c8';
      for (let x = 6, i = 0; x < len - 24; x += 14, i++) { const s = i % 2 ? 1 : -1; ctx.beginPath(); ctx.moveTo(x - 3, s * 5); ctx.lineTo(x, s * 10); ctx.lineTo(x + 3, s * 5); ctx.closePath(); ctx.fill(); }
      ctx.translate(len, 0);
      ctx.fillStyle = '#c0392b';
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 9, Math.sin(a) * 9, 7, 4.5, a, 0, Math.PI * 2); ctx.fill(); dunStroke(1); }
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); dunStroke(1.1);
      ctx.fillStyle = '#ffffff'; for (const a of [0.6, 2.2, 3.8, 5.2]) { ctx.beginPath(); ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6); ctx.lineTo(Math.cos(a) * 2, Math.sin(a) * 2); ctx.lineTo(Math.cos(a + 0.4) * 6, Math.sin(a + 0.4) * 6); ctx.fill(); }
    } else {                                       // two forearm bones and a bony hand
      for (const y of [-5.5, 5.5]) {
        ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(len - 12, y * 0.7); ctx.stroke();
        ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.stroke();
      }
      ctx.fillStyle = col;
      for (const [x, y] of [[-8, -6.5], [-8, 6.5], [len - 14, -4.5], [len - 14, 4.5]]) { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); dunStroke(1.2); }
      ctx.translate(len, 0);
      ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 5.5;
      const fingers = () => { ctx.beginPath(); for (const a of [-0.75, -0.25, 0.25, 0.75]) { ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); } ctx.moveTo(-2, 0); ctx.lineTo(4, -14); ctx.stroke(); };
      fingers(); ctx.strokeStyle = col; ctx.lineWidth = 3; fingers();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-1, 0, 7.5, 0, Math.PI * 2); ctx.fill(); dunStroke(1.3);
    }
  }
  ctx.restore();
}

// ---------- Proximity Blast: a cursed rune stone or a glowing spore mushroom; flickers near the plane, then bursts ----------
function drawCurse(o, sy) {
  const col = o.dunCol || '#b77cf0', look = o.look || 'curse';
  if (o.phase === 'boom' || o.phase === 'gone') {
    const t = o.phase === 'boom' ? o.t : 0.35 + o.t;
    if (t > 0.65) return;
    const r = o.blast * Math.min(1, t / 0.12), fade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.3;
    ctx.save();
    ctx.globalAlpha = 0.4 * fade; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(o.x, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke();
    if (look === 'mushroom') {                     // a puff of spores rather than a ring of magic
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 14; i++) { const a = i * 2.4, d = r * (0.3 + 0.6 * ((i * 37) % 10) / 10); ctx.beginPath(); ctx.arc(o.x + Math.cos(a) * d, sy + Math.sin(a) * d, 2, 0, Math.PI * 2); ctx.fill(); }
    } else {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(o.x, sy, r * 0.75, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    return;
  }
  if (o.phase === 'blink') {
    ctx.save();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.35 + 0.5 * Math.min(1, o.t / 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  const on = o.phase === 'blink' ? Math.floor(o.t * 12) % 2 === 0 : true;
  if (look === 'mushroom') {                       // a fat glowing cap on a short stem, inside the 16-unit circle
    ctx.save();
    ctx.globalAlpha = o.phase === 'blink' ? (on ? 0.6 : 0.2) : 0.25 + 0.15 * Math.sin(o.t * 3);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(o.x, sy, 16, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#e8e0d0'; ctx.beginPath(); roundRectPath(o.x - 4, sy - 2, 8, 14, 3); ctx.fill(); dunStroke(1.1);
    ctx.fillStyle = on ? col : '#ffffff'; ctx.beginPath(); ctx.ellipse(o.x, sy - 2, 14, 10, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); dunStroke(1.3);
    ctx.fillStyle = dunLight(0.8); for (const [x, y, r] of [[-6, -6, 2.2], [3, -9, 1.8], [7, -4, 1.6]]) { ctx.beginPath(); ctx.arc(o.x + x, sy + y, r, 0, Math.PI * 2); ctx.fill(); }
    return;
  }
  blit(sharedSprite('curseStone', 36, 36, 18, 18, () => {
    ctx.fillStyle = '#5a5560'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); dunStroke(1.6);
    ctx.fillStyle = dunLight(0.15); ctx.beginPath(); ctx.arc(-4, -4, 8, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy);
  ctx.save();
  ctx.globalAlpha = o.phase === 'blink' ? 1 : 0.55 + 0.35 * Math.sin(o.t * 3);
  ctx.strokeStyle = on ? col : '#ffffff'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(o.x - 10, sy); ctx.quadraticCurveTo(o.x, sy - 9, o.x + 10, sy); ctx.quadraticCurveTo(o.x, sy + 9, o.x - 10, sy);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(o.x, sy, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Push Zone (before 700 m only): a cold draft from a frosted crack, or hot steam from a grate; nothing solid ----------
function drawDraft(o, sy) {
  const cx = o.side < 0 ? 0 : W, dir = -o.side, steam = o.look === 'steam';
  ctx.save();
  ctx.strokeStyle = steam ? 'rgba(255,240,225,.55)' : 'rgba(205,235,255,.6)'; ctx.fillStyle = steam ? 'rgba(255,245,235,.35)' : 'rgba(230,245,255,.8)';
  ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 6;
    const run = (o.t * 170 + k * 71) % (W + 60);
    const x0 = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + dir * 18, yy - 5, x0 + dir * 36, yy); ctx.stroke();
    ctx.beginPath(); ctx.arc(x0 + dir * 46, yy + 3, steam ? 5 : 1.6, 0, Math.PI * 2); ctx.fill();   // a puff of steam or a snowflake
  }
  ctx.translate(cx, sy); ctx.scale(dir, 1);
  if (steam) {                                     // an iron grate in the wall
    ctx.fillStyle = '#2b2a30'; ctx.beginPath(); roundRectPath(-4, -26, 14, 52, 3); ctx.fill(); dunStroke(1.4);
    ctx.fillStyle = '#5a5f66'; for (let y = -20; y <= 18; y += 9.5) ctx.fillRect(-4, y, 14, 3);
  } else {
    ctx.fillStyle = '#120e0b'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(9, -14); ctx.lineTo(4, -2); ctx.lineTo(11, 12); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(220,240,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(9, -14); ctx.lineTo(4, -2); ctx.lineTo(11, 12); ctx.lineTo(0, 30); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Spring Line: a spider web strand between two spiders, or a slime strand between two slimes ----------
// the strand bounces the plane away; the two anchors hurt
function drawWeb(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, slime = o.look === 'slime', col = o.dunCol || '#5fd16a';
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9);
  const bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend;
  ctx.save();
  ctx.lineCap = 'round';
  if (slime) {
    ctx.strokeStyle = col; ctx.globalAlpha = 0.85; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy + 4, o.x2, sy + dy2); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(cx, cy + 6, 2.5, 4, 0, 0, Math.PI * 2); ctx.fill();   // a drip
  } else {
    ctx.strokeStyle = 'rgba(245,245,255,.9)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); ctx.stroke();
    ctx.strokeStyle = 'rgba(245,245,255,.45)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy + 6, o.x2, sy + dy2); ctx.stroke();
  }
  ctx.restore();
  const anchor = slime
    ? sharedSprite('slimeBlob' + col, 24, 24, 12, 12, () => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-8.5, 5); ctx.quadraticCurveTo(-9, -8, 0, -8.5); ctx.quadraticCurveTo(9, -8, 8.5, 5); ctx.quadraticCurveTo(0, 9, -8.5, 5); ctx.fill(); dunStroke(1.2);
        ctx.fillStyle = '#1a1410'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 3, -1, 1.5, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = dunLight(0.6); ctx.beginPath(); ctx.arc(-4, -5, 1.6, 0, Math.PI * 2); ctx.fill();
      })
    : sharedSprite('spider', 24, 24, 12, 12, () => {
        ctx.strokeStyle = '#1a1410'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
        for (const s of [-1, 1]) for (const a of [-0.9, -0.3, 0.3, 0.9]) { ctx.moveTo(0, 0); ctx.lineTo(s * Math.cos(a) * 9, Math.sin(a) * 9); }
        ctx.stroke();
        ctx.fillStyle = '#2b2430'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); dunStroke(1.2);
        ctx.fillStyle = '#ff4a3a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 2.2, -2, 1.2, 0, Math.PI * 2); ctx.fill(); }
      });
  blit(anchor, o.x1, sy + dy1); blit(anchor, o.x2, sy + dy2);
}
