// app/frame/[market]/page.tsx
// Farcaster Frame dynamic route for yield markets
// Validates at framescan.com
//
// Usage: /frame/usdc-vault, /frame/eth-vault, etc.

import type { Metadata } from 'next'

interface FramePageProps {
  params: { market: string }
}

export async function generateMetadata({ params }: FramePageProps): Promise<Metadata> {
  const { market } = params
  const marketName = market.replace(/-/g, ' ').toUpperCase()
  const frameUrl = `https://foresight-apps.vercel.app/frame/${market}`

  return {
    title: `Foresight: Earn on ${marketName}`,
    openGraph: {
      images: [{ url: '/yield-chart.png', width: 1200, height: 630 }],
    },
    other: {
      // Farcaster Frame v2 meta tags
      'fc:frame': 'vNext',
      'fc:frame:image': '/yield-chart.png',
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': '🚀 Deposit $100 → Earn 12% APY',
      'fc:frame:button:1:action': 'post',
      'fc:frame:button:2': '📊 Preview Yield',
      'fc:frame:button:2:action': 'post',
      'fc:frame:button:3': '🔗 Open Dashboard',
      'fc:frame:button:3:action': 'link',
      'fc:frame:button:3:target': `https://foresight-apps.vercel.app/dashboard`,
      'fc:frame:post_url': `${frameUrl}/api/action`,
    },
  }
}

export default async function FramePage({ params }: FramePageProps) {
  const { market } = params
  const marketName = market.replace(/-/g, ' ').toUpperCase()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-base-navy">
      <div className="max-w-lg w-full">
        <h1 className="text-3xl font-bold text-farcaster-blue mb-2">
          Foresight: {marketName}
        </h1>
        <p className="text-gray-400 mb-6">
          Deposit USDC into this yield vault via Farcaster Frame.
        </p>

        {/* Frame preview (shown in web browser, not in frame) */}
        <div className="border border-farcaster-blue/30 rounded-xl p-6 bg-gray-900">
          <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-gray-500">yield-chart.png (1200×630)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-farcaster-blue/20 border border-farcaster-blue/40 rounded px-2 py-1.5 text-sm text-white">
              🚀 Deposit $100
            </button>
            <button className="bg-farcaster-blue/20 border border-farcaster-blue/40 rounded px-2 py-1.5 text-sm text-white">
              📊 Preview Yield
            </button>
            <button className="bg-farcaster-blue/20 border border-farcaster-blue/40 rounded px-2 py-1.5 text-sm text-white">
              🔗 Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
