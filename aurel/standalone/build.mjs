import * as esbuild from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const out = resolve(here, "dist");
await mkdir(out, { recursive: true });

const result = await esbuild.build({
  entryPoints: [resolve(here, "App.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  tsconfig: resolve(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "next/link": resolve(here, "shims/link.tsx"),
    "next/navigation": resolve(here, "shims/navigation.ts"),
  },
  logLevel: "warning",
  logOverride: { "unsupported-jsx-comment": "silent" },
  outfile: resolve(out, "bundle.js"),
});

if (result.errors.length) process.exit(1);
console.log("bundle gebaut");
