import type { NextConfig } from "next";

/**
 * `STATIC_EXPORT=1 next build` writes a plain folder of HTML that any static
 * host will serve. The normal build stays a Next app.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = staticExport
  ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
