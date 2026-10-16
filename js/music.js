// Paper Nosedive — Background music, composed and played in code (Web Audio, no music files).
'use strict';

// Three looping themes in the style of a fantasy MMORPG soundtrack (minor keys, harp arpeggios, string
// pads, flute / horn leads). The melodies are original. The title theme plays on the menus and game over;
// each map has its own theme during a run. The sound button mutes music and effects together.

// chords as MIDI notes (low voicings; the harp plays them an octave or two higher)
const CH = {
  Dm: [50, 57, 62, 65], C: [48, 55, 60, 64], Bb: [46, 53, 58, 62], A: [45, 52, 57, 61], G: [43, 50, 55, 59],
  Am: [45, 52, 57, 60], F: [41, 48, 53, 57], E: [40, 47, 52, 56], Em: [40, 47, 52, 55], D: [38, 45, 50, 54],
  Bm: [47, 54, 59, 62], B: [47, 54, 59, 63], Dm2: [38, 45, 50, 53],
  Fmaj7: [41, 48, 52, 57], Em7: [40, 47, 50, 55], Am7: [45, 52, 55, 60], Cmaj7: [36, 43, 47, 52], Dm7: [38, 45, 48, 53]
};
// melody: one array per bar of [note, beats] (null = rest); every bar adds up to 4 beats
const THEMES = {
  // menus: a slow, noble horn theme over strings, with a soft drum on the downbeats
  title: {
    bpm: 72, lead: 'horn', harp: [0, 2, 1, 3], harpStep: 1, drum: true,
    chords: ['Em', 'C', 'D', 'Bm', 'Em', 'C', 'Am', 'B'],
    melody: [
      [[64, 1], [67, 1], [71, 2]], [[72, 1.5], [71, 0.5], [67, 2]], [[69, 1], [71, 1], [74, 2]], [[71, 3], [null, 1]],
      [[76, 1.5], [74, 0.5], [71, 2]], [[72, 1], [71, 1], [67, 2]], [[69, 1], [72, 1], [71, 1], [69, 1]], [[66, 2], [63, 2]]
    ]
  },
  // Paper: a light, pastoral town theme — flute over flowing harp eighths
  notebook: {
    bpm: 88, lead: 'flute', harp: [0, 1, 2, 3, 4, 3, 2, 1], harpStep: 0.5,
    chords: ['Dm', 'C', 'Bb', 'C', 'Dm', 'C', 'Bb', 'A'],
    melody: [
      [[69, 1.5], [67, 0.5], [65, 1], [64, 1]], [[62, 1], [64, 1], [67, 2]], [[65, 1.5], [64, 0.5], [62, 1], [60, 1]], [[64, 3], [null, 1]],
      [[69, 1], [72, 1], [74, 1.5], [72, 0.5]], [[72, 1], [69, 1], [67, 2]], [[65, 1], [67, 1], [69, 1], [65, 1]], [[64, 2], [61, 1], [null, 1]]
    ]
  },
  // Space: dreamy and floating — shimmering harp with echo over soft major-seventh chords and a high, slow lead
  space: {
    bpm: 70, lead: 'space', harp: [0, 2, 4, 3, 1, 3, 4, 2], harpStep: 0.5, echo: 0.4,
    chords: ['Fmaj7', 'Em7', 'Am7', 'Cmaj7', 'Fmaj7', 'Em7', 'Dm7', 'E'],
    melody: [
      [[72, 1], [76, 1], [79, 2]], [[79, 1], [76, 3]], [[72, 2], [74, 1], [76, 1]], [[71, 4]],
      [[69, 1], [72, 1], [77, 2]], [[76, 2], [74, 2]], [[72, 1], [74, 1], [77, 2]], [[76, 3], [null, 1]]
    ]
  },
  // Deep sea: slow and dark, long echoing harp notes and a lonely low flute
  sea: {
    bpm: 64, lead: 'deep', harp: [0, 2, 3, 4], harpStep: 1, echo: 0.45,
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm2', 'E'],
    melody: [
      [[76, 3], [74, 1]], [[72, 2], [69, 2]], [[67, 3], [69, 1]], [[71, 4]],
      [[72, 2], [71, 1], [69, 1]], [[65, 2], [69, 2]], [[74, 3], [72, 1]], [[71, 2], [68, 2]]
    ]
  }
};

const hz = n => 440 * Math.pow(2, (n - 69) / 12);
const music = { master: null, echo: null, bus: null, theme: null, name: '', bar: 0, next: 0, timer: 0, duck: 1 };

function musicLevel() { return muted || document.hidden ? 0 : 0.42 * music.duck; }   // kept under the sound effects
function syncMusicVolume() {
  if (!music.master) return;
  const t = actx.currentTime;
  music.master.gain.cancelScheduledValues(t);
  music.master.gain.setTargetAtTime(musicLevel(), t, 0.15);
}
function duckMusic(on) { music.duck = on ? 0.3 : 1; syncMusicVolume(); }
document.addEventListener('visibilitychange', syncMusicVolume);

function musicGraph() {
  if (music.master) return true;
  const a = audioEngine(); if (!a) return false;
  music.master = a.createGain(); music.master.gain.value = musicLevel();
  music.master.connect(a.destination);
  // a soft echo the themes can send notes into (used for the sea's harp)
  const d = a.createDelay(1), fb = a.createGain(), lp = a.createBiquadFilter();
  d.delayTime.value = 0.42; fb.gain.value = 0.38; lp.type = 'lowpass'; lp.frequency.value = 1800;
  d.connect(lp).connect(fb).connect(d); lp.connect(music.master);
  music.echo = d;
  return true;
}

// start a theme (cross-fading from the current one); calling it with the theme already playing does nothing
function setMusic(name) {
  if (name === music.name || !THEMES[name] || !musicGraph()) return;
  const a = actx, t = a.currentTime;
  if (music.bus) {                               // fade the old theme out, then drop it
    const old = music.bus;
    old.gain.setTargetAtTime(0, t, 0.4);
    setTimeout(() => old.disconnect(), 2500);
  }
  music.bus = a.createGain();
  music.bus.gain.setValueAtTime(0, t); music.bus.gain.setTargetAtTime(1, t + 0.1, 0.5);
  music.bus.connect(music.master);
  music.name = name; music.theme = THEMES[name]; music.bar = 0; music.next = t + 0.15;
  if (!music.timer) music.timer = setInterval(scheduleMusic, 100);
  scheduleMusic();
}

// keep about half a second of music scheduled ahead of the audio clock
function scheduleMusic() {
  if (!music.theme || actx.state !== 'running' && music.next > actx.currentTime + 0.5) return;
  while (music.next < actx.currentTime + 0.5) {
    playBar(music.theme, music.bar, music.next, music.bus);
    music.next += 4 * 60 / music.theme.bpm;
    music.bar = (music.bar + 1) % music.theme.chords.length;
  }
}

function playBar(th, i, t0, bus) {
  const beat = 60 / th.bpm, chord = CH[th.chords[i]], barLen = 4 * beat;
  // string pad: the chord held for the whole bar, two slightly detuned saws through a soft filter
  for (const n of chord.slice(1)) for (const det of [-7, 7]) note(bus, 'sawtooth', hz(n), t0, barLen + 0.3, 0.012, 0.5, 0.6, { det, lp: 900 });
  note(bus, 'sine', hz(chord[0] - 12), t0, barLen, 0.07, 0.05, 0.4);                                  // bass
  // harp: an arpeggio over the chord, an octave or two up
  const up = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[3] + 12, chord[1] + 24];
  for (let k = 0, s = 0; s < 4 - 1e-6; k++, s += th.harpStep) {
    const n = up[th.harp[k % th.harp.length]];
    pluck(bus, hz(n), t0 + s * beat, th.echo ? 2.2 : 1.1, 0.045, th.echo);
  }
  // lead melody
  let s = 0;
  for (const [n, b] of th.melody[i]) {
    if (n != null) lead(bus, th.lead, hz(th.lead === 'deep' ? n - 12 : n), t0 + s * beat, b * beat);
    s += b;
  }
  if (th.drum) { drum(bus, t0); drum(bus, t0 + 2 * beat, 0.6); }
}

// one sustained note with an attack / release envelope
function note(bus, type, f, t, dur, vol, attack, release, o = {}) {
  const a = actx, osc = a.createOscillator(), g = a.createGain();
  osc.type = type; osc.frequency.value = f; if (o.det) osc.detune.value = o.det;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, Math.max(t + attack, t + dur - release));
  g.gain.linearRampToValueAtTime(0, t + dur);
  let out = osc;
  if (o.lp) { const f2 = a.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; osc.connect(f2); out = f2; }
  out.connect(g).connect(bus);
  osc.start(t); osc.stop(t + dur + 0.05);
}
// a harp-like pluck: bright start, long fade
function pluck(bus, f, t, dur, vol, echo) {
  const a = actx, osc = a.createOscillator(), g = a.createGain();
  osc.type = 'triangle'; osc.frequency.value = f;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  osc.connect(g).connect(bus);
  if (echo) { const e = a.createGain(); e.gain.value = echo; g.connect(e).connect(music.echo); }
  osc.start(t); osc.stop(t + dur + 0.05);
}
// lead voices: flute (sine with vibrato), deep flute (lower, slower), horn (filtered saw)
function lead(bus, kind, f, t, dur) {
  const a = actx, osc = a.createOscillator(), g = a.createGain(), vib = a.createOscillator(), vg = a.createGain();
  const horn = kind === 'horn';
  osc.type = horn ? 'sawtooth' : 'sine'; osc.frequency.value = f;
  vib.frequency.value = kind === 'deep' ? 4 : kind === 'space' ? 3 : 5.5; vg.gain.value = f * (kind === 'space' ? 0.009 : 0.006);
  vib.connect(vg).connect(osc.frequency);
  const vol = horn ? 0.035 : kind === 'deep' ? 0.07 : kind === 'space' ? 0.05 : 0.06, att = horn ? 0.12 : kind === 'space' ? 0.25 : 0.08;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + att);
  g.gain.setValueAtTime(vol * 0.85, Math.max(t + att, t + dur - 0.15));
  g.gain.linearRampToValueAtTime(0, t + dur + 0.05);
  let out = osc;
  if (horn) { const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; osc.connect(lp); out = lp; }
  out.connect(g).connect(bus);
  if (kind === 'deep' || kind === 'space') { const e = a.createGain(); e.gain.value = kind === 'space' ? 0.45 : 0.3; g.connect(e).connect(music.echo); }
  osc.start(t); vib.start(t); osc.stop(t + dur + 0.1); vib.stop(t + dur + 0.1);
}
// a soft low drum (for the title theme)
function drum(bus, t, vol = 1) {
  const a = actx, osc = a.createOscillator(), g = a.createGain();
  osc.type = 'sine'; osc.frequency.setValueAtTime(90, t); osc.frequency.exponentialRampToValueAtTime(42, t + 0.35);
  g.gain.setValueAtTime(0.12 * vol, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.5);
  osc.connect(g).connect(bus);
  osc.start(t); osc.stop(t + 0.55);
}
