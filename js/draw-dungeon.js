// Paper Nosedive — Art for the Dungeon map obstacles.
'use strict';

// Dungeon obstacles reuse a Paper obstacle's movement and collision (see DUNGEON_MAKERS) and only change
// the look. Each drawing stays inside its collision shape. The walls are dark, so obstacles are light stone,
// bone, wood and fire with a dark outline.
const DUN_LINE = '#1a1410';
function dunStroke(w = 1.6) { ctx.strokeStyle = DUN_LINE; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
const dunShade = (a) => `rgba(0,0,0,${a})`, dunLight = (a) => `rgba(255,255,255,${a})`;

function drawDungeonObstacle(o, sy) {
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawLedge(-10, l, sy, l, -1, o.dunCol); drawLedge(r, W + 10, sy, r, 1, o.dunCol);
      break;
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawCrusher(-10, l, sy, l, -1, o.dunCol); drawCrusher(r, W + 10, sy, r, 1, o.dunCol);
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
    case 'clips': for (const x of clipXs(o)) drawDagger(x, sy, o.v > 0 ? 1 : -1, o.dunCol); break;
    case 'starfish': drawSawBlade(o, sy); break;
    case 'scissors': drawSwords(o, sy); break;
    case 'zap': drawRuneBeam(o, sy); break;
    case 'paw': drawSkeletonArm(o, sy); break;
    case 'mine': drawCurse(o, sy); break;
    case 'fan': drawDraft(o, sy); break;
    case 'band': drawWeb(o, sy); break;
  }
}

// stone ledges (Gap Wall): a slab of blocks from each wall, 22 units thick, with a rounded end at the gap
function drawLedge(x0, x1, sy, innerX, outDir, col = '#b9ab8f') {
  if (x1 - x0 < 1) return;
  ctx.save();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 5); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = dunLight(0.22); ctx.fillRect(x0, sy - 11, x1 - x0, 5);              // lit top edge
  ctx.fillStyle = dunShade(0.22); ctx.fillRect(x0, sy + 5, x1 - x0, 6);               // shadowed underside
  ctx.strokeStyle = dunShade(0.35); ctx.lineWidth = 1.4; ctx.beginPath();              // joints between the blocks
  for (let x = innerX + outDir * 34; outDir > 0 ? x < x1 : x > x0; x += outDir * 34) { ctx.moveTo(x, sy - 11); ctx.lineTo(x, sy + 11); }
  ctx.stroke();
  ctx.fillStyle = '#5f8a3e';                                                          // moss tufts along the top
  for (let x = innerX + outDir * 20, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * 47, i++) {
    if (i % 2) continue;
    ctx.beginPath(); ctx.ellipse(x, sy - 10, 7, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 5); dunStroke(1.6);
  ctx.restore();
}

// spiked crusher blocks (Closing Jaws): iron-banded stone slabs, 28 thick, with spikes on the closing face
function drawCrusher(x0, x1, sy, innerX, outDir, col = '#9a958c') {
  if (x1 - x0 < 1) return;
  const SP = 9;                                    // the spikes sit inside the slab's hit box
  const bodyEnd = innerX - outDir * SP;
  const bx0 = outDir > 0 ? bodyEnd : x0, bx1 = outDir > 0 ? x1 : bodyEnd;
  ctx.save();
  ctx.fillStyle = '#c9ced6';
  ctx.beginPath();
  for (let k = 0; k < 4; k++) {
    const y = sy - 14 + 3.5 + k * 7;
    ctx.moveTo(bodyEnd, y - 3.5); ctx.lineTo(innerX, y); ctx.lineTo(bodyEnd, y + 3.5);
  }
  ctx.fill(); dunStroke(1.2);
  if (bx1 - bx0 > 0) {
    ctx.beginPath(); roundRectPath(bx0, sy - 14, bx1 - bx0, 28, 3); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = dunLight(0.18); ctx.fillRect(bx0, sy - 14, bx1 - bx0, 5);
    ctx.fillStyle = dunShade(0.2); ctx.fillRect(bx0, sy + 8, bx1 - bx0, 6);
    ctx.fillStyle = '#4a4f58';                                                        // iron band near the face
    const band = outDir > 0 ? bodyEnd + 6 : bodyEnd - 14;
    ctx.fillRect(band, sy - 14, 8, 28);
    ctx.fillStyle = '#9aa0a8'; for (const y of [-8, 0, 8]) { ctx.beginPath(); ctx.arc(band + 4, sy + y, 1.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); roundRectPath(bx0, sy - 14, bx1 - bx0, 28, 3); dunStroke(1.6);
  }
  ctx.restore();
}

// a spiked iron ball (Static Hazards): the body and spikes stay inside the hit circle
function drawSpikeBall(o, sy) {
  const col = o.dunCol || '#5b6068', R = o.r * 0.88;
  blit(ownSprite(o, 'spr', R * 2 + 8, R * 2 + 8, R + 4, R + 4, () => {
    const n = 10;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? R * 0.66 : R;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fillStyle = '#c9ced6'; ctx.fill(); dunStroke(1.2);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.68, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); dunStroke(1.5);
    ctx.fillStyle = dunLight(0.35); ctx.beginPath(); ctx.arc(-R * 0.22, -R * 0.22, R * 0.2, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy);
}

// a rock outcrop bulging from the wall (Wall Bulge): an exact half-disc with cracks, chips and moss
function drawRockOutcrop(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 4, col = o.dunCol || '#8f877a';
  const s = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = dunLight(0.15); ctx.beginPath(); ctx.arc(-o.r * 0.25, -o.r * 0.3, o.r * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dunShade(0.15);
    for (const [a, d, r] of [[0.4, 0.5, 0.16], [1.6, 0.62, 0.12], [2.7, 0.4, 0.14], [4.0, 0.6, 0.1], [5.2, 0.45, 0.13]]) {
      ctx.beginPath(); ctx.arc(Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, o.r * r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = dunShade(0.45); ctx.lineWidth = 1.5; ctx.beginPath();             // cracks
    ctx.moveTo(-o.r * 0.1, -o.r * 0.9); ctx.lineTo(o.r * 0.05, -o.r * 0.5); ctx.lineTo(-o.r * 0.12, -o.r * 0.2);
    ctx.moveTo(o.r * 0.3, o.r * 0.2); ctx.lineTo(o.r * 0.5, o.r * 0.45); ctx.lineTo(o.r * 0.42, o.r * 0.75);
    ctx.stroke();
    ctx.fillStyle = '#5f8a3e';                                                        // moss on the upper rim
    for (const a of [-2.4, -1.9, -1.2, -0.7]) { ctx.beginPath(); ctx.ellipse(Math.cos(a) * o.r, Math.sin(a) * o.r, 9, 4, a + Math.PI / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); dunStroke(1.8);
  });
  blit(s, cx, sy);
}

// a wooden plank sliding side to side (Bouncing Slider): 13 thick, with grain, iron bands and nails
function drawPlank(o, sy) {
  const L = o.len / 2, col = o.dunCol || '#a06a3a';
  const s = ownSprite(o, 'spr', o.len + 8, 22, L + 4, 11, () => {
    ctx.beginPath(); roundRectPath(-L, -6.5, o.len, 13, 2.5); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = dunShade(0.25); ctx.lineWidth = 1; ctx.beginPath();               // wood grain
    ctx.moveTo(-L, -2); ctx.bezierCurveTo(-L * 0.4, -4, L * 0.2, 0, L, -3);
    ctx.moveTo(-L, 2.5); ctx.bezierCurveTo(-L * 0.2, 1, L * 0.3, 4, L, 2);
    ctx.stroke();
    ctx.fillStyle = dunLight(0.18); ctx.fillRect(-L, -6.5, o.len, 2.5);
    ctx.fillStyle = '#4a4f58';
    for (const k of [-0.7, 0.7]) { ctx.fillRect(k * L - 4, -6.5, 8, 13); }
    ctx.fillStyle = '#9aa0a8';
    for (const k of [-0.7, 0.7]) for (const y of [-3, 3]) { ctx.beginPath(); ctx.arc(k * L, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); roundRectPath(-L, -6.5, o.len, 13, 2.5); dunStroke(1.5);
  });
  blit(s, o.x, sy, o.a);
}

// a grinning skull thrown up the shaft (Rising Projectile), spinning as it bounces off the walls
function drawSkull(o, sy) {
  const col = o.dunCol || '#efe6d0', s = o.r / 16;
  blit(sharedSprite('skull' + col, 36, 36, 18, 18, () => {
    ctx.beginPath();
    ctx.moveTo(-13, 2); ctx.arc(0, -1, 13.5, Math.PI * 0.95, Math.PI * 0.05);         // cranium
    ctx.lineTo(9, 9); ctx.lineTo(6, 13.5); ctx.lineTo(-6, 13.5); ctx.lineTo(-9, 9); ctx.closePath();   // jaw
    ctx.fillStyle = col; ctx.fill(); dunStroke(1.5);
    ctx.fillStyle = '#2a211b';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 5.5, 0, 3.8, 4.4, 0, 0, Math.PI * 2); ctx.fill(); }   // eye sockets
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(-2, 7.5); ctx.lineTo(2, 7.5); ctx.closePath(); ctx.fill();          // nose
    ctx.strokeStyle = '#2a211b'; ctx.lineWidth = 1; ctx.beginPath();                    // teeth
    ctx.moveTo(-5.5, 10.5); ctx.lineTo(5.5, 10.5);
    for (const x of [-3, 0, 3]) { ctx.moveTo(x, 9.5); ctx.lineTo(x, 13); }
    ctx.stroke();
    ctx.fillStyle = dunLight(0.6); ctx.beginPath(); ctx.ellipse(-6, -9, 3, 1.8, -0.5, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy, o.rot, s, s);
}

// a little ghost drifting down and swaying (Drifting Swarm): fills the 42-unit square it collides as
function drawGhost(o, sy) {
  const col = o.dunCol || '#eef2ff';
  blit(sharedSprite('ghost' + col, 48, 48, 24, 24, () => {
    ctx.beginPath();
    ctx.moveTo(-20, 20); ctx.lineTo(-20, -2); ctx.arc(0, -2, 20, Math.PI, 0); ctx.lineTo(20, 20);
    for (let k = 0; k < 4; k++) { const x = 20 - k * 10; ctx.quadraticCurveTo(x - 2.5, 14, x - 5, 18); ctx.quadraticCurveTo(x - 7.5, 22, x - 10, 18); }
    ctx.closePath();
    ctx.globalAlpha = 0.92; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1; dunStroke(1.5);
    ctx.fillStyle = '#2a2440';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 7, -4, 3, 4.2, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(0, 6, 3.4, 4, 0, 0, Math.PI * 2); ctx.fill();          // "ooo" mouth
    ctx.fillStyle = 'rgba(240,140,170,.55)';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 13, 2, 3, 2, 0, 0, Math.PI * 2); ctx.fill(); }
  }), o.x, sy, o.rot);
}

// a spear trap (Wall Piston): a stone block in the wall shoots out a spear, holds, then pulls it back
function drawSpear(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, col = o.dunCol || '#8f877a';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    const tip = h + e, head = Math.min(18, e);
    ctx.fillStyle = '#8a5a32'; ctx.beginPath(); ctx.rect(h - 8, -3, Math.max(0, e - head + 8), 6); ctx.fill(); dunStroke(1.1);
    ctx.fillStyle = '#c9ced6';                                                        // the spearhead ends at the tip
    ctx.beginPath(); ctx.moveTo(tip - head, -6); ctx.lineTo(tip, 0); ctx.lineTo(tip - head, 6); ctx.lineTo(tip - head + 3, 0); ctx.closePath(); ctx.fill(); dunStroke(1.1);
  }
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 3); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = dunLight(0.18); ctx.fillRect(-6, -12, h + 6, 5);
  ctx.strokeStyle = dunShade(0.35); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(h * 0.45, -12); ctx.lineTo(h * 0.45, 12); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#1e1813'; ctx.fillRect(h - 4, -4, 4, 8);                            // the slot the spear comes out of
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 3); dunStroke(1.6);
  ctx.restore();
}

// a fire bar (Sweeping Arm): a chain of fireballs turning round a stone pivot; fire may be magic blue or green
const FIRE_COLS = { orange: ['#ff8a2a', '#ffd25a'], blue: ['#3f8fff', '#bfe4ff'], green: ['#3fd16a', '#d6ffb0'] };
function drawFireBar(o, sy) {
  const [outer, inner] = FIRE_COLS[o.dunCol] || FIRE_COLS.orange, c = Math.cos(o.ang), s = Math.sin(o.ang);
  const t = performance.now() / 90, r = (o.hh || 7);
  ctx.save();
  for (let d = 16; d <= o.L - r + 0.5; d += 13) {
    const x = o.x + c * d, y = sy + s * d, fl = 1 + 0.12 * Math.sin(t + d);
    ctx.globalAlpha = 0.35; ctx.fillStyle = outer; ctx.beginPath(); ctx.arc(x, y, r * 1.25 * fl, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, r * fl, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#6f6a62'; ctx.beginPath(); ctx.arc(o.x, sy, 9, 0, Math.PI * 2); ctx.fill(); dunStroke(1.6);
  ctx.fillStyle = '#3a342e'; ctx.beginPath(); ctx.arc(o.x, sy, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// a dragon-head statue on the wall spitting fireballs across (Wall Turret); its mouth glows before each shot
function drawDragonHead(o, sy) {
  const dir = inward(o), col = o.dunCol || '#5f8f6a';
  for (const b of o.blobs) {                       // fireballs with a short flame tail
    const fl = 1 + 0.15 * Math.sin(b.wob);
    ctx.fillStyle = 'rgba(255,120,30,.35)';
    ctx.beginPath(); ctx.ellipse(b.x - dir * b.r * 0.9, sy, b.r * 1.7, b.r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.95 * fl, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe07a'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.5, 0, Math.PI * 2); ctx.fill();
  }
  const head = sharedSprite('dragon' + dir + col, 170, 50, 85, 25, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = col;
    ctx.beginPath();                                                                   // head and snout, inside the hit boxes
    ctx.moveTo(-4, -11); ctx.lineTo(40, -11); ctx.quadraticCurveTo(52, -10, 60, -5); ctx.lineTo(77, -4);
    ctx.lineTo(77, 4); ctx.lineTo(60, 5); ctx.quadraticCurveTo(52, 10, 40, 11); ctx.lineTo(-4, 11); ctx.closePath();
    ctx.fill(); dunStroke(1.6);
    ctx.beginPath(); ctx.moveTo(18, -11); ctx.lineTo(8, -20); ctx.lineTo(28, -11); ctx.closePath(); ctx.fill(); dunStroke(1.3);   // horn
    ctx.fillStyle = dunShade(0.25); ctx.fillRect(-4, 4, 46, 7);
    ctx.strokeStyle = dunShade(0.4); ctx.lineWidth = 1.2; ctx.beginPath();             // scales
    for (const x of [6, 16, 26]) { ctx.moveTo(x, -6); ctx.quadraticCurveTo(x + 4, -2, x, 2); }
    ctx.stroke();
    ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(77, 0); ctx.stroke();   // mouth
    ctx.fillStyle = '#ffffff';
    for (const x of [64, 70]) { ctx.beginPath(); ctx.moveTo(x, -0.5); ctx.lineTo(x + 2, 2.5); ctx.lineTo(x + 4, -0.5); ctx.fill(); }
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(44, -4, 3.2, 2.4, 0, 0, Math.PI * 2); ctx.fill(); dunStroke(1);   // eye
    ctx.fillStyle = '#1a1410'; ctx.fillRect(43.6, -6, 1, 4);
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(72, -2.5, 1, 0, Math.PI * 2); ctx.fill();   // nostril
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {          // embers glow in the mouth just before a fireball
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#ff8a2a' : '#ffe07a';
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 78, sy, 4, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- the second set (v70) ----------
// flying daggers (Conveyor): a row of daggers crossing, each pointing the way the row moves (34 x 12 like a clip)
function drawDagger(x, sy, dir, hilt = '#8a5a32') {
  blit(sharedSprite('dagger' + dir + hilt, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    ctx.beginPath(); ctx.moveTo(-2, -3.5); ctx.lineTo(11, -3.5); ctx.lineTo(17, 0); ctx.lineTo(11, 3.5); ctx.lineTo(-2, 3.5); ctx.closePath();
    ctx.fillStyle = '#d6dbe3'; ctx.fill(); dunStroke(1.2);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(13, 0); ctx.stroke();
    ctx.fillStyle = '#e0b84a'; ctx.beginPath(); ctx.rect(-5, -6, 3, 12); ctx.fill(); dunStroke(1);           // crossguard
    ctx.fillStyle = hilt; ctx.beginPath(); ctx.rect(-14, -2.5, 9, 5); ctx.fill(); dunStroke(1);              // grip
    ctx.fillStyle = '#e0b84a'; ctx.beginPath(); ctx.arc(-15.5, 0, 2.8, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
  }), x, sy);
}

// a spinning saw blade (Spinning Drifter): fills its 20-unit hit circle, bouncing off the walls
function drawSawBlade(o, sy) {
  const col = o.dunCol || '#c9ced6';
  blit(sharedSprite('saw' + col, 46, 46, 23, 23, () => {
    const n = 14;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, b = (i + 0.7) / n * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * 16.5, Math.sin(a) * 16.5); ctx.lineTo(Math.cos(b) * 20, Math.sin(b) * 20);   // hooked teeth
    }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill(); dunStroke(1.4);
    ctx.strokeStyle = dunShade(0.3); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = dunShade(0.45);
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#4a4f58'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
    ctx.fillStyle = dunLight(0.45); ctx.beginPath(); ctx.ellipse(-7, -8, 4, 2, -0.7, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy, o.rot);
}

// two crossed swords (Spinning Blades): spinning round a rivet and scissoring open and shut. Each blade
// matches a scissor blade's hit box and each pommel its handle circle.
function drawSwords(o, sy) {
  const hilt = o.dunCol || '#e0b84a';
  const sword = sharedSprite('sword' + hilt, 106, 26, 34, 13, () => {
    ctx.beginPath(); ctx.moveTo(-6, -3.5); ctx.lineTo(58, -3.5); ctx.lineTo(66, 0); ctx.lineTo(58, 3.5); ctx.lineTo(-6, 3.5); ctx.closePath();
    ctx.fillStyle = '#e1e5ea'; ctx.fill(); dunStroke(1.3);
    ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(60, 0); ctx.stroke();
    ctx.fillStyle = hilt; ctx.beginPath(); ctx.rect(-9, -7, 4, 14); ctx.fill(); dunStroke(1.1);                 // crossguard
    ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.rect(-18, -2.5, 9, 5); ctx.fill(); dunStroke(1);           // grip
    ctx.fillStyle = hilt; ctx.beginPath(); ctx.arc(-22, 0, 6, 0, Math.PI * 2); ctx.fill(); dunStroke(1.2);      // pommel
  });
  for (const s of [-1, 1]) blit(sword, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = '#4a4f58'; ctx.beginPath(); ctx.arc(o.x, sy, 3.2, 0, Math.PI * 2); ctx.fill(); dunStroke(1);
}

// a rune stone on the wall (Charged Beam): its rune glows and a dashed line shows the path, then a magic beam fires
function drawRuneBeam(o, sy) {
  const x0 = ZAP_BODY, L = o.len, col = o.dunCol || '#b77cf0';
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
  ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 3); ctx.fillStyle = '#8f877a'; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = dunLight(0.18); ctx.fillRect(-6, -9, x0 + 2, 4); ctx.restore();
  ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 3); dunStroke(1.5);
  ctx.strokeStyle = o.phase === 'rest' ? 'rgba(40,30,50,.6)' : col; ctx.lineWidth = 1.8; ctx.lineCap = 'round';   // carved runes
  ctx.beginPath();
  ctx.moveTo(12, -5); ctx.lineTo(12, 5); ctx.moveTo(12, -5); ctx.lineTo(17, 0);
  ctx.moveTo(26, -5); ctx.lineTo(31, 5); ctx.moveTo(31, -5); ctx.lineTo(26, 5);
  ctx.moveTo(42, 5); ctx.lineTo(45, -5); ctx.lineTo(48, 5);
  ctx.stroke();
  ctx.fillStyle = o.phase === 'rest' ? '#3a2a40' : col; ctx.beginPath(); ctx.arc(x0 - 7, 0, 5, 0, Math.PI * 2); ctx.fill(); dunStroke(1.1);
  ctx.restore();
}

// a skeleton arm (Telegraphed Sweep): a dashed wedge shows its reach, then it swipes out of a crack in the wall
function drawSkeletonArm(o, sy) {
  const bone = o.dunCol || '#efe6d0';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#120e0b'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(7, -6); ctx.lineTo(3, 0); ctx.lineTo(8, 8); ctx.lineTo(0, 16); ctx.closePath(); ctx.fill();   // the crack
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = 'rgba(240,228,200,' + (0.3 + 0.55 * k) + ')'; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    ctx.lineCap = 'round';
    for (const y of [-5.5, 5.5]) {                 // the two forearm bones, filling most of the 22-unit hit box
      ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(len - 12, y * 0.7); ctx.stroke();
      ctx.strokeStyle = bone; ctx.lineWidth = 7; ctx.stroke();
    }
    ctx.fillStyle = bone;                           // knobbly joints at both ends
    for (const [x, y] of [[-8, -6.5], [-8, 6.5], [len - 14, -4.5], [len - 14, 4.5]]) { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); dunStroke(1.2); }
    ctx.translate(len, 0);                          // the bony hand, inside the 18-unit tip circle
    ctx.strokeStyle = DUN_LINE; ctx.lineWidth = 5.5;
    const fingers = () => { ctx.beginPath(); for (const a of [-0.75, -0.25, 0.25, 0.75]) { ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); } ctx.moveTo(-2, 0); ctx.lineTo(4, -14); ctx.stroke(); };
    fingers(); ctx.strokeStyle = bone; ctx.lineWidth = 3; fingers();
    ctx.fillStyle = bone; ctx.beginPath(); ctx.arc(-1, 0, 7.5, 0, Math.PI * 2); ctx.fill(); dunStroke(1.3);
  }
  ctx.restore();
}

// a cursed rune (Proximity Blast): a floating stone disc whose rune flickers and shows its blast circle as the
// plane comes near, then bursts in a ring of magic
function drawCurse(o, sy) {
  const col = o.dunCol || '#b77cf0';
  if (o.phase === 'boom' || o.phase === 'gone') {
    const t = o.phase === 'boom' ? o.t : 0.35 + o.t;
    if (t > 0.65) return;
    const r = o.blast * Math.min(1, t / 0.12), fade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.3;
    ctx.save();
    ctx.globalAlpha = 0.4 * fade; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(o.x, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(o.x, sy, r * 0.75, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    return;
  }
  if (o.phase === 'blink') {                       // where the blast will reach
    ctx.save();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.35 + 0.5 * Math.min(1, o.t / 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  blit(sharedSprite('curseStone', 36, 36, 18, 18, () => {
    ctx.fillStyle = '#5a5560'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); dunStroke(1.6);
    ctx.fillStyle = dunLight(0.15); ctx.beginPath(); ctx.arc(-4, -4, 8, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy);
  const on = o.phase === 'blink' ? Math.floor(o.t * 12) % 2 === 0 : true;
  ctx.save();
  ctx.globalAlpha = o.phase === 'blink' ? 1 : 0.55 + 0.35 * Math.sin(o.t * 3);
  ctx.strokeStyle = on ? col : '#ffffff'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  ctx.beginPath();                                                                           // a glowing cursed eye
  ctx.moveTo(o.x - 10, sy); ctx.quadraticCurveTo(o.x, sy - 9, o.x + 10, sy); ctx.quadraticCurveTo(o.x, sy + 9, o.x - 10, sy);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(o.x, sy, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// a cold draft (Push Zone, before 700 m only): icy streaks blowing out of a frosted crack; nothing solid to hit
function drawDraft(o, sy) {
  const cx = o.side < 0 ? 0 : W, dir = -o.side;
  ctx.save();
  ctx.strokeStyle = 'rgba(205,235,255,.6)'; ctx.fillStyle = 'rgba(230,245,255,.8)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 6;
    const run = (o.t * 170 + k * 71) % (W + 60);
    const x0 = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + dir * 18, yy - 5, x0 + dir * 36, yy); ctx.stroke();
    ctx.beginPath(); ctx.arc(x0 + dir * 46, yy + 3, 1.6, 0, Math.PI * 2); ctx.fill();      // a snowflake riding the gust
  }
  ctx.translate(cx, sy); ctx.scale(dir, 1);
  ctx.fillStyle = '#120e0b'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(9, -14); ctx.lineTo(4, -2); ctx.lineTo(11, 12); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(220,240,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(9, -14); ctx.lineTo(4, -2); ctx.lineTo(11, 12); ctx.lineTo(0, 30); ctx.stroke();
  ctx.restore();
}

// a spider web strand (Spring Line): bounces the plane away; the two spiders holding it are what hurts
function drawWeb(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y;
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9);
  const bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(245,245,255,.9)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); ctx.stroke();
  ctx.strokeStyle = 'rgba(245,245,255,.45)'; ctx.lineWidth = 1.2;                        // a looser second thread
  ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy + 6, o.x2, sy + dy2); ctx.stroke();
  ctx.restore();
  const spider = sharedSprite('spider', 24, 24, 12, 12, () => {
    ctx.strokeStyle = '#1a1410'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
    for (const s of [-1, 1]) for (const a of [-0.9, -0.3, 0.3, 0.9]) { ctx.moveTo(0, 0); ctx.lineTo(s * Math.cos(a) * 9, Math.sin(a) * 9); }
    ctx.stroke();
    ctx.fillStyle = '#2b2430'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); dunStroke(1.2);
    ctx.fillStyle = '#ff4a3a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 2.2, -2, 1.2, 0, Math.PI * 2); ctx.fill(); }
  });
  blit(spider, o.x1, sy + dy1); blit(spider, o.x2, sy + dy2);
}
