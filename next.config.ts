import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Allow images from any external source when backend connects
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  // When multiple lockfiles exist in parent folders, Next infers the wrong workspace root.
  // Set `outputFileTracingRoot` to the project root to silence that warning and ensure
  // correct tracing when building on CI (Vercel).
  outputFileTracingRoot: path.join(__dirname, "."),
};

export default nextConfig;
