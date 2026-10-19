// Paper Nosedive — Volcano map background: the crater rim above a tropical island that the plane dives into, scenery
// by layer (parrots, geckos, steam vents, sulfur, glowing cracks, fire salamanders, magma slugs) and leaves, ash,
// steam, lava drips and magma bubbles drifting past. None of it collides.
'use strict';

// scenery drawings join the FISH table so drawFishes can draw them; w,h is the sprite box, facing right
Object.assign(FISH, {
  voParrot: { w: 44, h: 30, cols: [{ body: '#e03a2a', wing: '#2f6fd1' }, { body: '#3fae4a', wing: '#f4c430' }], paint(k) {
    ctx.fillStyle = k.wing; ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-22, 8); ctx.lineTo(-20, 12); ctx.lineTo(-8, 6); ctx.fill();   // tail
    ctx.fillStyle = k.body; ctx.beginPath(); ctx.ellipse(0, 2, 11, 6.5, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = k.wing; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.quadraticCurveTo(0, -14, 8, -11); ctx.quadraticCurveTo(5, -2, -4, 0); ctx.fill();
    ctx.fillStyle = '#f4ecd8'; ctx.beginPath(); ctx.moveTo(14, -4); ctx.quadraticCurveTo(19, -3, 15, 1); ctx.fill();
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(11, -4, 1, 0, Math.PI * 2); ctx.fill();
  } },
  voGecko: { w: 50, h: 30, still: true, alpha: 0.6, cols: [{ c: '#6fd06a' }, { c: '#f0a030' }], paint(k) {
    ctx.fillStyle = k.c;
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, 0, 4.6, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.c; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(-9, 0); ctx.quadraticCurveTo(-18, 6, -22, 0);
    for (const [x, d] of [[-5, -1], [-5, 1], [5, -1], [5, 1]]) { ctx.moveTo(x, d * 2); ctx.lineTo(x + (x < 0 ? -3 : 3), d * 8); }
    ctx.stroke();
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(14, -1, 0.9, 0, Math.PI * 2); ctx.fill();
  } },
  voFlower: { w: 40, h: 40, still: true, alpha: 0.6, cols: [{ c: '#ff5a8a' }, { c: '#ffb030' }], paint(k) {
    ctx.fillStyle = '#3f8a3a'; for (const a of [-0.8, 0.8]) { ctx.beginPath(); ctx.ellipse(Math.sin(a) * 10, 8, 8, 3.5, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = k.c; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 7, Math.sin(a) * 7 - 4, 6, 3.5, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(0, -4, 3, 0, Math.PI * 2); ctx.fill();
  } },
  voPalm: { w: 80, h: 90, still: true, alpha: 0.55, paint() {        // a palm leaning out from its wall
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-30, 42); ctx.quadraticCurveTo(-18, 0, 4, -24); ctx.stroke();
    ctx.strokeStyle = '#2f8a3a'; ctx.lineWidth = 4;
    for (const [x, y] of [[-20, -20], [-14, -38], [14, -40], [28, -22], [22, -6]]) { ctx.beginPath(); ctx.moveTo(4, -24); ctx.quadraticCurveTo((4 + x) / 2, (y - 24) / 2 - 8, x, y); ctx.stroke(); }
  } },
  voVent: { w: 50, h: 60, still: true, alpha: 0.5, paint() {        // a little steam vent in the rock
    ctx.fillStyle = '#3a3630'; ctx.beginPath(); ctx.ellipse(0, 20, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (const [x, y, r] of [[0, 10, 6], [3, -2, 8], [-2, -16, 9], [4, -28, 7]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  } },
  voSulfur: { w: 50, h: 40, still: true, alpha: 0.6, paint() {       // a crust of yellow sulfur crystals
    ctx.fillStyle = '#5a5650'; ctx.beginPath(); ctx.ellipse(0, 12, 22, 6, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#f0d030';
    for (const [x, h, w] of [[-12, 12, 6], [-3, 18, 7], [7, 14, 6], [15, 9, 5]]) { ctx.beginPath(); ctx.moveTo(x - w / 2, 12); ctx.lineTo(x - w / 2, 12 - h + 3); ctx.lineTo(x, 12 - h); ctx.lineTo(x + w / 2, 12 - h + 3); ctx.lineTo(x + w / 2, 12); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-5, -2, 1.5, 12);
  } },
  voCrack: { w: 60, h: 70, still: true, alpha: 0.6, paint() {        // a glowing crack in the dark rock
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); ctx.moveTo(-6, -32); ctx.lineTo(4, -16); ctx.lineTo(-4, -2); ctx.lineTo(8, 12); ctx.lineTo(0, 32); ctx.moveTo(-4, -2); ctx.lineTo(-18, 8); };
    path(); ctx.strokeStyle = 'rgba(255,120,40,.35)'; ctx.lineWidth = 8; ctx.stroke();
    path(); ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 3; ctx.stroke();
    path(); ctx.strokeStyle = '#ffe080'; ctx.lineWidth = 1; ctx.stroke();
  } },
  voSalamander: { w: 60, h: 26, paint() {                          // a cartoon fire salamander crawling past
    ctx.fillStyle = '#2a2420';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(15, 0, 5.5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2a2420'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(-12, 0); ctx.quadraticCurveTo(-22, -4, -27, 2);
    for (const [x, d] of [[-6, -1], [-6, 1], [7, -1], [7, 1]]) { ctx.moveTo(x, d * 3); ctx.lineTo(x + (x < 0 ? -3 : 3), d * 9); }
    ctx.stroke();
    ctx.fillStyle = '#ff8a2a'; for (const [x, y] of [[-8, -1], [-2, 1.5], [4, -1.5], [10, 1], [16, -1.5]]) { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffe080'; ctx.beginPath(); ctx.arc(18, -1, 1, 0, Math.PI * 2); ctx.fill();
  } },
  voSlug: { w: 40, h: 20, paint() {                                // a glowing magma slug
    ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); ctx.moveTo(-16, 5); ctx.quadraticCurveTo(-10, -6, 6, -4); ctx.quadraticCurveTo(16, -4, 14, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd060'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff7a2a'; ctx.lineWidth = 1.4; ctx.beginPath(); for (const x of [10, 14]) { ctx.moveTo(x, -3); ctx.lineTo(x + 2, -9); } ctx.stroke();
  } },
  voBlob: { w: 90, h: 90, still: true, alpha: 0.3, paint() {         // a huge slow magma bubble far behind
    ctx.fillStyle = '#ffb040'; ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe080'; ctx.beginPath(); ctx.arc(-10, -10, 14, 0, Math.PI * 2); ctx.fill();
  } },
  // rare: a geologist's rope dangling from far above (above 800 m), a huge lava fountain far behind (deeper)
  voRope: { w: 30, h: 160, still: true, alpha: 0.45, paint() {
    ctx.strokeStyle = '#e0503a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -80); ctx.quadraticCurveTo(4, 0, 0, 60); ctx.stroke();
    ctx.strokeStyle = '#c0c4cc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 66, 4, 6, 0, 0, Math.PI * 2); ctx.stroke();   // a carabiner
  } },
  voFountain: { w: 140, h: 180, still: true, alpha: 0.22, paint() {
    ctx.fillStyle = '#ff8a2a';
    ctx.beginPath(); ctx.moveTo(-14, 90); ctx.quadraticCurveTo(-8, -40, 0, -86); ctx.quadraticCurveTo(8, -40, 14, 90); ctx.fill();
    for (const [x, y, r] of [[-30, -50, 8], [28, -60, 7], [-44, -10, 6], [40, -18, 9], [-18, -78, 5], [20, -84, 6]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffe080'; ctx.beginPath(); ctx.moveTo(-5, 90); ctx.quadraticCurveTo(-3, -30, 0, -70); ctx.quadraticCurveTo(3, -30, 5, 90); ctx.fill();
  } }
});
// which scenery can appear at each depth level (jungle, ash cloud, crater, lava tubes, then the magma chamber twice)
const VOLCANO_TIERS = [
  ['voParrot', 'voGecko', 'voFlower', 'voPalm', 'voParrot'], ['voParrot', 'voVent', 'voGecko', 'voSulfur'],
  ['voVent', 'voSulfur', 'voSalamander', 'voCrack'], ['voCrack', 'voSalamander', 'voSlug', 'voSulfur'],
  ['voSlug', 'voCrack', 'voSalamander', 'voBlob'], ['voBlob', 'voSlug', 'voCrack', 'voSalamander']
];
function spawnVolcanoThing(lineY) {
  if (Math.random() < 0.3) return 0;
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  let kind = VOLCANO_TIERS[tier][ri(0, VOLCANO_TIERS[tier].length - 1)];
  if (kind === 'voBlob' && lineY - lastSceneryY < 600) kind = 'voCrack';      // the big bubbles keep apart
  if (lineY - lastSceneryY > 900 && Math.random() < 0.05) kind = m < 800 ? 'voRope' : 'voFountain';
  if (kind === 'voRope' || kind === 'voFountain' || kind === 'voBlob') lastSceneryY = lineY;
  const def = FISH[kind], s = rand(0.8, 1), dir = Math.random() < 0.5 ? -1 : 1;
  const wallHung = kind === 'voPalm' || kind === 'voSulfur' || kind === 'voVent';
  // palms, sulfur crusts and vents sit by a wall, facing the middle
  const x = wallHung ? (dir > 0 ? rand(20, 50) : rand(W - 50, W - 20)) : rand(40, W - 40);
  const speed = def.still ? 0 : kind === 'voParrot' ? rand(35, 60) : rand(8, 18);
  const v = def.cols ? ri(0, def.cols.length - 1) : 0;
  fishes.push({ kind, v, tier, x, y: lineY, dir, s, t: rand(0, 6), vx: dir * speed, w: def.w * s, ext: def.h * s });
  return def.h * s;
}

// the start of a Volcano run: high above a tropical island, the crater rim right below, a smoke plume rising out of
// it, palms on the slopes, a parrot on a rock and a volcanologist's little flag. It slides away within the first ~35 m.
const volcanoStartY = () => planeScreenY() - 70 - dist * 0.22;      // the crater's lip on screen
function drawVolcanoStart() {
  const y = volcanoStartY();
  if (y < -40) return;
  blit(sharedSprite('volcanoTop', W, 520, 0, 500, () => {
    const sky = ctx.createLinearGradient(0, -500, 0, -100);
    sky.addColorStop(0, '#4fa8e8'); sky.addColorStop(1, '#d8f0fa');
    ctx.fillStyle = sky; ctx.fillRect(0, -500, W, 410);
    ctx.fillStyle = '#3f9ad0'; ctx.fillRect(0, -112, W, 30);                                    // the sea far below
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (const [x, yy] of [[30, -104], [140, -96], [260, -102], [360, -94]]) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 8, yy - 3, x + 16, yy); }
    ctx.stroke();
    // the island's green slopes rising to the crater
    ctx.fillStyle = '#5fae4a'; ctx.beginPath(); ctx.moveTo(0, -84); ctx.quadraticCurveTo(120, -96, 170, -40); ctx.lineTo(230, -40); ctx.quadraticCurveTo(280, -96, W, -84); ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4f9a3a'; for (const [x, yy, r] of [[40, -70, 14], [80, -66, 12], [330, -70, 13], [370, -64, 15]]) { ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill(); }
    // the smoke plume rising out of the crater
    ctx.fillStyle = 'rgba(120,115,110,.55)';
    for (const [x, yy, r] of [[200, -60, 22], [190, -92, 28], [212, -126, 32], [196, -164, 36], [220, -200, 30]]) { ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill(); }
    // the crater: a dark rim with a glowing throat
    ctx.fillStyle = '#4a3a30'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(200, -60, W, -30); ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a2018'; ctx.beginPath(); ctx.ellipse(200, -14, 150, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,40,.45)'; ctx.beginPath(); ctx.ellipse(200, -10, 110, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,200,90,.6)'; ctx.beginPath(); ctx.ellipse(200, -8, 60, 4, 0, 0, Math.PI * 2); ctx.fill();
    // palms on the slopes, a parrot on a rock and a little flag
    for (const [x, base, lean] of [[50, -40, -1], [350, -40, 1]]) {
      ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + lean * 6, base - 20, x + lean * 4, base - 40); ctx.stroke();
      ctx.strokeStyle = '#2f8a3a'; ctx.lineWidth = 3;
      for (const [dx, dy] of [[-14, -6], [-8, -14], [10, -14], [16, -4]]) { ctx.beginPath(); ctx.moveTo(x + lean * 4, base - 40); ctx.quadraticCurveTo(x + lean * 4 + dx / 2, base - 48 + dy / 2, x + lean * 4 + dx, base - 40 + dy); ctx.stroke(); }
    }
    ctx.fillStyle = '#6a5a4a'; ctx.beginPath(); ctx.ellipse(300, -40, 20, 9, 0, Math.PI, 0); ctx.fill();         // the rock
    ctx.fillStyle = '#e03a2a'; ctx.beginPath(); ctx.ellipse(300, -54, 6, 8, 0, 0, Math.PI * 2); ctx.fill();       // the parrot
    ctx.beginPath(); ctx.arc(302, -64, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2f6fd1'; ctx.beginPath(); ctx.moveTo(296, -52); ctx.lineTo(292, -40); ctx.lineTo(300, -46); ctx.fill();
    ctx.fillStyle = '#f4ecd8'; ctx.beginPath(); ctx.moveTo(305, -65); ctx.quadraticCurveTo(310, -64, 306, -60); ctx.fill();
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(303, -65, 1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(110, -36); ctx.lineTo(110, -64); ctx.stroke();   // the flag
    ctx.fillStyle = '#ffb030'; ctx.beginPath(); ctx.moveTo(110, -64); ctx.lineTo(124, -60); ctx.lineTo(110, -55); ctx.fill();
  }), 0, y);
}

// drifting specks by layer: little leaves (jungle), ash flakes with now and then a faint lightning flicker far off
// (ash cloud), steam wisps rising (crater), lava drips (tubes), then glowing magma bubbles rising. All faint, so they never
// hide an obstacle. Positions come from a hash of the page chunk, so nothing is stored.
function drawVolcanoParticles() {
  const CH = 300, N = 12, t = titleTime + time;
  ctx.save();
  for (let c = Math.floor((dist - 20) / CH); c * CH < dist + H + 20; c++) {
    const L = volcanoLayer(c * CH);
    if (L === 1 && (t * 0.6 + hash(c * 3.7) * 9) % 7 < 0.12) {     // a faint flicker of lightning deep in the ash
      const bx = hash(c * 5.1) * W, by = c * CH + hash(c * 2.3) * CH - dist;
      ctx.globalAlpha = 0.25; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(bx, by - 30); ctx.lineTo(bx + 8, by - 10); ctx.lineTo(bx - 4, by); ctx.lineTo(bx + 6, by + 24); ctx.stroke();
    }
    for (let i = 0; i < N; i++) {
      const hx = hash(c * 97 + i * 13.1), hy = hash(c * 53 + i * 7.7), hs = hash(c * 11 + i * 3.3);
      let x = hx * W;
      if (L === 0) {                               // little leaves and petals drifting
        const y = c * CH + ((hy * CH + t * (14 + hs * 10)) % CH) - dist;
        x += Math.sin(t + i * 2) * 8;
        ctx.globalAlpha = 0.45; ctx.fillStyle = hs > 0.5 ? '#4f9a3a' : '#ff8ab0';
        ctx.beginPath(); ctx.ellipse(x, y, 2.6, 1.4, t + i, 0, Math.PI * 2); ctx.fill();
      } else if (L === 1) {                        // ash flakes falling
        const y = c * CH + ((hy * CH + t * (22 + hs * 18)) % CH) - dist;
        x += Math.sin(t * 0.8 + i) * 6;
        ctx.globalAlpha = 0.55; ctx.fillStyle = hs > 0.5 ? '#6a6660' : '#d8d4cc';
        ctx.fillRect(x, y, 2 + hs * 1.5, 2 + hs * 1.5);
      } else if (L === 2) {                        // steam wisps rising
        const y = c * CH + (((hy * CH - t * (16 + hs * 10)) % CH) + CH) % CH - dist;
        ctx.globalAlpha = 0.18; ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x + Math.sin(t + i) * 6, y, 5 + hs * 4, 0, Math.PI * 2); ctx.fill();
      } else if (L === 3) {                        // drips of lava falling
        const y = c * CH + ((hy * CH + t * (45 + hs * 30)) % CH) - dist;
        ctx.globalAlpha = 0.6; ctx.fillStyle = '#ff8a2a'; ctx.fillRect(x, y, 1.6, 4 + hs * 3);
      } else {                                     // glowing magma bubbles rising
        const y = c * CH + (((hy * CH - t * (14 + hs * 16)) % CH) + CH) % CH - dist;
        ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ffe080'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x + Math.sin(t * 0.7 + i) * 5, y, 2 + hs * 4, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }
  ctx.restore();
}
