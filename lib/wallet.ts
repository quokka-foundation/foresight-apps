// lib/wallet.ts
// Coinbase Smart Wallet connector for web dashboard (non-Frame) interactions.
// For Farcaster Frames, wallet is handled automatically by the Frame SDK via
// eth_sendTransaction — no explicit connection needed in that flow.

import { createWalletClient, custom } from 'viem'
import { base } from 'viem/chains'
import { ADDRESSES } from './constants'
import { VAULT_ABI } from './abis/vault'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      isConnected?: () => boolean
    }
  }
}

export interface WalletConnection {
  walletClient: ReturnType<typeof createWalletClient>
  address: `0x${string}`
}

/**
 * Connect to Coinbase Smart Wallet (or any window.ethereum provider) for
 * web dashboard use. Not required for Farcaster Frame transactions.
 */
export async function connectWallet(): Promise<WalletConnection> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet found. Install Coinbase Wallet or MetaMask.')
  }

  const accounts = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[]

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned from wallet.')
  }

  const address = accounts[0] as `0x${string}`

  const walletClient = createWalletClient({
    account: address,
    chain: base,
    transport: custom(window.ethereum),
  })

  return { walletClient, address }
}

/**
 * Deposit USDC into the Foresight vault from the web dashboard.
 * Requires wallet to be connected first via connectWallet().
 */
export async function depositToVault(
  walletClient: ReturnType<typeof createWalletClient>,
  userAddress: `0x${string}`,
  amount = 100_000_000n // 100 USDC (6 decimals)
): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    address: ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: 'deposit',
    args: [amount, userAddress],
    account: userAddress,
    chain: base,
  })
  return hash
}

/**
 * Check connected wallet's current chain ID.
 * Used to warn if user is not on Base (chainId 8453).
 */
export async function getChainId(): Promise<number> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet available')
  }
  const chainIdHex = (await window.ethereum.request({
    method: 'eth_chainId',
  })) as string
  return parseInt(chainIdHex, 16)
}

/**
 * Request wallet switch to Base mainnet (chainId 8453).
 */
export async function switchToBase(): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet available')
  }
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x2105' }], // 8453 in hex
  })
}
