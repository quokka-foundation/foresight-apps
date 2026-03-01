/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Image optimization domains for Farcaster/Base assets
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

  // Headers for Farcaster Frame validation
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
    ]
  },
}

module.exports = nextConfig
