import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Foresight Apps',
  description: 'Farcaster-first yield vaults on Base. Earn 12% APY via Farcaster Frames.',
  openGraph: {
    title: 'Foresight Apps',
    description: 'Deposit USDC, earn yield — directly from Farcaster',
    images: [{ url: '/yield-chart.png', width: 1200, height: 630 }],
    type: 'website',
  },
  other: {
    // Farcaster Frame meta tags (v2)
    'fc:frame': 'vNext',
    'fc:frame:image': '/yield-chart.png',
    'fc:frame:button:1': 'View Yield Dashboard',
    'fc:frame:post_url': '/api/frame/action',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
