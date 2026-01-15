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
  }
};

export default withNextIntl(nextConfig);
