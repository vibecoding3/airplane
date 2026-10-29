// Paper Nosedive — Art for the Ocean's second looks in the twilight zone, the sunken ruins and the dome city (v179).
'use strict';

// Many obstacles had only one look in these three regions (design/regions.md, rule 3.3: one or two per region). Each look
// here keeps its mechanic's movement and hit shape; the shared shape helpers below draw the outline, the look only adds
// what makes it that thing. Twilight: wrecks and darker animals. Ruins: pale stone, gold, glowing carved symbols. Dome
// city: glass, brass, warm windows. Returns true when it drew the obstacle (called by drawOceanLook).
const MORE_LOOKS = new Set(['helmetjelly', 'wreckboom', 'wire', 'powderkeg', 'mackerel', 'boxfish', 'wreckbow', 'lifering', 'grapple',
  'hermitcrab', 'airleak',
  'carvedbeam', 'goldgate', 'idol', 'tablet', 'serpent', 'stonetail', 'urnspout', 'crystal', 'sealedjar', 'templevent', 'conch',
  'scrolls', 'flask', 'beam', 'goldchain', 'bronzestaff', 'bronzeblades',
  'girder', 'gauge', 'bulb', 'bulkhead', 'piston', 'robotarm', 'steamspout', 'gear', 'tesla', 'boiler', 'airvent', 'bubblecars',
  'divebot', 'clocktower', 'minisub', 'pipeline', 'gearblades']);
const BRASS = '#c8a050', STONE = '#d8d0c0', GOLD = '#e8c050';
const disc = (x, y, r, c, w = 1.2) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); if (w) inkStroke(w); };
const rrect = (x, y, w, h, r, c, lw = 1.2) => { ctx.fillStyle = c; ctx.beginPath(); roundRectPath(x, y, w, h, r); ctx.fill(); if (lw) inkStroke(lw); };
const glow = (x, y, r, c) => { ctx.fillStyle = hexA(c, 0.35); ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill(); disc(x, y, r, c, 0); };

// ---------- shape helpers, one per mechanic (the same outlines as the looks they sit beside) ----------
function moreLedge(o, sy, paint, thick = 22, round = 9) {        // Gap Wall: two barriers leaving the gap
  const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
  for (const [x0, x1, inner, dir] of [[-10, l, l, -1], [r, W + 10, r, 1]]) {
    if (x1 - x0 < 1) continue;
    ctx.save(); ctx.beginPath(); roundRectPath(x0, sy - thick / 2, x1 - x0, thick, round);
    ctx.fillStyle = o.seaCol; ctx.fill(); ctx.save(); ctx.clip(); paint(x0, x1, inner, dir); ctx.restore();
    ctx.beginPath(); roundRectPath(x0, sy - thick / 2, x1 - x0, thick, round); inkStroke(1.4); ctx.restore();
  }
}
function moreJaws(o, sy, paint) {                                  // Closing Jaws: two blocks, 28 thick
  const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
  for (const [x0, x1, inner, dir] of [[-10, l, l, -1], [r, W + 10, r, 1]]) {
    if (x1 - x0 < 1) continue;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fillStyle = o.seaCol; ctx.fill();
    ctx.save(); ctx.clip(); paint(x0, x1, inner, dir); ctx.restore();
    ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); inkStroke(1.5); ctx.restore();
  }
}
function moreHazard(o, sy, paint) {                                // Static Hazards: inside the hit circle
  const R = o.r * 0.88;
  blit(ownSprite(o, 'sprM', R * 2 + 12, R * 2 + 12, R + 6, R + 6, () => paint(R, o.seaCol)), o.x, sy);
}
function moreBulge(o, sy, paint) {                                 // Wall Bulge: a half-disc on one wall
  const R = o.r + 6, i = -o.side;
  blit(ownSprite(o, 'sprMB', R * 2, R * 2, R, R, () => {
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = o.seaCol; ctx.fill();
    ctx.save(); ctx.clip(); paint(o.r, i); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); inkStroke(1.8);
  }), o.side < 0 ? 0 : W, sy);
}
function moreSlider(o, sy, paint, faces) {                         // Bouncing Slider: a bar 13 thick
  const L = o.len / 2;
  blit(ownSprite(o, 'sprMS', o.len + 12, 28, L + 6, 14, () => paint(L, o.seaCol)), o.x, sy, o.a, faces && o.vx < 0 ? -1 : 1, 1);
}
function moreRiser(o, sy, paint) {                                 // Rising Projectile: a 16-unit circle, scaled to o.r
  const s = o.r / 16;
  blit(sharedSprite('mrise' + o.look + o.seaCol, 44, 44, 22, 22, () => paint(o.seaCol)), o.x, sy, o.rot * 0.2, s, s);
}
function moreSwarm(o, sy, paint) {                                 // Drifting Swarm: in a 42-unit square
  blit(sharedSprite('mswarm' + o.look + o.seaCol, 48, 48, 24, 24, () => paint(o.seaCol)), o.x, sy, o.rot * 0.5);
}
function moreConveyor(o, sy, paint) {                              // Conveyor: pieces 34 x 12, facing the way they go
  const dir = o.v > 0 ? 1 : -1;
  const piece = sharedSprite('mconv' + o.look + o.seaCol + dir, 40, 18, 20, 9, () => { ctx.scale(dir, 1); paint(o.seaCol); });
  for (const x of clipXs(o)) blit(piece, x, sy);
}
function moreDrifter(o, sy, paint) {                               // Spinning Drifter: in a 20-unit circle
  blit(sharedSprite('mdrift' + o.look + o.seaCol, 48, 48, 24, 24, () => paint(o.seaCol)), o.x, sy, o.rot);
}
function moreBlades(o, sy, blade, body) {                          // Spinning Blades: two blades on a pivot, a body over it
  const b = sharedSprite('mblade' + o.look + o.seaCol, 106, 30, 34, 15, () => blade(o.seaCol));
  for (const s of [-1, 1]) blit(b, o.x, sy, o.rot + s * o.open / 2);
  blit(sharedSprite('mbody' + o.look + o.seaCol, 70, 70, 35, 35, () => body(o.seaCol)), o.x, sy, o.rot);
}
function moreArm(o, sy, paint, hub) {                              // Sweeping Arm: an arm of length L round a bolt
  ctx.save(); ctx.translate(o.x, sy); ctx.rotate(o.ang); paint(o.L, o.hh || 7, o.seaCol); ctx.restore();
  hub(o.x, sy, o.seaCol);
}
function morePiston(o, sy, base, rod) {                            // Wall Piston: a base on the wall, a rod shooting out
  const h = CUTTER_HANDLE, e = o.ext;
  ctx.save(); toolFrame(o, sy); base(h, o.seaCol); if (e > 1) rod(h, h + e, o.seaCol); ctx.restore();
}
function moreTurret(o, sy, head, shot, muzzle = 78) {              // Wall Turret: a head on the wall firing shots across
  const dir = inward(o);
  for (const b of o.blobs) shot(b.x, sy, b.r, dir);
  blit(sharedSprite('mturret' + o.look + dir + o.seaCol, 176, 52, 88, 26, () => { ctx.scale(dir, 1); head(o.seaCol); }), wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) disc(wallX(o) + dir * muzzle, sy, 3.2, Math.floor(o.timer * 20) % 2 ? '#ffffff' : '#ffd070', 0);
}
function moreBeam(o, sy, body, c) {                                // Charged Beam: a dashed preview, then a bolt across
  const x0 = ZAP_BODY, L = o.len;
  ctx.save(); toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save(); ctx.strokeStyle = `rgba(${c},${0.25 + 0.6 * Math.min(1, o.t / 0.7)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke(); ctx.restore();
  } else if (o.phase === 'zap') {
    const pts = []; for (let x = x0; x < x0 + L; x += 12) pts.push([x, x === x0 ? 0 : rand(-6, 6)]); pts.push([x0 + L, 0]);
    const bolt = () => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    bolt(); ctx.strokeStyle = `rgba(${c},.35)`; ctx.lineWidth = 9; ctx.stroke();
    bolt(); ctx.strokeStyle = `rgb(${c})`; ctx.lineWidth = 3.5; ctx.stroke();
    bolt(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  body(x0, o.phase === 'charge' || o.phase === 'zap', o.seaCol);
  ctx.restore();
}
function moreSweep(o, sy, base, arm) {                             // Telegraphed Sweep: a warning wedge, then an arm swings
  ctx.save(); toolFrame(o, sy); base(o.seaCol);
  if (o.phase === 'warn') {
    ctx.save(); ctx.strokeStyle = `rgba(255,200,140,${0.3 + 0.55 * Math.min(1, o.t / o.warn)})`; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke(); ctx.restore();
  }
  if (o.ext > 0) { ctx.rotate(o.ang); arm(o.L * o.ext, o.seaCol); }
  ctx.restore();
}
function moreBlast(o, sy, body) {                                  // Proximity Blast: blink and a blast circle, then a boom
  if (o.phase === 'boom' || (o.phase === 'gone' && o.t < BOOM_END - 0.35)) { drawBoom(o, sy, o.phase === 'boom' ? o.t : 0.35 + o.t); return; }
  if (o.phase === 'gone') return;
  const blink = o.phase === 'blink';
  if (blink) {
    ctx.save(); ctx.strokeStyle = `rgba(230,60,50,${0.35 + 0.5 * Math.min(1, o.t / 0.6)})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  blit(sharedSprite('mblast' + o.look + o.seaCol, 40, 40, 20, 20, () => body(o.seaCol)), o.x, sy, Math.sin(o.t * 1.2) * 0.08);
  const on = blink ? Math.floor(o.t * 12) % 2 === 0 : Math.floor(o.t * 1.5) % 2 === 0;
  disc(o.x, sy - 15, 2.4, on ? '#ff4a3a' : '#7a2a24', 0);
}
function moreZone(o, sy, base) {                                   // Effect Zone: the bubble column, from a source below
  drawBubbleColumn(o, sy);
  base(o.x, sy + o.h / 2, o.seaCol);
}
function moreSpring(o, sy, line, end) {                            // Spring Line: a line that bounces, two ends that hurt
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9), bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + 4;
  ctx.save(); ctx.lineCap = 'round';
  line(() => { ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); }, o.seaCol);
  ctx.restore();
  const e = sharedSprite('mend' + o.look + o.seaCol, 26, 26, 13, 13, () => end(o.seaCol));
  blit(e, o.x1, sy + dy1); blit(e, o.x2, sy + dy2);
}

// ---------- the looks ----------
const MORE_DRAW = {
  // twilight zone
  helmetjelly: (o, sy) => moreSwarm(o, sy, c => {          // a deep red crown jellyfish with a pale rim and trailing arms
    ctx.strokeStyle = hexA(c, 0.8); ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
    for (const x of [-9, -4, 1, 6, 10]) { ctx.moveTo(x, 4); ctx.quadraticCurveTo(x + 3, 12, x - 1, 20); } ctx.stroke();
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-14, 5); ctx.lineTo(-11, -12); ctx.lineTo(-5, -6); ctx.lineTo(0, -16); ctx.lineTo(5, -6); ctx.lineTo(11, -12); ctx.lineTo(14, 5); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#ffd8c8'; ctx.fillRect(-13, 1, 26, 3);
  }),
  wreckboom: (o, sy) => moreSweep(o, sy, () => { rrect(-6, -14, 14, 28, 3, '#6f5236'); }, (len, c) => {   // a broken spar swinging out on its rope
    rrect(-4, -6, len, 12, 5, c, 1.3);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 20; x < len - 10; x += 26) { ctx.moveTo(x, -5); ctx.lineTo(x + 8, 5); } ctx.stroke();
    ctx.strokeStyle = '#c8b080'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(len - 20, -6); ctx.quadraticCurveTo(len - 6, -16, len - 2, -4); ctx.stroke();
    disc(len - 4, 0, 9, c, 1.3); disc(len - 4, 0, 3, '#5a5f68', 0);
  }),
  wire: (o, sy) => moreBeam(o, sy, (x0, on, c) => {        // a frayed copper cable from the wreck, sparking
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(x0 * 0.5, 10, x0 - 6, 0); ctx.stroke();
    ctx.strokeStyle = c; ctx.lineWidth = 3.6; ctx.stroke();
    ctx.strokeStyle = '#e8a060'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const a of [-0.6, 0, 0.6]) { ctx.moveTo(x0 - 6, 0); ctx.lineTo(x0 - 6 + Math.cos(a) * 7, Math.sin(a) * 7); } ctx.stroke();
    if (on) glow(x0 - 2, 0, 2.6, '#bfe6ff');
  }, '191,230,255'),
  powderkeg: (o, sy) => moreBlast(o, sy, c => {            // a ship's powder keg, a fuse fizzing on top
    rrect(-11, -12, 22, 25, 6, c, 1.4);
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(-11, -6, 22, 2.4); ctx.fillRect(-11, 5, 22, 2.4);
    ctx.fillStyle = COL.ink; ctx.font = '700 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('XX', 0, 3);
    ctx.strokeStyle = '#a89870'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(4, -16, 2, -18); ctx.stroke();
  }),
  mackerel: (o, sy) => moreConveyor(o, sy, c => {          // a school of mackerel: blue backs with dark bars
    ctx.fillStyle = '#d8e0e8'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-16.5, -5.5); ctx.lineTo(-15, 0); ctx.lineTo(-16.5, 5.5); ctx.closePath(); ctx.fill(); inkStroke(1);
    ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(0, -6.5, 16.5, 0); ctx.quadraticCurveTo(0, 6.5, -11, 0); ctx.closePath(); ctx.fill(); inkStroke(1.1);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(0, -6.5, 16.5, 0); ctx.quadraticCurveTo(0, -1.5, -11, 0); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 0.9; ctx.beginPath(); for (const x of [-6, -2, 2, 6]) { ctx.moveTo(x, -4); ctx.lineTo(x + 1.5, -1); } ctx.stroke();
    seaEye(11, -1, 2);
  }),
  boxfish: (o, sy) => moreRiser(o, sy, c => {              // a yellow boxfish with dark spots, rising nose first
    rrect(-11, -9, 22, 18, 6, c, 1.4);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-17, -5); ctx.lineTo(-17, 5); ctx.closePath(); ctx.fill(); inkStroke(1);
    ctx.fillStyle = '#2a2a30'; for (const [x, y] of [[-5, -4], [1, -5], [-3, 3], [3, 2], [-7, 1]]) disc(x, y, 1.3, '#2a2a30', 0);
    seaEye(6, -2, 2.6); disc(10.5, 2.5, 1.4, '#e07a6a', 0.8);
  }),
  wreckbow: (o, sy) => moreBulge(o, sy, (r, i) => {         // the bow of a sunken ship, planks and a porthole
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let y = -r; y < r; y += 11) { ctx.moveTo(-r, y); ctx.quadraticCurveTo(0, y + 5, r, y); } ctx.stroke();
    disc(i * r * 0.5, -r * 0.2, 8, BRASS, 1.2); disc(i * r * 0.5, -r * 0.2, 5, '#1e3a4a', 0);
    ctx.fillStyle = '#e8e2d0'; for (const [a, d] of [[0.3, 0.8], [0.9, 0.7], [-0.7, 0.85]]) disc(i * Math.cos(a) * r * d, Math.sin(a) * r * d, 2.6, '#e8e2d0', 0);
    ctx.fillStyle = '#4f8a4a'; ctx.beginPath(); ctx.ellipse(i * r * 0.2, r * 0.55, 10, 3, 0.4, 0, Math.PI * 2); ctx.fill();
  }),
  lifering: (o, sy) => moreSpring(o, sy, (path) => {        // a rope between two life rings
    path(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.stroke(); path(); ctx.strokeStyle = '#d8c090'; ctx.lineWidth = 2.4; ctx.stroke();
  }, c => {
    disc(0, 0, 9, '#ffffff', 1.3); ctx.fillStyle = c; for (let q = 0; q < 4; q++) { ctx.beginPath(); ctx.arc(0, 0, 9, q * Math.PI / 2, q * Math.PI / 2 + Math.PI / 4); ctx.arc(0, 0, 4.5, q * Math.PI / 2 + Math.PI / 4, q * Math.PI / 2, true); ctx.fill(); }
    disc(0, 0, 4.5, '#1e3a4a', 1);
  }),
  grapple: (o, sy) => moreArm(o, sy, (L, hh, c) => {        // a rope ending in a four-pronged grappling hook
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 4.4; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(L - 16, 0); ctx.stroke();
    ctx.strokeStyle = '#c8b080'; ctx.lineWidth = 2.6; ctx.stroke();
    rrect(L - 18, -2, 14, 4, 1.5, c, 1);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 3.4; ctx.beginPath(); for (const s of [-1, 1]) { ctx.moveTo(L - 6, 0); ctx.quadraticCurveTo(L - 2, s * 7, L - 8, s * 9); } ctx.stroke();
    ctx.strokeStyle = c; ctx.lineWidth = 1.8; ctx.stroke();
  }, (x, y) => { disc(x, y, 8, '#6a6460', 1.4); disc(x, y, 3.4, '#8a8a92', 0); }),
  hermitcrab: (o, sy) => moreBlades(o, sy, c => {           // a hermit crab in a whorled shell, spinning with two claws
    rrect(0, -3.5, 36, 7, 3.5, c, 1.1); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(46, 0, 12, 4.6, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.2);
    ctx.beginPath(); ctx.moveTo(56, -2.5); ctx.quadraticCurveTo(64, -3, 65, 0); ctx.lineTo(57, 0.6); ctx.closePath(); ctx.fill(); inkStroke(1);
  }, c => {
    disc(-6, 0, 22, '#e8d0a8', 1.5);
    ctx.strokeStyle = 'rgba(120,80,40,.6)'; ctx.lineWidth = 2; ctx.beginPath(); for (let t = 0; t < Math.PI * 4; t += 0.2) { const r = 3 + t * 1.4; (t ? ctx.lineTo : ctx.moveTo).call(ctx, -6 + Math.cos(t) * r, Math.sin(t) * r); } ctx.stroke();
    disc(14, 0, 8, c, 1.2); seaEye(18, -4, 2.2); seaEye(18, 4, 2.2);
  }),
  airleak: (o, sy) => moreZone(o, sy, (x, y) => {           // air leaking from a wreck's pipe
    rrect(x - 9, y - 6, 18, 12, 2, '#6a6a72', 1.3); rrect(x - 12, y - 9, 24, 5, 2, '#7a5a3a', 1.1);
  }),
  // sunken ruins
  carvedbeam: (o, sy) => moreLedge(o, sy, (x0, x1, inner, dir) => {   // a carved lintel with glowing symbols
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x0, sy + 5, x1 - x0, 6);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = inner + dir * 8; dir > 0 ? x < x1 : x > x0; x += dir * 12) { ctx.moveTo(x, sy - 8); ctx.lineTo(x, sy - 4); ctx.lineTo(x + dir * 6, sy - 4); } ctx.stroke();
    for (let x = inner + dir * 24, k = 0; dir > 0 ? x < x1 : x > x0; x += dir * 48, k++) glow(x, sy + 2, 2.2, '#7fffd0');
  }),
  goldgate: (o, sy) => moreJaws(o, sy, (x0, x1, inner, dir) => {     // a gilded portcullis half: bars and gold studs
    ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let x = inner + dir * 6; dir > 0 ? x < x1 : x > x0; x += dir * 12) ctx.fillRect(x - 1.5, sy - 14, 3, 28);
    ctx.fillStyle = GOLD; ctx.fillRect(x0, sy - 3, x1 - x0, 6);
    for (let x = inner + dir * 6; dir > 0 ? x < x1 : x > x0; x += dir * 12) disc(x, sy, 2, '#fff2b0', 0);
  }),
  idol: (o, sy) => moreHazard(o, sy, (R, c) => {            // a small stone idol head with glowing eyes
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-R * 0.7, R * 0.85); ctx.lineTo(-R * 0.75, -R * 0.4); ctx.quadraticCurveTo(0, -R * 1.05, R * 0.75, -R * 0.4); ctx.lineTo(R * 0.7, R * 0.85); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-R * 0.7, -R * 0.15, R * 1.4, R * 0.12);
    glow(-R * 0.3, -R * 0.35, R * 0.1, '#7fffd0'); glow(R * 0.3, -R * 0.35, R * 0.1, '#7fffd0');
    ctx.beginPath(); ctx.moveTo(-R * 0.3, R * 0.4); ctx.lineTo(R * 0.3, R * 0.4); inkStroke(1.4);
  }),
  tablet: (o, sy) => moreSwarm(o, sy, c => {               // a drifting stone tablet, its carved symbol glowing
    rrect(-13, -17, 26, 34, 6, c, 1.4);
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; ctx.strokeRect(-9, -13, 18, 26);
    ctx.strokeStyle = '#7fffd0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -2, 5, 0, Math.PI * 2); ctx.moveTo(0, 3); ctx.lineTo(0, 10); ctx.moveTo(-4, 7); ctx.lineTo(4, 7); ctx.stroke();
  }),
  serpent: (o, sy) => morePiston(o, sy, h => {              // a stone sea-serpent lunging from a carved doorway
    rrect(-8, -18, h + 6, 36, 4, STONE, 1.3); ctx.fillStyle = '#2a3038'; ctx.beginPath(); ctx.arc(h - 6, 0, 10, 0, Math.PI * 2); ctx.fill();
  }, (h, tip, c) => {
    const wy = x => Math.sin(x * 0.1) * 3;
    ctx.beginPath(); for (let x = h - 6; x <= tip - 8; x += 5) (x === h - 6 ? ctx.moveTo(x, wy(x)) : ctx.lineTo(x, wy(x)));
    ctx.lineCap = 'round'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = c; ctx.lineWidth = 9; ctx.stroke();
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(tip - 12, -8); ctx.lineTo(tip + 2, -2); ctx.lineTo(tip + 2, 3); ctx.lineTo(tip - 12, 8); ctx.closePath(); ctx.fill(); inkStroke(1.2);
    glow(tip - 6, -3, 1.6, '#7fffd0');
  }),
  stonetail: (o, sy) => moreSweep(o, sy, () => { rrect(-6, -16, 12, 32, 3, '#a89c88'); }, (len, c) => {   // a stone serpent's tail sweeping
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-6, -11);
    for (let x = 0; x <= len - 10; x += 6) ctx.lineTo(x, -11 + x / len * 6 + Math.sin(x * 0.08) * 2);
    ctx.lineTo(len, 0);
    for (let x = len - 10; x >= 0; x -= 6) ctx.lineTo(x, 11 - x / len * 6 + Math.sin(x * 0.08) * 2);
    ctx.lineTo(-6, 11); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 14; x < len - 14; x += 14) { ctx.moveTo(x, -8); ctx.quadraticCurveTo(x + 4, 0, x, 8); } ctx.stroke();
  }),
  urnspout: (o, sy) => moreTurret(o, sy, c => {             // a tipped stone urn on a plinth, pouring water blobs
    rrect(-6, -10, 18, 20, 3, STONE, 1.2);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(10, -12); ctx.quadraticCurveTo(40, -20, 66, -6); ctx.lineTo(78, -5); ctx.lineTo(78, 5); ctx.lineTo(66, 6); ctx.quadraticCurveTo(40, 20, 10, 12); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    ctx.fillStyle = GOLD; ctx.fillRect(30, -15, 4, 30); ctx.fillRect(50, -11, 4, 22);
  }, (x, y, r) => { disc(x, y, r * 0.9, 'rgba(200,240,255,.6)', 0); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, Math.PI * 2); ctx.stroke(); }),
  crystal: (o, sy) => moreBeam(o, sy, (x0, on, c) => {      // a crystal set in a stone socket, flashing
    rrect(-6, -12, 30, 24, 4, STONE, 1.3);
    ctx.fillStyle = on ? '#d8fff0' : c; ctx.beginPath(); ctx.moveTo(22, -9); ctx.lineTo(x0 - 4, 0); ctx.lineTo(22, 9); ctx.lineTo(30, 0); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    if (on) glow(x0 - 6, 0, 3, '#9fffe0');
  }, '160,255,220'),
  sealedjar: (o, sy) => moreBlast(o, sy, c => {            // a wax-sealed clay jar that bursts
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(6, -12); ctx.quadraticCurveTo(15, -4, 11, 10); ctx.lineTo(-11, 10); ctx.quadraticCurveTo(-15, -4, -6, -12); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    rrect(-7, -15, 14, 5, 2, '#b03a3a', 1);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
  }),
  templevent: (o, sy) => moreZone(o, sy, (x, y) => {       // bubbles from a carved stone grate
    rrect(x - 16, y - 7, 32, 12, 3, STONE, 1.3);
    ctx.fillStyle = '#2a3038'; for (const dx of [-9, -3, 3, 9]) ctx.fillRect(x + dx - 1.5, y - 4, 3, 6);
  }),
  conch: (o, sy) => { drawFan(o, sy); const s = sharedSprite('mconch', 70, 70, 35, 35, () => {   // a giant stone conch blowing the current
    ctx.fillStyle = '#e8d8c0'; ctx.beginPath(); ctx.moveTo(-30, -6); ctx.quadraticCurveTo(-10, -26, 22, -10); ctx.lineTo(30, -16); ctx.lineTo(30, 16); ctx.lineTo(22, 10); ctx.quadraticCurveTo(-10, 26, -30, 6); ctx.closePath(); ctx.fill(); inkStroke(1.5);
    ctx.fillStyle = '#f0a8a0'; ctx.beginPath(); ctx.ellipse(27, 0, 4, 12, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1);
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const x of [-18, -6, 6]) { ctx.moveTo(x, -14); ctx.quadraticCurveTo(x + 5, 0, x, 14); } ctx.stroke();
  }); blit(s, o.side < 0 ? 4 : W - 4, sy, 0, o.side < 0 ? 1 : -1, 1); },
  scrolls: (o, sy) => moreConveyor(o, sy, () => {          // rolled scrolls tied with gold
    rrect(-14, -5, 28, 10, 5, '#f0e4c8', 1.1); disc(-14, 0, 5, '#d8c8a0', 1); disc(14, 0, 5, '#d8c8a0', 1);
    ctx.fillStyle = GOLD; ctx.fillRect(-2, -5, 4, 10);
  }),
  flask: (o, sy) => moreRiser(o, sy, c => {                // a stoppered clay flask rising on a trail of bubbles
    ctx.fillStyle = 'rgba(235,250,255,.7)'; for (const [y, r] of [[15, 2.2], [19, 1.6]]) disc(0, y, r, 'rgba(235,250,255,.7)', 0);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-4, -12); ctx.lineTo(4, -12); ctx.lineTo(4, -6); ctx.quadraticCurveTo(13, -2, 10, 8); ctx.quadraticCurveTo(0, 13, -10, 8); ctx.quadraticCurveTo(-13, -2, -4, -6); ctx.closePath(); ctx.fill(); inkStroke(1.4);
    rrect(-3, -16, 6, 5, 1.5, '#a8743e', 1); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(9, 2); ctx.stroke();
  }),
  beam: (o, sy) => moreSlider(o, sy, (L, c) => {           // a carved stone beam with a wave pattern
    rrect(-L, -6, L * 2, 12, 3, c, 1.4);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = -L + 6; x < L - 8; x += 10) { ctx.moveTo(x, 2); ctx.quadraticCurveTo(x + 2.5, -4, x + 5, 2); ctx.quadraticCurveTo(x + 7.5, 6, x + 10, 2); } ctx.stroke();
    ctx.fillStyle = GOLD; ctx.fillRect(-L, -6, 4, 12); ctx.fillRect(L - 4, -6, 4, 12);
  }),
  goldchain: (o, sy) => moreSpring(o, sy, path => {        // a gold chain between two stone rings
    path(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4.4; ctx.stroke(); path(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.6; ctx.setLineDash([4, 2]); ctx.stroke(); ctx.setLineDash([]);
  }, () => { disc(0, 0, 9, STONE, 1.3); disc(0, 0, 4, '#2a3038', 1); }),
  bronzestaff: (o, sy) => moreArm(o, sy, (L, hh, c) => {    // a priest's bronze staff with a glowing orb, swinging
    rrect(4, -2.8, L - 14, 5.6, 2.5, c, 1.1);
    disc(L - 8, 0, hh - 0.5, GOLD, 1.3); glow(L - 8, 0, 2.6, '#7fffd0');
  }, (x, y) => { disc(x, y, 8, STONE, 1.4); disc(x, y, 3.4, GOLD, 0); }),
  bronzeblades: (o, sy) => moreBlades(o, sy, c => {        // two bronze blades crossed on a stone hub
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(56, -4.5); ctx.lineTo(66, 0); ctx.lineTo(56, 4.5); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill(); inkStroke(1.2);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8, -1); ctx.lineTo(58, -1.5); ctx.stroke();
  }, () => { disc(0, 0, 20, STONE, 1.5); glow(0, 0, 4, '#7fffd0'); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke(); }),
  // dome city
  girder: (o, sy) => moreLedge(o, sy, (x0, x1, inner, dir) => {   // a brass girder with rivets and warm lights
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let x = x0 - 22; x < x1; x += 22) { ctx.moveTo(x, sy - 9); ctx.lineTo(x + 11, sy + 9); ctx.lineTo(x + 22, sy - 9); } ctx.stroke();
    for (let x = inner + dir * 16; dir > 0 ? x < x1 : x > x0; x += dir * 44) glow(x, sy, 2, '#ffd07a');
  }, 22, 3),
  gauge: (o, sy) => moreHazard(o, sy, (R, c) => {           // a brass pressure gauge with a twitching needle
    disc(0, 0, R * 0.95, c, 1.5); disc(0, 0, R * 0.72, '#fbf6ee', 1);
    ctx.strokeStyle = '#d8342a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 0.5, -R * 0.35); ctx.stroke();
    ctx.fillStyle = COL.ink; for (let k = 0; k < 7; k++) { const a = Math.PI * (0.8 + k * 0.233); ctx.fillRect(Math.cos(a) * R * 0.58 - 0.8, Math.sin(a) * R * 0.58 - 0.8, 1.6, 1.6); }
    disc(0, 0, R * 0.1, COL.ink, 0);
  }),
  bulb: (o, sy) => moreSwarm(o, sy, c => {                  // a floating light bulb with a warm filament
    ctx.fillStyle = hexA(c, 0.3); ctx.beginPath(); ctx.arc(0, -4, 19, 0, Math.PI * 2); ctx.fill();
    disc(0, -4, 13, 'rgba(255,250,220,.85)', 1.4);
    ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-4, 4); ctx.lineTo(-3, -6); ctx.lineTo(0, -2); ctx.lineTo(3, -6); ctx.lineTo(4, 4); ctx.stroke();
    rrect(-6, 8, 12, 9, 2, BRASS, 1.2); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-6, 11, 12, 1.5);
  }),
  bulkhead: (o, sy) => moreJaws(o, sy, (x0, x1, inner, dir) => {  // airlock doors with a hand wheel and hazard stripes
    ctx.fillStyle = '#f4c430'; ctx.fillRect(dir > 0 ? inner : inner - 8, sy - 14, 8, 28);
    ctx.fillStyle = COL.ink; for (let y = sy - 14; y < sy + 14; y += 7) { ctx.beginPath(); ctx.moveTo(dir > 0 ? inner : inner - 8, y); ctx.lineTo(dir > 0 ? inner + 8 : inner, y + 3.5); ctx.lineTo(dir > 0 ? inner + 8 : inner, y + 7); ctx.lineTo(dir > 0 ? inner : inner - 8, y + 3.5); ctx.fill(); }
    const wx = inner + dir * 28; ctx.strokeStyle = BRASS; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(wx, sy, 8, 0, Math.PI * 2); ctx.moveTo(wx - 8, sy); ctx.lineTo(wx + 8, sy); ctx.moveTo(wx, sy - 8); ctx.lineTo(wx, sy + 8); ctx.stroke();
  }),
  piston: (o, sy) => morePiston(o, sy, h => {              // a brass steam piston: a cylinder on the wall, a rod and a head
    rrect(-8, -14, h, 28, 5, '#8aa0b8', 1.3); ctx.fillStyle = BRASS; for (const x of [10, 30, 50]) ctx.fillRect(x, -14, 4, 28);
  }, (h, tip, c) => {
    rrect(h - 10, -3.5, tip - h, 7, 2, '#c9ced6', 1.1); rrect(tip - 12, -9, 12, 18, 3, c, 1.3);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(h - 4, -10, 4, 0, Math.PI * 2); ctx.fill();
  }),
  robotarm: (o, sy) => moreSweep(o, sy, () => { rrect(-6, -16, 14, 32, 4, '#8aa0b8'); }, (len, c) => {   // a jointed brass arm with a pincer
    const j = len * 0.5;
    rrect(-4, -7, j + 4, 14, 6, c, 1.3); rrect(j - 4, -5.5, len - j - 8, 11, 5, c, 1.3); disc(j, 0, 8, '#8aa0b8', 1.2);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 3.6; ctx.lineCap = 'round'; ctx.beginPath(); for (const s of [-1, 1]) { ctx.moveTo(len - 10, s * 3); ctx.quadraticCurveTo(len, s * 10, len + 2, s * 2); } ctx.stroke();
    ctx.strokeStyle = BRASS; ctx.lineWidth = 2; ctx.stroke();
  }),
  steamspout: (o, sy) => moreTurret(o, sy, c => {         // a brass pipe on the wall puffing balls of steam
    rrect(-6, -12, 20, 24, 4, '#8aa0b8', 1.3);
    rrect(10, -5, 64, 10, 3, c, 1.3); rrect(66, -8, 12, 16, 3, c, 1.3);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; for (const x of [28, 48]) ctx.fillRect(x, -5, 3, 10);
    disc(36, -10, 5, '#fbf6ee', 1.1); ctx.strokeStyle = '#d8342a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(36, -10); ctx.lineTo(39, -12); ctx.stroke();
  }, (x, y, r) => { ctx.fillStyle = 'rgba(240,248,255,.8)'; for (const [dx, dy, k] of [[0, 0, 1], [-r * 0.6, -r * 0.4, 0.7], [r * 0.5, r * 0.4, 0.6]]) disc(x + dx, y + dy, r * k * 0.8, 'rgba(240,248,255,.8)', 0); }),
  gear: (o, sy) => moreDrifter(o, sy, c => {               // a spinning brass gear
    ctx.fillStyle = c; ctx.beginPath();
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, r = k % 2 ? 15 : 19; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); inkStroke(1.3);
    disc(0, 0, 9, '#8a6a30', 1.1); disc(0, 0, 3.5, '#1a2028', 0);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(-5, -6, 3, 0, Math.PI * 2); ctx.fill();
  }),
  tesla: (o, sy) => moreBeam(o, sy, (x0, on, c) => {       // a coil on the wall arcing to a brass ball
    rrect(-6, -10, 20, 20, 3, '#8aa0b8', 1.2);
    ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 16; x < x0 - 12; x += 5) { ctx.moveTo(x, -7); ctx.lineTo(x + 2.5, 7); } ctx.stroke();
    disc(x0 - 6, 0, 7, BRASS, 1.3); if (on) glow(x0 - 6, 0, 3, '#d8c8ff');
  }, '200,190,255'),
  boiler: (o, sy) => moreBlast(o, sy, c => {               // a round riveted boiler with a gauge, about to burst
    disc(0, 1, 13, c, 1.4); ctx.fillStyle = '#5a5a60'; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; disc(Math.cos(a) * 10, 1 + Math.sin(a) * 10, 1, '#5a5a60', 0); }
    disc(0, 1, 5, '#fbf6ee', 1); ctx.strokeStyle = '#d8342a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(3, -2); ctx.stroke();
  }),
  airvent: (o, sy) => moreZone(o, sy, (x, y) => {          // bubbles from a brass dome vent
    ctx.fillStyle = BRASS; ctx.beginPath(); ctx.arc(x, y + 4, 15, Math.PI, 0); ctx.closePath(); ctx.fill(); inkStroke(1.3);
    ctx.fillStyle = '#2a3038'; for (const dx of [-7, 0, 7]) ctx.fillRect(x + dx - 1.5, y - 6, 3, 8);
  }),
  bubblecars: (o, sy) => moreConveyor(o, sy, c => {        // little glass bubble cars on a brass rail
    ctx.fillStyle = '#5a5a60'; ctx.fillRect(-17, 6, 34, 2);
    disc(0, -1, 8.5, 'rgba(200,240,255,.75)', 1.3); rrect(-9, 3, 18, 4, 2, c, 1);
    disc(0, -1, 2.4, '#ffd07a', 0);
  }),
  divebot: (o, sy) => moreRiser(o, sy, c => {              // a little brass diving robot with a lamp, rising
    rrect(-9, -10, 18, 20, 7, c, 1.4); disc(0, -2, 5, '#9fe0ff', 1.1);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(-14, 7); ctx.moveTo(9, 2); ctx.lineTo(14, 7); ctx.stroke();
    glow(0, -13, 1.8, '#ffd07a');
  }),
  clocktower: (o, sy) => moreBulge(o, sy, (r, i) => {      // half of a great brass clock face with lit numerals
    disc(0, 0, r * 0.8, '#fbf6ee', 1.4);
    ctx.fillStyle = COL.ink; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ctx.fillRect(Math.cos(a) * r * 0.68 - 2, Math.sin(a) * r * 0.68 - 2, 4, 4); }
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(i * r * 0.45, -r * 0.2); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.6); ctx.stroke();
    disc(0, 0, 4, BRASS, 1);
  }),
  minisub: (o, sy) => moreSlider(o, sy, (L, c) => {        // a little brass submarine with a row of lit portholes
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, L - 4, 6.5, 0, 0, Math.PI * 2); ctx.fill(); inkStroke(1.4);
    rrect(-8, -11, 14, 6, 2, c, 1.1);
    for (let x = -L * 0.6; x < L * 0.6; x += 14) disc(x, 0, 2.2, '#ffd070', 0.8);
    ctx.fillStyle = '#8a6a30'; ctx.beginPath(); ctx.moveTo(-L + 4, 0); ctx.lineTo(-L - 2, -5); ctx.lineTo(-L - 2, 5); ctx.closePath(); ctx.fill(); inkStroke(1);
  }, true),
  pipeline: (o, sy) => moreSpring(o, sy, path => {        // a rubber air hose between two brass couplings
    path(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.stroke(); path(); ctx.strokeStyle = '#3a4a5a'; ctx.lineWidth = 3.2; ctx.stroke();
  }, c => { rrect(-8, -8, 16, 16, 3, c, 1.3); disc(0, 0, 3.5, '#2a3038', 0); }),
  gearblades: (o, sy) => moreBlades(o, sy, c => {        // two brass blades with cog teeth on a gear hub
    rrect(0, -4, 60, 8, 3, c, 1.2);
    ctx.fillStyle = c; for (let x = 10; x < 58; x += 8) { ctx.fillRect(x, -7, 4, 3); ctx.fillRect(x, 4, 4, 3); }
  }, c => { disc(0, 0, 19, '#8aa0b8', 1.5); disc(0, 0, 8, c, 1.2); disc(0, 0, 3, '#1a2028', 0); })
};
function drawMoreLook(o, sy) {
  const draw = MORE_DRAW[o.look];
  if (!draw) return false;
  draw(o, sy);
  return true;
}
