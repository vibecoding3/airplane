// Picture sheets of every obstacle look, one per map: node tools/obstacle-sheets.js [map] → tools/out/obstacles/<map>.png
// Each look is captured from a real spawned row (at a depth where that look appears), rendered alone over the map's
// page colour at that depth. Collectibles are left out (the Collections screen shows them).
const path = require('path'), fs = require('fs');
const { openGame, wait, OUT } = require('./lib');
const only = process.argv[2];

(async () => {
  const dir = path.join(OUT, 'obstacles'); fs.mkdirSync(dir, { recursive: true });
  const { browser, page, errors } = await openGame();
  const maps = await page.evaluate(() => Object.keys(MAPS));
  for (const m of maps) {
    if (only && m !== only) continue;
    const res = await page.evaluate(async (m) => {
      const MECH = { gate: 'Gap Wall', erasers: 'Closing Jaws', blots: 'Static Hazards', protractor: 'Wall Bulge', pencil: 'Bouncing Slider',
        wad: 'Rising Projectile', notes: 'Drifting Swarm', clips: 'Conveyor', starfish: 'Spinning Drifter', setsquare: 'Spinning Drifter',
        scissors: 'Spinning Blades', compass: 'Sweeping Arm', cutter: 'Wall Piston', glue: 'Wall Turret', zap: 'Charged Beam',
        paw: 'Telegraphed Sweep', mine: 'Proximity Blast', fan: 'Push Zone', bubbles: 'Effect Zone', band: 'Spring Line',
        planet: 'Wall Bulge', iss: 'Bouncing Slider', blackhole: 'Static Hazards', neon: 'Wall Bulge', rings: 'Rising Projectile' };
      const ORDER = ['Gap Wall', 'Closing Jaws', 'Static Hazards', 'Wall Bulge', 'Bouncing Slider', 'Rising Projectile', 'Drifting Swarm', 'Conveyor',
        'Spinning Drifter', 'Spinning Blades', 'Sweeping Arm', 'Wall Piston', 'Wall Turret', 'Charged Beam', 'Telegraphed Sweep',
        'Proximity Blast', 'Push Zone', 'Effect Zone', 'Spring Line'];
      mapId = m; applyMap(); start(); state = 'play';
      // the pool (shallow and deep, so wind and conveyors are in it)
      const real = spawnFromPool, pool = new Set();
      spawnFromPool = (y, d, p) => { for (const [t] of p) pool.add(t); return 0; };
      for (const md of [50, 500, 1000, 2000]) spawnRow(md * PX_PER_M, 1 - Math.exp(-md / 600));
      spawnFromPool = real;
      // capture the first row of every look (a look = the main obstacle's o.look; the wind row's extra hazard isn't a look)
      const caps = [];
      for (const t of pool) {
        const mech = MECH[makerOf(t)] || MECH[t] || makerOf(t), have = new Set();
        for (let i = 0; i < 600 && have.size < 12; i++) {
          const md = 40 + ((i * 37) % 600) / 600 * 2900, y = md * PX_PER_M;
          obstacles = []; pickups = []; runCollected.clear(); lastType = '';
          dist = y - H / 2;
          let extra = 0;
          try { extra = spawnFromPool(y, 1 - Math.exp(-md / 600), [[t, 1]]) || 0; } catch (e) { continue; }
          const row = obstacles.filter(o => !collectionId(o));
          if (!row.length) continue;
          const main = makerOf(t) === 'fan' ? row.find(o => o.type === 'fan') || row[0] : row[0];
          const look = main.look || 'standard';
          if (have.has(look)) continue;
          have.add(look);
          caps.push({ t, mech, look, md, y, extra, row });
        }
      }
      // draw each capture alone: no plane, scenery, markers or pickups
      const keepMarkers = drawDepthMarkers; drawDepthMarkers = () => {};
      const k = scale * dpr, cropH = 380, cw = Math.round(W * k * 0.5), ch = Math.round(cropH * k * 0.5), label = 46;
      const cells = [];
      for (const c of caps) {
        obstacles = c.row; pickups = []; particles = []; floaters = []; formulas = []; fishes.length = 0;
        plane.x = -2000; plane.alive = true; plane.magnet = 0; plane.ink = 0; shake = 0; flash = 0;
        const centre = c.y + c.extra / 2;
        dist = centre - H / 2;
        // play it forward and keep the moment that shows the most (a paw only shows mid-swipe, a beam while it fires)
        const sx = 0, sy = Math.round((H / 2 - cropH / 2) * k), sw = Math.round(W * k), sh = Math.round(cropH * k);
        const shot = document.createElement('canvas'); shot.width = cw; shot.height = ch;
        const sg = shot.getContext('2d', { willReadFrequently: true });
        let best = -1, bestImg = null;
        time = 0;
        for (let sample = 0; sample < 14; sample++) {
          for (let f = 0; f < 14; f++) { time += 1 / 60; for (const o of c.row) { try { updateObstacle(o, 1 / 60); } catch (e) { /* drawn as spawned */ } } }
          dist = centre - H / 2;
          render();
          sg.clearRect(0, 0, cw, ch); sg.drawImage(canvas, sx, sy, sw, sh, 0, 0, cw, ch);
          const d = sg.getImageData(0, 0, cw, ch).data; let n = 0;
          for (let i = 3; i < d.length; i += 16) if (d[i] > 40) n++;
          if (makerOf(c.t) === 'mine' ? bestImg === null : n > best) { best = n; bestImg = sg.getImageData(0, 0, cw, ch); }   // a blast: before it goes off
        }
        const cell = document.createElement('canvas'); cell.width = cw; cell.height = ch + label;
        const g = cell.getContext('2d');
        g.fillStyle = pageColor(pageIndexAt(c.y)); g.fillRect(0, 0, cw, ch);
        sg.putImageData(bestImg, 0, 0); g.drawImage(shot, 0, 0);
        g.fillStyle = '#ffffff'; g.fillRect(0, ch, cw, label);
        g.fillStyle = '#22356b'; g.font = '700 17px sans-serif'; g.fillText(c.mech + ': ' + c.look, 8, ch + 21);
        g.font = '14px sans-serif'; g.fillStyle = '#5a6380'; g.fillText(`type ${c.t} · seen at ${Math.round(c.md)} m`, 8, ch + 40);
        cells.push({ mech: c.mech, cell });
      }
      drawDepthMarkers = keepMarkers;
      // the sheet: a grid five across, in catalogue order of the mechanics
      cells.sort((p, q) => ORDER.indexOf(p.mech) - ORDER.indexOf(q.mech));
      const mechs = new Set(cells.map(c => c.mech)).size, cols = 5, head = 64, pad = 8;
      const rowsN = Math.ceil(cells.length / cols);
      const sheet = document.createElement('canvas');
      sheet.width = pad + cols * (cw + pad); sheet.height = head + rowsN * (ch + label + pad) + pad;
      const s = sheet.getContext('2d');
      s.fillStyle = '#1b1d2a'; s.fillRect(0, 0, sheet.width, sheet.height);
      s.fillStyle = '#ffffff'; s.font = '700 32px sans-serif';
      s.fillText(`${MAPS[m].name}: ${cells.length} looks on ${mechs} mechanics`, 14, 44);
      cells.forEach((c, i) => s.drawImage(c.cell, pad + (i % cols) * (cw + pad), head + Math.floor(i / cols) * (ch + label + pad)));
      const rows = { length: mechs };
      gameOver(); state = 'title'; showCard('title');
      return { png: sheet.toDataURL('image/png'), looks: cells.length, mechs: rows.length };
    }, m);
    const file = path.join(dir, `${m}.png`);
    fs.writeFileSync(file, Buffer.from(res.png.split(',')[1], 'base64'));
    console.log(`${file}  (${res.looks} looks, ${res.mechs} mechanics)`);
  }
  if (errors.length) console.log('errors:', errors);
  await browser.close();
})();
