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
  check(coll.found === 'ring-ruby,staff-frieren' && coll.saved === 2 && coll.total === 90,
    `Collections: on-screen items unlock (${coll.found}), saved ${coll.saved}, ${coll.total} items in 13 sets`);
  await page.evaluate(() => { state = 'title'; showCard('title'); });
  await page.click('#collBtn'); await wait(150);
  const collOpen = await page.evaluate(() => ({ shown: !$('collCard').hidden, tiles: document.querySelectorAll('.coll-item').length }));
  await page.keyboard.press(' '); await wait(150);                 // Space must not start a run from here
  const stillTitle = await page.evaluate(() => state);
  await page.keyboard.press('Escape'); await wait(150);
  const closed = await page.evaluate(() => !$('titleCard').hidden && $('collCard').hidden);
  check(collOpen.shown && collOpen.tiles === 90 && stillTitle === 'title' && closed,
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
    return { atStart, still, past, after: $('hint').hidden, button: !!document.getElementById('pauseBtn') };
  });
  check(hint.atStart && hint.still && hint.past && hint.after && !hint.button, `control tips: shown at the start ${hint.atStart}, still at 150 m ${hint.still}, hidden past 200 m ${hint.past}, hidden after the run ${hint.after}; no pause button in the top bar ${!hint.button}`);

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

  // the Sunken treasures collection: treasures among the Ocean's city relics (400–1,500 m), each once per run
  const treasures = await page.evaluate(() => {
    mapId = 'sea'; applyMap(); start(); const seen = new Map(); let outside = 0;
    for (let f = 0; f < 60 * 900 && dist / PX_PER_M < 2500; f++) {
      plane.invuln = 1; update(1 / 60);
      for (const o of obstacles) if (o.treasure) { if (!seen.has(o.treasure)) seen.set(o.treasure, new Set()); seen.get(o.treasure).add(o); if (o.layer !== 2 && o.layer !== 3) outside++; }
    }
    gameOver();
    return { seen: seen.size, repeats: [...seen.values()].filter(x => x.size > 1).length, outside };
  });
  check(treasures.repeats === 0 && treasures.seen >= 4 && treasures.outside === 0,
    `Sunken treasures collection: ${treasures.seen}/8 seen in a run to 2,500 m, repeats ${treasures.repeats}, outside the city ${treasures.outside}`);

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
