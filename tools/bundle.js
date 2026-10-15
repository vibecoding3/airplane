// Inlines style.css and the js/ files into one page (for the claude.ai artifact copy, which must be a single file).
//   node tools/bundle.js                 writes tools/out/paper-nosedive.html
//   node tools/bundle.js <out.html>
const fs = require('fs'), path = require('path');
const { ROOT, outFile } = require('./lib');
const out = process.argv[2] || outFile('paper-nosedive.html');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let html = read('index.html');
html = html.replace('<link rel="stylesheet" href="style.css">', () => '<style>\n' + read('style.css') + '</style>');
html = html.replace(/<script src="(js\/[\w-]+\.js)"><\/script>/g, (_, f) => '<script>\n' + read(f) + '</script>');
if (/<script src=|href="style\.css"/.test(html)) throw new Error('something was not inlined');
// the artifact host adds its own document skeleton
html = html.split('\n').filter(l => !/^<!doctype|^<\/?html|^<\/?head>|^<\/?body>|^<meta /i.test(l)).join('\n');
fs.writeFileSync(out, html);
console.log('wrote ' + out);
