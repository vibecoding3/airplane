// Paper Nosedive — leaderboards (v144). To see them a player picks a unique nickname, tied for good to their anonymous
// visitor id (js/playlog.js), which works as their private key: it is never shown, the boards only list nicknames.
// Boards: the total score (all maps' bests added up) and one per map, top 20 plus the player's own row, and the Level
// board, top 10 by XP (v146), and the Time played board, top 10 by the seconds of counted runs (v149). On opening the screen all the device's bests are sent once, so records made before
// joining count too. Since v146 the server keeps the XP of players with a nickname: every finished run is queued on
// the device and sent in order whenever there is a connection; the server checks and adds it, and the menu then shows
// the server's XP. Since v158 a run that beats the map's best on the device carries its replay in the queue; once the
// server has counted the run the replay goes up too (one per player and map, the best), and map-board rows with a
// replay get a ▶ button to watch it. Everything goes through database functions (tools/supabase-leaderboards.sql,
// tools/supabase-levels.sql, tools/supabase-board-replays.sql, README sections 19.1 and 19.2). Offline the screen just
// says so: the game itself never needs it.
const LB_MAPS = ['daily', 'total', 'level', 'time', ...Object.keys(MAPS)];   // 'daily': today's dive (v160), left of Total
const NICK_RULE = /^[A-Za-z0-9_.-][A-Za-z0-9_. -]{1,14}[A-Za-z0-9_.-]$/;    // the same rule as the database
let lbNick = store.get('nosedive-nick') || '', lbMap = 'total', lbSynced = false, lbLoad = 0;

// call one of the leaderboard functions; rejects when offline, slow (8 s) or refused
function lbCall(fn, args) {
  const ctl = window.AbortController ? new AbortController() : null;
  const timer = setTimeout(() => ctl && ctl.abort(), 8000);
  return fetch(`${LOG_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST', signal: ctl && ctl.signal,
    headers: { apikey: LOG_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args)
  }).then(r => { setNet('online'); if (!r.ok) throw new Error(fn + ' ' + r.status); return r.status === 204 ? null : r.json(); },
    e => { setNet('offline'); throw e; })
    .finally(() => clearTimeout(timer));
}
const lbSubmit = (map, depth) => lbCall('lb_submit', { p_visitor: visitorId, p_map: map, p_depth: depth });

// ---------- server-side XP (v146) ----------
// Runs wait in a queue on the device (kept across reloads) until the server has them; each has its own id, so a retry
// never counts twice. The XP the device had before joining is sent once first (carried over as it was).
const RUNQ_KEY = 'nosedive-runq', XP_IMPORTED_KEY = 'nosedive-xp-imported';
let lbQueue = [];
try { lbQueue = JSON.parse(store.get(RUNQ_KEY)) || []; } catch (e) { /* a broken queue: start a new one */ }
const saveQueue = () => store.set(RUNQ_KEY, JSON.stringify(lbQueue));
let xpSync = null;
function lbSyncXp() {
  if (!lbNick) return Promise.resolve();
  return xpSync || (xpSync = (async () => {
    let serverXp = null;
    if (store.get(XP_IMPORTED_KEY) !== visitorId) {
      const queued = lbQueue.reduce((sum, r) => sum + r.depth, 0);   // already in the device's XP: sent with their runs
      serverXp = await lbCall('lb_xp_start', { p_visitor: visitorId, p_xp: Math.max(0, xp - queued) });
      store.set(XP_IMPORTED_KEY, visitorId);
    }
    while (lbQueue.length) {
      const r = lbQueue[0];
      serverXp = await lbCall('lb_run', { p_visitor: visitorId, p_run: r.id, p_map: r.map, p_depth: r.depth, p_duration: r.dur });
      if (serverXp === -1) serverXp = null;
      else if (r.replay) {                          // a counted record run: its replay goes up (a retry is harmless)
        try {
          await lbCall('lb_save_replay', { p_visitor: visitorId, p_run: r.id, p_map: r.map, p_depth: r.depth, p_sv: r.sv, p_version: r.v, p_data: r.replay });
        } catch (e) { if (!/ 4\d\d$/.test(e.message)) throw e; }   // refused (too big, say): drop it; offline: try again later
      }
      if (serverXp !== null && r.daily) {           // a counted daily dive: the Daily board and the ghosts
        try {
          await lbCall('lb_daily_submit', { p_visitor: visitorId, p_run: r.id, p_day: r.daily.day, p_map: r.map, p_depth: r.depth, p_track: r.daily.track });
        } catch (e) { if (!/ 4\d\d$/.test(e.message)) throw e; }
      }
      lbQueue.shift(); saveQueue();                 // counted, already counted, or refused (-1): done with it
    }
    if (serverXp === null) serverXp = await lbCall('lb_my_xp', { p_visitor: visitorId });
    if (typeof serverXp === 'number' && serverXp >= 0 && !lbQueue.length) setServerXp(serverXp);
  })().catch(() => { /* offline: the queue waits */ }).finally(() => { xpSync = null; }));
}
// the server's XP becomes the device's: the menu's level is the one on the Level board
function setServerXp(v) {
  xp = v; store.set('nosedive-xp', String(v));
  if (state === 'title' && !ui.title.hidden) setXp($('titleXp'), levelInfo(xp), 0, true);
}
// after a run (from keepRunProgress): queue it for the server, which adds its XP and counts it as a best on its map;
// a new best on the device takes its replay along (lastReplay, just finished)
function lbRunEnded(depth, record) {
  if (!lbNick) return;
  const run = { id: newId(), map: mapId, depth, dur: Math.round(time) };
  if (record && lastReplay && lastReplay.depth === depth) Object.assign(run, { replay: packReplay(lastReplay), sv: lastReplay.sv, v: lastReplay.v });
  if (daily && lastReplay && lastReplay.track && lastReplay.depth === depth) run.daily = { day: daily.day, track: { step: GHOST_STEP, p: lastReplay.track } };
  lbQueue.push(run);
  saveQueue();
  lbSyncXp();
  rankAt = 0;                                     // the place may have changed: ask again on the start menu
}

// ---------- the place on the Total score board, left of Total score on the start menu (v147) ----------
// Joined players only. Asked for (after sending what's waiting) whenever the start menu shows, at most every 30 s or
// after a run; the last answer is kept on the device and shown meanwhile, also offline.
let rankAt = 0;
function showRank(r) {
  const el = $('menuRank');
  el.hidden = !(lbNick && r > 0);
  el.textContent = '#' + fmt(r);
}
function lbRefreshRank() {
  showRank(+store.get('nosedive-rank') || 0);
  if (!lbNick || Date.now() - rankAt < 30000) return;
  rankAt = Date.now();
  Promise.all([lbSyncBests().catch(() => {}), lbSyncXp()])
    .then(() => lbCall('lb_board', { p_map: 'total', p_visitor: visitorId }))
    .then(rows => { const me = rows.find(r => r.me), r = me ? me.rank : 0; store.set('nosedive-rank', String(r)); showRank(r); })
    .catch(() => { rankAt = 0; });              // offline: try again next time
}
window.addEventListener('online', () => lbSyncXp());
lbSyncXp();
// every map's best on this device, once per session (the database keeps the higher of the two)
function lbSyncBests() {
  if (lbSynced) return Promise.resolve();
  return Promise.all(Object.keys(MAPS).filter(m => bests[m] > 0).map(m => lbSubmit(m, bests[m]))).then(() => { lbSynced = true; });
}

function lbShow(joined) {
  $('lbJoin').hidden = joined;
  $('lbBoard').hidden = !joined;
  if (joined) $('lbName').textContent = lbNick;
}
function setNick(n) { lbNick = n; store.set('nosedive-nick', n); }

function openLeaderboards() {
  showCard('lb');
  lbShow(!!lbNick);
  $('lbJoinMsg').textContent = '';
  if (lbNick) { Promise.all([lbSyncBests().catch(() => {}), lbSyncXp()]).finally(() => renderBoard()); return; }
  $('lbNick').value = '';
  // a device that joined before but lost its saved nickname gets it back
  lbCall('lb_me', { p_visitor: visitorId }).then(n => { if (n && !lbNick && !ui.lb.hidden) { setNick(n); openLeaderboards(); } }).catch(() => {});
}
function closeLeaderboards() { showCard('title'); }

$('lbJoin').addEventListener('submit', e => {
  e.preventDefault();
  const nick = $('lbNick').value.trim().replace(/\s+/g, ' '), msg = $('lbJoinMsg');
  if (!NICK_RULE.test(nick)) { msg.textContent = 'Use 3–16 letters (A–Z), numbers, spaces, dots, dashes or underscores.'; return; }
  const btn = $('lbJoinBtn');
  btn.disabled = true; msg.textContent = 'Checking…';
  lbCall('lb_claim', { p_visitor: visitorId, p_nickname: nick }).then(res => {
    if (res === 'taken') { msg.textContent = `“${nick}” is taken. Try another one.`; return; }
    if (res === 'invalid') { msg.textContent = 'That nickname isn’t allowed. Use 3–16 letters, numbers, spaces, dots, dashes or underscores.'; return; }
    if (res === 'already') return lbCall('lb_me', { p_visitor: visitorId }).then(n => { setNick(n); openLeaderboards(); });
    setNick(nick); lbSynced = false; rankAt = 0; openLeaderboards();      // opening syncs the bests and carries the XP over
  }).catch(() => { msg.textContent = 'Can’t reach the server. Check your connection and try again.'; })
    .finally(() => { btn.disabled = false; });
});

// the board on show: arrows step through Total score, Level, Time played and the nine maps
const LB_TOP10 = { level: ['lb_levels', 'Level'], time: ['lb_time', 'Time played'] };   // top 10 only, no own row
// seconds as "42 min" or "12 h 30 min"
const playTime = s => { const m = Math.floor(s / 60), h = Math.floor(m / 60); return h ? `${fmt(h)} h ${m % 60} min` : `${m} min`; };
function lbStep(dir) {
  lbMap = LB_MAPS[(LB_MAPS.indexOf(lbMap) + dir + LB_MAPS.length) % LB_MAPS.length];
  renderBoard();
}
function renderBoard() {
  const top10 = LB_TOP10[lbMap], today = dailyInfo(dayNumber());
  $('lbMapName').textContent = lbMap === 'total' ? 'Total score' : lbMap === 'daily' ? `Daily · ${MAPS[today.map].name}` : top10 ? top10[1] : MAPS[lbMap].name;
  const list = $('lbList'), msg = $('lbMsg'), load = ++lbLoad;
  list.replaceChildren(); msg.textContent = 'Loading…';
  const call = lbMap === 'daily' ? lbCall('lb_daily_board', { p_day: today.day, p_visitor: visitorId })
    : lbCall(top10 ? top10[0] : 'lb_board', top10 ? { p_visitor: visitorId } : { p_map: lbMap, p_visitor: visitorId });
  call.then(rows => {
    if (load !== lbLoad) return;                     // an older request answering after a newer one
    list.classList.toggle('with-play', !!MAPS[lbMap]);
    msg.textContent = rows.length ? '' : lbMap === 'daily' ? 'No one has dived today yet. Be the first!' : 'No one on this board yet. Play a run and be the first!';
    let prev = 0;
    for (const r of rows) {
      if (r.rank > prev + 1 && prev) { const gap = document.createElement('li'); gap.className = 'lb-gap'; gap.textContent = '…'; list.append(gap); }
      const li = document.createElement('li');
      if (r.me) li.className = 'me';
      for (const [cls, text] of [['lb-rank', '#' + r.rank], ['lb-nick', r.nickname], ['lb-depth', lbMap === 'level' ? 'Level ' + levelInfo(r.depth).level : lbMap === 'time' ? playTime(r.depth) : fmt(r.depth) + (lbMap === 'total' ? '' : ' m')]]) {
        const s = document.createElement('span'); s.className = cls; s.textContent = text; li.append(s);
      }
      if (MAPS[lbMap]) {                              // map boards: watch the run behind the row, if it has a replay
        const cell = document.createElement('span'); cell.className = 'lb-play';
        if (r.replay && r.replay_sv === SIM_VERSION) {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'lb-play-btn'; b.textContent = '▶';
          b.title = `Watch ${r.nickname}'s ${fmt(r.depth)} m run`; b.setAttribute('aria-label', b.title);
          b.addEventListener('click', () => lbWatch(r.replay, b));
          cell.append(b);
        }
        li.append(cell);
      }
      list.append(li);
      prev = r.rank;
    }
    if (!top10 && !rows.some(r => r.me)) msg.textContent += (msg.textContent ? ' ' : '') + 'You’re not on this board yet.';
  }).catch(() => { if (load === lbLoad) msg.textContent = 'Can’t reach the server. The leaderboards need an internet connection; the game works offline.'; });
}

// download a board replay and watch it; the board comes back afterwards
function lbWatch(id, btn) {
  btn.disabled = true; $('lbMsg').textContent = 'Loading the replay…';
  lbCall('lb_get_replay', { p_id: id }).then(rows => {
    const row = rows && rows[0];
    if (!row || row.sv !== SIM_VERSION) { $('lbMsg').textContent = 'That replay is no longer available.'; return; }
    $('lbMsg').textContent = '';
    watchReplay(unpackReplay(row.map, row.depth, row.data), 'lb');
  }).catch(() => { $('lbMsg').textContent = 'Can’t reach the server to load that replay.'; })
    .finally(() => { btn.disabled = false; });
}

$('lbOpen').addEventListener('click', openLeaderboards);
$('lbBack').addEventListener('click', closeLeaderboards);
$('lbPrev').addEventListener('click', () => lbStep(-1));
$('lbNext').addEventListener('click', () => lbStep(1));
