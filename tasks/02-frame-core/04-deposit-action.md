# Task #4: POST /api/deposit → vault.deposit

**Status:** ⏳ Not Started
**Est:** 1h
**Priority:** P1
**Phase:** Frame Core

## Acceptance Criteria

- [ ] `POST /api/deposit` returns valid `eth_sendTransaction` JSON
- [ ] Transaction targets `vault.deposit(100e6, userAddress)` on Base
- [ ] Coinbase Wallet prompts user when Frame button is clicked
- [ ] Error state returns 400 with clear message
- [ ] Edge runtime compatible (no Node.js-only APIs)

## Implementation

```ts
// app/api/deposit/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const VAULT_ABI = [
  {
    name: 'deposit',
    type: 'function',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
] as const

export async function POST(req: NextRequest) {
  const body = await req.json()
  const userAddress = body.untrustedData?.address

  if (!userAddress) {
    return NextResponse.json({ error: 'No address' }, { status: 400 })
  }

  // Farcaster tx frame response format
  return NextResponse.json({
    chainId: 'eip155:8453', // Base mainnet
    method: 'eth_sendTransaction',
    params: {
      abi: VAULT_ABI,
      to: process.env.NEXT_PUBLIC_VAULT_ADDRESS,
      data: {
        functionName: 'deposit',
        args: [100_000_000n, userAddress], // 100 USDC
      },
    },
  })
}
```

## USDC Approval Flow

Before deposit, check allowance:
```ts
// If allowance < 100e6, send approve tx first
const allowanceTx = {
  chainId: 'eip155:8453',
  method: 'eth_sendTransaction',
  params: {
    abi: ERC20_ABI,
    to: USDC_ADDRESS,
    data: { functionName: 'approve', args: [VAULT_ADDRESS, 100_000_000n] },
  },
}
```

## Test

```bash
curl -X POST http://localhost:3000/api/deposit \
  -H "Content-Type: application/json" \
  -d '{"untrustedData": {"address": "0x1234..."}}'
# Expected: {"chainId": "eip155:8453", "method": "eth_sendTransaction", ...}
```

**Next:** Task #5 — previewRedeem Display + Countdown
