// app/sitemap.ts
// Next.js auto-generates /sitemap.xml from this file

import { MetadataRoute } from 'next'

const BASE_URL = 'https://foresight-apps.vercel.app'

const MARKET_IDS = [
  'trump-2026',
  'btc-150k',
  'fed-rate-cut',
  'eth-10k',
  'base-tvl-50b',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const marketPages = MARKET_IDS.map((id) => ({
    url: `${BASE_URL}/curve/${id}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/wallet`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/create`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...marketPages,
  ]
}
