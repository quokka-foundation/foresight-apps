// test/unit/api-frame-action.test.ts
// Unit tests for POST /api/frame/action
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

// Mock global fetch for the proxy calls
global.fetch = jest.fn()

const makeReq = (body: unknown, origin = 'http://localhost:3000') =>
  ({
    json: async () => body,
    nextUrl: { origin },
  } as unknown as import('next/server').NextRequest)

describe('POST /api/frame/action', () => {
  beforeEach(() => {
    jest.resetModules()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('routes buttonIndex 1 to /api/deposit', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ chainId: 'eip155:8453', method: 'eth_sendTransaction' }),
      status: 200,
    })

    const { POST } = await import('../../app/api/frame/action/route')
    const body = { untrustedData: { buttonIndex: 1, address: '0xUser' } }
    await POST(makeReq(body))

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/deposit',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('routes buttonIndex 2 to /api/preview', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ deposited: 100, currentValue: 112 }),
      status: 200,
    })

    const { POST } = await import('../../app/api/frame/action/route')
    const body = { untrustedData: { buttonIndex: 2 } }
    await POST(makeReq(body))

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/preview',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns 400 for unknown buttonIndex', async () => {
    const { POST } = await import('../../app/api/frame/action/route')
    const res = await POST(makeReq({ untrustedData: { buttonIndex: 99 } }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/unknown/i)
  })

  it('proxies full body to target endpoint', async () => {
    const upstreamResponse = { chainId: 'eip155:8453', method: 'eth_sendTransaction' }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => upstreamResponse,
      status: 200,
    })

    const { POST } = await import('../../app/api/frame/action/route')
    const body = { untrustedData: { buttonIndex: 1, address: '0xUser' }, trustedData: { messageBytes: 'abc' } }
    const res = await POST(makeReq(body))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.chainId).toBe('eip155:8453')
  })
})
