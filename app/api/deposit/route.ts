// app/api/deposit/route.ts
// Vercel Edge API: initiates USDC vault deposit transaction
// Constructs writeContract call for vault.deposit(100e6, user)

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`
const DEFAULT_AMOUNT = 100_000_000n // 100 USDC (6 decimals)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userAddress = body.untrustedData?.address

    if (!userAddress) {
      return NextResponse.json(
        { error: 'No user address provided' },
        { status: 400 }
      )
    }

    // Return Farcaster tx frame response
    // The Frame SDK will prompt the user's wallet to sign
    return NextResponse.json({
      chainId: 'eip155:8453', // Base
      method: 'eth_sendTransaction',
      params: {
        abi: [
          {
            name: 'deposit',
            type: 'function',
            inputs: [
              { name: 'assets', type: 'uint256' },
              { name: 'receiver', type: 'address' },
            ],
            outputs: [{ name: 'shares', type: 'uint256' }],
          },
        ],
        to: VAULT_ADDRESS,
        data: {
          functionName: 'deposit',
          args: [DEFAULT_AMOUNT, userAddress],
        },
      },
    })
  } catch (err) {
    console.error('Deposit error:', err)
    return NextResponse.json({ error: 'Deposit failed' }, { status: 500 })
  }
}
