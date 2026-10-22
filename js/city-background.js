// Paper Nosedive — Neon City map background: the rooftop the plane drops from at the start, scenery by depth
// (drones, billboards, lanterns, a subway train, arcade pixels, the data core) and rain, sparks, pixels and data
// packets drifting past. None of it collides.
'use strict';

// a neon glow on the current path: a wide faint stroke, the coloured tube, then a bright core
function neonStroke(col, w = 2.4, core = true) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = col;
  ctx.globalAlpha = 0.3; ctx.lineWidth = w * 2.6; ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = w; ctx.stroke();
  if (core) { ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = w * 0.35; ctx.stroke(); }
}
// pixel art from rows of characters: '#' is filled, '.' is empty; s is the pixel size
function pixelArt(rows, s, col) {
  ctx.fillStyle = col;
  const ox = -rows[0].length * s / 2, oy = -rows.length * s / 2;
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') ctx.fillRect(ox + x * s, oy + y * s, s, s); });
}

// scenery drawings join the FISH table so drawFishes can draw them; w,h is the sprite box, facing right
Object.assign(FISH, {
  ncDrone: { w: 50, h: 24, paint() {
    ctx.fillStyle = '#8f98b0'; ctx.fillRect(-16, -1, 32, 3);                                   // arms
    ctx.fillStyle = '#c9cfdb'; ctx.beginPath(); roundRectPath(-8, -4, 16, 9, 3); ctx.fill();   // body
    ctx.fillStyle = 'rgba(200,230,255,.8)'; for (const x of [-17, 17]) { ctx.beginPath(); ctx.ellipse(x, -3, 8, 1.6, 0, 0, Math.PI * 2); ctx.fill(); }   // rotors
    ctx.fillStyle = '#ff3f5a'; ctx.beginPath(); ctx.arc(6, 0, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3ff0ff'; ctx.fillRect(-4, 5, 8, 2);
  } },
  ncPigeon: { w: 40, h: 26, paint() {
    ctx.fillStyle = '#9aa0b0';
    ctx.beginPath(); ctx.ellipse(0, 2, 11, 6, -0.1, 0, Math.PI * 2); ctx.fill();               // body
    ctx.beginPath(); ctx.arc(10, -3, 4.5, 0, Math.PI * 2); ctx.fill();                            // head
    ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(-18, 0); ctx.lineTo(-16, 6); ctx.fill();       // tail
    ctx.fillStyle = '#7d8394'; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.quadraticCurveTo(0, -14, 6, -10); ctx.quadraticCurveTo(4, -2, -4, 0); ctx.fill();   // wing up
    ctx.fillStyle = '#7fd0b0'; ctx.beginPath(); ctx.arc(8, 1, 2.5, 0, Math.PI * 2); ctx.fill();   // a green sheen at the neck
    ctx.fillStyle = '#ffb03f'; ctx.beginPath(); ctx.moveTo(14, -3); ctx.lineTo(18, -2); ctx.lineTo(14, -1); ctx.fill();
    ctx.fillStyle = '#1a1420'; ctx.beginPath(); ctx.arc(11, -4, 1, 0, Math.PI * 2); ctx.fill();
  } },
  ncCat: { w: 50, h: 50, still: true, alpha: 0.65, paint() {                 // a black cat sitting on a little ledge
    ctx.fillStyle = '#3a3f5c'; ctx.fillRect(-22, 16, 44, 5);
    ctx.fillStyle = '#0c0b14';
    ctx.beginPath(); ctx.ellipse(0, 6, 10, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -10, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, -14); ctx.lineTo(-6, -22); ctx.lineTo(-2, -16); ctx.moveTo(7, -14); ctx.lineTo(6, -22); ctx.lineTo(2, -16); ctx.fill();
    ctx.strokeStyle = '#0c0b14'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(8, 14); ctx.quadraticCurveTo(18, 14, 16, 24); ctx.stroke();   // tail over the edge
    ctx.fillStyle = '#ffe03f'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 3.2, -10, 1.8, 2.2, 0, 0, Math.PI * 2); ctx.fill(); }
  } },
  ncCables: { w: 220, h: 60, still: true, alpha: 0.5, paint() {             // sagging wires with a few little lights
    ctx.strokeStyle = '#0c0b14'; ctx.lineWidth = 2;
    for (const [y0, sag] of [[-20, 24], [-10, 30], [-24, 16]]) { ctx.beginPath(); ctx.moveTo(-110, y0); ctx.quadraticCurveTo(0, y0 + sag * 2, 110, y0 + 4); ctx.stroke(); }
    const cols = ['#ff4fd8', '#ffd36a', '#3ff0ff'];
    for (let i = 0; i < 9; i++) {
      const k = (i + 0.5) / 9, x = -110 + 220 * k, y = (1 - k) * (1 - k) * -10 + 2 * k * (1 - k) * 50 + k * k * -6;
      ctx.fillStyle = cols[i % 3]; ctx.beginPath(); ctx.arc(x, y + 3, 2.4, 0, Math.PI * 2); ctx.fill();
    }
  } },
  ncBillboard: { w: 100, h: 70, still: true, alpha: 0.5, cols: [{ c: '#ff4fd8', g: 'smile' }, { c: '#3ff0ff', g: 'wave' }, { c: '#b6ff3f', g: 'star' }], paint(k) {
    ctx.fillStyle = '#4a4f68'; ctx.fillRect(-30, 22, 4, 12); ctx.fillRect(26, 22, 4, 12);      // legs
    ctx.fillStyle = '#120f22'; ctx.beginPath(); roundRectPath(-46, -30, 92, 54, 4); ctx.fill();
    neonStroke(k.c, 2, false);
    ctx.beginPath();
    if (k.g === 'smile') { ctx.arc(0, -4, 14, 0, Math.PI * 2); ctx.moveTo(-6, -8); ctx.lineTo(-6, -6); ctx.moveTo(6, -8); ctx.lineTo(6, -6); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(0, 7, 7, 0); }
    else if (k.g === 'wave') { for (let x = -34; x <= 34; x += 2) { const y = Math.sin(x * 0.18) * 9 - 3; x === -34 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } }
    else { for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 16, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r - 3); } ctx.closePath(); }
    neonStroke(k.c, 2.2);
  } },
  // a red neon shop sign hanging from a rod on two chains: KEBAB with a skewer, or PIZZA with a slice (v137); text, so never mirrored
  ncFoodSign: { w: 124, h: 70, still: true, alpha: 0.55, noFlip: true, cols: [{ t: 'KEBAB' }, { t: 'PIZZA' }], paint(k) {
    const red = '#ff3f3f';
    ctx.fillStyle = '#4a4f68'; ctx.fillRect(-58, -32, 116, 3);                                     // the rod
    ctx.strokeStyle = '#4a4f68'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (const x of [-44, 44]) { ctx.moveTo(x, -29); ctx.lineTo(x, -18); }
    ctx.stroke();
    ctx.fillStyle = '#120f22'; ctx.beginPath(); roundRectPath(-58, -18, 116, 40, 5); ctx.fill();
    ctx.beginPath(); roundRectPath(-54, -14, 108, 32, 4); neonStroke(red, 1.6, false);
    ctx.beginPath();
    if (k.t === 'KEBAB') {                                                                           // a skewer with meat and veg
      ctx.moveTo(-46, 12); ctx.lineTo(-26, -8);
      for (const [x, y] of [[-41, 7], [-36, 2], [-31, -3]]) { ctx.moveTo(x + 3.5, y); ctx.arc(x, y, 3.5, 0, Math.PI * 2); }
    } else {                                                                                         // a pizza slice with pepperoni
      ctx.moveTo(-46, -7); ctx.quadraticCurveTo(-36, -12, -26, -7); ctx.lineTo(-36, 13); ctx.closePath();
      for (const [x, y] of [[-39, -3], [-33, -2], [-36, 4]]) { ctx.moveTo(x + 1.8, y); ctx.arc(x, y, 1.8, 0, Math.PI * 2); }
    }
    neonStroke(red, 1.6);
    ctx.font = '700 20px Kalam, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,63,63,.3)'; ctx.fillText(k.t, 12, 3);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,63,63,.35)'; ctx.lineWidth = 5; ctx.strokeText(k.t, 12, 3);         // glow
    ctx.strokeStyle = red; ctx.lineWidth = 1.8; ctx.strokeText(k.t, 12, 3);
    ctx.strokeStyle = '#ffd0d0'; ctx.lineWidth = 0.6; ctx.strokeText(k.t, 12, 3);                   // bright core
  } },
  ncLanterns: { w: 200, h: 60, still: true, alpha: 0.6, paint() {           // a string of paper lanterns
    ctx.strokeStyle = '#0c0b14'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-100, -22); ctx.quadraticCurveTo(0, 10, 100, -22); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const k = (i + 0.5) / 5, x = -100 + 200 * k, y = (1 - k) * (1 - k) * -22 + 2 * k * (1 - k) * 10 + k * k * -22;
      ctx.fillStyle = 'rgba(255,90,60,.3)'; ctx.beginPath(); ctx.arc(x, y + 12, 12, 0, Math.PI * 2); ctx.fill();   // glow
      ctx.fillStyle = i % 2 ? '#ff6a3f' : '#ff3f3f'; ctx.beginPath(); ctx.ellipse(x, y + 12, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1410'; ctx.fillRect(x - 4, y + 2, 8, 2); ctx.fillRect(x - 4, y + 20, 8, 2);
      ctx.fillStyle = 'rgba(255,230,160,.6)'; ctx.fillRect(x - 1, y + 6, 2, 12);
    }
  } },
  ncRobot: { w: 40, h: 40, paint() {                                       // a flying delivery robot carrying a parcel
    ctx.fillStyle = 'rgba(200,230,255,.8)'; ctx.beginPath(); ctx.ellipse(0, -16, 14, 2, 0, 0, Math.PI * 2); ctx.fill();   // rotor
    ctx.fillStyle = '#8f98b0'; ctx.fillRect(-1, -15, 2, 5);
    ctx.fillStyle = '#e6ecf5'; ctx.beginPath(); roundRectPath(-11, -10, 22, 16, 5); ctx.fill();
    ctx.fillStyle = '#1a1830'; ctx.beginPath(); roundRectPath(-7, -7, 14, 8, 3); ctx.fill();
    ctx.fillStyle = '#3ff0ff'; for (const x of [-3, 3]) { ctx.beginPath(); ctx.arc(x, -3, 1.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#c8a46a'; ctx.fillRect(-7, 8, 14, 10); ctx.fillStyle = '#a07c48'; ctx.fillRect(-1, 8, 2, 10);   // the parcel
  } },
  ncKoi: { w: 70, h: 34, alpha: 0.45, cols: [{ c: '#3ff0ff' }, { c: '#ff4fd8' }], paint(k) {     // a holographic koi
    ctx.beginPath();
    ctx.moveTo(26, 0); ctx.quadraticCurveTo(18, -11, 0, -10); ctx.quadraticCurveTo(-14, -9, -22, 0); ctx.quadraticCurveTo(-14, 9, 0, 10); ctx.quadraticCurveTo(18, 11, 26, 0);
    ctx.moveTo(-20, 0); ctx.lineTo(-33, -10); ctx.quadraticCurveTo(-28, 0, -33, 10); ctx.closePath();
    ctx.fillStyle = k.c; ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;
    neonStroke(k.c, 1.6, false);
    ctx.strokeStyle = k.c; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.beginPath();
    for (let y = -8; y <= 8; y += 3) { ctx.moveTo(-18, y); ctx.lineTo(22, y); }                    // scanlines
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(17, -3, 1.6, 0, Math.PI * 2); ctx.fill();
  } },
  // the subway (400–800 m): a train racing past far behind, tunnel lamps and pipes
  ncTrain: { w: 300, h: 50, alpha: 0.3, paint() {
    ctx.fillStyle = '#8fa0b8'; ctx.beginPath(); roundRectPath(-148, -18, 290, 36, 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(142, -18); ctx.quadraticCurveTo(152, -10, 150, 18); ctx.lineTo(140, 18); ctx.fill();   // nose
    ctx.fillStyle = '#ffe9a8'; for (let x = -136; x < 130; x += 24) ctx.fillRect(x, -10, 16, 10);   // lit windows
    ctx.fillStyle = '#ff4f6a'; ctx.fillRect(-148, 6, 290, 4);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(146, 8, 3, 0, Math.PI * 2); ctx.fill();
  } },
  ncLamp: { w: 30, h: 50, still: true, alpha: 0.7, lure: [0, 4], paint() {   // a caged tunnel lamp
    ctx.fillStyle = '#4a4f68'; ctx.fillRect(-2, -22, 4, 16);
    ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(0, 4, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2a2d40'; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.arc(0, 4, 9, 0, Math.PI * 2); ctx.moveTo(-9, 4); ctx.lineTo(9, 4); ctx.moveTo(0, -5); ctx.lineTo(0, 13); ctx.stroke();
    ctx.fillStyle = '#4a4f68'; ctx.fillRect(-6, -8, 12, 4);
  } },
  ncPipes: { w: 160, h: 50, still: true, alpha: 0.45, paint() {
    for (const [y, r, c] of [[-12, 7, '#5a6078'], [2, 5, '#6b5a48'], [14, 6, '#4a5068']]) {
      ctx.fillStyle = c; ctx.fillRect(-80, y - r, 160, r * 2);
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-80, y - r, 160, 2);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; for (const x of [-50, 10, 60]) ctx.fillRect(x, y - r - 1, 5, r * 2 + 2);   // joints
    }
    ctx.strokeStyle = '#ff3f3f'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-20, -12, 7, 0, Math.PI * 2); ctx.moveTo(-27, -12); ctx.lineTo(-13, -12); ctx.moveTo(-20, -19); ctx.lineTo(-20, -5); ctx.stroke();   // a valve wheel
  } },
  // the arcade (800–1,500 m): cabinets and floating pixel art
  ncArcade: { w: 50, h: 80, still: true, alpha: 0.55, cols: [{ c: '#ff4fd8' }, { c: '#3ff0ff' }], paint(k) {
    ctx.fillStyle = '#1e1a38'; ctx.beginPath(); ctx.moveTo(-18, 38); ctx.lineTo(-18, -26); ctx.lineTo(-12, -38); ctx.lineTo(18, -38); ctx.lineTo(18, 38); ctx.closePath(); ctx.fill();
    ctx.fillStyle = k.c; ctx.fillRect(-14, -34, 28, 7);                                                   // marquee
    ctx.fillStyle = '#0a1830'; ctx.fillRect(-13, -22, 26, 22);
    ctx.save(); ctx.translate(0, -11); pixelArt(['.#..#.', '######', '#.##.#', '######'], 3, k.c); ctx.restore();   // something on the screen
    ctx.fillStyle = '#3a3460'; ctx.fillRect(-18, 4, 36, 8);
    ctx.fillStyle = '#ff3f5a'; ctx.beginPath(); ctx.arc(-6, 7, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(4, 8, 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(10, 6, 2, 0, Math.PI * 2); ctx.fill();
  } },
  ncPixHeart: { w: 30, h: 30, paint() { pixelArt(['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'], 3.6, '#ff3f6a'); } },
  ncPixCoin: { w: 26, h: 30, paint() { pixelArt(['.###.', '#####', '##.##', '##.##', '##.##', '#####', '.###.'], 3.6, '#ffd23f'); } },
  ncPixStar: { w: 30, h: 30, paint() { pixelArt(['...#...', '..###..', '#######', '.#####.', '.##.##.', '##...##'], 3.6, '#b6ff3f'); } },
  // the data core (1,500 m +): chips, glowing data cubes, server racks
  ncChip: { w: 70, h: 70, still: true, alpha: 0.45, paint() {
    ctx.strokeStyle = '#3fffb0'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = -2; i <= 2; i++) for (const s of [-1, 1]) { ctx.moveTo(i * 7, s * 14); ctx.lineTo(i * 7, s * 30); ctx.moveTo(s * 14, i * 7); ctx.lineTo(s * 30, i * 7); }
    ctx.stroke();
    ctx.fillStyle = '#3fffb0'; for (let i = -2; i <= 2; i++) for (const s of [-1, 1]) { ctx.fillRect(i * 7 - 2, s * 30 - 2, 4, 4); ctx.fillRect(s * 30 - 2, i * 7 - 2, 4, 4); }
    ctx.fillStyle = '#0d2a26'; ctx.fillRect(-16, -16, 32, 32);
    ctx.strokeStyle = '#3fffb0'; ctx.strokeRect(-16, -16, 32, 32);
    ctx.fillStyle = '#3fffb0'; ctx.beginPath(); ctx.arc(-10, -10, 2, 0, Math.PI * 2); ctx.fill();
  } },
  ncCube: { w: 40, h: 40, cols: [{ c: '#3ff0ff' }, { c: '#3fffb0' }, { c: '#ff4fd8' }], paint(k) {   // a wireframe data cube
    ctx.beginPath();
    ctx.rect(-12, -6, 18, 18); ctx.rect(-6, -12, 18, 18);
    for (const [x, y] of [[-12, -6], [6, -6], [-12, 12], [6, 12]]) { ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 6); }
    neonStroke(k.c, 1.4, false);
  } },
  ncServer: { w: 50, h: 90, still: true, alpha: 0.45, paint() {
    ctx.fillStyle = '#141a28'; ctx.fillRect(-20, -42, 40, 84);
    for (let y = -38; y < 38; y += 12) {
      ctx.fillStyle = '#232c42'; ctx.fillRect(-17, y, 34, 9);
      ctx.fillStyle = (y / 12) % 2 ? '#3fffb0' : '#3ff0ff'; ctx.fillRect(10, y + 3, 3, 3);
      ctx.fillStyle = '#ffb03f'; ctx.fillRect(4, y + 3, 3, 3);
    }
  } },
  // rare: a blimp with a glowing ad screen near the rooftops, and a neon dragon kite deeper down
  ncAirship: { w: 220, h: 90, alpha: 0.3, paint() {
    ctx.fillStyle = '#8f98b0'; ctx.beginPath(); ctx.ellipse(0, -8, 100, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-90, -8); ctx.lineTo(-108, -32); ctx.lineTo(-108, 16); ctx.closePath(); ctx.fill();   // tail fins
    ctx.fillStyle = '#4a4f68'; ctx.fillRect(-20, 22, 40, 12);                                                         // gondola
    ctx.fillStyle = '#120f22'; ctx.fillRect(-56, -24, 112, 32);
    ctx.fillStyle = '#ff4fd8'; ctx.fillRect(-50, -18, 40, 20); ctx.fillStyle = '#3ff0ff'; ctx.fillRect(-4, -18, 54, 8); ctx.fillRect(-4, -6, 36, 8);
  } },
  ncKite: { w: 300, h: 110, alpha: 0.18, paint() {
    const pts = []; for (let i = 0; i <= 14; i++) pts.push([110 - i * 17, Math.sin(i * 0.8) * 22]);
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    neonStroke('#ff4fd8', 5, false);
    ctx.beginPath(); for (const [x, y] of pts.slice(1)) { ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); }   // ribs
    neonStroke('#ffb03f', 2, false);
    ctx.beginPath(); ctx.moveTo(110, 0); ctx.lineTo(136, -14); ctx.lineTo(128, 0); ctx.lineTo(140, 10); ctx.closePath();   // head
    ctx.moveTo(126, -10); ctx.lineTo(118, -30); ctx.moveTo(120, -6); ctx.lineTo(104, -26);                                  // horns
    neonStroke('#3ff0ff', 2.6, false);
  } }
});
// which scenery can appear at each depth level (same level depths as the formulas and fish)
const CITY_TIERS = [
  ['ncDrone', 'ncPigeon', 'ncCat', 'ncCables', 'ncBillboard', 'ncFoodSign', 'ncDrone'], ['ncBillboard', 'ncLanterns', 'ncCables', 'ncFoodSign', 'ncRobot', 'ncKoi', 'ncDrone'],
  ['ncTrain', 'ncLamp', 'ncPipes', 'ncKoi', 'ncLamp'], ['ncArcade', 'ncPixHeart', 'ncPixCoin', 'ncPixStar', 'ncKoi'],
  ['ncChip', 'ncCube', 'ncServer', 'ncKoi', 'ncCube'], ['ncCube', 'ncChip', 'ncServer', 'ncKoi']
];
function spawnCityThing(lineY) {
  if (Math.random() < 0.3) return 0;
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  let kind = CITY_TIERS[tier][ri(0, CITY_TIERS[tier].length - 1)];
  if (lineY - lastSceneryY > 900 && Math.random() < 0.05 && (m < 400 || m > 800)) { kind = m < 400 ? 'ncAirship' : 'ncKite'; lastSceneryY = lineY; }
  if (kind === 'ncTrain' && lineY - lastSceneryY < 600) kind = 'ncLamp';   // trains (far behind) keep apart like the whales
  if (kind === 'ncTrain') lastSceneryY = lineY;
  const def = FISH[kind], s = rand(0.8, 1), dir = Math.random() < 0.5 ? -1 : 1;
  const wallHung = kind === 'ncCat' || kind === 'ncLamp' || kind === 'ncPipes';
  // cats, lamps and pipes sit by a wall; the train, the blimp and the kite cross the whole screen
  const x = wallHung ? (dir < 0 ? rand(16, 50) : rand(W - 50, W - 16)) : kind === 'ncCables' || kind === 'ncLanterns' ? W / 2 + rand(-60, 60) : kind === 'ncFoodSign' ? rand(70, W - 70) : rand(40, W - 40);
  const speed = def.still ? 0 : kind === 'ncTrain' ? rand(160, 220) : kind === 'ncAirship' || kind === 'ncKite' ? rand(12, 18)
    : kind === 'ncPigeon' || kind === 'ncDrone' ? rand(30, 55) : rand(8, 18);
  const v = def.cols ? ri(0, def.cols.length - 1) : 0;
  const x0 = kind === 'ncTrain' ? (dir > 0 ? -def.w / 2 + 10 : W + def.w / 2 - 10) : x;
  fishes.push({ kind, v, tier, x: x0, y: lineY, dir, s, t: rand(0, 6), vx: dir * speed, w: def.w * s, ext: def.h * s });
  return def.h * s;
}

// the start of a Neon City run: the plane drops off a rooftop at night, with the moon, the skyline and a blinking
// OPEN sign. It slides up out of view within the first ~35 m, like the Earth in Space.
const cityStartY = () => planeScreenY() - 70 - dist * 0.22;      // bottom edge of the rooftop on screen
function drawCityStart() {
  const y = cityStartY();
  if (y < -30) return;
  blit(sharedSprite('cityTop', W, 520, 0, 500, () => {
    const sky = ctx.createLinearGradient(0, -500, 0, -70);
    sky.addColorStop(0, '#080b24'); sky.addColorStop(0.7, '#1f1850'); sky.addColorStop(1, '#4a2470');
    ctx.fillStyle = sky; ctx.fillRect(0, -500, W, 432);
    ctx.fillStyle = '#ffffff';                                                                    // stars
    for (let i = 0; i < 40; i++) { ctx.globalAlpha = 0.3 + 0.6 * hash(i * 3.1); ctx.fillRect(hash(i * 7.3) * W, -500 + hash(i * 1.7) * 260, 1.6, 1.6); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,244,200,.14)'; ctx.beginPath(); ctx.arc(318, -390, 42, 0, Math.PI * 2); ctx.fill();   // the moon
    ctx.fillStyle = '#fff4c8'; ctx.beginPath(); ctx.arc(318, -390, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,190,150,.4)'; for (const [x, yy, r] of [[310, -396, 5], [326, -382, 3.5], [322, -400, 2.5]]) { ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill(); }
    // two rows of skyline with lit windows: far and pale, then near and dark
    for (const [col, minH, maxH, seed] of [['#231d4e', 90, 220, 1], ['#120f2e', 40, 130, 5]]) {
      for (let x = -10, i = 0; x < W; i++) {
        const w = 28 + hash(seed * 31 + i * 2.3) * 40, h = minH + hash(seed * 17 + i * 5.1) * (maxH - minH), top = -70 - h;
        ctx.fillStyle = col; ctx.fillRect(x, top, w, h);
        for (let wy = top + 8; wy < -78; wy += 12) for (let wx = x + 5; wx < x + w - 6; wx += 9) {
          const lit = hash(wx * 0.37 + wy * 1.13 + seed);
          if (lit > 0.62) { ctx.fillStyle = lit > 0.9 ? '#7ff0ff' : '#ffd96a'; ctx.globalAlpha = seed === 1 ? 0.35 : 0.6; ctx.fillRect(wx, wy, 4, 5); ctx.globalAlpha = 1; }
        }
        x += w + 4;
      }
    }
    ctx.beginPath(); roundRectPath(52, -200, 14, 70, 3); neonStroke('#ff4fd8', 2);                 // a tall vertical sign
    ctx.beginPath(); ctx.arc(250, -150, 16, 0, Math.PI * 2); neonStroke('#3ff0ff', 2);              // a round one
    // the rooftop: a parapet, a water tank on legs and an antenna
    ctx.fillStyle = '#23263b'; ctx.fillRect(0, -70, W, 70);
    ctx.fillStyle = '#3a3f5c'; ctx.fillRect(0, -74, W, 6);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let yy = -56; yy < 0; yy += 14) { ctx.moveTo(0, yy); ctx.lineTo(W, yy); }
    ctx.stroke();
    ctx.strokeStyle = '#4a4f68'; ctx.lineWidth = 3; ctx.beginPath();
    for (const x of [44, 76]) { ctx.moveTo(x, -74); ctx.lineTo(x, -110); }
    ctx.moveTo(44, -92); ctx.lineTo(76, -110); ctx.stroke();
    ctx.fillStyle = '#6b5a48'; ctx.fillRect(34, -158, 52, 48);
    ctx.beginPath(); ctx.moveTo(30, -158); ctx.lineTo(60, -178); ctx.lineTo(90, -158); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; for (const yy of [-146, -128]) ctx.fillRect(34, yy, 52, 3);
    ctx.strokeStyle = '#8f98b0'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(350, -74); ctx.lineTo(350, -220); for (const yy of [-120, -160, -195]) { ctx.moveTo(340, yy); ctx.lineTo(360, yy); }
    ctx.stroke();
    ctx.fillStyle = '#120f22'; ctx.fillRect(160, -58, 80, 34);                                    // the OPEN sign's board
    ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(W, -2); neonStroke('#3ff0ff', 2.4);             // a neon strip along the edge
  }), 0, y);
  // the OPEN sign flickers now and then, and the antenna light blinks
  const t = titleTime + time, on = Math.floor(t * 1.5) % 5 !== 4 || Math.sin(t * 40) > 0;
  ctx.save();
  ctx.font = '700 22px Kalam, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (on) { ctx.fillStyle = 'rgba(255,79,216,.35)'; ctx.fillText('OPEN', 200, y - 40); ctx.strokeStyle = '#ff4fd8'; ctx.lineWidth = 2; ctx.strokeText('OPEN', 200, y - 40); }
  else { ctx.strokeStyle = 'rgba(255,79,216,.25)'; ctx.lineWidth = 1.5; ctx.strokeText('OPEN', 200, y - 40); }
  if (Math.floor(t * 1.2) % 2) { ctx.fillStyle = '#ff3f3f'; ctx.beginPath(); ctx.arc(350, y - 222, 3.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// drifting specks by depth: rain over the rooftops and streets (0–400 m), sparks falling from the subway wires
// (400–800 m), neon pixels in the arcade (800–1,500 m), then data packets racing up in the data core.
// Positions come from a hash of the page chunk, so nothing is stored.
function drawCityParticles() {
  const CH = 300, N = 14, t = titleTime + time;
  ctx.save();
  ctx.beginPath();                                   // all the rain in one path
  for (let c = Math.floor((dist - 20) / CH); c * CH < dist + H + 20; c++) {
    const m = c * CH / PX_PER_M;
    for (let i = 0; i < N; i++) {
      const hx = hash(c * 97 + i * 13.1), hy = hash(c * 53 + i * 7.7), hs = hash(c * 11 + i * 3.3);
      const x = hx * W;
      if (m < 400) {
        const y = c * CH + ((hy * CH + t * (260 + hs * 120)) % CH) - dist;
        ctx.moveTo(x, y); ctx.lineTo(x - 2, y - 10 - hs * 6);
      } else if (m < 800) {                        // sparks, fading as they fall
        const k = ((hy * CH + t * (90 + hs * 60)) % CH) / CH;
        ctx.globalAlpha = 0.8 * (1 - k); ctx.fillStyle = hs > 0.5 ? '#ffc35a' : '#fff0c0';
        ctx.fillRect(x + Math.sin(t * 2 + i) * 4, c * CH + k * CH - dist, 2, 2);
      } else if (m < 1500) {                       // neon pixels drifting up and twinkling
        const y = c * CH + (((hy * CH - t * (15 + hs * 20)) % CH) + CH) % CH - dist;
        ctx.globalAlpha = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * (2 + hs * 3) + i)); ctx.fillStyle = NEON_MARKS[i % NEON_MARKS.length];
        ctx.fillRect(x + Math.sin(t * 0.8 + i * 2) * 5, y, 3, 3);
      } else {                                     // data packets racing up
        const y = c * CH + (((hy * CH - t * (120 + hs * 80)) % CH) + CH) % CH - dist;
        ctx.globalAlpha = 0.5; ctx.fillStyle = hs > 0.5 ? '#3fffb0' : '#3ff0ff';
        ctx.fillRect(Math.round(hx * 20) * 20, y, 1.8, 5 + hs * 6);
      }
    }
  }
  ctx.globalAlpha = 0.35; ctx.strokeStyle = '#9fd8ff'; ctx.lineWidth = 1.1; ctx.stroke();
  ctx.restore();
}
