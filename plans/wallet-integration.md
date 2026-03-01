# Wallet Integration Plan

## Overview

Users interact with the Foresight vault via Coinbase Smart Wallet on Base, triggered directly from Farcaster Frames using viem@2.

## Wallet Stack

| Layer | Tool |
|-------|------|
| Chain client | viem@2 `createPublicClient` (reads) |
| Wallet client | Coinbase Smart Wallet SDK |
| Chain | Base mainnet (chainId: 8453) |
| Token | USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) |
| Vault | ERC-4626 ForesightVault (deploy address TBD) |

## Deposit Flow

```
Frame POST /api/deposit
  └── Validate frame message
  └── Return eth_sendTransaction response
      └── Frame SDK prompts Coinbase Wallet
          └── User approves: vault.deposit(100e6, userAddress)
              └── Base chain executes: USDC transferred, shares minted
                  └── Success frame: "Earning 12% APY!"
```

## Contract Interaction (viem@2)

```ts
// lib/viem.ts
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
})

// Read: previewRedeem
const assets = await publicClient.readContract({
  address: VAULT_ADDRESS,
  abi: VAULT_ABI,
  functionName: 'previewRedeem',
  args: [userShares],
})
```

## Frame Transaction Response

```json
{
  "chainId": "eip155:8453",
  "method": "eth_sendTransaction",
  "params": {
    "abi": [...],
    "to": "0x<VAULT_ADDRESS>",
    "data": {
      "functionName": "deposit",
      "args": [100000000, "0x<USER_ADDRESS>"]
    }
  }
}
```

## USDC Approval

Before depositing, user must approve USDC spend:
```ts
// Check allowance first
const allowance = await publicClient.readContract({
  address: USDC_ADDRESS,
  abi: ERC20_ABI,
  functionName: 'allowance',
  args: [userAddress, VAULT_ADDRESS],
})
// If insufficient, send approve tx before deposit
```

## Environment Variables

```bash
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_VAULT_ADDRESS=0x<deployed_address>
NEXT_PUBLIC_CHAIN_ID=8453
```

## Coinbase Smart Wallet

- Coinbase Smart Wallet is the primary wallet for Base users
- No special SDK needed for Frame tx — just return `eth_sendTransaction` JSON
- Frame SDK handles wallet UI automatically
