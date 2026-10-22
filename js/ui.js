// Paper Nosedive — HUD, menu cards, pause / game over.
'use strict';

// ---------- HUD & screens ----------
const ui = {
  depth: $('depth'), stars: $('starCount'), best: $('best'),
  overlay: $('overlay'), title: $('titleCard'), pause: $('pauseCard'), over: $('overCard'), coll: $('collCard'), lb: $('lbCard'),
  overBank: $('overBank'),
  overTitle: $('overTitle'), overBest: $('overBest'), stamp: $('recordStamp'),
  muteBtn: $('muteBtn'), hint: $('hint')
};
let hudDepth = -1, hudStars = -1, hudBest = -1;
// control tips for the first 100 m of a run, left of the sound button: one at a time, changing every 3 seconds,
// fading out over the last 10 m. Phones get tap tips, keyboards key tips.
const TOUCH = window.matchMedia && matchMedia('(pointer: coarse)').matches;
const HINTS = TOUCH ? ['Tap left or right to steer']
                    : ['← → or A D to steer', 'Space to pause'];
const HINT_UNTIL_M = 200;                // since v118 (was 100 m)
let hintText = null, hintFade = false;
function syncHint() {
  const m = score(), on = state === 'play' && m < HINT_UNTIL_M;
  const text = on ? HINTS[Math.floor(time / 3) % HINTS.length] : '';
  if (text !== hintText) { hintText = text; ui.hint.textContent = text; ui.hint.hidden = !text; }
  const fade = on && m >= HINT_UNTIL_M - 10;
  if (fade !== hintFade) { hintFade = fade; ui.hint.classList.toggle('fade', fade); }
}
function updateHud() {
  syncHint();
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
// medals on each map tile: bronze / silver / gold, lit when that map's best depth reaches them; the best depth below them (v138)
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
    let score = tile.querySelector('.map-best');
    if (!score) { score = document.createElement('span'); score.className = 'map-best'; tile.append(score); }
    score.textContent = fmt(b) + ' m';
  }
}
// experience box: level badge, bar toward the next level, "into / need XP" (plus this run's gain on game over)
function xpBox(box) {
  if (!box.firstChild) box.innerHTML = '<span class="xp-lvl"><small>Level</small><b></b></span><span class="xp-track"><i class="xp-fill"></i></span><span class="xp-num"></span>';
  return { lvl: box.querySelector('.xp-lvl b'), fill: box.querySelector('.xp-fill'), num: box.querySelector('.xp-num') };
}
function setXp(box, info, gain, instant) {
  const el = xpBox(box);
  el.lvl.textContent = info.level;
  el.fill.classList.toggle('instant', !!instant);
  el.fill.style.width = (100 * info.into / info.need) + '%';
  el.num.innerHTML = (gain ? `<b>+${fmt(gain)} XP</b> · ` : '') + `${fmt(info.into)} / ${fmt(info.need)} XP`;
  box.setAttribute('aria-label', `Level ${info.level}, ${info.into} of ${info.need} XP to the next level`);
}
// game over: the bar fills from where it was; on a level up it fills to the end, then starts the new level
let xpTimer = 0;
function animateXp(box, before, gain) {
  clearTimeout(xpTimer);
  const a = levelInfo(before), b = levelInfo(before + gain);
  if (reduceMotion || !gain) { setXp(box, b, gain, true); return; }
  setXp(box, a, gain, true);
  void box.offsetWidth;                        // let the starting width apply before animating
  if (b.level === a.level) { setXp(box, b, gain); return; }
  setXp(box, { ...a, into: a.need }, gain);
  xpTimer = setTimeout(() => {
    setXp(box, { ...b, into: 0 }, gain, true);
    void box.offsetWidth;
    setXp(box, b, gain);
  }, 650);
}
function showCard(which) {
  ui.overlay.hidden = !which;
  ui.title.hidden = which !== 'title';
  ui.pause.hidden = which !== 'pause';
  ui.over.hidden = which !== 'over';
  ui.coll.hidden = which !== 'coll';
  ui.lb.hidden = which !== 'lb';
  // the start menu sits on the sky picture instead of the map
  ui.overlay.classList.toggle('menu-bg', !!which && state === 'title');
  ui.overlay.classList.toggle('dim', !!which && state !== 'title');   // pause / game over: dim the game behind
  if (which === 'title') { lbRefreshRank(); $('menuBank').textContent = fmt(bank); $('menuRanked').textContent = fmt(rankedScore()); setXp($('titleXp'), levelInfo(xp), 0, true); syncCollectionButton(); }
  if (which === 'title' || which === 'over') { renderMedals(); syncCollectionButton(); }
  const btn = which && ui[which].querySelector('.play, .primary');
  if (btn) btn.focus({ preventScroll: true });
}
// top-bar icons (the buttons keep spoken labels for screen readers)
const svg = body => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const SPEAKER = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/>';
const ICONS = {
  sound: svg(SPEAKER + '<path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
  muted: svg(SPEAKER + '<path d="M16 9.5l5 5M21 9.5l-5 5"/>')
};
function setMuteLabel() {
  ui.muteBtn.innerHTML = muted ? ICONS.muted : ICONS.sound;
  ui.muteBtn.setAttribute('aria-label', muted ? 'Sound off' : 'Sound on');
  ui.muteBtn.title = muted ? 'Sound off' : 'Sound on';
}
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
  showCard('pause');
  duckMusic(true);
}
function resume() {
  if (state !== 'paused') return;
  state = 'play';
  holdSide = 0; holdSource = null;   // a key released while paused never sent its keyup here
  showCard(null);
  duckMusic(false);
}
// a finished run keeps what it earned: a new best depth, its stars, and its metres as experience
function keepRunProgress(s) {
  logRun(s, state === 'paused' ? 'exit' : 'crash');   // the anonymous play log (js/playlog.js)
  const record = s > best;
  if (record) { best = bests[mapId] = s; store.set('nosedive-best-' + mapId, String(s)); }
  if (stars) { bank += stars; store.set('nosedive-bank', String(bank)); }
  const xpBefore = xp, levelUp = levelInfo(xp + s).level > levelInfo(xp).level;
  xp += s; store.set('nosedive-xp', String(xp));
  lbRunEnded(s);                                       // queued for the server's XP and boards (js/leaderboard.js), after its XP is in
  return { record, xpBefore, levelUp };
}
// leaving a run from the pause menu: it keeps its progress like a crash, then goes straight to the start menu
function exitRun() {
  if (state !== 'paused') return;
  keepRunProgress(score());
  reset();
  clearControls();
  state = 'title';
  duckMusic(false);
  setMusic('title');
  showCard('title');
}
// the game-over screen's Main Menu button: back to the start menu (where Collections is)
function toMainMenu() {
  if (state !== 'over') return;
  reset();
  state = 'title';
  showCard('title');
}
function gameOver() {
  state = 'over';
  setMusic('title');
  const s = score();
  const { record, xpBefore, levelUp } = keepRunProgress(s);
  ui.overTitle.textContent = fmt(s) + ' m';
  ui.overBest.textContent = 'Best ' + fmt(best) + ' m';
  $('overRanked').textContent = 'Total score ' + fmt(rankedScore());
  ui.stamp.hidden = !record;
  ui.overBank.textContent = (stars ? '★ +' + stars + ' this run · ' : '') + '★ ' + fmt(bank) + ' in total';
  $('levelStamp').hidden = !levelUp;
  if (levelUp) { $('levelStamp').textContent = 'Level up! Level ' + levelInfo(xp).level; setTimeout(sfx.levelup, 500); }
  showCard('over');
  animateXp($('overXp'), xpBefore, s);
}

for (const b of document.querySelectorAll('[data-map]')) {
  b.addEventListener('click', () => { ui.overBest.textContent = 'Best ' + fmt(best) + ' m'; });
}
$('startBtn').addEventListener('click', start);
$('againBtn').addEventListener('click', start);
$('resumeBtn').addEventListener('click', resume);
$('exitBtn').addEventListener('click', exitRun);
$('overMenuBtn').addEventListener('click', toMainMenu);

ui.muteBtn.addEventListener('click', () => {
  muted = !muted;
  store.set('nosedive-muted', muted ? '1' : '0');
  setMuteLabel();
  syncMusicVolume();
  if (!muted) tone(660, 990, 0.1, 'sine', 0.08);
});
