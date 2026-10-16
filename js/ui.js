// Paper Nosedive — HUD, menu cards, pause / game over, and the shop.
'use strict';

// ---------- HUD & screens ----------
const ui = {
  depth: $('depth'), stars: $('starCount'), best: $('best'),
  overlay: $('overlay'), title: $('titleCard'), pause: $('pauseCard'), over: $('overCard'),
  shop: $('shopCard'), overBank: $('overBank'),
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
function showCard(which) {
  ui.overlay.hidden = !which;
  ui.title.hidden = which !== 'title';
  ui.pause.hidden = which !== 'pause';
  ui.over.hidden = which !== 'over';
  ui.shop.hidden = which !== 'shop';
  // the start menu (and the Shop card opened from it) sit on the sky picture instead of the map
  ui.overlay.classList.toggle('menu-bg', !!which && state === 'title');
  ui.overlay.classList.toggle('dim', !!which && state !== 'title');   // pause / game over: dim the game behind
  if (which === 'title') { $('menuBest').textContent = fmt(best); $('menuBank').textContent = fmt(bank); }
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
}
function pause() {
  if (state !== 'play') return;
  state = 'paused';
  setPauseIcon(true);
  showCard('pause');
}
function resume() {
  if (state !== 'paused') return;
  state = 'play';
  setPauseIcon(false);
  holdSide = 0; holdSource = null;   // a key released while paused never sent its keyup here
  showCard(null);
}
function gameOver() {
  state = 'over';
  const s = score();
  const record = s > best;
  if (record) { best = s; store.set('nosedive-best', String(best)); }
  ui.overTitle.textContent = fmt(s) + ' m';
  ui.overBest.textContent = 'Best ' + fmt(best) + ' m';
  ui.stamp.hidden = !record;
  if (stars) { bank += stars; store.set('nosedive-bank', String(bank)); }
  ui.overBank.textContent = (stars ? '★ +' + stars + ' this run · ' : '') + '★ ' + fmt(bank) + ' to spend in the Shop';
  showCard('over');
}

$('startBtn').addEventListener('click', start);
$('againBtn').addEventListener('click', start);
$('resumeBtn').addEventListener('click', resume);

// ---------- shop ----------
let shopReturn = 'title';
function openShop() {
  shopReturn = state === 'over' ? 'over' : 'title';
  renderShop();
  showCard('shop');
}
function closeShop() { showCard(shopReturn); }
function buyUpgrade(u) {
  const lvl = level(u.id);
  if (lvl >= u.levels.length || bank < u.levels[lvl].price) return;
  bank -= u.levels[lvl].price;
  owned[u.id] = lvl + 1;
  store.set('nosedive-bank', String(bank));
  store.set('nosedive-upgrades', JSON.stringify(owned));
  if (state !== 'play') plane.lives = level('life');   // show the blue outline right away
  sfx.buy();
  renderShop();
  const btn = $('shopList').querySelector(`[data-upgrade="${u.id}"]`);
  if (btn) btn.focus({ preventScroll: true });
}
function drawUpgradeIcon(c, id) {
  c.translate(22, 22);
  if (id === 'life') {
    c.rotate(-0.35); c.scale(0.95, 0.95);
    paintLifeOutline(c);
    paintPlane(c, -0.5);
  } else {
    // horseshoe magnet with silver tips, scaled so the whole shape sits inside the 44px icon
    c.translate(0, 3); c.rotate(0.55); c.scale(0.72, 0.72);
    const arm = (y1, y2) => {
      c.beginPath();
      c.arc(0, -6, 12, Math.PI, 0, false);
      c.moveTo(-12, -6); c.lineTo(-12, y2); c.moveTo(12, -6); c.lineTo(12, y2);
      if (y1 !== null) { c.moveTo(-12, y1); c.lineTo(-12, y2); c.moveTo(12, y1); c.lineTo(12, y2); }
    };
    c.lineCap = 'butt';
    c.strokeStyle = COL.ink; c.lineWidth = 13; arm(null, 16); c.stroke();
    c.strokeStyle = '#d9443a'; c.lineWidth = 9.5; arm(null, 7); c.stroke();
    c.strokeStyle = '#c3c9d3';
    c.beginPath(); c.moveTo(-12, 7); c.lineTo(-12, 15); c.moveTo(12, 7); c.lineTo(12, 15); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2;   // shine along the curve
    c.beginPath(); c.arc(0, -6, 14, Math.PI * 1.15, Math.PI * 1.5, false); c.stroke();
  }
}
function renderShop() {
  $('bankCount').textContent = '★ ' + fmt(bank);
  const list = $('shopList');
  list.replaceChildren();
  const pr = Math.min(window.devicePixelRatio || 1, 2);
  for (const u of UPGRADES) {
    const row = document.createElement('div'); row.className = 'upgrade';
    const cv = document.createElement('canvas');
    cv.width = cv.height = Math.round(44 * pr);
    const c = cv.getContext('2d'); c.scale(pr, pr);
    drawUpgradeIcon(c, u.id);
    const lvl = level(u.id), max = u.levels.length, next = u.levels[lvl];
    const info = document.createElement('div'); info.className = 'info';
    const name = document.createElement('strong'); name.textContent = u.name;
    const pips = document.createElement('span'); pips.className = 'pips';
    pips.setAttribute('aria-label', `Level ${lvl} of ${max}`);
    for (let i = 0; i < max; i++) {
      const p = document.createElement('i'); if (i < lvl) p.className = 'on'; pips.append(p);
    }
    pips.append(document.createTextNode(lvl ? ` Level ${lvl} of ${max}` : ` Not bought yet`));
    // describe what the next level gives, or the top level once maxed
    const desc = document.createElement('span');
    desc.textContent = !next ? u.levels[max - 1].desc : (lvl ? 'Next: ' : '') + next.desc;
    info.append(name, pips, desc);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'buy'; btn.dataset.upgrade = u.id;
    if (!next) {
      btn.textContent = 'Maxed'; btn.disabled = true; btn.classList.add('owned');
    } else {
      btn.textContent = '★ ' + next.price;
      btn.disabled = bank < next.price;
      const what = lvl ? `${u.name} level ${lvl + 1}` : u.name;
      btn.setAttribute('aria-label', bank < next.price
        ? `${what} costs ${next.price} stars. You need ${next.price - bank} more.`
        : `Buy ${what} for ${next.price} stars`);
      btn.addEventListener('click', () => buyUpgrade(u));
    }
    row.append(cv, info, btn);
    list.append(row);
  }
}

$('shopBtn').addEventListener('click', openShop);
$('shopBtnOver').addEventListener('click', openShop);
$('shopDone').addEventListener('click', closeShop);
ui.pauseBtn.addEventListener('click', () => (state === 'paused' ? resume() : pause()));
ui.muteBtn.addEventListener('click', () => {
  muted = !muted;
  store.set('nosedive-muted', muted ? '1' : '0');
  setMuteLabel();
  if (!muted) tone(660, 990, 0.1, 'sine', 0.08);
});
