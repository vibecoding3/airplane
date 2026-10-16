// Paper Nosedive — HUD, menu cards, pause / game over.
'use strict';

// ---------- HUD & screens ----------
const ui = {
  depth: $('depth'), stars: $('starCount'), best: $('best'),
  overlay: $('overlay'), title: $('titleCard'), pause: $('pauseCard'), over: $('overCard'),
  overBank: $('overBank'),
  overTitle: $('overTitle'), overBest: $('overBest'), stamp: $('recordStamp'),
  pauseBtn: $('pauseBtn'), muteBtn: $('muteBtn')
};
let hudDepth = -1, hudStars = -1, hudBest = -1;
function updateHud() {
  const playing = state === 'play' || state === 'paused' || state === 'dying' || state === 'over';
  const d = playing ? score() : 0;
  // total stars owned: the bank plus whatever this run has picked up so far
  // (once the run is over, its stars are already in the bank)
  const total = bank + (state === 'over' ? 0 : stars);
  if (d === hudDepth && total === hudStars && best === hudBest) return;   // touch the page only on change
  hudDepth = d; hudStars = total; hudBest = best;
  ui.depth.textContent = fmt(d);
  ui.stars.textContent = '★ ' + fmt(total);
  ui.best.textContent = fmt(best);
}
// the depth counter in the top bar gives a quick bounce at each 100 m milestone (a bigger one every 500 m)
function popHudDepth(big) {
  if (reduceMotion) return;
  const el = ui.depth.parentElement;
  el.classList.remove('pop', 'pop-big');
  void el.offsetWidth;                         // restart the animation
  el.classList.add(big ? 'pop-big' : 'pop');
}
// medals on each map tile: bronze / silver / gold, lit when that map's best depth reaches them
function renderMedals() {
  for (const tile of document.querySelectorAll('.map-tile')) {
    const b = bests[tile.dataset.map] || 0;
    let box = tile.querySelector('.medals');
    if (!box) { box = document.createElement('span'); box.className = 'medals'; tile.append(box); }
    box.replaceChildren(...MEDALS.map(md => {
      const i = document.createElement('i');
      i.className = 'medal ' + md.id + (b >= md.m ? ' on' : '');
      i.title = `${md.name}: ${fmt(md.m)} m`;
      return i;
    }));
    const got = MEDALS.filter(md => b >= md.m).map(md => md.name);
    box.setAttribute('aria-label', got.length ? 'Medals: ' + got.join(', ') : 'No medals yet');
  }
}
function showCard(which) {
  ui.overlay.hidden = !which;
  ui.title.hidden = which !== 'title';
  ui.pause.hidden = which !== 'pause';
  ui.over.hidden = which !== 'over';
  // the start menu sits on the sky picture instead of the map
  ui.overlay.classList.toggle('menu-bg', !!which && state === 'title');
  ui.overlay.classList.toggle('dim', !!which && state !== 'title');   // pause / game over: dim the game behind
  if (which === 'title') { $('menuBest').textContent = fmt(best); $('menuBank').textContent = fmt(bank); }
  if (which === 'title' || which === 'over') renderMedals();
  const btn = which && ui[which].querySelector('.play, .primary');
  if (btn) btn.focus({ preventScroll: true });
}
// top-bar icons (the buttons keep spoken labels for screen readers)
const svg = body => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const SPEAKER = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/>';
const ICONS = {
  sound: svg(SPEAKER + '<path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
  muted: svg(SPEAKER + '<path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
  pause: svg('<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>'),
  play: svg('<path d="M8 5.5l11 6.5-11 6.5z" fill="currentColor" stroke="none"/>')
};
function setMuteLabel() {
  ui.muteBtn.innerHTML = muted ? ICONS.muted : ICONS.sound;
  ui.muteBtn.setAttribute('aria-label', muted ? 'Sound off' : 'Sound on');
  ui.muteBtn.title = muted ? 'Sound off' : 'Sound on';
}
function setPauseIcon(paused) {
  ui.pauseBtn.innerHTML = paused ? ICONS.play : ICONS.pause;
  ui.pauseBtn.setAttribute('aria-label', paused ? 'Resume' : 'Pause');
  ui.pauseBtn.title = paused ? 'Resume' : 'Pause';
}
setPauseIcon(false);
setMuteLabel();

function start() {
  reset();
  state = 'play';
  clearControls();
  showCard(null);
  sfx.throw();
  setMusic(mapId);
}
function pause() {
  if (state !== 'play') return;
  state = 'paused';
  setPauseIcon(true);
  showCard('pause');
  duckMusic(true);
}
function resume() {
  if (state !== 'paused') return;
  state = 'play';
  setPauseIcon(false);
  holdSide = 0; holdSource = null;   // a key released while paused never sent its keyup here
  showCard(null);
  duckMusic(false);
}
function gameOver() {
  state = 'over';
  setMusic('title');
  const s = score();
  const record = s > best;
  if (record) { best = bests[mapId] = s; store.set('nosedive-best-' + mapId, String(s)); }
  ui.overTitle.textContent = fmt(s) + ' m';
  ui.overBest.textContent = 'Best ' + fmt(best) + ' m';
  ui.stamp.hidden = !record;
  if (stars) { bank += stars; store.set('nosedive-bank', String(bank)); }
  ui.overBank.textContent = (stars ? '★ +' + stars + ' this run · ' : '') + '★ ' + fmt(bank) + ' in total';
  showCard('over');
}

for (const b of document.querySelectorAll('[data-map]')) {
  b.addEventListener('click', () => { $('menuBest').textContent = fmt(best); ui.overBest.textContent = 'Best ' + fmt(best) + ' m'; });
}
$('startBtn').addEventListener('click', start);
$('againBtn').addEventListener('click', start);
$('resumeBtn').addEventListener('click', resume);

ui.pauseBtn.addEventListener('click', () => (state === 'paused' ? resume() : pause()));
ui.muteBtn.addEventListener('click', () => {
  muted = !muted;
  store.set('nosedive-muted', muted ? '1' : '0');
  setMuteLabel();
  syncMusicVolume();
  if (!muted) tone(660, 990, 0.1, 'sine', 0.08);
});
