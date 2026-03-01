// lib/constants.ts
// Chain addresses and protocol constants for Base mainnet

export const ADDRESSES = {
  // Base mainnet — fill in after deployment
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
  VAULT: (process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
}

export const CHAIN_ID = 8453 // Base mainnet

export const DEFAULT_DEPOSIT_AMOUNT = 100_000_000n // 100 USDC (6 decimals)

export const TARGET_APY = 12 // 12% APY for demo

export const DEMO_PROJECTION = {
  deposited: 100,
  after30Days: 112,
  days: 30,
  apy: TARGET_APY,
}
