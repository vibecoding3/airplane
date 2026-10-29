// Paper Nosedive — Background music, composed and played in code (Web Audio, no music files).
'use strict';

// Looping themes (title + one per map) in the style of a fantasy MMORPG soundtrack (minor keys, harp arpeggios, string
// pads, flute / horn leads; Neon City has a synthwave theme, Forest a woodland one and Desert a warm one with a hand drum). The melodies are original. The title theme plays on the menus and game over;
// each map has its own theme during a run. The sound button mutes music and effects together.

// chords as MIDI notes (low voicings; the harp plays them an octave or two higher)
const CH = {
  Dm: [50, 57, 62, 65], C: [48, 55, 60, 64], Bb: [46, 53, 58, 62], A: [45, 52, 57, 61], G: [43, 50, 55, 59],
  Am: [45, 52, 57, 60], F: [41, 48, 53, 57], E: [40, 47, 52, 56], Em: [40, 47, 52, 55], D: [38, 45, 50, 54],
  Bm: [47, 54, 59, 62], B: [47, 54, 59, 63], Dm2: [38, 45, 50, 53],
  Gm: [43, 50, 55, 58], Eb: [39, 46, 51, 55], Cm: [36, 43, 48, 51], Fmaj7: [41, 48, 52, 57], Em7: [40, 47, 50, 55], Am7: [45, 52, 55, 60], Cmaj7: [36, 43, 47, 52], Dm7: [38, 45, 48, 53]
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
  // Dungeon: slow and mysterious in D minor — a low horn over echoing harp, with a drum on the downbeats
  dungeon: {
    bpm: 66, lead: 'horn', harp: [0, 2, 1, 3], harpStep: 1, echo: 0.4, drum: true,
    chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'F', 'Gm', 'A'],
    melody: [
      [[62, 1], [65, 1], [69, 2]], [[70, 1.5], [69, 0.5], [65, 2]], [[67, 1], [70, 1], [74, 1.5], [72, 0.5]], [[73, 3], [null, 1]],
      [[74, 1.5], [72, 0.5], [69, 2]], [[72, 1], [69, 1], [65, 2]], [[67, 1], [65, 1], [64, 1], [67, 1]], [[69, 2], [61, 2]]
    ]
  },
  // Neon City: synthwave in A minor — a bright square-wave lead over echoing arpeggios, a kick on every beat,
  // off-beat hi-hats and a clap on 2 and 4
  city: {
    bpm: 100, lead: 'synth', harp: [0, 1, 2, 4, 3, 2, 1, 2], harpStep: 0.5, echo: 0.35, beat: true,
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'E'],
    melody: [
      [[76, 1], [74, 0.5], [72, 0.5], [69, 2]], [[72, 1], [74, 1], [76, 1.5], [77, 0.5]], [[79, 1.5], [76, 0.5], [72, 2]], [[74, 3], [null, 1]],
      [[69, 0.5], [72, 0.5], [76, 1], [81, 1.5], [79, 0.5]], [[77, 1], [76, 1], [72, 2]], [[74, 1], [77, 1], [76, 1], [74, 1]], [[71, 2], [68, 1], [null, 1]]
    ]
  },
  // Forest: a gentle woodland theme in E minor — a soft ocarina-like lead over plucked arpeggios, with birdsong
  forest: {
    bpm: 84, lead: 'ocarina', harp: [0, 2, 3, 1, 4, 2, 3, 1], harpStep: 0.5, echo: 0.25, birds: true,
    chords: ['Em', 'C', 'G', 'D', 'Em', 'Am', 'C', 'B'],
    melody: [
      [[71, 1], [74, 0.5], [76, 0.5], [79, 2]], [[76, 1], [74, 1], [72, 2]], [[74, 1.5], [71, 0.5], [67, 1], [71, 1]], [[69, 3], [null, 1]],
      [[76, 1], [79, 1], [83, 1.5], [81, 0.5]], [[79, 1], [76, 1], [72, 2]], [[74, 1], [76, 1], [72, 1], [71, 1]], [[71, 2], [66, 1], [null, 1]]
    ]
  },
  // Desert: a warm theme in D with a bent, exotic scale: a reedy lead over plucked lute-like arpeggios and a hand drum
  desert: {
    bpm: 92, lead: 'reed', harp: [0, 2, 1, 3, 2, 4, 3, 1], harpStep: 0.5, echo: 0.2, handDrum: true,
    chords: ['D', 'Eb', 'D', 'Gm', 'D', 'Eb', 'Cm', 'D'],
    melody: [
      [[74, 1], [72, 0.5], [70, 0.5], [69, 2]], [[70, 1], [69, 0.5], [67, 0.5], [66, 2]], [[66, 0.5], [67, 0.5], [69, 1], [70, 1], [69, 1]], [[67, 3], [null, 1]],
      [[69, 1], [70, 1], [72, 1.5], [70, 0.5]], [[70, 1], [67, 1], [63, 2]], [[67, 1], [66, 1], [63, 1], [66, 1]], [[62, 3], [null, 1]]
    ]
  },
  // Volcano: a heavy, smouldering theme in E Phrygian: a brassy lead over a low arpeggio and pounding big drums
  volcano: {
    bpm: 104, lead: 'brass', harp: [0, 1, 2, 1, 0, 2, 3, 2], harpStep: 0.5, echo: 0.15, taiko: true,
    chords: ['Em', 'F', 'Em', 'Dm', 'C', 'F', 'Dm', 'Em'],
    melody: [
      [[64, 0.5], [64, 0.5], [65, 1], [64, 2]], [[69, 1], [67, 0.5], [65, 0.5], [64, 2]], [[71, 1.5], [72, 0.5], [71, 1], [67, 1]], [[69, 3], [null, 1]],
      [[72, 1], [71, 0.5], [69, 0.5], [67, 1], [69, 1]], [[65, 1], [69, 1], [72, 2]], [[74, 1], [72, 1], [69, 1], [65, 1]], [[64, 3], [null, 1]]
    ]
  },
  // Kitchen: a cosy, bouncy café-jazz theme in F: a plucked marimba lead over pizzicato chords and soft brushes, with a
  // little oven-timer "ding" at the end of the loop
  kitchen: {
    bpm: 100, lead: 'marimba', harp: [0, 2, 1, 3, 0, 2, 1, 4], harpStep: 0.5, echo: 0.15, brushes: true, ding: true,
    chords: ['F', 'Dm', 'Gm', 'C', 'F', 'Dm', 'Bb', 'C'],
    melody: [
      [[69, 0.5], [72, 0.5], [77, 1], [76, 0.5], [74, 0.5], [72, 1]], [[74, 1], [77, 0.5], [74, 0.5], [69, 2]], [[70, 0.5], [74, 0.5], [77, 1], [79, 1], [77, 1]], [[76, 1.5], [74, 0.5], [72, 2]],
      [[69, 0.5], [72, 0.5], [77, 1], [81, 1], [79, 1]], [[77, 1], [74, 1], [69, 1], [74, 1]], [[70, 1], [74, 0.5], [77, 0.5], [79, 1], [77, 1]], [[76, 1], [79, 1], [77, 2]]
    ]
  },
  // Ocean, sunlit reef (v172): bright and playful in A Dorian (a minor key with a raised 6th, F#): a flute over quick
  // harp eighths and a soft shaker
  seaReef: {
    bpm: 76, lead: 'flute', harp: [0, 1, 2, 3, 4, 3, 2, 1], harpStep: 0.5, echo: 0.2, shaker: true,
    chords: ['Am', 'D', 'G', 'Am', 'Am', 'D', 'C', 'E'],
    melody: [
      [[76, 1], [78, 0.5], [79, 0.5], [81, 2]], [[78, 1], [74, 1], [78, 1], [81, 1]], [[79, 1.5], [78, 0.5], [76, 1], [74, 1]], [[76, 3], [null, 1]],
      [[81, 1], [83, 0.5], [84, 0.5], [81, 2]], [[78, 1], [76, 0.5], [74, 0.5], [78, 2]], [[79, 1], [76, 1], [72, 1], [76, 1]], [[71, 2], [68, 1], [null, 1]]
    ]
  },
  // Ocean, sunken ruins (v172): ancient and mysterious in A Phrygian (a flat 2nd, Bb): a slow horn, temple-bell chimes
  // and long echoes
  seaRuins: {
    bpm: 60, lead: 'horn', harp: [0, 2, 1, 3], harpStep: 1, echo: 0.5, bells: true,
    chords: ['Am', 'Bb', 'Am', 'Gm', 'F', 'Gm', 'Bb', 'Am'],
    melody: [
      [[69, 2], [70, 1], [72, 1]], [[74, 3], [72, 1]], [[70, 1], [69, 1], [76, 2]], [[74, 3], [null, 1]],
      [[72, 1], [74, 1], [77, 2]], [[79, 1.5], [77, 0.5], [74, 2]], [[74, 1], [72, 1], [70, 1], [72, 1]], [[69, 3], [null, 1]]
    ]
  },
  // Ocean, dome city (v172): warm, magical and a little mechanical, A minor turning to C major: a music-box lead over
  // string pads, with a soft clock tick on every beat
  seaDome: {
    bpm: 72, lead: 'musicbox', harp: [0, 1, 2, 3], harpStep: 1, echo: 0.3, tick: true,
    chords: ['Am', 'Fmaj7', 'C', 'G', 'Cmaj7', 'Am7', 'Fmaj7', 'G'],
    melody: [
      [[69, 0.5], [72, 0.5], [76, 1], [74, 0.5], [72, 0.5], [71, 1]], [[72, 1], [69, 1], [65, 2]], [[67, 0.5], [72, 0.5], [76, 1], [79, 1], [76, 1]], [[74, 3], [null, 1]],
      [[76, 0.5], [79, 0.5], [83, 1], [81, 0.5], [79, 0.5], [76, 1]], [[72, 1], [76, 1], [79, 2]], [[77, 1], [76, 0.5], [74, 0.5], [72, 1], [69, 1]], [[71, 2], [74, 1], [null, 1]]
    ]
  },
  // Ocean, the abyss (v172): dark, vast and almost silent: a deep drone, slow single low-flute notes, one harp note a
  // bar and a faint sonar ping every other bar
  seaAbyss: {
    bpm: 52, lead: 'deep', harp: [0], harpStep: 4, echo: 0.5, drone: true, sonar: true,
    chords: ['Am', 'Am', 'F', 'F', 'Dm2', 'Dm2', 'E', 'E'],
    melody: [
      [[null, 2], [76, 2]], [[74, 4]], [[null, 2], [72, 2]], [[69, 4]],
      [[null, 2], [77, 2]], [[76, 4]], [[null, 2], [74, 2]], [[71, 2], [null, 2]]
    ]
  },
  // Ocean: slow and dark, long echoing harp notes and a lonely low flute (the twilight zone's theme since v172)
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

// start a theme (cross-fading from the current one); calling it with the theme already playing does nothing. `slow`
// is a region change (v172): the old theme fades out while the new one fades in, both over REGION_FADE seconds
const REGION_FADE = 4;
function setMusic(name, slow) {
  if (name === music.name || !THEMES[name] || !musicGraph()) return;
  const a = actx, t = a.currentTime;
  if (music.bus) {                               // fade the old theme out, then drop it
    const old = music.bus;
    if (slow) { old.gain.cancelScheduledValues(t); old.gain.setValueAtTime(old.gain.value, t); old.gain.linearRampToValueAtTime(0, t + REGION_FADE); }
    else old.gain.setTargetAtTime(0, t, 0.4);
    setTimeout(() => old.disconnect(), slow ? REGION_FADE * 1000 + 500 : 2500);
  }
  music.bus = a.createGain();
  music.bus.gain.setValueAtTime(0, t);
  if (slow) music.bus.gain.linearRampToValueAtTime(1, t + REGION_FADE); else music.bus.gain.setTargetAtTime(1, t + 0.1, 0.5);
  music.bus.connect(music.master);
  music.name = name; music.theme = THEMES[name]; music.bar = 0; music.next = t + 0.15;
  if (!music.timer) music.timer = setInterval(scheduleMusic, 100);
  scheduleMusic();
}

// a run's theme: on a map with regions, the theme of the region the plane is in (v172), otherwise the map's own
function runTheme() {
  return hasRegions(mapId) ? MAP_REGIONS[mapId][regionIndexAtM(mapId, dist / PX_PER_M)].music || mapId : mapId;
}
// called every frame: crossing a region line fades slowly into the next region's theme
function syncRegionMusic() {
  if (hasRegions(mapId) && (state === 'play' || state === 'paused' || state === 'dying')) setMusic(runTheme(), true);
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
    if (n != null && th.lead === 'musicbox') pluck(bus, hz(n + 12), t0 + s * beat, Math.min(1.6, b * beat * 1.5), 0.05, 0.3);   // a bell-like music-box note
    else if (n != null && th.lead === 'marimba') pluck(bus, hz(n), t0 + s * beat, Math.min(1.2, b * beat * 1.4), 0.09, 0.12);   // a struck, quickly fading note
    else if (n != null) lead(bus, th.lead, hz(th.lead === 'deep' ? n - 12 : n), t0 + s * beat, b * beat);
    s += b;
  }
  if (th.drum) { drum(bus, t0); drum(bus, t0 + 2 * beat, 0.6); }
  if (th.handDrum) {                              // a hand drum: a deep dum on 1 and the and-of-3, light teks between
    drum(bus, t0, 0.7); drum(bus, t0 + 2.5 * beat, 0.55);
    for (const b of [1, 1.5, 3, 3.5]) hiss(bus, t0 + b * beat, 0.05, 2600, 0.03);
  }
  if (th.taiko) {                                 // big drums: boom on 1, a double hit on the and-of-2, a boom on 4
    for (const [b, v] of [[0, 1], [1.5, 0.6], [2, 0.75], [3, 0.9]]) drum(bus, t0 + b * beat, v);
    hiss(bus, t0 + 3.5 * beat, 0.08, 3200, 0.03);
  }
  if (th.brushes) for (let b = 0; b < 4; b++) {  // soft brushes: a swish on every beat, a little louder on 2 and 4
    hiss(bus, t0 + b * beat, 0.18, 3800, b % 2 ? 0.035 : 0.02);
    if (b === 0) drum(bus, t0, 0.35);
  }
  if (th.shaker) for (let b = 0; b < 4; b++) hiss(bus, t0 + (b + 0.5) * beat, 0.06, 6000, 0.012);   // a soft shaker on the off-beats
  if (th.bells) {                                 // temple bells: a high chime on 1 and a softer one on 3, ringing into the echo
    pluck(bus, hz(chord[0] + 36), t0, 2.6, 0.03, 0.5);
    pluck(bus, hz(chord[2] + 24), t0 + 2 * beat, 2, 0.018, 0.5);
  }
  if (th.tick) for (let b = 0; b < 4; b++) hiss(bus, t0 + b * beat, 0.02, 5000, b ? 0.01 : 0.016);   // a clock ticking
  if (th.drone) note(bus, 'sawtooth', hz(chord[0] - 12), t0, barLen + 0.4, 0.012, 1, 1, { lp: 300 });   // a deep drone
  if (th.sonar && i % 2 === 0) pluck(bus, hz(93), t0 + 2 * beat, 1.2, 0.02, 0.6);                      // a faint sonar ping
  if (th.ding && i === th.chords.length - 1) note(bus, 'sine', hz(96), t0 + 3 * beat, 1.2, 0.03, 0.005, 1.1);   // the oven timer
  if (th.birds) for (let b = 0; b < 4; b++) if (realRandom() < 0.3) chirp(bus, t0 + (b + realRandom() * 0.5) * beat);   // birdsong
  if (th.beat) for (let b = 0; b < 4; b++) {     // a dance beat: kick, off-beat hat, clap on 2 and 4
    drum(bus, t0 + b * beat, b % 2 ? 0.55 : 0.8);
    hiss(bus, t0 + (b + 0.5) * beat, 0.05, 7000, 0.035);
    if (b % 2) hiss(bus, t0 + b * beat, 0.14, 1500, 0.05);
  }
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
// lead voices: flute (sine with vibrato), deep flute (lower, slower), horn (filtered saw), synth (filtered square), ocarina (soft triangle), reed (brighter filtered saw),
// brass (darker, louder filtered saw)
function lead(bus, kind, f, t, dur) {
  const a = actx, osc = a.createOscillator(), g = a.createGain(), vib = a.createOscillator(), vg = a.createGain();
  const horn = kind === 'horn' || kind === 'brass', brass = kind === 'brass', synth = kind === 'synth', ocarina = kind === 'ocarina', reed = kind === 'reed';
  osc.type = horn || reed ? 'sawtooth' : synth ? 'square' : ocarina ? 'triangle' : 'sine'; osc.frequency.value = f;
  vib.frequency.value = kind === 'deep' ? 4 : kind === 'space' ? 3 : 5.5; vg.gain.value = f * (kind === 'space' ? 0.009 : 0.006);
  vib.connect(vg).connect(osc.frequency);
  const vol = brass ? 0.045 : horn ? 0.035 : reed ? 0.03 : synth ? 0.026 : ocarina ? 0.07 : kind === 'deep' ? 0.07 : kind === 'space' ? 0.05 : 0.06, att = horn ? 0.12 : synth ? 0.02 : kind === 'space' ? 0.25 : 0.08;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + att);
  g.gain.setValueAtTime(vol * 0.85, Math.max(t + att, t + dur - 0.15));
  g.gain.linearRampToValueAtTime(0, t + dur + 0.05);
  let out = osc;
  if (horn || synth || reed) { const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = brass ? 1000 : horn ? 1300 : reed ? 1800 : 2200; osc.connect(lp); out = lp; }
  out.connect(g).connect(bus);
  if (kind === 'deep' || kind === 'space' || synth || ocarina) { const e = a.createGain(); e.gain.value = kind === 'space' ? 0.45 : synth || ocarina ? 0.25 : 0.3; g.connect(e).connect(music.echo); }
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
// a short burst of filtered noise: a hi-hat (high, short) or a clap (lower, longer)
let hissBuf = null;
function hiss(bus, t, dur, freq, vol) {
  const a = actx;
  if (!hissBuf) {
    hissBuf = a.createBuffer(1, Math.floor(a.sampleRate * 0.2), a.sampleRate);
    const d = hissBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = realRandom() * 2 - 1;
  }
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = hissBuf; f.type = freq > 4000 ? 'highpass' : 'bandpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  src.connect(f).connect(g).connect(bus);
  src.start(t); src.stop(t + dur + 0.02);
}
// a little bird call: two quick rising whistles (Forest theme)
function chirp(bus, t) {
  const a = actx, f = 2400 + realRandom() * 1200;
  for (const k of [0, 0.09]) {
    const osc = a.createOscillator(), g = a.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(f, t + k); osc.frequency.exponentialRampToValueAtTime(f * 1.35, t + k + 0.06);
    g.gain.setValueAtTime(0, t + k); g.gain.linearRampToValueAtTime(0.018, t + k + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t + k + 0.07);
    osc.connect(g).connect(bus); osc.start(t + k); osc.stop(t + k + 0.08);
  }
}
