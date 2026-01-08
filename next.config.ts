import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development
  reactStrictMode: true,

  // Image optimization - use modern formats
  images: {
    formats: ['image/avif', 'image/webp'],
    // Enable remote patterns if needed
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'example.com' },
    // ],
  },

  // Compression
  compress: true,

  // Optimize package imports for faster builds
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Security & performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security headers
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Cache static assets for 1 year
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache video for 1 year
        source: '/(.*)\\.mp4',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Powered by header removal for security
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
