// Paper Nosedive — Art for the Ocean map's added looks (v124).
'use strict';

// Every Ocean mechanic has a few looks (SEA_LOOKS in obstacles.js): the first is the original art in draw-sea.js, the
// others are drawn here, along with the seven obstacles added in v124 (fish school, pufferfish, big rock, swordfish,
// fishing line, anchor chain, crab). Real sea life and shipwrecks, cartoon style, ink outlines like the rest of the
// sea. Every drawing stays inside the mechanic's hit shape. Returns false for an original look, so render.js draws it.
function drawOceanLook(o, sy) {
  const look = o.look;
  if (o.abyssLight) { drawAbyssLight(o, sy); return true; }                  // the Abyss lights collection (v173)
  if (o.treasure || (SEA_CITY.has(look) && !o.shell && !o.fish)) { drawSunkenCity(o, sy); return true; }   // the sunken city (v133)
  switch (o.type) {
    case 'gate': {
      if (look === 'coral') return false;
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawSeaLedge(-10, l, sy, l, -1, o); drawSeaLedge(r, W + 10, sy, r, 1, o);
      return true;
    }
    case 'erasers': {
      if (look === 'clam') return false;
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawWreckHull(-10, l, sy, l, -1, o); drawWreckHull(r, W + 10, sy, r, 1, o);
      return true;
    }
    case 'blot': if (look === 'urchin' || o.shell) return false; drawSeaHazard(o, sy); return true;
    case 'note': if (look === 'jelly') return false; drawSeaSwarm(o, sy); return true;
    case 'starfish': if (look === 'starfish' || o.fish) return false; drawSeaDrifter(o, sy); return true;
    case 'cutter': if (look === 'moray') return false; drawMantis(o, sy); return true;
    case 'glue': if (look === 'sub') return false; drawSeaTurret(o, sy); return true;
    case 'zap': if (look === 'eel') return false; drawRay(o, sy); return true;
    case 'paw': if (look === 'kelp') return false; drawOctopusArm(o, sy); return true;
    case 'mine': if (look === 'navalmine') return false; drawBarrel(o, sy); return true;
    case 'bubbles': if (look === 'bubbles') return false; drawWarmVent(o, sy); return true;
    case 'fan': if (look === 'current') return false; drawFan(o, sy); drawKelpDrift(o, sy); return true;
    case 'clips': for (const x of clipXs(o)) drawSchoolFish(x, sy, o.v > 0 ? 1 : -1, look, o.seaCol); return true;
    case 'wad': drawPuffer(o, sy); return true;
    case 'protractor': drawSeaBulge(o, sy); return true;
    case 'pencil': drawSwordfish(o, sy); return true;
    case 'band': drawFishline(o, sy); return true;
    case 'compass': drawAnchorChain(o, sy); return true;
    case 'scissors': drawCrab(o, sy); return true;
  }
  return false;
}
const seaEye = (x, y, r = 2.6) => {
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); inkStroke(0.9);
  ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x + r * 0.25, y, r * 0.5, 0, Math.PI * 2); ctx.fill();
};

// ---------- Gap Wall: a rock ledge with sea anemones, or the broken planks of a shipwreck, 22 thick ----------
function drawSeaLedge(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.seaCol || '#6b7a85', wreck = o.look === 'wreck';
  ctx.save();
  const body = () => {
    ctx.beginPath();
    if (wreck) {                                   // the plank end is snapped off in a jagged line
      const out = outDir > 0 ? x1 : x0;
      ctx.moveTo(out, sy - 11); ctx.lineTo(innerX + outDir * 6, sy - 11); ctx.lineTo(innerX, sy - 5); ctx.lineTo(innerX + outDir * 5, sy);
      ctx.lineTo(innerX, sy + 5); ctx.lineTo(innerX + outDir * 4, sy + 11); ctx.lineTo(out, sy + 11); ctx.closePath();
    } else roundRectPath(x0, sy - 11, x1 - x0, 22, 9);
  };
  body(); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  if (wreck) {
    ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(x0, sy - 1, x1 - x0, 2);                    // two planks
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x0, sy - 11, x1 - x0, 3);
    ctx.fillStyle = '#3a2a1a';
    for (let x = innerX + outDir * 26; outDir > 0 ? x < x1 : x > x0; x += outDir * 34) for (const y of [-6, 6]) { ctx.beginPath(); ctx.arc(x, sy + y, 1.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#e8e2d0';                     // barnacles
    for (let x = innerX + outDir * 14, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * 23, i++) { ctx.beginPath(); ctx.arc(x, sy + (i % 2 ? 7 : -7), 2.2, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    for (let x = Math.min(x0, x1), i = 0; x < Math.max(x0, x1); x += 16, i++) { ctx.beginPath(); ctx.arc(x, sy - 9 + (i % 3) * 2, 7, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x0, sy + 5, x1 - x0, 6);
    const tones = ['#ff7a9a', '#ffa04a', '#b77cf0', '#7fd0c0'];
    for (let x = innerX + outDir * 18, i = 0; outDir > 0 ? x < x1 - 4 : x > x0 + 4; x += outDir * 40, i++) {   // little anemones on the rock
      ctx.strokeStyle = tones[i % 4]; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath();
      for (let k = -2; k <= 2; k++) { ctx.moveTo(x, sy - 2); ctx.quadraticCurveTo(x + k * 3, sy - 6, x + k * 2.4, sy - 10); }
      ctx.stroke();
      ctx.fillStyle = tones[i % 4]; ctx.beginPath(); ctx.ellipse(x, sy - 1, 4, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  body(); inkStroke(1.4);
  ctx.restore();
}

// ---------- Closing Jaws: two halves of a sunken ship's hull with portholes, 28 thick ----------
function drawWreckHull(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fillStyle = o.seaCol || '#7a5a3a'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,.15)'; for (const y of [-5, 4]) ctx.fillRect(x0, sy + y, x1 - x0, 1.6);
  ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x0, sy - 14, x1 - x0, 3);
  ctx.fillStyle = '#5a6a6a'; ctx.fillRect(outDir > 0 ? innerX : innerX - 6, sy - 14, 6, 28);   // a metal band at the closing edge
  for (let x = innerX + outDir * 30; outDir > 0 ? x < x1 : x > x0; x += outDir * 46) {                   // portholes
    ctx.fillStyle = '#b8a060'; ctx.beginPath(); ctx.arc(x, sy, 7, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
    ctx.fillStyle = '#1e3a4a'; ctx.beginPath(); ctx.arc(x, sy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(x - 1.5, sy - 1.5, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#4f8a4a';                       // seaweed hanging off the bottom
  for (let x = innerX + outDir * 16; outDir > 0 ? x < x1 : x > x0; x += outDir * 37) { ctx.beginPath(); ctx.ellipse(x, sy + 11, 2, 4, 0.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); inkStroke(1.5);
  ctx.restore();
}

// ---------- Static Hazards: a stinging sea anemone, or a lumpy stonefish with poison spines, in the hit circle ----------
function drawSeaHazard(o, sy) {
  const R = o.r * 0.88, col = o.seaCol || '#ff7a9a';
  blit(ownSprite(o, 'sprO', R * 2 + 8, R * 2 + 8, R + 4, R + 4, () => {
    if (o.look === 'stonefish') {                  // a grumpy warty fish that looks like a rock
      ctx.fillStyle = col; ctx.beginPath();
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = R * (i % 2 ? 0.86 : 0.98); ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d * 0.9); }
      ctx.closePath(); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 9; i++) { const a = i * 2.3, d = R * (0.2 + 0.5 * ((i * 37) % 10) / 10); ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, R * 0.1, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2; ctx.beginPath();          // spines along its back
      for (let x = -R * 0.5; x <= R * 0.5; x += R * 0.25) { ctx.moveTo(x, -R * 0.6); ctx.lineTo(x + 1, -R * 0.92); }
      ctx.stroke();
      ctx.fillStyle = '#e8d070'; ctx.beginPath(); ctx.arc(R * 0.28, -R * 0.1, R * 0.15, 0, Math.PI * 2); ctx.fill(); inkStroke(1);   // a grumpy eye
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(R * 0.3, -R * 0.08, R * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(R * 0.14, -R * 0.3); ctx.lineTo(R * 0.44, -R * 0.24); inkStroke(1.4);
      ctx.beginPath(); ctx.moveTo(R * 0.3, R * 0.35); ctx.quadraticCurveTo(R * 0.55, R * 0.25, R * 0.7, R * 0.4); inkStroke(1.4);   // a frowning mouth
    } else {                                       // an anemone: a squat column and a crown of waving tentacles
      ctx.lineCap = 'round';
      for (let i = 0; i < 13; i++) {
        const a = Math.PI + 0.1 + i / 12 * (Math.PI - 0.2), sw = Math.sin(i * 1.7) * 0.12;
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 4.6;
        ctx.beginPath(); ctx.moveTo(0, R * 0.1); ctx.quadraticCurveTo(Math.cos(a + sw) * R * 0.6, R * 0.1 + Math.sin(a + sw) * R * 0.6, Math.cos(a) * R * 0.92, R * 0.1 + Math.sin(a) * R * 0.92); ctx.stroke();
        ctx.strokeStyle = col; ctx.lineWidth = 2.8; ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.92, R * 0.1 + Math.sin(a) * R * 0.92, 1.3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-R * 0.55, R * 0.1); ctx.lineTo(-R * 0.45, R * 0.82); ctx.quadraticCurveTo(0, R * 0.95, R * 0.45, R * 0.82); ctx.lineTo(R * 0.55, R * 0.1); ctx.closePath(); ctx.fill(); inkStroke(1.3);
      ctx.fillStyle = 'rgba(0,0,0,.15)'; for (const x of [-0.25, 0.05, 0.3]) ctx.fillRect(R * x, R * 0.2, R * 0.08, R * 0.55);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(0, R * 0.12, R * 0.4, R * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy);
}

// the Abyss lights (v173): glowing deep-sea animals drifting down with the abyss's swarms, original cartoon designs, each
// inside a 42-unit square with a soft glow so it reads on the near-black water (also used by the Collections screen)
const ABYSS_LIGHT_NAMES = { vampiresquid: 'Vampire squid', barreleye: 'Barreleye fish', dumbo: 'Dumbo octopus', seaangel: 'Sea angel',
                            fireflysquid: 'Firefly squid', glasssquid: 'Glass squid', seapig: 'Sea pig', isopod: 'Giant isopod' };
function paintAbyssLight(name) {
  const glow = (r, c) => { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); };
  const dot = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
  if (name === 'vampiresquid') {                   // a deep red cloak of webbed arms, big blue eyes, two glowing tips
    glow(22, 'rgba(120,200,255,.35)');
    ctx.fillStyle = '#9a2a3a'; ctx.beginPath(); ctx.moveTo(0, -18);
    ctx.quadraticCurveTo(12, -14, 11, -2); ctx.quadraticCurveTo(18, 8, 15, 16); ctx.quadraticCurveTo(8, 12, 5, 17); ctx.quadraticCurveTo(0, 12, -5, 17);
    ctx.quadraticCurveTo(-8, 12, -15, 16); ctx.quadraticCurveTo(-18, 8, -11, -2); ctx.quadraticCurveTo(-12, -14, 0, -18); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    seaEye(-5, -5, 3.4); seaEye(5, -5, 3.4);
    for (const x of [-15, 15]) { dot(x, 16, 3.2, 'rgba(140,220,255,.5)'); dot(x, 16, 1.6, '#e8faff'); }
  } else if (name === 'barreleye') {               // a fish with a see-through dome head and two green eyes looking up
    glow(22, 'rgba(140,255,200,.3)');
    ctx.fillStyle = '#5a6a88'; ctx.beginPath(); ctx.moveTo(-12, 4); ctx.lineTo(-20, -2); ctx.lineTo(-19, 6); ctx.lineTo(-20, 12); ctx.closePath(); ctx.fill(); inkStroke(1.2);
    ctx.beginPath(); ctx.ellipse(0, 5, 14, 8, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = 'rgba(200,245,255,.45)'; ctx.beginPath(); ctx.ellipse(4, -5, 10, 9, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); inkStroke(1.2);
    for (const x of [1, 7]) { dot(x, -4, 2.8, '#5aff9a'); dot(x, -4.8, 1, '#ffffff'); }
    dot(12, 6, 1.2, COL.ink);
  } else if (name === 'dumbo') {                   // a round pink octopus flapping two ear-like fins
    glow(22, 'rgba(255,170,210,.3)');
    ctx.fillStyle = '#f0a0c0';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 13, -8, 7, 4.5, s * -0.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2); }
    ctx.beginPath(); ctx.moveTo(-12, 2); ctx.quadraticCurveTo(-13, -16, 0, -16); ctx.quadraticCurveTo(13, -16, 12, 2);
    for (let i = 0; i <= 4; i++) { const x = 12 - i * 6; ctx.quadraticCurveTo(x - 1, 14, x - 3, 8); }
    ctx.closePath(); ctx.fill(); inkStroke(1.4);
    seaEye(-4, -5, 2.6); seaEye(4, -5, 2.6);
  } else if (name === 'seaangel') {                // a tiny see-through sea angel: a glowing body with two wing flaps
    glow(22, 'rgba(255,190,140,.35)');
    ctx.fillStyle = 'rgba(220,240,255,.75)';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 9, -5, 9, 4.5, s * 0.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.1); }
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(7, -6, 4, 6); ctx.quadraticCurveTo(1, 16, 0, 18); ctx.quadraticCurveTo(-1, 16, -4, 6); ctx.quadraticCurveTo(-7, -6, 0, -14); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    dot(0, 0, 3.4, '#ff8a4a'); dot(0, -10, 1.2, COL.ink);
  } else if (name === 'fireflysquid') {            // a small squid covered in bright blue glowing dots
    glow(22, 'rgba(90,170,255,.4)');
    ctx.fillStyle = '#3a4a8a'; ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(8, -10, 6, 4); ctx.lineTo(-6, 4); ctx.quadraticCurveTo(-8, -10, 0, -18); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.strokeStyle = '#3a4a8a'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath();
    for (const x of [-5, -2, 1, 4]) { ctx.moveTo(x, 4); ctx.quadraticCurveTo(x * 1.6, 11, x * 1.2, 17); }
    ctx.stroke();
    for (const [x, y] of [[0, -12], [-3, -6], [3, -6], [0, -1], [-4, 1], [4, 1], [-7, 16], [6, 16]]) { dot(x, y, 2.2, 'rgba(120,200,255,.5)'); dot(x, y, 1.1, '#e0f6ff'); }
    seaEye(0, 6, 2.2);
  } else if (name === 'glasssquid') {              // a see-through round squid with its little organs showing
    glow(22, 'rgba(200,240,255,.3)');
    ctx.fillStyle = 'rgba(220,245,255,.5)'; ctx.beginPath(); ctx.ellipse(0, -3, 11, 14, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
    ctx.strokeStyle = 'rgba(220,245,255,.8)'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (const x of [-6, -2, 2, 6]) { ctx.moveTo(x, 10); ctx.quadraticCurveTo(x * 1.4, 15, x, 19); }
    ctx.stroke();
    dot(0, -2, 3.4, '#ff7a9a'); dot(-3, 5, 1.8, '#ffd07a'); dot(3, 4, 1.6, '#7fe8ff');
    seaEye(-4, 9, 2); seaEye(4, 9, 2);
  } else if (name === 'seapig') {                  // a plump pink sea cucumber on little tube legs, with feelers on its back
    glow(22, 'rgba(255,190,200,.3)');
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); for (const x of [-4, 3]) { ctx.moveTo(x, -6); ctx.quadraticCurveTo(x + 2, -14, x - 1, -17); } ctx.stroke();
    ctx.fillStyle = '#f0b8c0'; for (const x of [-11, -5, 1, 7, 12]) { ctx.beginPath(); ctx.ellipse(x, 9, 2.2, 4, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1); }
    ctx.beginPath(); ctx.ellipse(0, 1, 17, 9, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.5);
    seaEye(12, -1, 2.2);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-5, -3, 6, 2.4, -0.2, 0, Math.PI * 2); ctx.fill();
  } else {                                         // a giant isopod: a grey-lilac shell of overlapping plates, seen from above
    glow(22, 'rgba(200,190,255,.3)');
    ctx.fillStyle = '#a8a0c0'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 18, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.5);
    ctx.strokeStyle = '#6a6488'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let y = -10; y <= 12; y += 4.4) { const w = Math.sqrt(1 - (y / 18) ** 2) * 12; ctx.moveTo(-w, y); ctx.quadraticCurveTo(0, y + 2.4, w, y); }
    ctx.stroke();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-3, -17); ctx.quadraticCurveTo(-8, -22, -12, -20); ctx.moveTo(3, -17); ctx.quadraticCurveTo(8, -22, 12, -20); ctx.stroke();
    dot(-5, -13, 1.6, '#e0e8ff'); dot(5, -13, 1.6, '#e0e8ff');
  }
}
function drawAbyssLight(o, sy) {
  blit(sharedSprite('abysslight-' + o.abyssLight, 48, 48, 24, 24, () => paintAbyssLight(o.abyssLight)), o.x, sy, o.rot * 0.3);
}

// ---------- Drifting Swarm: a rainbow comb jelly, or a deep-sea anglerfish with a glowing lure, in a 42-unit square ----------
function drawSeaSwarm(o, sy) {
  const col = o.seaCol || 'rgba(215,235,255,.75)', angler = o.look === 'anglerfish';
  blit(sharedSprite('ssw' + o.look + col, 48, 48, 24, 24, () => {
    if (angler) {                                  // a round dark fish, big jaw and teeth, a lure on a stalk
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-21, -8); ctx.lineTo(-19, 0); ctx.lineTo(-21, 8); ctx.closePath(); ctx.fill(); inkStroke(1.2);
      ctx.beginPath(); ctx.arc(1, 2, 15, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = '#1a1420'; ctx.beginPath(); ctx.moveTo(4, 6); ctx.quadraticCurveTo(14, 4, 16, 9); ctx.quadraticCurveTo(10, 15, 3, 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff'; for (const x of [6, 9, 12, 14]) { ctx.beginPath(); ctx.moveTo(x, 6.5); ctx.lineTo(x + 1, 9.5); ctx.lineTo(x + 2, 6.2); ctx.closePath(); ctx.fill(); }
      seaEye(7, -3, 3);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(2, -12); ctx.quadraticCurveTo(10, -22, 16, -15); ctx.stroke();
      ctx.fillStyle = 'rgba(180,255,220,.4)'; ctx.beginPath(); ctx.arc(16, -14, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d8fff0'; ctx.beginPath(); ctx.arc(16, -14, 3, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a see-through oval with eight rows of rainbow combs
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 14, 20, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
      const rb = ['#ff5a7a', '#ffb03a', '#f4e040', '#5ad07a', '#4ab0f0', '#a07af0'];
      for (let k = -3; k <= 3; k++) {
        ctx.strokeStyle = rb[(k + 3) % rb.length]; ctx.lineWidth = 1.6; ctx.setLineDash([2, 2.5]);
        ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(k) * 4.4 + 0.5, 19, 0, k < 0 ? Math.PI / 2 : -Math.PI / 2, k < 0 ? Math.PI * 1.5 : Math.PI / 2); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-5, -10, 3, 5, -0.3, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot * 0.5);
}

// ---------- Spinning Drifter: a long-armed brittle star, or a ship's wheel from a wreck, in a 20-unit circle ----------
function drawSeaDrifter(o, sy) {
  const col = o.seaCol || '#c75b9b', wheel = o.look === 'wheel';
  blit(sharedSprite('sdr' + o.look + col, 48, 48, 24, 24, () => {
    if (wheel) {
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 5.4; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 19, Math.sin(a) * 19); }
      ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 3.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 12.5, 0, Math.PI * 2); ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = '#a8743e'; ctx.lineWidth = 3.6; ctx.stroke();
      ctx.fillStyle = '#b8a060'; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.1);
    } else {                                       // a small disc and five long wiggly arms
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5, path = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(Math.cos(a) * 8, Math.sin(a) * 8, Math.cos(a + 0.6) * 14, Math.sin(a + 0.6) * 14, Math.cos(a + 0.25) * 19, Math.sin(a + 0.25) * 19); };
        path(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.stroke();
        path(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(-1.5, -1.5, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, o.rot);
}

// ---------- Wall Piston: a mantis shrimp punching its club out of its burrow ----------
function drawMantis(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, col = o.seaCol || '#3fb07a';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#5a6470';                       // the burrow in the rock
  ctx.beginPath(); ctx.moveTo(-8, -12); ctx.quadraticCurveTo(h * 0.6, -15, h, -9); ctx.quadraticCurveTo(h + 4, 0, h, 9); ctx.quadraticCurveTo(h * 0.6, 15, -8, 12); ctx.closePath(); ctx.fill(); inkStroke(1.3);
  ctx.fillStyle = '#1a2028'; ctx.beginPath(); ctx.ellipse(h - 8, 0, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(h - 6, 0, 5, 5.5, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1);   // its head in the doorway
  for (const y of [-4, 4]) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(h - 4, y * 0.5); ctx.lineTo(h - 1, y * 1.6); ctx.stroke(); seaEye(h - 1, y * 1.6, 1.8); }
  if (e > 1) {
    const tip = h + e;
    ctx.beginPath(); ctx.moveTo(h - 4, -3.5); ctx.lineTo(tip - 9, -4.5); ctx.lineTo(tip - 9, 4.5); ctx.lineTo(h - 4, 3.5); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); inkStroke(1.2);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = h + 6; x < tip - 12; x += 9) { ctx.moveTo(x, -4); ctx.lineTo(x, 4); } ctx.stroke();
    ctx.fillStyle = '#f4d060'; ctx.beginPath(); ctx.arc(tip - 6, 0, 5.8, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);   // the club
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(tip - 7.5, -2, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- Wall Turret: a pistol shrimp snapping bubble bullets, or a wreck's cannon firing cannonballs ----------
function drawSeaTurret(o, sy) {
  const dir = inward(o), cannon = o.look === 'cannon', col = o.seaCol || '#ff7a5a';
  for (const b of o.blobs) {
    if (cannon) {
      ctx.fillStyle = 'rgba(235,250,255,.6)'; for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(b.x - dir * (b.r + k * 6), sy + Math.sin(b.wob + k) * 2, 1.4 + k * 0.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.9, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, sy - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a bubble bullet: a bright ring with a shine
      ctx.fillStyle = 'rgba(220,245,255,.35)'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(120,180,220,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.9 + 1.5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, sy - b.r * 0.3, b.r * 0.22, 0, Math.PI * 2); ctx.fill();
    }
  }
  const head = sharedSprite('sturret' + o.look + dir + col, 176, 52, 88, 26, () => {
    ctx.scale(dir, 1);
    if (cannon) {                                  // a barrel on a mossy wooden carriage, its muzzle toward the middle
      ctx.fillStyle = '#6f5236'; ctx.beginPath(); roundRectPath(-4, 2, 40, 9, 2); ctx.fill(); inkStroke(1.1);
      for (const x of [8, 28]) { ctx.fillStyle = '#5a4028'; ctx.beginPath(); ctx.arc(x, 9, 3.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(62, -6); ctx.lineTo(78, -4); ctx.lineTo(78, 4); ctx.lineTo(62, 6); ctx.lineTo(0, 9); ctx.closePath(); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(4, -7, 56, 3);
      for (const x of [14, 40, 62]) { ctx.fillStyle = '#6a6a72'; ctx.fillRect(x, -8, 3, 16); }
      ctx.fillStyle = '#4f8a4a'; ctx.beginPath(); ctx.ellipse(30, -8, 6, 2.2, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#141418'; ctx.beginPath(); ctx.ellipse(77, 0, 1.6, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a pistol shrimp: a curved body along the wall and one huge claw
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(-4, -8); ctx.quadraticCurveTo(24, -12, 46, -7); ctx.lineTo(46, 7); ctx.quadraticCurveTo(24, 12, -4, 8); ctx.closePath(); ctx.fill(); inkStroke(1.3);
      ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [8, 18, 28]) { ctx.moveTo(x, -9); ctx.quadraticCurveTo(x + 3, 0, x, 9); } ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(58, 0, 14, 10, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);   // the big claw
      ctx.beginPath(); ctx.moveTo(66, -4); ctx.lineTo(78, -3); ctx.lineTo(78, 0); ctx.lineTo(68, 0); ctx.closePath(); ctx.fill(); inkStroke(1.1);
      ctx.beginPath(); ctx.moveTo(66, 4); ctx.lineTo(77, 3.5); ctx.lineTo(76, 1); ctx.lineTo(68, 1); ctx.closePath(); ctx.fill(); inkStroke(1.1);
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(55, -4, 6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      seaEye(40, -5, 2.4);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(42, -7); ctx.quadraticCurveTo(52, -16, 62, -11); ctx.stroke();
    }
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {          // the claw (or the touch-hole) flashes: a shot is coming
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#ffffff' : (cannon ? '#ff8a3a' : '#bfe8ff');
    ctx.beginPath(); ctx.arc(wallX(o) + dir * (cannon ? 78 : 77), sy, 3.2, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Charged Beam: an electric ray lying along the wall, its zap a short bolt ----------
function drawRay(o, sy) {
  const x0 = ZAP_BODY, L = o.len, col = o.seaCol || '#c9a868';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    const k = Math.min(1, o.t / 0.7);
    ctx.save(); ctx.strokeStyle = `rgba(160,220,255,${0.25 + 0.6 * k})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke(); ctx.restore();
  } else if (o.phase === 'zap') {
    const pts = []; for (let x = x0; x < x0 + L; x += 12) pts.push([x, x === x0 ? 0 : rand(-6, 6)]); pts.push([x0 + L, 0]);
    const bolt = () => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    bolt(); ctx.strokeStyle = 'rgba(150,210,255,.35)'; ctx.lineWidth = 9; ctx.stroke();
    bolt(); ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = 3.5; ctx.stroke();
    bolt(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';                 // the tail along the wall
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(x0 * 0.35, 0); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x0 * 0.66, 0, x0 * 0.36, 8.5, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);   // the round body
  ctx.fillStyle = 'rgba(0,0,0,.18)'; for (const [x, y] of [[0.5, -3], [0.62, 4], [0.76, -4], [0.82, 3]]) { ctx.beginPath(); ctx.arc(x0 * x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = o.phase === 'charge' ? '#bfe6ff' : 'rgba(255,255,255,.3)';            // the electric organs glow while charging
  for (const y of [-4, 4]) { ctx.beginPath(); ctx.ellipse(x0 * 0.7, y, 4, 2, 0, 0, Math.PI * 2); ctx.fill(); }
  seaEye(x0 - 6, -3, 1.8); seaEye(x0 - 6, 3, 1.8);
  ctx.restore();
}

// ---------- Telegraphed Sweep: an octopus arm with suckers reaching out of a crevice after a dashed wedge ----------
function drawOctopusArm(o, sy) {
  const col = o.seaCol || '#d9534a';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#1a2028'; ctx.beginPath(); ctx.ellipse(2, 0, 8, 17, 0, 0, Math.PI * 2); ctx.fill();   // the crevice, an eye peeking out
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(4, -8, 4, 0, Math.PI * 2); ctx.fill(); seaEye(5, -8, 2.2);
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save(); ctx.strokeStyle = `rgba(255,140,160,${0.3 + 0.55 * k})`; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke(); ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    const wy = x => Math.sin(x * 0.05 + o.t * 6) * 3;
    const w = x => 10 - 5 * x / Math.max(1, len);   // tapering from 20 wide to 10
    ctx.beginPath(); ctx.moveTo(-8, -w(0));
    for (let x = 0; x <= len - 14; x += 6) ctx.lineTo(x, wy(x) - w(x));
    for (let x = len - 14; x >= 0; x -= 6) ctx.lineTo(x, wy(x) + w(x));
    ctx.lineTo(-8, w(0)); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#f6d4c8';                     // suckers along the underside
    for (let x = 12; x < len - 18; x += 13) { ctx.beginPath(); ctx.arc(x, wy(x) + w(x) * 0.45, w(x) * 0.3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(len - 4, wy(len - 4), 13, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);   // the curled tip
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(len - 4, wy(len - 4), 6, 0.5, Math.PI * 1.8); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Proximity Blast: an old depth-charge barrel with a blinking light ----------
function drawBarrel(o, sy) {
  if (o.phase === 'boom' || (o.phase === 'gone' && o.t < BOOM_END - 0.35)) { drawBoom(o, sy, o.phase === 'boom' ? o.t : 0.35 + o.t); return; }
  if (o.phase === 'gone') return;
  if (o.phase === 'blink') {
    ctx.save(); ctx.strokeStyle = `rgba(230,60,50,${0.35 + 0.5 * Math.min(1, o.t / 0.6)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  const col = o.seaCol || '#5a6a4a';
  blit(sharedSprite('barrel' + col, 34, 36, 17, 18, () => {
    ctx.fillStyle = col; ctx.beginPath(); roundRectPath(-12, -13, 24, 26, 5); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = '#f4c430'; ctx.fillRect(-12, -2.5, 24, 5);
    ctx.fillStyle = COL.ink; for (let x = -10; x < 12; x += 6) { ctx.beginPath(); ctx.moveTo(x, -2.5); ctx.lineTo(x + 3, -2.5); ctx.lineTo(x + 1, 2.5); ctx.lineTo(x - 2, 2.5); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (const y of [-9, 9]) { ctx.moveTo(-12, y); ctx.lineTo(12, y); } ctx.stroke();
    ctx.fillStyle = 'rgba(160,90,40,.5)'; ctx.beginPath(); ctx.arc(6, 7, 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-7, -8, 2, 0, Math.PI * 2); ctx.fill();   // rust
  }), o.x, sy, Math.sin(o.t * 1.2) * 0.08);
  const on = o.phase === 'blink' ? Math.floor(o.t * 12) % 2 === 0 : Math.floor(o.t * 1.5) % 2 === 0;
  ctx.fillStyle = on ? '#ff4a3a' : '#7a2a24'; ctx.beginPath(); ctx.arc(o.x, sy - 14, 2.6, 0, Math.PI * 2); ctx.fill();
}

// ---------- Effect Zone: warm water shimmering up from a deep-sea vent, with tiny bubbles (slows the fall, never hurts) ----------
function drawWarmVent(o, sy) {
  const x0 = o.x - o.w / 2, y0 = sy - o.h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(255,170,90,.08)'; ctx.fillRect(x0, y0, o.w, o.h);
  ctx.strokeStyle = 'rgba(255,190,120,.5)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]); ctx.strokeRect(x0, y0, o.w, o.h); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,210,160,.45)'; ctx.lineWidth = 1.4;
  for (let k = 0; k < 4; k++) {                    // wavy shimmer lines drifting up
    const x = x0 + (k + 0.5) * o.w / 4, off = (o.t * 40 + k * 23) % 30;
    ctx.beginPath(); for (let y = y0 + o.h; y > y0; y -= 6) ctx.lineTo(x + Math.sin((y + off) * 0.15) * 4, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,240,220,.7)';
  for (let k = 0; k < 10; k++) {
    const ph = (o.t * 0.9 + k / 10) % 1;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5);
    ctx.beginPath(); ctx.arc(o.x + Math.sin(k * 2.7 + o.t * 2) * o.w * 0.35, y0 + o.h - ph * o.h, 1.4 + (k % 3) * 0.8, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Push Zone: the current, carrying bits of kelp along (added on top of the current's streaks) ----------
function drawKelpDrift(o, sy) {
  const dir = -o.side;
  ctx.save(); ctx.fillStyle = 'rgba(80,160,90,.75)';
  for (let k = 0; k < 5; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 5, run = (o.t * 150 + k * 97) % (W + 60);
    const x = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.ellipse(x, yy + Math.sin(o.t * 3 + k) * 4, 6, 2.4, Math.sin(o.t * 2 + k) * 0.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- Conveyor: a school of fish crossing (each 34 x 12, like a clip), facing the way they swim ----------
function drawSchoolFish(x, sy, dir, look, col) {
  blit(sharedSprite('school' + look + col + dir, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-16.5, -5.5); ctx.lineTo(-15, 0); ctx.lineTo(-16.5, 5.5); ctx.closePath(); ctx.fill(); inkStroke(1);   // tail
    ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(0, look === 'butterfly' ? -9 : -6.5, 16.5, 0); ctx.quadraticCurveTo(0, look === 'butterfly' ? 9 : 6.5, -11, 0); ctx.closePath(); ctx.fill(); inkStroke(1.1);
    if (look === 'butterfly') {                    // a yellow reef fish with a dark band through the eye and a fake eye-spot
      ctx.fillStyle = COL.ink; ctx.fillRect(8, -5, 2.4, 10);
      ctx.beginPath(); ctx.arc(-6, -2, 1.6, 0, Math.PI * 2); ctx.fill();
    } else if (look === 'lanternfish') {           // a dark deep-sea fish with rows of glowing dots
      ctx.fillStyle = '#9ff0ff'; for (const [px, py] of [[-6, 2.5], [-2, 3], [2, 3], [6, 2.5], [-4, -1], [1, -1]]) { ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // sardines: a silver body, a dark blue back and a few spots
      ctx.fillStyle = '#4a6a8a'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(0, -6.5, 16.5, 0); ctx.quadraticCurveTo(0, -2.5, -11, 0); ctx.fill();
      ctx.fillStyle = COL.ink; for (const px of [-3, 1, 5]) { ctx.beginPath(); ctx.arc(px, -1.2, 0.8, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(11, -1, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(11.6, -1, 1, 0, Math.PI * 2); ctx.fill();
  }), x, sy);
}

// ---------- Rising Projectile: a pufferfish puffed up with spikes, or a sea turtle swimming up ----------
function drawPuffer(o, sy) {
  const s = o.r / 16, col = o.seaCol || '#e8c860', turtle = o.look === 'turtle';
  blit(sharedSprite('puff' + o.look + col, 44, 44, 22, 22, () => {
    if (turtle) {                                  // seen from above, heading up: flippers, head, a patterned shell
      ctx.fillStyle = '#a8c880';
      for (const [x, y, a] of [[-9, -6, -0.7], [9, -6, 0.7], [-7, 8, 0.6], [7, 8, -0.6]]) { ctx.beginPath(); ctx.ellipse(x, y, 6, 2.6, a, 0, Math.PI * 2); ctx.fill(); inkStroke(1); }
      ctx.beginPath(); ctx.ellipse(0, -13, 3.6, 4, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 1, 10, 12, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.beginPath();
      hexAt(0, 1, 4); for (const [x, y] of [[-6, -5], [6, -5], [-6, 7], [6, 7]]) { ctx.moveTo(x * 0.55, 1 + y * 0.45); ctx.lineTo(x, y); }
      ctx.stroke();
    } else {                                       // a round spotted pufferfish covered in little spikes
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.3; ctx.beginPath();
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 15.5, Math.sin(a) * 15.5); }
      ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.fillStyle = '#fbf3dc'; ctx.beginPath(); ctx.ellipse(0, 5, 10, 6, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = 'rgba(90,60,20,.45)'; for (const [x, y] of [[-6, -6], [0, -9], [6, -5], [-8, 0], [8, 1]]) { ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill(); }
      seaEye(-5, -2, 3); seaEye(5, -2, 3);
      ctx.fillStyle = '#e07a6a'; ctx.beginPath(); ctx.ellipse(0, 5, 2.4, 1.8, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
    }
  }), o.x, sy, turtle ? Math.atan2(o.vy || -1, o.vx || 0) + Math.PI / 2 : o.rot * 0.3, s, s);
}
function hexAt(x, y, r) { for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 2; (i ? ctx.lineTo : ctx.moveTo).call(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r); } }

// ---------- Wall Bulge: a brain coral, a rock with anemones and a starfish, or the side of a sleeping whale ----------
function drawSeaBulge(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 6, i = -o.side, col = o.seaCol || '#6b7a85';
  const s = ownSprite(o, 'sprB', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    if (o.look === 'braincoral') {                 // winding grooves like a maze
      ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let k = -o.r; k < o.r; k += 11) { ctx.beginPath(); for (let t = -o.r; t <= o.r; t += 6) ctx.lineTo(t, k + Math.sin(t * 0.12 + k) * 4 + Math.sin(t * 0.31) * 2); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(-i * o.r * 0.1, -o.r * 0.3, o.r * 0.6, 0, Math.PI * 2); ctx.fill();
    } else if (o.look === 'whale') {               // a pale grooved belly, barnacles, a sleepy closed eye
      ctx.fillStyle = '#d8dee6'; ctx.beginPath(); ctx.arc(i * o.r * 0.1, o.r * 0.9, o.r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(80,90,110,.45)'; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let k = 0; k < 6; k++) { const y = o.r * 0.25 + k * 7; ctx.moveTo(-o.r, y); ctx.quadraticCurveTo(0, y - 6, o.r, y); }
      ctx.stroke();
      ctx.fillStyle = '#e8e2d0'; for (const [a, d] of [[-0.6, 0.7], [-0.4, 0.82], [-0.9, 0.6]]) { ctx.beginPath(); ctx.arc(i * Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, 3, 0, Math.PI * 2); ctx.fill(); }
      const ex = i * o.r * 0.55, ey = -o.r * 0.1;   // a closed eye with lashes, then a flipper tucked under the body
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ex, ey, 6, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.lineWidth = 1.3; ctx.beginPath(); for (const a of [0.6, 1.57, 2.5]) { ctx.moveTo(ex + Math.cos(a) * 6, ey + Math.sin(a) * 6); ctx.lineTo(ex + Math.cos(a) * 9.5, ey + Math.sin(a) * 9.5); } ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(i * o.r * 0.42, o.r * 0.55, o.r * 0.3, o.r * 0.1, i * 0.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
    } else {                                       // a mossy grey rock with an anemone and a little starfish on it
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(-i * o.r * 0.2, -o.r * 0.3, o.r * 0.75, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(70,140,90,.5)'; for (const [a, d] of [[-0.3, 0.85], [0.5, 0.75], [1.1, 0.8]]) { ctx.beginPath(); ctx.arc(i * Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, o.r * 0.18, 0, Math.PI * 2); ctx.fill(); }
      const ax = i * o.r * 0.55, ay = -o.r * 0.45;
      ctx.strokeStyle = '#ff7a9a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath();
      for (let k = -3; k <= 3; k++) { ctx.moveTo(ax, ay + 4); ctx.lineTo(ax + k * 2.5, ay - 6 + Math.abs(k)); }
      ctx.stroke();
      ctx.fillStyle = '#f28c28'; ctx.beginPath();
      const sx = i * o.r * 0.5, sy2 = o.r * 0.4;
      for (let k = 0; k < 10; k++) { const r = k % 2 ? 3.5 : 9, a = -Math.PI / 2 + k * Math.PI / 5; ctx.lineTo(sx + Math.cos(a) * r, sy2 + Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); inkStroke(1);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); inkStroke(1.8);
  });
  blit(s, cx, sy);
}

// ---------- Bouncing Slider: a swordfish, a piece of driftwood, or a wreck's broken mast, 13 thick ----------
function drawSwordfish(o, sy) {
  const L = o.len / 2, col = o.seaCol || '#4a6a8a';
  blit(ownSprite(o, 'sprS', o.len + 8, 24, L + 4, 12, () => {
    if (o.look === 'driftwood') {
      ctx.beginPath(); roundRectPath(-L, -5.5, o.len, 11, 5.5); ctx.fillStyle = col; ctx.fill(); inkStroke(1.3);
      ctx.strokeStyle = 'rgba(80,60,40,.5)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = -L + 10; x < L - 10; x += 18) { ctx.moveTo(x, -3); ctx.quadraticCurveTo(x + 9, -1, x + 16, -3); ctx.moveTo(x + 4, 2.5); ctx.lineTo(x + 14, 2); } ctx.stroke();
      ctx.fillStyle = '#e8e2d0'; for (const k of [-0.6, -0.45, 0.3]) { ctx.beginPath(); ctx.arc(k * L, 3, 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#4f8a4a'; ctx.beginPath(); ctx.ellipse(L * 0.6, -4, 6, 2, 0.2, 0, Math.PI * 2); ctx.fill();
    } else if (o.look === 'mast') {                // a broken mast from a wreck: rings, a frayed rope and a torn rag of sail
      ctx.beginPath(); roundRectPath(-L, -5, o.len, 10, 3); ctx.fillStyle = col; ctx.fill(); inkStroke(1.3);
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(-L + 2, -4, o.len - 4, 2.5);
      ctx.beginPath(); ctx.moveTo(L, -5); ctx.lineTo(L - 4, -1); ctx.lineTo(L + 1, 1); ctx.lineTo(L - 3, 5); ctx.lineTo(L - 8, 5); ctx.lineTo(L - 8, -5); ctx.closePath(); ctx.fillStyle = '#c8a878'; ctx.fill();   // the snapped end
      for (const k of [-0.75, -0.1, 0.45]) { ctx.fillStyle = '#5a5f68'; ctx.fillRect(k * L - 2, -6, 4, 12); }
      ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.moveTo(-L * 0.6, -5); ctx.lineTo(-L * 0.25, -5); ctx.lineTo(-L * 0.3, 0); ctx.lineTo(-L * 0.38, 3); ctx.lineTo(-L * 0.46, 0); ctx.lineTo(-L * 0.55, 4); ctx.closePath(); ctx.fill(); inkStroke(1);
      ctx.strokeStyle = '#a89870'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(L * 0.2, -4); ctx.quadraticCurveTo(L * 0.3, 5, L * 0.42, 4); ctx.stroke();
      ctx.fillStyle = '#4f8a4a'; ctx.beginPath(); ctx.ellipse(L * 0.05, 4, 5, 1.8, 0.2, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a swordfish facing right: the long bill, a tall fin, a forked tail
      const bx = L - L * 0.3;
      ctx.fillStyle = '#c8d0d8'; ctx.beginPath(); ctx.moveTo(bx, -1.5); ctx.lineTo(L, 0); ctx.lineTo(bx, 1.5); ctx.closePath(); ctx.fill(); inkStroke(1);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(-L + 10, 0); ctx.lineTo(-L, -6); ctx.lineTo(-L + 4, 0); ctx.lineTo(-L, 6); ctx.closePath(); ctx.fill(); inkStroke(1.1);
      ctx.beginPath(); ctx.moveTo(-L * 0.1, -4.5); ctx.lineTo(L * 0.05, -6.5); ctx.lineTo(L * 0.25, -4); ctx.closePath(); ctx.fill(); inkStroke(1);
      ctx.beginPath(); ctx.moveTo(-L + 9, 0); ctx.quadraticCurveTo(0, -6.5, bx + 2, -1.5); ctx.lineTo(bx + 2, 1.5); ctx.quadraticCurveTo(0, 6.5, -L + 9, 0); ctx.closePath(); ctx.fill(); inkStroke(1.3);
      ctx.fillStyle = '#e4ecf2'; ctx.beginPath(); ctx.moveTo(-L + 12, 0.5); ctx.quadraticCurveTo(0, 5.5, bx, 1.4); ctx.quadraticCurveTo(0, 2, -L + 12, 0.5); ctx.fill();
      seaEye(bx - 8, -1.2, 2.2);
    }
  }), o.x, sy, o.a, o.vx < 0 && o.look === 'swordfish' ? -1 : 1, 1);
}

// ---------- Spring Line: a fishing line between two bobbers, or a strand of old net between two glass floats ----------
// the line bounces the plane away; the floats hurt
function drawFishline(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, net = o.look === 'netline', col = o.seaCol || '#e0403a';
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9), bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + 4;
  const line = () => { ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); };
  ctx.save(); ctx.lineCap = 'round';
  if (net) {
    line(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.stroke();
    line(); ctx.strokeStyle = '#c8b890'; ctx.lineWidth = 2.4; ctx.stroke();
    for (let t = 0.12; t < 0.9; t += 0.11) {       // knots with loose net loops hanging
      const x = (1 - t) * (1 - t) * o.x1 + 2 * t * (1 - t) * cx + t * t * o.x2, y = (1 - t) * (1 - t) * (sy + dy1) + 2 * t * (1 - t) * cy + t * t * (sy + dy2);
      ctx.fillStyle = '#a89870'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(200,184,144,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y + 8, x + 12, y + 1); ctx.stroke();
    }
  } else {
    line(); ctx.strokeStyle = 'rgba(30,40,60,.5)'; ctx.lineWidth = 2.6; ctx.stroke();
    line(); ctx.strokeStyle = '#eef4f8'; ctx.lineWidth = 1.3; ctx.stroke();
  }
  ctx.restore();
  const float = sharedSprite('float' + o.look + col, 24, 24, 12, 12, () => {
    if (net) {                                     // a glass float in a little rope net
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
      ctx.strokeStyle = 'rgba(200,184,144,.9)'; ctx.lineWidth = 1; ctx.beginPath(); for (const a of [-0.6, 0.6]) { ctx.moveTo(-8 * Math.cos(a), -8 * Math.sin(a)); ctx.lineTo(8 * Math.cos(a), 8 * Math.sin(a)); } ctx.moveTo(-8.5, 0); ctx.lineTo(8.5, 0); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-3, -4, 2.6, 1.4, -0.5, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a red-and-white bobber
      ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 8.5, Math.PI, 0); ctx.fillStyle = col; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); inkStroke(1.3);
      ctx.fillStyle = COL.ink; ctx.fillRect(-1, -11, 2, 3);
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-3, -4, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  });
  blit(float, o.x1, sy + dy1); blit(float, o.x2, sy + dy2);
}

// ---------- Sweeping Arm: an anchor on its chain swinging round a ring bolt, or a giant squid's tentacle (deep) ----------
function drawAnchorChain(o, sy) {
  const L = o.L, hh = o.hh || 7, tentacle = o.look === 'tentacle', col = o.seaCol || '#5a5f68';
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.ang);
  if (tentacle) {                                  // tapering, with suckers and a wide club at the end
    ctx.beginPath(); ctx.moveTo(4, -5); ctx.quadraticCurveTo(L * 0.5, -3.5, L - 22, -3); ctx.lineTo(L - 22, 3); ctx.quadraticCurveTo(L * 0.5, 3.5, 4, 5); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); inkStroke(1.2);
    ctx.beginPath(); ctx.ellipse(L - 12, 0, 11, hh - 0.5, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#f6d4c8'; for (let x = L - 19; x < L - 4; x += 4.5) { ctx.beginPath(); ctx.arc(x, 2, 1.4, 0, Math.PI * 2); ctx.fill(); }
    for (let x = 14; x < L - 26; x += 10) { ctx.beginPath(); ctx.arc(x, 1.6, 1.1, 0, Math.PI * 2); ctx.fill(); }
  } else {                                         // chain links to a small anchor at the tip
    for (let x = 8, k = 0; x < L - 22; x += 9, k++) {
      ctx.beginPath(); k % 2 ? ctx.ellipse(x, 0, 5.5, 1.6, 0, 0, Math.PI * 2) : ctx.ellipse(x, 0, 5.5, 3.6, 0, 0, Math.PI * 2);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 3.2; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.stroke();
    }
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(L - 22, 0, 3.2, 0, Math.PI * 2); ctx.lineWidth = 1; ctx.fill(); inkStroke(1);                       // the anchor's ring
    ctx.beginPath(); roundRectPath(L - 20, -1.8, 19, 3.6, 1.5); ctx.fill(); inkStroke(1);                                         // the shank
    ctx.beginPath(); roundRectPath(L - 17, -6, 2.6, 12, 1.2); ctx.fill(); inkStroke(1);                                           // the stock
    ctx.beginPath(); ctx.moveTo(L - 1, 0); ctx.quadraticCurveTo(L - 3, -6.5, L - 9, -6.5); ctx.lineTo(L - 7, -4); ctx.quadraticCurveTo(L - 4, -3.5, L - 4, 0);
    ctx.quadraticCurveTo(L - 4, 3.5, L - 7, 4); ctx.lineTo(L - 9, 6.5); ctx.quadraticCurveTo(L - 3, 6.5, L - 1, 0); ctx.closePath(); ctx.fill(); inkStroke(1.1);   // the flukes
  }
  ctx.restore();
  ctx.fillStyle = tentacle ? '#2a2030' : '#6a6460'; ctx.beginPath(); ctx.arc(o.x, sy, 8, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);   // ring bolt (or the dark hole it reaches from)
  ctx.fillStyle = tentacle ? col : '#8a8a92'; ctx.beginPath(); ctx.arc(o.x, sy, 3.4, 0, Math.PI * 2); ctx.fill();
}

// ---------- Spinning Blades: a crab (or a lobster) spinning with its two claws snapping open and shut ----------
// each blade is a claw arm; the round shell in the middle covers the two handle circles behind the pivot
function drawCrab(o, sy) {
  const col = o.seaCol || '#e0503a', lobster = o.look === 'lobster';
  const claw = sharedSprite('claw' + col, 106, 30, 34, 15, () => {
    ctx.fillStyle = col;
    ctx.beginPath(); roundRectPath(0, -3.5, 36, 7, 3.5); ctx.fill(); inkStroke(1.1);                       // the arm
    ctx.beginPath(); ctx.ellipse(46, 0, 13, 4.6, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);           // the claw
    ctx.beginPath(); ctx.moveTo(56, -2.5); ctx.quadraticCurveTo(65, -3, 66, 0); ctx.lineTo(57, 0.6); ctx.closePath(); ctx.fill(); inkStroke(1);
    ctx.beginPath(); ctx.moveTo(56, 2.5); ctx.quadraticCurveTo(63, 3.5, 64, 1.6); ctx.lineTo(57, 1.2); ctx.closePath(); ctx.fill(); inkStroke(1);
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(44, -2, 6, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  });
  for (const s of [-1, 1]) blit(claw, o.x, sy, o.rot + s * o.open / 2);
  const body = sharedSprite('crab' + o.look + col, 70, 70, 35, 35, () => {
    ctx.fillStyle = col; ctx.strokeStyle = COL.ink; ctx.lineCap = 'round';
    if (lobster) {                                 // a long body and fanned tail, pointing away from the claws
      ctx.beginPath(); ctx.moveTo(-32, -7); ctx.lineTo(-32, 7); ctx.lineTo(-24, 3); ctx.closePath(); ctx.fill(); inkStroke(1.1);
      for (const x of [-22, -15, -8]) { ctx.beginPath(); ctx.ellipse(x, 0, 4.6, 8, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.1); }
      ctx.beginPath(); ctx.ellipse(5, 0, 13, 11, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
      ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(14, -4); ctx.quadraticCurveTo(26, -12, 30, -26); ctx.moveTo(14, 4); ctx.quadraticCurveTo(26, 12, 30, 26); ctx.stroke();
      seaEye(14, -4, 2.2); seaEye(14, 4, 2.2);
    } else {                                       // a round shell with little legs, two eyes on stalks toward the claws
      ctx.lineWidth = 2.6; ctx.beginPath();
      for (const s of [-1, 1]) for (const a of [2.2, 2.55, 2.9]) { ctx.moveTo(Math.cos(a) * 18, s * Math.sin(a) * 18); ctx.lineTo(Math.cos(a) * 28, s * Math.sin(a) * 28); }
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-4, 0, 22, 25, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.5);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(-10, -8, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.15)'; for (const [x, y] of [[-14, 6], [-8, 12], [-2, 4]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(12, -5); ctx.lineTo(18, -7); ctx.moveTo(12, 5); ctx.lineTo(18, 7); ctx.stroke();
      seaEye(19, -7.5, 2.6); seaEye(19, 7.5, 2.6);
    }
  });
  blit(body, o.x, sy, o.rot);
}
