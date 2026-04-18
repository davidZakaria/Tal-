import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { createRequire } from "module";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Where Next.js proxies `/api/*` in dev (and when the client uses same-origin `/api` URLs). */
const backendOrigin = (process.env.BACKEND_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

/**
 * Absolute path to this app (`frontend/`), resolved via `package.json` (not `import.meta.url`).
 * A `package-lock.json` under your user folder (e.g. `C:\Users\you\`) makes Next pick the wrong
 * workspace root; wrong `turbopack.root` can make the dev watcher scan huge trees and peg CPU/RAM.
 */
const require = createRequire(import.meta.url);
const appDir = path.dirname(require.resolve("./package.json"));

const nextConfig: NextConfig = {
  trailingSlash: false,
  turbopack: {
    root: appDir,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  /** Reduce stale logo caching when replacing `public/logo.*` during development. */
  async headers() {
    return [
      {
        source: "/logo.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/logo.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/logo.webp",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
