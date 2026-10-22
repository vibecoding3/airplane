// Paper Nosedive — the Daily dive (v160). Every UTC day has one map and one obstacle course, the same for everyone:
// both come from the day number (the server works the map out the same way, tools/supabase-daily.sql), and each row of
// the course from its own random numbers (spawnDailyRows in obstacles.js). Unlimited tries; the day's best counts. A
// daily run is a normal run otherwise (XP, stars, bests, collections). For joined players it also goes on the Daily
// dive board with its flight path, which other players see as a ghost: during a daily dive, today's top 3 and the
// player's own best fly alongside as faint planes (no names or tags since v162, so several stay calm to look at).
// README section 19.3.
'use strict';

const DAY_MS = 86400000;
const dayNumber = () => Math.floor(Date.now() / DAY_MS);           // UTC days since 1970 (the menu's clock, not the run's)
const dayKey = n => new Date(n * DAY_MS).toISOString().slice(0, 10);
// the same hash as daily_map() in the database: days through 2654435761, the middle bits, one of the nine maps
const dailyMapOf = n => Object.keys(MAPS)[Math.floor(((n * 2654435761) % 4294967296) / 65536) % 9];
const dailyInfo = n => ({ n, day: dayKey(n), map: dailyMapOf(n), seed: ((n * 2246822519) % 4294967296) ^ 0x5bd1e995 });

let ghosts = [];               // today's ghosts for this dive: { me, depth, step (s between points), p: [x, depth, x, depth…] }
let lastRunDaily = false;      // Play again repeats the daily dive after one
const DAILY_KEY = 'nosedive-daily';
const dailyBest = () => { try { const d = JSON.parse(store.get(DAILY_KEY)); return d && d.day === dayKey(dayNumber()) ? d.best : 0; } catch (e) { return 0; } };

// the menu button: today's map and the player's best of the day
function syncDailyButton() {
  const d = dailyInfo(dayNumber()), best = dailyBest();
  $('dailyMap').textContent = MAPS[d.map].name + (best ? ` · ${fmt(best)} m` : '');
  $('dailyBtn').title = `Today's dive: ${MAPS[d.map].name}, the same course for everyone` + (best ? `. Your best today: ${fmt(best)} m` : '');
}

// start today's dive: fetch the ghosts first (at most 2.5 s; offline it starts without them). The button keeps its text
// meanwhile; a second press is ignored.
let dailyLoading = false;
// a flight path as stored: { step, p } since v162 (10 points a second), or the bare 4-a-second list of v160–v161
const ghostPath = t => (Array.isArray(t) ? { step: 0.25, p: t } : t && Array.isArray(t.p) ? { step: +t.step || GHOST_STEP, p: t.p } : null);
function startDaily() {
  if (dailyLoading) return;
  const d = dailyInfo(dayNumber());
  dailyLoading = true;
  const wait = new Promise(r => setTimeout(() => r(null), 2500));
  Promise.race([lbCall('lb_daily_ghosts', { p_day: d.day, p_visitor: visitorId }).catch(() => null), wait]).then(rows => {
    ghosts = (rows || []).map(g => ({ me: g.me, depth: g.depth, ...ghostPath(g.track) })).filter(g => g.p && g.p.length >= 4);
    dailyLoading = false;
    if (mapId !== d.map) { mapId = d.map; applyMap(); }
    start(d);
  });
}

// a daily run ended (from keepRunProgress): the day's best on this device
function dailyRunEnded(depth) {
  if (!daily) return;
  if (depth > dailyBest()) store.set(DAILY_KEY, JSON.stringify({ day: daily.day, best: depth }));
}

// ---------- the ghosts ----------
// a smooth curve through four points (Catmull-Rom), and how fast it moves there
const curve = (a, b, c, d, t) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
const curveSlope = (a, b, c, d, t) => 0.5 * ((c - a) + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (3 * b - a - 3 * c + d) * t * t);
// where a ghost was at this moment of its run, on a smooth curve through its path; past the end it has crashed there
function ghostAt(g, t) {
  const n = g.p.length / 2, f = t / g.step, i = Math.floor(f);
  if (i >= n - 1) return { x: g.p[2 * n - 2], d: g.p[2 * n - 1], vx: 0, vd: 0, done: t - (n - 1) * g.step };
  const k = f - i, at = j => 2 * clamp(j, 0, n - 1);
  const X = [i - 1, i, i + 1, i + 2].map(j => g.p[at(j)]), D = [i - 1, i, i + 1, i + 2].map(j => g.p[at(j) + 1]);
  return { x: curve(...X, k), d: curve(...D, k), vx: curveSlope(...X, k) / g.step, vd: curveSlope(...D, k) / g.step, done: 0 };
}
// a ghost's tilt eases toward where it is heading, like the player's plane (plane.ang in physics.js), instead of snapping
function ghostTilt(g, p) {
  const target = Math.atan2(p.vx, Math.max(p.vd, 0) + 60), dt = clamp(playClock - (g.at || 0), 0, 0.1);
  g.at = playClock;
  g.ang = g.ang == null ? target : g.ang + (target - g.ang) * Math.min(1, 12 * dt);
  return g.ang;
}
// drawn over the obstacles, under the player's plane, every frame; only in a live daily dive (not in replays, not after a
// crash). Ghosts off the screen simply aren't drawn.
function drawGhosts() {
  if (!daily || replaying || !ghosts.length || (state !== 'play' && state !== 'paused')) return;
  const py = planeScreenY();
  ctx.save();
  for (const g of ghosts) {
    const p = ghostAt(g, playClock), sy = p.d - dist + py;
    if (p.done > 2 || sy < -30 || sy > H + 30) continue;   // crashed a while ago, or off the screen
    ctx.globalAlpha = p.done ? 0.35 * (1 - p.done / 2) : g.me ? 0.3 : 0.42;
    if (p.done) drawCrumple(p.x, sy);
    else {
      ctx.save(); ctx.translate(p.x, sy); ctx.rotate(-ghostTilt(g, p)); paintPlane(ctx, clamp(p.vx / 400, -1, 1)); ctx.restore();
    }
  }
  ctx.restore();
}

$('dailyBtn').addEventListener('click', startDaily);
syncDailyButton();
