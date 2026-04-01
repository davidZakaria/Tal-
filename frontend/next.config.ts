import type { NextConfig } from "next";

/** Where Next.js proxies `/api/*` in dev (and when the client uses same-origin `/api` URLs). */
const backendOrigin = (process.env.BACKEND_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

/**
 * Avoid setting turbopack.root manually: on Windows, a mis-resolved path can make the
 * dev file watcher scan far more than the app folder and peg RAM/CPU (looks like a “PC crash”).
 */
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
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

export default nextConfig;
