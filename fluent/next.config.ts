import type { NextConfig } from "next";

/**
 * `npm run build` produces the usual server build.
 * `npm run export` sets STATIC_EXPORT=1 and writes plain files to out/,
 * which can be dropped on any static host — no Node process required.
 *
 * NEXT_BASE_PATH is set only in CI (see .github/workflows/deploy-fluent.yml)
 * because this project is deployed under a subpath (github.io/<repo>/fluent),
 * not domain root. next/link and the App Router prefix it automatically, so
 * no other code needs to know about it.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(staticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        ...(basePath ? { basePath, assetPrefix: basePath } : {}),
      }
    : {}),
};

export default nextConfig;
