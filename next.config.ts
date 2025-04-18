import type { NextConfig } from "next";
import { createContentlayerPlugin } from 'next-contentlayer2';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    nodeMiddleware: true
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https' as 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

const withContentlayer = createContentlayerPlugin({
  // Additional Contentlayer config options
});

export default withContentlayer(nextConfig);
