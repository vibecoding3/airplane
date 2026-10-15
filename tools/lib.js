// Shared helpers for the dev tools: find Chrome, open the game at phone size, collect page errors.
const fs = require('fs'), path = require('path'), url = require('url');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'out');
const GAME_URL = url.pathToFileURL(path.join(ROOT, 'index.html')).href;

function chromePath() {
  const tries = [process.env.CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium'];
  const found = tries.find(p => p && fs.existsSync(p));
  if (!found) throw new Error('Chrome not found: set the CHROME environment variable to its path');
  return found;
}

// opens the game in a phone-size page; `errors` collects page errors, console errors and missing files
async function openGame({ width = 412, height = 860, scale = 2 } = {}) {
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => { if (!r.url().includes('fonts.g')) errors.push('missing file: ' + r.url()); });
  await page.goto(GAME_URL);
  await wait(800);
  return { browser, page, errors };
}

const wait = ms => new Promise(r => setTimeout(r, ms));
const outFile = name => { fs.mkdirSync(OUT, { recursive: true }); return path.join(OUT, name); };

module.exports = { ROOT, OUT, openGame, wait, outFile };
