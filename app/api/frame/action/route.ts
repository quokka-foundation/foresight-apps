// app/api/frame/action/route.ts
// Vercel Edge API: handles Farcaster Frame button POST actions
// Routes buttonIndex 1 → deposit, 2 → preview yield
// Proxies the full request body (Frame clients send POST, not follow redirects)

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface FrameActionBody {
  trustedData?: {
    messageBytes: string
  }
  untrustedData?: {
    fid: number
    url: string
    messageHash: string
    timestamp: number
    network: number
    buttonIndex: number
    address?: string
    shares?: string
    castId: {
      fid: number
      hash: string
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: FrameActionBody = await req.json()
    const buttonIndex = body.untrustedData?.buttonIndex ?? 1

    // Determine target endpoint based on which button was pressed
    const origin = req.nextUrl.origin
    let targetUrl: string

    switch (buttonIndex) {
      case 1:
        targetUrl = `${origin}/api/deposit`
        break
      case 2:
        targetUrl = `${origin}/api/preview`
        break
      default:
        return NextResponse.json({ error: 'Unknown button action' }, { status: 400 })
    }

    // Proxy the full frame body to the target handler
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch (err) {
    console.error('Frame action error:', err)
    return NextResponse.json({ error: 'Invalid frame message' }, { status: 400 })
  }
}
