# Task #5: previewRedeem Display + Countdown

**Status:** ⏳ Not Started
**Est:** 0.5h
**Priority:** P1
**Phase:** Frame Core

## Acceptance Criteria

- [ ] `POST /api/preview` returns yield data from `previewRedeem`
- [ ] Shows "$100 → $112.00" after 30 days at 12% APY
- [ ] Countdown timer shows days until next yield cycle
- [ ] Falls back to static demo values if RPC unavailable

## Implementation

```ts
// app/api/preview/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { publicClient } from '@/lib/viem'
import { VAULT_ABI } from '@/lib/abis/vault'
import { ADDRESSES } from '@/lib/constants'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userShares = BigInt(body.untrustedData?.shares ?? 0)

    let currentValue = 112.00 // fallback demo
    
    if (userShares > 0n) {
      const assets = await publicClient.readContract({
        address: ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'previewRedeem',
        args: [userShares],
      })
      currentValue = Number(assets) / 1_000_000 // USDC 6 decimals
    }

    const daysActive = 30
    const apy = ((currentValue / 100) ** (365 / daysActive) - 1) * 100

    return NextResponse.json({
      deposited: 100,
      currentValue,
      apy: Math.round(apy * 100) / 100,
      daysActive,
      projection30Days: 100 * (1 + 0.12 * 30 / 365),
    })
  } catch (err) {
    // Fallback to demo values
    return NextResponse.json({
      deposited: 100,
      currentValue: 112,
      apy: 12,
      daysActive: 30,
      projection30Days: 112,
      demo: true,
    })
  }
}
```

## Countdown Component

```tsx
// components/YieldCountdown.tsx
'use client'
import { useState, useEffect } from 'react'

export function YieldCountdown({ targetDays = 30 }) {
  const [daysLeft, setDaysLeft] = useState(targetDays)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDaysLeft(d => Math.max(0, d - 1))
    }, 86_400_000) // 1 day
    return () => clearInterval(timer)
  }, [])
  
  return <span>{daysLeft} days until full yield</span>
}
```

**Next:** Task #6 — Coinbase Smart Wallet Connector
