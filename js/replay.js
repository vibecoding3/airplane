// Paper Nosedive — replays (v157). A run is recorded as its random seed, the world height, every frame's time step and
// every steering input (with the frame it came on); watching it runs the same game code again with the same numbers,
// so it plays back exactly. That only holds on the game version it was recorded with, so the version is stored too.
// Every finished run's replay is sent to Supabase (website only, like the play log; tools/supabase-replays.sql,
// README section 19.2); the "Watch replay" button on the game-over screen plays the run just finished from memory,
// so it works offline. Watching changes nothing: no progress, log, leaderboard or collection is touched.
'use strict';

const CHECK_EVERY = 60;              // frames between checks that the replay still matches the run
let runRandom = realRandom;          // the run's own random sequence (seededRandom), used inside simFrame only
let rec = null;                      // the recording of the run being played, or null
let lastReplay = null;               // the finished run's recording, for the "Watch replay" button
let replaying = null;                // the recording being watched, or null
let applyingReplay = false;          // true while a replay feeds its recorded inputs in
let rFrame = 0, rEvent = 0, rCheck = 0, rH = 0, rSpeed = 1;

// a run's state in one number, compared at the same frames when watching (drift shows up as a mismatch)
const runCheck = () => (Math.round(dist * 10) * 31 + Math.round(plane.x * 10) * 7 + obstacles.length * 131 + stars * 17 + Math.round(speed)) | 0;

// steering only comes from the player in a live run, and only from the recording while watching
const inputAllowed = () => !replaying || applyingReplay;
function recInput(kind, side, source) {
  if (rec && !replaying) rec.ev.push([rec.n, kind, side, source || '']);
}

function startRecording() {
  const seed = Math.floor(realRandom() * 4294967296);
  runRandom = seededRandom(seed);
  rec = { v: ($('version').textContent.match(/v\d+/) || ['v?'])[0], map: mapId, seed, H, n: 0, dts: [], ev: [], ck: [] };
}

// one frame of a run, for live play and replays alike: the time step is rounded to whole milliseconds so it can be
// stored exactly (one character per frame), and the world runs on the run's own random numbers
function simFrame(dt) {
  dt = Math.round(dt * 1000) / 1000;
  if (rec && !replaying) {
    if (H !== rec.lastH && rec.n) rec.ev.push([rec.n, 'h', H, '']);   // the window changed size mid-run
    rec.lastH = H;
    rec.dts.push(Math.round(dt * 1000));
    rec.n++;
  }
  playClock += dt;
  const sdt = dt * timeScale();                 // slow motion runs the world at half speed
  // at high speed, split the frame so the plane can't skip through thin obstacles
  const steps = state === 'play' ? Math.max(1, Math.ceil(speed * sdt / 10)) : 1;
  const keep = Math.random;
  Math.random = runRandom;
  try { for (let i = 0; i < steps; i++) update(sdt / steps); } finally { Math.random = keep; }
  if (rec && !replaying && rec.n % CHECK_EVERY === 0) rec.ck.push(runCheck());
}

// the run is over (crash or Exit run, from keepRunProgress): keep it for the button and send it to the server
function finishRecording(depth, ended) {
  if (!rec || replaying) return;
  const r = rec; rec = null;
  r.depth = depth; r.ended = ended; r.stars = stars;
  delete r.lastH;
  if (!r.n) { lastReplay = null; return; }
  lastReplay = r;
  // frame steps as one character each: milliseconds from '0' (a 3-minute run is about 11 KB)
  const dts = String.fromCharCode(...r.dts.map(ms => 48 + ms));
  const data = { seed: r.seed, H: r.H, dts, ev: r.ev, ck: r.ck, stars: r.stars, ended };
  logRow('replays', { id: newId(), visit_id: visitId, visitor_id: visitorId, version: r.v, map: r.map, depth, frames: r.n, data });
}

// ---------- watching ----------
function watchReplay() {
  const r = lastReplay;
  if (!r || state !== 'over') return;
  replaying = r; rFrame = 0; rEvent = 0; rCheck = 0; rH = r.H; rSpeed = 1;
  if (mapId !== r.map) { mapId = r.map; applyMap(); }
  reset();
  lastType = '';
  runRandom = seededRandom(r.seed);
  H = rH;
  state = 'play';
  clearControls();
  showCard(null);
  $('replayBar').hidden = false;
  $('replaySpeed').textContent = '1×';
  setMusic(mapId);
  sfx.throw();
}
// one frame of the replay, at the recorded step, with the inputs that came on that frame
function replayStep() {
  const r = replaying;
  if (rFrame >= r.n) { endReplay(r.ended === 'exit' ? '' : 'drift'); return; }
  applyingReplay = true;
  while (rEvent < r.ev.length && r.ev[rEvent][0] === rFrame) {
    const [, kind, side, source] = r.ev[rEvent++];
    if (kind === 'p') press(side, source);
    else if (kind === 'r') release(source);
    else if (kind === 'u') { holdSide = 0; holdSource = null; }
    else if (kind === 'h') rH = side;
  }
  applyingReplay = false;
  H = rH;                                          // the recorded world height, even if this window differs
  simFrame(r.dts[rFrame] / 1000);
  rFrame++;
  if (replaying && rFrame % CHECK_EVERY === 0 && r.ck[rCheck++] !== runCheck()) endReplay('drift');
}
// the replay is over: back to the game-over screen as it was (the sim's own game over lands here too)
function endReplay(why) {
  if (!replaying) return;
  replaying = null; applyingReplay = false;
  state = 'over';
  clearControls();
  resize();                                        // this window's own height again
  $('replayBar').hidden = true;
  setMusic('title');
  showCard('over');
  if (why === 'drift') floaters.push({ x: W / 2, y: dist + H * 0.4, life: 2.5, size: 20, col: '#c4302b', text: 'Replay stopped: it no longer matches the run' });
}
function syncReplayButton() {
  $('replayBtn').hidden = !lastReplay;
}

$('replayBtn').addEventListener('click', watchReplay);
$('replayExit').addEventListener('click', () => endReplay(''));
$('replaySpeed').addEventListener('click', () => { rSpeed = rSpeed === 1 ? 2 : rSpeed === 2 ? 4 : 1; $('replaySpeed').textContent = rSpeed + '×'; });
