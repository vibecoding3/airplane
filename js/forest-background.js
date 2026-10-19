// Paper Nosedive — Forest map background: the treetops and the bird's nest the plane sets off from, scenery by
// season (butterflies, squirrels, deer, foxes, snowy branches, owls' eyes at night) and blossom, pollen, leaves,
// snow and fireflies drifting past. None of it collides.
'use strict';

// leaf colours by season (0 spring, 1 summer, 2 autumn, 3 winter: snow on the twigs, 4 night), shared with draw-forest.js
const LEAF_COLS = [['#8fd65f', '#6fc04a'], ['#3f9a3a', '#2f7f30'], ['#e8822a', '#d0502a'], ['#f4f8fc', '#dce8f0'], ['#2f6a4a', '#24553c']];

// scenery drawings join the FISH table so drawFishes can draw them; w,h is the sprite box, facing right
Object.assign(FISH, {
  foButterfly: { w: 30, h: 26, cols: [{ c: '#ffb3d9' }, { c: '#ffe066' }, { c: '#9fd8ff' }], paint(k) {
    ctx.fillStyle = k.c;
    for (const d of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(d * 6, -4, 6, 7, d * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(d * 5, 5, 4, 5, -d * 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-1, -8, 2, 16);
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(-3, -12); ctx.moveTo(0, -8); ctx.lineTo(3, -12); ctx.stroke();
  } },
  foBee: { w: 26, h: 20, paint() {
    ctx.fillStyle = 'rgba(230,245,255,.85)'; ctx.beginPath(); ctx.ellipse(-2, -6, 4, 6, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(3, -6, 4, 6, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffc21f'; ctx.beginPath(); ctx.ellipse(0, 2, 8, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1d12'; ctx.fillRect(-3, -3, 2.5, 10); ctx.fillRect(2, -3, 2.5, 10); ctx.beginPath(); ctx.arc(8, 1, 2.5, 0, Math.PI * 2); ctx.fill();
  } },
  foRabbit: { w: 40, h: 40, still: true, alpha: 0.6, cols: [{ c: '#b89a7a' }, { c: '#f2f0ea' }], paint(k) {
    ctx.fillStyle = k.c;
    ctx.beginPath(); ctx.ellipse(-2, 8, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -2, 6.5, 0, Math.PI * 2); ctx.fill();
    for (const x of [6, 10]) { ctx.beginPath(); ctx.ellipse(x, -13, 2.4, 7, x === 6 ? -0.2 : 0.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-13, 6, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.arc(10, -3, 1.2, 0, Math.PI * 2); ctx.fill();
  } },
  foSquirrel: { w: 70, h: 44, still: true, alpha: 0.6, paint() {                 // a squirrel sitting on a branch stub
    ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-34, 12, 50, 6);
    ctx.fillStyle = '#c0703a';
    ctx.beginPath(); ctx.moveTo(-8, 10); ctx.quadraticCurveTo(-26, 4, -20, -14); ctx.quadraticCurveTo(-12, -22, -8, -10); ctx.quadraticCurveTo(-14, 0, -4, 6); ctx.fill();   // tail
    ctx.beginPath(); ctx.ellipse(2, 4, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -7, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(3, -11); ctx.lineTo(4, -16); ctx.lineTo(7, -11); ctx.fill();
    ctx.fillStyle = '#a0703a'; ctx.beginPath(); ctx.arc(9, 2, 2.6, 0, Math.PI * 2); ctx.fill();   // an acorn in its paws
    ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.arc(7, -8, 1.1, 0, Math.PI * 2); ctx.fill();
  } },
  foWoodpecker: { w: 40, h: 60, still: true, alpha: 0.6, paint() {              // on a piece of trunk
    ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-14, -28, 12, 56);
    ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.ellipse(4, 4, 6, 11, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2f0ea'; ctx.beginPath(); ctx.ellipse(6, 6, 3, 7, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9343a'; ctx.beginPath(); ctx.arc(4, -9, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.moveTo(-1, -9); ctx.lineTo(-8, -8); ctx.lineTo(-1, -7); ctx.fill();
    ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.arc(3, -10, 1, 0, Math.PI * 2); ctx.fill();
  } },
  foDeer: { w: 80, h: 70, alpha: 0.3, paint() {
    ctx.fillStyle = '#7a5030';
    ctx.beginPath(); ctx.ellipse(0, 4, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
    for (const x of [-16, -10, 12, 18]) ctx.fillRect(x, 10, 3, 18);
    ctx.beginPath(); ctx.moveTo(14, -2); ctx.lineTo(20, -10); ctx.lineTo(27, -8); ctx.lineTo(24, 4); ctx.fill();   // a short neck
    ctx.beginPath(); ctx.ellipse(26, -12, 8, 6.5, 0.2, 0, Math.PI * 2); ctx.fill();                                   // head
    ctx.beginPath(); ctx.ellipse(32, -9, 4, 3, 0.2, 0, Math.PI * 2); ctx.fill();                                      // muzzle
    for (const [x, a] of [[22, -0.6], [28, 0.4]]) { ctx.beginPath(); ctx.ellipse(x, -19, 2.2, 5, a, 0, Math.PI * 2); ctx.fill(); }   // ears
    ctx.fillStyle = '#e8d8c0'; for (const [x, y] of [[-8, 0], [-2, 3], [4, -1], [-12, 5]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }   // fawn spots
    ctx.fillStyle = '#7a5030';
    ctx.fillStyle = '#f2e8d8'; ctx.beginPath(); ctx.arc(-20, 2, 3, 0, Math.PI * 2); ctx.fill();
  } },
  foFox: { w: 60, h: 34, cols: [{ c: '#e0702a' }], paint(k) {
    ctx.fillStyle = k.c;
    ctx.beginPath(); ctx.ellipse(-2, 4, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, 2); ctx.quadraticCurveTo(-28, -4, -28, 6); ctx.quadraticCurveTo(-22, 10, -14, 6); ctx.fill();   // tail
    ctx.beginPath(); ctx.moveTo(10, -2); ctx.lineTo(22, 2); ctx.lineTo(10, 6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -2); ctx.lineTo(12, -9); ctx.lineTo(15, -1); ctx.fill();
    for (const x of [-10, -4, 4, 9]) ctx.fillRect(x, 9, 2.5, 8);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-27, 5, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.arc(21, 2, 1.3, 0, Math.PI * 2); ctx.fill();
  } },
  foBirdhouse: { w: 40, h: 60, still: true, alpha: 0.55, paint() {
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(0, -18); ctx.stroke();
    ctx.fillStyle = '#c07a4a'; ctx.fillRect(-11, -8, 22, 26);
    ctx.fillStyle = '#8a3a2a'; ctx.beginPath(); ctx.moveTo(-15, -6); ctx.lineTo(0, -19); ctx.lineTo(15, -6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a1d12'; ctx.beginPath(); ctx.arc(0, 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-1, 10, 2, 5);
  } },
  foSnowBranch: { w: 120, h: 40, still: true, alpha: 0.55, paint() {
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-58, 4); ctx.lineTo(50, -2); ctx.moveTo(-10, 2); ctx.lineTo(10, -12); ctx.moveTo(20, 0); ctx.lineTo(36, 10); ctx.stroke();
    ctx.fillStyle = '#f4f8fc';
    for (const [x, y, w] of [[-40, 1, 14], [-12, 0, 12], [12, -2, 10], [36, -3, 12], [4, -11, 7]]) { ctx.beginPath(); ctx.ellipse(x, y - 2, w, 3.5, 0, Math.PI, 0); ctx.fill(); }
  } },
  foOwlEyes: { w: 40, h: 20, still: true, alpha: 0.85, paint() {
    ctx.fillStyle = 'rgba(255,220,80,.22)'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 8, 0, 7.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffd23f'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 8, 0, 4.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#1a1410'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 8, 0, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,220,80,.5)'; ctx.beginPath(); ctx.moveTo(-2, 4); ctx.lineTo(0, 7); ctx.lineTo(2, 4); ctx.fill();
  } },
  foMoon: { w: 70, h: 70, still: true, alpha: 0.28, paint() {
    ctx.fillStyle = '#f4f0d8'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.12)'; for (const [x, y, r] of [[-8, -6, 6], [9, 5, 4], [-2, 12, 3]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  } },
  // rare: geese flying in a V far away (before 800 m), a great stag deeper down
  foGeese: { w: 160, h: 80, alpha: 0.3, paint() {
    ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    for (let i = -3; i <= 3; i++) {
      const x = -Math.abs(i) * 20 + 50, y = i * 10;
      ctx.beginPath(); ctx.moveTo(x - 8, y - 4); ctx.lineTo(x, y); ctx.lineTo(x - 8, y + 4); ctx.moveTo(x, y); ctx.lineTo(x + 5, y); ctx.stroke();
    }
  } },
  foStag: { w: 140, h: 130, still: true, alpha: 0.18, paint() {
    ctx.fillStyle = '#1a140e';
    ctx.beginPath(); ctx.ellipse(-6, 22, 34, 16, 0, 0, Math.PI * 2); ctx.fill();
    for (const x of [-30, -20, 14, 24]) ctx.fillRect(x, 30, 5, 30);
    ctx.beginPath(); ctx.moveTo(18, 14); ctx.lineTo(30, -14); ctx.lineTo(42, -10); ctx.lineTo(34, 18); ctx.fill();
    ctx.beginPath(); ctx.ellipse(42, -18, 11, 7, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a140e'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
    for (const d of [-1, 1]) { ctx.moveTo(38, -24); ctx.lineTo(38 + d * 14, -50); ctx.moveTo(38 + d * 7, -37); ctx.lineTo(38 + d * 18, -40); ctx.moveTo(38 + d * 11, -45); ctx.lineTo(38 + d * 6, -58); }
    ctx.stroke();
  } }
});
// which scenery can appear at each depth level (spring, summer, autumn, winter, then night twice)
const FOREST_TIERS = [
  ['foButterfly', 'foRabbit', 'foBirdhouse', 'foSquirrel', 'foButterfly'], ['foBee', 'foButterfly', 'foSquirrel', 'foWoodpecker', 'foDeer'],
  ['foSquirrel', 'foFox', 'foWoodpecker', 'foDeer', 'foBirdhouse'], ['foSnowBranch', 'foFox', 'foDeer', 'foRabbit', 'foBirdhouse'],
  ['foOwlEyes', 'foFox', 'foDeer', 'foOwlEyes', 'foMoon'], ['foOwlEyes', 'foFox', 'foOwlEyes', 'foDeer']
];
function spawnForestThing(lineY) {
  if (Math.random() < 0.3) return 0;
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  let kind = FOREST_TIERS[tier][ri(0, FOREST_TIERS[tier].length - 1)];
  if (kind === 'foMoon' && lineY - lastSceneryY < 900) kind = 'foOwlEyes';      // one moon at a time
  if (lineY - lastSceneryY > 900 && Math.random() < 0.05) kind = m < 800 ? 'foGeese' : 'foStag';
  if (kind === 'foGeese' || kind === 'foStag' || kind === 'foMoon') lastSceneryY = lineY;
  const def = FISH[kind], s = rand(0.8, 1), dir = Math.random() < 0.5 ? -1 : 1;
  const wallHung = kind === 'foSquirrel' || kind === 'foWoodpecker' || kind === 'foSnowBranch' || kind === 'foBirdhouse';
  // squirrels, woodpeckers, birdhouses and snowy branches sit by a wall, facing the middle
  const x = wallHung ? (dir > 0 ? rand(20, 60) : rand(W - 60, W - 20)) : rand(40, W - 40);
  const speed = def.still ? 0 : kind === 'foGeese' ? rand(20, 30) : kind === 'foBee' || kind === 'foButterfly' ? rand(20, 40) : rand(8, 18);
  const v = def.cols ? ri(0, def.cols.length - 1) : 0;
  fishes.push({ kind, v, tier, x, y: lineY, dir, s, t: rand(0, 6), vx: dir * speed, w: def.w * s, ext: def.h * s });
  return def.h * s;
}

// the start of a Forest run: blue sky over the treetops, and the plane sets off from a bird's nest on the top branch,
// with a sleepy owl watching. It slides up out of view within the first ~35 m, like the Earth in Space.
const forestStartY = () => planeScreenY() - 70 - dist * 0.22;      // bottom edge of the top branch on screen
function drawForestStart() {
  const y = forestStartY();
  if (y < -40) return;
  blit(sharedSprite('forestTop', W, 520, 0, 500, () => {
    const sky = ctx.createLinearGradient(0, -500, 0, -60);
    sky.addColorStop(0, '#6fb8ec'); sky.addColorStop(1, '#d8eefa');
    ctx.fillStyle = sky; ctx.fillRect(0, -500, W, 470);
    ctx.fillStyle = 'rgba(255,240,170,.35)'; ctx.beginPath(); ctx.arc(338, -150, 30, 0, Math.PI * 2); ctx.fill();   // the sun
    ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(338, -150, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)';                                                                           // clouds
    for (const [x, yy, r] of [[150, -160, 11], [165, -166, 15], [182, -160, 11], [250, -132, 9], [262, -137, 12], [276, -132, 9]]) { ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill(); }
    // the canopy: two rows of round tree crowns, far and pale, then near and deep green
    for (const [col, top, rMin, rMax, seed] of [['#8fc86a', -100, 18, 28, 2], ['#5fa846', -64, 22, 32, 7]]) {
      ctx.fillStyle = col;
      for (let x = -20, i = 0; x < W + 40; i++) {
        const r = rMin + hash(seed * 13 + i * 3.1) * (rMax - rMin);
        ctx.beginPath(); ctx.arc(x, top + hash(seed * 7 + i * 1.7) * 30, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x - r, top + 10, r * 2, 400);
        x += r * 1.2;
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,.2)';                                                                          // sunlit leaves
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(hash(i * 5.3) * W, -64 + hash(i * 2.9) * 22, 5, 0, Math.PI * 2); ctx.fill(); }
    // the top branch across the scene, with spring leaves, a nest and a sleepy owl
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -18); ctx.quadraticCurveTo(160, -30, 300, -12); ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(240, -18); ctx.lineTo(290, -48); ctx.moveTo(60, -22); ctx.lineTo(30, -50); ctx.stroke();
    ctx.fillStyle = '#8fd65f';
    for (const [x, yy, a] of [[290, -50, 0.5], [298, -44, -0.3], [28, -52, -0.5], [36, -46, 0.4], [120, -30, 0.2], [180, -32, -0.3], [300, -16, 0.4]]) { ctx.beginPath(); ctx.ellipse(x, yy, 9, 4.5, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#9a6a3a'; ctx.beginPath(); ctx.ellipse(200, -32, 30, 13, 0, 0, Math.PI); ctx.fill();          // the nest
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 174; x < 228; x += 7) { ctx.moveTo(x, -32); ctx.quadraticCurveTo(x + 6, -24, x + 2, -21); }
    ctx.stroke();
    ctx.fillStyle = '#9fd8f0'; for (const x of [192, 206]) { ctx.beginPath(); ctx.ellipse(x, -34, 5, 6.5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#8a6a4a'; ctx.beginPath(); ctx.ellipse(90, -42, 14, 18, 0, 0, Math.PI * 2); ctx.fill();         // the owl
    ctx.beginPath(); ctx.moveTo(78, -56); ctx.lineTo(82, -66); ctx.lineTo(88, -57); ctx.moveTo(102, -56); ctx.lineTo(98, -66); ctx.lineTo(92, -57); ctx.fill();
    ctx.fillStyle = '#d8c0a0'; ctx.beginPath(); ctx.ellipse(90, -36, 9, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0e6d0'; for (const x of [84, 96]) { ctx.beginPath(); ctx.arc(x, -48, 5.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#e0a020'; ctx.beginPath(); ctx.moveTo(88, -44); ctx.lineTo(90, -40); ctx.lineTo(92, -44); ctx.fill();
  }), 0, y);
  // the owl blinks its sleepy eyes now and then
  const t = titleTime + time, open = Math.floor(t * 0.8) % 4 === 1;
  ctx.save();
  ctx.fillStyle = '#2a1d12'; ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (const x of [84, 96]) {
    if (open) { ctx.beginPath(); ctx.arc(x, y - 48, 2.2, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(x, y - 49, 3, 0.3, Math.PI - 0.3); ctx.stroke(); }
  }
  ctx.restore();
}

// drifting specks by season: blossom petals (spring), floating pollen (summer), falling leaves (autumn), snow
// (winter), then fireflies at night. Kept faint so they never hide an obstacle. Positions come from a hash of the
// page chunk, so nothing is stored.
function drawForestParticles() {
  const CH = 300, N = 12, t = titleTime + time;
  ctx.save();
  for (let c = Math.floor((dist - 20) / CH); c * CH < dist + H + 20; c++) {
    const s = forestSeason(c * CH);
    for (let i = 0; i < N; i++) {
      const hx = hash(c * 97 + i * 13.1), hy = hash(c * 53 + i * 7.7), hs = hash(c * 11 + i * 3.3);
      let x = hx * W;
      if (s === 4) {                               // fireflies, twinkling
        const y = c * CH + hy * CH - dist + Math.sin(t * 0.7 + i) * 6;
        x += Math.sin(t * 0.5 + i * 2) * 8;
        const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + hs * 2) + i * 1.7);
        ctx.fillStyle = '#e8ff7a'; ctx.globalAlpha = 0.15 * tw; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.3 + 0.6 * tw; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      } else if (s === 1) {                        // pollen, floating gently
        const y = c * CH + hy * CH - dist + Math.sin(t * 0.6 + i) * 5;
        ctx.globalAlpha = 0.4; ctx.fillStyle = '#fff6a0';
        ctx.beginPath(); ctx.arc(x + Math.sin(t * 0.4 + i * 3) * 6, y, 1.4 + hs, 0, Math.PI * 2); ctx.fill();
      } else {                                     // petals, leaves or snow, falling and swaying
        const y = c * CH + ((hy * CH + t * (s === 3 ? 30 + hs * 20 : 18 + hs * 14)) % CH) - dist;
        x += Math.sin(t * 1.2 + i * 2) * 10;
        if (s === 3) { ctx.globalAlpha = 0.7; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 1.4 + hs * 1.4, 0, Math.PI * 2); ctx.fill(); }
        else {
          ctx.globalAlpha = 0.45; ctx.fillStyle = s === 0 ? (hs > 0.5 ? '#ffc8dc' : '#ffffff') : LEAF_COLS[2][hs > 0.5 ? 0 : 1];
          ctx.save(); ctx.translate(x, y); ctx.rotate(t * (hs - 0.5) * 3 + i);
          ctx.beginPath(); ctx.ellipse(0, 0, s === 0 ? 2.6 : 3.6, s === 0 ? 1.6 : 2, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
    }
  }
  ctx.restore();
}
