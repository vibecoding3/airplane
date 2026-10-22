// Paper Nosedive — leaderboards (v144). To see them a player picks a unique nickname, tied for good to their anonymous
// visitor id (js/playlog.js), which works as their private key: it is never shown, the boards only list nicknames.
// Boards: the total score (all maps' bests added up) and one per map, top 20 plus the player's own row. A best depth is
// sent after each record run; on opening the screen all the device's bests are sent once, so records made offline
// count too. Everything goes through four database functions (tools/supabase-leaderboards.sql, README section 19).
// Offline the screen just says so: the game itself never needs it.
const LB_MAPS = ['total', ...Object.keys(MAPS)];
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

// after a run (from keepRunProgress): a new best on this map goes on the board; a failure waits for the next sync
function lbRunEnded(depth, record) {
  if (lbNick && record && depth > 0) lbSubmit(mapId, depth).catch(() => { lbSynced = false; });
}
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
  if (lbNick) { lbSyncBests().catch(() => {}).finally(() => renderBoard()); return; }
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
    setNick(nick); lbSynced = false; openLeaderboards();
  }).catch(() => { msg.textContent = 'Can’t reach the server. Check your connection and try again.'; })
    .finally(() => { btn.disabled = false; });
});

// the board on show: arrows step through Total score and the nine maps
function lbStep(dir) {
  lbMap = LB_MAPS[(LB_MAPS.indexOf(lbMap) + dir + LB_MAPS.length) % LB_MAPS.length];
  renderBoard();
}
function renderBoard() {
  $('lbMapName').textContent = lbMap === 'total' ? 'Total score' : MAPS[lbMap].name;
  const list = $('lbList'), msg = $('lbMsg'), load = ++lbLoad;
  list.replaceChildren(); msg.textContent = 'Loading…';
  lbCall('lb_board', { p_map: lbMap, p_visitor: visitorId }).then(rows => {
    if (load !== lbLoad) return;                     // an older request answering after a newer one
    msg.textContent = rows.length ? '' : 'No one on this board yet. Play a run and be the first!';
    let prev = 0;
    for (const r of rows) {
      if (r.rank > prev + 1 && prev) { const gap = document.createElement('li'); gap.className = 'lb-gap'; gap.textContent = '…'; list.append(gap); }
      const li = document.createElement('li');
      if (r.me) li.className = 'me';
      for (const [cls, text] of [['lb-rank', '#' + r.rank], ['lb-nick', r.nickname], ['lb-depth', fmt(r.depth) + (lbMap === 'total' ? '' : ' m')]]) {
        const s = document.createElement('span'); s.className = cls; s.textContent = text; li.append(s);
      }
      list.append(li);
      prev = r.rank;
    }
    if (!rows.some(r => r.me)) msg.textContent += (msg.textContent ? ' ' : '') + 'You’re not on this board yet.';
  }).catch(() => { if (load === lbLoad) msg.textContent = 'Can’t reach the server. The leaderboards need an internet connection; the game works offline.'; });
}

$('lbOpen').addEventListener('click', openLeaderboards);
$('lbBack').addEventListener('click', closeLeaderboards);
$('lbPrev').addEventListener('click', () => lbStep(-1));
$('lbNext').addEventListener('click', () => lbStep(1));
