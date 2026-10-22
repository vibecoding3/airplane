// Quick check of the whole game in headless Chrome. Prints a short report; exits with code 1 on any problem.
//   node tools/test.js            (deep runs to 2,500 m)
//   node tools/test.js 800        (deep runs to 800 m, faster)
const { openGame, wait } = require('./lib');
const DEPTH = +process.argv[2] || 2500;
const EXPECTED = { notebook: 19, sea: 19, space: 17, dungeon: 19, city: 19, forest: 19, desert: 19, volcano: 19, kitchen: 19 };   // obstacle types per map; update when adding obstacles

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
    for (const m of ['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) {
      mapId = m; applyMap(); start(); let f = 0; const seen = new Set(), powers = { magnet: 0, shield: 0, slowmo: 0, superstar: 0, boost: 0, squid: 0 }, counted = new Set();
      let maxMagnet = 0, maxShield = 0;
      let prevKind = '', repeats = 0;
      while (dist / PX_PER_M < depth && f < 60 * 1200) {
        if (f % 45 === 0) { const s = Math.random() < 0.5 ? -1 : 1; press(s, 'sim'); release('sim'); }
        plane.invuln = 1;
        // steer toward the nearest power-up below so they actually get collected
        const pw = pickups.find(p => p.kind && p.y > dist + planeScreenY());
        if (pw) plane.x += clamp(pw.x - plane.x, -6, 6);
        update(1 / 60); if (f % 3 === 0) render(); f++;
        for (const o of obstacles) seen.add(o.type);
        // pickups spawn top to bottom, so new ones in order: the kind must differ from the one before
        for (const p of pickups) if (p.kind && !counted.has(p)) { counted.add(p); powers[p.kind]++; if (p.kind === prevKind) repeats++; prevKind = p.kind; }
        maxMagnet = Math.max(maxMagnet, plane.magnet); maxShield = Math.max(maxShield, plane.lives);
      }
      out[m] = { depth: Math.round(dist / PX_PER_M), types: [...seen].sort(), powers, maxMagnet, maxShield, repeats };
    }
    // wind obstacles (desk fan, ocean current, cold draft, city vent, forest breeze, sandstorm) only spawn before 700 m, so one run misses them about
    // 1 time in 10–15 by chance: look again in up to 6 short runs to 760 m before calling it missing
    for (const m of ['notebook', 'sea', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) {
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
  for (const m of ['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) {
    const d = deep[m], full = DEPTH >= 1500;   // rarer obstacle types may not show up in short runs
    check(d.depth >= DEPTH && (!full || d.types.length >= EXPECTED[m]),
      `${m}: reached ${d.depth} m, ${d.types.length} obstacle types (${d.types.join(' ')})` + (d.windRetries ? ` (wind found on extra run ${d.windRetries})` : ''));
    check(d.repeats === 0 && (DEPTH < 1500 || (d.powers.magnet > 0 && d.powers.shield > 0 && d.powers.boost > 0 && d.powers.slowmo > 0 && d.powers.squid > 0 && d.maxMagnet >= 2 && d.maxShield >= 2)),   // short runs may miss a kind by chance
      `${m}: power-ups spawned, never the same kind twice in a row (repeats ${d.repeats}) (magnet ${d.powers.magnet}, shield ${d.powers.shield}, slow-mo ${d.powers.slowmo}, star ${d.powers.superstar}, boost ${d.powers.boost}, squid ${d.powers.squid}), reached magnet level ${d.maxMagnet}, shield level ${d.maxShield}`);
  }

  // the invincibility star is the rarest power-up, so a single run can miss it: look across all the deep runs
  const starsOffered = Object.values(deep).reduce((n, d) => n + d.powers.superstar, 0);
  check(starsOffered > 0, `invincibility star offered in the deep runs: ${starsOffered} in all`);

  // normal runs (3 lives) end in a game over
  const runs = await page.evaluate(() => {
    const out = [];
    for (const m of ['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) {
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

  // magnet and shield level up one step per pickup and stop at level 3 (whether one run reaches 3 depends on chance)
  const levels = await page.evaluate(() => {
    mapId = 'notebook'; applyMap(); start();
    const seen = [];
    for (let k = 0; k < 4; k++) { collectPower({ kind: 'magnet', x: W / 2, y: 0 }); collectPower({ kind: 'shield', x: W / 2, y: 0 }); seen.push(plane.magnet + '/' + plane.lives); }
    gameOver();
    return seen.join(' ');
  });
  check(levels === '1/1 2/2 3/3 3/3', 'magnet / shield levels per pickup, capped at 3: ' + levels);

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

  // the squid (a debuff): ink splats below the plane for 3 s; nothing pulls it in; the invincibility star flies through it
  const squid = await page.evaluate(() => {
    mapId = 'sea'; applyMap(); start(); plane.invuln = 99; obstacles.length = 0; pickups.length = 0; nextRowY = 1e12;
    dist = 300 * PX_PER_M; const py = planeScreenY();
    plane.magnet = 3; plane.x = W / 2;
    const p = { kind: 'squid', x: W / 2 + 90, y: dist + py + 5, r: 18, spin: 0 }; pickups.push(p);
    for (let f = 0; f < 10; f++) { plane.vx = 0; clearControls(); update(1 / 60); }
    const notPulled = pickups.includes(p) && Math.abs(p.x - (W / 2 + 90)) < 1;
    pickups.length = 0; plane.star = 1;
    pickups.push({ kind: 'squid', x: plane.x, y: dist + py, r: 18, spin: 0 }); update(1 / 60);
    const starSafe = plane.ink === 0;
    plane.star = 0; pickups.length = 0;
    pickups.push({ kind: 'squid', x: plane.x, y: dist + py, r: 18, spin: 0 }); update(1 / 60);
    const inked = plane.ink > 2.9, n = plane.inkSplats.length;
    const clear = plane.inkSplats.every(s => s.y - s.r - 30 > py);   // never over the plane
    render();
    for (let f = 0; f < 60 * 3.1; f++) { plane.invuln = 99; update(1 / 60); }
    const gone = plane.ink === 0;
    gameOver();
    return { notPulled, starSafe, inked, n, clear, gone };
  });
  check(squid.notPulled && squid.starSafe && squid.inked && squid.n >= 3 && squid.clear && squid.gone,
    `squid: magnet doesn't pull it ${squid.notPulled}, star flies through ${squid.starSafe}, inks ${squid.inked} with ${squid.n} splats below the plane ${squid.clear}, gone after 3 s ${squid.gone}`);

  // gold stars never spawn less than 50 m apart (power-ups are not stars)
  const starGap = await page.evaluate(() => {
    const out = [];
    for (const m of ['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) {
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

  // Collections: a ring and the crescent staff seen on screen during a Dungeon run unlock (and are saved); off screen they don't.
  // The crescent staff keeps its pre-v111 save id, staff-frieren, so items found before the rename stay found.
  const coll = await page.evaluate(() => {
    const keep = new Set(collectionFound); collectionFound.clear();
    mapId = 'dungeon'; applyMap(); start(); obstacles.length = 0; pickups.length = 0; nextRowY = 1e12;
    const add = (pool, y, look, col) => { lastType = ''; const i = obstacles.length; spawnFromPool(dist + y, 0.5, [[pool, 1]]); obstacles[i].look = look; obstacles[i].dunCol = col; obstacles[i].active = false; obstacles.length = i + 1; };
    add('rings', 300, 'ring', 'ruby'); add('plank', 500, 'crescent', '#2f4a8a'); add('rings', H + 200, 'ring', 'amber');   // the last one is below the screen
    render();
    const found = [...collectionFound].sort().join(','), saved = JSON.parse(store.get('nosedive-collection')).length;
    gameOver();
    collectionFound.clear(); for (const id of keep) collectionFound.add(id); store.set('nosedive-collection', JSON.stringify([...keep]));
    return { found, saved, total: COLLECTION_TOTAL };
  });
  check(coll.found === 'ring-ruby,staff-frieren' && coll.saved === 2 && coll.total === 100,
    `Collections: on-screen items unlock (${coll.found}), saved ${coll.saved}, ${coll.total} items in 13 sets`);
  await page.evaluate(() => { state = 'title'; showCard('title'); });
  await page.click('#collBtn'); await wait(150);
  const collOpen = await page.evaluate(() => ({ shown: !$('collCard').hidden, tiles: document.querySelectorAll('.coll-item').length }));
  await page.keyboard.press(' '); await wait(150);                 // Space must not start a run from here
  const stillTitle = await page.evaluate(() => state);
  await page.keyboard.press('Escape'); await wait(150);
  const closed = await page.evaluate(() => !$('titleCard').hidden && $('collCard').hidden);
  check(collOpen.shown && collOpen.tiles === 100 && stillTitle === 'title' && closed,
    `Collections menu: opens with ${collOpen.tiles} tiles, Space keeps it on the ${stillTitle} screen, Esc goes back ${closed}`);

  // control tips in the top bar: shown for the first 200 m of a run, gone after and outside a run; no pause button
  const hint = await page.evaluate(() => {
    mapId = 'notebook'; applyMap(); start(); plane.invuln = 99; update(1 / 60); updateHud();   // invulnerable: a jump down must not crash into a row
    const atStart = !$('hint').hidden && $('hint').textContent.length > 0;
    dist = 150 * PX_PER_M; update(1 / 60); updateHud();
    const still = !$('hint').hidden;
    dist = 220 * PX_PER_M; update(1 / 60); updateHud();
    const past = $('hint').hidden;
    gameOver(); updateHud();
    return { atStart, still, past, after: $('hint').hidden };
  });
  check(hint.atStart && hint.still && hint.past && hint.after, `control tips: shown at the start ${hint.atStart}, still at 150 m ${hint.still}, hidden past 200 m ${hint.past}, hidden after the run ${hint.after}`);

  // collectibles appear at most once per run; once all 9 rings have appeared, rings leave the pool
  const once = await page.evaluate(() => {
    mapId = 'dungeon'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 700 && dist / PX_PER_M < 1800; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) {
        const id = o.look === 'ring' ? 'ring-' + o.dunCol : COLLECTIBLE_LOOKS[o.look] || null;
        if (id) { if (!seen.has(id)) seen.set(id, new Set()); seen.get(id).add(o); }
      }
    }
    const dups = [...seen].filter(([, s]) => s.size > 1).length, rings = [...seen.keys()].filter(k => k.startsWith('ring-')).length;
    let after = 'n/a';                          // once all 9 rings are out, a ring spawn is a regular Rising Projectile
    if (rings === 9) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['rings', 1]]); after = obstacles[i] && obstacles[i].look; }
    gameOver();
    return { dups, rings, after };
  });
  check(once.dups === 0 && (once.rings < 9 || ['skull', 'pumpkin', 'slime', 'potion'].includes(once.after)),
    `collectibles once per run: repeats ${once.dups}, rings seen ${once.rings}/9, a ring spawn after all 9 is a ${once.after}`);

  // the Planets collection: a planet on screen in a Space run unlocks; each planet once per run, and none after all 8
  const planets = await page.evaluate(() => {
    const keep = new Set(collectionFound); collectionFound.clear();
    mapId = 'space'; applyMap(); start(); obstacles.length = 0; pickups.length = 0; nextRowY = 1e12;
    make.planet(dist + 400, 0.5); render();
    const unlocked = [...collectionFound].filter(id => id.startsWith('planet-')).length;
    start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.look === 'planet') { if (!seen.has(o.planet)) seen.set(o.planet, new Set()); seen.get(o.planet).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';                          // once all 8 planets are out, a planet spawn is a regular moon edge
    if (seen.size === 8) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['planet', 1]]); after = obstacles[i] && obstacles[i].look; }
    gameOver();
    collectionFound.clear(); for (const id of keep) collectionFound.add(id); store.set('nosedive-collection', JSON.stringify([...keep]));
    return { unlocked, seen: seen.size, repeats, after };
  });
  check(planets.unlocked === 1 && planets.repeats === 0 && (planets.seen < 8 || planets.after === 'moon'),
    `Planets collection: a planet on screen unlocks (${planets.unlocked}), ${planets.seen}/8 seen in a run, repeats ${planets.repeats}, a planet spawn after all 8 is a ${planets.after}`);

  // the Origami collection: sticky-note variants on Paper, each once per run, plain sticky notes once all 6 have appeared
  const orig = await page.evaluate(() => {
    mapId = 'notebook'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.origami) { if (!seen.has(o.origami)) seen.set(o.origami, new Set()); seen.get(o.origami).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 6) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['notes', 1]]); after = obstacles.slice(i).every(o => !o.origami) ? 'plain notes' : 'origami'; }
    gameOver();
    return { seen: seen.size, repeats, after };
  });
  check(orig.repeats === 0 && orig.seen >= 3 && (orig.seen < 6 || orig.after === 'plain notes'),
    `Origami collection: ${orig.seen}/6 seen in a run to 2,500 m, repeats ${orig.repeats}, a note row after all 6 is ${orig.after}`);

  // the Seashells collection: sea-urchin variants in the Ocean, each once per run, plain urchins once all 6 have appeared
  const shells = await page.evaluate(() => {
    mapId = 'sea'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.shell) { if (!seen.has(o.shell)) seen.set(o.shell, new Set()); seen.get(o.shell).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 6) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['urchins', 1]]); after = obstacles.slice(i).every(o => !o.shell) ? 'plain urchins' : 'shells'; }
    gameOver();
    return { seen: seen.size, repeats, after };
  });
  check(shells.repeats === 0 && shells.seen >= 3 && (shells.seen < 6 || shells.after === 'plain urchins'),
    `Seashells collection: ${shells.seen}/6 seen in a run to 2,500 m, repeats ${shells.repeats}, an urchin row after all 6 is ${shells.after}`);

  // the Legendary swords collection: Spinning Blades variants in the Dungeon, each once per run, regular blades once all 6 have appeared
  const swords = await page.evaluate(() => {
    mapId = 'dungeon'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.sword) { if (!seen.has(o.sword)) seen.set(o.sword, new Set()); seen.get(o.sword).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 6) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['swords', 1]]); after = obstacles.slice(i).every(o => !o.sword) ? 'regular blades' : 'legendary swords'; }
    gameOver();
    return { seen: seen.size, repeats, after };
  });
  check(swords.repeats === 0 && swords.seen >= 2 && (swords.seen < 6 || swords.after === 'regular blades'),
    `Legendary swords collection: ${swords.seen}/6 seen in a run to 2,500 m, repeats ${swords.repeats}, a blades row after all 6 is ${swords.after}`);

  // the Legendary fish collection: starfish variants in the Ocean, each once per run, plain starfish once all 5 have appeared
  const fish = await page.evaluate(() => {
    mapId = 'sea'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.fish) { if (!seen.has(o.fish)) seen.set(o.fish, new Set()); seen.get(o.fish).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 5) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['starfish', 1]]); after = obstacles.slice(i).every(o => !o.fish) ? 'plain starfish' : 'fish'; }
    gameOver();
    return { seen: seen.size, repeats, after };
  });
  check(fish.repeats === 0 && fish.seen >= 2 && (fish.seen < 5 || fish.after === 'plain starfish'),
    `Legendary fish collection: ${fish.seen}/5 seen in a run to 2,500 m, repeats ${fish.repeats}, a starfish row after all 5 is ${fish.after}`);

  // the Neon signs collection: Wall Bulge signs in Neon City, each once per run, unlocked when seen on screen;
  // once all 8 have appeared a sign spawn is a regular Wall Bulge
  const signs = await page.evaluate(() => {
    const keep = new Set(collectionFound); collectionFound.clear();
    mapId = 'city'; applyMap(); start(); obstacles.length = 0; pickups.length = 0; nextRowY = 1e12;
    make.neon(dist + 400, 0.5); for (const o of obstacles) o.city = true; render();
    const unlocked = [...collectionFound].filter(id => id.startsWith('neon-')).length;
    start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.neonSign) { if (!seen.has(o.neonSign)) seen.set(o.neonSign, new Set()); seen.get(o.neonSign).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 8) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['neon', 1]]); after = obstacles.slice(i).map(o => o.neonSign || o.look).join('+'); }
    gameOver();
    collectionFound.clear(); for (const id of keep) collectionFound.add(id); store.set('nosedive-collection', JSON.stringify([...keep]));
    return { unlocked, seen: seen.size, repeats, after };
  });
  check(signs.unlocked === 1 && signs.repeats === 0 && signs.seen >= 4 && (signs.seen < 8 || /^(dish|acunit|clock)(\+(dish|acunit|clock))?$/.test(signs.after)),
    `Neon signs collection: one on screen unlocks ${signs.unlocked}, ${signs.seen}/8 seen in a run to 2,500 m, repeats ${signs.repeats}, a sign spawn after all 8 is ${signs.after}`);

  // the Forest birds collection: Drifting Swarm variants in the Forest, each once per run, plain swarms once all 8 have appeared
  const birds = await page.evaluate(() => {
    mapId = 'forest'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.bird) { if (!seen.has(o.bird)) seen.set(o.bird, new Set()); seen.get(o.bird).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 8) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['bees', 1]]); after = obstacles.slice(i).every(o => !o.bird) ? 'plain swarm' : 'birds'; }
    gameOver();
    return { seen: seen.size, repeats, after };
  });
  check(birds.repeats === 0 && birds.seen >= 4 && (birds.seen < 8 || birds.after === 'plain swarm'),
    `Forest birds collection: ${birds.seen}/8 seen in a run to 2,500 m, repeats ${birds.repeats}, a swarm row after all 8 is ${birds.after}`);

  // Forest looks follow the seasons: no snowballs or frosty looks in spring and summer, no bees in winter or at night
  const seasons = await page.evaluate(() => {
    mapId = 'forest'; applyMap(); start(); const bad = [];
    for (const m of [50, 300, 600, 1200, 2000]) for (let k = 0; k < 40; k++) {
      obstacles.length = 0; lastType = '';
      spawnFromPool(m * PX_PER_M, 0.5, [[['acorns', 'bees', 'twig', 'husk', 'sunbeam'][k % 5], 1]]);
      for (const o of obstacles) if (o.look && FOREST_SEASONS[o.look] && !FOREST_SEASONS[o.look].includes(o.season)) bad.push(o.look + '@' + m);
    }
    gameOver();
    return bad;
  });
  check(seasons.length === 0, 'Forest looks follow the seasons' + (seasons.length ? ': ' + seasons.slice(0, 5).join(', ') : ''));

  // the Fossils collection: fossil stones among the Desert cacti, each once per run, plain cacti once all 8 have appeared
  const fossils = await page.evaluate(() => {
    mapId = 'desert'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.fossil) { if (!seen.has(o.fossil)) seen.set(o.fossil, new Set()); seen.get(o.fossil).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 8) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['cacti', 1]]); after = obstacles.slice(i).every(o => !o.fossil) ? 'plain cacti' : 'fossils'; }
    gameOver();
    return { seen: seen.size, repeats, after };
  });
  check(fossils.repeats === 0 && fossils.seen >= 4 && (fossils.seen < 8 || fossils.after === 'plain cacti'),
    `Fossils collection: ${fossils.seen}/8 seen in a run to 2,500 m, repeats ${fossils.repeats}, a cactus row after all 8 is ${fossils.after}`);

  // Desert looks follow the rock layers: dunes only near the top, palm fronds only in the canyon and oasis, and so on
  const layers = await page.evaluate(() => {
    mapId = 'desert'; applyMap(); start(); const bad = [];
    for (const m of [50, 300, 600, 1200, 2000]) for (let k = 0; k < 40; k++) {
      obstacles.length = 0; lastType = '';
      spawnFromPool(m * PX_PER_M, 0.5, [[['outcrop', 'sandLedges', 'fronds', 'coconuts', 'tongue', 'spitter'][k % 6], 1]]);
      for (const o of obstacles) if (o.look && DESERT_LAYERS[o.look] && !DESERT_LAYERS[o.look].includes(o.layer)) bad.push(o.look + '@' + m);
    }
    gameOver();
    return bad;
  });
  check(layers.length === 0, 'Desert looks follow the rock layers' + (layers.length ? ': ' + layers.slice(0, 5).join(', ') : ''));

  // Neon City looks follow the city's layers (v129): balconies only up top, pipes in the subway, server racks in the data core…
  const clayers = await page.evaluate(() => {
    mapId = 'city'; applyMap(); start(); const bad = [], seen = new Set();
    for (const m of [50, 300, 600, 1200, 2000]) for (let k = 0; k < 60; k++) {
      obstacles.length = 0; lastType = '';
      spawnFromPool(m * PX_PER_M, 0.5, [[['signs', 'shutters', 'cones', 'taxis', 'camera', 'bulge'][k % 6], 1]]);
      for (const o of obstacles) { if (o.look) seen.add(o.look); if (o.look && CITY_LAYERS[o.look] && !CITY_LAYERS[o.look].includes(o.layer)) bad.push(o.look + '@' + m); }
    }
    gameOver();
    return { bad, added: ['pipes', 'racks', 'ticketgate', 'holosign', 'datapackets', 'canmachine'].filter(l => seen.has(l)).length };
  });
  check(clayers.bad.length === 0 && clayers.added === 6, `Neon City looks follow the layers, ${clayers.added}/6 added looks seen` + (clayers.bad.length ? ': ' + clayers.bad.slice(0, 5).join(', ') : ''));

  // the Volcanic stones collection: stones among the Volcano's lava bombs, each once per run, plain bombs once all 8 have appeared
  const stones = await page.evaluate(() => {
    mapId = 'volcano'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.stone) { if (!seen.has(o.stone)) seen.set(o.stone, new Set()); seen.get(o.stone).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 8) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['lavaBombs', 1]]); after = obstacles.slice(i).every(o => !o.stone) ? 'plain bombs' : 'stones'; }
    gameOver();
    return { seen: seen.size, repeats, after };
  });
  check(stones.repeats === 0 && stones.seen >= 4 && (stones.seen < 8 || stones.after === 'plain bombs'),
    `Volcanic stones collection: ${stones.seen}/8 seen in a run to 2,500 m, repeats ${stones.repeats}, a bomb row after all 8 is ${stones.after}`);

  // Volcano looks follow the layers: vines only on the jungle slope, rope lava from the ash cloud on, and so on
  const vlayers = await page.evaluate(() => {
    mapId = 'volcano'; applyMap(); start(); const bad = [];
    for (const m of [50, 300, 600, 1200, 2000]) for (let k = 0; k < 40; k++) {
      obstacles.length = 0; lastType = '';
      spawnFromPool(m * PX_PER_M, 0.5, [[['ropeLava', 'raft', 'moths', 'lightning', 'lavaVent'][k % 5], 1]]);
      for (const o of obstacles) if (o.look && VOLCANO_LAYERS[o.look] && !VOLCANO_LAYERS[o.look].includes(o.layer)) bad.push(o.look + '@' + m);
    }
    gameOver();
    return bad;
  });
  check(vlayers.length === 0, 'Volcano looks follow the layers' + (vlayers.length ? ': ' + vlayers.slice(0, 5).join(', ') : ''));

  // depth art: once a layer edge has scrolled off the top, the new layer fills the whole screen (no clip left over, v139)
  const artClips = await page.evaluate(() => {
    const bad = [];
    for (const m of Object.keys(MAPS)) {
      mapId = m; applyMap(); start(); plane.lives = 1e9;
      for (const at of [300, 600]) {            // past the 150/200 m and 400 m edges, the next edge still below the screen
        while (dist / PX_PER_M < at) update(1 / 60);
        syncPaperLayers();
        if (artA.style.clipPath || artB.style.clipPath) bad.push(`${m} ${at} m`);
      }
    }
    return bad;
  });
  check(artClips.length === 0, 'Depth art fills the screen after a layer edge' + (artClips.length ? ': ' + artClips.join(', ') : ''));

  // the Sunken treasures collection: treasures among the Ocean's city relics (400–1,500 m), each once per run, plain
  // relics once all 8 have appeared. A natural run only meets a handful of urchin rows in the city (about 3 in 10 runs
  // see fewer than 4 treasures), so the rows are spawned directly: 300 urchin rows from 0 to 2,500 m in one run.
  const treasures = await page.evaluate(() => {
    mapId = 'sea'; applyMap(); start(); const seen = new Map(); let outside = 0, allAt = 0, afterAll = 0;
    for (let i = 0; i < 300; i++) {
      const md = (i + 0.5) / 300 * 2500, k = obstacles.length;
      lastType = ''; spawnFromPool(md * PX_PER_M, 1 - Math.exp(-md / 600), [['urchins', 1]]);
      for (const o of obstacles.slice(k)) {
        if (!o.treasure) continue;
        if (!seen.has(o.treasure)) seen.set(o.treasure, new Set()); seen.get(o.treasure).add(o);
        if (o.layer !== 2 && o.layer !== 3) outside++;
        if (allAt) afterAll++;
      }
      if (seen.size === 8 && !allAt) allAt = md;
      obstacles.length = 0;
    }
    gameOver();
    return { seen: seen.size, repeats: [...seen.values()].filter(x => x.size > 1).length, outside, allAt: Math.round(allAt), afterAll };
  });
  check(treasures.seen === 8 && treasures.repeats === 0 && treasures.outside === 0 && treasures.afterAll === 0,
    `Sunken treasures collection: ${treasures.seen}/8 seen in 300 urchin rows (all by ${treasures.allAt} m), repeats ${treasures.repeats}, outside the city ${treasures.outside}, treasures after all 8 ${treasures.afterAll}`);

  // the Ocean's sunken city: from 400 to 1,500 m every look is a city look, and no city look appears outside it
  const city = await page.evaluate(() => {
    mapId = 'sea'; applyMap(); start(); const bad = [];
    for (const m of [50, 300, 600, 1200, 2000]) for (let k = 0; k < 60; k++) {
      obstacles.length = 0; lastType = '';
      spawnFromPool(m * PX_PER_M, 0.5, [[['coral', 'urchins', 'jellies', 'swordfish', 'bigRock', 'sub', 'zap', 'anchor', 'fishline', 'crab'][k % 10], 1]]);
      const inCity = m >= 400 && m < 1500;
      for (const o of obstacles) if (o.look && SEA_LAYERS[o.look] && !!SEA_CITY[o.look] !== inCity) bad.push(o.look + '@' + m);
    }
    gameOver();
    return bad;
  });
  check(city.length === 0, 'Ocean sunken city: city looks only from 400 to 1,500 m, sea looks only outside' + (city.length ? ': ' + city.slice(0, 5).join(', ') : ''));

  // the Minecraft minerals collection (v150, ores in v148): minerals among the Volcano's bombs, each once per run, plain bombs once all 10 have appeared
  const ores = await page.evaluate(() => {
    mapId = 'volcano'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.mineral) { if (!seen.has(o.mineral)) seen.set(o.mineral, new Set()); seen.get(o.mineral).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length, notHazard = [...seen.values()].some(x => [...x].some(o => o.type !== 'blot'));
    runCollected.clear(); for (const n of VOLC_MINERALS) runCollected.add('ore-' + n);
    const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['bombs', 1]]);
    const after = obstacles.slice(i).every(o => !o.mineral) ? 'plain bombs' : 'minerals';
    gameOver();
    return { seen: seen.size, repeats, notHazard, after };
  });
  check(ores.repeats === 0 && !ores.notHazard && ores.seen >= 3 && ores.after === 'plain bombs',
    `Minecraft minerals collection: ${ores.seen}/10 seen in a run to 2,500 m, repeats ${ores.repeats}, only on Static Hazards ${!ores.notHazard}, a bomb row once all 10 are found is ${ores.after}`);

  // the Pastries collection: pastries among the Kitchen's produce, each once per run, plain produce once all 8 have appeared
  const pastries = await page.evaluate(() => {
    mapId = 'kitchen'; applyMap(); start(); const seen = new Map();
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.pastry) { if (!seen.has(o.pastry)) seen.set(o.pastry, new Set()); seen.get(o.pastry).add(o); }
    }
    const repeats = [...seen.values()].filter(x => x.size > 1).length;
    let after = 'n/a';
    if (seen.size === 8) { const i = obstacles.length; lastType = ''; spawnFromPool(dist + 900, 0.9, [['produce', 1]]); after = obstacles.slice(i).every(o => !o.pastry) ? 'plain produce' : 'pastries'; }
    gameOver();
    return { seen: seen.size, repeats, after };
  });
  check(pastries.repeats === 0 && pastries.seen >= 4 && (pastries.seen < 8 || pastries.after === 'plain produce'),
    `Pastries collection: ${pastries.seen}/8 seen in a run to 2,500 m, repeats ${pastries.repeats}, a produce row after all 8 is ${pastries.after}`);

  // Kitchen looks follow the layers: cakes on the top shelf, pizza by the stove, ice cubes in the fridge, and so on
  const klayers = await page.evaluate(() => {
    mapId = 'kitchen'; applyMap(); start(); const bad = [];
    for (const m of [50, 300, 600, 1200, 2000]) for (let k = 0; k < 40; k++) {
      obstacles.length = 0; lastType = '';
      spawnFromPool(m * PX_PER_M, 0.5, [[['shelves', 'produce', 'platter', 'pancakes', 'tap', 'potSteam'][k % 6], 1]]);
      for (const o of obstacles) if (o.look && KITCHEN_LAYERS[o.look] && !KITCHEN_LAYERS[o.look].includes(o.layer)) bad.push(o.look + '@' + m);
    }
    gameOver();
    return bad;
  });
  check(klayers.length === 0, 'Kitchen looks follow the layers' + (klayers.length ? ': ' + klayers.slice(0, 5).join(', ') : ''));

  // Ranked Score: the best depths of every map added up, on the start and game-over screens
  const ranked = await page.evaluate(() => {
    const keep = { ...bests };
    Object.assign(bests, { notebook: 800, sea: 260, space: 0, dungeon: 412, city: 0, forest: 0, desert: 0, volcano: 0, kitchen: 0 }); best = bests[mapId];
    state = 'title'; showCard('title');
    const title = $('menuRanked').textContent;
    mapId = 'space'; applyMap(); start(); dist = 333 * PX_PER_M; gameOver();
    const over = $('overRanked').textContent;
    for (const m of Object.keys(keep)) { bests[m] = keep[m]; store.set('nosedive-best-' + m, String(keep[m])); }
    return { title, over };
  });
  check(ranked.title === '1,472' && ranked.over === 'Total score 1,805', `Ranked Score: start screen ${ranked.title}, after a new 333 m Space best "${ranked.over}"`);

  // the speedometer: the fall speed in m/s left of the frame rate during a run, gone outside a run
  await page.evaluate(() => { mapId = 'notebook'; applyMap(); start(); plane.invuln = 99; dist = 200 * PX_PER_M; });
  await wait(1200);
  const runLabel = await page.evaluate(() => document.getElementById('version').textContent);
  await page.evaluate(() => { gameOver(); });
  await wait(1200);
  const overLabel = await page.evaluate(() => document.getElementById('version').textContent);
  check(/ · \d+\.\d m\/s · \d+ fps$/.test(runLabel) && !overLabel.includes('m/s'), `speedometer: "${runLabel}" during a run, "${overLabel}" after it`);

  // the game-over screen: a Main Menu button back to the start menu; Collections only on the start menu
  await page.evaluate(() => { mapId = 'dungeon'; applyMap(); start(); gameOver(); });
  const collButtons = await page.evaluate(() => [...document.querySelectorAll('.coll-open')].map(b => b.closest('.menu').id).join(','));
  await page.click('#overMenuBtn'); await wait(150);
  const toMenu = await page.evaluate(() => state === 'title' && !$('titleCard').hidden && $('overCard').hidden && obstacles.length === 0);
  const overTiles = await page.evaluate(() => document.querySelectorAll('#overCard .map-tile').length);
  check(overTiles === 0, 'map selection only on the main menu: ' + overTiles + ' map tiles on the game-over screen');
  await page.click('#collBtn'); await wait(150);
  const fromMenu = await page.evaluate(() => !$('collCard').hidden);
  await page.click('#collBack'); await wait(150);
  const backToMenu = await page.evaluate(() => !$('titleCard').hidden);
  check(collButtons === 'titleCard', `Collections button only on the start menu (${collButtons})`);
  check(toMenu && fromMenu && backToMenu, `game over → Main Menu ${toMenu}, Collections opens ${fromMenu}, Back returns to the menu ${backToMenu}`);

  // the phone's Back button (goBack): run → pause → resume, game over → start menu, Collections → closed,
  // and false on the start menu (the Android app then closes)
  const back = await page.evaluate(() => {
    const steps = [];
    const step = () => { const handled = goBack(); steps.push((handled ? '' : 'exit:') + (ui.coll.hidden ? state : 'coll')); };
    mapId = 'notebook'; applyMap(); start(); plane.invuln = 99;
    step(); step();                  // pause, then resume
    gameOver(); step();              // game over → start menu
    openCollections(); step();       // Collections → start menu
    step();                          // start menu: nothing to go back to
    return steps.join(' ');
  });
  check(back === 'paused play title title exit:title', `Back button steps: ${back}`);

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

  // the crescent staff: its big head has its own round hit area at the +x end of the slider
  const staff = await page.evaluate(() => {
    mapId = 'dungeon'; applyMap(); start();
    let o = null;
    for (let i = 0; i < 400 && !o; i++) {
      obstacles.length = 0; lastType = ''; spawnFromPool(dist + 600, 0.5, [['plank', 1]]);
      if (obstacles[0].look === 'crescent') o = obstacles[0];
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
    `crescent staff head hit area: found ${staff.found}, shapes ${staff.n}, radius ${staff.headR}, head hits ${staff.hit}, beside the shaft hits ${staff.miss}`);

  // a Gap Wall or Closing Jaws row never follows a Drifting Swarm row, on every map (v131)
  const afterSwarm = await page.evaluate(() => {
    const out = {};
    for (const m of ['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) {
      mapId = m; applyMap(); start(); lastType = '';
      let swarms = 0, walls = 0, wallsElsewhere = 0, prev = '';
      for (let i = 0; i < 6000; i++) {
        obstacles.length = 0; pickups.length = 0; spawnRow(400 * PX_PER_M, 0.5);
        const now = makerOf(lastType), wall = now === 'gate' || now === 'erasers';
        if (prev === 'notes') { swarms++; if (wall) walls++; } else if (wall) wallsElsewhere++;
        prev = now;
      }
      gameOver();
      out[m] = { swarms, walls, wallsElsewhere };
    }
    return out;
  });
  check(Object.values(afterSwarm).every(v => v.swarms > 100 && v.walls === 0 && v.wallsElsewhere > 100),
    'no Gap Wall or Closing Jaws right after a Drifting Swarm: ' + Object.entries(afterSwarm).map(([m, v]) => `${m} ${v.walls}/${v.swarms}`).join(', '));

  // conveyors (paper clips and their look-alikes on every map) stop at 1,500 m (v126)
  const conv = await page.evaluate(() => {
    const bad = [], before = {};
    for (const m of ['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) {
      mapId = m; applyMap(); start();
      let early = 0;
      for (let k = 0; k < 400; k++) { obstacles.length = 0; lastType = ''; spawnRow(1400 * PX_PER_M, 0.8); if (obstacles.some(o => o.type === 'clips')) early++; }
      before[m] = early;
      for (let k = 0; k < 400; k++) { obstacles.length = 0; lastType = ''; spawnRow((1500 + k) * PX_PER_M, 0.9); if (obstacles.some(o => o.type === 'clips')) bad.push(m); }
      gameOver();
    }
    return { bad, before };
  });
  check(conv.bad.length === 0 && Object.values(conv.before).every(n => n > 0),
    `conveyors stop at 1,500 m: rows with one at 1,400 m ${JSON.stringify(conv.before)}, from 1,500 m ${conv.bad.length}`);

  // drifting into an edge, then one press the other way turns the plane at once (not straight down)
  const edge = await page.evaluate(() => {
    mapId = 'notebook'; applyMap(); start();
    const out = [];
    for (const s of [1, -1]) {
      press(s, 'sim'); release('sim');
      for (let f = 0; f < 240; f++) { plane.invuln = 1; obstacles.length = 0; update(1 / 60); }   // no bands or wind to push it
      const atEdge = s > 0 ? plane.x >= W - 16 : plane.x <= 16;
      press(-s, 'sim'); release('sim');
      for (let f = 0; f < 12; f++) { plane.invuln = 1; obstacles.length = 0; update(1 / 60); }
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
  // the pause button (v151): shown on touch screens (the test page is a phone), a tap pauses
  const pauseBtnShown = await page.evaluate(() => getComputedStyle($('pauseBtn')).display !== 'none' && $('pauseBtn').getBoundingClientRect().width > 0);
  await page.tap('#pauseBtn'); await wait(150);
  const tapPaused = await page.evaluate(() => state);
  await page.click('#resumeBtn'); await wait(150);
  check(pauseBtnShown && tapPaused === 'paused' && await page.evaluate(() => state) === 'play', `pause button on a phone: shown ${pauseBtnShown}, a tap gives ${tapPaused}`);

  // the pause menu's Exit run button: back to the start menu, keeping the run's metres as XP
  await page.evaluate(() => { dist = 120 * PX_PER_M; });
  const xpBeforeExit = await page.evaluate(() => xp);
  await page.keyboard.press(' '); await wait(150);
  await page.click('#exitBtn'); await wait(200);
  const exited = await page.evaluate(() => ({ state, title: !$('titleCard').hidden, xp, dist }));
  check(exited.state === 'title' && exited.title && exited.xp - xpBeforeExit === 120 && exited.dist < 120 * 30,   // 30 units per metre
    `Exit run: back to the ${exited.state} screen (card shown ${exited.title}), +${exited.xp - xpBeforeExit} XP kept`);

  // replays (v157): a run played through the real frame step with steering and uneven frames, then watched, must end
  // exactly where it did; watching leaves progress alone; the button and the bar work
  const replayRuns = [];
  for (const m of ['notebook', 'dungeon', 'kitchen']) {
    replayRuns.push(await page.evaluate((m) => {
      mapId = m; applyMap(); state = 'title'; showCard('title');
      // plenty of shields for a long run: set inside reset, so the replay starts with them too
      const realReset = reset; reset = () => { realReset(); plane.lives = 999; };
      start();
      let f = 0;
      while ((state === 'play' || state === 'dying') && f < 60 * 300 && score() < 1200) {
        if (f % 97 === 11) press(f % 194 === 11 ? -1 : 1, 'keyT');           // a press, a hold, a release, both ways
        if (f % 97 === 50) release('keyT');
        if (f % 211 === 100) press(1, 'keyU');
        if (f % 211 === 104) release('keyU');
        simFrame(f % 7 === 0 ? 1 / 45 : f % 13 === 0 ? 1 / 30 : 1 / 60);    // uneven frames, like a real device
        f++;
      }
      const at = { depth: score(), dist: dist.toFixed(3), x: plane.x.toFixed(3), stars };   // before Exit run resets it
      if (state === 'play') { pause(); exitRun(); }
      const live = { ...at, frames: lastReplay ? lastReplay.n : 0, inputs: lastReplay ? lastReplay.ev.length : 0 };
      const progress = JSON.stringify([xp, bank, bests[m], [...collectionFound].length]);
      state = 'over';
      watchReplay();
      let g = 0;
      while (replaying && g < 200000) { replayStep(); g++; }
      reset = realReset;
      const drift = floaters.some(fl => /no longer matches/.test(fl.text));
      const back = { dist: dist.toFixed(3), x: plane.x.toFixed(3), stars, state };
      return { m, live, back, drift, same: progress === JSON.stringify([xp, bank, bests[m], [...collectionFound].length]) };
    }, m));
  }
  for (const r of replayRuns) {
    check(r.live.frames > 100 && r.live.inputs > 4 && !r.drift && r.back.dist === r.live.dist && r.back.x === r.live.x && r.back.stars === r.live.stars && r.back.state === 'over' && r.same,
      `replay on ${r.m}: run of ${r.live.frames} frames, ${r.live.inputs} inputs, ${r.live.depth} m ended at ${r.live.dist}/${r.live.x}; the replay ended at ${r.back.dist}/${r.back.x}, stars ${r.back.stars}/${r.live.stars}, drift ${r.drift}, progress unchanged ${r.same}`);
  }
  await page.evaluate(() => { gameOver(); });   // (a guard: no replay running, this is just the real game-over screen again)
  const replayUi = await page.evaluate(async () => {
    const shown = !$('replayBtn').hidden;
    $('replayBtn').click();
    const bar = !$('replayBar').hidden && state === 'play';
    for (let i = 0; i < 30; i++) replayStep();
    $('replaySpeed').click(); const speed = $('replaySpeed').textContent;
    $('replayExit').click();
    return { shown, bar, speed, back: state === 'over' && !$('overCard').hidden && $('replayBar').hidden };
  });
  // a damaged recording stops with a message instead of showing a different run
  const replayDrift = await page.evaluate(() => {
    const keep = lastReplay.dts.slice(); lastReplay.dts[40] += 25; lastReplay.dts[41] += 25;
    state = 'over'; watchReplay(); let g = 0; while (replaying && g < 200000) { replayStep(); g++; }
    lastReplay.dts = keep;
    return floaters.some(fl => /no longer matches/.test(fl.text)) && state === 'over';
  });
  check(replayDrift, `a replay that drifts from its run stops with a message: ${replayDrift}`);
  check(replayUi.shown && replayUi.bar && replayUi.speed === '2×' && replayUi.back,
    `Watch replay button: shown ${replayUi.shown}, plays with the bar ${replayUi.bar}, speed ${replayUi.speed}, Exit replay goes back ${replayUi.back}`);

  // leaderboard replays (v158), against a fake server: a joined player's record run takes its replay along, uploaded
  // after the run is counted; the map board offers ▶ on that row; watching it from the board ends where the run did
  // and comes back to the board with the player's own map; a run that is no record uploads nothing
  const lbRep = await page.evaluate(async () => {
    const calls = [], stored = {};
    const realFetch = window.fetch;
    window.fetch = (url, opt) => {
      const fn = String(url).split('/rpc/')[1];
      if (!fn) return realFetch(url, opt);
      const a = JSON.parse(opt.body); calls.push(fn);
      let reply = null;
      if (fn === 'lb_run') reply = 1000;
      else if (fn === 'lb_my_xp') reply = 1000;
      else if (fn === 'lb_save_replay') { stored[a.p_map] = { depth: a.p_depth, sv: a.p_sv, data: a.p_data }; reply = 'ok'; }
      else if (fn === 'lb_board') reply = stored[a.p_map] ? [{ rank: 1, nickname: 'Tester 1', depth: stored[a.p_map].depth, me: true, replay: 'rep-' + a.p_map, replay_sv: stored[a.p_map].sv }] : [];
      else if (fn === 'lb_get_replay') { const m = a.p_id.slice(4); reply = [{ map: m, depth: stored[m].depth, sv: stored[m].sv, nickname: 'Tester 1', data: JSON.parse(JSON.stringify(stored[m].data)) }]; }
      return Promise.resolve(new Response(reply === null ? null : JSON.stringify(reply), { status: reply === null ? 204 : 200 }));
    };
    const keep = { nick: lbNick, map: mapId, best: bests.sea, xp, imported: store.get('nosedive-xp-imported') };
    lbNick = 'Tester 1'; store.set('nosedive-xp-imported', visitorId); lbQueue.length = 0;
    // a record run on Ocean, played through the real frame step (shields set inside reset, so the replay has them too)
    mapId = 'forest'; applyMap(); const myMap = mapId;
    mapId = 'sea'; applyMap(); bests.sea = 0; best = 0;
    const realReset = reset; reset = () => { realReset(); plane.lives = 999; };
    start(); let f = 0;
    while (state === 'play' && score() < 300 && f < 60 * 120) { if (f % 97 === 11) press(f % 194 === 11 ? -1 : 1, 'keyT'); if (f % 97 === 50) release('keyT'); simFrame(1 / 60); f++; }
    const live = { dist: dist.toFixed(3), x: plane.x.toFixed(3), depth: score() };
    pause(); exitRun();
    const queued = !!(lbQueue[0] && lbQueue[0].replay);
    await lbSyncXp();
    const order = calls.filter(c => c === 'lb_run' || c === 'lb_save_replay').join(',');
    // a second, shorter run is no record: no replay with it
    start(); for (let i = 0; i < 120; i++) simFrame(1 / 60); pause(); exitRun();
    const second = lbQueue.length ? !!lbQueue[0].replay : 'sent';
    await lbSyncXp();
    reset = realReset;
    // the board and its ▶
    mapId = myMap; applyMap(); state = 'title'; showCard('title');
    openLeaderboards(); lbMap = 'sea'; renderBoard(); await new Promise(r => setTimeout(r, 300));
    const btn = document.querySelector('#lbList .lb-play-btn');
    let back = null;
    if (btn) {
      reset = () => { realReset(); plane.lives = 999; };       // the replay starts as the run did
      btn.click(); await new Promise(r => setTimeout(r, 300));
      const playing = !!replaying && mapId === 'sea';
      let g = 0, end = null; while (replaying && g < 100000) { end = { dist: dist.toFixed(3), x: plane.x.toFixed(3) }; replayStep(); g++; }
      reset = realReset;
      back = { playing, end, lb: !$('lbCard').hidden, state, map: mapId };
    }
    window.fetch = realFetch; lbNick = keep.nick; bests.sea = keep.best; xp = keep.xp; lbQueue.length = 0; saveQueue(); lbMap = 'total';
    if (keep.imported) store.set('nosedive-xp-imported', keep.imported); else localStorage.removeItem('nosedive-xp-imported');
    mapId = keep.map; applyMap(); showCard('title');
    return { live, queued, order, second, btn: !!btn, back };
  });
  check(lbRep.queued && lbRep.order === 'lb_run,lb_save_replay' && lbRep.second === false && lbRep.btn && lbRep.back && lbRep.back.playing &&
    lbRep.back.end.dist === lbRep.live.dist && lbRep.back.end.x === lbRep.live.x && lbRep.back.lb && lbRep.back.state === 'title' && lbRep.back.map === 'forest',
    `leaderboard replays: record run queued with its replay ${lbRep.queued}, sent as ${lbRep.order}, a non-record run has a replay ${lbRep.second}, ▶ on the board ${lbRep.btn}; watched from the board: ${JSON.stringify(lbRep.back)} vs the run ${JSON.stringify(lbRep.live)}`);

  // the Daily dive (v160): one map per day (it changes from day to day); the same course for everyone, whatever they
  // pick up or however they fly; a flight path for the ghosts; ghosts draw; its replay matches; Play again repeats it;
  // a joined player's daily run reaches the Daily board after the run is counted
  const dv = await page.evaluate(async () => {
    const days = Array.from({ length: 30 }, (_, i) => dailyInfo(20000 + i).map);
    const today = dailyInfo(dayNumber());
    const realReset = reset; reset = () => { realReset(); plane.lives = 999; };
    const realSpawnRow = spawnRow, rows = [];
    spawnRow = (y, d) => { const k = obstacles.length, extra = realSpawnRow(y, d);
      rows.push(Math.round(y) + ':' + obstacles.slice(k).map(o => [o.type, o.look || '', Math.round(o.x || 0), Math.round(o.y)].join(',')).join(';')); return extra; };
    const play = (steer) => {
      rows.length = 0; mapId = today.map; applyMap(); start(today); let f = 0;
      while (state === 'play' && score() < 600 && f < 60 * 120) { steer(f); simFrame(1 / 60); f++; }
      const at = { dist: dist.toFixed(3), x: plane.x.toFixed(3) }, course = rows.filter(r => +r.split(':')[0] < 600 * PX_PER_M).join('|');
      pause(); exitRun();
      return { at, course, n: rows.length };
    };
    const a = play(f => { if (f % 61 === 3) press(-1, 'kA'); if (f % 61 === 40) release('kA'); });
    const b = play(f => { if (f % 37 === 9) press(1, 'kB'); if (f % 37 === 20) release('kB'); if (f % 150 === 70) press(-1, 'kC'); if (f % 150 === 99) release('kC'); });
    spawnRow = realSpawnRow;
    // the second run's flight path, as a ghost in a third daily run: it draws without trouble
    const track = lastReplay.track.slice(), trackOk = track.length >= 8 && track.length % 2 === 0;
    ghosts = [{ name: 'Ghosty', me: false, depth: 600, track }, { name: 'Your best', me: true, depth: 300, track: track.slice(0, 40) }];
    mapId = today.map; applyMap(); const keepGhosts = ghosts; start(today); ghosts = keepGhosts;
    for (let f = 0; f < 600; f++) { simFrame(1 / 60); if (f % 20 === 0) render(); }
    const ghostPos = ghostAt(ghosts[0], 3), crashed = ghostAt(ghosts[1], 30).done > 0;
    // its replay ends where the run did (the course comes from the day, not from the run)
    const live = { dist: dist.toFixed(3), x: plane.x.toFixed(3) };
    pause(); exitRun(); state = 'over';
    watchReplay(); let g = 0, end = null;
    while (replaying && g < 100000) { end = { dist: dist.toFixed(3), x: plane.x.toFixed(3) }; replayStep(); g++; }
    reset = realReset;
    // game over says it was the daily dive, and Play again starts it again
    start(today); dist = 50 * PX_PER_M; gameOver();
    const note = !$('overDaily').hidden && $('overDaily').textContent.startsWith('Daily dive · ' + MAPS[today.map].name);
    return { distinct: new Set(days).size, same: a.course === b.course && a.course.length > 0, rows: a.n, differ: a.at.x !== b.at.x,
      trackOk, ghostPos: !!ghostPos && ghostPos.x > 0, crashed, replayOk: !!end && end.dist === live.dist && end.x === live.x, note, again: lastRunDaily };
  });
  check(dv.distinct >= 6 && dv.same && dv.rows > 40 && dv.differ,
    `Daily dive: ${dv.distinct}/9 maps over 30 days; two runs flown differently (they ended apart: ${dv.differ}) met the same ${dv.rows} rows down to 600 m: ${dv.same}`);
  check(dv.trackOk && dv.ghostPos && dv.crashed && dv.replayOk && dv.note && dv.again,
    `Daily dive: flight path ${dv.trackOk}, ghosts drawn ${dv.ghostPos} (a finished one shows crashed ${dv.crashed}), its replay matches ${dv.replayOk}, game over says Daily dive ${dv.note}, Play again repeats it ${dv.again}`);
  const dsub = await page.evaluate(async () => {
    const calls = [], realFetch = window.fetch;
    window.fetch = (url, opt) => {
      const fn = String(url).split('/rpc/')[1];
      if (!fn) return realFetch(url, opt);
      const a = JSON.parse(opt.body); calls.push(fn + (a.p_day ? ' ' + a.p_day : ''));
      const reply = fn === 'lb_run' ? 500 : fn === 'lb_my_xp' ? 500 : fn === 'lb_daily_submit' ? 'ok' : fn === 'lb_daily_board' ? [{ rank: 1, nickname: 'Tester 1', depth: 77, me: true }] : null;
      return Promise.resolve(new Response(reply === null ? null : JSON.stringify(reply), { status: reply === null ? 204 : 200 }));
    };
    const keep = { nick: lbNick, xp, imp: store.get('nosedive-xp-imported') };
    lbNick = 'Tester 1'; store.set('nosedive-xp-imported', visitorId); lbQueue.length = 0;
    const today = dailyInfo(dayNumber());
    mapId = today.map; applyMap(); start(today);
    for (let f = 0; f < 300; f++) simFrame(1 / 60);
    while (state === 'dying') simFrame(1 / 60);     // a crash finishes by itself
    if (state === 'play') { pause(); exitRun(); }
    const queued = !!(lbQueue[0] && lbQueue[0].daily && lbQueue[0].daily.track.length);
    await lbSyncXp();
    state = 'title'; showCard('title'); openLeaderboards(); lbMap = 'daily'; renderBoard(); await new Promise(r => setTimeout(r, 300));
    const board = { name: $('lbMapName').textContent, rows: document.querySelectorAll('#lbList li').length };
    window.fetch = realFetch; lbNick = keep.nick; xp = keep.xp; lbMap = 'total'; lbQueue.length = 0; saveQueue();
    if (keep.imp) store.set('nosedive-xp-imported', keep.imp); else localStorage.removeItem('nosedive-xp-imported');
    localStorage.removeItem('nosedive-daily'); showCard('title');
    return { queued, order: calls.filter(c => /lb_run|lb_daily_submit/.test(c)).join(','), day: today.day, board, button: $('dailyMap').textContent };
  });
  check(dsub.queued && dsub.order === `lb_run,lb_daily_submit ${dsub.day}` && dsub.board.rows === 1 && dsub.board.name.startsWith('Daily · ') && dsub.button.length > 0,
    `Daily dive online: queued with its path ${dsub.queued}, sent as ${dsub.order}, board "${dsub.board.name}" with ${dsub.board.rows} row, menu button "${dsub.button}"`);

  // the anonymous play log (v142): never sends from file:// (tests, dev), and has a stored random visitor id
  const plog = await page.evaluate(() => ({ on: LOG_ON, id: visitorId, kept: store.get('nosedive-visitor') === visitorId }));
  check(!plog.on && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(plog.id) && plog.kept,
    `play log off from disk, visitor id ${plog.id} kept: on ${plog.on}`);

  // the server status icon (v143): settles to online or offline, turns offline when the network goes, back when it returns
  const netNow = () => page.evaluate(() => $('netStatus').dataset.state + ' / ' + $('netStatus').textContent.trim());
  const netFirst = await netNow();
  await page.setOfflineMode(true); await wait(300);
  const netOff = await netNow();
  await page.setOfflineMode(false); await wait(3000);
  const netBack = await netNow();
  check(!netFirst.startsWith('checking') && netOff === 'offline / Offline' && (netFirst.startsWith('offline') || netBack === 'online / Online'),
    `server status icon: ${netFirst} → network off: ${netOff} → back: ${netBack}`);

  // leaderboards (v144) and server-side XP (v146), against a fake server so the tests never write to the real database
  await page.evaluate(() => {
    window.lbCalls = []; window.fakeXp = 0; window.fakeDown = false;
    window.realFetch = window.fetch;
    window.fetch = (url, opt) => {
      const fn = String(url).split('/rpc/')[1];
      if (!fn) return window.realFetch(url, opt);
      if (fakeDown) return Promise.reject(new TypeError('Failed to fetch'));
      const a = JSON.parse(opt.body);
      lbCalls.push(fn + ' ' + (a.p_nickname || a.p_map || '') + (a.p_depth ? ' ' + a.p_depth : '') + (a.p_xp !== undefined ? a.p_xp : ''));
      const board = [{ rank: 1, nickname: 'Ace', depth: 2400, me: false }, { rank: 2, nickname: 'Bee', depth: 900, me: false }, { rank: 31, nickname: 'Tester 1', depth: 120, me: true }];
      const reply = fn === 'lb_me' ? null : fn === 'lb_claim' ? (a.p_nickname.toLowerCase() === 'taken' ? 'taken' : 'ok') : fn === 'lb_submit' ? undefined
        : fn === 'lb_xp_start' ? (fakeXp += a.p_xp) : fn === 'lb_my_xp' ? fakeXp
        : fn === 'lb_run' ? (a.p_depth > a.p_duration * 16 + 30 ? -1 : (fakeXp += a.p_depth))
        : fn === 'lb_levels' ? Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, nickname: 'P' + i, depth: 20000 - i * 1500, me: false }))
        : fn === 'lb_time' ? [{ rank: 1, nickname: 'Long', depth: 45000, me: false }, { rank: 2, nickname: 'Short', depth: 2520, me: false }] : board;
      return Promise.resolve(new Response(reply === undefined ? null : JSON.stringify(reply), { status: reply === undefined ? 204 : 200 }));
    };
    localStorage.removeItem('nosedive-nick'); localStorage.removeItem('nosedive-xp-imported'); localStorage.removeItem('nosedive-runq');
    lbNick = ''; lbSynced = false; lbQueue.length = 0; window.keepXp = xp; xp = 1000;
    state = 'title'; showCard('title'); bests.sea = 321;
  });
  await page.click('#lbOpen'); await wait(200);
  const lbJoinShown = await page.evaluate(() => !$('lbCard').hidden && !$('lbJoin').hidden && $('lbBoard').hidden);
  await page.click('#lbNick'); await page.keyboard.type('ad');          // a and d steer in a run: here they must just type
  await page.keyboard.press('Enter'); await wait(200);
  const lbShort = await page.evaluate(() => ({ v: $('lbNick').value, msg: $('lbJoinMsg').textContent, state }));
  await page.click('#lbNick', { clickCount: 3 }); await page.keyboard.type('taken'); await page.click('#lbJoinBtn'); await wait(200);
  const lbTaken = await page.evaluate(() => $('lbJoinMsg').textContent);
  await page.click('#lbNick', { clickCount: 3 }); await page.keyboard.type('Tester 1'); await page.click('#lbJoinBtn'); await wait(400);
  const lbJoined = await page.evaluate(() => ({ nick: lbNick, saved: store.get('nosedive-nick'), board: !$('lbBoard').hidden,
    rows: [...document.querySelectorAll('#lbList li')].map(li => li.textContent), me: !!document.querySelector('#lbList li.me'), calls: lbCalls.slice() }));
  await page.click('#lbNext'); await wait(200);
  const lbLevel = await page.evaluate(() => ({ name: $('lbMapName').textContent, rows: [...document.querySelectorAll('#lbList li')].map(li => li.textContent) }));
  await page.click('#lbNext'); await wait(200);
  const lbTime = await page.evaluate(() => ({ name: $('lbMapName').textContent, rows: [...document.querySelectorAll('#lbList li')].map(li => li.textContent), msg: $('lbMsg').textContent }));
  await page.keyboard.press('Escape'); await wait(100);
  const lbClosed = await page.evaluate(() => $('lbCard').hidden && !$('titleCard').hidden);
  const lbXp = await page.evaluate(async () => {
    const run = (m, depth, secs) => { bests[m] = 0; mapId = m; applyMap(); start(); time = secs; dist = depth * PX_PER_M; gameOver(); return lbSyncXp(); };
    lbCalls.length = 0;
    await run('forest', 77, 10); await lbSyncXp();
    const afterRun = { calls: lbCalls.slice(), xp, server: fakeXp };
    fakeDown = true; await run('desert', 50, 10);                   // offline: the run waits in the queue
    const queued = lbQueue.length, stored = JSON.parse(store.get('nosedive-runq')).length;
    fakeDown = false; await lbSyncXp();
    const afterOnline = { queue: lbQueue.length, xp, server: fakeXp };
    await run('volcano', 5000, 10); await lbSyncXp();                 // impossible: 5,000 m in 10 s is refused
    const afterFake = { xp, server: fakeXp };
    state = 'title'; rankAt = 0; showCard('title'); await new Promise(r => setTimeout(r, 300));
    const rank = $('menuRank').hidden ? 'hidden' : $('menuRank').textContent;   // the fake board has Tester 1 at #31
    window.fetch = window.realFetch; localStorage.removeItem('nosedive-nick'); localStorage.removeItem('nosedive-runq'); localStorage.removeItem('nosedive-xp-imported');
    lbNick = ''; delete bests.sea; xp = keepXp; store.set('nosedive-xp', String(xp));
    showCard('title'); const rankGone = $('menuRank').hidden; localStorage.removeItem('nosedive-rank');
    return { afterRun, queued, stored, afterOnline, afterFake, rank, rankGone };
  });
  check(lbJoinShown && lbShort.v === 'ad' && lbShort.state === 'title' && /3–16/.test(lbShort.msg) && /taken/.test(lbTaken),
    `leaderboards: nickname form first; typing a/d types (${lbShort.v}, ${lbShort.state}); short name refused; "${lbTaken}"`);
  check(lbJoined.nick === 'Tester 1' && lbJoined.saved === 'Tester 1' && lbJoined.board && lbJoined.rows.length === 4 && lbJoined.me &&
    lbJoined.calls.includes('lb_submit sea 321') && lbJoined.calls.includes('lb_xp_start 1000') && lbClosed,
    `leaderboards: joined as ${lbJoined.nick}, ${lbJoined.rows.length} rows (${lbJoined.rows.join(' | ')}), bests synced, XP carried over (${lbJoined.calls.filter(c => c.startsWith('lb_xp')).join(', ')}), Esc closes`);
  check(lbLevel.name === 'Level' && lbLevel.rows.length === 10 && lbLevel.rows[0] === '#1P0Level 14',
    `Level board: ${lbLevel.name}, ${lbLevel.rows.length} rows, first ${lbLevel.rows[0]}`);
  check(lbTime.name === 'Time played' && lbTime.rows.join(' | ') === '#1Long12 h 30 min | #2Short42 min' && lbTime.msg === '',
    `Time played board: ${lbTime.name}: ${lbTime.rows.join(' | ')}`);
  check(lbXp.afterRun.calls.includes('lb_run forest 77') && lbXp.afterRun.xp === 1077 && lbXp.afterRun.server === 1077 &&
    lbXp.queued === 1 && lbXp.stored === 1 && lbXp.afterOnline.queue === 0 && lbXp.afterOnline.xp === 1127 && lbXp.afterFake.xp === 1127,
    `server XP: run counted (${lbXp.afterRun.xp}/${lbXp.afterRun.server}); offline run queued (${lbXp.queued}, saved ${lbXp.stored}) and sent later (${lbXp.afterOnline.xp}); impossible run refused, device back to ${lbXp.afterFake.xp}`);
  check(lbXp.rank === '#31' && lbXp.rankGone, `start menu shows the Total score place: ${lbXp.rank}, hidden when not joined: ${lbXp.rankGone}`);

  check(errors.length === 0, errors.length ? 'errors:\n  ' + errors.join('\n  ') : 'no page errors');
  await browser.close();
  console.log(problems.length ? `\n${problems.length} problem(s)` : '\nall good');
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error('FAIL ' + e.message); process.exit(1); });
