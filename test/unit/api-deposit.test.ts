// test/unit/api-deposit.test.ts
// Unit tests for POST /api/deposit
export {}

// Mock NextRequest/NextResponse for Edge runtime compatibility in Jest
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    })),
  },
}))

// Mock constants to control vault address
jest.mock('@/lib/constants', () => ({
  ADDRESSES: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    VAULT: '0xVaultAddress0000000000000000000000000000',
  },
  DEFAULT_DEPOSIT_AMOUNT: 100_000_000n,
  CHAIN_ID: 8453,
  TARGET_APY: 12,
  DEMO_PROJECTION: { deposited: 100, after30Days: 112, days: 30, apy: 12 },
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

const makeReq = (body: unknown) =>
  ({ json: async () => body } as unknown as import('next/server').NextRequest)

describe('POST /api/deposit', () => {
  beforeEach(() => jest.resetModules())

  it('returns 400 when no user address provided', async () => {
    const { POST } = await import('../../app/api/deposit/route')
    const res = await POST(makeReq({ untrustedData: {} }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/address/i)
  })

  it('returns eth_sendTransaction for valid address', async () => {
    const { POST } = await import('../../app/api/deposit/route')
    const res = await POST(
      makeReq({ untrustedData: { address: '0xUserAddress000000000000000000000000001' } })
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.chainId).toBe('eip155:8453')
    expect(data.method).toBe('eth_sendTransaction')
    expect(data.params.data.functionName).toBe('deposit')
  })

  it('serializes deposit amount as string (not BigInt)', async () => {
    const { POST } = await import('../../app/api/deposit/route')
    const res = await POST(
      makeReq({ untrustedData: { address: '0xUserAddress000000000000000000000000001' } })
    )
    const data = await res.json()
    // args[0] must be a string, not a BigInt (JSON can't serialize BigInt)
    expect(typeof data.params.data.args[0]).toBe('string')
    expect(data.params.data.args[0]).toBe('100000000')
  })

  it('includes vault address as to field', async () => {
    const { POST } = await import('../../app/api/deposit/route')
    const res = await POST(
      makeReq({ untrustedData: { address: '0xUserAddress000000000000000000000000001' } })
    )
    const data = await res.json()
    expect(data.params.to).toBe('0xVaultAddress0000000000000000000000000000')
  })
})
