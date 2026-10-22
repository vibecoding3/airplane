// Paper Nosedive — the Daily dive (v160). Every UTC day has one map and one obstacle course, the same for everyone:
// both come from the day number (the server works the map out the same way, tools/supabase-daily.sql), and each row of
// the course from its own random numbers (spawnDailyRows in obstacles.js). Unlimited tries; the day's best counts. A
// daily run is a normal run otherwise (XP, stars, bests, collections). For joined players it also goes on the Daily
// dive board with its flight path, which other players see as a ghost: during a daily dive, today's top 3 and the
// player's own best fly alongside as faint planes with their names. README section 19.3.
'use strict';

const DAY_MS = 86400000;
const dayNumber = () => Math.floor(Date.now() / DAY_MS);           // UTC days since 1970 (the menu's clock, not the run's)
const dayKey = n => new Date(n * DAY_MS).toISOString().slice(0, 10);
// the same hash as daily_map() in the database: days through 2654435761, the middle bits, one of the nine maps
const dailyMapOf = n => Object.keys(MAPS)[Math.floor(((n * 2654435761) % 4294967296) / 65536) % 9];
const dailyInfo = n => ({ n, day: dayKey(n), map: dailyMapOf(n), seed: ((n * 2246822519) % 4294967296) ^ 0x5bd1e995 });

let ghosts = [];               // today's ghosts for this dive: { name, me, depth, track: [x, depth, x, depth…] }
let lastRunDaily = false;      // Play again repeats the daily dive after one
const DAILY_KEY = 'nosedive-daily';
const dailyBest = () => { try { const d = JSON.parse(store.get(DAILY_KEY)); return d && d.day === dayKey(dayNumber()) ? d.best : 0; } catch (e) { return 0; } };

// the menu button: today's map and the player's best of the day
function syncDailyButton() {
  const d = dailyInfo(dayNumber()), best = dailyBest();
  $('dailyMap').textContent = MAPS[d.map].name + (best ? ` · ${fmt(best)} m` : '');
  $('dailyBtn').title = `Today's dive: ${MAPS[d.map].name}, the same course for everyone` + (best ? `. Your best today: ${fmt(best)} m` : '');
}

// start today's dive: fetch the ghosts first (at most 2.5 s; offline it starts without them)
let dailyLoading = false;
function startDaily() {
  if (dailyLoading) return;
  const d = dailyInfo(dayNumber());
  dailyLoading = true;
  $('dailyMap').textContent = 'Loading ghosts…';
  const wait = new Promise(r => setTimeout(() => r(null), 2500));
  Promise.race([lbCall('lb_daily_ghosts', { p_day: d.day, p_visitor: visitorId }).catch(() => null), wait]).then(rows => {
    ghosts = (rows || []).filter(g => Array.isArray(g.track) && g.track.length >= 4)
      .map(g => ({ name: g.me ? 'Your best' : g.nickname, me: g.me, depth: g.depth, track: g.track }));
    dailyLoading = false;
    syncDailyButton();
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
// where a ghost was at this moment of its run: between two points of its path; past the end it has crashed there
function ghostAt(g, t) {
  const n = g.track.length / 2, f = t / GHOST_STEP, i = Math.floor(f);
  if (i >= n - 1) return { x: g.track[2 * n - 2], d: g.track[2 * n - 1], vx: 0, done: t - (n - 1) * GHOST_STEP };
  const k = f - i, x0 = g.track[2 * i], x1 = g.track[2 * i + 2];
  return { x: x0 + (x1 - x0) * k, d: g.track[2 * i + 1] + (g.track[2 * i + 3] - g.track[2 * i + 1]) * k, vx: (x1 - x0) / GHOST_STEP, done: 0 };
}
// drawn over the obstacles, under the player's plane; only in a live daily dive (not in replays, not after a crash)
function drawGhosts() {
  if (!daily || replaying || !ghosts.length || (state !== 'play' && state !== 'paused')) return;
  const py = planeScreenY();
  ctx.save();
  ctx.font = '700 12px Kalam, cursive'; ctx.textAlign = 'center';
  for (const g of ghosts) {
    const p = ghostAt(g, playClock), sy = p.d - dist + py;
    if (p.done > 2) continue;                          // crashed a while ago: gone
    if (sy < -20 || sy > H + 20) {                     // off screen: a small tag at the edge, pointing the way
      const ey = sy < 0 ? 150 : H - 46, ahead = sy > 0;   // below the top bar, above the version line
      ctx.globalAlpha = 0.75; ctx.fillStyle = darkPage ? '#e4f3fb' : COL.ink;
      ctx.fillText(`${ahead ? '▼' : '▲'} ${g.name}`, clamp(p.x, 40, W - 40), ey);
      continue;
    }
    ctx.globalAlpha = p.done ? 0.35 * (1 - p.done / 2) : g.me ? 0.3 : 0.42;
    if (p.done) { drawCrumple(p.x, sy); }
    else {
      ctx.save(); ctx.translate(p.x, sy); ctx.rotate(-Math.atan2(p.vx, speed + 60)); paintPlane(ctx, clamp(p.vx / 400, -1, 1)); ctx.restore();
    }
    ctx.globalAlpha = 0.85; ctx.fillStyle = darkPage ? '#e4f3fb' : COL.ink;
    ctx.fillText(g.name, p.x, sy - 22);
  }
  ctx.restore();
}

$('dailyBtn').addEventListener('click', startDaily);
syncDailyButton();
