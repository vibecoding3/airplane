// Quick check of the whole game in headless Chrome. Prints a short report; exits with code 1 on any problem.
//   node tools/test.js            (deep runs to 2,500 m)
//   node tools/test.js 800        (deep runs to 800 m, faster)
const { openGame, wait } = require('./lib');
const DEPTH = +process.argv[2] || 2500;
const EXPECTED = { notebook: 16, sea: 12, space: 15, dungeon: 18 };   // obstacle types per map; update when adding obstacles

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
  check(medals === '2/1', 'map tiles show medals (Paper 800 m → 2, Ocean 260 m → 1): ' + medals);

  // deep runs where the plane can't be hit: every obstacle type should appear, power-ups should spawn
  // and level up to 3, no errors
  const deep = await page.evaluate(depth => {
    const out = {};
    for (const m of ['notebook', 'sea', 'space', 'dungeon']) {
      mapId = m; applyMap(); start(); let f = 0; const seen = new Set(), powers = { magnet: 0, shield: 0, slowmo: 0, superstar: 0, boost: 0 }, counted = new Set();
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
    // wind obstacles (desk fan, ocean current, cold draft) only spawn before 700 m, so one run misses them about
    // 1 time in 10–15 by chance: look again in up to 6 short runs to 760 m before calling it missing
    for (const m of ['notebook', 'sea', 'dungeon']) {
      const types = out[m].types;
      for (let tries = 0; tries < 6 && !types.includes('fan'); tries++) {
        mapId = m; applyMap(); start();
        for (let f = 0; f < 60 * 300 && dist / PX_PER_M < 760; f++) {
          plane.invuln = 1; update(1 / 60);
          if (obstacles.some(o => o.type === 'fan')) { types.push('fan'); types.sort(); out[m].windRetries = tries + 1; break; }
        }
      }
    }
    return out;
  }, DEPTH);
  for (const m of ['notebook', 'sea', 'space', 'dungeon']) {
    const d = deep[m], full = DEPTH >= 1500;   // rarer obstacle types may not show up in short runs
    check(d.depth >= DEPTH && (!full || d.types.length >= EXPECTED[m]),
      `${m}: reached ${d.depth} m, ${d.types.length} obstacle types (${d.types.join(' ')})` + (d.windRetries ? ` (wind found on extra run ${d.windRetries})` : ''));
    check(d.powers.magnet > 0 && d.powers.shield > 0 && d.powers.slowmo > 0 && d.powers.superstar > 0 && d.powers.boost > 0 && (DEPTH < 1500 || (d.maxMagnet === 3 && d.maxShield === 3)),
      `${m}: power-ups spawned (magnet ${d.powers.magnet}, shield ${d.powers.shield}, slow-mo ${d.powers.slowmo}, star ${d.powers.superstar}, boost ${d.powers.boost}), reached magnet level ${d.maxMagnet}, shield level ${d.maxShield}`);
  }

  // normal runs (3 lives) end in a game over
  const runs = await page.evaluate(() => {
    const out = [];
    for (const m of ['notebook', 'sea', 'space', 'dungeon']) {
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

  // experience: a run's metres are added as XP; levels need 300, 500, 700, ... XP; a level up shows the stamp
  const xpRes = await page.evaluate(() => {
    const keep = xp;
    const curve = [0, 299, 300, 799, 800, 1500].map(t => levelInfo(t).level).join(',');
    xp = 250; mapId = 'notebook'; applyMap(); start(); dist = 234 * PX_PER_M; gameOver();
    const gained = xp, stamp = !$('levelStamp').hidden, saved = +store.get('nosedive-xp'), shown = $('overXp').textContent;
    xp = keep; store.set('nosedive-xp', String(keep));
    return { curve, gained, stamp, saved, shown };
  });
  check(xpRes.curve === '1,1,2,2,3,4' && xpRes.gained === 484 && xpRes.saved === 484 && xpRes.stamp && xpRes.shown.includes('+234 XP'),
    `experience: levels ${xpRes.curve}, 250 + 234 m = ${xpRes.gained} XP (saved ${xpRes.saved}), level-up stamp ${xpRes.stamp}, shows "${xpRes.shown}"`);

  // speed boost: the plane falls 10% faster for 5 seconds, then back to normal
  const boost = await page.evaluate(() => {
    mapId = 'notebook'; applyMap(); start(); plane.invuln = 99; obstacles.length = 0; nextRowY = 1e12;
    dist = 700 * PX_PER_M;   // past the speed cap, so the base fall speed doesn't change between frames
    const fall = () => { clearControls(); plane.vx = 0; update(1 / 60); return speed / baseFallSpeed(); };   // straight down: no sideways slowdown
    const normal = fall();
    collectPower({ kind: 'boost', x: W / 2, y: dist + planeScreenY() });
    const boosted = fall();
    for (let f = 0; f < 60 * 5.2; f++) { plane.invuln = 99; update(1 / 60); }
    const after = fall();
    gameOver();
    return { normal: +normal.toFixed(3), boosted: +boosted.toFixed(3), after: +after.toFixed(3) };
  });
  check(boost.normal === 1 && boost.boosted === 1.1 && boost.after === 1,
    `speed boost: fall speed x${boost.normal} -> x${boost.boosted} with the boost -> x${boost.after} after 5 s`);

  // gold stars never spawn less than 50 m apart (power-ups are not stars)
  const starGap = await page.evaluate(() => {
    const out = [];
    for (const m of ['notebook', 'sea', 'space', 'dungeon']) {
      mapId = m; applyMap(); start();
      const ys = new Map();   // each star once, where it first appeared (the magnet moves them)
      for (let f = 0; f < 60 * 400 && dist / PX_PER_M < 2000; f++) {
        plane.invuln = 1; update(1 / 60);
        for (const p of pickups) if (!p.kind && !ys.has(p)) ys.set(p, p.y);
      }
      const sorted = [...ys.values()].sort((a, b) => a - b);
      let min = Infinity;
      for (let i = 1; i < sorted.length; i++) min = Math.min(min, sorted[i] - sorted[i - 1]);
      out.push({ m, n: sorted.length, min: Math.round(min / PX_PER_M) });
    }
    gameOver();
    return out;
  });
  check(starGap.every(r => r.n > 5 && r.min >= 50),
    'gold stars at least 50 m apart: ' + starGap.map(r => `${r.m} ${r.n} stars, closest ${r.min} m`).join(', '));

  // the Dungeon flamethrower: its own obstacle in the pool, built on the Wall Piston (cutter) with its own look
  const flame = await page.evaluate(() => {
    mapId = 'dungeon'; applyMap(); start(); obstacles.length = 0;
    const inPool = dungeonPool(0.5, 100 * PX_PER_M).some(p => p[0] === 'flamethrower');
    lastType = ''; spawnFromPool(dist + 600, 0.5, [['flamethrower', 1]]);
    const o = obstacles[0];
    gameOver();
    return { inPool, type: o && o.type, look: o && o.look };
  });
  check(flame.inPool && flame.type === 'cutter' && flame.look === 'flamethrower',
    `Dungeon flamethrower: in the pool ${flame.inPool}, spawns as ${flame.type}/${flame.look}`);

  // Collections: a ring and Frieren's staff seen on screen during a Dungeon run unlock (and are saved); off screen they don't
  const coll = await page.evaluate(() => {
    const keep = new Set(collectionFound); collectionFound.clear();
    mapId = 'dungeon'; applyMap(); start(); obstacles.length = 0; pickups.length = 0; nextRowY = 1e12;
    const add = (pool, y, look, col) => { lastType = ''; const i = obstacles.length; spawnFromPool(dist + y, 0.5, [[pool, 1]]); obstacles[i].look = look; obstacles[i].dunCol = col; obstacles[i].active = false; obstacles.length = i + 1; };
    add('rings', 300, 'ring', 'ruby'); add('plank', 500, 'frieren', '#8a2a2a'); add('rings', H + 200, 'ring', 'amber');   // the last one is below the screen
    render();
    const found = [...collectionFound].sort().join(','), saved = JSON.parse(store.get('nosedive-collection')).length;
    gameOver();
    collectionFound.clear(); for (const id of keep) collectionFound.add(id); store.set('nosedive-collection', JSON.stringify([...keep]));
    return { found, saved, total: COLLECTION_TOTAL };
  });
  check(coll.found === 'ring-ruby,staff-frieren' && coll.saved === 2 && coll.total === 11,
    `Collections: on-screen items unlock (${coll.found}), saved ${coll.saved}, ${coll.total} items in 2 sets`);
  await page.evaluate(() => { state = 'title'; showCard('title'); });
  await page.click('#collBtn'); await wait(150);
  const collOpen = await page.evaluate(() => ({ shown: !$('collCard').hidden, tiles: document.querySelectorAll('.coll-item').length }));
  await page.keyboard.press(' '); await wait(150);                 // Space must not start a run from here
  const stillTitle = await page.evaluate(() => state);
  await page.keyboard.press('Escape'); await wait(150);
  const closed = await page.evaluate(() => !$('titleCard').hidden && $('collCard').hidden);
  check(collOpen.shown && collOpen.tiles === 11 && stillTitle === 'title' && closed,
    `Collections menu: opens with ${collOpen.tiles} tiles, Space keeps it on the ${stillTitle} screen, Esc goes back ${closed}`);

  // the game-over screen has a Collections button too, and Back returns to game over
  await page.evaluate(() => { mapId = 'dungeon'; applyMap(); start(); gameOver(); });
  await page.click('#overCollBtn'); await wait(150);
  const fromOver = await page.evaluate(() => !$('collCard').hidden);
  await page.click('#collBack'); await wait(150);
  const backToOver = await page.evaluate(() => !$('overCard').hidden && $('titleCard').hidden);
  check(fromOver && backToOver, `Collections from the game-over screen: opens ${fromOver}, Back returns to game over ${backToOver}`);

  // the Dungeon's magic rings: their own obstacle in the pool, built on the Rising Projectile (paper wad), one of 9 designs
  const rings = await page.evaluate(() => {
    mapId = 'dungeon'; applyMap(); start(); obstacles.length = 0;
    const inPool = dungeonPool(0.5, 100 * PX_PER_M).some(p => p[0] === 'rings');
    lastType = ''; spawnFromPool(dist + 600, 0.5, [['rings', 1]]);
    const o = obstacles[0];
    gameOver();
    return { inPool, type: o && o.type, look: o && o.look, design: o && o.dunCol, known: !!(o && RING_DESIGNS[o.dunCol]) };
  });
  check(rings.inPool && rings.type === 'wad' && rings.look === 'ring' && rings.known,
    `Dungeon rings: in the pool ${rings.inPool}, spawns as ${rings.type}/${rings.look} (${rings.design})`);

  // Frieren's staff: its big head has its own round hit area at the +x end of the slider
  const staff = await page.evaluate(() => {
    mapId = 'dungeon'; applyMap(); start();
    let o = null;
    for (let i = 0; i < 400 && !o; i++) {
      obstacles.length = 0; lastType = ''; spawnFromPool(dist + 600, 0.5, [['plank', 1]]);
      if (obstacles[0].look === 'frieren') o = obstacles[0];
    }
    if (!o) { gameOver(); return { found: false }; }
    o.a = 0; o.x = W / 2;
    const sh = computeShapes(o), hx = o.x + o.len / 2 - o.headR;
    const hit = sh.some(s => circleHits(hx, o.y + o.headR - 2, 1, s));        // inside the head, outside the thin bar
    const miss = sh.some(s => circleHits(o.x - o.len / 4, o.y + 10, 1, s));   // beside the shaft
    gameOver();
    return { found: true, n: sh.length, headR: o.headR, hit, miss };
  });
  check(staff.found && staff.n === 2 && staff.headR === 11 && staff.hit && !staff.miss,
    `Frieren's staff head hit area: found ${staff.found}, shapes ${staff.n}, radius ${staff.headR}, head hits ${staff.hit}, beside the shaft hits ${staff.miss}`);

  // drifting into an edge, then one press the other way turns the plane at once (not straight down)
  const edge = await page.evaluate(() => {
    mapId = 'notebook'; applyMap(); start();
    const out = [];
    for (const s of [1, -1]) {
      press(s, 'sim'); release('sim');
      for (let f = 0; f < 240; f++) { plane.invuln = 1; update(1 / 60); }
      const atEdge = s > 0 ? plane.x >= W - 16 : plane.x <= 16;
      press(-s, 'sim'); release('sim');
      for (let f = 0; f < 12; f++) { plane.invuln = 1; update(1 / 60); }
      out.push(atEdge && plane.vx * -s > 30);
    }
    gameOver();
    return out;
  });
  check(edge.every(Boolean), 'after hitting an edge, one press the other way turns the plane: ' + edge.join('/'));

  // during the invincibility star, wind, rubber bands and bubbles leave the plane alone
  const starFx = await page.evaluate(() => {
    mapId = 'notebook'; applyMap(); start();
    const py = () => dist + planeScreenY();
    const run = () => { plane.x = W / 2; plane.vx = 0; update(1 / 60); return plane.vx; };
    plane.star = 5;
    obstacles.length = 0; obstacles.push({ type: 'fan', y: py(), band: 200, side: -1, force: 400 });
    const fan = run();
    obstacles.length = 0; obstacles.push({ type: 'band', x1: W / 2 - 50, y1: py(), x2: W / 2 + 60, y2: py(), cool: 0 });
    const band = run();
    obstacles.length = 0; obstacles.push({ type: 'bubbles', x: W / 2, y: py(), w: 200, h: 200 });
    run(); const bubbled = plane.bubbled;
    obstacles.length = 0; gameOver();
    return { fan, band, bubbled };
  });
  check(starFx.fan === 0 && starFx.band === 0 && starFx.bubbled === 0,
    `star ignores wind, rubber bands and bubbles: vx ${starFx.fan}/${starFx.band}, bubbled ${starFx.bubbled}`);

  // a real run through the buttons: play, pause, resume
  await page.click('#againBtn'); await wait(1200);
  check(await page.evaluate(() => state) === 'play', 'Throw again starts a run');
  await page.keyboard.press(' '); await wait(150);           // Space pauses (and its release must not resume)
  const paused = await page.evaluate(() => state);
  await page.click('#resumeBtn'); await wait(150);
  const resumed = await page.evaluate(() => state);
  await page.keyboard.press(' '); await wait(150);
  const paused2 = await page.evaluate(() => state);
  await page.keyboard.press(' '); await wait(150);           // Space again resumes
  const resumed2 = await page.evaluate(() => state);
  check(paused === 'paused' && resumed === 'play' && paused2 === 'paused' && resumed2 === 'play',
    `pause with Space, resume by button and by Space: ${paused}/${resumed}/${paused2}/${resumed2}`);

  // the pause menu's Exit run button: back to the start menu, keeping the run's metres as XP
  await page.evaluate(() => { dist = 120 * PX_PER_M; });
  const xpBeforeExit = await page.evaluate(() => xp);
  await page.keyboard.press(' '); await wait(150);
  await page.click('#exitBtn'); await wait(200);
  const exited = await page.evaluate(() => ({ state, title: !$('titleCard').hidden, xp, dist }));
  check(exited.state === 'title' && exited.title && exited.xp - xpBeforeExit === 120 && exited.dist < 120 * 30,   // 30 units per metre
    `Exit run: back to the ${exited.state} screen (card shown ${exited.title}), +${exited.xp - xpBeforeExit} XP kept`);

  check(errors.length === 0, errors.length ? 'errors:\n  ' + errors.join('\n  ') : 'no page errors');
  await browser.close();
  console.log(problems.length ? `\n${problems.length} problem(s)` : '\nall good');
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error('FAIL ' + e.message); process.exit(1); });
