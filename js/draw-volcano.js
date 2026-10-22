// Paper Nosedive — Art for the Volcano map obstacles.
'use strict';

// Volcano obstacles reuse a Paper or Ocean obstacle's movement and collision (see VOLCANO_MAKERS) and only change the
// look (o.look, see VOLCANO_LOOKS) in a few colours (o.volCol); o.layer is the layer the obstacle is in. Rock, ash,
// steam and lava only (no torches, skeletons or dragons: that is the Dungeon). Every drawing stays inside the
// mechanic's collision shape with a near-black outline, so it reads on the green slopes and on the bright magma.
const VOL_LINE = '#140c08';
function volStroke(w = 1.6) { ctx.strokeStyle = VOL_LINE; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
const volLight = a => `rgba(255,255,255,${a})`, volShade = a => `rgba(0,0,0,${a})`;
const LAVA = '#ff7a2a', LAVA_HOT = '#ffd060', BASALT = '#3a3a42';
// a glowing crack along the current path: a soft orange halo, the lava, a bright core
function lavaGlow(w = 2.4) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255,110,30,.35)'; ctx.lineWidth = w * 2.4; ctx.stroke();
  ctx.strokeStyle = LAVA; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = LAVA_HOT; ctx.lineWidth = w * 0.4; ctx.stroke();
}
// a six-sided basalt column end, centred on (x, y)
function hexPath(x, y, r) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); }

function drawVolcanoObstacle(o, sy) {
  if (o.look === 'embers') { drawEmbers(o, sy); return; }        // looks added in v129
  if (o.look === 'fumarole') { drawFumarole(o, sy); return; }
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      drawVolcanoLedge(-10, l, sy, l, -1, o); drawVolcanoLedge(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      drawVolcanoPlate(-10, l, sy, l, -1, o); drawVolcanoPlate(r, W + 10, sy, r, 1, o);
      break;
    }
    case 'blot': drawVolcanoHazard(o, sy); break;
    case 'protractor': drawVolcanoDome(o, sy); break;
    case 'pencil': drawVolcanoRaft(o, sy); break;
    case 'wad': drawVolcanoBomb(o, sy); break;
    case 'note': drawVolcanoFlyer(o, sy); break;
    case 'clips': for (const x of clipXs(o)) drawVolcanoRoller(x, sy, o.v > 0 ? 1 : -1, o.look); break;
    case 'starfish': drawVolcanoSpinner(o, sy); break;
    case 'scissors': drawVolcanoShards(o, sy); break;
    case 'compass': drawVolcanoJet(o, sy); break;
    case 'cutter': drawVolcanoTongue(o, sy); break;
    case 'glue': drawVolcanoVent(o, sy); break;
    case 'zap': drawVolcanoLightning(o, sy); break;
    case 'paw': drawVolcanoWave(o, sy); break;
    case 'mine': drawVolcanoMud(o, sy); break;
    case 'fan': drawVolcanoGust(o, sy); break;
    case 'bubbles': drawVolcanoSteam(o, sy); break;
    case 'band': drawVolcanoRope(o, sy); break;
  }
}

// ---------- Gap Wall: basalt column ledges with six-sided ends, or a cooled lava crust with a glowing crack, 22 thick ----------
function drawVolcanoLedge(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.volCol || BASALT;
  ctx.save();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 3); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  if (o.look === 'crust') {                        // a lumpy black crust, a glowing seam along it
    ctx.fillStyle = volLight(0.1); for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 14) { ctx.beginPath(); ctx.arc(x, sy - 10, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(x0, sy + 2);
    for (let x = x0, i = 0; x <= x1; x += 9, i++) ctx.lineTo(x, sy + 2 + (i % 2 ? 3 : -2));
    lavaGlow(2);
  } else {                                         // basalt columns: joints, lighter and darker faces
    for (let x = innerX + outDir * 9, i = 0; outDir > 0 ? x < x1 : x > x0; x += outDir * 9, i++) {
      ctx.fillStyle = i % 2 ? volLight(0.06) : volShade(0.12); ctx.fillRect(Math.min(x, x + outDir * 9), sy - 11, 9, 22);
    }
    ctx.strokeStyle = volShade(0.45); ctx.lineWidth = 1; ctx.beginPath();
    for (let x = innerX + outDir * 9; outDir > 0 ? x < x1 : x > x0; x += outDir * 9) { ctx.moveTo(x, sy - 11); ctx.lineTo(x, sy + 11); }
    ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); roundRectPath(x0, sy - 11, x1 - x0, 22, 3); volStroke(1.5);
  if (o.look !== 'crust') {                        // the column's six-sided end at the gap
    hexPath(innerX + outDir * 10, sy, 9.5); ctx.fillStyle = '#5a5a64'; ctx.fill(); volStroke(1.2);
    hexPath(innerX + outDir * 10, sy, 5); ctx.strokeStyle = volLight(0.18); ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
}

// ---------- Closing Jaws: grinding rock plates with a glowing seam, or glossy obsidian slabs, 28 thick ----------
function drawVolcanoPlate(x0, x1, sy, innerX, outDir, o) {
  if (x1 - x0 < 1) return;
  const col = o.volCol || '#4a4440', obs = o.look === 'obsidian';
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip();
  if (obs) {                                       // volcanic glass: shiny streaks and curved fracture lines
    ctx.strokeStyle = 'rgba(190,170,255,.35)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = innerX + outDir * 10; outDir > 0 ? x < x1 : x > x0; x += outDir * 26) { ctx.moveTo(x, sy - 14); ctx.quadraticCurveTo(x + outDir * 8, sy, x, sy + 14); }
    ctx.stroke();
    ctx.fillStyle = volLight(0.25); ctx.fillRect(x0, sy - 12, x1 - x0, 2.5);
  } else {                                         // a layered plate, the edge at the gap glowing where it grinds
    ctx.fillStyle = volShade(0.18); for (const y of [-6, 4]) ctx.fillRect(x0, sy + y, x1 - x0, 4);
    ctx.fillStyle = volLight(0.1); ctx.fillRect(x0, sy - 14, x1 - x0, 4);
    ctx.beginPath(); ctx.moveTo(innerX + outDir * 3, sy - 13); ctx.lineTo(innerX + outDir * 5, sy - 4); ctx.lineTo(innerX + outDir * 2, sy + 4); ctx.lineTo(innerX + outDir * 5, sy + 13);
    lavaGlow(2.2);
  }
  ctx.restore();
  ctx.beginPath(); ctx.rect(x0, sy - 14, x1 - x0, 28); volStroke(1.6);
  ctx.restore();
}

// ---------- Static Hazards: volcanic bombs with glowing cracks, sulfur crystal clusters or pumice, inside the hit circle ----------
// Minecraft minerals (v150; ores until v149; a temporary exception to "original designs only", to be replaced before
// the Google Play release): Static Hazard variants, each the item its ore smelts or breaks into, drawn as a 16×16 pixel
// icon with a dark outline (k) and five tones from highlight (e) to darkest (a). Drawn inside a 20-unit circle (also
// used by the Collections screen). The save ids stay `ore-*`, so items found as ores stay found.
const MINERAL_NAMES = { coal: 'Coal', iron: 'Iron ingot', copper: 'Copper ingot', gold: 'Gold ingot', redstone: 'Redstone dust',
                        lapis: 'Lapis lazuli', emerald: 'Emerald', diamond: 'Diamond', quartz: 'Nether quartz', debris: 'Netherite scrap' };
// a diagonal bar, bottom left to top right (it fills the hit circle better than a flat one)
const INGOT = ['................', '................', '..........kkk...', '........kkeedk..',
               '......kkeeddddk.', '....kkeedddddck.', '..kkeedddddddck.', '.keedddddddccbk.',
               '.kddddddddccbbk.', '.kcdddddccbbbk..', '.kccdddccbbbk...', '.kcccdccbbk.....',
               '.kbcccbbk.......', '..kkbbk.........', '....kk..........', '................'];
const LUMP = ['................', '................', '................', '......kkk.......',
              '....kkbcbkk.....', '...kbccddcbk....', '..kbcdeedccbk...', '..kccdedcccbbk..',
              '.kbcccdccccbbk..', '.kbccccccccbak..', '.kbbccccccbbak..', '..kbbbccbbbak...',
              '...kkabbbaak....', '.....kkkkkk.....', '................', '................'];
const MINERAL_LOOKS = {
  coal: { rows: LUMP, pal: { e: '#6a6a6a', d: '#484848', c: '#2e2e2e', b: '#1e1e1e', a: '#101010', k: '#000000' } },
  iron: { rows: INGOT, pal: { e: '#ffffff', d: '#e8e8e8', c: '#c8c8c8', b: '#a0a0a0', a: '#6e6e6e' } },
  copper: { rows: INGOT, pal: { e: '#ffd0b0', d: '#ec8c5c', c: '#c8643a', b: '#9a4a2a', a: '#5e2e18' } },
  gold: { rows: INGOT, pal: { e: '#fffbd0', d: '#fde34a', c: '#f0c020', b: '#d09010', a: '#8a5a00' } },
  redstone: { rows: ['................', '................', '................', '................',
                     '.......kk.......', '......kddk......', '.....kdeddk.k...', '...k.kdddcdkdk..',
                     '..kdkkcdccccdk..', '.kdeddcccccbbck.', '.kcdcccbccbbbbk.', '..kkkkkkkkkkkk..',
                     '................', '................', '................', '................'],
              pal: { e: '#ff9a8a', d: '#ff2a1a', c: '#d00000', b: '#900000', a: '#500000' } },
  lapis: { rows: ['................', '................', '................', '......kkkk......',
                  '.....kddcck.....', '....kdeddccbk...', '...kddddcccbbk..', '..kdedcccecbbk..',
                  '..kddcccccbbak..', '...kcccecbbbak..', '...kcccbbbbak...', '....kbbbbaak....',
                  '.....kkkkkk.....', '................', '................', '................'],
           pal: { e: '#a8c8ff', d: '#4a7ae8', c: '#2a50c0', b: '#1a3490', a: '#0e1e5a' } },
  emerald: { rows: ['................', '......kkkk......', '.....kdeedk.....', '....kddeeddk....',
                    '...kcddeeddck...', '...kcddddddck...', '...kccddddcck...', '...kccddddcck...',
                    '...kccddddcck...', '...kccddddcck...', '...kccddddcck...', '...kbccddccbk...',
                    '...kbbccccbbk...', '....kbbccbbk....', '.....kabbak.....', '......kkkk......'],
             pal: { e: '#d8ffe4', d: '#3ae08a', c: '#18b060', b: '#0a7a40', a: '#044a24' } },
  diamond: { rows: ['................', '................', '................', '....kkkkkkkk....',
                    '...keeddddcck...', '..keedddddccbk..', '.keddddddddccbbk', '.kbbbbbbbbbbbbak',
                    '..kdddddddccbk..', '...kddddddcbk...', '....kddddcbk....', '.....kdddbk.....',
                    '......kdbk......', '.......kk.......', '................', '................'],
             pal: { e: '#ffffff', d: '#8af5f0', c: '#4ad8d8', b: '#2aa8b0', a: '#1a7080' } },
  quartz: { rows: ['................', '................', '........kk......', '.......kedk.....',
                   '...k...kedk.....', '..kek..kddk..k..', '..kdk..kddk.kek.', '..kdk..kdck.kdk.',
                   '..kdck.kdck.kdk.', '..kdck.kdck.kdck', '.kdckkkdcckkdck.', '.krrrrrrrrrrrrk.',
                   '.kRrrRrrrRrrRrk.', '..kkkkkkkkkkkk..', '................', '................'],
            pal: { e: '#ffffff', d: '#ece4da', c: '#c8bcae', b: '#a89888', r: '#8a3030', R: '#6a2222' } },
  debris: { rows: LUMP, pal: { e: '#9a8078', d: '#6e564e', c: '#523e38', b: '#3c2c28', a: '#261c1a', k: '#120c0a' } }
};
function paintMineral(name) {
  const { rows, pal } = MINERAL_LOOKS[name], cell = 40 / 16;
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
    const ch = rows[j][i];
    if (ch === '.') continue;
    ctx.fillStyle = pal[ch] || (ch === 'k' ? VOL_LINE : '#ff00ff');
    ctx.fillRect(-20 + i * cell, -20 + j * cell, cell + 0.05, cell + 0.05);   // a hair over one cell: no seams
  }
}
function drawVolcanoHazard(o, sy) {
  if (o.mineral) { const k = o.r * 0.95 / 20; blit(sharedSprite('mineral-' + o.mineral, 44, 44, 22, 22, () => paintMineral(o.mineral)), o.x, sy, 0, k, k); return; }
  const col = o.volCol || '#3a302a', R = o.r * 0.88, look = o.look || 'bomb';
  blit(ownSprite(o, 'spr', R * 2 + 12, R * 2 + 12, R + 6, R + 6, () => {
    if (look === 'sulfur') {                       // yellow crystal prisms on a dark rock
      ctx.fillStyle = '#4a4640'; ctx.beginPath(); ctx.ellipse(0, R * 0.55, R * 0.85, R * 0.35, 0, 0, Math.PI * 2); ctx.fill(); volStroke(1.3);
      for (const [x, h, w, a] of [[-0.45, 0.9, 0.3, -0.35], [0, 1.25, 0.34, 0], [0.42, 0.95, 0.3, 0.35], [-0.15, 0.6, 0.24, -0.15]]) {
        ctx.save(); ctx.translate(R * x, R * 0.45); ctx.rotate(a);
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-R * w / 2, 0); ctx.lineTo(-R * w / 2, -R * h + R * 0.15); ctx.lineTo(0, -R * h); ctx.lineTo(R * w / 2, -R * h + R * 0.15); ctx.lineTo(R * w / 2, 0); ctx.closePath(); ctx.fill(); volStroke(1.2);
        ctx.fillStyle = volLight(0.45); ctx.fillRect(-R * w / 2 + 2, -R * h + R * 0.2, R * w * 0.25, R * h * 0.7);
        ctx.restore();
      }
    } else if (look === 'pumice') {                // a pale light rock full of holes
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); volStroke(1.5);
      ctx.fillStyle = 'rgba(120,110,95,.6)';
      for (let i = 0; i < 16; i++) { const a = i * 2.4, d = R * (0.15 + 0.7 * ((i * 37) % 10) / 10); ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, R * (0.05 + 0.04 * (i % 3)), 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = volLight(0.3); ctx.beginPath(); ctx.ellipse(-R * 0.35, -R * 0.4, R * 0.3, R * 0.15, -0.5, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a volcanic bomb: a dark rock with glowing cracks and a hot halo
      ctx.fillStyle = 'rgba(255,110,30,.25)'; ctx.beginPath(); ctx.arc(0, 0, R + 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); volStroke(1.5);
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
      ctx.beginPath();
      ctx.moveTo(-R, -R * 0.2); ctx.lineTo(-R * 0.3, -R * 0.1); ctx.lineTo(0, -R * 0.6); ctx.lineTo(R * 0.4, -R * 0.4); ctx.lineTo(R, -R * 0.6);
      ctx.moveTo(-R * 0.3, -R * 0.1); ctx.lineTo(-R * 0.1, R * 0.4); ctx.lineTo(R * 0.5, R * 0.3); ctx.lineTo(R, R * 0.5);
      ctx.moveTo(-R * 0.1, R * 0.4); ctx.lineTo(-R * 0.4, R);
      lavaGlow(Math.max(1.6, R * 0.1));
      ctx.restore();
    }
  }), o.x, sy);
}

// ---------- Wall Bulge: a lava dome with glowing cracks, a cluster of basalt columns, or a steaming mound, an exact half-disc ----------
function drawVolcanoDome(o, sy) {
  const cx = o.side < 0 ? 0 : W, R = o.r + 6, i = -o.side;
  const s = ownSprite(o, 'spr', R * 2, R * 2, R, R, () => {
    const col = o.volCol || '#3a2a24', look = o.look || 'dome';
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.save(); ctx.clip();
    if (look === 'columns') {                      // the ends of many basalt columns seen head-on
      const r = 13, dx = r * 1.5, dy = r * Math.sqrt(3);
      for (let c = -8; c <= 8; c++) for (let rr = -6; rr <= 6; rr++) {
        const x = c * dx, y = rr * dy + (c % 2 ? dy / 2 : 0);
        hexPath(x, y, r - 1); ctx.fillStyle = (c + rr) % 3 ? '#4a4a54' : '#56565f'; ctx.fill(); ctx.strokeStyle = volShade(0.5); ctx.lineWidth = 1.4; ctx.stroke();
      }
    } else if (look === 'mound') {                 // a grey-brown mound with puffs of steam coming out of it
      ctx.fillStyle = volLight(0.12); ctx.beginPath(); ctx.arc(-i * o.r * 0.2, -o.r * 0.25, o.r * 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a2420'; for (const [a, d] of [[-0.5, 0.5], [0.4, 0.62]]) { ctx.beginPath(); ctx.ellipse(i * Math.cos(a) * o.r * d, Math.sin(a) * o.r * d, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      for (const [a, d, r] of [[-0.5, 0.62, 8], [-0.6, 0.78, 10], [0.4, 0.75, 7], [0.3, 0.88, 9]]) { ctx.beginPath(); ctx.arc(i * Math.cos(a) * o.r * d, Math.sin(a) * o.r * d - 6, r, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a lava dome: dark crust, glowing cracks spreading from a bright spot
      const hx = i * o.r * 0.45;
      ctx.fillStyle = 'rgba(255,120,30,.35)'; ctx.beginPath(); ctx.arc(hx, 0, o.r * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      for (const a of [-1.2, -0.6, 0, 0.6, 1.2, 2.4, -2.4]) { ctx.moveTo(hx, 0); ctx.lineTo(hx + Math.cos(a) * o.r * 0.4, Math.sin(a) * o.r * 0.4 + 4); ctx.lineTo(hx + Math.cos(a + 0.2) * o.r, Math.sin(a + 0.2) * o.r); }
      lavaGlow(2.6);
      ctx.fillStyle = LAVA_HOT; ctx.beginPath(); ctx.arc(hx, 0, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); volStroke(1.8);
  });
  blit(s, cx, sy);
}

// ---------- Bouncing Slider: a charred log with glowing embers, or a raft of cooled lava, 13 thick ----------
function drawVolcanoRaft(o, sy) {
  const L = o.len / 2, col = o.volCol || '#2a2420', raft = o.look === 'lavaraft';
  blit(ownSprite(o, 'spr', o.len + 8, 22, L + 4, 11, () => {
    if (raft) {                                    // plates of dark crust with lava showing in the gaps
      ctx.beginPath(); roundRectPath(-L, -6, o.len, 12, 4); ctx.fillStyle = LAVA; ctx.fill();
      ctx.fillStyle = col;
      for (let x = -L + 1, k = 0; x < L - 2; k++) { const w = 14 + ((k * 7) % 9); ctx.beginPath(); roundRectPath(x, -5.5, Math.min(w, L - 1 - x), 11, 3); ctx.fill(); x += w + 2.5; }
      ctx.beginPath(); roundRectPath(-L, -6, o.len, 12, 4); volStroke(1.3);
    } else {                                       // a charred log: black, cracked, a few glowing embers, ashy ends
      ctx.beginPath(); roundRectPath(-L, -5.5, o.len, 11, 5.5); ctx.fillStyle = col; ctx.fill(); volStroke(1.3);
      ctx.strokeStyle = volLight(0.12); ctx.lineWidth = 1; ctx.beginPath(); for (let x = -L + 8; x < L - 6; x += 9) { ctx.moveTo(x, -5); ctx.lineTo(x + 3, 0); ctx.lineTo(x, 5); } ctx.stroke();
      ctx.fillStyle = LAVA; for (const k of [-0.6, -0.1, 0.4, 0.75]) { ctx.beginPath(); ctx.arc(k * L, k > 0 ? -1.5 : 1.5, 1.8, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#9a968e'; for (const x of [-L + 3, L - 3]) { ctx.beginPath(); ctx.ellipse(x, 0, 2.5, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    }
  }), o.x, sy, o.a);
}

// ---------- Rising Projectile: lava bombs flung up or glowing rocks; the Volcanic stones collectibles ----------
// the Volcanic stones, each drawn inside a 16-unit circle (also used by the Collections screen)
const STONE_NAMES = { obsidian: 'Obsidian', pumice: 'Pumice', basalt: 'Basalt', sulfur: 'Sulfur crystal', olivine: 'Olivine',
                      geode: 'Geode', peleshair: "Pele's hair", spindlebomb: 'Spindle bomb' };
function paintVolcStone(name) {
  if (name === 'obsidian') {                       // glossy black glass with sharp facets and white glints
    ctx.fillStyle = '#16121c'; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(-8, -10); ctx.lineTo(6, -13); ctx.lineTo(13, -2); ctx.lineTo(8, 11); ctx.lineTo(-4, 12); ctx.closePath(); ctx.fill(); volStroke(1.4);
    ctx.strokeStyle = 'rgba(190,170,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(0, 0); ctx.lineTo(13, -2); ctx.moveTo(0, 0); ctx.lineTo(-4, 12); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-3, -6, 3, 1.4, -0.5, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'pumice') {
    ctx.fillStyle = '#e8e0d0'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 11, 0.3, 0, Math.PI * 2); ctx.fill(); volStroke(1.4);
    ctx.fillStyle = 'rgba(120,110,95,.6)'; for (let i = 0; i < 12; i++) { const a = i * 2.4, d = 2 + (i % 4) * 2.5; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d * 0.8, 1 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill(); }
  } else if (name === 'basalt') {                  // a six-sided column seen at a slant
    ctx.fillStyle = '#4a4a54'; ctx.beginPath(); ctx.moveTo(-9, -6); ctx.lineTo(-9, 10); ctx.lineTo(0, 14); ctx.lineTo(9, 10); ctx.lineTo(9, -6); ctx.closePath(); ctx.fill(); volStroke(1.3);
    ctx.fillStyle = '#6a6a74'; ctx.beginPath(); ctx.moveTo(-9, -6); ctx.lineTo(-4, -12); ctx.lineTo(5, -12); ctx.lineTo(9, -6); ctx.lineTo(4, -1); ctx.lineTo(-5, -1); ctx.closePath(); ctx.fill(); volStroke(1.2);
    ctx.strokeStyle = volShade(0.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, -1); ctx.lineTo(-5, 12); ctx.moveTo(4, -1); ctx.lineTo(4, 12); ctx.stroke();
  } else if (name === 'sulfur') {
    for (const [x, h, a] of [[-6, 20, -0.3], [1, 24, 0.05], [7, 16, 0.4]]) {
      ctx.save(); ctx.translate(x, 11); ctx.rotate(a);
      ctx.fillStyle = '#f6d82a'; ctx.beginPath(); ctx.moveTo(-3.5, 0); ctx.lineTo(-3.5, -h + 4); ctx.lineTo(0, -h); ctx.lineTo(3.5, -h + 4); ctx.lineTo(3.5, 0); ctx.closePath(); ctx.fill(); volStroke(1.1);
      ctx.fillStyle = volLight(0.5); ctx.fillRect(-2.4, -h + 5, 1.4, h - 7);
      ctx.restore();
    }
  } else if (name === 'olivine') {                 // little green gems on a dark rock
    ctx.fillStyle = '#3a3630'; ctx.beginPath(); ctx.ellipse(0, 4, 13, 9, 0, 0, Math.PI * 2); ctx.fill(); volStroke(1.3);
    for (const [x, y, r] of [[-5, 0, 4], [3, -2, 4.6], [7, 5, 3.4], [-2, 6, 3]]) {
      ctx.fillStyle = '#8ad040'; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); volStroke(0.9);
      ctx.fillStyle = volLight(0.7); ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2); ctx.fill();
    }
  } else if (name === 'geode') {                   // a split round rock lined with purple crystals
    ctx.fillStyle = '#8a7a6a'; ctx.beginPath(); ctx.arc(0, 0, 13.5, 0, Math.PI * 2); ctx.fill(); volStroke(1.4);
    ctx.fillStyle = '#e8e0f0'; ctx.beginPath(); ctx.arc(0, 0, 10.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9a5ad8'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 10.5, Math.sin(a) * 10.5); ctx.lineTo(Math.cos(a + 0.26) * 4, Math.sin(a + 0.26) * 4); ctx.lineTo(Math.cos(a + 0.52) * 10.5, Math.sin(a + 0.52) * 10.5); ctx.fill(); }
    ctx.fillStyle = '#4a2a7a'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  } else if (name === 'peleshair') {               // fine golden threads of volcanic glass, tangled
    ctx.strokeStyle = '#d8b040'; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 9; i++) { const a = i * 0.7; ctx.moveTo(Math.cos(a) * 13, Math.sin(a) * 9); ctx.quadraticCurveTo(Math.cos(a + 2) * 4, Math.sin(a + 2) * 6, Math.cos(a + 3.3) * 13, Math.sin(a + 3.3) * 9); }
    ctx.stroke();
    ctx.fillStyle = '#5a4a2a'; for (const [x, y] of [[-10, 3], [9, -4], [2, 8]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
  } else {                                         // a spindle bomb: a twisted rock with pointed, curling ends
    ctx.fillStyle = '#3a2a24'; ctx.beginPath(); ctx.moveTo(-14, 2); ctx.quadraticCurveTo(-8, -9, 2, -7); ctx.quadraticCurveTo(12, -6, 14, -2); ctx.quadraticCurveTo(8, 9, -2, 7); ctx.quadraticCurveTo(-11, 7, -14, 2); ctx.fill(); volStroke(1.4);
    ctx.beginPath(); ctx.moveTo(-8, -5); ctx.quadraticCurveTo(-2, 0, -4, 6); ctx.moveTo(1, -7); ctx.quadraticCurveTo(6, 0, 3, 7); ctx.moveTo(8, -6); ctx.quadraticCurveTo(12, -1, 9, 4); lavaGlow(1.2);
  }
}
function drawVolcanoBomb(o, sy) {
  const s = o.r / 16;
  if (o.stone) { blit(sharedSprite('stone-' + o.stone, 36, 36, 18, 18, () => paintVolcStone(o.stone)), o.x, sy, o.rot * 0.4, s, s); return; }
  const glow = o.look === 'glowrock', magma = o.layer === 4;
  blit(sharedSprite('vbomb' + o.look + magma, 40, 40, 20, 20, () => {
    if (glow) {                                    // a red-hot rock, bright at its core (a dark crust in the magma layer, v129)
      ctx.fillStyle = 'rgba(255,120,30,.35)'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = magma ? '#2a1a14' : LAVA; ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(-8, -10); ctx.lineTo(4, -12); ctx.lineTo(12, -3); ctx.lineTo(9, 9); ctx.lineTo(-4, 12); ctx.closePath(); ctx.fill(); volStroke(1.3);
      ctx.fillStyle = LAVA_HOT; ctx.beginPath(); ctx.arc(1, 0, 5.5, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a lava bomb: a dark crusty blob, bright cracks, a hot trail underneath
      ctx.fillStyle = 'rgba(255,120,30,.4)'; ctx.beginPath(); ctx.ellipse(0, 8, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a2a24'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); volStroke(1.4);
      ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(-2, 0); ctx.lineTo(4, -8); ctx.moveTo(-2, 0); ctx.lineTo(2, 9); ctx.moveTo(4, 2); ctx.lineTo(11, 4); lavaGlow(1.8);
    }
  }), o.x, sy, o.rot, s, s);
}

// ---------- Drifting Swarm: cinder moths, fire beetles or little ash puffs, filling a 42-unit square ----------
function drawVolcanoFlyer(o, sy) {
  const col = o.volCol || '#8a6a5a', look = o.look || 'moth';
  blit(sharedSprite('vfly' + look + col, 48, 48, 24, 24, () => {
    if (look === 'beetle') {                       // a black beetle with glowing orange stripes, wings out
      ctx.fillStyle = 'rgba(255,210,170,.5)'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 11, -6, 10, 5, d * 0.4, 0, Math.PI * 2); ctx.fill(); volStroke(0.9); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 3, 10, 14, 0, 0, Math.PI * 2); ctx.fill(); volStroke(1.4);
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 16); ctx.moveTo(-6, -2); ctx.lineTo(-6, 10); ctx.moveTo(6, -2); ctx.lineTo(6, 10); lavaGlow(1.5);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -13, 5, 0, Math.PI * 2); ctx.fill(); volStroke(1.1);
      ctx.strokeStyle = VOL_LINE; ctx.lineWidth = 1.2; ctx.beginPath(); for (const d of [-1, 1]) { ctx.moveTo(d * 2, -16); ctx.lineTo(d * 7, -21); } ctx.stroke();
    } else if (look === 'ashpuff') {               // a little solid puff of ash, darker in the middle (never a hiding cloud)
      ctx.fillStyle = col;
      for (const [x, y, r] of [[-8, 4, 10], [6, 5, 11], [0, -5, 12], [-12, -3, 7], [12, -4, 7]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); for (const [x, y, r] of [[-8, 4, 10], [6, 5, 11], [0, -5, 12], [-12, -3, 7], [12, -4, 7]]) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
      volStroke(1.2);
      ctx.fillStyle = volShade(0.2); ctx.beginPath(); ctx.arc(0, 2, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = LAVA; for (const [x, y] of [[-4, 0], [5, 4], [1, -6]]) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a cinder moth: dusty wings with ember-orange eye spots
      ctx.fillStyle = col;
      for (const d of [-1, 1]) {
        ctx.beginPath(); ctx.ellipse(d * 10, -5, 11, 9, d * 0.5, 0, Math.PI * 2); ctx.fill(); volStroke(1.2);
        ctx.beginPath(); ctx.ellipse(d * 8, 9, 7, 7, -d * 0.4, 0, Math.PI * 2); ctx.fill(); volStroke(1.1);
        ctx.fillStyle = LAVA; ctx.beginPath(); ctx.arc(d * 11, -5, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = LAVA_HOT; ctx.beginPath(); ctx.arc(d * 11, -5, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col;
      }
      ctx.fillStyle = '#4a3a30'; ctx.beginPath(); ctx.ellipse(0, 2, 3.4, 13, 0, 0, Math.PI * 2); ctx.fill(); volStroke(1.1);
      ctx.strokeStyle = VOL_LINE; ctx.lineWidth = 1; ctx.beginPath(); for (const d of [-1, 1]) { ctx.moveTo(d, -10); ctx.quadraticCurveTo(d * 6, -18, d * 9, -16); } ctx.stroke();
    }
  }), o.x, sy, o.rot);
}

// ---------- Conveyor: a row of rolling lava rocks or a parade of fire beetles (34 x 12 each, like a clip) ----------
function drawVolcanoRoller(x, sy, dir, look = 'rollers') {
  blit(sharedSprite('vroll' + look + dir, 40, 16, 20, 8, () => {
    ctx.scale(dir, 1);
    if (look === 'beetles') {                      // a fire beetle walking, side view
      ctx.fillStyle = '#44444e'; ctx.beginPath(); ctx.ellipse(-2, -0.5, 12, 5, 0, Math.PI, 0); ctx.lineTo(10, 2); ctx.lineTo(-14, 2); ctx.closePath(); ctx.fill(); volStroke(1);
      ctx.beginPath(); ctx.moveTo(-12, -1); ctx.quadraticCurveTo(-2, -6, 8, -1); lavaGlow(1.2);
      ctx.fillStyle = '#44444e'; ctx.beginPath(); ctx.arc(12, -1, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#44444e'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const lx of [-9, -3, 3]) { ctx.moveTo(lx, 2); ctx.lineTo(lx - 2, 6); } ctx.moveTo(14, -3); ctx.lineTo(17, -6); ctx.stroke();
      ctx.fillStyle = LAVA_HOT; ctx.beginPath(); ctx.arc(13, -2, 0.9, 0, Math.PI * 2); ctx.fill();
    } else {                                       // an oval lava rock with a glowing crack
      ctx.fillStyle = '#54463c'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 5.8, 0, 0, Math.PI * 2); ctx.fill(); volStroke(1.1);
      ctx.beginPath(); ctx.moveTo(-12, 1); ctx.lineTo(-4, -2); ctx.lineTo(3, 2); ctx.lineTo(11, -1); lavaGlow(1.3);
    }
  }), x, sy);
}

// ---------- Spinning Drifter: a twisted spindle bomb or a spiky obsidian star, filling a 20-unit circle ----------
function drawVolcanoSpinner(o, sy) {
  const look = o.look || 'spindle';
  blit(sharedSprite('vspin' + look, 46, 46, 23, 23, () => {
    if (look === 'obsstar') {                      // a six-pointed star of black volcanic glass
      ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = i % 2 ? 8 : 19.5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath();
      ctx.fillStyle = '#16121c'; ctx.fill(); volStroke(2.2); ctx.strokeStyle = 'rgba(190,170,255,.7)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.strokeStyle = 'rgba(190,170,255,.55)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); } ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-4, -4, 1.8, 0, Math.PI * 2); ctx.fill();
    } else {                                       // a spindle bomb: long, twisted, glowing in its grooves
      ctx.fillStyle = '#3a2a24'; ctx.beginPath(); ctx.moveTo(-19.5, 0); ctx.quadraticCurveTo(-8, -10, 0, -9); ctx.quadraticCurveTo(10, -8, 19.5, 0); ctx.quadraticCurveTo(8, 10, 0, 9); ctx.quadraticCurveTo(-10, 8, -19.5, 0); ctx.fill(); volStroke(1.4);
      ctx.beginPath(); for (const x of [-10, -3, 4, 11]) { ctx.moveTo(x - 3, -7); ctx.quadraticCurveTo(x + 3, 0, x - 1, 7); } lavaGlow(1.4);
    }
  }), o.x, sy, o.rot);
}

// ---------- Spinning Blades: two long obsidian shards on a rock knob, spinning and scissoring ----------
function drawVolcanoShards(o, sy) {
  const col = o.volCol || '#1e1a24';
  const piece = sharedSprite('vshard' + col, 106, 26, 34, 13, () => {
    ctx.beginPath(); ctx.moveTo(-8, -3.5); ctx.lineTo(20, -4); ctx.lineTo(44, -2.5); ctx.lineTo(66, 0); ctx.lineTo(42, 3); ctx.lineTo(18, 4); ctx.lineTo(-8, 3.5); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); volStroke(2); ctx.strokeStyle = 'rgba(190,170,255,.6)'; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.strokeStyle = 'rgba(190,170,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, -1.5); ctx.lineTo(58, -0.5); ctx.stroke();
    ctx.fillStyle = volLight(0.6); ctx.beginPath(); ctx.ellipse(28, -2, 6, 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a4040'; ctx.beginPath(); ctx.arc(-21, 0, 9.5, 0, Math.PI * 2); ctx.fill(); volStroke(1.3);   // a rough rock knob
    ctx.beginPath(); ctx.moveTo(-26, -3); ctx.lineTo(-20, 1); ctx.lineTo(-15, -3); lavaGlow(1.2);
  });
  for (const s of [-1, 1]) blit(piece, o.x, sy, o.rot + s * o.open / 2);
  ctx.fillStyle = '#2a2420'; ctx.beginPath(); ctx.arc(o.x, sy, 3.2, 0, Math.PI * 2); ctx.fill(); volStroke(1);
}

// ---------- Sweeping Arm: a jet of steam or a spout of lava from a spinning vent ----------
function drawVolcanoJet(o, sy) {
  const hh = o.hh || 5, lava = o.look === 'lavaspout', t = time * 8;
  ctx.save();
  ctx.translate(o.x, sy); ctx.rotate(o.ang);
  if (lava) {                                      // a glowing stream, droplets at its end
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(o.L - hh, 0);
    ctx.strokeStyle = 'rgba(255,110,30,.4)'; ctx.lineWidth = hh * 2; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = LAVA; ctx.lineWidth = hh * 1.4; ctx.stroke();
    ctx.strokeStyle = LAVA_HOT; ctx.lineWidth = hh * 0.5; ctx.stroke();
  } else {                                         // puffs of steam along the jet, swelling and shrinking
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let x = 12; x <= o.L - hh; x += 8) { const r = hh * (0.7 + 0.3 * Math.sin(t + x * 0.3)); ctx.beginPath(); ctx.arc(x, 0, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = 'rgba(120,130,140,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(12, -hh); ctx.lineTo(o.L - hh, -hh); ctx.moveTo(12, hh); ctx.lineTo(o.L - hh, hh); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#3a302a'; ctx.beginPath(); ctx.arc(o.x, sy, 8.5, 0, Math.PI * 2); ctx.fill(); volStroke(1.5);   // the vent rock it spins on
  ctx.fillStyle = lava ? LAVA : '#1a1410'; ctx.beginPath(); ctx.arc(o.x, sy, 3.5, 0, Math.PI * 2); ctx.fill();
}

// ---------- Wall Piston: a tongue of lava squirting out of the wall, or a basalt column pushing out ----------
function drawVolcanoTongue(o, sy) {
  const h = CUTTER_HANDLE, e = o.ext, column = o.look === 'column';
  ctx.save();
  toolFrame(o, sy);
  if (e > 1) {
    const tip = h + e;
    if (column) {                                  // a six-sided column: faces and joints
      ctx.beginPath(); ctx.rect(h - 6, -6, e + 2, 12); ctx.fillStyle = '#4a4a54'; ctx.fill(); volStroke(1.2);
      ctx.fillStyle = volLight(0.12); ctx.fillRect(h - 6, -6, e + 2, 4);
      ctx.strokeStyle = volShade(0.45); ctx.lineWidth = 1; ctx.beginPath(); for (let x = h + 12; x < tip - 4; x += 16) { ctx.moveTo(x, -6); ctx.lineTo(x, 6); } ctx.stroke();
    } else {                                       // a glowing lava tongue with a rounded, darker-crusted tip
      ctx.beginPath(); ctx.moveTo(h - 6, -5); ctx.lineTo(tip - 6, -5.5); ctx.arc(tip - 6, 0, 5.5, -Math.PI / 2, Math.PI / 2); ctx.lineTo(h - 6, 5); ctx.closePath();
      ctx.fillStyle = 'rgba(255,110,30,.45)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(h - 6, -3.5); ctx.lineTo(tip - 6, -4); ctx.arc(tip - 6, 0, 4, -Math.PI / 2, Math.PI / 2); ctx.lineTo(h - 6, 3.5); ctx.closePath(); ctx.fillStyle = LAVA; ctx.fill();
      if (o.layer === 4) { ctx.beginPath(); ctx.moveTo(h - 6, -5.5); ctx.lineTo(tip - 6, -5.5); ctx.arc(tip - 6, 0, 5.5, -Math.PI / 2, Math.PI / 2); ctx.lineTo(h - 6, 5.5); volStroke(2.2); }   // a dark crust edge on the orange magma (v129)
      ctx.fillStyle = LAVA_HOT; ctx.fillRect(h - 6, -1.2, e - 4, 2.4);
      ctx.fillStyle = '#3a2a24'; ctx.beginPath(); ctx.arc(tip - 5, -2, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 4); ctx.fillStyle = '#3a3632'; ctx.fill();          // the rock it comes out of
  ctx.save(); ctx.clip(); ctx.fillStyle = volLight(0.1); ctx.fillRect(-6, -12, h + 6, 4); ctx.restore();
  ctx.beginPath(); roundRectPath(-6, -12, h + 6, 24, 4); volStroke(1.6);
  ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(22, -2); ctx.lineTo(16, 6); ctx.lineTo(30, 10); if (!column) lavaGlow(1.6); else { ctx.strokeStyle = volShade(0.4); ctx.lineWidth = 1.4; ctx.stroke(); }
  ctx.fillStyle = column ? '#1a1410' : '#2a1410'; ctx.fillRect(h - 4, -6, 4, 12);
  if (!column) { ctx.fillStyle = 'rgba(255,120,40,.6)'; ctx.fillRect(h - 3, -4, 3, 8); }
  ctx.restore();
}

// ---------- Wall Turret: a rocky vent firing lava blobs, or a cartoon lava frog spitting sparks ----------
// the vent's mouth (or the frog's cheeks) glows bright just before each shot
function drawVolcanoVent(o, sy) {
  const dir = inward(o), frog = o.look === 'lavafrog', col = o.volCol || '#3a302a';
  for (const b of o.blobs) {
    if (frog) {                                    // little four-pointed sparks
      ctx.save(); ctx.translate(b.x, sy); ctx.rotate(b.wob * 0.4);
      ctx.fillStyle = LAVA_HOT; ctx.beginPath();
      for (let i = 0; i < 8; i++) { const r = i % 2 ? b.r * 0.35 : b.r * 0.95, a = i / 8 * Math.PI * 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = LAVA; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
    } else {                                       // a blob of lava with a dark crust bit and a trail
      ctx.fillStyle = 'rgba(255,110,30,.35)'; ctx.beginPath(); ctx.ellipse(b.x - dir * b.r, sy, b.r * 1.7, b.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = LAVA; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = LAVA_HOT; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a2a24'; ctx.beginPath(); ctx.arc(b.x + b.r * 0.3, sy - b.r * 0.4, b.r * 0.25, 0, Math.PI * 2); ctx.fill();
    }
  }
  const head = sharedSprite('vvent' + o.look + dir + col, 170, 50, 85, 25, () => {
    ctx.scale(dir, 1);
    if (frog) {                                    // a red-orange frog with glowing spots on a rock ledge
      ctx.fillStyle = '#3a3632'; ctx.beginPath(); roundRectPath(-4, 4, 66, 7, 3); ctx.fill(); volStroke(1.2);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(34, -1, 22, 9, 0, 0, Math.PI * 2); ctx.fill(); volStroke(1.4);
      for (const x of [28, 42]) { ctx.beginPath(); ctx.arc(x, -8, 4.5, 0, Math.PI * 2); ctx.fill(); volStroke(1.1); ctx.fillStyle = LAVA_HOT; ctx.beginPath(); ctx.arc(x + 0.8, -8, 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = col; }
      ctx.fillStyle = LAVA_HOT; for (const [x, y] of [[20, 0], [30, 3], [38, -2], [46, 2]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = col; ctx.beginPath(); roundRectPath(56, -3, 22, 6, 3); ctx.fill(); volStroke(1.1);
    } else {                                       // a rough rocky cone lying along the wall, its mouth toward the middle
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-4, -11); ctx.lineTo(30, -11); ctx.quadraticCurveTo(52, -9, 62, -5); ctx.lineTo(78, -4); ctx.lineTo(78, 4); ctx.lineTo(62, 5); ctx.quadraticCurveTo(52, 9, 30, 11); ctx.lineTo(-4, 11); ctx.closePath(); ctx.fill(); volStroke(1.5);
      ctx.fillStyle = volLight(0.1); ctx.fillRect(-4, -11, 50, 4);
      ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(18, 2); ctx.lineTo(28, 6); ctx.lineTo(40, -2); lavaGlow(1.5);
      ctx.fillStyle = '#2a1410'; ctx.beginPath(); ctx.ellipse(76, 0, 2, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    const flick = Math.floor(o.timer * 20) % 2;
    ctx.fillStyle = flick ? LAVA : LAVA_HOT;
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 78, sy, 4.5, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Charged Beam: volcanic lightning from a charged rock spire, or a jet of superheated steam ----------
function drawVolcanoLightning(o, sy) {
  const x0 = ZAP_BODY, L = o.len, steam = o.look === 'steambeam';
  ctx.save();
  toolFrame(o, sy);
  if (o.phase === 'charge') {
    ctx.save();
    ctx.strokeStyle = steam ? '#c8d0d8' : '#9ab8ff'; ctx.globalAlpha = 0.3 + 0.6 * Math.min(1, o.t / 0.7); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + L, 0); ctx.stroke();
    ctx.restore();
    if (!steam) { ctx.strokeStyle = '#d8e8ff'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = rand(-1, 1); ctx.moveTo(x0 - 4, 0); ctx.lineTo(x0 - 4 + Math.cos(a) * 9, Math.sin(a) * 9); } ctx.stroke(); }
  } else if (o.phase === 'zap') {
    if (steam) {                                   // a straight white jet with puffs along its edges
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x0, -6, L, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x0, -2.5, L, 5);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let x = x0 + 8; x < x0 + L; x += 12) { ctx.beginPath(); ctx.arc(x, (x % 24) < 12 ? -4 : 4, 3, 0, Math.PI * 2); ctx.fill(); }
    } else {                                       // a jagged bolt
      const pts = []; for (let x = x0; x < x0 + L; x += 10) pts.push([x, x === x0 ? 0 : rand(-5, 5)]); pts.push([x0 + L, 0]);
      const bolt = () => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      bolt(); ctx.strokeStyle = 'rgba(160,190,255,.4)'; ctx.lineWidth = 9; ctx.stroke();
      bolt(); ctx.strokeStyle = '#d8e8ff'; ctx.lineWidth = 3.4; ctx.stroke();
      bolt(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
    }
  }
  ctx.beginPath(); roundRectPath(-6, -9, x0 + 2, 18, 4); ctx.fillStyle = '#3a3632'; ctx.fill(); volStroke(1.4);
  if (steam) {                                     // a cracked pipe-like vent in the rock
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.ellipse(x0 - 5, 0, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(x0 - 2, -2, 3, 0, Math.PI * 2); ctx.fill();
  } else {                                         // a dark rock spire, its tip crackling blue when charged
    ctx.fillStyle = '#4a4a54'; ctx.beginPath(); ctx.moveTo(x0 - 30, -7); ctx.lineTo(x0, 0); ctx.lineTo(x0 - 30, 7); ctx.closePath(); ctx.fill(); volStroke(1.2);
    ctx.fillStyle = o.phase === 'rest' ? '#5a5a64' : '#d8e8ff'; ctx.beginPath(); ctx.arc(x0 - 4, 0, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- Telegraphed Sweep: a wave of lava splashing out, or a toppling basalt pillar, after a dashed wedge ----------
function drawVolcanoWave(o, sy) {
  const pillar = o.look === 'pillar';
  ctx.save();
  toolFrame(o, sy);
  ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.ellipse(2, 0, 7, 16, 0, 0, Math.PI * 2); ctx.fill();   // an opening in the wall
  if (!pillar) { ctx.fillStyle = 'rgba(255,120,40,.6)'; ctx.beginPath(); ctx.ellipse(2, 0, 4, 11, 0, 0, Math.PI * 2); ctx.fill(); }
  if (o.phase === 'warn') {
    const k = Math.min(1, o.t / o.warn);
    ctx.save();
    ctx.strokeStyle = pillar ? '#8a8a94' : LAVA; ctx.globalAlpha = 0.35 + 0.55 * k; ctx.lineWidth = 2.2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.L + 20, -PAW_SWEEP, PAW_SWEEP); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  if (o.ext > 0) {
    const len = o.L * o.ext;
    ctx.rotate(o.ang);
    if (pillar) {                                  // a basalt column: faces, joints and a six-sided end
      ctx.beginPath(); ctx.rect(-6, -9, len - 8, 18); ctx.fillStyle = '#4a4a54'; ctx.fill(); volStroke(1.3);
      ctx.fillStyle = volLight(0.12); ctx.fillRect(-6, -9, len - 8, 5);
      ctx.strokeStyle = volShade(0.45); ctx.lineWidth = 1; ctx.beginPath(); for (let x = 20; x < len - 14; x += 22) { ctx.moveTo(x, -9); ctx.lineTo(x + 2, 9); } ctx.stroke();
      hexPath(len, 0, 16); ctx.fillStyle = '#5a5a64'; ctx.fill(); volStroke(1.4);
      hexPath(len, 0, 9); ctx.strokeStyle = volLight(0.2); ctx.lineWidth = 1; ctx.stroke();
    } else {                                       // a thick glowing band curling into a splash at the tip
      const wy = x => Math.sin(x * 0.08 + o.t * 8) * 2.5;
      const band = () => { ctx.beginPath(); for (let x = -8; x <= len - 10; x += 6) (x === -8 ? ctx.moveTo(x, wy(x)) : ctx.lineTo(x, wy(x))); };
      ctx.lineCap = 'round';
      band(); ctx.strokeStyle = VOL_LINE; ctx.lineWidth = 21; ctx.stroke();
      band(); ctx.strokeStyle = LAVA; ctx.lineWidth = 18; ctx.stroke();
      band(); ctx.strokeStyle = LAVA_HOT; ctx.lineWidth = 6; ctx.stroke();
      ctx.translate(len, 0);
      ctx.fillStyle = LAVA; ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = i % 2 ? 11 : 16; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); volStroke(1.3);
      ctx.fillStyle = LAVA_HOT; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// ---------- Proximity Blast: a bubbling mud pot that pops, or a gas pocket that bursts in a yellow puff ----------
function drawVolcanoMud(o, sy) {
  const gas = o.look === 'gaspocket';
  if (o.phase === 'boom' || o.phase === 'gone') {
    const t = o.phase === 'boom' ? o.t : 0.35 + o.t;
    if (t > 0.65) return;
    const r = o.blast * Math.min(1, t / 0.12), fade = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.3;
    ctx.save();
    ctx.globalAlpha = 0.35 * fade; ctx.fillStyle = gas ? '#e0d040' : '#8a6a4a'; ctx.beginPath(); ctx.arc(o.x, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = fade; ctx.strokeStyle = gas ? '#a8a020' : '#5a4030'; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4, d = r * (0.3 + 0.6 * ((i * 37) % 10) / 10);
      ctx.fillStyle = gas ? '#fff6a0' : '#6a4a34'; ctx.beginPath(); ctx.arc(o.x + Math.cos(a) * d, sy + Math.sin(a) * d, gas ? 3 : 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }
  const blink = o.phase === 'blink';
  if (blink) {
    ctx.save();
    ctx.strokeStyle = gas ? '#c8c040' : '#8a6a4a'; ctx.globalAlpha = 0.35 + 0.5 * Math.min(1, o.t / 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(o.x, sy, o.blast, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  const swell = blink ? 1 + 0.1 * Math.sin(o.t * 40) : 1;
  blit(sharedSprite('vmud' + gas, 40, 40, 20, 20, () => {
    if (gas) {                                     // a yellow-green sac bulging out of a rock
      ctx.fillStyle = '#3a3632'; ctx.beginPath(); ctx.ellipse(0, 8, 14, 6, 0, 0, Math.PI * 2); ctx.fill(); volStroke(1.2);
      ctx.fillStyle = '#c8c040'; ctx.beginPath(); ctx.arc(0, -2, 12, 0, Math.PI * 2); ctx.fill(); volStroke(1.4);
      ctx.fillStyle = 'rgba(255,255,200,.6)'; ctx.beginPath(); ctx.ellipse(-4, -6, 4, 2.5, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(120,110,20,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(2, 0, 6, 0.5, 2.5); ctx.stroke();
    } else {                                       // a pool of grey-brown mud with a big bubble on top
      ctx.fillStyle = '#5a4030'; ctx.beginPath(); ctx.ellipse(0, 4, 15, 9, 0, 0, Math.PI * 2); ctx.fill(); volStroke(1.4);
      ctx.fillStyle = '#8a6a5a'; ctx.beginPath(); ctx.ellipse(0, 3, 12, 6.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9a7a6a'; ctx.beginPath(); ctx.arc(2, -3, 7, Math.PI, 0); ctx.fill(); volStroke(1.2);
      ctx.fillStyle = volLight(0.5); ctx.beginPath(); ctx.arc(0, -6, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }), o.x, sy, 0, swell, swell);
}

// ---------- Push Zone (before 700 m only): a gust of ash wind, grey streaks and flakes; nothing solid ----------
function drawVolcanoGust(o, sy) {
  const dir = -o.side;
  ctx.save();
  ctx.strokeStyle = 'rgba(70,64,58,.6)'; ctx.fillStyle = 'rgba(60,55,50,.7)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  for (let k = 0; k < 7; k++) {
    const yy = sy - o.band / 2 + (k + 0.5) * o.band / 7;
    const run = (o.t * 180 + k * 63) % (W + 60);
    const x0 = dir > 0 ? run - 30 : W - run + 30;
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + dir * 20, yy - 4, x0 + dir * 40, yy); ctx.stroke();
    ctx.fillRect(x0 + dir * 48, yy - 1, 2.6, 2.6); ctx.fillRect(x0 + dir * 56, yy + 2, 2, 2);
  }
  ctx.restore();
}

// ---------- Effect Zone: a column of steam rising from a vent, slowing the fall (never hurts) ----------
function drawVolcanoSteam(o, sy) {
  const x0 = o.x - o.w / 2, y0 = sy - o.h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x0, y0, o.w, o.h);
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]); ctx.strokeRect(x0, y0, o.w, o.h); ctx.setLineDash([]);
  ctx.fillStyle = '#ffffff';
  for (let k = 0; k < 9; k++) {                    // puffs rising up the column
    const ph = (o.t * 0.5 + k / 9) % 1;
    ctx.globalAlpha = Math.min(1, Math.min(ph, 1 - ph) * 5) * 0.55;
    ctx.beginPath(); ctx.arc(o.x + Math.sin(k * 2.1 + o.t * 1.5) * o.w * 0.22, y0 + o.h - ph * o.h, 5 + (k % 3) * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- Spring Line: a strand of rope lava (cooled, rope-like lava) or a jungle vine, between two rock knobs ----------
// the strand bounces the plane away; the knobs hurt
function drawVolcanoRope(o, sy) {
  const dy1 = o.y1 - o.y, dy2 = o.y2 - o.y, vine = o.look === 'vine';
  const len = Math.hypot(o.x2 - o.x1, o.y2 - o.y1), nx = -(o.y2 - o.y1) / len, ny = (o.x2 - o.x1) / len;
  const k = clamp((o.hitX - o.x1) / (o.x2 - o.x1), 0.1, 0.9);
  const bend = Math.sin(o.t * 32) * o.wob * 14;
  const cx = o.x1 + (o.x2 - o.x1) * k + nx * bend, cy = sy + dy1 + (dy2 - dy1) * k + ny * bend + 5;
  ctx.save();
  ctx.lineCap = 'round';
  const strand = () => { ctx.beginPath(); ctx.moveTo(o.x1, sy + dy1); ctx.quadraticCurveTo(cx, cy, o.x2, sy + dy2); };
  if (vine) {
    strand(); ctx.strokeStyle = VOL_LINE; ctx.lineWidth = 5; ctx.stroke();
    strand(); ctx.strokeStyle = o.volCol || '#4f8a3a'; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 1; i < 6; i++) {
      const t = i / 6, x = (1 - t) * (1 - t) * o.x1 + 2 * t * (1 - t) * cx + t * t * o.x2, y = (1 - t) * (1 - t) * (sy + dy1) + 2 * t * (1 - t) * cy + t * t * (sy + dy2);
      ctx.fillStyle = '#5fae4a'; ctx.beginPath(); ctx.ellipse(x, y + 4, 4, 2.2, i % 2 ? 0.6 : -0.6, 0, Math.PI * 2); ctx.fill();
    }
  } else {                                         // dark twisted strands with a warm glow between them
    strand(); ctx.strokeStyle = 'rgba(255,110,30,.5)'; ctx.lineWidth = 6; ctx.stroke();
    strand(); ctx.strokeStyle = '#3a2a24'; ctx.lineWidth = 3.6; ctx.stroke();
    strand(); ctx.strokeStyle = 'rgba(255,150,60,.8)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
  const knob = sharedSprite('vknob', 24, 24, 12, 12, () => {
    ctx.fillStyle = '#3a3632'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill(); volStroke(1.4);
    ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(0, 1); ctx.lineTo(4, -2); lavaGlow(1.3);
  });
  blit(knob, o.x1, sy + dy1); blit(knob, o.x2, sy + dy2);
}

// ---------- Looks added in v129 ----------
// Drifting Swarm: a little cloud of glowing embers drifting down, in the 42-unit square (instead of only critters)
function drawEmbers(o, sy) {
  const t = time + (o.ph || 0);
  ctx.save();
  ctx.translate(o.x, sy);
  ctx.fillStyle = 'rgba(60,40,30,.35)'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();   // a puff of dark smoke holding them
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); volStroke(1.2);
  for (let k = 0; k < 9; k++) {
    const a = k * 2.4 + t * 0.6, d = 4 + (k % 4) * 4, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.9;
    const glow = 0.6 + 0.4 * Math.sin(t * 7 + k);
    ctx.fillStyle = `rgba(255,140,40,${0.45 * glow})`; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = k % 3 ? LAVA : LAVA_HOT; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Wall Turret: a fumarole, a crusty yellow-grey vent in the wall puffing hot steam balls; it hisses (glows) before each one
function drawFumarole(o, sy) {
  const dir = inward(o), col = o.volCol || '#b8a878';
  for (const b of o.blobs) {                       // steam balls with a hot core
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(b.x - dir * b.r * 0.6, sy, b.r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4f0e8'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.9, 0, Math.PI * 2); ctx.fill(); volStroke(1);
    ctx.fillStyle = 'rgba(255,170,90,.6)'; ctx.beginPath(); ctx.arc(b.x, sy, b.r * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  const head = sharedSprite('fumarole' + dir + col, 170, 50, 85, 25, () => {
    ctx.scale(dir, 1);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-4, -11); ctx.quadraticCurveTo(30, -13, 58, -7); ctx.lineTo(78, -4); ctx.lineTo(78, 4); ctx.lineTo(58, 7); ctx.quadraticCurveTo(30, 13, -4, 11); ctx.closePath(); ctx.fill(); volStroke(1.5);
    ctx.fillStyle = '#e8d040'; for (const [x, y, r] of [[14, -5, 3], [26, 4, 3.5], [40, -3, 2.6], [52, 3, 2.4], [62, -2, 2]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }   // sulfur crust
    ctx.fillStyle = '#2a2018'; ctx.beginPath(); ctx.ellipse(76, 0, 2, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  });
  blit(head, wallX(o), sy);
  if (o.timer < 0.35 && o.y - dist < H) {
    ctx.fillStyle = Math.floor(o.timer * 20) % 2 ? '#ffffff' : LAVA_HOT;
    ctx.beginPath(); ctx.arc(wallX(o) + dir * 78, sy, 4.5, 0, Math.PI * 2); ctx.fill();
  }
}
