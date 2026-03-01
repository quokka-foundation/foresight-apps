// app/frame/[market]/page.tsx
// Farcaster Frame dynamic route for yield markets
// Validates at framescan.com
//
// Usage: /frame/usdc-vault, /frame/eth-vault, etc.

import type { Metadata } from 'next'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { YieldImage } from '@/components/YieldImage'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://foresight-apps.vercel.app'

interface FramePageProps {
  params: Promise<{ market: string }>
}

export async function generateMetadata({ params }: FramePageProps): Promise<Metadata> {
  const { market } = await params
  const marketName = market.replace(/-/g, ' ').toUpperCase()

  return {
    title: `Foresight: Earn on ${marketName}`,
    description: 'Deposit $100 USDC, earn $112 in 30 days at 12% APY on Base.',
    openGraph: {
      images: [{ url: `${BASE_URL}/yield-chart.png`, width: 1200, height: 630 }],
    },
    other: {
      // Farcaster Frame v2 meta tags
      'fc:frame': 'vNext',
      'fc:frame:image': `${BASE_URL}/yield-chart.png`,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': '🚀 Deposit $100 → Earn 12% APY',
      'fc:frame:button:1:action': 'post',
      'fc:frame:button:2': '📊 Preview Yield',
      'fc:frame:button:2:action': 'post',
      'fc:frame:button:3': '🔗 Open Dashboard',
      'fc:frame:button:3:action': 'link',
      'fc:frame:button:3:target': `${BASE_URL}/dashboard`,
      'fc:frame:post_url': `${BASE_URL}/api/frame/action`,
    },
  }
}

export default async function FramePage({ params }: FramePageProps) {
  const { market } = await params
  const marketName = market.replace(/-/g, ' ').toUpperCase()

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0b1e]">
        <div className="max-w-[400px] w-full">
          <h1 className="text-2xl font-bold text-[#1DA1F2] mb-1">
            Foresight: {marketName}
          </h1>
          <p className="text-gray-400 text-sm mb-4">
            Deposit $100 USDC → earn $112 in 30 days at 12% APY on Base.
          </p>

          {/* Yield chart image */}
          <YieldImage className="mb-4" />

          {/* Frame action buttons (web preview) */}
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 rounded px-2 py-2 text-xs text-white">
              🚀 Deposit $100
            </button>
            <button className="bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 rounded px-2 py-2 text-xs text-white">
              📊 Preview Yield
            </button>
            <a
              href="/dashboard"
              className="bg-[#1DA1F2]/20 border border-[#1DA1F2]/40 rounded px-2 py-2 text-xs text-white text-center"
            >
              🔗 Dashboard
            </a>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
