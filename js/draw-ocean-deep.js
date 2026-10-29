// Paper Nosedive — Art for the Ocean's abyss looks and its Twenty Thousand Leagues Under the Sea looks (v174).
'use strict';

// The abyss (design/regions.md, step 6) got its own looks so it stops reusing the reef's: glass-sponge ledges, a gulper
// eel's jaws, glowing urchins, an oarfish, a rising jellyfish bell, an ammonite, a spider crab, a viperfish, a glowing
// shrimp, an anglerfish lure, a puffball of light and a glowing tentacle line. The Verne looks are from Jules Verne's
// novel (1870, public domain; drawn from the book, not from any film): the Nautilus with its ram, Ned Land's harpoon,
// Captain Nemo's divers in brass helmets and their electric rifles, the giant pearl oyster of Ceylon, the kraken, the
// ruins of Atlantis, the Maelstrom and the Nautilus's searchlight. Each keeps its mechanic's movement and hit shape.
// Returns true when it drew the obstacle (called first by drawOceanLook).
const DEEP_LOOKS = new Set(['glasssponge', 'gulper', 'glowurchin', 'oarfish', 'glowbell', 'ammonite', 'spidercrab', 'viperfish',
  'glowshrimp', 'lure', 'glowpuff', 'glowtentacle', 'nautilus', 'harpoon', 'diver', 'kraken', 'giantoyster', 'atlantis',
  'maelstrom', 'riflediver', 'searchlight']);
function drawDeepLook(o, sy) {
  switch (o.look) {
    case 'glasssponge': { const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2; drawSpongeLedge(-10, l, sy, l, -1, o); drawSpongeLedge(r, W + 10, sy, r, 1, o); return true; }
    case 'gulper': case 'giantoyster': { const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2; drawDeepJaw(-10, l, sy, l, -1, o); drawDeepJaw(r, W + 10, sy, r, 1, o); return true; }
    case 'glowurchin': drawGlowUrchin(o, sy); return true;
    case 'oarfish': case 'nautilus': drawDeepSlider(o, sy); return true;
    case 'glowbell': drawGlowBell(o, sy); return true;
    case 'ammonite': drawAmmonite(o, sy); return true;
    case 'spidercrab': drawSpiderCrab(o, sy); return true;
    case 'viperfish': case 'harpoon': drawDeepPiston(o, sy); return true;
    case 'glowshrimp': case 'riflediver': drawDeepTurret(o, sy); return true;
    case 'lure': case 'searchlight': drawDeepBeam(o, sy); return true;
    case 'glowpuff': drawGlowPuff(o, sy); return true;
    case 'glowtentacle': drawGlowLine(o, sy); return true;
    case 'diver': drawDiver(o, sy); return true;
    case 'kraken': drawOctopusArm(o, sy); drawKrakenEye(o, sy); return true;
    case 'atlantis': drawAtlantis(o, sy); return true;
    case 'maelstrom': drawFan(o, sy); drawMaelstrom(o, sy); return true;
  }
  return false;
}
const glowDot = (x, y, r, c, a = 0.45) => {
  ctx.fillStyle = hexA(c, a); ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
};

// ---------- Gap Wall: a ledge of glass sponge, a pale lattice dotted with glowing points, 22 thick ----------
function drawSpongeLedge(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.seaCol || '#cfe8f0';
  ctx.save();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 10); ctx.fillStyle = hexA(col, 0.55); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = hexA(col, 0.9); ctx.lineWidth = 1.2; ctx.beginPath();   // the glassy lattice
  for (let x = x0 - 22; x < x1 + 22; x += 9) { ctx.moveTo(x, sy - 11); ctx.lineTo(x + 22, sy + 11); ctx.moveTo(x + 22, sy - 11); ctx.lineTo(x, sy + 11); }
  ctx.stroke();
  for (let x = innerX + outDir * 12, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * 27, i++) glowDot(x, sy + (i % 2 ? 4 : -4), 1.8, i % 3 ? '#9ff0ff' : '#b8ffcf');
  ctx.restore();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 10); inkStroke(1.4);
  ctx.restore();
}

// ---------- Closing Jaws: a gulper eel's huge jaws, or the two halves of the giant pearl oyster, 28 thick ----------
function drawDeepJaw(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const oyster = o.look === 'giantoyster', col = o.seaCol || (oyster ? '#a8a090' : '#6a5a88');
  ctx.save();
  const body = () => {
    ctx.beginPath();
    if (oyster) {                                  // a scalloped shell edge at the closing side
      const out = outDir > 0 ? x1 : x0;
      ctx.moveTo(out, sy - 14); ctx.lineTo(innerX + outDir * 10, sy - 14);
      for (let k = 0; k <= 4; k++) ctx.quadraticCurveTo(innerX - outDir * 3, sy - 14 + k * 7 - 3.5, innerX + outDir * (k % 2 ? 4 : 1), sy - 14 + k * 7);
      ctx.lineTo(out, sy + 14); ctx.closePath();
    } else ctx.rect(x0, sy - 14, x1 - x0, 28);
  };
  body(); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  if (oyster) {
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.4; ctx.beginPath();   // growth ridges
    for (let k = 1; k < 6; k++) { const x = innerX + outDir * k * 16; ctx.moveTo(x, sy - 14); ctx.quadraticCurveTo(x + outDir * 6, sy, x, sy + 14); }
    ctx.stroke();
    const nacre = ctx.createLinearGradient(innerX, sy - 10, innerX + outDir * 30, sy + 10);   // pearly inside lip
    nacre.addColorStop(0, '#f4f0ff'); nacre.addColorStop(0.5, '#d8f0f0'); nacre.addColorStop(1, '#f0d8f0');
    ctx.fillStyle = nacre; ctx.fillRect(Math.min(innerX, innerX + outDir * 9), sy - 10, 9, 20);
  } else {
    ctx.fillStyle = '#1a1424'; ctx.fillRect(Math.min(innerX, innerX + outDir * 14), sy - 9, 14, 18);   // the open mouth
    ctx.fillStyle = '#f4f0e8';                     // needle teeth along the lips
    for (let y = sy - 9; y < sy + 9; y += 4.5) { ctx.beginPath(); ctx.moveTo(innerX + outDir * 1, y); ctx.lineTo(innerX + outDir * 7, y + 2.2); ctx.lineTo(innerX + outDir * 1, y + 4); ctx.closePath(); ctx.fill(); }
    glowDot(innerX + outDir * 42, sy - 6, 1.8, '#ff8ac0');
  }
  ctx.restore();
  body(); inkStroke(1.5);
  if (oyster && outDir > 0) {                      // the great pearl sits in the right-hand half
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(innerX + 18, sy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbf8f0'; ctx.beginPath(); ctx.arc(innerX + 18, sy, 7.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(innerX + 15.5, sy - 2.5, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- Static Hazards: a deep-sea urchin with glowing tipped spines, in the hit circle ----------
function drawGlowUrchin(o, sy) {
  const R = o.r * 0.88, col = o.seaCol || '#7fe8ff';
  blit(ownSprite(o, 'sprG', R * 2 + 16, R * 2 + 16, R + 8, R + 8, () => {
    ctx.fillStyle = hexA(col, 0.18); ctx.beginPath(); ctx.arc(0, 0, R + 6, 0, Math.PI * 2); ctx.fill();
    ctx.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, x = Math.cos(a) * R, y = Math.sin(a) * R;
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x * 0.5, y * 0.5); ctx.lineTo(x, y); ctx.stroke();
      ctx.strokeStyle = '#3a3050'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#2a2238'; ctx.beginPath(); ctx.arc(0, 0, R * 0.55, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = hexA(col, 0.6); for (let i = 0; i < 5; i++) { const a = i * 1.26; ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.3, 1.4, 0, Math.PI * 2); ctx.fill(); }
  }), o.x, sy);
}

// ---------- Bouncing Slider: an oarfish (a long silver ribbon with a red crest), or the Nautilus, 13 thick ----------
function drawDeepSlider(o, sy) {
  const L = o.len / 2, nautilus = o.look === 'nautilus', col = o.seaCol || (nautilus ? '#4a5260' : '#c8d4e0');
  blit(ownSprite(o, 'sprD', o.len + 12, 28, L + 6, 14, () => {
    if (nautilus) {                                // Verne's Nautilus: a cigar-shaped iron hull, a ram at the bow, a low
      ctx.fillStyle = '#8a94a0';                   // wheelhouse with lit windows, a lantern and a four-bladed screw
      ctx.beginPath(); ctx.moveTo(L - 12, -2); ctx.lineTo(L + 3, 0); ctx.lineTo(L - 12, 2); ctx.closePath(); ctx.fill(); inkStroke(1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-L + 8, 0); ctx.quadraticCurveTo(-L + 10, -6.5, -L * 0.2, -6.5); ctx.lineTo(L * 0.5, -6.5);
      ctx.quadraticCurveTo(L - 6, -6, L - 10, 0); ctx.quadraticCurveTo(L - 6, 6, L * 0.5, 6.5); ctx.lineTo(-L * 0.2, 6.5); ctx.quadraticCurveTo(-L + 10, 6.5, -L + 8, 0); ctx.closePath(); ctx.fill(); inkStroke(1.4);
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = -L + 22; x < L - 14; x += 14) { ctx.moveTo(x, -6); ctx.lineTo(x, 6); } ctx.stroke();   // riveted plates
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(-L * 0.6, -5.5, L * 1.1, 2);
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-6, -10.5, 14, 5, 2); ctx.fill(); inkStroke(1.1);   // the wheelhouse
      ctx.fillStyle = '#ffe08a'; for (const x of [-3, 1.5, 6]) ctx.fillRect(x - 1, -9.5, 2, 2.4);
      for (const x of [-L * 0.45, -L * 0.15, L * 0.25]) { ctx.fillStyle = '#ffd070'; ctx.beginPath(); ctx.arc(x, 1, 2, 0, Math.PI * 2); ctx.fill(); inkStroke(0.8); }   // portholes
      ctx.fillStyle = '#b89040'; ctx.beginPath(); ctx.moveTo(-L + 8, 0); ctx.lineTo(-L + 1, -6); ctx.lineTo(-L + 4, 0); ctx.lineTo(-L + 1, 6); ctx.closePath(); ctx.fill(); inkStroke(1);   // the screw
      glowDot(L * 0.5, -7, 1.8, '#fff2b0', 0.5);   // the lantern
    } else {                                       // an oarfish facing right
      ctx.fillStyle = '#e04a4a'; ctx.beginPath(); ctx.moveTo(L - 8, -4); ctx.quadraticCurveTo(L - 4, -13, L - 14, -11); ctx.lineTo(L - 16, -4); ctx.closePath(); ctx.fill(); inkStroke(1);   // the head crest
      ctx.beginPath(); ctx.moveTo(-L + 2, -3.5);   // the long red dorsal fin
      for (let x = -L + 2; x < L - 14; x += 8) ctx.quadraticCurveTo(x + 4, -8, x + 8, -4);
      ctx.lineTo(L - 14, -3.5); ctx.closePath(); ctx.fill(); inkStroke(1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.quadraticCurveTo(-L + 6, -4.5, -L * 0.3, -4.5); ctx.lineTo(L - 10, -4.5); ctx.quadraticCurveTo(L, -3, L, 0);
      ctx.quadraticCurveTo(L, 3.5, L - 10, 4.5); ctx.lineTo(-L * 0.3, 4.5); ctx.quadraticCurveTo(-L + 6, 4.5, -L, 0); ctx.closePath(); ctx.fill(); inkStroke(1.3);
      ctx.fillStyle = 'rgba(80,100,130,.35)'; for (let x = -L + 14; x < L - 16; x += 11) { ctx.beginPath(); ctx.arc(x, 0.5, 1.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(-L * 0.7, -3.5, L * 1.4, 1.4);
      seaEye(L - 6, -1, 2);
    }
  }), o.x, sy, o.a, o.vx < 0 ? -1 : 1, 1);
}

// ---------- Rising Projectile: a glowing jellyfish bell pulsing upward, its short tentacles trailing ----------
function drawGlowBell(o, sy) {
  const s = o.r / 16, col = o.seaCol || '#c89aff', pulse = 1 + Math.sin(time * 6 + o.x) * 0.06;
  blit(sharedSprite('gbell' + col, 48, 52, 24, 22, () => {
    ctx.fillStyle = hexA(col, 0.22); ctx.beginPath(); ctx.arc(0, -2, 18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hexA(col, 0.85); ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
    for (const x of [-8, -3, 2, 7]) { ctx.moveTo(x, 6); ctx.quadraticCurveTo(x + 3, 14, x - 1, 22); }
    ctx.stroke();
    ctx.fillStyle = hexA(col, 0.75); ctx.beginPath(); ctx.moveTo(-13, 6); ctx.quadraticCurveTo(-14, -14, 0, -14); ctx.quadraticCurveTo(14, -14, 13, 6);
    ctx.quadraticCurveTo(6, 3, 0, 6); ctx.quadraticCurveTo(-6, 3, -13, 6); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    for (const x of [-9, -3, 3, 9]) glowDot(x, 4.5, 1.2, '#fff0ff', 0.5);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-5, -8, 3, 4, -0.4, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy, 0, s, s * pulse);
}

// ---------- Spinning Drifter: an ammonite, a coiled shell with a glowing chamber line, in a 20-unit circle ----------
function drawAmmonite(o, sy) {
  const col = o.seaCol || '#d8b890';
  blit(sharedSprite('ammo' + col, 48, 48, 24, 24, () => {
    ctx.fillStyle = 'rgba(255,220,160,.18)'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); inkStroke(1.5);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath();   // the spiral
    for (let t = 0; t < Math.PI * 5; t += 0.15) { const r = 2 + t * 1.02; (t ? ctx.lineTo : ctx.moveTo).call(ctx, Math.cos(t) * r, Math.sin(t) * r); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; ctx.beginPath();   // ribs
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 17.5, Math.sin(a) * 17.5); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(160,255,230,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, 9, 0.4, 2.6); ctx.stroke();
  }), o.x, sy, o.rot);
}

// ---------- Spinning Blades: a deep-sea spider crab, long thin legs round a small body, snapping two long claws ----------
function drawSpiderCrab(o, sy) {
  const col = o.seaCol || '#e08a4a';
  const claw = sharedSprite('sclaw' + col, 106, 30, 34, 15, () => {
    ctx.fillStyle = col;
    ctx.beginPath(); roundRectPath(0, -2.2, 46, 4.4, 2.2); ctx.fill(); inkStroke(1);
    ctx.beginPath(); ctx.ellipse(54, 0, 9, 3.4, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.1);
    ctx.beginPath(); ctx.moveTo(61, -2); ctx.lineTo(66, -1); ctx.lineTo(61, 0.4); ctx.closePath(); ctx.fill(); inkStroke(0.9);
    ctx.beginPath(); ctx.moveTo(61, 2); ctx.lineTo(65, 1.2); ctx.lineTo(61, 0.8); ctx.closePath(); ctx.fill(); inkStroke(0.9);
  });
  for (const s of [-1, 1]) blit(claw, o.x, sy, o.rot + s * o.open / 2);
  const body = sharedSprite('scrab' + col, 70, 70, 35, 35, () => {
    ctx.strokeStyle = COL.ink; ctx.lineCap = 'round';
    for (const s of [-1, 1]) for (const a of [1.9, 2.3, 2.7, 3.05]) {   // spindly legs, bent at the knee
      const kx = Math.cos(a) * 20, ky = s * Math.sin(a) * 20;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 10, s * Math.sin(a) * 10); ctx.lineTo(kx, ky); ctx.lineTo(kx * 1.5, ky * 1.5 + s * 4);
      ctx.lineWidth = 3.4; ctx.strokeStyle = COL.ink; ctx.stroke(); ctx.lineWidth = 1.8; ctx.strokeStyle = col; ctx.stroke();
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(18, 0); ctx.quadraticCurveTo(12, -15, -6, -12); ctx.quadraticCurveTo(-16, 0, -6, 12); ctx.quadraticCurveTo(12, 15, 18, 0); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; for (const [x, y] of [[-4, -4], [2, 5], [6, -3], [-7, 5]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
    seaEye(15, -4, 2); seaEye(15, 4, 2);
  });
  blit(body, o.x, sy, o.rot);
}

// ---------- Wall Piston: a viperfish lunging from its hole with long fangs, or Ned Land's harpoon thrust from the wall ----------
function drawDeepPiston(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, harpoon = o.look === 'harpoon', col = o.seaCol || (harpoon ? '#a8743e' : '#6a8098');
  ctx.save();
  toolFrame(o, sy);
  if (harpoon) {                                   // a coil of rope on an iron ring in the rock
    ctx.fillStyle = '#5a6470'; ctx.beginPath(); ctx.moveTo(-8, -14); ctx.quadraticCurveTo(h * 0.6, -16, h, -8); ctx.quadraticCurveTo(h + 4, 0, h, 8); ctx.quadraticCurveTo(h * 0.6, 16, -8, 14); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.strokeStyle = '#c8b080'; ctx.lineWidth = 2.4; for (const r of [9, 6.5, 4]) { ctx.beginPath(); ctx.ellipse(h * 0.45, 0, r * 1.4, r, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (e > 1) {
      const tip = h + e;
      ctx.strokeStyle = '#c8b080'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(h * 0.45 + 12, 0); ctx.quadraticCurveTo(h, 8, h + 6, 2); ctx.stroke();   // the line paying out
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(h - 6, -2.6, tip - h - 8, 5.2, 2); ctx.fill(); inkStroke(1.1);   // the wooden shaft
      ctx.fillStyle = '#9aa4b0'; ctx.beginPath(); ctx.moveTo(tip - 14, -3); ctx.lineTo(tip, 0); ctx.lineTo(tip - 14, 3); ctx.closePath(); ctx.fill(); inkStroke(1.1);   // the iron head
      ctx.beginPath(); ctx.moveTo(tip - 12, -2.5); ctx.lineTo(tip - 17, -6.5); ctx.lineTo(tip - 15, -2); ctx.moveTo(tip - 12, 2.5); ctx.lineTo(tip - 17, 6.5); ctx.lineTo(tip - 15, 2); ctx.fill(); inkStroke(1);   // barbs
    }
  } else {
    ctx.fillStyle = '#4a5563'; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.quadraticCurveTo(40, -24, 82, -10); ctx.quadraticCurveTo(90, 0, 82, 12); ctx.quadraticCurveTo(40, 22, -8, 18); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#0e1218'; ctx.beginPath(); ctx.ellipse(72, 0, 7, 10, 0, 0, Math.PI * 2); ctx.fill();
    if (e > 1) {
      const tip = h + e - 8, wy = x => Math.sin(x * 0.12 + o.t * 6) * 2.5;
      ctx.beginPath(); for (let x = 70; x <= tip; x += 5) (x === 70 ? ctx.moveTo(x, wy(x)) : ctx.lineTo(x, wy(x))); ctx.lineTo(tip, wy(tip));
      ctx.lineCap = 'round'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 11; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.stroke();
      for (let x = 78; x < tip - 6; x += 9) glowDot(x, wy(x) + 2, 1, '#9ff0ff', 0.4);   // a row of light organs
      const y = wy(tip);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tip - 6, y - 7); ctx.lineTo(tip + 12, y - 2); ctx.lineTo(tip + 12, y + 3); ctx.lineTo(tip - 6, y + 7); ctx.closePath(); ctx.fill(); inkStroke(1.2);
      ctx.fillStyle = '#f4f0e8'; for (const [x, up] of [[tip + 3, 1], [tip + 8, 1], [tip + 5, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + up * 2); ctx.lineTo(x + 1.5, y + up * 9); ctx.lineTo(x + 3, y + up * 2); ctx.closePath(); ctx.fill(); }   // fangs
      seaEye(tip + 2, y - 3.5, 2.4);
    }
  }
  ctx.restore();
}

// ---------- Wall Turret: a glowing deep-sea shrimp spitting light, or one of Nemo's divers with an electric rifle ----------
function drawDeepTurret(o, sy) {
  const dir = inward(o), diver = o.look === 'riflediver', col = o.seaCol || (diver ? '#7a8a6a' : '#b03a4a');
  for (const b of o.blobs) {                       // glowing shots: blue sparks for the rifle, pale blue light for the shrimp
    ctx.fillStyle = diver ? 'rgba(140,200,255,.35)' : 'rgba(150,230,255,.3)'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = diver ? '#cfe8ff' : '#bff4ff'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.8, 0, Math.PI * 2); ctx.fill();
    if (diver) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(b.x - dir * b.r * 2, sy - 2); ctx.lineTo(b.x - dir * b.r, sy + 1.5); ctx.lineTo(b.x - dir * b.r * 3, sy + 2); ctx.stroke(); }
  }
  const head = sharedSprite('dturret' + o.look + dir + col, 176, 52, 88, 26, () => {
    ctx.scale(dir, 1);
    if (diver) {                                   // a diver in a brass helmet braced on the wall, aiming a long rifle
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-6, -6, 28, 14, 6); ctx.fill(); inkStroke(1.3);   // the suit
      ctx.fillStyle = '#5a5a60'; ctx.fillRect(8, -6, 3, 14);                                             // the belt
      ctx.fillStyle = '#4a4a52'; ctx.beginPath(); roundRectPath(30, -3, 48, 5, 2); ctx.fill(); inkStroke(1.1);   // the rifle
      ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); roundRectPath(24, -3, 14, 7, 2); ctx.fill(); inkStroke(1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(32, 3, 7, 3.5, 0.2, 0, Math.PI * 2); ctx.fill(); inkStroke(1);   // an arm on the stock
      ctx.fillStyle = UC_BRASS; ctx.beginPath(); ctx.arc(24, -10, 10, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);   // the helmet
      ctx.fillStyle = '#9fe0ff'; ctx.beginPath(); ctx.arc(27, -10, 5, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
      ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(22, -10); ctx.lineTo(32, -10); ctx.moveTo(27, -15); ctx.lineTo(27, -5); ctx.stroke();
    } else {                                       // a deep red shrimp with glowing spots and one big spitting mouth
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(-4, -8); ctx.quadraticCurveTo(26, -12, 56, -7); ctx.quadraticCurveTo(70, -4, 72, 0); ctx.quadraticCurveTo(70, 4, 56, 7); ctx.quadraticCurveTo(26, 12, -4, 8); ctx.closePath(); ctx.fill(); inkStroke(1.3);
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [8, 18, 28, 38]) { ctx.moveTo(x, -9); ctx.quadraticCurveTo(x + 3, 0, x, 9); } ctx.stroke();
      for (const [x, y] of [[12, 4], [24, 5], [36, 4], [48, 3]]) glowDot(x, y, 1.4, '#9ff0ff', 0.5);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(60, -6); ctx.quadraticCurveTo(70, -18, 80, -14); ctx.moveTo(62, -5); ctx.quadraticCurveTo(76, -10, 84, -4); ctx.stroke();
      seaEye(58, -3, 2.4);
    }
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {          // the muzzle (or the mouth) flashes: a shot is coming
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#ffffff' : '#9fe0ff';
    ctx.beginPath(); ctx.arc(wallX(o) + dir * (diver ? 78 : 72), sy, 3.2, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Charged Beam: an anglerfish whose lure flashes a beam of light, or the Nautilus's brass searchlight ----------
function drawDeepBeam(o, sy) {
  const x0 = ZAP_BODY, L = o.len, lamp = o.look === 'searchlight', col = o.seaCol || (lamp ? UC_BRASS : '#4a3a58');
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    const k = Math.min(1, o.t / 0.7);
    ctx.save(); ctx.strokeStyle = lamp ? `rgba(255,240,170,${0.25 + 0.6 * k})` : `rgba(170,255,220,${0.25 + 0.6 * k})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke(); ctx.restore();
  } else if (o.phase === 'zap') {                  // a straight beam of light, wide and soft with a bright core
    const c = lamp ? [255, 240, 170] : [170, 255, 220], flick = 0.85 + Math.random() * 0.15;
    ctx.fillStyle = `rgba(${c},${0.22 * flick})`; ctx.beginPath(); ctx.moveTo(x0, -5); ctx.lineTo(x0 + L, -9); ctx.lineTo(x0 + L, 9); ctx.lineTo(x0, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(${c},${0.6 * flick})`; ctx.fillRect(x0, -3, L, 6);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x0, -1, L, 2);
  }
  if (lamp) {                                      // a brass lamp on a bracket, its glass toward the middle
    ctx.fillStyle = '#5a5a60'; ctx.fillRect(-6, -3, 34, 6);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(26, -10); ctx.lineTo(x0 - 4, -14); ctx.lineTo(x0 - 4, 14); ctx.lineTo(26, 10); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; for (const x of [36, 48]) ctx.fillRect(x, -12, 2.5, 24);
    ctx.fillStyle = o.phase === 'charge' || o.phase === 'zap' ? '#fff6c8' : '#c8d8e0'; ctx.beginPath(); ctx.ellipse(x0 - 3, 0, 3.5, 13, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
  } else {                                         // an anglerfish lying along the wall, its lure reaching out
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(10, 0); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill(); inkStroke(1.1);
    ctx.beginPath(); ctx.ellipse(32, 0, 26, 13, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = '#1a1420'; ctx.beginPath(); ctx.moveTo(44, 4); ctx.quadraticCurveTo(56, 4, 58, 8); ctx.quadraticCurveTo(50, 13, 42, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; for (const x of [46, 50, 54]) { ctx.beginPath(); ctx.moveTo(x, 4.5); ctx.lineTo(x + 1, 7.5); ctx.lineTo(x + 2, 4.3); ctx.closePath(); ctx.fill(); }
    seaEye(44, -4, 2.8);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(36, -12); ctx.quadraticCurveTo(52, -20, x0 - 3, -2); ctx.stroke();
    const on = o.phase === 'charge' || o.phase === 'zap';
    glowDot(x0 - 3, 0, on ? 3.4 : 2.4, '#d8fff0', on ? 0.6 : 0.35);
  }
  ctx.restore();
}

// ---------- Proximity Blast: a puffball of living light that swells, flashes its blast circle, then bursts ----------
function drawGlowPuff(o, sy) {
  if (o.phase === 'boom' || (o.phase === 'gone' && o.t < BOOM_END - 0.35)) { drawBoom(o, sy, o.phase === 'boom' ? o.t : 0.35 + o.t); return; }
  if (o.phase === 'gone') return;
  const col = o.seaCol || '#9fffd0', blink = o.phase === 'blink';
  if (blink) {
    ctx.save(); ctx.strokeStyle = `rgba(160,255,210,${0.35 + 0.5 * Math.min(1, o.t / 0.6)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  const swell = 1 + (blink ? Math.min(1, o.t / 0.6) * 0.18 : Math.sin(o.t * 2) * 0.05);
  blit(sharedSprite('gpuff' + col, 40, 40, 20, 20, () => {
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 18); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, col); g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hexA(col, 0.9); ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); inkStroke(1.6);   // a solid outlined core (v181)
    ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 6; i++) { const a = i * 1.05; ctx.beginPath(); ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 1.2, 0, Math.PI * 2); ctx.fill(); }
  }), o.x, sy, 0, swell, swell);
  if (blink && Math.floor(o.t * 12) % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(o.x, sy, 5, 0, Math.PI * 2); ctx.fill(); }
}

// ---------- Spring Line: a glowing jellyfish tentacle between two glowing bulbs: the line bounces, the bulbs hurt ----------
function drawGlowLine(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, col = o.seaCol || '#ff9ad8';
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9), bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + 4;
  const line = () => { ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); };
  ctx.save(); ctx.lineCap = 'round';
  line(); ctx.strokeStyle = hexA(col, 0.25); ctx.lineWidth = 8; ctx.stroke();
  line(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 3.4; ctx.stroke();
  line(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  for (let t = 0.15; t < 0.9; t += 0.14) {         // little stinging beads of light along it
    const x = (1 - t) * (1 - t) * o.x1 + 2 * t * (1 - t) * cx + t * t * o.x2, y = (1 - t) * (1 - t) * (sy + dy1) + 2 * t * (1 - t) * cy + t * t * (sy + dy2);
    ctx.fillStyle = '#fff0fa'; ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const bulb = sharedSprite('gbulb' + col, 30, 30, 15, 15, () => {
    ctx.fillStyle = hexA(col, 0.3); ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#fff6fc'; ctx.beginPath(); ctx.arc(-2, -2.5, 3, 0, Math.PI * 2); ctx.fill();
  });
  blit(bulb, o.x1, sy + dy1); blit(bulb, o.x2, sy + dy2);
}

// ---------- Drifting Swarm: one of Captain Nemo's divers sinking slowly, brass helmet and lead boots, in a 42-unit square ----------
function drawDiver(o, sy) {
  const col = o.seaCol || '#8a9a7a';
  blit(sharedSprite('diver' + col, 48, 52, 24, 26, () => {
    ctx.fillStyle = 'rgba(235,250,255,.7)'; for (const [x, y, r] of [[8, -20, 1.6], [11, -24, 1.2], [6, -24, 1]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }   // bubbles
    ctx.fillStyle = col; ctx.lineCap = 'round';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 12, -1, 7, 3.2, s * -0.6, 0, Math.PI * 2); ctx.fill(); inkStroke(1.1); }   // arms out
    for (const s of [-1, 1]) { ctx.beginPath(); roundRectPath(s * 5 - 3, 6, 6, 12, 3); ctx.fill(); inkStroke(1.1); }                       // legs
    ctx.fillStyle = '#4a4a52'; for (const s of [-1, 1]) { ctx.beginPath(); roundRectPath(s * 5 - 4, 16, 8, 4, 1.5); ctx.fill(); inkStroke(1); }   // lead boots
    ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-8, -6, 16, 16, 6); ctx.fill(); inkStroke(1.3);   // the suit
    ctx.fillStyle = '#5a5a60'; ctx.fillRect(-8, 4, 16, 2.4);
    ctx.fillStyle = '#7a8090'; ctx.beginPath(); roundRectPath(-6, -7, 12, 5, 2); ctx.fill(); inkStroke(1);   // the air tank strap
    ctx.fillStyle = UC_BRASS; ctx.beginPath(); ctx.arc(0, -13, 8.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);   // the brass helmet
    ctx.fillStyle = '#9fe0ff'; ctx.beginPath(); ctx.arc(0, -12.5, 4.6, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
    ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4.6, -12.5); ctx.lineTo(4.6, -12.5); ctx.moveTo(0, -17); ctx.lineTo(0, -8); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-3, -16, 1.6, 0, Math.PI * 2); ctx.fill();
  }), o.x, sy, o.rot * 0.4);
}

// ---------- Telegraphed Sweep: the kraken, a giant squid whose huge eye watches from the crevice (its arm is the octopus arm's) ----------
function drawKrakenEye(o, sy) {
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = o.seaCol || '#8a2a4a'; ctx.beginPath(); ctx.ellipse(3, -6, 7, 9, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
  ctx.fillStyle = '#ffe070'; ctx.beginPath(); ctx.arc(5, -6, 5, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
  ctx.fillStyle = '#141018'; ctx.beginPath(); ctx.ellipse(5.5, -6, 1.6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Wall Bulge: the ruins of Atlantis, half of a fallen temple with columns, an arch and a broken pediment ----------
function drawAtlantis(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 6, i = -o.side, col = o.seaCol || '#c8bfa8';
  blit(ownSprite(o, 'sprA', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let y = -o.r; y < o.r; y += 14) ctx.fillRect(-o.r, y, o.r * 2, 1.6);   // stone courses
    const base = o.r * 0.55;                       // a stepped base, then columns standing on it
    ctx.fillStyle = '#b0a690'; ctx.fillRect(-o.r, base, o.r * 2, o.r); ctx.fillRect(-o.r, base - 6, o.r * 2, 6);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-o.r, base - 6); ctx.lineTo(o.r, base - 6); ctx.moveTo(-o.r, base); ctx.lineTo(o.r, base); ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const x = i * (o.r * 0.12 + k * o.r * 0.22), top = -o.r * 0.35 + (k === 2 ? o.r * 0.25 : 0);   // the third is broken off
      ctx.fillStyle = '#e8e0cc'; ctx.fillRect(x - 5, top, 10, base - 6 - top); ctx.strokeRect(x - 5, top, 10, base - 6 - top);
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.moveTo(x - 1.5, top + 2); ctx.lineTo(x - 1.5, base - 8); ctx.moveTo(x + 1.5, top + 2); ctx.lineTo(x + 1.5, base - 8); ctx.stroke();
      ctx.strokeStyle = COL.ink;
    }
    ctx.fillStyle = '#d8ceb4'; ctx.beginPath(); ctx.moveTo(-o.r, -o.r * 0.35); ctx.lineTo(i * o.r * 0.25, -o.r * 0.35); ctx.lineTo(i * o.r * 0.1, -o.r * 0.62); ctx.lineTo(-o.r, -o.r * 0.62); ctx.closePath(); ctx.fill(); inkStroke(1.2);   // the broken pediment
    ctx.fillStyle = UC_GOLD; ctx.beginPath(); ctx.arc(-i * o.r * 0.2, -o.r * 0.49, 4, 0, Math.PI * 2); ctx.fill(); inkStroke(0.9);   // a gold sun disc
    ctx.fillStyle = '#3a4a5a'; ctx.beginPath(); ctx.moveTo(-i * o.r * 0.55, base - 6); ctx.lineTo(-i * o.r * 0.55, -o.r * 0.05); ctx.arc(-i * o.r * 0.42, -o.r * 0.05, o.r * 0.13, Math.PI, 0); ctx.lineTo(-i * o.r * 0.29, base - 6); ctx.closePath(); ctx.fill(); inkStroke(1.1);   // an arched doorway
    ctx.fillStyle = 'rgba(70,140,90,.5)'; for (const [a, d] of [[-0.4, 0.85], [0.7, 0.8], [2.2, 0.75]]) { ctx.beginPath(); ctx.arc(Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, o.r * 0.12, 0, Math.PI * 2); ctx.fill(); }   // weed
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); inkStroke(1.8);
  }), cx, sy);
}

// ---------- Push Zone: the Maelstrom, the great whirlpool, its spirals turning in the current (the current's own streaks too) ----------
function drawMaelstrom(o, sy) {
  ctx.save();
  ctx.strokeStyle = 'rgba(225,245,255,.5)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const x = W * (0.2 + k * 0.3), y = sy + Math.sin(k * 2.1) * o.band * 0.2, spin = o.t * (2.4 + k * 0.4) * -o.side;
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 4; t += 0.2) { const r = 2 + t * 2.2; (t ? ctx.lineTo : ctx.moveTo).call(ctx, x + Math.cos(t + spin) * r, y + Math.sin(t + spin) * r * 0.55); }
    ctx.stroke();
  }
  ctx.restore();
}
