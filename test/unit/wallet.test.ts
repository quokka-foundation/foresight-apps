/**
 * @jest-environment node
 */
// test/unit/wallet.test.ts
// Unit tests for lib/wallet.ts — Coinbase Smart Wallet helpers

// Mock viem before any imports
jest.mock('viem', () => ({
  createWalletClient: jest.fn(() => ({
    writeContract: jest.fn().mockResolvedValue('0xhash'),
  })),
  custom: jest.fn((provider) => provider),
}))

jest.mock('viem/chains', () => ({
  base: { id: 8453, name: 'Base' },
}))

jest.mock('@/lib/constants', () => ({
  ADDRESSES: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    VAULT: '0xVaultAddress0000000000000000000000000000',
  },
  DEFAULT_DEPOSIT_AMOUNT: 100_000_000n,
  CHAIN_ID: 8453,
}))

jest.mock('@/lib/abis/vault', () => ({
  VAULT_ABI: [
    {
      name: 'deposit',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'assets', type: 'uint256' },
        { name: 'receiver', type: 'address' },
      ],
      outputs: [{ name: 'shares', type: 'uint256' }],
    },
  ],
}))

describe('wallet helpers', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe('connectWallet', () => {
    it('throws when window.ethereum is not available', async () => {
      // Simulate server environment — no window
      const originalWindow = global.window
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).window
      const { connectWallet } = await import('../../lib/wallet')
      await expect(connectWallet()).rejects.toThrow(/No wallet found/)
      global.window = originalWindow
    })

    it('throws when window.ethereum is missing', async () => {
      // Simulate browser without wallet extension
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })
      const { connectWallet } = await import('../../lib/wallet')
      await expect(connectWallet()).rejects.toThrow(/No wallet found/)
    })

    it('returns walletClient and address on success', async () => {
      const mockAddress = '0xUserAddress000000000000000000000000001'
      Object.defineProperty(global, 'window', {
        value: {
          ethereum: {
            request: jest.fn().mockResolvedValue([mockAddress]),
          },
        },
        writable: true,
      })

      const { connectWallet } = await import('../../lib/wallet')
      const result = await connectWallet()

      expect(result.address).toBe(mockAddress)
      expect(result.walletClient).toBeDefined()
    })

    it('throws when no accounts are returned', async () => {
      Object.defineProperty(global, 'window', {
        value: {
          ethereum: {
            request: jest.fn().mockResolvedValue([]),
          },
        },
        writable: true,
      })

      const { connectWallet } = await import('../../lib/wallet')
      await expect(connectWallet()).rejects.toThrow(/No accounts/)
    })
  })

  describe('depositToVault', () => {
    it('calls writeContract with correct args', async () => {
      const { createWalletClient } = await import('viem')
      const mockWriteContract = jest.fn().mockResolvedValue('0xtxhash')
      const mockClient = { writeContract: mockWriteContract }
      ;(createWalletClient as jest.Mock).mockReturnValueOnce(mockClient)

      const { depositToVault } = await import('../../lib/wallet')
      const hash = await depositToVault(
        mockClient as unknown as ReturnType<typeof createWalletClient>,
        '0xUserAddress000000000000000000000000001'
      )

      expect(hash).toBe('0xtxhash')
      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'deposit',
          args: [100_000_000n, '0xUserAddress000000000000000000000000001'],
        })
      )
    })

    it('uses custom amount when provided', async () => {
      const { createWalletClient } = await import('viem')
      const mockWriteContract = jest.fn().mockResolvedValue('0xtxhash2')
      const mockClient = { writeContract: mockWriteContract }
      ;(createWalletClient as jest.Mock).mockReturnValueOnce(mockClient)

      const { depositToVault } = await import('../../lib/wallet')
      await depositToVault(
        mockClient as unknown as ReturnType<typeof createWalletClient>,
        '0xUserAddress000000000000000000000000001',
        50_000_000n // 50 USDC
      )

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [50_000_000n, '0xUserAddress000000000000000000000000001'],
        })
      )
    })
  })

  describe('getChainId', () => {
    it('returns numeric chain id from hex', async () => {
      Object.defineProperty(global, 'window', {
        value: {
          ethereum: {
            request: jest.fn().mockResolvedValue('0x2105'), // 8453 in hex
          },
        },
        writable: true,
      })

      const { getChainId } = await import('../../lib/wallet')
      const chainId = await getChainId()
      expect(chainId).toBe(8453)
    })

    it('throws when no ethereum available', async () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      const { getChainId } = await import('../../lib/wallet')
      await expect(getChainId()).rejects.toThrow(/No wallet available/)
    })
  })

  describe('switchToBase', () => {
    it('calls wallet_switchEthereumChain with 0x2105', async () => {
      const mockRequest = jest.fn().mockResolvedValue(null)
      Object.defineProperty(global, 'window', {
        value: {
          ethereum: { request: mockRequest },
        },
        writable: true,
      })

      const { switchToBase } = await import('../../lib/wallet')
      await switchToBase()

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }],
      })
    })

    it('throws when no ethereum available', async () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      const { switchToBase } = await import('../../lib/wallet')
      await expect(switchToBase()).rejects.toThrow(/No wallet available/)
    })
  })
})
