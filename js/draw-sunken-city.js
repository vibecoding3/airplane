// Paper Nosedive — Art for the sunken city in the Ocean map (v133).
'use strict';

// From 400 to 1,500 m the Ocean's obstacles take sunken-city looks (SEA_CITY_LOOKS / SEA_CITY in obstacles.js): ruins and
// temples first (pale stone, gold, glowing carved symbols), then the dome city from 800 m (glass, brass, warm windows). Every
// look reuses its Ocean obstacle's mechanic and stays inside its hit shape; the water is dark there, so the art is pale and
// lit, with ink outlines like the rest of the sea. Original designs only: no famous sunken cities, no merfolk.
const UC_STONE = '#d8d0c0', UC_STONE_DARK = '#a89c88', UC_GOLD = '#e8c050', UC_GLASS = 'rgba(160,230,255,.45)', UC_BRASS = '#c8a050';
function drawSunkenCity(o, sy) {
  const look = o.look, col = o.seaCol;
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawSunkLedge(-10, l, sy, l, -1, look, o.seaCol); drawSunkLedge(r, W + 10, sy, r, 1, look, o.seaCol);
      break;
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawSunkDoor(-10, l, sy, l, -1, look, o.seaCol); drawSunkDoor(r, W + 10, sy, r, 1, look, o.seaCol);
      break;
    }
    case 'blot': drawSunkRelic(o, sy); break;
    case 'protractor': drawSunkHouse(o, sy); break;
    case 'pencil': drawSunkBar(o, sy); break;
    case 'wad': drawSunkRiser(o, sy); break;
    case 'note': drawSunkLantern(o, sy); break;
    case 'clips': for (const x of clipXs(o)) drawSunkPod(x, sy, o.v > 0 ? 1 : -1, look, col); break;
    case 'starfish': drawSunkDisc(o, sy); break;
    case 'scissors': drawSunkMill(o, sy); break;
    case 'compass': drawSunkClockHand(o, sy); break;
    case 'cutter': drawSunkTrident(o, sy); break;
    case 'glue': drawSunkFountain(o, sy); break;
    case 'zap': drawSunkGlyph(o, sy); break;
    case 'paw': drawSunkArm(o, sy); break;
    case 'mine': drawSunkValve(o, sy); break;
    case 'fan': drawFan(o, sy); drawSunkPumpBubbles(o, sy); break;
    case 'bubbles': drawSunkElevator(o, sy); break;
    case 'band': drawSunkMooring(o, sy); break;
  }
}

// ---------- Gap Wall: fallen marble columns (ruins), or a glass tube walkway with warm lights (domes), 22 thick ----------
function drawSunkLedge(x0, x1, sy, innerX, outDir, look, col) {   // col: its colour variant (v185; fixed before)
  if (x1 - x0 < 1) return;
  ctx.save();
  if (look === 'tubewalk') {
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 11); ctx.fillStyle = col ? hexA(col, 0.6) : UC_GLASS; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(x0, sy - 8, x1 - x0, 3);
    ctx.fillStyle = UC_BRASS; for (let x = innerX + outDir * 18; outDir > 0 ? x < x1 : x > x0; x += outDir * 40) ctx.fillRect(x - 2.5, sy - 11, 5, 22);   // brass rings
    ctx.fillStyle = '#ffd07a'; for (let x = innerX + outDir * 38; outDir > 0 ? x < x1 : x > x0; x += outDir * 40) { ctx.beginPath(); ctx.arc(x, sy + 3, 2.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 11); inkStroke(1.5);
  } else {                                         // a column lying on its side: fluted shaft, a capital at the gap
    ctx.beginPath(); ctx.rect(x0, sy - 9, x1 - x0, 18); ctx.fillStyle = col || UC_STONE; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(120,110,90,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const y of [-5, 0, 5]) { ctx.moveTo(x0, sy + y); ctx.lineTo(x1, sy + y); } ctx.stroke();
    ctx.fillStyle = 'rgba(80,160,110,.45)'; for (let x = innerX + outDir * 30; outDir > 0 ? x < x1 : x > x0; x += outDir * 47) { ctx.beginPath(); ctx.ellipse(x, sy - 7, 9, 3, 0, 0, Math.PI * 2); ctx.fill(); }   // moss
    ctx.restore();
    ctx.beginPath(); ctx.rect(x0, sy - 9, x1 - x0, 18); inkStroke(1.4);
    const cx = outDir > 0 ? innerX : innerX - 12;  // the capital: a wider block with scrolls
    ctx.fillStyle = col || UC_STONE; ctx.beginPath(); ctx.rect(cx, sy - 11, 12, 22); ctx.fill(); inkStroke(1.4);
    ctx.strokeStyle = UC_STONE_DARK; ctx.lineWidth = 1.4; for (const y of [-6, 6]) { ctx.beginPath(); ctx.arc(cx + 6, sy + y, 3, 0, Math.PI * 1.6); ctx.stroke(); }
  }
  ctx.restore();
}

// ---------- Closing Jaws: carved stone temple doors (ruins), or round-windowed dome hatches (domes), 28 thick ----------
function drawSunkDoor(x0, x1, sy, innerX, outDir, look, col) {   // col: its colour variant (v185; fixed before)
  if (x1 - x0 < 1) return;
  const hatch = look === 'hatch';
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fillStyle = col || (hatch ? '#8aa0b8' : '#c8b898'); ctx.fill();
  ctx.save(); ctx.clip();
  if (hatch) {
    ctx.fillStyle = '#ffc24a'; ctx.fillRect(outDir > 0 ? innerX : innerX - 5, sy - 14, 5, 28);           // a warning stripe on the closing edge
    ctx.fillStyle = '#5a6a80'; for (let x = innerX + outDir * 14; outDir > 0 ? x < x1 : x > x0; x += outDir * 10) for (const y of [-11, 11]) { ctx.beginPath(); ctx.arc(x, sy + y, 1.3, 0, Math.PI * 2); ctx.fill(); }
    const px = innerX + outDir * 30; ctx.fillStyle = '#ffd07a'; ctx.beginPath(); ctx.arc(px, sy, 6.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);   // a porthole lit from inside
  } else {
    ctx.strokeStyle = 'rgba(110,95,70,.5)'; ctx.lineWidth = 1.4; ctx.strokeRect(Math.min(x0, x1) + 4, sy - 10, Math.abs(x1 - x0) - 8, 20);
    ctx.strokeStyle = '#7fffd0'; ctx.lineWidth = 1.6; const gx = innerX + outDir * 18;                   // a glowing carved symbol near the edge
    ctx.beginPath(); ctx.moveTo(gx - 4, sy - 6); ctx.lineTo(gx + 4, sy - 6); ctx.lineTo(gx, sy + 6); ctx.closePath(); ctx.moveTo(gx, sy - 2); ctx.lineTo(gx, sy + 2); ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); inkStroke(1.6);
  ctx.restore();
}

// ---------- Static Hazards: an old amphora (ruins) or a glowing glass orb on a stand (domes); the Sunken treasures ----------
// the Sunken treasures, each drawn inside a 20-unit circle (also used by the Collections screen)
const TREASURE_NAMES = { crown: 'Crown', scepter: 'Sceptre', coin: 'Gold coin', chalice: 'Chalice', necklace: 'Pearl necklace',
                         compass: 'Brass compass', musicbox: 'Music box', crystalkey: 'Crystal key' };
function paintTreasure(name) {
  const gold = '#f4c430', goldDark = '#c8902a', gem = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); inkStroke(1); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2); ctx.fill(); };
  if (name === 'crown') {
    ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(-17, 10); ctx.lineTo(-17, -6); ctx.lineTo(-9, 2); ctx.lineTo(0, -12); ctx.lineTo(9, 2); ctx.lineTo(17, -6); ctx.lineTo(17, 10); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = goldDark; ctx.fillRect(-17, 6, 34, 4);
    gem(0, 2, 3.4, '#d8342a'); gem(-10, 4, 2.4, '#3a8ad8'); gem(10, 4, 2.4, '#3fae5a');
    for (const [x, y] of [[-17, -7], [0, -13], [17, -7]]) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); inkStroke(0.8); }
  } else if (name === 'scepter') {
    ctx.save(); ctx.rotate(-0.7);
    ctx.fillStyle = gold; ctx.beginPath(); roundRectPath(-2.5, -6, 5, 24, 2); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = goldDark; for (const y of [2, 10]) ctx.fillRect(-3.5, y, 7, 2.4);
    ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(0, -10, 6, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
    gem(0, -10, 3.6, '#9a5ad8');
    ctx.restore();
  } else if (name === 'coin') {
    ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
    ctx.strokeStyle = goldDark; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = goldDark; ctx.beginPath(); ctx.moveTo(-5, 6); ctx.lineTo(-5, -4); ctx.quadraticCurveTo(0, -10, 5, -4); ctx.lineTo(5, 6); ctx.closePath(); ctx.fill();   // a little tower stamped on it
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-7, -8, 4, 1.8, -0.6, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'chalice') {
    ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(12, -14); ctx.quadraticCurveTo(12, 0, 2, 3); ctx.lineTo(2, 10); ctx.lineTo(9, 15); ctx.lineTo(-9, 15); ctx.lineTo(-2, 10); ctx.lineTo(-2, 3); ctx.quadraticCurveTo(-12, 0, -12, -14); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    gem(0, -7, 2.8, '#d8342a');
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-9, -12, 2, 8);
  } else if (name === 'necklace') {
    ctx.strokeStyle = '#c8b8a0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -4, 14, 0.15, Math.PI - 0.15); ctx.stroke();
    for (let i = 0; i <= 10; i++) { const a = 0.15 + i / 10 * (Math.PI - 0.3); ctx.fillStyle = '#fbf6ee'; ctx.beginPath(); ctx.arc(Math.cos(a) * 14, -4 + Math.sin(a) * 14, 2.8, 0, Math.PI * 2); ctx.fill(); inkStroke(0.8); }
    ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(5, 13); ctx.lineTo(0, 18); ctx.lineTo(-5, 13); ctx.closePath(); ctx.fill(); inkStroke(1);
  } else if (name === 'compass') {
    ctx.fillStyle = UC_BRASS; ctx.beginPath(); ctx.arc(0, 2, 16, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
    ctx.beginPath(); ctx.arc(0, -15, 3, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
    ctx.fillStyle = '#fbf6ee'; ctx.beginPath(); ctx.arc(0, 2, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8342a'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(3, 2); ctx.lineTo(-3, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(3, 2); ctx.lineTo(-3, 2); ctx.closePath(); ctx.fill();
  } else if (name === 'musicbox') {
    ctx.fillStyle = '#a8603a'; ctx.beginPath(); roundRectPath(-15, -4, 30, 18, 3); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = '#c8784a'; ctx.beginPath(); ctx.moveTo(-15, -4); ctx.lineTo(-11, -16); ctx.lineTo(15, -16); ctx.lineTo(15, -4); ctx.closePath(); ctx.fill(); inkStroke(1.2);   // the open lid
    ctx.fillStyle = UC_GOLD; ctx.fillRect(-15, 2, 30, 2.5);
    ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(-3, -14); ctx.lineTo(3, -15); ctx.lineTo(3, -10); ctx.stroke();   // a little note
    ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(-4.5, -9, 1.6, 0, Math.PI * 2); ctx.arc(1.5, -10, 1.6, 0, Math.PI * 2); ctx.fill();
  } else {                                         // a crystal key: a gold ring and stem, a pale blue crystal bow
    ctx.fillStyle = gold; ctx.beginPath(); roundRectPath(-2, -2, 4, 18, 1.5); ctx.fill(); inkStroke(1.1);
    ctx.fillRect(2, 10, 5, 2.5); ctx.fillRect(2, 14, 4, 2.5);
    ctx.fillStyle = '#9fe8ff'; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(8, -9); ctx.lineTo(0, 0); ctx.lineTo(-8, -9); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(3, -10); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill();
  }
}
function drawSunkRelic(o, sy) {
  if (o.treasure) { const k = o.r * 0.88 / 20; blit(sharedSprite('treasure-' + o.treasure, 48, 48, 24, 24, () => paintTreasure(o.treasure)), o.x, sy, 0, k, k); return; }
  const R = o.r * 0.88, col = o.seaCol || '#d0784a';
  blit(ownSprite(o, 'sprU', R * 2 + 12, R * 2 + 12, R + 6, R + 6, () => {
    if (o.look === 'orb') {                        // a glowing glass orb on a little brass stand
      ctx.fillStyle = hexA(col, 0.3); ctx.beginPath(); ctx.arc(0, -R * 0.05, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -R * 0.1, R * 0.75, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, -R * 0.1, R * 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = UC_BRASS; ctx.beginPath(); ctx.moveTo(-R * 0.45, R * 0.95); ctx.lineTo(R * 0.45, R * 0.95); ctx.lineTo(R * 0.25, R * 0.6); ctx.lineTo(-R * 0.25, R * 0.6); ctx.closePath(); ctx.fill(); inkStroke(1.1);
    } else {                                       // an amphora: a narrow neck, two handles, a pattern band
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-R * 0.2, -R * 0.95); ctx.lineTo(R * 0.2, -R * 0.95); ctx.lineTo(R * 0.2, -R * 0.6);
      ctx.quadraticCurveTo(R * 0.8, -R * 0.4, R * 0.6, R * 0.4); ctx.lineTo(R * 0.15, R * 0.95); ctx.lineTo(-R * 0.15, R * 0.95); ctx.lineTo(-R * 0.6, R * 0.4);
      ctx.quadraticCurveTo(-R * 0.8, -R * 0.4, -R * 0.2, -R * 0.6); ctx.closePath(); ctx.fill(); inkStroke(1.4);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * R * 0.2, -R * 0.8); ctx.quadraticCurveTo(s * R * 0.65, -R * 0.85, s * R * 0.5, -R * 0.4); ctx.stroke(); }
      ctx.fillStyle = '#2a2420'; ctx.fillRect(-R * 0.62, -R * 0.05, R * 1.24, R * 0.18);
      ctx.fillStyle = col; for (let x = -R * 0.5; x < R * 0.5; x += R * 0.25) ctx.fillRect(x, -R * 0.02, R * 0.1, R * 0.12);
    }
  }), o.x, sy);
}

// ---------- Wall Bulge: a huge stone face (ruins) or half a glass dome house with lit windows (domes), an exact half-disc ----------
function drawSunkHouse(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 6, i = -o.side, dome = o.look === 'domehouse';
  const s = ownSprite(o, 'sprU', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = dome ? 'rgba(150,215,240,.75)' : UC_STONE; ctx.fill();
    ctx.save(); ctx.clip();
    if (dome) {                                    // brass ribs, warm windows, a little garden of kelp inside
      ctx.strokeStyle = UC_BRASS; ctx.lineWidth = 3; ctx.beginPath();
      for (let k = -2; k <= 2; k++) { ctx.moveTo(0, -o.r); ctx.quadraticCurveTo(i * k * o.r * 0.45, 0, 0, o.r); }
      ctx.moveTo(-o.r, 0); ctx.lineTo(o.r, 0); ctx.stroke();
      ctx.fillStyle = '#ffd07a'; for (const [a, d] of [[-0.6, 0.5], [0.3, 0.6], [0.9, 0.4], [-1.2, 0.7]]) ctx.fillRect(i * Math.cos(a) * o.r * d - 5, Math.sin(a) * o.r * d - 4, 10, 8);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-i * o.r * 0.1, -o.r * 0.5, o.r * 0.5, o.r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a calm stone face looking out into the water, cracked and mossy
      const fx = i * o.r * 0.5;
      ctx.fillStyle = 'rgba(80,160,110,.45)'; ctx.beginPath(); ctx.arc(-i * o.r * 0.2, -o.r * 0.75, o.r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = UC_STONE_DARK; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
      for (const y of [-0.28, 0.28]) { ctx.moveTo(fx - i * 8, y * o.r - 2); ctx.quadraticCurveTo(fx, y * o.r - 7, fx + i * 8, y * o.r - 2); }   // closed eyes
      ctx.moveTo(fx + i * 4, -0.05 * o.r); ctx.lineTo(fx + i * 14, 0.02 * o.r); ctx.lineTo(fx + i * 4, 0.1 * o.r);                         // the nose
      ctx.stroke();
      ctx.strokeStyle = 'rgba(90,80,60,.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(i * o.r * 0.1, -o.r * 0.9); ctx.lineTo(i * o.r * 0.25, -o.r * 0.5); ctx.lineTo(i * o.r * 0.15, -o.r * 0.3); ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); inkStroke(1.8);
  });
  blit(s, cx, sy);
}

// ---------- Bouncing Slider: a long stone oar (ruins), or a little tram car gliding along (domes), 13 thick ----------
function drawSunkBar(o, sy) {
  const L = o.len / 2, col = o.seaCol || '#ffc24a', tram = o.look === 'tramcar';
  blit(ownSprite(o, 'sprU', o.len + 8, 22, L + 4, 11, () => {
    if (tram) {
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-L, -6.5, o.len, 13, 6); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = '#2a4a6a'; for (let x = -L + 10; x < L - 14; x += 16) { ctx.beginPath(); roundRectPath(x, -4, 11, 5, 2); ctx.fill(); }
      ctx.fillStyle = '#ffd07a'; for (let x = -L + 12; x < L - 14; x += 32) ctx.fillRect(x, -3, 4, 3);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(L - 5, 1, 2.2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = UC_STONE; ctx.beginPath(); roundRectPath(-L, -3.5, o.len * 0.7, 7, 3); ctx.fill(); inkStroke(1.2);
      ctx.beginPath(); ctx.ellipse(L - o.len * 0.16, 0, o.len * 0.16, 6.5, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
      ctx.fillStyle = 'rgba(80,160,110,.5)'; ctx.beginPath(); ctx.ellipse(L - o.len * 0.2, 2, 8, 2.4, 0.2, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.a, o.vx < 0 && tram ? -1 : 1, 1);
}

// the Dome inventions (v173): brass-and-glass gadgets of the dome city, riding up like its air capsules, each drawn
// inside a 20-unit circle (also used by the Collections screen)
const INVENTION_NAMES = { helmet: 'Diving helmet', watch: 'Pocket watch', spyglass: 'Spyglass', snowglobe: 'Snow globe',
                          toysub: 'Toy submarine', lantern: 'Glass lantern', windupfish: 'Wind-up fish', gramophone: 'Gramophone' };
function paintInvention(name) {
  const brass = UC_BRASS, dark = '#8a6a30', glass = 'rgba(170,235,255,.85)', shine = () => { ctx.fillStyle = 'rgba(255,255,255,.7)'; };
  const circle = (x, y, r, c, w = 1.3) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); inkStroke(w); };
  if (name === 'helmet') {                         // a round brass diving helmet with a front porthole and bolts
    ctx.fillStyle = dark; ctx.beginPath(); roundRectPath(-14, 9, 28, 8, 3); ctx.fill(); inkStroke(1.3);
    circle(0, -2, 15, brass, 1.5);
    circle(0, -1, 8, glass, 1.3);
    ctx.strokeStyle = dark; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-8, -1); ctx.lineTo(8, -1); ctx.moveTo(0, -9); ctx.lineTo(0, 7); ctx.stroke();
    for (const [x, y] of [[-12, -9], [12, -9], [-13, 5], [13, 5]]) circle(x, y, 1.6, dark, 0.7);
    shine(); ctx.beginPath(); ctx.ellipse(-3, -4, 2, 3, -0.5, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'watch') {                   // an open pocket watch on a short chain
    ctx.strokeStyle = brass; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(-6, -18, 4, 0, Math.PI * 2); ctx.stroke();
    circle(0, -15, 3, brass, 1);
    circle(0, 2, 16, brass, 1.5);
    circle(0, 2, 12.5, '#fbf6ee', 1);
    ctx.fillStyle = COL.ink; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.fillRect(Math.cos(a) * 10.5 - 0.6, 2 + Math.sin(a) * 10.5 - 0.6, 1.2, 1.2); }
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -6); ctx.moveTo(0, 2); ctx.lineTo(6, 4); ctx.stroke();
  } else if (name === 'spyglass') {                // a telescope pulled out in three brass sections, on the diagonal
    ctx.save(); ctx.rotate(-0.6);
    ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); roundRectPath(-18, -5, 14, 10, 2); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = brass; ctx.beginPath(); roundRectPath(-5, -4, 12, 8, 2); ctx.fill(); inkStroke(1.2);
    ctx.beginPath(); roundRectPath(6, -3, 12, 6, 2); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = dark; ctx.fillRect(-6, -5, 2, 10); ctx.fillRect(5, -4, 2, 8);
    circle(18.5, 0, 2.6, glass, 1);
    ctx.restore();
  } else if (name === 'snowglobe') {               // a glass globe with a tiny dome house inside, on a brass base
    ctx.fillStyle = brass; ctx.beginPath(); ctx.moveTo(-13, 17); ctx.lineTo(13, 17); ctx.lineTo(10, 9); ctx.lineTo(-10, 9); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    circle(0, -3, 14, 'rgba(200,240,255,.7)', 1.5);
    ctx.fillStyle = '#9fe0ff'; ctx.beginPath(); ctx.arc(0, 6, 7, Math.PI, 0); ctx.closePath(); ctx.fill(); inkStroke(1);
    ctx.fillStyle = '#ffd07a'; ctx.fillRect(-1.5, 2, 3, 4);
    ctx.fillStyle = '#ffffff'; for (const [x, y] of [[-7, -9], [5, -11], [8, -3], [-4, -3], [1, -6]]) { ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI * 2); ctx.fill(); }
    shine(); ctx.beginPath(); ctx.ellipse(-7, -8, 2, 4, 0.4, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'toysub') {                  // a little yellow wind-up submarine with a key and a periscope
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(3, -8); ctx.lineTo(3, -15); ctx.lineTo(8, -15); ctx.stroke();
    ctx.fillStyle = '#f4c430'; ctx.beginPath(); roundRectPath(-6, -10, 12, 6, 2); ctx.fill(); inkStroke(1.1);
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 9, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.5);
    for (const x of [-7, 0, 7]) circle(x, 0, 2.6, glass, 1);
    ctx.fillStyle = brass; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-22, -5); ctx.lineTo(-22, 5); ctx.closePath(); ctx.fill(); inkStroke(1);   // the propeller
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 13); ctx.stroke();
    ctx.fillStyle = brass; ctx.beginPath(); ctx.ellipse(-4, 14, 4, 2.2, 0, 0, Math.PI * 2); ctx.ellipse(4, 14, 4, 2.2, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1);   // the key
  } else if (name === 'lantern') {                 // a glass storm lantern with a brass cap, a ring and a warm flame
    ctx.fillStyle = 'rgba(255,200,100,.35)'; ctx.beginPath(); ctx.arc(0, 2, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, -16, 4, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = brass; ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(0, -15); ctx.lineTo(9, -8); ctx.closePath(); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = 'rgba(220,245,255,.75)'; ctx.beginPath(); roundRectPath(-8, -8, 16, 18, 4); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#ffb04a'; ctx.beginPath(); ctx.moveTo(0, -4); ctx.quadraticCurveTo(5, 3, 0, 6); ctx.quadraticCurveTo(-5, 3, 0, -4); ctx.fill();
    ctx.fillStyle = '#fff2b0'; ctx.beginPath(); ctx.ellipse(0, 3, 1.6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = brass; ctx.beginPath(); roundRectPath(-10, 10, 20, 5, 2); ctx.fill(); inkStroke(1.2);
  } else if (name === 'windupfish') {              // a tin fish with riveted plates, a glass eye and a wind-up key
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-19, -8); ctx.lineTo(-17, 0); ctx.lineTo(-19, 8); ctx.closePath(); ctx.fill(); inkStroke(1.2);
    ctx.beginPath(); ctx.ellipse(1, 0, 14, 9, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.5);
    ctx.strokeStyle = '#8a94a0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(-3, 8); ctx.moveTo(4, -9); ctx.lineTo(4, 9); ctx.stroke();
    ctx.fillStyle = '#8a94a0'; for (const [x, y] of [[-3, -5], [-3, 5], [4, -6], [4, 6]]) { ctx.beginPath(); ctx.arc(x, y, 0.9, 0, Math.PI * 2); ctx.fill(); }
    circle(9, -2, 2.8, '#7fe8ff', 1);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, -13); ctx.stroke();
    ctx.fillStyle = brass; ctx.beginPath(); ctx.ellipse(-4, -14, 4, 2.2, 0, 0, Math.PI * 2); ctx.ellipse(4, -14, 4, 2.2, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
  } else {                                         // a gramophone: a wooden box, a turntable and a big brass horn
    ctx.fillStyle = '#a8603a'; ctx.beginPath(); roundRectPath(-15, 6, 22, 11, 2); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.ellipse(-4, 6, 10, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(3, 6); ctx.quadraticCurveTo(6, -2, 2, -6); ctx.stroke();
    ctx.fillStyle = brass; ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(-2, -8); ctx.quadraticCurveTo(4, -20, 19, -16); ctx.quadraticCurveTo(14, -6, 18, 4); ctx.quadraticCurveTo(8, -2, 2, -4); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(18.5, -6, 2.4, 10, 0.15, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Rising Projectile: a lantern float bobbing up (ruins), or an air capsule shooting up (domes) ----------
function drawSunkRiser(o, sy) {
  if (o.invention) { const k = o.r * 0.95 / 20; blit(sharedSprite('invention-' + o.invention, 48, 48, 24, 24, () => paintInvention(o.invention)), o.x, sy, 0, k, k); return; }
  const s = o.r / 16, capsule = o.look === 'capsule', col = o.seaCol || '#ffb04a';
  blit(sharedSprite('ucrise' + o.look + col, 40, 40, 20, 20, () => {
    if (capsule) {                                 // a steel capsule with a porthole and a bubble trail
      ctx.fillStyle = 'rgba(235,250,255,.7)'; for (const [y, r] of [[13, 2.4], [17, 1.8]]) { ctx.beginPath(); ctx.arc(0, y, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-8, -13, 16, 24, 8); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = '#7fe8ff'; ctx.beginPath(); ctx.arc(0, -3, 4, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
      ctx.fillStyle = '#e04a3a'; ctx.fillRect(-8, 5, 16, 3);
    } else {                                       // a paper-and-brass lantern float glowing warm
      ctx.fillStyle = 'rgba(255,200,100,.35)'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.strokeStyle = 'rgba(160,80,20,.5)'; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [-5, 0, 5]) { ctx.moveTo(x, -12); ctx.quadraticCurveTo(x * 1.6, 0, x, 12); } ctx.stroke();
      ctx.fillStyle = UC_BRASS; ctx.fillRect(-5, -15, 10, 4); ctx.fillRect(-5, 11, 10, 4);
    }
  }), o.x, sy, capsule ? 0 : o.rot * 0.2, s, s);
}

// ---------- Drifting Swarm: lanterns drifting down (ruins), or little lit mail pods (domes), filling a 42-unit square ----------
function drawSunkLantern(o, sy) {
  const col = o.seaCol || '#ff8a5a', pod = o.look === 'mailpod';
  blit(sharedSprite('uclant' + o.look + col, 48, 48, 24, 24, () => {
    if (pod) {                                     // a round glass pod with a letter inside and a little propeller
      ctx.fillStyle = hexA(col, 0.35); ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(200,240,255,.85)'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = '#fbf6ee'; ctx.beginPath(); ctx.rect(-8, -5, 16, 10); ctx.fill(); inkStroke(1);
      ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(0, 1); ctx.lineTo(8, -5); inkStroke(1);
      ctx.fillStyle = UC_BRASS; ctx.beginPath(); ctx.ellipse(0, 18, 7, 2.4, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(0.9);
    } else {                                       // a round paper lantern glowing warm, a brass cap and a tassel
      ctx.fillStyle = hexA(col, 0.3); ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 17, 15, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.strokeStyle = 'rgba(120,40,10,.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const y of [-8, 0, 8]) { ctx.moveTo(-15, y); ctx.quadraticCurveTo(0, y + 3, 15, y); } ctx.stroke();
      ctx.fillStyle = UC_BRASS; ctx.fillRect(-7, -18, 14, 4); ctx.fillRect(-7, 14, 14, 4);
      ctx.strokeStyle = '#d8342a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, 21); ctx.stroke();
    }
  }), o.x, sy, o.rot * 0.5);
}

// ---------- Conveyor: a line of message capsules (ruins) or tram pods (domes), each 34 x 12 ----------
function drawSunkPod(x, sy, dir, look, col = '#ffc24a') {
  blit(sharedSprite('ucpod' + look + col + dir, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    if (look === 'trampods') {
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-17, -6, 34, 12, 6); ctx.fill(); inkStroke(1.3);
      ctx.fillStyle = '#2a4a6a'; ctx.beginPath(); roundRectPath(-4, -4, 16, 6, 3); ctx.fill();
      ctx.fillStyle = '#ffd07a'; ctx.fillRect(-1, -3, 3, 3);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(15, 1, 1.6, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a rolled scroll in a brass-capped glass tube
      ctx.fillStyle = 'rgba(200,240,255,.8)'; ctx.beginPath(); roundRectPath(-15, -5.5, 30, 11, 5); ctx.fill(); inkStroke(1.2);
      ctx.fillStyle = col; ctx.fillRect(-10, -3.5, 20, 7);
      ctx.fillStyle = UC_BRASS; ctx.fillRect(-17, -6, 4, 12); ctx.fillRect(13, -6, 4, 12);
    }
  }), x, sy);
}

// ---------- Spinning Drifter: a stone calendar wheel (ruins) or a giant gold coin (both), filling a 20-unit circle ----------
function drawSunkDisc(o, sy) {
  const coin = o.look === 'coin', col = o.seaCol;
  blit(sharedSprite('ucdisc' + o.look + col, 46, 46, 23, 23, () => {
    ctx.fillStyle = coin ? '#f4c430' : col || UC_STONE; ctx.beginPath(); ctx.arc(0, 0, 19.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
    if (coin) {
      ctx.strokeStyle = '#c8902a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#c8902a'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(8, 6); ctx.lineTo(-8, 6); ctx.closePath(); ctx.fill();
    } else {                                       // rings of carved marks and a sun at the middle
      ctx.strokeStyle = UC_STONE_DARK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18); } ctx.stroke();
      ctx.fillStyle = '#7fffd0'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot);
}

// ---------- Spinning Blades: two water-mill paddles (ruins) or two dome fan blades (domes), spinning and opening ----------
function drawSunkMill(o, sy) {
  const fan = o.look === 'fanprop';
  const blade = sharedSprite('ucmill' + o.look, 106, 26, 34, 13, () => {
    if (fan) {
      ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(30, -6, 66, -1); ctx.lineTo(66, 2); ctx.quadraticCurveTo(30, 4, -4, 2); ctx.closePath(); ctx.fill(); inkStroke(1.2);
    } else {
      ctx.fillStyle = '#a8805a'; ctx.fillRect(-4, -2, 40, 4); ctx.beginPath(); ctx.rect(36, -4, 30, 8); ctx.fill(); inkStroke(1.2);
      ctx.strokeStyle = 'rgba(60,40,20,.5)'; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [44, 52, 60]) { ctx.moveTo(x, -4); ctx.lineTo(x, 4); } ctx.stroke();
    }
    ctx.fillStyle = fan ? UC_BRASS : UC_STONE; ctx.beginPath(); ctx.arc(-22, 0, 9.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);   // the counterweight behind the hub
    ctx.fillStyle = fan ? '#c9ced6' : '#a8805a'; ctx.fillRect(-13, -2, 10, 4);
  });
  for (const s of [-1, 1]) blit(blade, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = UC_BRASS; ctx.beginPath(); ctx.arc(o.x, sy, 4, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
}

// ---------- Sweeping Arm: the hand of a sunken clock tower turning round its face, or a harbour crane jib (domes) ----------
function drawSunkClockHand(o, sy) {
  const hh = o.hh || 7, crane = o.look === 'crane';
  if (!crane) {                                    // the clock face behind it (pale, far less solid than the hand)
    ctx.fillStyle = 'rgba(240,232,214,.08)'; ctx.beginPath(); ctx.arc(o.x, sy, o.L + 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(240,232,214,.4)'; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ctx.fillRect(o.x + Math.cos(a) * (o.L + 1) - 2, sy + Math.sin(a) * (o.L + 1) - 2, 4, 4); }
  }
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.ang);
  if (crane) {                                     // a yellow lattice jib with a hook at the end
    ctx.fillStyle = o.seaCol || '#ffc24a'; ctx.beginPath(); ctx.rect(4, -hh + 1, o.L - 8, (hh - 1) * 2); ctx.fill(); inkStroke(1.2);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 8; x < o.L - 8; x += 8) { ctx.moveTo(x, -hh + 1); ctx.lineTo(x + 4, hh - 1); } ctx.stroke();
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.arc(o.L - 4, 0, hh - 1, 0, Math.PI * 2); ctx.fill(); inkStroke(1.1);
  } else {                                         // a black iron hand with an arrow tip
    ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(4, -3); ctx.lineTo(o.L - 14, -3); ctx.lineTo(o.L - 14, -hh); ctx.lineTo(o.L, 0); ctx.lineTo(o.L - 14, hh); ctx.lineTo(o.L - 14, 3); ctx.lineTo(4, 3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8e0d0'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = UC_BRASS; ctx.beginPath(); ctx.arc(o.x, sy, 8.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.5);
}

// ---------- Wall Piston: a statue's trident thrusting out of the wall (ruins), or a gangplank sliding out (domes) ----------
function drawSunkTrident(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, plank = o.look === 'gangplank';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    const tip = h + e;
    if (plank) {
      ctx.fillStyle = '#a8805a'; ctx.beginPath(); ctx.rect(h - 6, -5.5, e + 6, 11); ctx.fill(); inkStroke(1.2);
      ctx.strokeStyle = 'rgba(60,40,20,.45)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = h + 10; x < tip - 4; x += 14) { ctx.moveTo(x, -5.5); ctx.lineTo(x, 5.5); } ctx.stroke();
    } else {                                       // a gold shaft and three prongs
      ctx.fillStyle = UC_GOLD; ctx.fillRect(h - 6, -2, e - 8, 4); ctx.beginPath(); ctx.rect(h - 6, -2, e - 8, 4); inkStroke(1);
      ctx.beginPath(); ctx.moveTo(tip - 14, -5.5); ctx.lineTo(tip - 14, 5.5); ctx.moveTo(tip - 14, -5); ctx.lineTo(tip - 2, -5); ctx.moveTo(tip - 14, 0); ctx.lineTo(tip, 0); ctx.moveTo(tip - 14, 5); ctx.lineTo(tip - 2, 5);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 3.4; ctx.stroke(); ctx.strokeStyle = UC_GOLD; ctx.lineWidth = 1.8; ctx.stroke();
    }
  }
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 4); ctx.fillStyle = plank ? '#8aa0b8' : UC_STONE; ctx.fill(); inkStroke(1.6);   // a stone (or steel) block in the wall
  ctx.fillStyle = '#1a2028'; ctx.fillRect(h - 6, -7, 6, 14);
  if (!plank) { ctx.strokeStyle = '#7fffd0'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(24, 0, 5, 0, Math.PI * 2); ctx.moveTo(19, 0); ctx.lineTo(29, 0); ctx.stroke(); }
  ctx.restore();
}

// ---------- Wall Turret: a stone fish fountain spitting water bolts (ruins), or a dome cannon firing bubble shots (domes) ----------
function drawSunkFountain(o, sy) {
  const dir = inward(o), cannon = o.look === 'domecannon', col = o.seaCol || (cannon ? '#8aa0b8' : UC_STONE);   // its colour (v183)
  for (const b of o.blobs) {
    ctx.fillStyle = 'rgba(200,240,255,.35)'; ctx.beginPath(); ctx.arc(b.x - dir * b.r, sy, b.r * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cannon ? 'rgba(220,245,255,.5)' : '#8ad0ff'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = cannon ? '#ffffff' : '#2a6a9a'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, sy - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
  }
  const head = sharedSprite('ucfount' + o.look + dir + col, 176, 52, 88, 26, () => {
    ctx.scale(dir, 1);
    if (cannon) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(14, 0, 13, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-4, 11); ctx.lineTo(-4, -11); ctx.closePath(); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = '#c9ced6'; ctx.beginPath(); roundRectPath(22, -6, 56, 12, 4); ctx.fill(); inkStroke(1.3);
      ctx.fillStyle = UC_BRASS; for (const x of [34, 54, 70]) ctx.fillRect(x, -6, 3, 12);
      ctx.fillStyle = '#ffd07a'; ctx.beginPath(); ctx.arc(10, -3, 3, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a carved fish, mouth open toward the middle, scales and a fin
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-4, -11); ctx.lineTo(16, -11); ctx.quadraticCurveTo(54, -14, 72, -5); ctx.lineTo(78, -3); ctx.lineTo(78, 3); ctx.lineTo(72, 5); ctx.quadraticCurveTo(54, 14, 16, 11); ctx.lineTo(-4, 11); ctx.closePath(); ctx.fill(); inkStroke(1.4);
      ctx.strokeStyle = UC_STONE_DARK; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = 22; x < 56; x += 8) for (const y of [-4, 4]) { ctx.moveTo(x, y - 3); ctx.arc(x, y, 3, -Math.PI / 2, Math.PI / 2); } ctx.stroke();
      ctx.fillStyle = '#2a2420'; ctx.beginPath(); ctx.arc(64, -5, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(80,160,110,.5)'; ctx.beginPath(); ctx.ellipse(10, -9, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#ffffff' : '#8ad0ff';
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 77, sy, 3.6, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Charged Beam: a stone slab whose carved symbols light up and fire (ruins), or a sparking power cable (domes) ----------
function drawSunkGlyph(o, sy) {
  const x0 = ZAP_BODY, L = o.len, cable = o.look === 'cable', col = o.seaCol || (cable ? '#ffe060' : '#7fffd0');
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 0.3 + 0.6 * Math.min(1, o.t / 0.7); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke(); ctx.restore();
  } else if (o.phase === 'zap') {
    if (cable) {
      const pts = []; for (let x = x0; x < x0 + L; x += 10) pts.push([x, x === x0 ? 0 : rand(-5, 5)]); pts.push([x0 + L, 0]);
      const bolt = () => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      bolt(); ctx.strokeStyle = hexA(col, 0.4); ctx.lineWidth = 9; ctx.stroke();
      bolt(); ctx.strokeStyle = col; ctx.lineWidth = 3.4; ctx.stroke();
      bolt(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
    } else {
      ctx.fillStyle = hexA(col, 0.4); ctx.fillRect(x0, -6, L, 12);
      ctx.fillStyle = col; ctx.fillRect(x0, -3, L, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x0, -1, L, 2);
    }
  }
  if (cable) {                                     // a fat cable running along the wall to a frayed end
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-6, 2); ctx.quadraticCurveTo(x0 * 0.5, -6, x0 - 6, 0); ctx.stroke();
    ctx.strokeStyle = '#3a3a42'; ctx.lineWidth = 7.5; ctx.stroke();
    ctx.strokeStyle = '#d0784a'; ctx.lineWidth = 1.4; ctx.beginPath(); for (const a of [-0.6, 0, 0.6]) { ctx.moveTo(x0 - 6, 0); ctx.lineTo(x0 - 6 + Math.cos(a) * 7, Math.sin(a) * 7); } ctx.stroke();
  } else {                                         // a carved stone slab, its symbols glowing when charged
    ctx.fillStyle = UC_STONE; ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 3); ctx.fill(); inkStroke(1.4);
    ctx.strokeStyle = o.phase === 'rest' ? UC_STONE_DARK : col; ctx.lineWidth = 1.6; ctx.beginPath();
    for (const x of [10, 28, 46]) { ctx.moveTo(x - 4, -5); ctx.lineTo(x + 4, -5); ctx.lineTo(x, 5); ctx.closePath(); }
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- Telegraphed Sweep: a stone statue arm swinging out (ruins), or a brass mechanical claw (domes), after a wedge ----------
function drawSunkArm(o, sy) {
  const claw = o.look === 'claw';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#1a2028'; ctx.beginPath(); ctx.ellipse(2, 0, 7, 16, 0, 0, Math.PI * 2); ctx.fill();
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save(); ctx.strokeStyle = claw ? '#ffc24a' : '#e8e0d0'; ctx.globalAlpha = 0.35 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke(); ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    ctx.fillStyle = claw ? UC_BRASS : UC_STONE; ctx.beginPath(); roundRectPath(-8, -10, len - 2, 20, claw ? 4 : 9); ctx.fill(); inkStroke(1.4);
    if (claw) { ctx.fillStyle = '#8aa0b8'; for (let x = 10; x < len - 30; x += 24) { ctx.beginPath(); ctx.arc(x, 0, 5, 0, Math.PI * 2); ctx.fill(); inkStroke(1); } }
    else { ctx.strokeStyle = 'rgba(110,95,70,.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(len * 0.45, -8); ctx.lineTo(len * 0.5, 0); ctx.lineTo(len * 0.44, 8); ctx.stroke(); }
    ctx.translate(len, 0);
    if (claw) {                                    // three hooked fingers
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
      const fingers = () => { ctx.beginPath(); for (const a of [-0.8, 0, 0.8]) { ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a) * 13, Math.sin(a) * 13, Math.cos(a + 0.45) * 16, Math.sin(a + 0.45) * 16); } };
      fingers(); ctx.stroke(); ctx.strokeStyle = UC_BRASS; ctx.lineWidth = 3.6; fingers(); ctx.stroke();
      ctx.fillStyle = '#8aa0b8'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);   // the wrist joint
    } else {                                       // a stone hand, fingers together
      ctx.fillStyle = UC_STONE; ctx.beginPath(); ctx.ellipse(0, 0, 15, 13, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.strokeStyle = UC_STONE_DARK; ctx.lineWidth = 1.4; ctx.beginPath(); for (const y of [-5, 0, 5]) { ctx.moveTo(2, y); ctx.lineTo(13, y); } ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------- Proximity Blast: a bubble mine wobbling (ruins) or a red pressure valve (domes), bursting in a ring of bubbles ----------
function drawSunkValve(o, sy) {
  const valve = o.look === 'valve';
  if (o.phase === 'boom' || (o.phase === 'gone' && o.t < BOOM_END - 0.35)) {
    const T = o.phase === 'boom' ? o.t : 0.35 + o.t;
    drawBoom(o, sy, T);
    return;
  }
  if (o.phase === 'gone') return;
  if (o.phase === 'blink') {
    ctx.save(); ctx.strokeStyle = `rgba(230,60,50,${0.35 + 0.5 * Math.min(1, o.t / 0.6)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  const wob = o.phase === 'blink' ? 1 + 0.1 * Math.sin(o.t * 40) : 1 + 0.03 * Math.sin(time * 3 + o.x);
  blit(sharedSprite('ucvalve' + o.look, 40, 40, 20, 20, () => {
    if (valve) {                                   // a pipe stub with a red wheel valve and a gauge
      ctx.fillStyle = '#8aa0b8'; ctx.beginPath(); roundRectPath(-6, -2, 12, 16, 3); ctx.fill(); inkStroke(1.2);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -5, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#e04a3a'; ctx.lineWidth = 4; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-10, -5); ctx.lineTo(10, -5); ctx.moveTo(0, -15); ctx.lineTo(0, 5); ctx.stroke();
      ctx.fillStyle = '#fbf6ee'; ctx.beginPath(); ctx.arc(0, -5, 3.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
    } else {                                       // a big trembling bubble with a stone weight
      ctx.fillStyle = 'rgba(180,235,255,.45)'; ctx.beginPath(); ctx.arc(0, -2, 13, 0, Math.PI * 2); ctx.fill(); inkStroke(1.5);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.ellipse(-5, -8, 4, 2, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = UC_STONE; ctx.beginPath(); roundRectPath(-5, 10, 10, 6, 2); ctx.fill(); inkStroke(1);
    }
  }), o.x, sy, 0, wob, wob);
  const on = o.phase === 'blink' ? Math.floor(o.t * 12) % 2 === 0 : Math.floor(o.t * 1.5) % 2 === 0;
  ctx.fillStyle = on ? '#ff4a3a' : '#7a2a24'; ctx.beginPath(); ctx.arc(o.x + 9, sy + 8, 2.4, 0, Math.PI * 2); ctx.fill();
}

// ---------- Push Zone (before 700 m): the current of a pumping station, carrying bubbles along with the streaks ----------
function drawSunkPumpBubbles(o, sy) {
  const dir = -o.side;
  ctx.save(); ctx.strokeStyle = 'rgba(230,248,255,.75)'; ctx.lineWidth = 1.2;
  for (let k = 0; k < 6; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 6, run = (o.t * 190 + k * 83) % (W + 60), x = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.arc(x, yy + Math.sin(o.t * 4 + k) * 3, 2 + (k % 3), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Effect Zone: an elevator shaft of rising bubbles between two brass rails; slows the fall, never hurts ----------
function drawSunkElevator(o, sy) {
  const x0 = o.x - o.w / 2, y0 = sy - o.h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(160,230,255,.1)'; ctx.fillRect(x0, y0, o.w, o.h);
  ctx.strokeStyle = 'rgba(200,160,80,.6)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + o.h); ctx.moveTo(x0 + o.w, y0); ctx.lineTo(x0 + o.w, y0 + o.h); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(240,252,255,.8)'; ctx.lineWidth = 1.3;
  for (let k = 0; k < 14; k++) {
    const ph = (o.t * 0.9 + k / 14) % 1, by = y0 + o.h - ph * o.h, bx = o.x + Math.sin(k * 2.3 + o.t * 2) * o.w * 0.3;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5);
    ctx.beginPath(); ctx.arc(bx, by, 2 + (k % 4), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Spring Line: a mooring rope between two stone posts (ruins), or a glowing cable between two buoys (domes) ----------
function drawSunkMooring(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, glow = o.look === 'glowcable', col = o.seaCol || '#c9a66b';
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9), bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + 4;
  const line = () => { ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); };
  ctx.save(); ctx.lineCap = 'round';
  if (glow) { line(); ctx.strokeStyle = hexA(col, 0.35); ctx.lineWidth = 8; ctx.stroke(); }
  line(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4.4; ctx.stroke();
  line(); ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.restore();
  const post = sharedSprite('ucpost' + o.look, 24, 24, 12, 12, () => {
    if (glow) { ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3); ctx.fillStyle = '#ffffff'; ctx.fillRect(-8.5, -1.5, 17, 3); }
    else { ctx.fillStyle = UC_STONE; ctx.beginPath(); roundRectPath(-7, -8.5, 14, 17, 3); ctx.fill(); inkStroke(1.3); ctx.fillStyle = UC_STONE_DARK; ctx.fillRect(-7, -3, 14, 2.4); }
  });
  blit(post, o.x1, sy + dy1); blit(post, o.x2, sy + dy2);
}
