// Paper Nosedive — Sound effects, made with the Web Audio API (no sound files).
'use strict';

// ---------- sound ----------
let actx = null;
let muted = store.get('nosedive-muted') === '1';
function audioEngine() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  return actx;
}
function audio() {
  const a = audioEngine();
  if (a && a.state === 'suspended') a.resume().catch(() => {});
  return a;
}
// Starting the audio engine takes 50-85 ms (often more on phones). Doing it on the first sound froze the
// first moment of the first run, so build it (and the crunch noise) while the title screen is up; it starts
// muted by the browser and is switched on by the player's first tap or key press.
let noiseBuf = null;
function crunchNoise(a) {
  if (noiseBuf) return noiseBuf;
  const len = Math.floor(a.sampleRate * 0.4);
  noiseBuf = a.createBuffer(1, len, a.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const env = Math.pow(1 - i / len, 2);
    data[i] = (realRandom() * 2 - 1) * env * (realRandom() < 0.3 ? 1 : 0.4);
  }
  return noiseBuf;
}
window.addEventListener('load', () => setTimeout(() => { const a = audioEngine(); if (a) crunchNoise(a); }, 0));
for (const type of ['pointerdown', 'keydown']) window.addEventListener(type, () => audio(), { once: true, capture: true });
function tone(f1, f2, dur, type = 'sine', vol = 0.12, delay = 0) {
  if (muted) return;
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
function crunch() {
  if (muted) return;
  const a = audio(); if (!a) return;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = crunchNoise(a); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.7; g.gain.value = 0.5;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}
const sfx = {
  throw: () => tone(520, 180, 0.35, 'triangle', 0.07),
  star: () => { tone(880, 1320, 0.12, 'sine', 0.1); tone(1320, 1760, 0.15, 'sine', 0.08, 0.08); },
  crash: () => { crunch(); tone(220, 60, 0.4, 'sawtooth', 0.04); },
  save: () => { crunch(); tone(330, 990, 0.35, 'triangle', 0.1); },
  twang: () => { tone(180, 420, 0.08, 'triangle', 0.09); tone(420, 160, 0.3, 'triangle', 0.07, 0.07); },
  levelup: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, i === 4 ? 0.4 : 0.12, 'triangle', 0.08, i * 0.08)),
  record: () => { tone(660, 660, 0.12, 'triangle', 0.09); tone(880, 880, 0.12, 'triangle', 0.09, 0.11); tone(1320, 1320, 0.25, 'triangle', 0.09, 0.22); },
  milestone: big => big
    ? [523, 659, 784, 1047].forEach((f, i) => tone(f, f, i === 3 ? 0.35 : 0.14, 'triangle', 0.08, i * 0.09))
    : (tone(1047, 1047, 0.1, 'sine', 0.07), tone(1568, 1568, 0.2, 'sine', 0.06, 0.08)),
  superstar: () => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, f * 1.01, 0.12, 'square', 0.035, i * 0.06)),
  boost: () => { tone(300, 1200, 0.25, 'sawtooth', 0.035); tone(600, 1800, 0.22, 'triangle', 0.07, 0.05); },
  ink: () => { tone(260, 70, 0.28, 'sawtooth', 0.05); tone(140, 50, 0.35, 'sine', 0.09, 0.03); },
  slowmo: () => { tone(880, 220, 0.5, 'triangle', 0.09); tone(440, 110, 0.6, 'sine', 0.06, 0.05); },
  power: () => { tone(660, 990, 0.1, 'sine', 0.1); tone(990, 1480, 0.18, 'sine', 0.08, 0.09); },
  // v178: a sound for every action and event that had none. Obstacle sounds only play for obstacles on screen, and every
  // one of these waits a moment before it can play again (`ready`), so a busy screen never turns into a din
  steer: () => ready('steer', 0.05) && swish(1800, 0.09, 0.05),                                         // a paper flick
  sharp: () => ready('sharp', 0.2) && (swish(1200, 0.2, 0.05), tone(500, 760, 0.16, 'triangle', 0.025)),   // a hard bank
  bump: () => ready('bump', 0.25) && (tone(160, 80, 0.12, 'sine', 0.1), swish(600, 0.06, 0.05)),       // the page edge
  shield: () => { tone(440, 880, 0.12, 'triangle', 0.08); tone(660, 1320, 0.25, 'sine', 0.06, 0.08); },
  magnet: () => { tone(300, 600, 0.12, 'square', 0.03); tone(600, 1200, 0.2, 'sine', 0.07, 0.06); },
  fade: () => [880, 660, 440].forEach((f, i) => tone(f, f * 0.98, 0.1, 'triangle', 0.05, i * 0.07)),  // a timed power-up runs out
  found: () => [1175, 1568, 2093, 2637].forEach((f, i) => tone(f, f, i === 3 ? 0.3 : 0.09, 'sine', 0.06, i * 0.06)),   // a new collection item
  fire: () => ready('fire', 0.1) && (tone(300, 120, 0.1, 'square', 0.025), swish(900, 0.08, 0.04)),     // a turret shot
  lunge: () => ready('lunge', 0.12) && (swish(2400, 0.12, 0.05), tone(260, 520, 0.08, 'triangle', 0.03)), // a piston snapping out
  clack: () => ready('clack', 0.15) && (tone(240, 140, 0.07, 'square', 0.03), swish(1400, 0.05, 0.05)),   // closing jaws meeting
  bubbles: () => ready('bubbles', 0.4) && [0, 0.07, 0.15].forEach((d, i) => tone(500 + i * 180, 900 + i * 260, 0.08, 'sine', 0.045, d)),
  wind: () => ready('wind', 0.6) && swish(500, 0.5, 0.06),                                            // into a wind band
  click: () => ready('click', 0.03) && tone(900, 700, 0.05, 'triangle', 0.06),                        // a menu button
  page: () => ready('page', 0.05) && (swish(2600, 0.12, 0.06), tone(700, 900, 0.06, 'triangle', 0.03)),   // an arrow: a page turned
  pause: () => { tone(660, 440, 0.12, 'triangle', 0.06); tone(440, 330, 0.16, 'triangle', 0.05, 0.08); },
  resume: () => { tone(440, 660, 0.1, 'triangle', 0.06); tone(660, 880, 0.14, 'triangle', 0.05, 0.07); }
};
// the soft "swish" of air or paper: the crunch noise through a band-pass filter, with a quick fade
function swish(freq, dur, vol) {
  if (muted) return;
  const a = audio(); if (!a) return;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
  src.buffer = crunchNoise(a); f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(freq * 0.6, t + dur); f.Q.value = 1.2;
  g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(0.03, dur / 3)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t); src.stop(t + dur + 0.02);
}
// true when a sound may play again (at least `gap` seconds since it last did), by the audio clock: never the game's
// own clock or random numbers, so sounds can't change a run (replays stay exact)
const lastPlayed = {};
function ready(key, gap) {
  if (muted || !actx) return false;
  const t = actx.currentTime;
  if (t - (lastPlayed[key] || -1) < gap) return false;
  lastPlayed[key] = t;
  return true;
}
