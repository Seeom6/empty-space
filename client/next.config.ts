import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from localhost for development
    domains: [
      'localhost',
      '127.0.0.1',
    ],
    // Allow images from common CDNs and external sources
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '12001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
