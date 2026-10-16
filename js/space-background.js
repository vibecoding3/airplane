// Paper Nosedive — Space map background: the Earth's glow, scenery by depth (satellites, planets, comets,
// galaxies) and rare surprises. Like the fish, none of it collides with the plane.
'use strict';

// scenery drawings join the FISH table so drawFishes can draw them; w,h is the sprite box, facing right
Object.assign(FISH, {
  sat: { alpha: 0.45, w: 70, h: 30, paint() {
    for (const d of [-1, 1]) { ctx.fillStyle = '#3a66c4'; ctx.fillRect(d < 0 ? -32 : 9, -6, 23, 12); }
    ctx.fillStyle = '#e0b84a'; ctx.fillRect(-9, -8, 18, 16);
    ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 1; ctx.strokeRect(-32, -6, 64, 12);
  } },
  station: { alpha: 0.4, w: 150, h: 70, paint() {
    ctx.fillStyle = '#8a95a8'; ctx.fillRect(-70, -3, 140, 6);                         // truss
    for (const x of [-66, -44, 32, 54]) { ctx.fillStyle = '#3a66c4'; ctx.fillRect(x, -30, 14, 24); ctx.fillRect(x, 6, 14, 24); }
    ctx.fillStyle = '#d6dbe3'; ctx.fillRect(-20, -9, 40, 18); ctx.fillRect(-6, -18, 12, 36);
    ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 1; ctx.strokeRect(-20, -9, 40, 18);
  } },
  astronaut: { alpha: 0.45, w: 44, h: 52, paint() {
    ctx.fillStyle = '#f2f2f2'; ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 1.2;
    ctx.beginPath(); roundRectPath(-11, -4, 22, 24, 7); ctx.fill(); ctx.stroke();               // body
    ctx.fillRect(-17, -2, 7, 16); ctx.fillRect(10, -12, 7, 14);                                 // arms (one waving)
    ctx.fillRect(-9, 19, 7, 12); ctx.fillRect(2, 19, 7, 12);                                    // legs
    ctx.beginPath(); ctx.arc(0, -12, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();             // helmet
    ctx.fillStyle = '#2b3a55'; ctx.beginPath(); ctx.ellipse(1, -12, 7, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-2, -14, 2, 0, Math.PI * 2); ctx.fill();
  } },
  moon: { alpha: 0.32, w: 90, h: 90, still: true, paint() {
    ctx.fillStyle = '#d8d4c8'; ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.15)';
    for (const [x, y, r] of [[-12, -10, 9], [14, 6, 7], [-4, 18, 6], [16, -16, 5]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  } },
  mars: { alpha: 0.32, w: 80, h: 80, still: true, paint() {
    ctx.fillStyle = '#c8603a'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(120,40,20,.4)'; ctx.fillRect(-34, -4, 68, 6); ctx.fillRect(-30, 12, 60, 4);
    ctx.fillStyle = '#f4ece6'; ctx.beginPath(); ctx.ellipse(0, -30, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  } },
  saturn: { alpha: 0.32, w: 180, h: 100, still: true, paint() {
    ctx.strokeStyle = '#e8d7a8'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(0, 0, 82, 20, -0.25, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();   // back of the ring
    ctx.fillStyle = '#e3b778'; ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(160,100,50,.35)'; ctx.fillRect(-38, -8, 76, 6); ctx.fillRect(-36, 8, 72, 5);
    ctx.beginPath(); ctx.ellipse(0, 0, 82, 20, -0.25, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke();    // front of the ring
  } },
  comet: { alpha: 0.5, w: 170, h: 40, paint() {
    const g = ctx.createLinearGradient(-80, 0, 30, 0);
    g.addColorStop(0, 'rgba(160,220,255,0)'); g.addColorStop(1, 'rgba(200,240,255,.9)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-80, -3); ctx.lineTo(22, -9); ctx.lineTo(22, 9); ctx.lineTo(-80, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(26, 0, 8, 0, Math.PI * 2); ctx.fill();
  } },
  galaxy: { w: 140, h: 90, still: true, alpha: 0.45, paint() {
    ctx.rotate(-0.4);
    for (let i = 0; i < 160; i++) {
      const arm = i % 2, t = i / 160 * 3.2, r = 4 + t * 18;
      const a = t * 2.2 + arm * Math.PI;
      ctx.fillStyle = i % 5 ? 'rgba(220,200,255,.7)' : 'rgba(255,255,255,.95)';
      ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r * 0.5, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
  } },
  blackhole: { w: 160, h: 90, still: true, alpha: 0.55, paint() {
    ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(0, 0, 70, 16, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ffe6a8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffcf7a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke();
  } },
  ufo: { alpha: 0.55, w: 70, h: 40, paint() {
    ctx.fillStyle = 'rgba(160,255,200,.5)'; ctx.beginPath(); ctx.arc(0, -6, 12, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#b8c4d0'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = -2; i <= 2; i++) { ctx.fillStyle = i % 2 ? '#ffd23f' : '#7fffb0'; ctx.beginPath(); ctx.arc(i * 10, 2, 2.2, 0, Math.PI * 2); ctx.fill(); }
  } },
  starwhale: { w: 260, h: 110, alpha: 0.35, paint() {
    // a whale outline drawn as a constellation
    const P = [[110, 0], [80, -30], [20, -40], [-50, -30], [-100, -8], [-128, -30], [-118, 0], [-128, 28], [-96, 8], [-40, 30], [30, 34], [90, 20]];
    ctx.strokeStyle = 'rgba(190,220,255,.6)'; ctx.lineWidth = 1.2; ctx.beginPath();
    P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    for (const [x, y] of P) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(80, -8, 2, 0, Math.PI * 2); ctx.fill();
  } }
});
// which scenery can appear at each depth level (same level depths as the formulas and fish)
const SPACE_TIERS = [
  ['sat', 'sat', 'station', 'astronaut'], ['sat', 'astronaut', 'moon', 'comet'], ['mars', 'saturn', 'comet', 'moon'],
  ['saturn', 'mars', 'galaxy', 'comet'], ['galaxy', 'blackhole', 'comet', 'galaxy'], ['galaxy', 'blackhole', 'starwhale', 'comet']
];
function spawnSpaceThing(lineY) {
  if (Math.random() < 0.45) return 0;                             // space is emptier than the sea
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  let kind = SPACE_TIERS[tier][ri(0, SPACE_TIERS[tier].length - 1)];
  if (m > 300 && Math.random() < 0.04) kind = 'ufo';               // a rare visitor zipping past
  const def = FISH[kind], s = rand(0.7, 1), dir = Math.random() < 0.5 ? -1 : 1;
  const speed = def.still ? rand(2, 5) : kind === 'ufo' ? rand(60, 90) : kind === 'comet' ? rand(40, 70) : rand(6, 16);
  fishes.push({ kind, v: 0, tier, x: rand(40, W - 40), y: lineY, dir, s, t: rand(0, 6), vx: dir * speed, w: def.w * s, ext: def.h * s });
  return def.h * s;
}

// the Earth's blue glow along the top of the first screen, sliding away within the first ~20 m
function drawSpaceDetails() {
  if (dist > 60 * PX_PER_M) return;
  const y = -dist * 0.5;                                           // slides away slower than the scenery
  const g = sharedSprite('earthGlow', W + 40, 300, 20, 0, () => {
    const gr = ctx.createLinearGradient(0, 0, 0, 230);
    gr.addColorStop(0, 'rgba(140,210,255,.6)'); gr.addColorStop(0.6, 'rgba(70,140,230,.25)'); gr.addColorStop(1, 'rgba(40,80,180,.05)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(W / 2, -200, W * 1.2, 420, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(210,245,255,.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(W / 2, -200, W * 1.2, 420, 0, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  });
  blit(g, 0, y);
}
