import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core'
import '@mantine/core/styles.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    brand: [
      '#e8f4fd',
      '#bde0fa',
      '#91ccf7',
      '#65b8f4',
      '#38a4f0',
      '#1DA1F2',
      '#1890da',
      '#147fc2',
      '#106daa',
      '#0c5c92',
    ],
  },
  fontFamily: 'Inter, system-ui, sans-serif',
})

export const metadata: Metadata = {
  title: {
    default: 'Foresight Apps',
    template: '%s | Foresight',
  },
  description: 'Earn 12% APY on USDC via Farcaster Frames on Base. Deposit $100, earn $112 in 30 days.',
  keywords: ['Farcaster', 'DeFi', 'yield', 'USDC', 'Base', 'ERC-4626', 'APY'],
  authors: [{ name: 'Foresight' }],
  openGraph: {
    type: 'website',
    siteName: 'Foresight Apps',
    title: 'Foresight Apps — Earn Yield on Base',
    description: 'Deposit USDC, earn 12% APY — directly from Farcaster Frames.',
    images: [{
      url: 'https://foresight-apps.vercel.app/yield-chart.png',
      width: 1200,
      height: 630,
      alt: '$100 → $112 yield projection at 12% APY',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foresight Apps',
    description: 'Earn 12% APY via Farcaster Frames on Base',
    images: ['https://foresight-apps.vercel.app/yield-chart.png'],
    site: '@foresight',
  },
  other: {
    // Farcaster Frame meta tags (v2)
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://foresight-apps.vercel.app/yield-chart.png',
    'fc:frame:button:1': 'View Yield Dashboard',
    'fc:frame:post_url': 'https://foresight-apps.vercel.app/api/frame/action',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}
