// Paper Nosedive — Sound effects, made with the Web Audio API (no sound files).
'use strict';

// ---------- sound ----------
let actx = null;
let muted = store.get('nosedive-muted') === '1';
function audio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
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
  const len = Math.floor(a.sampleRate * 0.4);
  const buf = a.createBuffer(1, len, a.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const env = Math.pow(1 - i / len, 2);
    data[i] = (Math.random() * 2 - 1) * env * (Math.random() < 0.3 ? 1 : 0.4);
  }
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.7; g.gain.value = 0.5;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}
const sfx = {
  throw: () => tone(520, 180, 0.35, 'triangle', 0.07),
  star: () => { tone(880, 1320, 0.12, 'sine', 0.1); tone(1320, 1760, 0.15, 'sine', 0.08, 0.08); },
  crash: () => { crunch(); tone(220, 60, 0.4, 'sawtooth', 0.04); },
  save: () => { crunch(); tone(330, 990, 0.35, 'triangle', 0.1); },
  twang: () => { tone(180, 420, 0.08, 'triangle', 0.09); tone(420, 160, 0.3, 'triangle', 0.07, 0.07); },
  buy: () => { tone(660, 990, 0.1, 'sine', 0.1); tone(990, 1480, 0.18, 'sine', 0.08, 0.09); }
};
