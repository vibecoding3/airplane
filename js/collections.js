// Paper Nosedive — Collections: sets of special obstacles you unlock by seeing them in a run, and the menu to view them.
'use strict';

// An item is found the first time it appears on screen during a run (even if you then crash into it). Found items
// are saved per device; locked ones show as a black silhouette in the menu. Completing a set gives no reward.
const ringName = d => d[0].toUpperCase() + d.slice(1) + ' ring';
const COLLECTIONS = [
  { id: 'frieren', name: 'Frieren', map: 'Dungeon', bg: '#3d3631', items: [
    { id: 'staff-frieren', name: "Frieren's staff", slider: 'frieren' },
    { id: 'staff-fern', name: "Fern's staff", slider: 'fern' }
  ] },
  { id: 'rings', name: 'Rings of Power', map: 'Dungeon', bg: '#3d3631', items: DUNGEON_SOLO.rings.cols.map(d => ({ id: 'ring-' + d, name: ringName(d), ring: d })) },
  { id: 'planets', name: 'Planets', map: 'Space', bg: '#141a3a',
    items: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(n => ({ id: 'planet-' + n, name: n[0].toUpperCase() + n.slice(1), planet: n })) }
];
const COLLECTION_TOTAL = COLLECTIONS.reduce((n, set) => n + set.items.length, 0);
let collectionFound;
try { collectionFound = new Set(JSON.parse(store.get('nosedive-collection') || '[]')); } catch (e) { collectionFound = new Set(); }

// called for every Dungeon obstacle drawn during a run (render.js)
function noteFound(o, sy) {
  if (state !== 'play' || sy < 0 || sy > H) return;
  const id = o.type === 'pencil' && (o.look === 'frieren' || o.look === 'fern') ? 'staff-' + o.look
           : o.look === 'ring' ? 'ring-' + o.dunCol
           : o.look === 'planet' ? 'planet-' + o.planet : null;
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
    d.style.background = collPick.set.bg;
    const c = document.createElement('canvas'); c.width = 560; c.height = collPick.item.slider ? 140 : 240;   // staffs are long and thin
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
  for (const b of document.querySelectorAll('.coll-open')) b.textContent = `Collections · ${collectionFound.size}/${COLLECTION_TOTAL}`;
}
let collFrom = 'title';
function openCollections() { collFrom = state === 'over' ? 'over' : 'title'; collPick = null; renderCollections(); showCard('coll'); }
function closeCollections() { showCard(collFrom); }

for (const b of document.querySelectorAll('.coll-open')) b.addEventListener('click', openCollections);
$('collBack').addEventListener('click', closeCollections);
syncCollectionButton();
