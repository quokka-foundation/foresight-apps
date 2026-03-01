// app/api/preview/route.ts
// Vercel Edge API: reads vault previewRedeem to show current yield
// Falls back to static demo values ($100 → $112, 12% APY) if RPC unavailable

import { NextRequest, NextResponse } from 'next/server'
import { publicClient } from '@/lib/viem'
import { VAULT_ABI } from '@/lib/abis/vault'
import { ADDRESSES, DEFAULT_DEPOSIT_AMOUNT, DEMO_PROJECTION } from '@/lib/constants'

export const runtime = 'edge'

const DEMO_RESPONSE = {
  deposited: DEMO_PROJECTION.deposited,
  currentValue: DEMO_PROJECTION.after30Days,
  apy: DEMO_PROJECTION.apy,
  daysActive: DEMO_PROJECTION.days,
  projection30Days: DEMO_PROJECTION.after30Days,
  demo: true,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sharesRaw: string | number | undefined = body.untrustedData?.shares

    // If no shares provided or vault not deployed, return demo values
    if (!sharesRaw || ADDRESSES.VAULT === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(DEMO_RESPONSE)
    }

    const userShares = BigInt(sharesRaw)

    if (userShares === 0n) {
      return NextResponse.json(DEMO_RESPONSE)
    }

    // Read current redeemable value from vault
    const assets = await publicClient.readContract({
      address: ADDRESSES.VAULT,
      abi: VAULT_ABI,
      functionName: 'previewRedeem',
      args: [userShares],
    })

    const currentValue = Number(assets) / 1_000_000 // USDC 6 decimals
    const deposited = Number(DEFAULT_DEPOSIT_AMOUNT) / 1_000_000
    const daysActive = 30
    // Annualise: r = (currentValue/deposited)^(365/daysActive) - 1
    const apy = ((currentValue / deposited) ** (365 / daysActive) - 1) * 100

    return NextResponse.json({
      deposited,
      currentValue: Math.round(currentValue * 100) / 100,
      apy: Math.round(apy * 100) / 100,
      daysActive,
      projection30Days: Math.round(deposited * (1 + 0.12 * 30 / 365) * 100) / 100,
      demo: false,
    })
  } catch (err) {
    // RPC error or parse error — return demo values so Frame never breaks
    console.error('Preview error:', err)
    return NextResponse.json(DEMO_RESPONSE)
  }
}
