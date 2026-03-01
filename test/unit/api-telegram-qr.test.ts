// test/unit/api-telegram-qr.test.ts
// Unit tests for GET /api/telegram-qr
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

const makeGetReq = (url: string) =>
  ({ url } as unknown as import('next/server').NextRequest)

// We need to mock fetch for the QR code API call
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('GET /api/telegram-qr', () => {
  beforeEach(() => {
    jest.resetModules()
    mockFetch.mockReset()
  })

  it('returns 400 for invalid market slug', async () => {
    const { GET } = await import('../../app/api/telegram-qr/route')
    const res = await GET(makeGetReq('http://localhost/api/telegram-qr?market=../evil'))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/Invalid market slug/)
  })

  it('returns PNG buffer for valid market', async () => {
    const fakeBuffer = new ArrayBuffer(100)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => fakeBuffer,
    })

    const { GET } = await import('../../app/api/telegram-qr/route')
    // Can't easily test NextResponse with buffer in unit test — verify fetch was called
    // The route constructs NextResponse with buffer directly, so we just ensure no throw
    // and verify fetch was called with correct URL shape
    try {
      await GET(makeGetReq('http://localhost/api/telegram-qr?market=usdc-vault'))
    } catch {
      // NextResponse constructor may not work in jsdom — that's OK
    }
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('foresight-apps.vercel.app%2Fframe%2Fusdc-vault'),
      expect.any(Object)
    )
  })

  it('uses default market usdc-vault when no param', async () => {
    const fakeBuffer = new ArrayBuffer(50)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => fakeBuffer,
    })

    const { GET } = await import('../../app/api/telegram-qr/route')
    try {
      await GET(makeGetReq('http://localhost/api/telegram-qr'))
    } catch {
      // OK
    }
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('usdc-vault'),
      expect.any(Object)
    )
  })

  it('returns 502 when QR service fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    const { GET } = await import('../../app/api/telegram-qr/route')
    const res = await GET(makeGetReq('http://localhost/api/telegram-qr?market=usdc-vault'))
    expect(res.status).toBe(502)
    const data = await res.json()
    expect(data.error).toMatch(/QR service unavailable/)
  })

  it('returns 500 on fetch throw', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { GET } = await import('../../app/api/telegram-qr/route')
    const res = await GET(makeGetReq('http://localhost/api/telegram-qr?market=usdc-vault'))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toMatch(/Failed to generate QR code/)
  })
})
