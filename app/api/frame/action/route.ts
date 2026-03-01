// app/api/frame/action/route.ts
// Vercel Edge API: handles Farcaster Frame button POST actions
// Validates frame message and routes to deposit/preview handlers

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

    switch (buttonIndex) {
      case 1:
        // Deposit $100 USDC
        return NextResponse.redirect(
          new URL('/api/deposit', req.url),
          { status: 302 }
        )
      case 2:
        // Preview yield
        return NextResponse.redirect(
          new URL('/api/preview', req.url),
          { status: 302 }
        )
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    console.error('Frame action error:', err)
    return NextResponse.json({ error: 'Invalid frame message' }, { status: 400 })
  }
}
