import type { NextConfig } from "next";
import { NEXT_APP_BASE_PATH_PRODUCTION } from "./src/config/next-base-path";
import { getNextDistDir } from "./src/config/next-dist-dir";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? NEXT_APP_BASE_PATH_PRODUCTION : "",
  assetPrefix: isProd ? NEXT_APP_BASE_PATH_PRODUCTION : "",
  distDir: getNextDistDir(),

  compress: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;