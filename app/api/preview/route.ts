// app/api/preview/route.ts
// Vercel Edge API: reads vault previewRedeem to show current yield
// Returns Frame image URL with yield data embedded

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // TODO: Call publicClient.readContract({ address: VAULT, abi, functionName: 'previewRedeem' })
    // For now, return static preview frame
    const mockYield = { deposited: 100, current: 112, apy: 12, days: 30 }

    return NextResponse.json({
      type: 'frame',
      frameUrl: `/api/preview/image?deposited=${mockYield.deposited}&current=${mockYield.current}&apy=${mockYield.apy}`,
    })
  } catch (err) {
    console.error('Preview error:', err)
    return NextResponse.json({ error: 'Preview failed' }, { status: 500 })
  }
}
