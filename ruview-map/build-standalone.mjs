// Inlines style.css, config.js and app.js into one HTML file.
//
//   node build-standalone.mjs                     → ../sites/ruview-map.html
//   node build-standalone.mjs --fragment out.html → also a version without
//                                                   <html>/<head>/<body>, for
//                                                   hosts that add their own
//
// Three.js and the fonts still load from their CDNs.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFile(join(here, name), 'utf8');

const [html, css, config, app] = await Promise.all([read('index.html'), read('style.css'), read('config.js'), read('app.js')]);
for (const [name, src] of [['config.js', config], ['app.js', app]]) {
  if (/<\/script/i.test(src)) throw new Error(`${name} contains "</script" and cannot be inlined`);
}

// Function replacements, so "$" in the sources is never read as a pattern.
const swap = (src, tag, content) => {
  if (!src.includes(tag)) throw new Error(`index.html no longer contains: ${tag}`);
  return src.replace(tag, () => content);
};

let page = html;
page = swap(page, '<link rel="stylesheet" href="style.css">', `<style>\n${css}</style>`);
page = swap(page, '<script src="config.js"></script>', `<script>\n${config}</script>`);
page = swap(page, '<script type="module" src="app.js"></script>', `<script type="module">\n${app}</script>`);

const out = join(here, '..', 'sites', 'ruview-map.html');
await mkdir(dirname(out), { recursive: true });
await writeFile(out, page);
console.log(`wrote ${out}`);

const i = process.argv.indexOf('--fragment');
if (i !== -1 && process.argv[i + 1]) {
  const fragment = page
    .replace(/<!doctype html>\s*/i, '')
    .replace(/<html[^>]*>\s*/i, '')
    .replace(/<\/?head>\s*/gi, '')
    .replace(/<\/?body>\s*/gi, '')
    .replace(/<\/html>\s*/i, '')
    .replace(/<meta charset="utf-8">\s*/i, '')
    .replace(/<meta name="viewport"[^>]*>\s*/i, '');
  await writeFile(process.argv[i + 1], fragment);
  console.log(`wrote ${process.argv[i + 1]}`);
}
