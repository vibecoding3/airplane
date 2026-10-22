// Paper Nosedive — Collections: sets of special obstacles you unlock by seeing them in a run, and the menu to view them.
'use strict';

// An item is found the first time it appears on screen during a run (even if you then crash into it). Found items
// are saved per device; locked ones show as a black silhouette in the menu. Completing a set gives no reward.
const ringName = d => d[0].toUpperCase() + d.slice(1) + ' ring';
const COLLECTIONS = [
  // the staffs keep their pre-v111 save ids (COLLECTIBLE_LOOKS in obstacles.js), so items already found stay found
  { id: 'staffs', name: 'Mage staffs', map: 'Dungeon', bg: '#3d3631', items: [
    { id: COLLECTIBLE_LOOKS.crescent, name: 'Crescent staff', slider: 'crescent' },
    { id: COLLECTIBLE_LOOKS.twisted, name: 'Twisted staff', slider: 'twisted' }
  ] },
  { id: 'rings', name: 'Enchanted rings', map: 'Dungeon', bg: '#3d3631', items: DUNGEON_SOLO.rings.cols.map(d => ({ id: 'ring-' + d, name: ringName(d), ring: d })) },
  { id: 'swords', name: 'Legendary swords', map: 'Dungeon', bg: '#3d3631',
    items: SWORDS.map(n => ({ id: 'sword-' + n, name: { flame: 'Flame sword', frost: 'Frost blade', crystal: 'Crystal sword', scimitar: 'Desert scimitar', rune: 'Rune blade', bone: 'Bone sword' }[n], sword: n })) },
  { id: 'origami', name: 'Origami', map: 'Paper', bg: '#fbf9f1',
    items: ORIGAMI.map(n => ({ id: 'origami-' + n, name: n[0].toUpperCase() + n.slice(1), origami: n })) },
  { id: 'shells', name: 'Seashells', map: 'Ocean', bg: '#3f92c0',
    items: SHELLS.map(n => ({ id: 'shell-' + n, name: { sanddollar: 'Sand dollar', pearl: 'Pearl oyster' }[n] || n[0].toUpperCase() + n.slice(1), shell: n })) },
  { id: 'treasures', name: 'Sunken treasures', map: 'Ocean', bg: '#2a4a6a',
    items: TREASURES.map(n => ({ id: 'treasure-' + n, name: TREASURE_NAMES[n], treasure: n })) },
  { id: 'fish', name: 'Legendary fish', map: 'Ocean', bg: '#3f92c0',
    items: LEGEND_FISH.map(n => ({ id: 'fish-' + n, name: { golden: 'Golden fish', narwhal: 'Narwhal', coelacanth: 'Coelacanth', squideye: 'Giant squid eye', ghostshark: 'Ghost shark' }[n], fish: n })) },
  { id: 'neonsigns', name: 'Neon signs', map: 'Neon City', bg: '#1a1530',
    items: NEON_SIGNS.map(n => ({ id: 'neon-' + n, name: NEON_ICONS[n].name, neon: n })) },
  { id: 'birds', name: 'Forest birds', map: 'Forest', bg: '#9fcf78',
    items: FOREST_BIRDS.map(n => ({ id: 'bird-' + n, name: BIRD_LOOKS[n].name, bird: n })) },
  { id: 'fossils', name: 'Fossils', map: 'Desert', bg: '#e0a060',
    items: FOSSILS.map(n => ({ id: 'fossil-' + n, name: FOSSIL_NAMES[n], fossil: n })) },
  { id: 'stones', name: 'Volcanic stones', map: 'Volcano', bg: '#5a4a44',
    items: VOLC_STONES.map(n => ({ id: 'stone-' + n, name: STONE_NAMES[n], stone: n })) },
  { id: 'ores', name: 'Minecraft minerals', map: 'Volcano', bg: '#5a4a44',     // ids stay ore-* (ores in v148–v149)
    items: VOLC_MINERALS.map(n => ({ id: 'ore-' + n, name: MINERAL_NAMES[n], mineral: n })) },
  { id: 'pastries', name: 'Pastries', map: 'Kitchen', bg: '#f4d8b0',
    items: PASTRIES.map(n => ({ id: 'pastry-' + n, name: PASTRY_NAMES[n], pastry: n })) },
  { id: 'planets', name: 'Planets', map: 'Space', bg: '#141a3a',
    items: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(n => ({ id: 'planet-' + n, name: n[0].toUpperCase() + n.slice(1), planet: n })) }
];
const COLLECTION_TOTAL = COLLECTIONS.reduce((n, set) => n + set.items.length, 0);
let collectionFound;
try { collectionFound = new Set(JSON.parse(store.get('nosedive-collection') || '[]')); } catch (e) { collectionFound = new Set(); }

// the collection item id an obstacle shows, or null for a regular obstacle
function collectionId(o) {
  return o.type === 'pencil' && COLLECTIBLE_LOOKS[o.look] ? COLLECTIBLE_LOOKS[o.look]
       : o.look === 'ring' ? 'ring-' + o.dunCol
       : o.look === 'planet' ? 'planet-' + o.planet
       : o.origami ? 'origami-' + o.origami
       : o.shell ? 'shell-' + o.shell
       : o.sword ? 'sword-' + o.sword
       : o.fish ? 'fish-' + o.fish
       : o.neonSign ? 'neon-' + o.neonSign
       : o.bird ? 'bird-' + o.bird
       : o.fossil ? 'fossil-' + o.fossil
       : o.stone ? 'stone-' + o.stone
       : o.mineral ? 'ore-' + o.mineral
       : o.pastry ? 'pastry-' + o.pastry
       : o.treasure ? 'treasure-' + o.treasure : null;
}

// called for every obstacle drawn during a run (render.js)
function noteFound(o, sy) {
  if (state !== 'play' || sy < 0 || sy > H) return;
  const id = collectionId(o);
  if (!id || collectionFound.has(id)) return;
  collectionFound.add(id);
  store.set('nosedive-collection', JSON.stringify([...collectionFound]));
}

// Shiny collectibles: every collection item in a run gets a soft golden glow behind it and white star twinkles
// popping around it, so it stands out like a rare find. Purely visual: hit boxes don't change.
// Where to glow: a centre, a radius, and for long sliders (the staffs) the bar's angle and half-length.
function shinyArea(o, sy) {
  switch (o.type) {
    case 'protractor': return { x: o.side < 0 ? 0 : W, y: sy, r: o.r, side: o.side };   // planets, neon signs: the half on screen
    case 'pencil': return { x: o.x, y: sy, r: 14, a: o.a, half: o.len / 2 };
    case 'scissors': return { x: o.x, y: sy, r: 52 };
    case 'starfish': return { x: o.x, y: sy, r: 24 };
    case 'note': return { x: o.x, y: sy, r: 24 };
    default: return { x: o.x, y: sy, r: (o.r || 18) + 4 };
  }
}
// a point around the item for twinkle k, picked fresh each time the twinkle restarts
function shinyPoint(s, seed) {
  const h = n => { const v = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return v - Math.floor(v); };
  if (s.half) {                                    // along the staff, a little to either side
    const t = (h(1) * 2 - 1) * s.half, off = (h(2) * 2 - 1) * 12;
    return [s.x + Math.cos(s.a) * t - Math.sin(s.a) * off, s.y + Math.sin(s.a) * t + Math.cos(s.a) * off];
  }
  let ang = h(1) * Math.PI * 2;
  if (s.side) ang = (h(1) - 0.5) * Math.PI * 0.9 + (s.side < 0 ? 0 : Math.PI);   // only on the visible half of a bulge
  const d = s.r * (0.45 + 0.75 * h(2));
  return [s.x + Math.cos(ang) * d, s.y + Math.sin(ang) * d];
}
// behind the item: a pulsing golden halo
function drawShinyGlow(o, sy) {
  const s = shinyArea(o, sy), pulse = 0.8 + 0.2 * Math.sin(time * 4);
  const R = s.r * 1.55 + 10;
  ctx.save();
  ctx.translate(s.x, s.y);
  if (s.half) { ctx.rotate(s.a); ctx.scale((s.half + 16) / R, 1); }
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  g.addColorStop(0, `rgba(255,248,190,${0.55 * pulse})`);
  g.addColorStop(0.55, `rgba(255,214,90,${0.3 * pulse})`);
  g.addColorStop(1, 'rgba(255,200,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// in front of the item: four-pointed stars that pop in, twinkle and fade, each at a new spot every time
function drawShinySparkles(o, sy) {
  const s = shinyArea(o, sy);
  if (o.shinySeed == null) o.shinySeed = Math.random() * 100;
  const n = s.half ? 8 : s.r > 40 ? 10 : 6, period = 0.9;
  for (let k = 0; k < n; k++) {
    const ph = time / period + k / n + o.shinySeed, cycle = Math.floor(ph), t = ph - cycle;
    if (t > 0.6) continue;                         // a short rest between twinkles
    const [x, y] = shinyPoint(s, o.shinySeed + k * 17.3 + cycle * 5.1);
    const size = Math.sin(t / 0.6 * Math.PI) * (k % 3 ? 7 : 11);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(t * 1.2);
    ctx.fillStyle = 'rgba(255,230,120,.55)';       // a soft gold rim, then the white star
    starburst(size * 1.35, size * 0.35);
    ctx.fillStyle = '#ffffff';
    starburst(size, size * 0.22);
    ctx.restore();
  }
}
function starburst(R, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 - Math.PI / 2, d = i % 2 ? r : R; ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); }
  ctx.closePath(); ctx.fill();
}

// draws an item into a canvas with the game's own art (or as a black silhouette while it is locked)
function paintCollectionItem(canvas, item, locked, wide) {
  const g = canvas.getContext('2d'), Wc = canvas.width, Hc = canvas.height, screen = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, Wc, Hc);
  ctx = g;                                          // the paint helpers all draw into ctx
  try {
    if (item.ring) {
      const k = Hc / 40; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintRing(item.ring);
    } else if (item.sword) {                        // one sword, on the diagonal in a tile, flat in the large view
      const k = wide ? Wc / 110 : Wc / 80; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      if (!wide) g.rotate(-Math.PI / 4);
      g.translate(-22, 0);
      paintLegendarySword(item.sword);
    } else if (item.fish) {
      const k = Hc / 54; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintLegendFish(item.fish);
    } else if (item.shell) {
      const k = Hc / 50; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintShell(item.shell);
    } else if (item.origami) {
      const k = Hc / 52; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintOrigami(item.origami);
    } else if (item.fossil) {
      const k = Hc / 50; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintFossil(item.fossil);
    } else if (item.treasure) {
      const k = Hc / 50; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintTreasure(item.treasure);
    } else if (item.pastry) {
      const k = Hc / 50; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintPastry(item.pastry);
    } else if (item.mineral) {
      const k = Hc / 50; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintMineral(item.mineral);
    } else if (item.stone) {
      const k = Hc / 40; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintVolcStone(item.stone);
    } else if (item.bird) {
      const k = Hc / 50; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintForestBird(item.bird);
    } else if (item.neon) {                         // a whole round sign with its icon in the middle
      const k = Hc / 52; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintNeonSign(item.neon, 22);
    } else if (item.planet) {                       // every planet drawn the same size; Saturn smaller so its ring fits
      const ring = !!PLANETS[item.planet].ring, k = Math.min(Hc * (ring ? 0.34 : 0.4), Wc * (ring ? 0.25 : 0.4)) / 50;
      g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      paintPlanetFull(item.planet, 50);
    } else {
      const k = wide ? Wc / 180 : Wc / 125; g.setTransform(k, 0, 0, k, Wc / 2, Hc / 2);
      if (!wide) g.rotate(-Math.PI / 4);             // a long staff fits a square tile on the diagonal
      paintSlider({ look: item.slider, dunCol: DUNGEON_LOOKS.pencil[item.slider][0], len: 150 });
    }
  } finally { ctx = screen; }
  if (locked) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#1f1a17'; g.fillRect(0, 0, Wc, Hc);
    g.globalCompositeOperation = 'source-over';
  }
}

// every set as a grid of items, each with its name underneath (v152; until v151 a found item could be tapped to show
// it large at the top). Items not found yet show a dark silhouette and their name greyed, so players know what to look for.
function renderCollections() {
  const box = $('collSets');
  box.replaceChildren();
  for (const set of COLLECTIONS) {
    const n = set.items.filter(it => collectionFound.has(it.id)).length;
    const sec = document.createElement('section'); sec.className = 'coll-set';
    const h = document.createElement('h3');
    h.innerHTML = `<span></span><small></small><b>${n} / ${set.items.length}</b>`;
    h.children[0].textContent = set.name; h.children[1].textContent = set.map;
    const grid = document.createElement('div'); grid.className = 'coll-grid';
    for (const item of set.items) {
      const found = collectionFound.has(item.id);
      const fig = document.createElement('figure');
      fig.className = 'coll-item' + (found ? '' : ' locked');
      fig.title = found ? item.name : item.name + ' (not found yet)';
      const pic = document.createElement('div'); pic.className = 'coll-pic';
      if (found) pic.style.background = set.bg;
      const c = document.createElement('canvas'); c.width = 128; c.height = 128;
      c.setAttribute('aria-hidden', 'true');
      paintCollectionItem(c, item, !found);
      pic.append(c);
      const cap = document.createElement('figcaption'); cap.textContent = item.name;
      if (!found) { const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = ' (not found yet)'; cap.append(sr); }
      fig.append(pic, cap);
      grid.append(fig);
    }
    sec.append(h, grid);
    box.append(sec);
  }
}
// the Collections button sits on the start and game-over screens; Back returns to whichever opened it
function syncCollectionButton() {
  for (const b of document.querySelectorAll('.coll-open')) b.textContent = 'Collections';   // no count on the button (v105)
}
let collFrom = 'title';
function openCollections() { collFrom = 'title'; renderCollections(); showCard('coll'); }
function closeCollections() { showCard(collFrom); }

for (const b of document.querySelectorAll('.coll-open')) b.addEventListener('click', openCollections);
$('collBack').addEventListener('click', closeCollections);
syncCollectionButton();
