/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Image optimization — WebP/AVIF served to browsers, PNG kept for Farcaster Frame meta tags
  images: {
    domains: ['foresight-apps.vercel.app', 'base.org'],
    formats: ['image/webp', 'image/avif'],
  },

  // Vercel Edge Runtime support
  experimental: {
    serverActions: {
      allowedOrigins: ['foresight-apps.vercel.app', 'localhost:3000'],
    },
  },

  // Headers for Farcaster Frame validation, CORS, and image caching
  async headers() {
    return [
      {
        source: '/frame/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      // Cache static images for 24h — yield-chart.png is LCP
      {
        source: '/:file(yield-chart\\.png|.*\\.png|.*\\.jpg|.*\\.webp)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
