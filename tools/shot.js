// Phone-size screenshots (412×860) saved to tools/out/.
//   node tools/shot.js title              title screen (Paper map)
//   node tools/shot.js title sea          title screen (Ocean map)
//   node tools/shot.js sea 0 250 1300     gameplay on a map at these depths (metres)
//   node tools/shot.js space 0 500        (map ids: notebook = Paper, sea, space, dungeon, city = Neon City, forest, desert, volcano, kitchen)
const { openGame, wait, outFile } = require('./lib');
const [what = 'title', ...rest] = process.argv.slice(2);

(async () => {
  const { browser, page, errors } = await openGame();
  const saved = [];
  if (what === 'title') {
    const map = rest[0] || 'notebook';
    await page.click(`#titleCard .map-tile[data-map="${map}"]`); await wait(400);
    const file = outFile(`title-${map}.png`);
    await page.screenshot({ path: file }); saved.push(file);
  } else {
    for (const m of (rest.length ? rest : ['0']).map(Number)) {
      await page.evaluate((map, depth) => {
        mapId = map; applyMap(); start(); plane.lives = 1e9;
        while (dist / PX_PER_M < depth) update(1 / 60);
        // the endless shield keeps the plane alive; drop its "Shield used!" messages so they don't pile up under the plane
        prune(floaters, f => !f.text.startsWith('Shield used'));
      }, what, m);
      await wait(400);
      const file = outFile(`${what}-${m}.png`);
      await page.screenshot({ path: file }); saved.push(file);
    }
  }
  await browser.close();
  console.log(saved.join('\n'));
  if (errors.length) { console.log('errors:\n  ' + errors.join('\n  ')); process.exit(1); }
})().catch(e => { console.error('FAIL ' + e.message); process.exit(1); });
