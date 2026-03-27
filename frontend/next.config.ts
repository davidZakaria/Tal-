import type { NextConfig } from "next";

/**
 * Avoid setting turbopack.root manually: on Windows, a mis-resolved path can make the
 * dev file watcher scan far more than the app folder and peg RAM/CPU (looks like a “PC crash”).
 */
const nextConfig: NextConfig = {
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
