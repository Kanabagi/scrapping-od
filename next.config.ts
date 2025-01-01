import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'otakudesu.cloud',
      },
    ],
  },
};

export default nextConfig;
