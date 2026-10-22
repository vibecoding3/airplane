// Paper Nosedive — leaderboards (v144). To see them a player picks a unique nickname, tied for good to their anonymous
// visitor id (js/playlog.js), which works as their private key: it is never shown, the boards only list nicknames.
// Boards: the total score (all maps' bests added up) and one per map, top 20 plus the player's own row, and the Level
// board, top 10 by XP (v146). On opening the screen all the device's bests are sent once, so records made before
// joining count too. Since v146 the server keeps the XP of players with a nickname: every finished run is queued on
// the device and sent in order whenever there is a connection; the server checks and adds it, and the menu then shows
// the server's XP. Everything goes through database functions (tools/supabase-leaderboards.sql and
// tools/supabase-levels.sql, README section 19.1). Offline the screen just says so: the game itself never needs it.
const LB_MAPS = ['total', 'level', ...Object.keys(MAPS)];
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
      lbQueue.shift(); saveQueue();                 // counted, already counted, or refused (-1): done with it
      if (serverXp === -1) serverXp = null;
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
// after a run (from keepRunProgress): queue it for the server, which adds its XP and counts it as a best on its map
function lbRunEnded(depth) {
  if (!lbNick) return;
  lbQueue.push({ id: newId(), map: mapId, depth, dur: Math.round(time) });
  saveQueue();
  lbSyncXp();
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
    setNick(nick); lbSynced = false; openLeaderboards();      // opening syncs the bests and carries the XP over
  }).catch(() => { msg.textContent = 'Can’t reach the server. Check your connection and try again.'; })
    .finally(() => { btn.disabled = false; });
});

// the board on show: arrows step through Total score, Level and the nine maps
function lbStep(dir) {
  lbMap = LB_MAPS[(LB_MAPS.indexOf(lbMap) + dir + LB_MAPS.length) % LB_MAPS.length];
  renderBoard();
}
function renderBoard() {
  const level = lbMap === 'level';                   // the Level board: top 10 by XP, no own row
  $('lbMapName').textContent = lbMap === 'total' ? 'Total score' : level ? 'Level' : MAPS[lbMap].name;
  const list = $('lbList'), msg = $('lbMsg'), load = ++lbLoad;
  list.replaceChildren(); msg.textContent = 'Loading…';
  lbCall(level ? 'lb_levels' : 'lb_board', level ? { p_visitor: visitorId } : { p_map: lbMap, p_visitor: visitorId }).then(rows => {
    if (load !== lbLoad) return;                     // an older request answering after a newer one
    msg.textContent = rows.length ? '' : 'No one on this board yet. Play a run and be the first!';
    let prev = 0;
    for (const r of rows) {
      if (r.rank > prev + 1 && prev) { const gap = document.createElement('li'); gap.className = 'lb-gap'; gap.textContent = '…'; list.append(gap); }
      const li = document.createElement('li');
      if (r.me) li.className = 'me';
      for (const [cls, text] of [['lb-rank', '#' + r.rank], ['lb-nick', r.nickname], ['lb-depth', level ? 'Level ' + levelInfo(r.depth).level : fmt(r.depth) + (lbMap === 'total' ? '' : ' m')]]) {
        const s = document.createElement('span'); s.className = cls; s.textContent = text; li.append(s);
      }
      list.append(li);
      prev = r.rank;
    }
    if (!level && !rows.some(r => r.me)) msg.textContent += (msg.textContent ? ' ' : '') + 'You’re not on this board yet.';
  }).catch(() => { if (load === lbLoad) msg.textContent = 'Can’t reach the server. The leaderboards need an internet connection; the game works offline.'; });
}

$('lbOpen').addEventListener('click', openLeaderboards);
$('lbBack').addEventListener('click', closeLeaderboards);
$('lbPrev').addEventListener('click', () => lbStep(-1));
$('lbNext').addEventListener('click', () => lbStep(1));
