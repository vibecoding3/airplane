// Paper Nosedive — Desert map background: the mesa top the plane sets off from, scenery by rock layer (camels,
// lizards, meerkats, oasis palms, fossils in the rock, leaves in amber) and sand, dust, drips, shell bits and amber
// motes drifting past. None of it collides.
'use strict';

// scenery drawings join the FISH table so drawFishes can draw them; w,h is the sprite box, facing right
Object.assign(FISH, {
  deCamel: { w: 90, h: 70, alpha: 0.3, paint() {                 // a camel far away, walking
    ctx.fillStyle = '#9a6a3a';
    ctx.beginPath(); ctx.ellipse(-4, 2, 24, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-6, -8, 10, 8, 0, Math.PI, 0); ctx.fill();          // the hump
    for (const x of [-20, -12, 6, 14]) ctx.fillRect(x, 10, 3.5, 22);
    ctx.beginPath(); ctx.moveTo(16, -2); ctx.quadraticCurveTo(30, -4, 30, -18); ctx.lineTo(36, -20); ctx.lineTo(38, -14); ctx.lineTo(34, -12); ctx.quadraticCurveTo(34, 4, 18, 6); ctx.fill();   // neck and head
  } },
  deLizard: { w: 60, h: 30, still: true, alpha: 0.6, cols: [{ c: '#6fae4a' }, { c: '#c89a40' }], paint(k) {   // a lizard sunbathing on a rock
    ctx.fillStyle = '#b89a78'; ctx.beginPath(); ctx.ellipse(0, 8, 24, 6, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = k.c;
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -1, 5, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.c; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-22, 2, -26, -4); ctx.moveTo(-6, 2); ctx.lineTo(-9, 7); ctx.moveTo(6, 2); ctx.lineTo(9, 7); ctx.stroke();
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(15, -2, 1, 0, Math.PI * 2); ctx.fill();
  } },
  deWren: { w: 34, h: 24, paint() {                                // a little desert bird flying
    ctx.fillStyle = '#a0805a'; ctx.beginPath(); ctx.ellipse(0, 2, 9, 5.5, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a6040'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(0, -12, 7, -9); ctx.quadraticCurveTo(4, -2, -3, 0); ctx.fill();
    ctx.fillStyle = '#efe2c8'; ctx.beginPath(); ctx.ellipse(2, 5, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.moveTo(11, -2); ctx.lineTo(16, -1); ctx.lineTo(11, 0); ctx.fill(); ctx.beginPath(); ctx.arc(9, -3, 0.9, 0, Math.PI * 2); ctx.fill();
  } },
  deMeerkat: { w: 30, h: 50, still: true, alpha: 0.6, paint() {     // a meerkat standing guard
    ctx.fillStyle = '#c8a070';
    ctx.beginPath(); ctx.ellipse(0, 6, 6, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(1, -12, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#efe2c8'; ctx.beginPath(); ctx.ellipse(1, 8, 3.5, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.ellipse(3, -13, 1.6, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b89a78'; ctx.beginPath(); ctx.ellipse(0, 21, 12, 3.5, 0, 0, Math.PI * 2); ctx.fill();   // its mound
  } },
  deBird: { w: 60, h: 30, paint() {                                 // a long-legged desert runner bird (an original design)
    ctx.fillStyle = '#8a7058';
    ctx.beginPath(); ctx.ellipse(-2, -2, 12, 6, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(-26, -8); ctx.lineTo(-12, 0); ctx.fill();       // tail out behind
    ctx.beginPath(); ctx.arc(11, -8, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a4838'; ctx.beginPath(); ctx.moveTo(9, -12); ctx.lineTo(7, -16); ctx.lineTo(12, -12); ctx.fill();   // a small crest
    ctx.strokeStyle = '#5a4838'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-2, 3); ctx.lineTo(-6, 12); ctx.moveTo(2, 3); ctx.lineTo(6, 12); ctx.stroke();
    ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.moveTo(15, -8); ctx.lineTo(22, -7); ctx.lineTo(15, -6); ctx.fill();
  } },
  deFennec: { w: 50, h: 34, paint() {                              // a fennec fox with its huge ears
    ctx.fillStyle = '#e8c890';
    ctx.beginPath(); ctx.ellipse(-2, 4, 12, 6.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-12, 2); ctx.quadraticCurveTo(-24, -2, -22, 8); ctx.quadraticCurveTo(-16, 10, -12, 6); ctx.fill();
    ctx.beginPath(); ctx.arc(11, -1, 5, 0, Math.PI * 2); ctx.fill();
    for (const [x, a] of [[8, -0.4], [14, 0.3]]) { ctx.beginPath(); ctx.ellipse(x, -9, 3, 7, a, 0, Math.PI * 2); ctx.fill(); }
    for (const x of [-8, -3, 4, 8]) ctx.fillRect(x, 9, 2.2, 7);
    ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.arc(16, 0, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(12, -2, 0.9, 0, Math.PI * 2); ctx.fill();
  } },
  deMirage: { w: 120, h: 30, still: true, alpha: 0.25, paint() {     // a shimmering mirage lake
    ctx.fillStyle = '#9fd8f0'; ctx.beginPath(); ctx.ellipse(0, 0, 56, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (const [x, y, w] of [[-30, -2, 18], [4, 2, 22], [26, -3, 14]]) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y - 2, x + w, y); }
    ctx.stroke();
  } },
  dePalm: { w: 80, h: 90, still: true, alpha: 0.55, paint() {        // an oasis palm leaning out from its wall
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-30, 42); ctx.quadraticCurveTo(-18, 0, 4, -24); ctx.stroke();
    ctx.strokeStyle = '#3f8a3a'; ctx.lineWidth = 4;
    for (const [x, y] of [[-20, -20], [-14, -38], [14, -40], [28, -22], [22, -6]]) { ctx.beginPath(); ctx.moveTo(4, -24); ctx.quadraticCurveTo((4 + x) / 2, (y - 24) / 2 - 8, x, y); ctx.stroke(); }
    ctx.fillStyle = '#7a5030'; for (const [x, y] of [[0, -20], [6, -19]]) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
  } },
  deDragonfly: { w: 36, h: 24, paint() {
    ctx.fillStyle = 'rgba(220,240,255,.8)';
    for (const [x, a] of [[-2, -0.3], [4, 0.3]]) { ctx.beginPath(); ctx.ellipse(x, -5, 9, 3, a, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, 5, 9, 3, -a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#2f9ab0'; ctx.fillRect(-14, -1.5, 22, 3); ctx.beginPath(); ctx.arc(10, 0, 3.2, 0, Math.PI * 2); ctx.fill();
  } },
  // the fossil beds (800–1,500 m) and the amber (1,500 m +): fossils in the rock and leaves trapped in amber
  deFossilFern: { w: 60, h: 70, still: true, alpha: 0.4, paint() {
    ctx.strokeStyle = '#5a4e40'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 32); ctx.quadraticCurveTo(4, 0, 0, -32); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath();
    for (let y = -26; y < 28; y += 7) { const k = 1 - Math.abs(y) / 40; ctx.moveTo(1, y); ctx.lineTo(1 + 16 * k, y - 6); ctx.moveTo(1, y); ctx.lineTo(1 - 16 * k, y - 6); }
    ctx.stroke();
  } },
  deFossilFish: { w: 70, h: 34, still: true, alpha: 0.4, paint() {
    ctx.strokeStyle = '#5a4e40'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(22, 0); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.beginPath(); for (let x = -18; x < 16; x += 5) { ctx.moveTo(x, 0); ctx.lineTo(x - 3, -8); ctx.moveTo(x, 0); ctx.lineTo(x - 3, 8); } ctx.stroke();
    ctx.beginPath(); ctx.arc(26, 0, 6, 0, Math.PI * 2); ctx.moveTo(-26, 0); ctx.lineTo(-33, -7); ctx.moveTo(-26, 0); ctx.lineTo(-33, 7); ctx.stroke();
  } },
  deShell: { w: 40, h: 40, still: true, alpha: 0.4, paint() {       // a spiral shell in the rock
    ctx.strokeStyle = '#5a4e40'; ctx.lineWidth = 2; ctx.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.2) { const r = 1.5 + a * 1.1; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.stroke();
  } },
  deBones: { w: 90, h: 30, still: true, alpha: 0.35, paint() {      // a scatter of old bones
    ctx.fillStyle = '#e8dcc0';
    for (const [x, y, a] of [[-24, 2, 0.3], [6, -4, -0.2], [26, 6, 0.6]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillRect(-12, -2, 24, 4); for (const dx of [-12, 12]) for (const dy of [-2, 2]) { ctx.beginPath(); ctx.arc(dx, dy, 2.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  } },
  deAmberLeaf: { w: 50, h: 50, still: true, alpha: 0.55, paint() {
    ctx.fillStyle = 'rgba(255,190,80,.6)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 17, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6a7a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 5, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a5a1a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-9, 5); ctx.lineTo(9, -5); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-8, -8, 5, 2.5, -0.5, 0, Math.PI * 2); ctx.fill();
  } },
  deAmberDrop: { w: 30, h: 36, still: true, alpha: 0.55, paint() {
    ctx.fillStyle = 'rgba(255,200,90,.7)'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(12, 4, 0, 14); ctx.quadraticCurveTo(-12, 4, 0, -14); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-3, 2, 2, 4, 0.2, 0, Math.PI * 2); ctx.fill();
  } },
  // rare: a hot-air balloon near the top, a giant fossil skeleton deeper down
  deBalloon: { w: 60, h: 90, alpha: 0.35, paint() {
    ctx.fillStyle = '#e0503a'; ctx.beginPath(); ctx.ellipse(0, -14, 22, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4c430'; for (const x of [-8, 8]) { ctx.beginPath(); ctx.ellipse(x, -14, 4, 25, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-14, 6); ctx.lineTo(-6, 26); ctx.moveTo(14, 6); ctx.lineTo(6, 26); ctx.stroke();
    ctx.fillStyle = '#8a5a32'; ctx.fillRect(-7, 26, 14, 9);
  } },
  deSkeleton: { w: 260, h: 110, still: true, alpha: 0.2, paint() {  // a huge long-necked fossil skeleton
    ctx.strokeStyle = '#3a3026'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-120, 10); ctx.quadraticCurveTo(-60, -20, 0, -10); ctx.quadraticCurveTo(60, 0, 90, -40); ctx.lineTo(110, -46); ctx.stroke();   // tail, back, neck
    ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = -40; x <= 30; x += 10) { ctx.moveTo(x, -12 + Math.abs(x) * 0.05); ctx.quadraticCurveTo(x + 4, 6, x, 18); }   // ribs
    for (const x of [-34, 24]) { ctx.moveTo(x, -6); ctx.lineTo(x - 4, 40); ctx.moveTo(x + 6, -6); ctx.lineTo(x + 8, 40); }       // legs
    ctx.stroke();
    ctx.beginPath(); ctx.ellipse(116, -46, 10, 6, 0.3, 0, Math.PI * 2); ctx.stroke();
  } }
});
// which scenery can appear at each depth level (dunes, canyon, oasis, fossil beds, then amber twice)
const DESERT_TIERS = [
  ['deCamel', 'deLizard', 'deWren', 'deMeerkat', 'deMirage'], ['deLizard', 'deBird', 'deFennec', 'deCamel', 'deMeerkat'],
  ['dePalm', 'deDragonfly', 'deMirage', 'deFennec', 'dePalm'], ['deFossilFern', 'deFossilFish', 'deShell', 'deBones'],
  ['deAmberLeaf', 'deAmberDrop', 'deFossilFern', 'deShell'], ['deAmberLeaf', 'deAmberDrop', 'deBones', 'deAmberLeaf']
];
function spawnDesertThing(lineY) {
  if (Math.random() < 0.3) return 0;
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  let kind = DESERT_TIERS[tier][ri(0, DESERT_TIERS[tier].length - 1)];
  if (lineY - lastSceneryY > 900 && Math.random() < 0.05 && (m < 400 || m > 800)) { kind = m < 400 ? 'deBalloon' : 'deSkeleton'; lastSceneryY = lineY; }
  const def = FISH[kind], s = rand(0.8, 1), dir = Math.random() < 0.5 ? -1 : 1;
  const wallHung = kind === 'dePalm';
  // a palm leans out from a wall toward the middle
  const x = wallHung ? (dir > 0 ? rand(20, 50) : rand(W - 50, W - 20)) : rand(40, W - 40);
  const speed = def.still ? 0 : kind === 'deBird' || kind === 'deWren' || kind === 'deDragonfly' ? rand(30, 55) : rand(8, 18);
  const v = def.cols ? ri(0, def.cols.length - 1) : 0;
  fishes.push({ kind, v, tier, x, y: lineY, dir, s, t: rand(0, 6), vx: dir * speed, w: def.w * s, ext: def.h * s });
  return def.h * s;
}

// the start of a Desert run: the top of a mesa at midday, with a cactus, a lizard sunbathing on a rock, dunes far away
// and a hot-air balloon. It slides up out of view within the first ~35 m, like the Earth in Space.
const desertStartY = () => planeScreenY() - 70 - dist * 0.22;      // the mesa's edge on screen
function drawDesertStart() {
  const y = desertStartY();
  if (y < -40) return;
  blit(sharedSprite('desertTop', W, 520, 0, 500, () => {
    const sky = ctx.createLinearGradient(0, -500, 0, -60);
    sky.addColorStop(0, '#4fa8e8'); sky.addColorStop(1, '#cfeefa');
    ctx.fillStyle = sky; ctx.fillRect(0, -500, W, 450);
    ctx.fillStyle = 'rgba(255,240,170,.4)'; ctx.beginPath(); ctx.arc(80, -150, 32, 0, Math.PI * 2); ctx.fill();   // the sun
    ctx.fillStyle = '#fff2a0'; ctx.beginPath(); ctx.arc(80, -150, 20, 0, Math.PI * 2); ctx.fill();
    // a hot-air balloon far away
    ctx.fillStyle = '#e0503a'; ctx.beginPath(); ctx.ellipse(300, -160, 10, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4c430'; ctx.fillRect(298, -172, 4, 24);
    ctx.fillStyle = '#8a5a32'; ctx.fillRect(297, -144, 6, 4);
    // dunes far away, then nearer
    for (const [col, base, amp, seed] of [['#f0d898', -88, 14, 1], ['#e8c278', -66, 10, 4]]) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0);
      for (let x = 0; x <= W; x += 10) ctx.lineTo(x, base - Math.abs(Math.sin(x * 0.012 + seed)) * amp * 2);
      ctx.lineTo(W, 0); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2; ctx.beginPath();                               // heat shimmer
    for (const [x, yy] of [[60, -100], [190, -112], [330, -96]]) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 8, yy - 4, x + 16, yy); ctx.quadraticCurveTo(x + 24, yy + 4, x + 32, yy); }
    ctx.stroke();
    // the mesa top: flat orange rock with layered sides
    ctx.fillStyle = '#d0884a'; ctx.fillRect(0, -44, W, 44);
    ctx.fillStyle = '#e09a5c'; ctx.fillRect(0, -48, W, 8);
    ctx.fillStyle = 'rgba(120,60,20,.25)'; for (const yy of [-30, -18, -8]) ctx.fillRect(0, yy, W, 3);
    // a cactus and a lizard on a rock
    ctx.fillStyle = '#4f9a3a'; ctx.strokeStyle = '#2a4a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); roundRectPath(110, -110, 14, 64, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); roundRectPath(94, -92, 10, 24, 5); ctx.fill(); ctx.stroke(); ctx.fillRect(100, -74, 12, 8);
    ctx.beginPath(); roundRectPath(130, -100, 10, 26, 5); ctx.fill(); ctx.stroke(); ctx.fillRect(122, -80, 12, 8);
    ctx.fillStyle = '#ff6a9a'; ctx.beginPath(); ctx.arc(117, -112, 4, 0, Math.PI * 2); ctx.fill();               // a flower on top
    ctx.fillStyle = '#b89a78'; ctx.beginPath(); ctx.ellipse(300, -46, 30, 12, 0, Math.PI, 0); ctx.fill();         // the rock
    ctx.fillStyle = '#6fae4a'; ctx.beginPath(); ctx.ellipse(298, -60, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();    // the lizard
    ctx.beginPath(); ctx.ellipse(313, -61, 5.5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6fae4a'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(286, -60); ctx.quadraticCurveTo(276, -58, 272, -64); ctx.stroke();
  }), 0, y);
  // the lizard flicks its tongue now and then
  const t = titleTime + time;
  if (Math.floor(t * 1.5) % 4 === 0) { ctx.strokeStyle = '#e0406a'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(318, y - 61); ctx.lineTo(325, y - 61); ctx.stroke(); }
  ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(315, y - 62, 1, 0, Math.PI * 2); ctx.fill();
}

// drifting specks by layer: sand grains blowing across (dunes), rock dust falling (canyon), water drips (oasis),
// pale shell bits (fossil beds), then glowing amber motes rising. Faint, so they never hide an obstacle. Positions
// come from a hash of the page chunk, so nothing is stored.
function drawDesertParticles() {
  const CH = 300, N = 12, t = titleTime + time;
  ctx.save();
  for (let c = Math.floor((dist - 20) / CH); c * CH < dist + H + 20; c++) {
    const L = desertLayer(c * CH);
    for (let i = 0; i < N; i++) {
      const hx = hash(c * 97 + i * 13.1), hy = hash(c * 53 + i * 7.7), hs = hash(c * 11 + i * 3.3);
      let x = hx * W, y = c * CH + hy * CH - dist;
      if (L === 0) {                               // sand grains blowing sideways
        x = ((hx * W + t * (40 + hs * 30)) % (W + 20)) - 10;
        ctx.globalAlpha = 0.45; ctx.fillStyle = '#c8a060'; ctx.fillRect(x, y, 2 + hs * 2, 1.4);
      } else if (L === 1) {                        // rock dust falling
        y = c * CH + ((hy * CH + t * (20 + hs * 15)) % CH) - dist;
        ctx.globalAlpha = 0.4; ctx.fillStyle = '#a0603a'; ctx.fillRect(x, y, 1.6, 1.6);
      } else if (L === 2) {                        // water drips seeping through the rock
        y = c * CH + ((hy * CH + t * (50 + hs * 30)) % CH) - dist;
        ctx.globalAlpha = 0.5; ctx.fillStyle = '#d8f4ff'; ctx.fillRect(x, y, 1.4, 4 + hs * 3);
      } else if (L === 3) {                        // little bits of shell in the rock
        ctx.globalAlpha = 0.35; ctx.strokeStyle = '#efe2c8'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, 2 + hs * 2, hs * 6, hs * 6 + 2); ctx.stroke();
      } else {                                     // glowing amber motes rising
        y = c * CH + (((hy * CH - t * (12 + hs * 15)) % CH) + CH) % CH - dist;
        const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + hs * 2) + i);
        ctx.fillStyle = '#ffe08a'; ctx.globalAlpha = 0.15 * tw; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.3 + 0.5 * tw; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  ctx.restore();
}
