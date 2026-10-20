// Paper Nosedive — Art for the Kitchen map obstacles.
'use strict';

// Kitchen obstacles reuse a Paper or Ocean obstacle's movement and collision (see KITCHEN_MAKERS) and only change the look
// (o.look, see KITCHEN_LOOKS) in a few colours (o.kitCol); o.layer is the part of the kitchen the obstacle is in. Food and
// kitchen tools only, cartoon style, a warm dark outline so everything reads on the light walls. Every drawing stays
// inside the mechanic's collision shape.
const KIT_LINE = '#3a2418';
function kitStroke(w = 1.6) { ctx.strokeStyle = KIT_LINE; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
const kitLight = a => `rgba(255,255,255,${a})`, kitShade = a => `rgba(0,0,0,${a})`;
const K_STEEL = '#c9ced6', K_STEEL_DARK = '#8d939e';

function drawKitchenObstacle(o, sy) {
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawKitchenLedge(-10, l, sy, l, -1, o); drawKitchenLedge(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawKitchenJaw(-10, l, sy, l, -1, o); drawKitchenJaw(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'blot': drawKitchenHazard(o, sy); break;
    case 'protractor': drawKitchenPlatter(o, sy); break;
    case 'pencil': drawKitchenSlider(o, sy); break;
    case 'wad': drawKitchenPopper(o, sy); break;
    case 'note': drawKitchenSwarm(o, sy); break;
    case 'clips': for (const x of clipXs(o)) drawKitchenTrain(x, sy, o.v > 0 ? 1 : -1, o.look, o.kitCol); break;
    case 'starfish': drawKitchenSpinner(o, sy); break;
    case 'scissors': drawKitchenShears(o, sy); break;
    case 'compass': drawKitchenLadle(o, sy); break;
    case 'cutter': drawKitchenPiston(o, sy); break;
    case 'glue': drawKitchenTurret(o, sy); break;
    case 'zap': drawKitchenBeam(o, sy); break;
    case 'paw': drawKitchenSweep(o, sy); break;
    case 'mine': drawKitchenBlast(o, sy); break;
    case 'fan': drawKitchenDraft(o, sy); break;
    case 'bubbles': drawKitchenSteam(o, sy); break;
    case 'band': drawKitchenNoodle(o, sy); break;
  }
}

// ---------- Gap Wall: a shelf crowded with jars, a wooden cutting board, or a glass fridge shelf, 22 thick ----------
function drawKitchenLedge(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.kitCol || '#c8915a';
  ctx.save();
  if (o.look === 'fridgeshelf') {                  // frosted glass with a white trim along the front
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 3); ctx.fillStyle = 'rgba(200,232,248,.75)'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x0, sy + 5, x1 - x0, 6);
    ctx.fillStyle = kitLight(0.7); for (let x = innerX + outDir * 12; outDir > 0 ? x < x1 : x > x0; x += outDir * 30) { ctx.beginPath(); ctx.moveTo(x, sy - 9); ctx.lineTo(x + outDir * 8, sy - 9); ctx.lineTo(x + outDir * 2, sy + 2); ctx.closePath(); ctx.fill(); }
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 3); kitStroke(1.4);
  } else if (o.look === 'board') {                 // a wooden cutting board, rounded at the gap, with knife marks
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 10); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(120,70,30,.3)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let y = -6; y <= 6; y += 6) { ctx.moveTo(x0, sy + y); ctx.bezierCurveTo((x0 + x1) / 2, sy + y - 3, (x0 + x1) / 2, sy + y + 3, x1, sy + y); }
    for (let x = innerX + outDir * 30; outDir > 0 ? x < x1 : x > x0; x += outDir * 23) { ctx.moveTo(x, sy - 6); ctx.lineTo(x + 6, sy + 4); }
    ctx.stroke();
    ctx.restore();
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 10); kitStroke(1.5);
    ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.arc(innerX + outDir * 14, sy, 3.5, 0, Math.PI * 2); ctx.fill();   // the hanging hole
  } else {                                         // a shelf board with a tight row of jars standing on it
    ctx.beginPath(); ctx.rect(x0, sy + 3, x1 - x0, 8); ctx.fillStyle = col; ctx.fill(); kitStroke(1.3);
    const jars = ['#e0503a', '#f4c430', '#8ac040', '#7a4a2a', '#f08a3a', '#c75b9b'];
    for (let x = innerX, k = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * 14, k++) {
      const jx = outDir > 0 ? x : x - 14;
      ctx.fillStyle = 'rgba(230,245,250,.9)'; ctx.beginPath(); roundRectPath(jx + 0.5, sy - 8, 13, 11, 2); ctx.fill(); kitStroke(1);
      ctx.fillStyle = jars[k % jars.length]; ctx.fillRect(jx + 2, sy - 3, 10, 6);                                    // what's inside
      ctx.fillStyle = jars[(k + 3) % jars.length]; ctx.beginPath(); roundRectPath(jx + 1.5, sy - 11, 11, 3.5, 1); ctx.fill(); kitStroke(0.9);   // the lid
    }
  }
  ctx.restore();
}

// ---------- Closing Jaws: kitchen drawers sliding shut, or the two hot halves of a waffle iron, 28 thick ----------
function drawKitchenJaw(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.kitCol || '#d8a868';
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  if (o.look === 'waffle') {                       // a grid of square pockets, golden batter peeking out at the edge
    ctx.fillStyle = kitShade(0.25);
    for (let x = innerX + outDir * 4; outDir > 0 ? x < x1 : x > x0; x += outDir * 9) for (const y of [-11, -2, 7]) ctx.fillRect(Math.min(x, x + outDir * 6), sy + y, 6, 6);
    ctx.fillStyle = '#e8b060'; ctx.fillRect(outDir > 0 ? innerX : innerX - 3, sy - 14, 3, 28);
  } else {                                         // a drawer front with a panel and a round knob near the gap
    ctx.strokeStyle = kitShade(0.2); ctx.lineWidth = 1.4; ctx.strokeRect(Math.min(x0, x1) + 5, sy - 9, Math.abs(x1 - x0) - 10, 18);
    ctx.fillStyle = kitLight(0.25); ctx.fillRect(x0, sy - 14, x1 - x0, 4);
  }
  ctx.restore();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); kitStroke(1.6);
  if (o.look !== 'waffle') { ctx.fillStyle = K_STEEL; ctx.beginPath(); ctx.arc(innerX + outDir * 16, sy, 4, 0, Math.PI * 2); ctx.fill(); kitStroke(1.1); }
  ctx.restore();
}

// ---------- Static Hazards: a pineapple, a pepper grinder or an ice cube, inside the hit circle; the Pastries collectibles ----------
// the Pastries, each drawn inside a 20-unit circle (also used by the Collections screen)
const PASTRY_NAMES = { croissant: 'Croissant', donut: 'Donut', macaron: 'Macaron', cupcake: 'Cupcake', eclair: 'Éclair',
                       pretzel: 'Pretzel', cinnamonroll: 'Cinnamon roll', mooncake: 'Mooncake' };
function paintPastry(name) {
  const dough = '#e8b060', baked = '#c8823a';
  if (name === 'croissant') {                      // a curved roll of five puffy segments
    for (const [x, y, r, a] of [[-14, 6, 5, -0.6], [-8, -2, 7, -0.3], [0, -5, 9, 0], [8, -2, 7, 0.3], [14, 6, 5, 0.6]]) {
      ctx.fillStyle = r > 8 ? baked : dough; ctx.beginPath(); ctx.ellipse(x, y, r * 0.75, r, a, 0, Math.PI * 2); ctx.fill(); kitStroke(1.2);
    }
    ctx.fillStyle = kitLight(0.4); ctx.beginPath(); ctx.ellipse(-2, -9, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'donut') {                   // pink icing with sprinkles
    ctx.fillStyle = dough; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); kitStroke(1.4);
    ctx.fillStyle = '#ff8ab8'; ctx.beginPath();
    for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI * 2, r = 15 + (i % 2) * 1.6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fbf1dc'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); kitStroke(1.2);
    const sp = ['#3a8ad8', '#f4c430', '#5fae4a', '#ffffff'];
    for (let i = 0; i < 12; i++) { const a = i * 0.9, d = 10 + (i % 3) * 1.6; ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d); ctx.rotate(a * 2); ctx.fillStyle = sp[i % 4]; ctx.fillRect(-2, -0.7, 4, 1.4); ctx.restore(); }
  } else if (name === 'macaron') {                 // two pastel shells with a cream filling, seen from the side
    for (const y of [-6, 6]) { ctx.fillStyle = '#b8e0c8'; ctx.beginPath(); ctx.ellipse(0, y, 17, 6.5, 0, 0, Math.PI * 2); ctx.fill(); kitStroke(1.3); }
    ctx.fillStyle = '#fff6e8'; ctx.fillRect(-15, -2, 30, 4); ctx.beginPath(); ctx.rect(-15, -2, 30, 4); kitStroke(1);
    ctx.fillStyle = kitLight(0.5); ctx.beginPath(); ctx.ellipse(-6, -9, 6, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'cupcake') {                 // a ridged paper case, a swirl of frosting and a cherry
    ctx.fillStyle = '#6ab0e0'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.lineTo(9, 17); ctx.lineTo(-9, 17); ctx.closePath(); ctx.fill(); kitStroke(1.3);
    ctx.strokeStyle = kitShade(0.25); ctx.lineWidth = 1; ctx.beginPath(); for (let x = -8; x <= 8; x += 4) { ctx.moveTo(x, 1); ctx.lineTo(x * 0.8, 16); } ctx.stroke();
    ctx.fillStyle = '#ffd0e0'; for (const [y, r] of [[-1, 13], [-8, 10], [-14, 6]]) { ctx.beginPath(); ctx.ellipse(0, y, r, 5, 0, 0, Math.PI * 2); ctx.fill(); kitStroke(1.1); }
    ctx.fillStyle = '#d8342a'; ctx.beginPath(); ctx.arc(0, -19, 3.4, 0, Math.PI * 2); ctx.fill(); kitStroke(1);
  } else if (name === 'eclair') {                  // a long pastry with chocolate on top
    ctx.fillStyle = dough; ctx.beginPath(); roundRectPath(-18, -6, 36, 14, 7); ctx.fill(); kitStroke(1.3);
    ctx.fillStyle = '#5a3020'; ctx.beginPath(); roundRectPath(-17, -7, 34, 7, 3.5); ctx.fill(); kitStroke(1.1);
    ctx.fillStyle = kitLight(0.4); ctx.fillRect(-12, -6, 14, 1.6);
  } else if (name === 'pretzel') {                 // the classic knot with salt flakes
    ctx.strokeStyle = KIT_LINE; ctx.lineWidth = 7; ctx.lineCap = 'round';
    const knot = () => { ctx.beginPath(); ctx.moveTo(-6, 14); ctx.bezierCurveTo(-24, -4, -10, -20, 0, -6); ctx.bezierCurveTo(10, -20, 24, -4, 6, 14); ctx.moveTo(-6, 14); ctx.lineTo(6, 2); ctx.moveTo(6, 14); ctx.lineTo(-6, 2); };
    knot(); ctx.stroke(); ctx.strokeStyle = '#a8622a'; ctx.lineWidth = 4.6; knot(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; for (const [x, y] of [[-12, -6], [-4, -10], [10, -8], [12, 2], [-12, 4], [0, 8]]) ctx.fillRect(x, y, 1.6, 1.6);
  } else if (name === 'cinnamonroll') {            // a spiral roll with white icing
    ctx.fillStyle = dough; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); kitStroke(1.4);
    ctx.strokeStyle = baked; ctx.lineWidth = 2.4; ctx.beginPath(); for (let a = 0; a < 14; a += 0.2) ctx.lineTo(Math.cos(a) * a * 1.15, Math.sin(a) * a * 1.15); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-12, -6); ctx.quadraticCurveTo(-2, 4, 10, -8); ctx.moveTo(-8, 8); ctx.quadraticCurveTo(2, 0, 12, 8); ctx.stroke();
  } else {                                         // a round mooncake with a pressed flower pattern
    ctx.fillStyle = '#d0904a'; ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 17 : 18.5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); kitStroke(1.4);
    ctx.strokeStyle = '#a0602a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.moveTo(0, 0); ctx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 4, 2, a, 0, Math.PI * 2); } ctx.stroke();
  }
}
function drawKitchenHazard(o, sy) {
  if (o.pastry) {
    const k = o.r * 0.88 / 20;
    blit(sharedSprite('pastry-' + o.pastry, 48, 48, 24, 24, () => paintPastry(o.pastry)), o.x, sy, 0, k, k);
    return;
  }
  const R = o.r * 0.88, col = o.kitCol || '#f2c43a', look = o.look || 'pineapple';
  blit(ownSprite(o, 'sprK', R * 2 + 8, R * 2 + 8, R + 4, R + 4, () => {
    if (look === 'peppermill') {                   // a tall turned-wood grinder with a knob on top
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-R * 0.45, R * 0.9); ctx.lineTo(R * 0.45, R * 0.9); ctx.quadraticCurveTo(R * 0.7, R * 0.2, R * 0.4, -R * 0.2);
      ctx.quadraticCurveTo(R * 0.65, -R * 0.6, R * 0.32, -R * 0.75); ctx.lineTo(-R * 0.32, -R * 0.75); ctx.quadraticCurveTo(-R * 0.65, -R * 0.6, -R * 0.4, -R * 0.2);
      ctx.quadraticCurveTo(-R * 0.7, R * 0.2, -R * 0.45, R * 0.9); ctx.closePath(); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = kitLight(0.3); ctx.fillRect(-R * 0.22, -R * 0.6, R * 0.1, R * 1.4);
      ctx.fillStyle = K_STEEL; ctx.beginPath(); ctx.arc(0, -R * 0.85, R * 0.14, 0, Math.PI * 2); ctx.fill(); kitStroke(1);
    } else if (look === 'icecube') {               // a clear cube with a shine and a little frost
      ctx.fillStyle = 'rgba(210,240,252,.9)'; ctx.beginPath(); roundRectPath(-R * 0.8, -R * 0.8, R * 1.6, R * 1.6, R * 0.3); ctx.fill(); kitStroke(1.5);
      ctx.fillStyle = kitLight(0.85); ctx.beginPath(); ctx.moveTo(-R * 0.5, -R * 0.55); ctx.lineTo(R * 0.1, -R * 0.55); ctx.lineTo(-R * 0.5, R * 0.05); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(120,180,210,.6)'; ctx.lineWidth = 1; ctx.strokeRect(-R * 0.5, -R * 0.5, R, R);
    } else {                                       // a pineapple: a crosshatched body and a spiky crown
      ctx.fillStyle = '#4f9a3a';
      for (const a of [-0.6, -0.25, 0, 0.25, 0.6]) { ctx.save(); ctx.translate(0, -R * 0.4); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-R * 0.12, 0); ctx.lineTo(0, -R * 0.55); ctx.lineTo(R * 0.12, 0); ctx.closePath(); ctx.fill(); kitStroke(1); ctx.restore(); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, R * 0.22, R * 0.74, R * 0.74, 0, 0, Math.PI * 2); ctx.fill(); kitStroke(1.4);
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, R * 0.22, R * 0.74, R * 0.74, 0, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = 'rgba(150,100,20,.55)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let k = -2; k <= 2; k++) { ctx.moveTo(-R + k * R * 0.35, -R * 0.6); ctx.lineTo(R + k * R * 0.35, R); ctx.moveTo(R + k * R * 0.35, -R * 0.6); ctx.lineTo(-R + k * R * 0.35, R); }
      ctx.stroke(); ctx.restore();
    }
  }), o.x, sy);
}

// ---------- Wall Bulge: a round cake, a pizza or half a watermelon, an exact half-disc ----------
function drawKitchenPlatter(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 6, i = -o.side, col = o.kitCol || '#f7c8d8', look = o.look || 'cake';
  const s = ownSprite(o, 'sprK', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2);
    ctx.fillStyle = look === 'pizza' ? '#d8963a' : look === 'melon' ? col : '#f4e8d8'; ctx.fill();
    ctx.save(); ctx.clip();
    if (look === 'pizza') {                        // crust, sauce, cheese and pepperoni
      ctx.fillStyle = '#d8342a'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.86, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, r = o.r * (0.76 + 0.05 * Math.sin(k * 3)); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b8302a';
      for (const [a, d] of [[-0.9, 0.45], [-0.2, 0.62], [0.5, 0.4], [1.1, 0.62], [0, 0.2], [-1.4, 0.7]]) { ctx.beginPath(); ctx.arc(i * Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, o.r * 0.1, 0, Math.PI * 2); ctx.fill(); kitStroke(1); }
      ctx.fillStyle = '#4f9a3a'; for (const [a, d] of [[-0.5, 0.3], [0.8, 0.5]]) { ctx.beginPath(); ctx.ellipse(i * Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, 4, 2, a, 0, Math.PI * 2); ctx.fill(); }
    } else if (look === 'melon') {                 // a green rind, pale band, red flesh and black seeds
      ctx.fillStyle = '#e8f4c8'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff5a6a'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.82, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a2420';
      for (let k = 0; k < 14; k++) { const a = k * 2.4, d = o.r * (0.2 + 0.5 * ((k * 37) % 10) / 10); ctx.beginPath(); ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, 2.4, 3.6, a, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = kitLight(0.2); ctx.beginPath(); ctx.arc(-i * o.r * 0.2, -o.r * 0.3, o.r * 0.5, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a round cake: sponge layers, frosting dripping down, sprinkles, cherries
      ctx.fillStyle = '#f0d0a0'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.95, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); for (let k = 0; k <= 36; k++) { const a = k / 36 * Math.PI * 2, r = o.r * (0.82 + (k % 2 ? 0.06 : 0)); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = kitLight(0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.6, 0, Math.PI * 2); ctx.stroke();
      const sp = ['#3a8ad8', '#f4c430', '#5fae4a', '#ffffff', '#e05a4a'];
      for (let k = 0; k < 22; k++) { const a = k * 2.39, d = o.r * (0.15 + 0.6 * ((k * 37) % 10) / 10); ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d); ctx.rotate(a); ctx.fillStyle = sp[k % 5]; ctx.fillRect(-3, -1, 6, 2); ctx.restore(); }
      ctx.fillStyle = '#d8342a'; for (const a of [-0.8, 0, 0.8]) { ctx.beginPath(); ctx.arc(i * Math.cos(a) * o.r * 0.6, Math.sin(a) * o.r * 0.6, 5, 0, Math.PI * 2); ctx.fill(); kitStroke(1); }
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); kitStroke(1.8);
  });
  blit(s, cx, sy);
}

// ---------- Bouncing Slider: a rolling pin or a wooden spoon, 13 thick ----------
function drawKitchenSlider(o, sy) {
  const L = o.len / 2, col = o.kitCol || '#e0b878';
  blit(ownSprite(o, 'sprK', o.len + 8, 22, L + 4, 11, () => {
    if (o.look === 'spoon') {                      // a long handle and a deep bowl at one end
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-L, -3.5, o.len * 0.72, 7, 3.5); ctx.fill(); kitStroke(1.3);
      ctx.beginPath(); ctx.ellipse(L - o.len * 0.15, 0, o.len * 0.15, 6.5, 0, 0, Math.PI * 2); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = kitShade(0.15); ctx.beginPath(); ctx.ellipse(L - o.len * 0.15, 0.5, o.len * 0.1, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.arc(-L + 6, 0, 1.8, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a wooden pin with a handle at each end
      for (const s of [-1, 1]) { ctx.fillStyle = '#a8703a'; ctx.beginPath(); roundRectPath(s > 0 ? L - 22 : -L, -3.5, 22, 7, 3.5); ctx.fill(); kitStroke(1.2); }
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-L + 18, -6.5, o.len - 36, 13, 5); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = kitLight(0.35); ctx.fillRect(-L + 22, -4.5, o.len - 44, 2.4);
      ctx.fillStyle = '#ffffff'; for (const k of [-0.3, 0.1, 0.4]) { ctx.beginPath(); ctx.arc(k * L, 2.5, 1.4, 0, Math.PI * 2); ctx.fill(); }   // a dusting of flour
    }
  }), o.x, sy, o.a);
}

// ---------- Rising Projectile: popcorn popping up the kitchen, or a bottle cork ----------
function drawKitchenPopper(o, sy) {
  const s = o.r / 16, look = o.look || 'popcorn', col = o.kitCol || '#fff6dc';
  blit(sharedSprite('kpop' + look + col, 40, 40, 20, 20, () => {
    if (look === 'cork') {                         // a cork, wider at the top, with a little wire cage
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-10, 13); ctx.lineTo(10, 13); ctx.lineTo(13, -6); ctx.quadraticCurveTo(0, -15, -13, -6); ctx.closePath(); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = 'rgba(120,80,40,.4)'; for (const [x, y] of [[-3, 4], [3, 0], [-1, -6], [4, 8]]) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = K_STEEL_DARK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-13, -4); ctx.lineTo(13, -4); ctx.moveTo(0, -12); ctx.lineTo(0, -4); ctx.stroke();
    } else {                                       // a puffy white kernel of popcorn with a little yellow heart
      ctx.fillStyle = col; ctx.beginPath();
      for (const [x, y, r] of [[0, -6, 8], [-7, 0, 7], [7, 1, 7], [-2, 7, 7], [5, -9, 5], [-8, -8, 5]]) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
      ctx.fill(); kitStroke(1.3);
      ctx.fillStyle = '#f4c430'; ctx.beginPath(); ctx.ellipse(1, 2, 4, 3, 0.4, 0, Math.PI * 2); ctx.fill(); kitStroke(1);
    }
  }), o.x, sy, o.rot, s, s);
}

// ---------- Drifting Swarm: pancakes, lettuce leaves or soap bubbles (sink), filling a 42-unit square ----------
function drawKitchenSwarm(o, sy) {
  const look = o.look || 'pancake', col = o.kitCol || '#e8b060';
  blit(sharedSprite('kswarm' + look + col, 48, 48, 24, 24, () => {
    if (look === 'lettuce') {                      // a ruffled green leaf with a pale rib
      ctx.fillStyle = col; ctx.beginPath();
      for (let k = 0; k <= 18; k++) { const a = k / 18 * Math.PI * 2, r = 18 + (k % 2) * 3; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.9); }
      ctx.closePath(); ctx.fill(); kitStroke(1.3);
      ctx.strokeStyle = '#e8f8c8'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-14, 12); ctx.quadraticCurveTo(0, 0, 14, -12); ctx.stroke();
      ctx.lineWidth = 1.2; ctx.beginPath(); for (const k of [-0.5, 0, 0.5]) { ctx.moveTo(k * 14, -k * 12); ctx.lineTo(k * 14 - 6, -k * 12 - 7); ctx.moveTo(k * 14, -k * 12); ctx.lineTo(k * 14 + 7, -k * 12 + 6); } ctx.stroke();
    } else if (look === 'bubble') {                // a big soap bubble with a rainbow sheen and a clear outline
      ctx.fillStyle = 'rgba(216,240,255,.35)'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,140,200,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 17, 0.2, 1.6); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,200,255,.7)'; ctx.beginPath(); ctx.arc(0, 0, 17, 2.4, 3.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); kitStroke(1.5);
      ctx.fillStyle = kitLight(0.9); ctx.beginPath(); ctx.ellipse(-8, -9, 5, 2.5, -0.6, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a golden pancake with a pat of butter and a drip of syrup
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 20, 19, 0, 0, Math.PI * 2); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = 'rgba(160,90,30,.3)'; for (const [x, y, r] of [[-8, -5, 2], [6, -8, 1.6], [9, 5, 2], [-4, 9, 1.6], [2, -1, 1.3]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#a8501a'; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.quadraticCurveTo(8, -8, 10, 2); ctx.quadraticCurveTo(10, 12, 6, 14); ctx.quadraticCurveTo(2, 4, -6, -4); ctx.fill();
      ctx.fillStyle = '#fff2a0'; ctx.beginPath(); roundRectPath(-4, -6, 8, 6, 1.5); ctx.fill(); kitStroke(1);
    }
  }), o.x, sy, o.rot);
}

// ---------- Conveyor: a line of ants carrying crumbs, or a string of sausages (34 x 12 each) ----------
function drawKitchenTrain(x, sy, dir, look = 'ants', col = '#3a2a20') {
  blit(sharedSprite('ktrain' + look + dir + col, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    if (look === 'sausages') {
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-15, -5.5, 30, 11, 5.5); ctx.fill(); kitStroke(1.3);
      ctx.fillStyle = kitLight(0.35); ctx.fillRect(-10, -3.5, 18, 2);
      ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-15, 0); ctx.moveTo(15, 0); ctx.lineTo(17, 0); ctx.stroke();   // the string
    } else {                                       // an ant carrying a crumb over its head
      ctx.fillStyle = '#f0d8a0'; ctx.beginPath(); roundRectPath(5, -6, 12, 8, 2); ctx.fill(); kitStroke(1);                       // the crumb
      ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.beginPath();
      for (const lx of [-9, -4, 1]) { ctx.moveTo(lx, 2); ctx.lineTo(lx - 2, 6); ctx.moveTo(lx, 2); ctx.lineTo(lx + 2, 6); }
      ctx.moveTo(4, -1); ctx.lineTo(7, -3); ctx.stroke();
      ctx.fillStyle = col;
      for (const [cx, r] of [[-12, 4.2], [-4, 3], [3, 3.4]]) { ctx.beginPath(); ctx.ellipse(cx, 2, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill(); }
    }
  }), x, sy);
}

// ---------- Spinning Drifter: a pizza cutter wheel or a lemon slice, filling a 20-unit circle ----------
function drawKitchenSpinner(o, sy) {
  const look = o.look || 'cutterwheel', col = o.kitCol || K_STEEL;
  blit(sharedSprite('kspin' + look + col, 46, 46, 23, 23, () => {
    if (look === 'lemon') {                        // a slice: rind, pith, juicy segments
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 19.5, 0, Math.PI * 2); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = '#fff8d0'; ctx.beginPath(); ctx.arc(0, 0, 16.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col === '#a0d050' ? '#d0f080' : '#fff080';
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a + 0.08) * 2, Math.sin(a + 0.08) * 2); ctx.arc(0, 0, 14.5, a + 0.08, a + Math.PI / 4 - 0.08); ctx.closePath(); ctx.fill(); }
    } else {                                       // a steel wheel with a sharp rim and a red hub
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 19.5, 0, Math.PI * 2); ctx.fill(); kitStroke(1.4);
      ctx.strokeStyle = kitLight(0.7); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 16.5, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = K_STEEL_DARK; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 7, Math.sin(a) * 7); ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14); } ctx.stroke();
      ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); kitStroke(1.2);
    }
  }), o.x, sy, o.rot);
}

// ---------- Spinning Blades: kitchen shears, or two egg-beater whisks, spinning and snapping ----------
function drawKitchenShears(o, sy) {
  const beat = o.look === 'beaters';
  const piece = sharedSprite('kshear' + o.look, 106, 26, 34, 13, () => {
    if (beat) {                                    // a long wire loop with a knob behind the pivot
      ctx.strokeStyle = KIT_LINE; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.ellipse(32, 0, 32, 4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = K_STEEL; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.strokeStyle = K_STEEL; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(62, 0); ctx.stroke();
      ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(-22, 0, 9, 0, Math.PI * 2); ctx.fill(); kitStroke(1.3);
      ctx.fillStyle = K_STEEL; ctx.fillRect(-14, -2, 14, 4);
    } else {                                       // a stout blade and a big red handle loop
      ctx.fillStyle = K_STEEL; ctx.beginPath(); ctx.moveTo(-4, -3.5); ctx.lineTo(56, -2); ctx.lineTo(66, 0); ctx.lineTo(56, 3); ctx.lineTo(-4, 3.5); ctx.closePath(); ctx.fill(); kitStroke(1.2);
      ctx.strokeStyle = kitLight(0.8); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, -1.5); ctx.lineTo(54, -0.5); ctx.stroke();
      ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(-22, 0, 9.5, 0, Math.PI * 2); ctx.fill(); kitStroke(1.3);
      ctx.fillStyle = '#fbf1dc'; ctx.beginPath(); ctx.ellipse(-22, 0, 5, 4, 0, 0, Math.PI * 2); ctx.fill(); kitStroke(1);
      ctx.fillStyle = '#e04a3a'; ctx.fillRect(-13, -2.5, 10, 5);
    }
  });
  for (const s of [-1, 1]) blit(piece, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = K_STEEL_DARK; ctx.beginPath(); ctx.arc(o.x, sy, 3.4, 0, Math.PI * 2); ctx.fill(); kitStroke(1);
}

// ---------- Sweeping Arm: a ladle stirring round, or the hand of an oven timer turning round its dial ----------
function drawKitchenLadle(o, sy) {
  const hh = o.hh || 5, timer = o.look === 'timer', col = o.kitCol || K_STEEL;
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.ang);
  if (timer) {                                     // a red pointer hand
    ctx.beginPath(); ctx.moveTo(4, -3); ctx.lineTo(o.L - 6, -hh + 1); ctx.lineTo(o.L, 0); ctx.lineTo(o.L - 6, hh - 1); ctx.lineTo(4, 3); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); kitStroke(1.3);
  } else {                                         // a long handle and a round bowl at the end
    ctx.fillStyle = col; ctx.beginPath(); roundRectPath(4, -hh + 1, o.L - 18, (hh - 1) * 2, hh - 1); ctx.fill(); kitStroke(1.2);
    ctx.beginPath(); ctx.ellipse(o.L - 9, 0, 10, hh + 0.5, 0, 0, Math.PI * 2); ctx.fill(); kitStroke(1.3);
    ctx.fillStyle = kitShade(0.18); ctx.beginPath(); ctx.ellipse(o.L - 9, 0.5, 6.5, hh - 1.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (timer) {                                     // the timer's dial, its pivot
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(o.x, sy, 8.5, 0, Math.PI * 2); ctx.fill(); kitStroke(1.5);
    ctx.fillStyle = KIT_LINE; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; ctx.fillRect(o.x + Math.cos(a) * 6 - 0.6, sy + Math.sin(a) * 6 - 0.6, 1.2, 1.2); }
  } else { ctx.fillStyle = '#a8703a'; ctx.beginPath(); ctx.arc(o.x, sy, 8.5, 0, Math.PI * 2); ctx.fill(); kitStroke(1.5); ctx.fillStyle = K_STEEL_DARK; ctx.beginPath(); ctx.arc(o.x, sy, 3, 0, Math.PI * 2); ctx.fill(); }
}

// ---------- Wall Piston: a butter knife sliding out of a knife block, or kitchen tongs snapping out of a crock ----------
function drawKitchenPiston(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, tongs = o.look === 'tongs';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    const tip = h + e;
    if (tongs) {                                   // two arms with scalloped tips
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(h - 6, s * 1); ctx.lineTo(tip - 8, s * 4.5); ctx.lineTo(tip, s * 5.5); ctx.lineTo(tip, s * 2.5); ctx.lineTo(tip - 8, s * 1.5); ctx.lineTo(h - 6, s * 0.2); ctx.closePath(); ctx.fillStyle = K_STEEL; ctx.fill(); kitStroke(1.1); }
    } else {                                       // a butter knife: a rounded blade
      ctx.beginPath(); ctx.moveTo(h - 6, -4.5); ctx.lineTo(tip - 8, -5.5); ctx.quadraticCurveTo(tip + 1, -5, tip, 1); ctx.lineTo(tip - 8, 5); ctx.lineTo(h - 6, 4.5); ctx.closePath();
      ctx.fillStyle = '#e8ecf0'; ctx.fill(); kitStroke(1.2);
      ctx.strokeStyle = kitLight(0.9); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(h, -2.5); ctx.lineTo(tip - 10, -3); ctx.stroke();
    }
  }
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 4); ctx.fillStyle = tongs ? '#e8d8c0' : '#a8703a'; ctx.fill(); kitStroke(1.6);   // the block (or the crock)
  ctx.save(); ctx.clip(); ctx.fillStyle = kitLight(0.18); ctx.fillRect(-6, -12, h + 6, 5); ctx.restore();
  if (tongs) { ctx.fillStyle = '#6ab0e0'; ctx.fillRect(10, -2, h - 20, 4); }
  else { ctx.fillStyle = '#5a3a20'; for (const y of [-6, 0, 6]) ctx.fillRect(h - 18, y - 1, 14, 2); }               // the slots
  ctx.restore();
}

// ---------- Wall Turret: a toaster launching slices of toast, or a ketchup bottle squirting drops ----------
function drawKitchenTurret(o, sy) {
  const dir = inward(o), ketchup = o.look === 'ketchup', col = o.kitCol || '#e0e4ea';
  for (const b of o.blobs) {
    if (ketchup) {
      ctx.fillStyle = '#d8342a'; ctx.beginPath(); ctx.ellipse(b.x, sy, b.r * 1.1, b.r * 0.85, 0, 0, Math.PI * 2); ctx.fill(); kitStroke(1);
      ctx.fillStyle = kitLight(0.6); ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, sy - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a slice of toast, tumbling
      ctx.save(); ctx.translate(b.x, sy); ctx.rotate(b.wob);
      ctx.fillStyle = '#c8823a'; ctx.beginPath(); roundRectPath(-b.r, -b.r, b.r * 2, b.r * 2, b.r * 0.4); ctx.fill(); kitStroke(1.1);
      ctx.fillStyle = '#f0c880'; ctx.beginPath(); roundRectPath(-b.r * 0.72, -b.r * 0.72, b.r * 1.44, b.r * 1.44, b.r * 0.3); ctx.fill();
      ctx.restore();
    }
  }
  const body = sharedSprite('kturret' + o.look + dir + col, 176, 52, 88, 26, () => {
    ctx.scale(dir, 1);
    if (ketchup) {                                 // a red squeeze bottle lying along the wall, its nozzle toward the middle
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-4, -11, 58, 22, 9); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = '#fbf1dc'; ctx.beginPath(); roundRectPath(12, -6, 22, 12, 3); ctx.fill();
      ctx.fillStyle = '#5fae4a'; ctx.beginPath(); ctx.arc(23, 0, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f4f0e8'; ctx.beginPath(); ctx.moveTo(52, -7); ctx.lineTo(64, -4); ctx.lineTo(78, -2); ctx.lineTo(78, 2); ctx.lineTo(64, 4); ctx.lineTo(52, 7); ctx.closePath(); ctx.fill(); kitStroke(1.2);
    } else {                                       // a chrome toaster on its side, slot facing the middle, lever on top
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-4, -11, 66, 22, 8); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = kitLight(0.5); ctx.fillRect(4, -8, 46, 3);
      ctx.fillStyle = '#2a2420'; ctx.beginPath(); roundRectPath(58, -5, 8, 10, 2); ctx.fill();               // the slot
      ctx.fillStyle = '#f0c880'; ctx.fillRect(60, -3.5, 5, 7);
      ctx.fillStyle = '#3a3a42'; ctx.beginPath(); roundRectPath(24, -14, 10, 4, 1.5); ctx.fill();            // the lever
      ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(14, 4, 2.4, 0, Math.PI * 2); ctx.fill();          // the "on" light
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(66, -3.5, 12, 7, 2); ctx.fill(); kitStroke(1.1);    // the chute the toast flies out of
    }
  });
  blit(body, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {          // the slot glows hot (or the nozzle bulges) just before each shot
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? (ketchup ? '#d8342a' : '#ff8a3a') : '#fff2c0';
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 77, sy, 3.6, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Charged Beam: a jet of water from the tap (sink), a cooking blowtorch, or a blast of cold air from the freezer ----------
function drawKitchenBeam(o, sy) {
  const x0 = ZAP_BODY, L = o.len, look = o.look || 'torch', col = o.kitCol || '#5ab8ff';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save(); ctx.strokeStyle = look === 'torch' ? '#3a8ad8' : '#6ab0e0'; ctx.globalAlpha = 0.3 + 0.6 * Math.min(1, o.t / 0.7); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke(); ctx.restore();
    if (look === 'tap') { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0 + 2, 4 + (o.t * 25) % 6, 2, 0, Math.PI * 2); ctx.fill(); }
  } else if (o.phase === 'zap') {
    ctx.lineCap = 'round';
    if (look === 'torch') {                        // a blue flame, white-hot at its core
      ctx.fillStyle = 'rgba(90,184,255,.4)'; ctx.beginPath(); ctx.moveTo(x0, -6); ctx.quadraticCurveTo(x0 + L * 0.7, -6, x0 + L, 0); ctx.quadraticCurveTo(x0 + L * 0.7, 6, x0, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, -3.5); ctx.quadraticCurveTo(x0 + L * 0.6, -3.5, x0 + L * 0.85, 0); ctx.quadraticCurveTo(x0 + L * 0.6, 3.5, x0, 3.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x0, -1.5); ctx.quadraticCurveTo(x0 + L * 0.3, -1.5, x0 + L * 0.45, 0); ctx.quadraticCurveTo(x0 + L * 0.3, 1.5, x0, 1.5); ctx.closePath(); ctx.fill();
    } else {                                       // a stream of water, or of icy air with snowflakes
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0);
      ctx.strokeStyle = '#2a6a9a'; ctx.lineWidth = 12; ctx.stroke();
      ctx.strokeStyle = look === 'tap' ? '#4a9ae0' : '#8ac8ec'; ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let x = x0; x <= x0 + L; x += 6) ctx.lineTo(x, Math.sin(x * 0.4 + time * 25) * 1.6); ctx.stroke();
      if (look === 'coldair') { ctx.fillStyle = '#ffffff'; for (const k of [0.25, 0.5, 0.75]) { const x = x0 + L * k; ctx.fillRect(x - 3, -0.6, 6, 1.2); ctx.fillRect(x - 0.6, -3, 1.2, 6); } }
    }
  }
  if (look === 'tap') {                            // a chrome faucet coming out of the wall, its spout toward the middle
    ctx.fillStyle = K_STEEL; ctx.beginPath(); roundRectPath(-6, -5, x0 - 6, 10, 5); ctx.fill(); kitStroke(1.3);
    ctx.beginPath(); roundRectPath(x0 - 14, -9, 14, 18, 4); ctx.fill(); kitStroke(1.3);
    ctx.fillStyle = kitLight(0.7); ctx.fillRect(2, -3.5, x0 - 20, 2);
    ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(18, -6, 4, 0, Math.PI * 2); ctx.fill(); kitStroke(1);   // the hot/cold knob
  } else if (look === 'coldair') {                 // a frosty vent grille
    ctx.fillStyle = '#e8f4fa'; ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 3); ctx.fill(); kitStroke(1.3);
    ctx.strokeStyle = '#8ab0c8'; ctx.lineWidth = 2; ctx.beginPath(); for (const y of [-4, 0, 4]) { ctx.moveTo(6, y); ctx.lineTo(x0 - 6, y); } ctx.stroke();
  } else {                                         // a cooking blowtorch: a canister and a brass nozzle
    ctx.fillStyle = '#e04a3a'; ctx.beginPath(); roundRectPath(-6, -9, 44, 18, 6); ctx.fill(); kitStroke(1.3);
    ctx.fillStyle = '#2a2420'; ctx.fillRect(10, -9, 6, 18);
    ctx.fillStyle = '#d8a840'; ctx.beginPath(); roundRectPath(38, -4, x0 - 38, 8, 2); ctx.fill(); kitStroke(1.2);
    ctx.fillStyle = o.phase === 'rest' ? '#8a8f98' : '#5ab8ff'; ctx.beginPath(); ctx.arc(x0 - 3, 0, 2.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- Telegraphed Sweep: a spatula flipping out of a utensil hole, or a big whisk swiping, after a dashed wedge ----------
function drawKitchenSweep(o, sy) {
  const col = o.kitCol || '#3a3a42', whisk = o.look === 'whisk';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#2a2420'; ctx.beginPath(); ctx.ellipse(2, 0, 7, 16, 0, 0, Math.PI * 2); ctx.fill();
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save(); ctx.strokeStyle = '#e04a3a'; ctx.globalAlpha = 0.35 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke(); ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    ctx.fillStyle = whisk ? '#a8703a' : col; ctx.beginPath(); roundRectPath(-8, -10, len - 24, 20, 9); ctx.fill(); kitStroke(1.4);   // a chunky handle
    ctx.fillStyle = kitLight(0.25); ctx.fillRect(-2, -7, len - 36, 3);
    ctx.translate(len, 0);
    if (whisk) {                                   // a balloon of wire loops
      ctx.strokeStyle = KIT_LINE; ctx.lineWidth = 3.6;
      const loops = () => { ctx.beginPath(); for (const h of [6, 12, 17]) { ctx.moveTo(-24, 0); ctx.bezierCurveTo(-10, -h, 18, -h, 18, 0); ctx.bezierCurveTo(18, h, -10, h, -24, 0); } };
      loops(); ctx.stroke(); ctx.strokeStyle = K_STEEL; ctx.lineWidth = 2; loops(); ctx.stroke();
    } else {                                       // a wide flat turner with slots
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-26, -17, 42, 34, 6); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = '#fbf1dc'; for (const y of [-9, 0, 9]) { ctx.beginPath(); roundRectPath(-18, y - 2, 26, 4, 2); ctx.fill(); }
    }
  }
  ctx.restore();
}

// ---------- Proximity Blast: a corn kernel that swells and pops into popcorn, or a shaken soda bottle that fizzes over ----------
function drawKitchenBlast(o, sy) {
  const soda = o.look === 'soda', col = o.kitCol || '#f4c430';
  if (o.phase === 'boom' || o.phase === 'gone') {
    const t = o.phase === 'boom' ? o.t : 0.35 + o.t;
    if (t > 0.65) return;
    const r = o.blast * Math.min(1, t / 0.12), fade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.3;
    ctx.save();
    ctx.globalAlpha = 0.3 * fade; ctx.fillStyle = soda ? '#c8f0d0' : '#fff6dc'; ctx.beginPath(); ctx.arc(o.x, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade; ctx.strokeStyle = soda ? col : '#e8b030'; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4, d = r * (0.3 + 0.6 * ((i * 37) % 10) / 10), x = o.x + Math.cos(a) * d, y = sy + Math.sin(a) * d;
      if (soda) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.stroke(); }
      else { ctx.fillStyle = '#fff6dc'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.arc(x + 3, y - 2, 2.6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    return;
  }
  const blink = o.phase === 'blink';
  if (blink) {
    ctx.save(); ctx.strokeStyle = '#e04a3a'; ctx.globalAlpha = 0.35 + 0.5 * Math.min(1, o.t / 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  const swell = blink ? 1 + 0.1 * Math.sin(o.t * 40) : 1;
  blit(sharedSprite('kblast' + o.look + col, 40, 40, 20, 20, () => {
    if (soda) {                                    // a green glass bottle with a cap and a label
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-3, -15); ctx.lineTo(3, -15); ctx.lineTo(3, -9); ctx.quadraticCurveTo(9, -6, 9, 0); ctx.lineTo(9, 13); ctx.quadraticCurveTo(0, 16, -9, 13); ctx.lineTo(-9, 0); ctx.quadraticCurveTo(-9, -6, -3, -9); ctx.closePath(); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = '#fbf1dc'; ctx.fillRect(-9, 1, 18, 7);
      ctx.fillStyle = '#e04a3a'; ctx.fillRect(-4, -16, 8, 3);
      ctx.fillStyle = kitLight(0.5); ctx.fillRect(-6, -4, 2, 14);
    } else {                                       // a plump yellow corn kernel
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 14); ctx.quadraticCurveTo(-13, 6, -11, -6); ctx.quadraticCurveTo(-8, -15, 0, -15); ctx.quadraticCurveTo(8, -15, 11, -6); ctx.quadraticCurveTo(13, 6, 0, 14); ctx.fill(); kitStroke(1.4);
      ctx.fillStyle = '#fff6dc'; ctx.beginPath(); ctx.ellipse(0, 8, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = kitLight(0.5); ctx.beginPath(); ctx.ellipse(-4, -7, 2.4, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, blink ? Math.sin(o.t * 50) * 0.1 : 0, swell, swell);
}

// ---------- Push Zone (before 700 m only): a draft from the range hood, streaks and a few crumbs; nothing solid ----------
function drawKitchenDraft(o, sy) {
  const dir = -o.side;
  ctx.save();
  ctx.strokeStyle = 'rgba(120,100,80,.5)'; ctx.fillStyle = 'rgba(200,150,90,.7)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 6, run = (o.t * 170 + k * 71) % (W + 60), x0 = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + dir * 18, yy - 5, x0 + dir * 36, yy); ctx.stroke();
    ctx.fillRect(x0 + dir * 46, yy - 1, 3, 2.4);
  }
  ctx.restore();
}

// ---------- Effect Zone: steam rising from a pot, or the chilly mist of the fridge; slows the fall, never hurts ----------
function drawKitchenSteam(o, sy) {
  const x0 = o.x - o.w / 2, y0 = sy - o.h / 2, chill = o.look === 'chill';
  ctx.save();
  ctx.fillStyle = chill ? 'rgba(180,225,250,.14)' : 'rgba(255,255,255,.14)'; ctx.fillRect(x0, y0, o.w, o.h);
  ctx.strokeStyle = chill ? 'rgba(90,150,190,.5)' : 'rgba(150,120,100,.45)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]); ctx.strokeRect(x0, y0, o.w, o.h); ctx.setLineDash([]);
  for (let k = 0; k < 8; k++) {
    const ph = (o.t * 0.5 + k / 8) % 1, x = o.x + Math.sin(k * 2.1 + o.t * 1.5) * o.w * 0.25, y = y0 + o.h - ph * o.h;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5) * 0.7;
    if (chill) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3, y - 0.6, 6, 1.2); ctx.fillRect(x - 0.6, y - 3, 1.2, 6); }
    else { ctx.strokeStyle = 'rgba(140,110,90,.6)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.bezierCurveTo(x - 6, y + 4, x + 6, y - 2, x, y - 8); ctx.stroke(); }
  }
  ctx.restore();
}

// ---------- Spring Line: a strand of spaghetti between two meatballs, or a stretch of melted cheese between two tomatoes ----------
// the strand bounces the plane away; the meatballs (tomatoes) hurt
function drawKitchenNoodle(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, cheese = o.look === 'cheese', col = o.kitCol || '#f0d080';
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9), bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + (cheese ? 8 : 4);
  const line = () => { ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); };
  ctx.save(); ctx.lineCap = 'round';
  line(); ctx.strokeStyle = KIT_LINE; ctx.lineWidth = cheese ? 6.5 : 5; ctx.stroke();
  line(); ctx.strokeStyle = col; ctx.lineWidth = cheese ? 4.5 : 3; ctx.stroke();
  if (!cheese) { ctx.fillStyle = '#d8342a'; for (const t of [0.3, 0.6]) { const x = (1 - t) * (1 - t) * o.x1 + 2 * t * (1 - t) * cx + t * t * o.x2, y = (1 - t) * (1 - t) * (sy + dy1) + 2 * t * (1 - t) * cy + t * t * (sy + dy2); ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); } }   // a drip of sauce
  ctx.restore();
  const ball = sharedSprite('knoodle' + o.look, 24, 24, 12, 12, () => {
    if (cheese) {                                  // a cherry tomato with a green star on top
      ctx.fillStyle = '#e0403a'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); kitStroke(1.3);
      ctx.fillStyle = '#4f9a3a'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = i % 2 ? 1.5 : 4; ctx.lineTo(Math.cos(a) * r, -5 + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = kitLight(0.5); ctx.beginPath(); ctx.arc(-3, 2, 1.8, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a meatball with a little sauce
      ctx.fillStyle = '#8a4a2a'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); kitStroke(1.3);
      ctx.fillStyle = '#5a2a1a'; for (const [x, y] of [[-3, -2], [3, 1], [-1, 4], [2, -4]]) { ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#d8342a'; ctx.beginPath(); ctx.ellipse(0, -4, 5, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  blit(ball, o.x1, sy + dy1); blit(ball, o.x2, sy + dy2);
}
