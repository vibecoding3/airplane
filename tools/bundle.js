// Inlines style.css and the js/ files into one page (for the claude.ai artifact copy, which must be a single file).
//   node tools/bundle.js                 writes tools/out/paper-nosedive.html
//   node tools/bundle.js <out.html>
const fs = require('fs'), path = require('path');
const { ROOT, outFile } = require('./lib');
const out = process.argv[2] || outFile('paper-nosedive.html');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let html = read('index.html');
// images referenced from the stylesheet are embedded as data URLs
const css = read('style.css').replace(/url\("(img\/[\w.-]+\.svg)"\)/g,
  (_, f) => `url("data:image/svg+xml;base64,${Buffer.from(read(f)).toString('base64')}")`);
html = html.replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + css + '</style>');
// the bundled fonts are embedded as data URLs
const fonts = read('fonts/fonts.css').replace(/url\(([\w.-]+\.woff2)\)/g,
  (_, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'fonts', f)).toString('base64')})`);
html = html.replace('<link rel="stylesheet" href="fonts/fonts.css">', () => '<style>\n' + fonts + '</style>');
html = html.replace(/<script src="(js\/[\w-]+\.js)"><\/script>/g, (_, f) => '<script>\n' + read(f) + '</script>');
if (/<script src=|href="style\.css"|href="fonts\//.test(html)) throw new Error('something was not inlined');
// the artifact host adds its own document skeleton
html = html.split('\n').filter(l => !/^<!doctype|^<\/?html|^<\/?head>|^<\/?body>|^<meta /i.test(l)).join('\n');
fs.writeFileSync(out, html);
console.log('wrote ' + out);
