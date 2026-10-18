// Paper Nosedive — Deep sea map background: fish, specks, whales and shipwrecks by depth.
'use strict';

// ---------- deep sea: background fish, more dangerous the deeper you go (they never collide) ----------
const fishes = [];
const PALE = '#9fc3d9';          // outline for deep-water fish so they show against dark water
function fishOutline(col, w = 1.2) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function fishEye(x, y, r = 1.8, pupil = '#141414') {
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r + 1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = pupil; ctx.beginPath(); ctx.arc(x + 0.4, y, r, 0, Math.PI * 2); ctx.fill();
}
function fishTail(x, h, len, col, ol) {   // notched tail fin behind the body, which faces +x
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - len, -h); ctx.lineTo(x - len * 0.7, 0); ctx.lineTo(x - len, h); ctx.closePath();
  ctx.fill(); fishOutline(ol);
}
function sharkBody(k, col, belly, ol, teeth) {
  const P = [[55, 2], [40, -9], [12, -13], [4, -13], [-6, -32], [-14, -12], [-44, -5], [-62, -24], [-54, -2], [-60, 14],
             [-44, 4], [-10, 11], [-4, 24], [6, 11], [40, 9]];
  const path = () => { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x * k, y * k) : ctx.moveTo(x * k, y * k))); ctx.closePath(); };
  ctx.fillStyle = col; path(); ctx.fill();
  ctx.save(); path(); ctx.clip(); ctx.fillStyle = belly; ctx.fillRect(-70 * k, 3 * k, 140 * k, 30 * k); ctx.restore();
  path(); fishOutline(ol, 1.3);
  ctx.beginPath(); for (const gx of [26, 30, 34]) { ctx.moveTo(gx * k, -5 * k); ctx.lineTo((gx - 2) * k, 3 * k); } fishOutline(ol, 0.9);
  if (teeth) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(52 * k, 5 * k); ctx.lineTo(34 * k, 7 * k); ctx.lineTo(34 * k, 9 * k); ctx.lineTo(50 * k, 8 * k); ctx.closePath(); ctx.fill(); fishOutline(ol, 0.9);
  }
  fishEye(41 * k, -3 * k, 1.8 * k, '#0e1218');
}
// w,h: sprite box (world units, centred); each painter draws the fish facing right (+x).
// cols: colour variants; a fish picks one when it spawns and paint(c) receives it
const FISH = {
  clown: { w: 50, h: 28, cols: [{ body: '#f28c28', band: '#ffffff' }, { body: '#8a2a2a', band: '#ffffff' },
                               { body: '#e8742a', band: '#2b2b2b' }, { body: '#f2b33a', band: '#ffffff' }], paint(c) {
    fishTail(-13, 7, 10, c.body, COL.ink);
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = c.band; ctx.fillRect(-8, -10, 4, 20); ctx.fillRect(3, -10, 4, 20); ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2); fishOutline(COL.ink);
    fishEye(9, -2);
  } },
  tang: { w: 52, h: 30, cols: [{ body: '#2f6fd1', tail: '#f2c84b', mark: '#13204a' }, { body: '#f2d43a', tail: '#f2d43a', mark: '#d8a820' },
                              { body: '#7b5bd6', tail: '#f2c84b', mark: '#3a2a80' }], paint(c) {
    fishTail(-14, 8, 11, c.tail, COL.ink);
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink);
    ctx.beginPath(); ctx.moveTo(-8, -7); ctx.quadraticCurveTo(4, -2, -4, 7); fishOutline(c.mark, 2.4);
    fishEye(9, -3);
  } },
  school: { w: 62, h: 42, cols: [{ body: '#c9d6e2' }, { body: '#f2d27a' }, { body: '#9cc8ee' }, { body: '#f4a6a0' }], paint(c) {
    for (const [x, y] of [[-16, -9], [4, -13], [16, 2], [-3, 6], [-20, 12]]) {
      ctx.save(); ctx.translate(x, y);
      fishTail(-5, 3, 5, c.body, COL.ink);
      ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink, 0.9);
      ctx.restore();
    }
  } },
  butterfly: { w: 46, h: 40, cols: [{ body: '#f6d23a', band: '#1f1f1f' }, { body: '#f4efe2', band: '#e07a1f' },
                                    { body: '#f6d23a', band: '#2f6fd1' }, { body: '#f4efe2', band: '#1f1f1f' }], paint(c) {
    fishTail(-13, 6, 8, c.body, COL.ink);
    const body = () => { ctx.beginPath(); ctx.ellipse(0, 0, 14, 13, 0, 0, Math.PI * 2); };
    ctx.fillStyle = c.body; body(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -3); ctx.lineTo(20, -1); ctx.lineTo(12, 3); ctx.closePath(); ctx.fill(); fishOutline(COL.ink, 1);
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = c.band; ctx.fillRect(6, -14, 4, 28); ctx.restore();
    ctx.fillStyle = c.band; ctx.beginPath(); ctx.arc(-6, -5, 2.6, 0, Math.PI * 2); ctx.fill();
    body(); fishOutline(COL.ink);
    fishEye(9, -2, 1.5);
  } },
  seahorse: { w: 34, h: 58, cols: [{ body: '#f2a33a', ridge: '#c4741a' }, { body: '#e8607a', ridge: '#b03a54' },
                                   { body: '#f2d35a', ridge: '#c4a52a' }], paint(c) {
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-2, 10); ctx.quadraticCurveTo(-6, 22, 2, 24); ctx.quadraticCurveTo(8, 25, 6, 18); ctx.quadraticCurveTo(4, 14, 0, 17);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 6.5; ctx.stroke(); ctx.strokeStyle = c.body; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(0, 0, 8, 13, -0.15, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink);
    ctx.beginPath(); ctx.moveTo(-7, -4); ctx.lineTo(-12, -1); ctx.lineTo(-7, 3); ctx.closePath(); ctx.fill(); fishOutline(COL.ink, 1);
    ctx.beginPath(); ctx.ellipse(3, -16, 6, 5, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink);
    ctx.beginPath(); ctx.rect(7, -17, 9, 3.4); ctx.fill(); fishOutline(COL.ink, 1);
    ctx.beginPath(); for (let y = -8; y <= 8; y += 4) { ctx.moveTo(-3, y); ctx.lineTo(4, y + 1); } fishOutline(c.ridge, 1);
    ctx.beginPath(); ctx.moveTo(-1, -21); ctx.lineTo(1, -25); ctx.lineTo(4, -21); fishOutline(COL.ink, 1);
    fishEye(4, -17, 1.4);
  } },
  puffer: { w: 48, h: 44, cols: [{ body: '#e8c46a', spine: '#8a6a14', spot: '#9c7a2a', tail: '#d9b45a' },
                                 { body: '#e6edf2', spine: '#7a8a96', spot: '#5a6a78', tail: '#cfd8df' },
                                 { body: '#c99a6a', spine: '#6a4a2a', spot: '#7a5432', tail: '#b8895a' }], paint(c) {
    fishTail(-12, 5, 8, c.tail, COL.ink);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); }
    fishOutline(c.spine, 1.4);
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink);
    ctx.fillStyle = c.spot;
    for (const [x, y] of [[-5, -6], [2, -8], [-7, 2], [4, 6], [-1, 9]]) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill(); }
    fishEye(6, -3, 2.4);
  } },
  angel: { w: 46, h: 52, cols: [{ body: '#f4d35e', band: '#1f1f1f' }, { body: '#3a7fe0', band: '#f4d35e' },
                                { body: '#f08a3a', band: '#ffffff' }], paint(c) {
    ctx.beginPath(); ctx.moveTo(2, -17); ctx.lineTo(-8, -24); ctx.moveTo(2, 17); ctx.lineTo(-8, 24); fishOutline(COL.ink, 1.6);
    fishTail(-11, 6, 8, c.body, COL.ink);
    const body = () => { ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(2, -17); ctx.lineTo(15, 0); ctx.lineTo(2, 17); ctx.closePath(); };
    ctx.fillStyle = c.body; body(); ctx.fill();
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = c.band; ctx.fillRect(-5, -20, 3, 40); ctx.fillRect(5, -20, 3, 40); ctx.restore();
    body(); fishOutline(COL.ink);
    fishEye(9, -2);
  } },
  jelly: { w: 42, h: 64, cols: [{ bell: 'rgba(240,140,200,.8)', line: '#b0507f', arm: '#d97fb0' },
                                { bell: 'rgba(140,190,250,.8)', line: '#4f7fb0', arm: '#7fb0e0' },
                                { bell: 'rgba(190,150,250,.8)', line: '#7a50b0', arm: '#a77fe0' },
                                { bell: 'rgba(250,180,110,.8)', line: '#b07a3a', arm: '#e0a46a' }], paint(c) {
    ctx.strokeStyle = c.arm; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (const x of [-9, -3, 3, 9]) {
      ctx.beginPath(); ctx.moveTo(x, -8); ctx.quadraticCurveTo(x + 5, 6, x - 2, 14); ctx.quadraticCurveTo(x - 6, 22, x + 1, 28); ctx.stroke();
    }
    ctx.fillStyle = c.bell;
    ctx.beginPath(); ctx.arc(0, -8, 15, Math.PI, 0); ctx.quadraticCurveTo(8, -4, 0, -5); ctx.quadraticCurveTo(-8, -4, -15, -8); ctx.closePath(); ctx.fill();
    fishOutline(c.line);
  } },
  parrot: { w: 66, h: 38, cols: [{ body: '#3fb8a0', belly: '#9fe0c8', fin: '#f08ab0' }, { body: '#5a7fe0', belly: '#a8c0f4', fin: '#f2c84b' },
                                 { body: '#e46a8f', belly: '#f6b3c6', fin: '#3fb8a0' }], paint(c) {
    fishTail(-19, 9, 12, c.fin, COL.ink);
    const body = () => { ctx.beginPath(); ctx.ellipse(0, 0, 21, 12, 0, 0, Math.PI * 2); };
    ctx.fillStyle = c.body; body(); ctx.fill();
    ctx.save(); body(); ctx.clip();
    ctx.fillStyle = c.belly; ctx.fillRect(-22, 4, 44, 10);
    ctx.strokeStyle = c.belly; ctx.lineWidth = 1;
    ctx.beginPath(); for (let x = -12; x < 12; x += 6) for (const y of [-5, 0]) { ctx.moveTo(x + 3, y - 3); ctx.quadraticCurveTo(x, y, x + 3, y + 3); } ctx.stroke();
    ctx.restore();
    body(); fishOutline(COL.ink);
    ctx.fillStyle = c.fin; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.quadraticCurveTo(0, -18, 10, -11); ctx.closePath(); ctx.fill(); fishOutline(COL.ink, 1);
    ctx.fillStyle = '#f4f1e8'; ctx.beginPath(); ctx.moveTo(19, -3); ctx.lineTo(24, 1); ctx.lineTo(19, 5); ctx.closePath(); ctx.fill(); fishOutline(COL.ink, 1);
    fishEye(13, -3);
  } },
  turtle: { w: 78, h: 60, cols: [{ shell: '#6b8e4e', plate: '#4f6e38', skin: '#a8c08a' }, { shell: '#8a6a3a', plate: '#6a4e28', skin: '#c9b07a' }], paint(c) {
    ctx.fillStyle = c.skin;
    for (const [x, y, a] of [[10, -18, -0.7], [10, 18, 0.7], [-16, -14, -2.4], [-16, 14, 2.4]]) {
      const big = x > 0;
      ctx.beginPath(); ctx.ellipse(x, y, big ? 13 : 7, big ? 5 : 4, a, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink);
    }
    ctx.beginPath(); ctx.ellipse(27, 0, 8, 6.5, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink);
    ctx.fillStyle = c.shell; ctx.beginPath(); ctx.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink, 1.3);
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
    for (const a of [0.6, 1.6, 2.5, 3.8, 4.7, 5.6]) { ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 21, Math.sin(a) * 16); }
    fishOutline(c.plate, 1.2);
    fishEye(30, -2, 1.5);
  } },
  lion: { w: 72, h: 56, cols: [{ body: '#e9d6c4', stripe: '#b5413b' }, { body: '#efe8df', stripe: '#2b2b2b' }, { body: '#e9d6c4', stripe: '#8a5a2e' }], paint(c) {
    ctx.beginPath();
    for (let i = -5; i <= 5; i++) {
      ctx.moveTo(-4 + i * 2, -6); ctx.lineTo(-10 + i * 3, -24);
      ctx.moveTo(-4 + i * 2, 6); ctx.lineTo(-10 + i * 3, 22);
    }
    fishOutline(c.stripe, 1.2);
    fishTail(-15, 7, 10, c.body, COL.ink);
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(0, 0, 17, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = c.stripe; for (let x = -16; x < 18; x += 6) ctx.fillRect(x, -9, 3, 18); ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 8, 0, 0, Math.PI * 2); fishOutline(COL.ink);
    fishEye(11, -2);
  } },
  barracuda: { w: 104, h: 28, paint() {
    fishTail(-36, 8, 12, '#aab4bf', COL.ink);
    ctx.fillStyle = '#c3ccd6'; ctx.beginPath(); ctx.ellipse(0, 0, 38, 6, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink);
    ctx.fillStyle = '#c3ccd6'; ctx.beginPath(); ctx.moveTo(30, 1); ctx.lineTo(46, 2); ctx.lineTo(32, 5); ctx.closePath(); ctx.fill(); fishOutline(COL.ink, 1);
    ctx.fillStyle = '#ffffff'; for (let x = 33; x < 44; x += 3) { ctx.beginPath(); ctx.moveTo(x, 2); ctx.lineTo(x + 1.5, 4); ctx.lineTo(x + 3, 2); ctx.fill(); }
    ctx.fillStyle = '#4a5562'; for (let x = -24; x < 20; x += 8) { ctx.beginPath(); ctx.arc(x, -2, 1.3, 0, Math.PI * 2); ctx.fill(); }
    fishEye(28, -2, 1.6);
  } },
  moray: { w: 112, h: 44, paint() {
    const y = x => Math.sin(x * 0.09) * 6;
    const spine = () => { ctx.beginPath(); for (let x = -46; x <= 38; x += 4) (x === -46 ? ctx.moveTo(x, y(x)) : ctx.lineTo(x, y(x))); };
    spine(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 12.5; ctx.lineCap = 'round'; ctx.stroke();
    spine(); ctx.strokeStyle = '#5f7f3a'; ctx.lineWidth = 10; ctx.stroke();
    ctx.fillStyle = '#3f5a24'; for (let x = -36; x < 34; x += 9) { ctx.beginPath(); ctx.arc(x, y(x) - 1, 1.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#5f7f3a'; ctx.beginPath(); ctx.ellipse(44, y(44), 10, 7, 0.2, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink);
    ctx.beginPath(); ctx.moveTo(53, y(44) + 1); ctx.lineTo(44, y(44) + 3); fishOutline(COL.ink, 1);
    fishEye(46, y(44) - 3, 1.6);
  } },
  octopus: { w: 60, h: 66, cols: [{ body: '#d9534f', spot: '#f2a19e' }, { body: '#9b59b6', spot: '#d2a8e3' }, { body: '#e8913a', spot: '#f6c48a' }], paint(c) {
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const x0 = -10 + i * 4, sway = (i % 2 ? 1 : -1) * 6;
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.quadraticCurveTo(x0 + sway, 14, x0 - sway * 0.4 + (i - 2.5) * 3, 30);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = c.body; ctx.lineWidth = 4; ctx.stroke();
    }
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(0, -12, 15, 17, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(COL.ink, 1.3);
    ctx.fillStyle = c.spot; for (const [x, y, r] of [[-5, -20, 2.4], [4, -24, 1.8], [6, -14, 2], [-7, -10, 1.6]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    fishEye(-5, -3, 2); fishEye(6, -3, 2);
  } },
  tuna: { w: 112, h: 42, cols: [{ back: '#24476e', belly: '#c9d6e2', fin: '#f2c84b' }, { back: '#3a5f4a', belly: '#d6e0d0', fin: '#e0a21a' }], paint(c) {
    ctx.fillStyle = c.back;
    ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(-52, -18); ctx.quadraticCurveTo(-44, 0, -52, 18); ctx.closePath(); ctx.fill(); fishOutline(COL.ink);
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(-8, -20); ctx.lineTo(-14, -9); ctx.closePath(); ctx.fill(); fishOutline(COL.ink, 1);
    const body = () => { ctx.beginPath(); ctx.ellipse(0, 0, 40, 11, 0, 0, Math.PI * 2); };
    body(); ctx.fill();
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = c.belly; ctx.fillRect(-42, 1, 84, 12); ctx.restore();
    body(); fishOutline(COL.ink);
    ctx.fillStyle = c.fin; for (let x = -32; x <= -20; x += 4) for (const yy of [-7, 7]) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 2, yy * 1.35); ctx.lineTo(x + 3, yy); ctx.fill(); }
    fishEye(30, -3, 2);
  } },
  ray: { w: 140, h: 72, paint() {
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.quadraticCurveTo(-45, 2, -66, 6); fishOutline('#55606d', 2);
    const body = () => { ctx.beginPath(); ctx.moveTo(32, 0); ctx.quadraticCurveTo(10, -20, 0, -32); ctx.quadraticCurveTo(-10, -8, -24, 0); ctx.quadraticCurveTo(-10, 8, 0, 32); ctx.quadraticCurveTo(10, 20, 32, 0); ctx.closePath(); };
    ctx.fillStyle = '#7d8a99'; body(); ctx.fill();
    ctx.fillStyle = '#95a2b1'; ctx.beginPath(); ctx.ellipse(6, 0, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
    body(); fishOutline(COL.ink, 1.3);
    ctx.fillStyle = '#1b222b'; for (const yy of [-6, 6]) { ctx.beginPath(); ctx.arc(16, yy, 1.6, 0, Math.PI * 2); ctx.fill(); }
  } },
  sword: { w: 166, h: 62, paint() {
    ctx.fillStyle = '#2c4f7c';
    ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-52, -20); ctx.lineTo(-44, 0); ctx.lineTo(-52, 20); ctx.closePath(); ctx.fill(); fishOutline(COL.ink);
    ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(-4, -28); ctx.lineTo(-14, -8); ctx.closePath(); ctx.fill(); fishOutline(COL.ink);
    ctx.beginPath(); ctx.ellipse(0, 0, 38, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#8fb3cf'; ctx.fillRect(-40, 2, 80, 10); ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, 0, 38, 9, 0, 0, Math.PI * 2); fishOutline(COL.ink);
    ctx.beginPath(); ctx.moveTo(36, -1); ctx.lineTo(80, -2); fishOutline('#2c4f7c', 2.4);
    fishEye(28, -3);
  } },
  reefshark: { w: 138, h: 66, paint() { sharkBody(1, '#7f8fa1', '#c7d0da', COL.ink, false); } },
  hammer: { w: 150, h: 70, paint() {
    sharkBody(1, '#8a9aa8', '#d4dbe2', COL.ink, false);
    ctx.fillStyle = '#8a9aa8';
    ctx.beginPath(); ctx.moveTo(50, -3); ctx.lineTo(54, -17); ctx.lineTo(60, -17); ctx.lineTo(60, 17); ctx.lineTo(54, 17); ctx.lineTo(50, 5); ctx.closePath(); ctx.fill(); fishOutline(COL.ink, 1.3);
    fishEye(57, -14, 1.4, '#0e1218'); fishEye(57, 14, 1.4, '#0e1218');
  } },
  sunfish: { w: 96, h: 120, cols: [{ body: '#9aa8b5', belly: '#c9d2da' }, { body: '#b0a090', belly: '#d8ccbe' }], paint(c) {
    ctx.fillStyle = c.body;
    for (const sy of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-4, sy * 24); ctx.lineTo(-14, sy * 56); ctx.lineTo(-22, sy * 22); ctx.closePath(); ctx.fill(); fishOutline(COL.ink); }
    ctx.beginPath(); ctx.moveTo(-26, -24); ctx.quadraticCurveTo(-36, -12, -31, 0); ctx.quadraticCurveTo(-36, 12, -26, 24); ctx.fill(); fishOutline(COL.ink);
    const body = () => { ctx.beginPath(); ctx.ellipse(0, 0, 30, 30, 0, 0, Math.PI * 2); };
    body(); ctx.fill();
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = c.belly; ctx.fillRect(-32, 8, 64, 30); ctx.restore();
    body(); fishOutline(COL.ink, 1.3);
    ctx.beginPath(); ctx.arc(29, 2, 3, -1.2, 1.2); fishOutline(COL.ink, 1.2);
    fishEye(18, -6, 2.2);
  } },
  white: { w: 196, h: 92, paint() { sharkBody(1.45, '#5d6b7c', '#e4e8ec', PALE, true); } },
  squid: { w: 200, h: 64, paint() {
    ctx.strokeStyle = '#a33a35'; ctx.lineCap = 'round';
    for (const [dy, len, lw] of [[-8, 70, 2.2], [-4, 64, 2.4], [0, 74, 2.4], [4, 62, 2.4], [8, 72, 2.2], [-2, 92, 1.6], [3, 96, 1.6]]) {
      ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-26, dy);
      ctx.quadraticCurveTo(-26 - len * 0.5, dy * 2.4 + 6, -26 - len, dy * 1.4 - 2); ctx.stroke();
    }
    ctx.fillStyle = '#b5413b';
    ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(74, -13); ctx.lineTo(74, 13); ctx.closePath(); ctx.fill(); fishOutline(PALE);
    ctx.beginPath(); ctx.ellipse(24, 0, 40, 12, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(PALE);
    ctx.beginPath(); ctx.ellipse(-20, 0, 10, 9, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(PALE);
    fishEye(-19, -2, 3, '#0e1218');
  } },
  oarfish: { w: 230, h: 52, paint() {
    const y = x => Math.sin(x * 0.045) * 9;
    const spine = () => { ctx.beginPath(); for (let x = -100; x <= 92; x += 4) (x === -100 ? ctx.moveTo(x, y(x)) : ctx.lineTo(x, y(x))); };
    ctx.lineCap = 'round';
    ctx.beginPath(); for (let x = -96; x <= 86; x += 4) (x === -96 ? ctx.moveTo(x, y(x) - 5) : ctx.lineTo(x, y(x) - 5)); ctx.strokeStyle = '#e0503a'; ctx.lineWidth = 3; ctx.stroke();
    spine(); ctx.strokeStyle = PALE; ctx.lineWidth = 9.5; ctx.stroke();
    spine(); ctx.strokeStyle = '#c9d2da'; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = '#e0503a'; ctx.lineWidth = 2;
    ctx.beginPath(); for (const [dx, dy] of [[-4, -16], [0, -20], [4, -15]]) { ctx.moveTo(88, y(88) - 3); ctx.lineTo(88 + dx, y(88) + dy); } ctx.stroke();
    fishEye(90, y(90) - 1, 1.6, '#0e1218');
  } },
  angler: { w: 92, h: 84, lure: [24, -30], paint() {
    ctx.beginPath(); ctx.moveTo(2, -16); ctx.quadraticCurveTo(10, -38, 24, -30); fishOutline(PALE, 1.5);
    fishTail(-18, 9, 12, '#2a2f3a', PALE);
    ctx.fillStyle = '#2a2f3a'; ctx.beginPath(); ctx.arc(0, 4, 20, 0, Math.PI * 2); ctx.fill(); fishOutline(PALE, 1.4);
    ctx.fillStyle = '#12151c'; ctx.beginPath(); ctx.moveTo(19, -3); ctx.quadraticCurveTo(6, 6, 19, 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const yy = -2 + i * 4.5;
      ctx.beginPath(); ctx.moveTo(19 - (i % 2) * 2, yy); ctx.lineTo(13, yy + 2); ctx.lineTo(19 - (i % 2) * 2, yy + 3.5); ctx.closePath(); ctx.fill();
    }
    fishEye(9, -6, 2, '#0e1218');
    ctx.fillStyle = '#f7f3a8'; ctx.beginPath(); ctx.arc(24, -30, 3, 0, Math.PI * 2); ctx.fill();
  } },
  viper: { w: 104, h: 44, paint() {
    ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-6, -22); fishOutline(PALE, 1.2);
    ctx.fillStyle = '#7fe3ff'; ctx.beginPath(); ctx.arc(-6, -22, 2, 0, Math.PI * 2); ctx.fill();
    fishTail(-28, 7, 10, '#1f2a36', PALE);
    ctx.fillStyle = '#1f2a36'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 7, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(PALE);
    ctx.beginPath(); ctx.moveTo(26, 3); ctx.lineTo(40, 9); fishOutline(PALE, 1.4);
    ctx.fillStyle = '#ffffff';
    for (const [x, y, x2, y2] of [[29, -2, 35, 12], [33, -1, 41, 14]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.lineTo(x + 2, y + 1); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#7fe3ff'; for (let x = -22; x <= 20; x += 6) { ctx.beginPath(); ctx.arc(x, 4.5, 1.1, 0, Math.PI * 2); ctx.fill(); }
    fishEye(22, -2, 1.8, '#0e1218');
  } },
  gulper: { w: 160, h: 64, paint() {
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-30, 10, -48, 0); ctx.quadraticCurveTo(-62, -8, -76, 4); fishOutline(PALE, 2.2);
    ctx.fillStyle = '#ff7fb0'; ctx.beginPath(); ctx.arc(-76, 4, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c2430'; ctx.beginPath(); ctx.moveTo(42, -20); ctx.lineTo(-4, -3); ctx.lineTo(42, 18); ctx.quadraticCurveTo(30, 0, 42, -20); ctx.closePath(); ctx.fill(); fishOutline(PALE, 1.3);
    ctx.fillStyle = '#1c2430'; ctx.beginPath(); ctx.arc(-3, -1, 6, 0, Math.PI * 2); ctx.fill(); fishOutline(PALE);
    fishEye(-1, -3, 1.3, '#0e1218');
  } },
  lantern: { w: 56, h: 28, cols: [{ dot: '#7fe3ff' }, { dot: '#9effa8' }, { dot: '#ff9ed8' }], paint(c) {
    fishTail(-17, 6, 8, '#2a3340', PALE);
    ctx.fillStyle = '#2a3340'; ctx.beginPath(); ctx.ellipse(0, 0, 19, 7.5, 0, 0, Math.PI * 2); ctx.fill(); fishOutline(PALE);
    ctx.fillStyle = c.dot;
    for (let x = -14; x <= 12; x += 4.5) { ctx.beginPath(); ctx.arc(x, 4, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(x + 2, -1, 0.9, 0, Math.PI * 2); ctx.fill(); }
    fishEye(12, -2, 2.6, '#0e1218');
  } },
  hatchet: { w: 42, h: 44, cols: [{ body: '#b9c6d3', dot: '#c38bff' }, { body: '#d6c7e8', dot: '#7fe3ff' }], paint(c) {
    fishTail(-12, 5, 7, c.body, PALE);
    const body = () => { ctx.beginPath(); ctx.moveTo(12, -6); ctx.lineTo(-10, -9); ctx.lineTo(-12, 0); ctx.quadraticCurveTo(-2, 18, 8, 16); ctx.quadraticCurveTo(14, 6, 12, -6); ctx.closePath(); };
    ctx.fillStyle = c.body; body(); ctx.fill(); fishOutline(PALE);
    ctx.fillStyle = c.dot; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-6 + i * 3.4, 6 + Math.sin(i * 0.8) * 3 + i * 1.4, 1.2, 0, Math.PI * 2); ctx.fill(); }
    fishEye(6, -2, 3, '#0e1218');
  } }
};
const FISH_TIERS = [
  ['clown', 'tang', 'school', 'butterfly', 'seahorse'], ['puffer', 'angel', 'jelly', 'parrot', 'turtle'],
  ['lion', 'barracuda', 'moray', 'octopus', 'tuna'], ['ray', 'sword', 'reefshark', 'hammer', 'sunfish'],
  ['white', 'squid', 'oarfish'], ['angler', 'viper', 'gulper', 'lantern', 'hatchet']
];
let lastSceneryY = -1e9;
// far-away scenery: very faded silhouettes that appear now and then (never collide)
FISH.whale = { w: 300, h: 110, alpha: 0.2, paint() {
  ctx.fillStyle = '#0e3b5c';
  ctx.beginPath();
  ctx.moveTo(130, 4); ctx.quadraticCurveTo(118, -40, 30, -40); ctx.quadraticCurveTo(-60, -38, -112, -8);
  ctx.lineTo(-146, -32); ctx.quadraticCurveTo(-140, -6, -134, 0); ctx.quadraticCurveTo(-140, 8, -146, 30);
  ctx.lineTo(-110, 10); ctx.quadraticCurveTo(-40, 36, 40, 38); ctx.quadraticCurveTo(110, 36, 130, 4);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(28, 40, 26, 8, 0.5, 0, Math.PI * 2); ctx.fill();          // flipper
  ctx.strokeStyle = 'rgba(160,200,225,.5)'; ctx.lineWidth = 1.4;                      // throat grooves
  ctx.beginPath(); for (const y of [16, 22, 28]) { ctx.moveTo(110, y - 8); ctx.quadraticCurveTo(70, y + 4, 30, y + 4); } ctx.stroke();
  ctx.fillStyle = 'rgba(190,220,240,.7)'; ctx.beginPath(); ctx.arc(96, -6, 2.5, 0, Math.PI * 2); ctx.fill();
} };
FISH.wreck = { w: 300, h: 140, alpha: 0.22, still: true, paint() {
  ctx.rotate(-0.12);
  ctx.fillStyle = '#0b2a40';
  ctx.beginPath(); ctx.moveTo(-130, -10); ctx.lineTo(120, -18); ctx.lineTo(96, 34); ctx.lineTo(-110, 38); ctx.closePath(); ctx.fill();   // hull
  ctx.fillRect(-40, -40, 70, 24);                                                                                                    // cabin
  ctx.strokeStyle = '#0b2a40'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-70, -12); ctx.lineTo(-84, -66); ctx.moveTo(56, -16); ctx.lineTo(70, -54); ctx.lineTo(90, -60); ctx.stroke();   // broken masts
  ctx.fillStyle = 'rgba(120,170,200,.45)';
  for (const x of [-90, -60, -30, 0, 30, 60]) { ctx.beginPath(); ctx.arc(x, 10, 4, 0, Math.PI * 2); ctx.fill(); }                   // portholes
} };
function spawnFish(lineY) {
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  if (tier > 0 && Math.random() < 0.2) tier--;                   // the odd smaller fish keeps it varied
  let kind = FISH_TIERS[tier][ri(0, FISH_TIERS[tier].length - 1)];
  // rare far-away scenery, never two close together (at least ~30 m apart)
  if (lineY - lastSceneryY > 900) {
    if (m >= 100 && m < 800 && Math.random() < 0.12) kind = 'whale';     // a whale passing far away
    else if (m >= 600 && Math.random() < 0.08) kind = 'wreck';          // a sunken ship in the gloom
    if (kind === 'whale' || kind === 'wreck') lastSceneryY = lineY;
  }
  const def = FISH[kind], K = fishK(kind), s = rand(0.75, 1), dir = Math.random() < 0.5 ? -1 : 1;
  const speed = def.still ? 0 : kind === 'whale' ? rand(8, 14) : rand(10, 30) * (tier >= 3 ? 0.8 : 1);
  const v = def.cols ? ri(0, def.cols.length - 1) : 0;
  fishes.push({ kind, v, tier, x: def.still ? rand(W * 0.3, W * 0.7) : rand(50, W - 50), y: lineY, dir, s, t: rand(0, 6),
    vx: dir * speed, w: def.w * K * s, ext: def.h * K * s });
  return def.h * K * s;
}
// the small reef fish of the first three levels are drawn 35% larger so they read on a phone
const fishK = kind => {
  const t = FISH_TIERS.findIndex(list => list.includes(kind));
  return t >= 0 && t <= 2 ? 1.35 : 1;
};
function fishSprite(kind, v = 0) {
  const def = FISH[kind], K = fishK(kind);
  return sharedSprite('fish' + kind + v, def.w * K, def.h * K, def.w * K / 2, def.h * K / 2, () => { ctx.scale(K, K); def.paint(def.cols && def.cols[v]); });
}
// drifting specks that change with depth: plankton (100–400 m), marine snow (400–1,000 m), then
// twinkling bioluminescence. Positions come from a hash of the page chunk, so nothing is stored.
const hash = n => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
function drawSeaParticles() {
  const CH = 300, N = 14, t = titleTime + time;
  ctx.save();
  for (let c = Math.floor((dist - 20) / CH); c * CH < dist + H + 20; c++) {
    const m = c * CH / PX_PER_M;
    if (m < 100) continue;                       // the clear shallows have no specks
    for (let i = 0; i < N; i++) {
      const hx = hash(c * 97 + i * 13.1), hy = hash(c * 53 + i * 7.7), hs = hash(c * 11 + i * 3.3);
      let x = hx * W, y = c * CH + hy * CH - dist;
      if (m < 400) {                             // plankton
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#c8f0c0';
        const s = 1.2 + hs * 1.4; ctx.fillRect(x, y, s, s);
      } else if (m < 1000) {                     // marine snow, sinking slowly
        y = c * CH + ((hy * CH + t * (6 + hs * 8)) % CH) - dist;
        x += Math.sin(t * 0.6 + i) * 4;
        ctx.globalAlpha = 0.55; ctx.fillStyle = '#eef6fb';
        const s = 1 + hs * 2; ctx.fillRect(x, y, s, s);
      } else {                                   // bioluminescence, twinkling
        const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + hs * 2) + i * 1.7), r = 1.4 + hs * 1.2;
        ctx.fillStyle = hs > 0.5 ? '#7fe3ff' : '#9dffb8';
        ctx.globalAlpha = (0.25 + 0.6 * tw) * 0.25;
        ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.25 + 0.6 * tw;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawFishes() {
  ctx.save();
  // two passes: far-away scenery (whales, wrecks) first, then the fish in front of it
  for (const far of [true, false]) for (const f of fishes) {
    const def = FISH[f.kind];
    if (!!def.alpha !== far) continue;
    const sy = f.y - dist + (def.still ? 0 : Math.sin(f.t * 1.6) * 2.5);
    if (sy < -f.ext - 20 || sy > H + f.ext + 20) continue;
    const spr = fishSprite(f.kind, f.v);
    ctx.globalAlpha = def.alpha || (f.tier >= 3 ? 0.68 : 0.55);   // background: faded so they never read as obstacles
    blit(spr, f.x, sy, def.still ? 0 : Math.sin(f.t * 3) * (far ? 0.015 : 0.04) * f.dir, f.s * f.dir, f.s);
    if (def.lure) {                                                // the anglerfish lure pulses
      const g = sharedSprite('lureGlow', 30, 30, 15, 15, () => {
        const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
        gr.addColorStop(0, 'rgba(255,250,190,.95)'); gr.addColorStop(1, 'rgba(255,250,190,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(f.t * 4);
      const k = f.s * (1 + 0.15 * Math.sin(f.t * 4));
      blit(g, f.x + def.lure[0] * f.s * f.dir, sy + def.lure[1] * f.s, 0, k, k);
    }
  }
  ctx.restore();
}

// the start of a Deep sea run: the sea's surface with sky and clouds above, a paper boat bobbing on the waves and
// sunlit shallows below. It slides up out of view within the first ~35 m, like the Earth in Space.
const seaStartY = () => planeScreenY() - 90 - dist * 0.22;          // the water line on screen
function drawSeaStart() {
  const y = seaStartY();
  if (y < -150) return;
  blit(sharedSprite('seaTop', W, 520, 0, 380, () => {
    const sky = ctx.createLinearGradient(0, -380, 0, 0);
    sky.addColorStop(0, '#6fc0ec'); sky.addColorStop(1, '#d9f2fb');
    ctx.fillStyle = sky; ctx.fillRect(0, -380, W, 384);
    ctx.fillStyle = 'rgba(255,255,255,.9)';                                                    // clouds
    for (const [x, yy, r] of [[90, -70, 14], [108, -78, 18], [128, -70, 13], [300, -50, 11], [315, -57, 15], [333, -50, 11]]) { ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fill(); }
    const shallow = ctx.createLinearGradient(0, 0, 0, 140);                                    // sunlit water just below
    shallow.addColorStop(0, 'rgba(255,255,255,.4)'); shallow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shallow; ctx.fillRect(0, 0, W, 140);
    const wave = x => Math.sin(x * 0.05) * 3 + Math.sin(x * 0.13) * 1.5;
    ctx.fillStyle = '#c4ecf4'; ctx.beginPath(); ctx.moveTo(0, 6);                             // the water body up to the waves
    for (let x = 0; x <= W; x += 6) ctx.lineTo(x, wave(x)); ctx.lineTo(W, 30); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shallow; ctx.fillRect(0, 0, W, 30);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath();  // foam along the top
    for (let x = 0; x <= W; x += 6) (x ? ctx.lineTo(x, wave(x)) : ctx.moveTo(x, wave(x)));
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath();          // ripples of light
    for (const [x, yy, w] of [[60, 34, 40], [180, 52, 54], [300, 30, 36], [120, 84, 30], [250, 96, 44]]) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + w / 2, yy - 4, x + w, yy); }
    ctx.stroke();
  }), 0, y);
  // a paper boat bobbing on the surface, off to one side of the plane
  const t = titleTime + time, bob = Math.sin(t * 2) * 2;
  blit(sharedSprite('paperBoat', 74, 44, 37, 30, () => {
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-32, -4); ctx.lineTo(32, -4); ctx.lineTo(22, 8); ctx.lineTo(-22, 8); ctx.closePath(); ctx.fill(); ctx.stroke();   // hull
    ctx.fillStyle = '#e9e7dd'; ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(2, -28); ctx.lineTo(16, -4); ctx.closePath(); ctx.fill(); ctx.stroke();   // sail
    ctx.beginPath(); ctx.moveTo(2, -28); ctx.lineTo(2, -4); ctx.stroke();
  }), 300, y + 2 + bob, Math.sin(t * 1.6) * 0.05);
}
