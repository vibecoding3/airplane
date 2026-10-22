// Paper Nosedive — anonymous play log in Supabase (v142): one row per visit and one per finished run.
// No sign-in: each browser gets a random id kept on the device (localStorage). The public key can only add rows
// (row-level security in the database, see README section 19); nothing is read back. Rows are sent only from the
// website (http/https, not localhost), so the dev tools, tests (file://) and the Android app (https://localhost)
// never log. Sending never waits, and a blocked or failed request is ignored: the game doesn't depend on it.
const LOG_URL = 'https://tzdnwwhtoamyqmphrobw.supabase.co';   // the Supabase project URL
const LOG_KEY = 'sb_publishable_bMoyJ5LARjoHZEF5WVGqvw__g9kFTmd';   // its public "anon" / publishable key (never the service_role / secret key)
const LOG_ON = !!(LOG_URL && LOG_KEY) && /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname);

const newId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16)));
const visitorId = store.get('nosedive-visitor') || (() => { const id = newId(); store.set('nosedive-visitor', id); return id; })();
const visitId = newId();

function logRow(table, row) {
  if (!LOG_ON) return;
  try {
    fetch(`${LOG_URL}/rest/v1/${table}`, {
      method: 'POST', keepalive: true,                  // keepalive: a run logged as the tab closes still arrives
      headers: { apikey: LOG_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    }).catch(() => {});
  } catch (e) { /* no fetch, or blocked: skip */ }
}

// the visit: who (the anonymous id), when (set by the database) and the device
logRow('visits', {
  id: visitId, visitor_id: visitorId,
  version: ($('version') || {}).textContent || null,
  device: matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse',
  user_agent: navigator.userAgent.slice(0, 300),
  language: navigator.language || null,
  screen_w: screen.width, screen_h: screen.height, pixel_ratio: window.devicePixelRatio || 1,
  referrer: document.referrer ? document.referrer.slice(0, 300) : null
});

// a finished run (a crash, or Exit run from the pause menu): map, depth in metres, stars caught, seconds played
function logRun(depth, how) {
  logRow('runs', { visit_id: visitId, visitor_id: visitorId, map: mapId, depth, stars, duration_s: Math.round(time), ended: how });
}
