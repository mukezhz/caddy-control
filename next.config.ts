import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    nodeMiddleware: true
  },
  output: 'standalone'
};

export default nextConfig;
