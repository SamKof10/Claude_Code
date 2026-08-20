import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "dist");

const css = await readFile(resolve(dist, "styles.css"), "utf8");
const js = await readFile(resolve(dist, "bundle.js"), "utf8");

const FONTS =
  "@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');\n";

// Content only — the artifact host supplies doctype/html/head/body.
const content = `<title>MUDROOM ONE</title>
<style>
${FONTS}${css}
</style>
<div id="mudroom-root"></div>
<script>
${js}
</script>
`;

await writeFile(resolve(dist, "mudroom.html"), content, "utf8");

// A wrapped copy so the same output can be opened in a normal browser.
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
</head><body>
${content}
</body></html>`;
await writeFile(resolve(dist, "local.html"), page, "utf8");

console.log("mudroom.html:", (content.length / 1024 / 1024).toFixed(2), "MB");
