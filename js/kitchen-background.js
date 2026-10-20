// Paper Nosedive — Kitchen map background: the top of a cupboard the plane takes off from, scenery by layer (herb pots,
// cookbooks, a clock, copper pots, tea towels, oven mitts, a dish rack, glasses, egg cartons, milk, leftovers, frost) and
// sugar, flour, steam, water drops and frost drifting past. None of it collides, and none of it is also an obstacle.
'use strict';

// scenery drawings join the FISH table so drawFishes can draw them; w,h is the sprite box
Object.assign(FISH, {
  kiPlant: { w: 40, h: 50, still: true, alpha: 0.55, paint() {        // a pot of herbs
    ctx.fillStyle = '#c8603a'; ctx.beginPath(); ctx.moveTo(-11, 6); ctx.lineTo(11, 6); ctx.lineTo(8, 22); ctx.lineTo(-8, 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5fae4a'; for (const [x, y, a] of [[-6, -4, -0.5], [0, -12, 0], [6, -4, 0.5], [-3, -18, -0.3], [4, -18, 0.3]]) { ctx.beginPath(); ctx.ellipse(x, y, 4, 8, a, 0, Math.PI * 2); ctx.fill(); }
  } },
  kiBooks: { w: 50, h: 40, still: true, alpha: 0.5, paint() {         // a stack of cookbooks
    for (const [y, w, c] of [[12, 44, '#e05a4a'], [4, 40, '#3a8ad8'], [-4, 42, '#5fae4a'], [-12, 36, '#f4c430']]) { ctx.fillStyle = c; ctx.fillRect(-w / 2, y - 4, w, 8); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-w / 2 + 3, y - 1, w - 10, 2); }
  } },
  kiClock: { w: 44, h: 44, still: true, alpha: 0.5, paint() {         // a round wall clock
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a8ad8'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -12); ctx.moveTo(0, 0); ctx.lineTo(8, 4); ctx.stroke();
  } },
  kiPots: { w: 70, h: 50, still: true, alpha: 0.5, paint() {          // copper pots hanging from a rail
    ctx.strokeStyle = '#8a8f98'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-34, -22); ctx.lineTo(34, -22); ctx.stroke();
    for (const [x, r] of [[-18, 11], [14, 14]]) {
      ctx.beginPath(); ctx.moveTo(x, -22); ctx.lineTo(x, -14); ctx.stroke();
      ctx.fillStyle = '#d0784a'; ctx.beginPath(); ctx.arc(x, -2, r, 0, Math.PI); ctx.lineTo(x - r, -2); ctx.fill();
      ctx.fillRect(x - r - 2, -4, r * 2 + 4, 3);
    }
  } },
  kiTowel: { w: 30, h: 50, still: true, alpha: 0.5, cols: [{ c: '#e05a4a' }, { c: '#3a8ad8' }], paint(k) {   // a checked tea towel on a hook
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-11, -18, 22, 38);
    ctx.fillStyle = k.c; for (let y = -18; y < 20; y += 8) for (let x = -11; x < 11; x += 8) if (((x + y) / 8) % 2 === 0) ctx.fillRect(x, y, 4, 4);
    ctx.fillStyle = k.c; ctx.fillRect(-11, -18, 22, 3);
  } },
  kiRecipe: { w: 36, h: 30, still: true, alpha: 0.5, paint() {        // a recipe card pinned to the wall
    ctx.fillStyle = '#fffdf4'; ctx.fillRect(-15, -11, 30, 22);
    ctx.fillStyle = '#e05a4a'; ctx.fillRect(-15, -11, 30, 3); ctx.beginPath(); ctx.arc(0, -11, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9ab8e0'; for (const y of [-3, 2, 7]) ctx.fillRect(-11, y, 22, 1);
  } },
  kiMitt: { w: 34, h: 44, still: true, alpha: 0.5, paint() {          // an oven mitt
    ctx.fillStyle = '#e05a4a'; ctx.beginPath(); ctx.moveTo(-9, 18); ctx.lineTo(-9, -6); ctx.quadraticCurveTo(-9, -18, 2, -18); ctx.quadraticCurveTo(11, -18, 11, -6); ctx.lineTo(11, 18); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-12, 0, 4, 8, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-9, 12, 20, 6);
  } },
  kiWisp: { w: 30, h: 60, still: true, alpha: 0.35, paint() {         // a wisp of cooking steam
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 26); ctx.bezierCurveTo(-10, 12, 10, 0, 0, -12); ctx.bezierCurveTo(-8, -20, 6, -24, 2, -28); ctx.stroke();
  } },
  kiRack: { w: 70, h: 50, still: true, alpha: 0.45, paint() {         // a dish rack with plates
    ctx.strokeStyle = '#8a8f98'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-32, 18); ctx.lineTo(32, 18); ctx.moveTo(-32, 18); ctx.lineTo(-32, 4); ctx.moveTo(32, 18); ctx.lineTo(32, 4); ctx.stroke();
    for (const x of [-20, -8, 4, 16]) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x, 2, 4, 15, 0.15, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#9ab8e0'; ctx.lineWidth = 1.4; ctx.stroke(); }
  } },
  kiGlass: { w: 26, h: 40, still: true, alpha: 0.45, paint() {        // a drinking glass upside down to dry
    ctx.fillStyle = 'rgba(220,240,250,.8)'; ctx.beginPath(); ctx.moveTo(-8, -16); ctx.lineTo(8, -16); ctx.lineTo(10, 16); ctx.lineTo(-10, 16); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#9ab8e0'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-5, -10, 2, 20);
  } },
  kiEggs: { w: 60, h: 34, still: true, alpha: 0.5, paint() {          // an egg carton (fridge)
    ctx.fillStyle = '#d8c8a8'; ctx.fillRect(-28, 0, 56, 12);
    ctx.fillStyle = '#fffaf0'; for (let x = -21; x <= 21; x += 14) { ctx.beginPath(); ctx.ellipse(x, -2, 6, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  } },
  kiMilk: { w: 34, h: 56, still: true, alpha: 0.5, paint() {          // a plain milk carton (fridge)
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-12, -14, 24, 38);
    ctx.fillStyle = '#e8eef4'; ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(0, -26); ctx.lineTo(12, -14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a8ad8'; ctx.fillRect(-12, 0, 24, 10);
  } },
  kiBox: { w: 50, h: 34, still: true, alpha: 0.5, paint() {           // a box of leftovers with a lid
    ctx.fillStyle = 'rgba(230,240,245,.9)'; ctx.fillRect(-22, -6, 44, 20);
    ctx.fillStyle = '#5fae4a'; ctx.fillRect(-24, -10, 48, 5);
    ctx.fillStyle = '#e8b060'; ctx.fillRect(-16, 0, 32, 10);
  } },
  kiFrost: { w: 50, h: 50, still: true, alpha: 0.5, paint() {         // a frost crystal on the fridge wall
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a + 0.4) * 17, Math.sin(a + 0.4) * 17); }
    ctx.stroke();
  } },
  // rare: a slow ceiling fan far above (upper kitchen), a toy penguin magnet in the fridge (deeper)
  kiFan: { w: 150, h: 40, still: true, alpha: 0.25, paint() {
    ctx.fillStyle = '#8a6a4a'; ctx.beginPath(); ctx.ellipse(-36, 0, 34, 6, 0.05, 0, Math.PI * 2); ctx.ellipse(36, 0, 34, 6, -0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8d0c0'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  } },
  kiPenguin: { w: 40, h: 50, still: true, alpha: 0.5, paint() {
    ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.ellipse(0, 4, 13, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, 8, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4a020'; ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(3, -6); ctx.lineTo(0, -2); ctx.fill();
    ctx.fillStyle = '#ffffff'; for (const x of [-4, 4]) { ctx.beginPath(); ctx.arc(x, -9, 2, 0, Math.PI * 2); ctx.fill(); }
  } }
});
// which scenery can appear at each depth level (top shelf, countertop, stove, sink, then the fridge twice)
const KITCHEN_TIERS = [
  ['kiPlant', 'kiBooks', 'kiClock', 'kiRecipe'], ['kiPots', 'kiTowel', 'kiRecipe', 'kiPlant'],
  ['kiPots', 'kiMitt', 'kiWisp', 'kiTowel'], ['kiRack', 'kiGlass', 'kiTowel', 'kiGlass'],
  ['kiEggs', 'kiMilk', 'kiBox', 'kiFrost'], ['kiFrost', 'kiEggs', 'kiBox', 'kiMilk']
];
function spawnKitchenThing(lineY) {
  if (Math.random() < 0.3) return 0;
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  let kind = KITCHEN_TIERS[tier][ri(0, KITCHEN_TIERS[tier].length - 1)];
  if (lineY - lastSceneryY > 900 && Math.random() < 0.05) kind = m < 800 ? 'kiFan' : 'kiPenguin';
  if (kind === 'kiFan' || kind === 'kiPenguin') lastSceneryY = lineY;
  const def = FISH[kind], s = rand(0.8, 1), dir = Math.random() < 0.5 ? -1 : 1;
  const v = def.cols ? ri(0, def.cols.length - 1) : 0;
  fishes.push({ kind, v, tier, x: rand(40, W - 40), y: lineY, dir, s, t: rand(0, 6), vx: 0, w: def.w * s, ext: def.h * s });
  return def.h * s;
}

// the start of a Kitchen run: the top of a tall cupboard against a tiled wall, a window with the morning sun, an open
// cookbook and a kettle puffing steam. It slides away within the first ~35 m.
const kitchenStartY = () => planeScreenY() - 70 - dist * 0.22;      // the cupboard's top edge on screen
function drawKitchenStart() {
  const y = kitchenStartY();
  if (y < -40) return;
  blit(sharedSprite('kitchenTop', W, 520, 0, 500, () => {
    ctx.fillStyle = '#fbf1dc'; ctx.fillRect(0, -500, W, 500);                                   // the wall
    ctx.strokeStyle = 'rgba(160,130,90,.18)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 0; x <= W; x += 25) { ctx.moveTo(x, -500); ctx.lineTo(x, 0); }
    for (let yy = -500; yy <= 0; yy += 25) { ctx.moveTo(0, yy); ctx.lineTo(W, yy); }
    ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(150, -150, 120, 100);                                // the window and its morning sky
    const sky = ctx.createLinearGradient(0, -144, 0, -56); sky.addColorStop(0, '#8ad0f4'); sky.addColorStop(1, '#ffe8c0');
    ctx.fillStyle = sky; ctx.fillRect(156, -144, 108, 88);
    ctx.fillStyle = '#fff2a0'; ctx.beginPath(); ctx.arc(236, -118, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5fae4a'; ctx.beginPath(); ctx.ellipse(190, -58, 34, 10, 0, Math.PI, 0); ctx.fill();          // a hill outside
    ctx.fillStyle = '#ffffff'; ctx.fillRect(207, -144, 6, 88); ctx.fillRect(156, -103, 108, 5);
    ctx.fillStyle = '#e05a4a'; ctx.fillRect(144, -158, 132, 9);                                  // a little curtain rail
    ctx.fillStyle = '#c8915a'; ctx.fillRect(0, -40, W, 40);                                       // the cupboard top
    ctx.fillStyle = '#a8703a'; ctx.fillRect(0, -40, W, 6);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(40, -40); ctx.lineTo(80, -52); ctx.lineTo(120, -40); ctx.lineTo(80, -44); ctx.closePath(); ctx.fill();   // the open cookbook
    ctx.strokeStyle = '#9ab8e0'; ctx.lineWidth = 1; ctx.beginPath(); for (const k of [0.3, 0.6]) { ctx.moveTo(48 + k * 20, -44 - k * 6); ctx.lineTo(72, -48 + k * 2); ctx.moveTo(88, -48 + k * 2); ctx.lineTo(112 - k * 20, -44 - k * 6); } ctx.stroke();
    ctx.fillStyle = '#e05a4a'; ctx.beginPath(); ctx.ellipse(330, -58, 22, 18, 0, 0, Math.PI * 2); ctx.fill();   // the kettle
    ctx.fillRect(308, -44, 44, 4);
    ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(330, -70, 12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.fillStyle = '#e05a4a'; ctx.beginPath(); ctx.moveTo(350, -62); ctx.lineTo(366, -72); ctx.lineTo(368, -68); ctx.lineTo(352, -54); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, yy, r] of [[372, -80, 6], [378, -94, 8], [372, -112, 7]]) { ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill(); }
  }), 0, y);
}

// drifting specks by layer: sugar sparkles (top shelf), flour dust (countertop), steam wisps rising (stove), water drops
// falling (sink), then frost flakes (fridge). All faint, so they never hide an obstacle. Positions come from a hash of
// the page chunk, so nothing is stored.
function drawKitchenParticles() {
  const CH = 300, N = 12, t = titleTime + time;
  ctx.save();
  for (let c = Math.floor((dist - 20) / CH); c * CH < dist + H + 20; c++) {
    const L = kitchenLayer(c * CH);
    for (let i = 0; i < N; i++) {
      const hx = hash(c * 97 + i * 13.1), hy = hash(c * 53 + i * 7.7), hs = hash(c * 11 + i * 3.3);
      const x = hx * W;
      if (L === 0) {                               // twinkling sugar crystals
        const y = c * CH + ((hy * CH + t * (10 + hs * 8)) % CH) - dist;
        ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 4 + i); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 2, 2);
      } else if (L === 1) {                        // a little flour dust floating
        const y = c * CH + ((hy * CH + t * (8 + hs * 6)) % CH) - dist;
        ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + Math.sin(t + i) * 6, y, 1.5 + hs * 1.5, 0, Math.PI * 2); ctx.fill();
      } else if (L === 2) {                        // steam wisps rising
        const y = c * CH + (((hy * CH - t * (16 + hs * 10)) % CH) + CH) % CH - dist;
        ctx.globalAlpha = 0.2; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + Math.sin(t + i) * 6, y, 5 + hs * 4, 0, Math.PI * 2); ctx.fill();
      } else if (L === 3) {                        // water drops falling
        const y = c * CH + ((hy * CH + t * (45 + hs * 30)) % CH) - dist;
        ctx.globalAlpha = 0.45; ctx.fillStyle = '#6ab0e0'; ctx.beginPath(); ctx.ellipse(x, y, 1.6, 2.6, 0, 0, Math.PI * 2); ctx.fill();
      } else {                                     // frost flakes drifting
        const y = c * CH + ((hy * CH + t * (12 + hs * 10)) % CH) - dist;
        ctx.globalAlpha = 0.6; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
        const xx = x + Math.sin(t * 0.7 + i) * 6, r = 2 + hs * 2; ctx.beginPath(); ctx.moveTo(xx - r, y); ctx.lineTo(xx + r, y); ctx.moveTo(xx, y - r); ctx.lineTo(xx, y + r); ctx.stroke();
      }
    }
  }
  ctx.restore();
}
