// Paper Nosedive — Keyboard / touch input and the main loop. Loaded last: it starts the game.
'use strict';

// ---------- input ----------
// Space pauses a run (Esc too). The same key press must not then "click" the focused button on release
// (pausing focuses Resume), so the keyup of a Space we used is swallowed.
let spaceUsed = false;
window.addEventListener('keydown', e => {
  if (e.target instanceof HTMLInputElement) { if (e.key === 'Escape') closeLeaderboards(); return; }   // typing a nickname
  const k = e.key;
  const side = keySide(k);
  if (side) { e.preventDefault(); if (!e.repeat) press(side, 'key' + side); }
  else if (k === 'Escape') { if (!ui.coll.hidden) closeCollections(); else if (!ui.lb.hidden) closeLeaderboards(); else state === 'paused' ? resume() : pause(); }
  else if (k === ' ' && state === 'play') { e.preventDefault(); if (!e.repeat) { spaceUsed = true; pause(); } }
  else if ((k === ' ' || k === 'Enter') && (state === 'title' || state === 'over' || state === 'paused')) {
    if (e.repeat && k === ' ') { e.preventDefault(); return; }
    if (!ui.coll.hidden || !ui.lb.hidden) return;   // Collections / Leaderboards: their own buttons handle the keys
    if (e.target instanceof HTMLButtonElement && !e.target.classList.contains('play')) return;
    e.preventDefault();
    if (k === ' ') spaceUsed = true;
    state === 'paused' ? resume() : start();
  }
});
window.addEventListener('keyup', e => {
  const side = keySide(e.key);
  if (side) release('key' + side);
  if (e.key === ' ' && spaceUsed) { e.preventDefault(); spaceUsed = false; }
});
function keySide(k) {
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') return -1;
  if (k === 'ArrowRight' || k === 'd' || k === 'D') return 1;
  return 0;
}

// the phone's Back button (called by the Android app): one step back through the screens.
// Returns false on the start menu, where there is nothing to go back to and the app closes.
function goBack() {
  if (!ui.coll.hidden) { closeCollections(); return true; }
  if (!ui.lb.hidden) { closeLeaderboards(); return true; }
  if (state === 'play') { pause(); return true; }
  if (state === 'paused') { resume(); return true; }
  if (state === 'over') { toMainMenu(); return true; }
  return false;
}

// mouse, pen and touch all work the same: press the left or right half of the playfield
const sideOf = clientX => {
  const r = canvas.getBoundingClientRect();
  return clientX - r.left < r.width / 2 ? -1 : 1;
};
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  press(sideOf(e.clientX), 'ptr' + e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  // sliding a held finger or mouse across the middle switches the hold to that side
  if (holdSource === 'ptr' + e.pointerId) holdSide = sideOf(e.clientX);
});
const releasePointer = e => release('ptr' + e.pointerId);
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('pointerup', releasePointer);
canvas.addEventListener('pointercancel', releasePointer);

window.addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

// ---------- main loop ----------
let last = performance.now();
// if frames keep running slow during play, step the resolution down a notch (and remember it)
let slowFor = 0;
function watchFrameRate(real) {
  if (state !== 'play' || real > 0.25 || dprCap <= 1) return;   // ignore tab switches and menus
  slowFor = real > 1 / 48 ? slowFor + real : Math.max(0, slowFor - real * 0.5);
  if (slowFor > 1.5) {
    slowFor = 0;
    dprCap = Math.max(1, Math.round((dprCap - 0.25) * 4) / 4);
    store.set('nosedive-res', String(dprCap));
    resize();
  }
}

// live frame rate next to the version label, refreshed twice a second
const versionEl = $('version'), VERSION = versionEl.textContent;
let fpsFrames = 0, fpsSince = performance.now();
function countFrame(now) {
  fpsFrames++;
  if (now - fpsSince < 500) return;
  // during a run the plane's real fall speed (slow motion halves it) sits left of the frame rate
  const running = state === 'play' || state === 'paused' || state === 'dying';
  const mps = running ? `${(speed * (state === 'play' ? timeScale() : 1) / PX_PER_M).toFixed(1)} m/s · ` : '';
  versionEl.textContent = `${VERSION} · ${mps}${Math.round(fpsFrames * 1000 / (now - fpsSince))} fps`;
  fpsFrames = 0; fpsSince = now;
}

// Frame pacing: play is capped at 60 fps (90/120/144 Hz screens would otherwise draw up to 2.4x as often,
// costing battery and heat); menus need much less, so the start / game-over screens run at 30 fps and the
// pause screen at 4 fps.
let nextDraw = 0;
function frameInterval() {
  if (state === 'play' || state === 'dying') return 1000 / 60;
  return state === 'paused' ? 250 : 1000 / 30;
}

function frame(now) {
  const interval = frameInterval();
  if (interval) {
    if (now + 1.5 < nextDraw) { requestAnimationFrame(frame); return; }   // not this refresh
    nextDraw = nextDraw + interval < now ? now + interval : nextDraw + interval;
  }
  const real = (now - last) / 1000;
  const dt = Math.min(1 / 30, real);
  last = now;
  watchFrameRate(real);
  countFrame(now);
  // at high speed, split the frame so the plane can't skip through thin obstacles
  const sdt = dt * timeScale();                 // slow motion runs the world at half speed
  const steps = state === 'play' ? Math.max(1, Math.ceil(speed * sdt / 10)) : 1;
  for (let i = 0; i < steps; i++) update(sdt / steps);
  if (state !== 'title') render();   // the start menu's picture covers the playfield, so skip drawing it
  updateHud();
  requestAnimationFrame(frame);
}
showCard('title');
setMusic('title');
requestAnimationFrame(frame);
