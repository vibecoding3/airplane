// Copies the web game from the repo root into app/www for Capacitor, adding the app-only native.js.
// Only what the game needs goes in: no tools/, ref/, README or app/ itself.
//   node app/copy-web.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const WWW = path.join(__dirname, 'www');
const COPY = ['index.html', 'style.css', 'depth-art.css', 'js', 'img', 'fonts'];

fs.rmSync(WWW, { recursive: true, force: true });
for (const f of COPY) fs.cpSync(path.join(ROOT, f), path.join(WWW, f), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'native.js'), path.join(WWW, 'native.js'));

// native.js runs after main.js, which must stay the last of the game's scripts
const page = path.join(WWW, 'index.html');
const html = fs.readFileSync(page, 'utf8');
const main = '<script src="js/main.js"></script>';
if (!html.includes(main)) throw new Error('index.html no longer loads js/main.js: update copy-web.js');
fs.writeFileSync(page, html.replace(main, main + '\n<script src="native.js"></script>'));
console.log('copied the game into ' + WWW);
