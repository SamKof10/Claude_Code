import type { NextConfig } from "next";

/**
 * `npm run build` produces the usual server build.
 * `npm run export` sets STATIC_EXPORT=1 and writes plain files to out/,
 * which can be dropped on any static host — no Node process required.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(staticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
