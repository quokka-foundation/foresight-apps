// test/unit/api-preview.test.ts
// Unit tests for POST /api/preview
export {}

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    })),
  },
}))

jest.mock('@/lib/abis/vault', () => ({
  VAULT_ABI: [],
}))

const makeReq = (body: unknown) =>
  ({ json: async () => body } as unknown as import('next/server').NextRequest)

// ── Demo mode (vault address = zero) ──────────────────────────────────────────
describe('POST /api/preview — demo mode (vault not deployed)', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('@/lib/constants', () => ({
      ADDRESSES: {
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        VAULT: '0x0000000000000000000000000000000000000000',
      },
      DEFAULT_DEPOSIT_AMOUNT: 100_000_000n,
      CHAIN_ID: 8453,
      TARGET_APY: 12,
      DEMO_PROJECTION: { deposited: 100, after30Days: 112, days: 30, apy: 12 },
    }))
    jest.doMock('@/lib/viem', () => ({
      publicClient: { readContract: jest.fn() },
    }))
  })

  it('returns demo values when vault not deployed', async () => {
    const { POST } = await import('../../app/api/preview/route')
    const res = await POST(makeReq({ untrustedData: {} }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deposited).toBe(100)
    expect(data.currentValue).toBe(112)
    expect(data.apy).toBe(12)
    expect(data.demo).toBe(true)
  })

  it('returns demo values when shares = 0', async () => {
    const { POST } = await import('../../app/api/preview/route')
    const res = await POST(makeReq({ untrustedData: { shares: 0 } }))
    const data = await res.json()
    expect(data.demo).toBe(true)
    expect(data.currentValue).toBe(112)
  })

  it('includes projection30Days in response', async () => {
    const { POST } = await import('../../app/api/preview/route')
    const res = await POST(makeReq({ untrustedData: {} }))
    const data = await res.json()
    expect(data.projection30Days).toBeDefined()
    expect(typeof data.projection30Days).toBe('number')
  })
})

// ── Live mode (vault deployed, shares provided) ───────────────────────────────
describe('POST /api/preview — live mode (vault deployed)', () => {
  const mockReadContract = jest.fn()

  beforeEach(() => {
    jest.resetModules()
    mockReadContract.mockReset()
    jest.doMock('@/lib/constants', () => ({
      ADDRESSES: {
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        VAULT: '0xRealVault0000000000000000000000000000001',
      },
      DEFAULT_DEPOSIT_AMOUNT: 100_000_000n,
      CHAIN_ID: 8453,
      TARGET_APY: 12,
      DEMO_PROJECTION: { deposited: 100, after30Days: 112, days: 30, apy: 12 },
    }))
    jest.doMock('@/lib/viem', () => ({
      publicClient: { readContract: mockReadContract },
    }))
  })

  it('calls readContract and returns live values', async () => {
    mockReadContract.mockResolvedValue(112_000_000n) // 112 USDC
    const { POST } = await import('../../app/api/preview/route')
    const res = await POST(makeReq({ untrustedData: { shares: '100000000' } }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.demo).toBe(false)
    expect(data.currentValue).toBeCloseTo(112, 1)
    expect(data.deposited).toBe(100)
    expect(mockReadContract).toHaveBeenCalledTimes(1)
  })

  it('falls back to demo if readContract throws', async () => {
    mockReadContract.mockRejectedValue(new Error('RPC unavailable'))
    const { POST } = await import('../../app/api/preview/route')
    const res = await POST(makeReq({ untrustedData: { shares: '100000000' } }))
    const data = await res.json()
    // Catch block returns demo values
    expect(data.demo).toBe(true)
    expect(data.currentValue).toBe(112)
  })
})
