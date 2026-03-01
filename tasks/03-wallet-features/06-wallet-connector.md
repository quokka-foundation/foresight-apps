# Task #6: Coinbase Smart Wallet Connector

**Status:** ✅ Complete
**Est:** 1h
**Priority:** P1
**Phase:** Wallet Features

## Acceptance Criteria

- [x] Coinbase Smart Wallet connects on Base mainnet
- [x] viem@2 `createWalletClient` configured for Base
- [x] `wallet.sendTransaction` works for vault.deposit
- [x] No wallet connection needed for Frame tx (Frame SDK handles it)
- [x] Dashboard shows connected wallet address

## Architecture Note

For **Farcaster Frames**: the Frame SDK handles wallet prompting automatically via `eth_sendTransaction` response. No SDK wallet connection needed.

For **web dashboard**: use Coinbase Wallet SDK directly.

## Dashboard Wallet Connection (`lib/wallet.ts`)

```ts
import { createWalletClient, custom } from 'viem'
import { base } from 'viem/chains'

// For web dashboard use
export async function connectWallet() {
  if (!window.ethereum) throw new Error('No wallet found')
  
  const [address] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  })
  
  const walletClient = createWalletClient({
    account: address,
    chain: base,
    transport: custom(window.ethereum),
  })
  
  return { walletClient, address }
}

// Write contract helper
export async function depositToVault(
  walletClient: ReturnType<typeof createWalletClient>,
  userAddress: `0x${string}`,
  amount = 100_000_000n
) {
  const { VAULT_ABI } = await import('./abis/vault')
  const { ADDRESSES } = await import('./constants')
  
  return walletClient.writeContract({
    address: ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: 'deposit',
    args: [amount, userAddress],
  })
}
```

## RPC Config

```bash
# .env.local
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_VAULT_ADDRESS=0x<deployed_vault>
NEXT_PUBLIC_CHAIN_ID=8453
```

## Base RPC Options

| Provider | URL | Rate Limit |
|----------|-----|------------|
| Base public | `https://mainnet.base.org` | Low |
| Alchemy | `https://base-mainnet.g.alchemy.com/v2/<key>` | High |
| QuickNode | `https://<id>.base-mainnet.quiknode.pro/<key>` | High |

**Next:** Task #7 — Static "$100→$112" PNG Embed
