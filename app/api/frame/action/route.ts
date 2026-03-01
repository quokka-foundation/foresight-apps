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

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message, code: status, support: 'https://x.com/foresight' },
    { status }
  )
}

/** Fire-and-forget server-side PostHog event (Edge compatible via fetch). */
async function trackFrameEvent(
  event: string,
  properties: Record<string, unknown>,
  fid?: number
): Promise<void> {
  const key = process.env.POSTHOG_KEY
  if (!key) return

  const distinctId = fid?.toString() ?? 'anonymous'

  // Use PostHog batch ingest endpoint directly (no SDK needed in edge)
  fetch('https://app.posthog.com/batch/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: key,
      batch: [{ type: 'capture', event, distinct_id: distinctId, properties }],
    }),
  }).catch(() => {}) // Fire-and-forget — never block the response
}

export async function POST(req: NextRequest) {
  try {
    const body: FrameActionBody = await req.json()
    const buttonIndex = body.untrustedData?.buttonIndex ?? 1
    const fid = body.untrustedData?.fid

    // Extract market from the frame URL if present
    const frameUrl = body.untrustedData?.url ?? ''
    const marketMatch = frameUrl.match(/\/frame\/([^/?]+)/)
    const market = marketMatch?.[1] ?? 'unknown'

    // Track frame interaction (non-blocking)
    void trackFrameEvent('frame_button_clicked', {
      button_index: buttonIndex,
      market,
      fid,
    }, fid)

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
        return errorResponse('Unknown button action', 400)
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
    return errorResponse('Invalid frame message', 400)
  }
}
