// Quick check of the whole game in headless Chrome. Prints a short report; exits with code 1 on any problem.
//   node tools/test.js            (deep runs to 2,500 m)
//   node tools/test.js 800        (deep runs to 800 m, faster)
const { openGame, wait } = require('./lib');
const DEPTH = +process.argv[2] || 2500;
const EXPECTED = { notebook: 16, sea: 12, space: 13 };   // obstacle types per map; update when adding obstacles

(async () => {
  const { browser, page, errors } = await openGame();
  const problems = [];
  const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) problems.push(msg); };

  check(await page.evaluate(() => state) === 'title', 'loads to the title screen');
  console.log('     version label: ' + await page.evaluate(() => document.getElementById('version').textContent));

  // medals on the map tiles follow each map's best depth
  const medals = await page.evaluate(() => {
    const keep = { ...bests };
    bests.notebook = 800; bests.sea = 260; showCard('title');
    const on = id => document.querySelectorAll(`#titleCard .map-tile[data-map="${id}"] .medal.on`).length;
    const r = on('notebook') + '/' + on('sea');
    Object.assign(bests, keep); showCard('title');
    return r;
  });
  check(medals === '2/1', 'map tiles show medals (Paper 800 m → 2, Deep sea 260 m → 1): ' + medals);

  // deep runs where the plane can't be hit: every obstacle type should appear, power-ups should spawn
  // and level up to 3, no errors
  const deep = await page.evaluate(depth => {
    const out = {};
    for (const m of ['notebook', 'sea', 'space']) {
      mapId = m; applyMap(); start(); let f = 0; const seen = new Set(), powers = { magnet: 0, shield: 0, slowmo: 0 }, counted = new Set();
      let maxMagnet = 0, maxShield = 0;
      while (dist / PX_PER_M < depth && f < 60 * 1200) {
        if (f % 45 === 0) { const s = Math.random() < 0.5 ? -1 : 1; press(s, 'sim'); release('sim'); }
        plane.invuln = 1;
        // steer toward the nearest power-up below so they actually get collected
        const pw = pickups.find(p => p.kind && p.y > dist + planeScreenY());
        if (pw) plane.x += clamp(pw.x - plane.x, -6, 6);
        update(1 / 60); if (f % 3 === 0) render(); f++;
        for (const o of obstacles) seen.add(o.type);
        for (const p of pickups) if (p.kind && !counted.has(p)) { counted.add(p); powers[p.kind]++; }
        maxMagnet = Math.max(maxMagnet, plane.magnet); maxShield = Math.max(maxShield, plane.lives);
      }
      out[m] = { depth: Math.round(dist / PX_PER_M), types: [...seen].sort(), powers, maxMagnet, maxShield };
    }
    return out;
  }, DEPTH);
  for (const m of ['notebook', 'sea', 'space']) {
    const d = deep[m], full = DEPTH >= 1500;   // rarer obstacle types may not show up in short runs
    check(d.depth >= DEPTH && (!full || d.types.length >= EXPECTED[m]),
      `${m}: reached ${d.depth} m, ${d.types.length} obstacle types (${d.types.join(' ')})`);
    check(d.powers.magnet > 0 && d.powers.shield > 0 && d.powers.slowmo > 0 && (DEPTH < 600 || (d.maxMagnet === 3 && d.maxShield === 3)),
      `${m}: power-ups spawned (magnet ${d.powers.magnet}, shield ${d.powers.shield}, slow-mo ${d.powers.slowmo}), reached magnet level ${d.maxMagnet}, shield level ${d.maxShield}`);
  }

  // normal runs (3 lives) end in a game over
  const runs = await page.evaluate(() => {
    const out = [];
    for (const m of ['notebook', 'sea', 'space']) {
      mapId = m; applyMap(); start(); plane.lives = 3; let f = 0;
      while (state !== 'over' && f < 60 * 300) {
        if (f % 45 === 0) { const s = Math.random() < 0.5 ? -1 : 1; press(s, 'sim'); release('sim'); }
        update(1 / 60); f++;
      }
      out.push(`${m} ${Math.round(dist / PX_PER_M)} m (${state})`);
    }
    return out;
  });
  check(runs.every(r => r.includes('(over)')), 'normal runs end in game over: ' + runs.join(', '));

  // a real run through the buttons: play, pause, resume
  await page.click('#againBtn'); await wait(1200);
  check(await page.evaluate(() => state) === 'play', 'Throw again starts a run');
  await page.keyboard.press('p'); await wait(150);
  const paused = await page.evaluate(() => state);
  await page.click('#resumeBtn'); await wait(150);
  check(paused === 'paused' && await page.evaluate(() => state) === 'play', 'pause and resume');

  check(errors.length === 0, errors.length ? 'errors:\n  ' + errors.join('\n  ') : 'no page errors');
  await browser.close();
  console.log(problems.length ? `\n${problems.length} problem(s)` : '\nall good');
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error('FAIL ' + e.message); process.exit(1); });
