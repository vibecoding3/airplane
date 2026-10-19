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
  { id: 'fish', name: 'Legendary fish', map: 'Ocean', bg: '#3f92c0',
    items: LEGEND_FISH.map(n => ({ id: 'fish-' + n, name: { golden: 'Golden fish', narwhal: 'Narwhal', coelacanth: 'Coelacanth', squideye: 'Giant squid eye', ghostshark: 'Ghost shark' }[n], fish: n })) },
  { id: 'neonsigns', name: 'Neon signs', map: 'Neon City', bg: '#1a1530',
    items: NEON_SIGNS.map(n => ({ id: 'neon-' + n, name: NEON_ICONS[n].name, neon: n })) },
  { id: 'birds', name: 'Forest birds', map: 'Forest', bg: '#9fcf78',
    items: FOREST_BIRDS.map(n => ({ id: 'bird-' + n, name: BIRD_LOOKS[n].name, bird: n })) },
  { id: 'fossils', name: 'Fossils', map: 'Desert', bg: '#e0a060',
    items: FOSSILS.map(n => ({ id: 'fossil-' + n, name: FOSSIL_NAMES[n], fossil: n })) },
  { id: 'planets', name: 'Planets', map: 'Space', bg: '#141a3a',
    items: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(n => ({ id: 'planet-' + n, name: n[0].toUpperCase() + n.slice(1), planet: n })) }
];
const COLLECTION_TOTAL = COLLECTIONS.reduce((n, set) => n + set.items.length, 0);
let collectionFound;
try { collectionFound = new Set(JSON.parse(store.get('nosedive-collection') || '[]')); } catch (e) { collectionFound = new Set(); }

// called for every obstacle drawn during a run (render.js)
function noteFound(o, sy) {
  if (state !== 'play' || sy < 0 || sy > H) return;
  const id = o.type === 'pencil' && COLLECTIBLE_LOOKS[o.look] ? COLLECTIBLE_LOOKS[o.look]
           : o.look === 'ring' ? 'ring-' + o.dunCol
           : o.look === 'planet' ? 'planet-' + o.planet
           : o.origami ? 'origami-' + o.origami
           : o.shell ? 'shell-' + o.shell
           : o.sword ? 'sword-' + o.sword
           : o.fish ? 'fish-' + o.fish
           : o.neonSign ? 'neon-' + o.neonSign
           : o.bird ? 'bird-' + o.bird
           : o.fossil ? 'fossil-' + o.fossil : null;
  if (!id || collectionFound.has(id)) return;
  collectionFound.add(id);
  store.set('nosedive-collection', JSON.stringify([...collectionFound]));
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

let collPick = null;                                // the found item shown large at the top, if any
function renderCollections() {
  const box = $('collSets');
  box.replaceChildren();
  if (collPick) {
    const d = document.createElement('div'); d.className = 'coll-detail';
    d.style.background = collPick.set.bg; d.style.color = ['origami', 'birds', 'fossils'].includes(collPick.set.id) ? '#22356b' : '#ffffff';
    const c = document.createElement('canvas'); c.width = 560; c.height = collPick.item.slider || collPick.item.sword ? 140 : 240;   // staffs are long and thin
    paintCollectionItem(c, collPick.item, false, true);
    const name = document.createElement('div'); name.className = 'coll-name'; name.textContent = collPick.item.name;
    const set = document.createElement('div'); set.className = 'coll-setname'; set.textContent = collPick.set.name + ' collection';
    d.append(c, name, set);
    box.append(d);
  }
  for (const set of COLLECTIONS) {
    const n = set.items.filter(it => collectionFound.has(it.id)).length;
    const sec = document.createElement('section'); sec.className = 'coll-set';
    const h = document.createElement('h3');
    h.innerHTML = `<span></span><small></small><b>${n} / ${set.items.length}</b>`;
    h.children[0].textContent = set.name; h.children[1].textContent = set.map;
    const grid = document.createElement('div'); grid.className = 'coll-grid';
    for (const item of set.items) {
      const found = collectionFound.has(item.id);
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'coll-item' + (found ? '' : ' locked');
      if (found) b.style.background = set.bg;
      b.disabled = !found;
      b.setAttribute('aria-label', found ? item.name : 'Not found yet');
      b.title = found ? item.name : 'Not found yet';
      if (collPick && collPick.item === item) b.setAttribute('aria-pressed', 'true');
      const c = document.createElement('canvas'); c.width = 128; c.height = 128;
      paintCollectionItem(c, item, !found);
      b.append(c);
      if (found) b.addEventListener('click', () => { collPick = { set, item }; renderCollections(); });
      grid.append(b);
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
function openCollections() { collFrom = 'title'; collPick = null; renderCollections(); showCard('coll'); }
function closeCollections() { showCard(collFrom); }

for (const b of document.querySelectorAll('.coll-open')) b.addEventListener('click', openCollections);
$('collBack').addEventListener('click', closeCollections);
syncCollectionButton();
