// app/api/telegram-qr/route.ts
// Generates a QR code PNG linking to the Foresight Farcaster Frame.
// Usage: GET /api/telegram-qr?market=usdc-vault
// Returns a 400×400 PNG image ready for embedding in Telegram messages.

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://foresight-apps.vercel.app'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const market = searchParams.get('market') ?? 'usdc-vault'

  // Validate market slug (alphanumeric + hyphens only)
  if (!/^[a-z0-9-]+$/.test(market)) {
    return NextResponse.json({ error: 'Invalid market slug' }, { status: 400 })
  }

  const frameUrl = `${BASE_URL}/frame/${market}`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(frameUrl)}`

  try {
    const qrResponse = await fetch(qrApiUrl, {
      headers: { Accept: 'image/png' },
    })

    if (!qrResponse.ok) {
      return NextResponse.json(
        { error: 'QR service unavailable' },
        { status: 502 }
      )
    }

    const qrBuffer = await qrResponse.arrayBuffer()

    return new NextResponse(qrBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'X-Frame-URL': frameUrl,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
