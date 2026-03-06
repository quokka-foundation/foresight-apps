/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['foresight-apps.vercel.app', 'base.org'],
    formats: ['image/webp', 'image/avif'],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['foresight-apps.vercel.app', 'localhost:3000'],
    },
  },

  // Webpack config for handling React Native modules from Farcaster SDK
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
    };
    // Alias React Native modules that may leak from dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': false,
      'react-native-webview': false,
    };
    config.externals = [...(config.externals || []), 'pino-pretty'];
    return config;
  },

  async headers() {
    return [
      {
        // Farcaster Mini App — allow embedding in any frame client
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
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
      {
        // .well-known must be accessible for Farcaster manifest validation
        source: '/.well-known/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        source: '/:file(.*\\.png|.*\\.jpg|.*\\.webp|.*\\.svg)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
