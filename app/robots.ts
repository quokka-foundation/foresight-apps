// app/robots.ts
// Next.js auto-generates /robots.txt from this file.
// Allows all crawlers including Farcaster Frame validators.

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://foresight-apps.vercel.app/sitemap.xml',
  }
}
