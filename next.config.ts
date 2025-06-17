import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression for better performance
  compress: true,
  
  // Enable experimental features for better SEO
  experimental: {
    optimizePackageImports: ['@mdx-js/react'],
  },

  // Add security and SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers that also help with SEO rankings
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Cache control for better performance
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Specific cache headers for static assets
        source: '/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Add redirects if needed for SEO
  async redirects() {
    return [
      // Example: redirect old blog paths if any
      // {
      //   source: '/old-blog/:path*',
      //   destination: '/post/:path*',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;
