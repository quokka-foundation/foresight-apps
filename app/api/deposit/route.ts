// app/api/deposit/route.ts
// Vercel Edge API: initiates USDC vault deposit transaction
// Returns eth_sendTransaction frame response for vault.deposit(100e6, user)

import { NextRequest, NextResponse } from 'next/server'
import { ADDRESSES, DEFAULT_DEPOSIT_AMOUNT } from '@/lib/constants'
import { VAULT_ABI } from '@/lib/abis/vault'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userAddress: string | undefined = body.untrustedData?.address

    if (!userAddress) {
      return NextResponse.json(
        { error: 'No user address provided' },
        { status: 400 }
      )
    }

    if (!ADDRESSES.VAULT || ADDRESSES.VAULT === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(
        { error: 'Vault address not configured' },
        { status: 503 }
      )
    }

    // Return Farcaster tx frame response.
    // BigInt must be serialized as string for JSON (JSON.stringify can't handle BigInt).
    // The Frame SDK will prompt the user's wallet to sign.
    return NextResponse.json({
      chainId: 'eip155:8453', // Base mainnet
      method: 'eth_sendTransaction',
      params: {
        abi: VAULT_ABI.filter(fn => fn.name === 'deposit'),
        to: ADDRESSES.VAULT,
        data: {
          functionName: 'deposit',
          // Serialize BigInt to string — Frame SDK / viem handles the conversion
          args: [DEFAULT_DEPOSIT_AMOUNT.toString(), userAddress],
        },
      },
    })
  } catch (err) {
    console.error('Deposit error:', err)
    return NextResponse.json({ error: 'Deposit failed' }, { status: 500 })
  }
}
