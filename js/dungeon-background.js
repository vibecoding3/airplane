// Paper Nosedive — Dungeon map background: the daylight of the well opening at the start, scenery by depth
// (torches, bats, cobwebs, crystals, lava falls) and drifting dust, drips and embers. None of it collides.
'use strict';

// scenery drawings join the FISH table so drawFishes can draw them; w,h is the sprite box, facing right
Object.assign(FISH, {
  torch: { w: 30, h: 60, still: true, alpha: 0.8, lure: [0, -18], paint() {
    ctx.fillStyle = '#4a3a2a'; ctx.fillRect(-3, -6, 6, 30);                                // handle
    ctx.fillStyle = '#5a5f66'; ctx.fillRect(-7, -9, 14, 5); ctx.fillRect(-9, 18, 18, 4);    // iron cup and wall bracket
    ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.moveTo(-7, -9); ctx.quadraticCurveTo(-8, -22, 0, -30); ctx.quadraticCurveTo(8, -22, 7, -9); ctx.fill();
    ctx.fillStyle = '#ffe07a'; ctx.beginPath(); ctx.moveTo(-3.5, -9); ctx.quadraticCurveTo(-4, -17, 0, -22); ctx.quadraticCurveTo(4, -17, 3.5, -9); ctx.fill();
  } },
  bat: { w: 50, h: 26, paint() {
    ctx.fillStyle = '#7d6f96';
    ctx.beginPath(); ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(-10, -12, -24, -6); ctx.quadraticCurveTo(-18, -2, -20, 4); ctx.quadraticCurveTo(-12, 0, -8, 5); ctx.quadraticCurveTo(-4, 2, 0, 6);
    ctx.quadraticCurveTo(4, 2, 8, 5); ctx.quadraticCurveTo(12, 0, 20, 4); ctx.quadraticCurveTo(18, -2, 24, -6); ctx.quadraticCurveTo(10, -12, 0, -2);
    ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(-3, -8); ctx.lineTo(-1, -4); ctx.moveTo(4, -3); ctx.lineTo(3, -8); ctx.lineTo(1, -4); ctx.fill();
    ctx.fillStyle = '#ffd23f'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 2, -0.5, 1, 0, Math.PI * 2); ctx.fill(); }
  } },
  cobweb: { w: 80, h: 80, still: true, alpha: 0.4, paint() {
    ctx.strokeStyle = '#e8e8f0'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI / 2; ctx.moveTo(-38, -38); ctx.lineTo(-38 + Math.cos(a) * 74, -38 + Math.sin(a) * 74); }
    for (const r of [18, 34, 50, 66]) {
      for (let i = 0; i < 6; i++) {
        const a0 = i / 6 * Math.PI / 2, a1 = (i + 1) / 6 * Math.PI / 2, am = (a0 + a1) / 2;
        ctx.moveTo(-38 + Math.cos(a0) * r, -38 + Math.sin(a0) * r);
        ctx.quadraticCurveTo(-38 + Math.cos(am) * r * 0.86, -38 + Math.sin(am) * r * 0.86, -38 + Math.cos(a1) * r, -38 + Math.sin(a1) * r);
      }
    }
    ctx.stroke();
  } },
  chain: { w: 20, h: 120, still: true, alpha: 0.5, paint() {
    ctx.strokeStyle = '#9aa0a8'; ctx.lineWidth = 2.4;
    for (let y = -56; y < 52; y += 12) { ctx.beginPath(); ctx.ellipse(0, y + 6, (y / 12) % 2 ? 2 : 4.5, 6, 0, 0, Math.PI * 2); ctx.stroke(); }
  } },
  rat: { w: 50, h: 22, paint() {
    ctx.fillStyle = '#8a8078';
    ctx.beginPath(); ctx.ellipse(-2, 3, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, -1); ctx.quadraticCurveTo(20, 2, 18, 5); ctx.quadraticCurveTo(12, 8, 6, 7); ctx.fill();   // snout
    ctx.beginPath(); ctx.arc(7, -3, 3.5, 0, Math.PI * 2); ctx.fill();                                                        // ear
    ctx.strokeStyle = '#c99a92'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-14, 4); ctx.quadraticCurveTo(-24, 0, -22, -6); ctx.stroke();   // tail
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(12, 1, 1.2, 0, Math.PI * 2); ctx.fill();
  } },
  chest: { w: 50, h: 40, still: true, alpha: 0.6, paint() {
    ctx.fillStyle = '#8a5a32'; ctx.fillRect(-20, -4, 40, 20);
    ctx.beginPath(); ctx.moveTo(-20, -4); ctx.quadraticCurveTo(0, -18, 20, -4); ctx.fill();
    ctx.fillStyle = '#e0b84a'; ctx.fillRect(-20, -5, 40, 3); ctx.fillRect(-12, -12, 3, 28); ctx.fillRect(9, -12, 3, 28);
    ctx.fillRect(-3, -2, 6, 7);
    ctx.fillStyle = '#ffd23f'; for (const [x, y] of [[-8, -9], [0, -11], [7, -9]]) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); }   // coins peeking out
  } },
  crystal: { w: 60, h: 60, still: true, alpha: 0.6, cols: [{ c: '#7fd8ff' }, { c: '#c79cff' }, { c: '#8fffd0' }], paint(k) {
    for (const [x, h, a] of [[-10, 34, -0.3], [3, 46, 0.05], [15, 28, 0.35]]) {
      ctx.save(); ctx.translate(x, 24); ctx.rotate(a);
      ctx.fillStyle = k.c; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-6, -h + 10); ctx.lineTo(0, -h); ctx.lineTo(6, -h + 10); ctx.lineTo(6, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(-3.5, -h + 10, 2.5, h - 12);
      ctx.restore();
    }
  } },
  eyes: { w: 40, h: 16, still: true, alpha: 0.85, paint() {
    ctx.fillStyle = 'rgba(255,220,80,.25)'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 9, 0, 7, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffd23f'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 9, 0, 4, 2.6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#1a1410'; for (const d of [-1, 1]) ctx.fillRect(d * 9 - 0.6, -2.4, 1.2, 4.8);
  } },
  mushroom: { w: 40, h: 40, still: true, alpha: 0.65, lure: [0, -8], paint() {
    for (const [x, s] of [[-8, 0.8], [6, 1]]) {
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x - 2 * s, -4 * s, 4 * s, 18 * s);
      ctx.fillStyle = '#7fffd0'; ctx.beginPath(); ctx.ellipse(x, -5 * s, 10 * s, 6 * s, 0, Math.PI, 0); ctx.fill();
    }
  } },
  skeleton: { w: 50, h: 60, still: true, alpha: 0.3, paint() {      // faint and grey, so it never reads as a skull obstacle
    ctx.strokeStyle = '#b8b0a0'; ctx.fillStyle = '#b8b0a0'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -18, 8, 0, Math.PI * 2); ctx.fill();                             // skull
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 10);                                          // spine
    for (const y of [-5, 0, 5]) { ctx.moveTo(-8, y); ctx.lineTo(8, y); }                            // ribs
    ctx.moveTo(-8, -6); ctx.lineTo(-16, 6); ctx.moveTo(8, -6); ctx.lineTo(18, -10);                 // arms (one waving)
    ctx.moveTo(0, 10); ctx.lineTo(-10, 26); ctx.moveTo(0, 10); ctx.lineTo(12, 22); ctx.lineTo(20, 26);   // legs, sitting
    ctx.stroke();
    ctx.fillStyle = '#2a211b'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 3, -19, 2, 0, Math.PI * 2); ctx.fill(); }
  } },
  lavafall: { w: 60, h: 170, still: true, alpha: 0.55, paint() {
    const g = ctx.createLinearGradient(0, -80, 0, 80);
    g.addColorStop(0, '#ffb347'); g.addColorStop(1, '#e2493b');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-10, -84); ctx.bezierCurveTo(-14, -20, -6, 30, -16, 84); ctx.lineTo(16, 84); ctx.bezierCurveTo(8, 30, 14, -20, 10, -84); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,170,.7)'; ctx.fillRect(-3, -80, 3, 150);
    ctx.fillStyle = '#ff7a3a'; ctx.beginPath(); ctx.ellipse(0, 82, 26, 6, 0, 0, Math.PI * 2); ctx.fill();   // pool below
  } },
  // rare: a dragon silhouette gliding far behind the walls
  dragon: { w: 280, h: 120, alpha: 0.16, paint() {
    ctx.fillStyle = '#0a0606';
    ctx.beginPath();
    ctx.moveTo(130, -6); ctx.lineTo(108, -14); ctx.lineTo(96, -24); ctx.lineTo(92, -12); ctx.quadraticCurveTo(60, -10, 30, -2);    // head and neck
    ctx.lineTo(0, -52); ctx.lineTo(-20, -4); ctx.lineTo(-50, -56); ctx.lineTo(-56, 0);                                               // two wing points
    ctx.quadraticCurveTo(-100, 6, -138, 22); ctx.lineTo(-122, 10); ctx.quadraticCurveTo(-80, 12, -40, 14);                         // tail
    ctx.quadraticCurveTo(20, 18, 70, 4); ctx.quadraticCurveTo(100, 2, 130, -6);
    ctx.fill();
  } }
});
// which scenery can appear at each depth level (same level depths as the formulas and fish)
const DUNGEON_TIERS = [
  ['torch', 'bat', 'cobweb', 'chain', 'torch'], ['torch', 'bat', 'rat', 'chain', 'chest'], ['bat', 'crystal', 'cobweb', 'eyes', 'mushroom'],
  ['crystal', 'eyes', 'mushroom', 'skeleton'], ['eyes', 'skeleton', 'lavafall', 'crystal'], ['lavafall', 'eyes', 'skeleton', 'lavafall']
];
function spawnDungeonThing(lineY) {
  if (Math.random() < 0.3) return 0;
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  let kind = DUNGEON_TIERS[tier][ri(0, DUNGEON_TIERS[tier].length - 1)];
  if (m > 300 && lineY - lastSceneryY > 900 && Math.random() < 0.05) { kind = 'dragon'; lastSceneryY = lineY; }
  const def = FISH[kind], s = rand(0.8, 1), dir = Math.random() < 0.5 ? -1 : 1;
  const wallHung = kind === 'torch' || kind === 'cobweb' || kind === 'chain';
  // torches and chains hang near a wall; a cobweb sits in a corner, turned to face its wall
  const x = wallHung ? (dir < 0 ? rand(14, 40) : rand(W - 40, W - 14)) : rand(40, W - 40);
  const speed = def.still ? 0 : kind === 'dragon' ? rand(12, 18) : kind === 'bat' ? rand(30, 55) : rand(8, 16);
  const v = def.cols ? ri(0, def.cols.length - 1) : 0;
  fishes.push({ kind, v, tier, x, y: lineY, dir: kind === 'cobweb' ? -dir : dir, s, t: rand(0, 6), vx: dir * speed, w: def.w * s, ext: def.h * s });
  return def.h * s;
}

// daylight from the top of the well: a disc of sky in the stone ring far above, a rope with a bucket, and a
// soft beam of light falling down the shaft. It slides away within the first ~35 m, like the Earth in Space.
const wellOpeningY = () => planeScreenY() - 70 - dist * 0.22;      // bottom of the sky disc on screen
function drawDungeonDetails() {
  const y = wellOpeningY();
  if (y > -260) {
    const g = sharedSprite('wellTop', W + 40, 560, (W + 40) / 2, 260, () => {
      const beam = ctx.createLinearGradient(0, -40, 0, 290);                                    // the light falling down,
      beam.addColorStop(0, 'rgba(255,240,200,.16)'); beam.addColorStop(1, 'rgba(255,240,200,0)');   // stacked for soft edges
      ctx.fillStyle = beam;
      for (const k of [1.2, 1, 0.8, 0.6]) {
        ctx.beginPath(); ctx.moveTo(-130 * k, -10); ctx.lineTo(130 * k, -10); ctx.lineTo(210 * k, 290); ctx.lineTo(-210 * k, 290); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#6b6258'; ctx.beginPath(); ctx.ellipse(0, -60, 160, 72, 0, 0, Math.PI * 2); ctx.fill();   // the stone ring
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 128, -60 + Math.sin(a) * 52); ctx.lineTo(Math.cos(a) * 160, -60 + Math.sin(a) * 72); }
      ctx.stroke();
      const sky = ctx.createLinearGradient(0, -170, 0, 0);
      sky.addColorStop(0, '#5fa8e8'); sky.addColorStop(1, '#cfe9fb');
      ctx.fillStyle = sky; ctx.beginPath(); ctx.ellipse(0, -60, 128, 52, 0, 0, Math.PI * 2); ctx.fill();          // the sky
      ctx.fillStyle = 'rgba(255,255,255,.9)';                                                                        // a cloud passing over
      for (const [x, yy, r] of [[-40, -70, 14], [-24, -76, 18], [-6, -70, 13], [-24, -64, 12]]) { ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#3a342e'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, -60, 160, 72, 0, 0, Math.PI * 2); ctx.stroke();
      // a rope with a bucket hanging just below the rim, well away from the plane
      ctx.strokeStyle = '#c9a66b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(95, -40); ctx.lineTo(95, 8); ctx.stroke();
      ctx.fillStyle = '#8a5a32'; ctx.beginPath(); ctx.moveTo(84, 8); ctx.lineTo(106, 8); ctx.lineTo(102, 30); ctx.lineTo(88, 30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4a4f58'; ctx.fillRect(85, 12, 20, 3); ctx.fillRect(86, 23, 18, 3);
      ctx.strokeStyle = '#4a4f58'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(95, 8, 11, Math.PI, 0); ctx.stroke();
    });
    blit(g, W / 2, y);
  }
  drawDungeonParticles();
}

// drifting specks by depth: dust in the torchlight (100–400 m), dripping water (400–1,000 m), then embers
// rising from the lava. Positions come from a hash of the page chunk, so nothing is stored.
function drawDungeonParticles() {
  const CH = 300, N = 12, t = titleTime + time;
  ctx.save();
  for (let c = Math.floor((dist - 20) / CH); c * CH < dist + H + 20; c++) {
    const m = c * CH / PX_PER_M;
    if (m < 100) continue;
    for (let i = 0; i < N; i++) {
      const hx = hash(c * 97 + i * 13.1), hy = hash(c * 53 + i * 7.7), hs = hash(c * 11 + i * 3.3);
      let x = hx * W, y = c * CH + hy * CH - dist;
      if (m < 400) {                             // dust motes floating in the warm light
        x += Math.sin(t * 0.5 + i) * 6;
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffe0a8';
        const s = 1.2 + hs * 1.5; ctx.fillRect(x, y, s, s);
      } else if (m < 1000) {                     // water drips falling
        y = c * CH + ((hy * CH + t * (40 + hs * 30)) % CH) - dist;
        ctx.globalAlpha = 0.5; ctx.fillStyle = '#9fd8ff';
        ctx.fillRect(x, y, 1.4, 4 + hs * 3);
      } else {                                   // embers rising and flickering
        y = c * CH + (((hy * CH - t * (20 + hs * 25)) % CH) + CH) % CH - dist;
        x += Math.sin(t * 1.3 + i * 2) * 5;
        const tw = 0.5 + 0.5 * Math.sin(t * (2 + hs * 3) + i);
        ctx.globalAlpha = 0.4 + 0.5 * tw; ctx.fillStyle = hs > 0.5 ? '#ffb347' : '#ff7a3a';
        ctx.beginPath(); ctx.arc(x, y, 1.2 + hs * 1.2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  ctx.restore();
}
