// test/unit/api-telegram-webhook.test.ts
// Unit tests for POST /api/telegram-webhook
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

const mockFetch = jest.fn()
global.fetch = mockFetch

const makePostReq = (body: unknown) =>
  ({ json: async () => body } as unknown as import('next/server').NextRequest)

describe('POST /api/telegram-webhook', () => {
  beforeEach(() => {
    jest.resetModules()
    mockFetch.mockReset()
    // TELEGRAM_BOT_TOKEN must be set for fetch to be called
    process.env.TELEGRAM_BOT_TOKEN = 'test-token-123'
  })

  afterEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN
  })

  it('returns ok:true for non-message updates', async () => {
    const { POST } = await import('../../app/api/telegram-webhook/route')
    const res = await POST(makePostReq({ update_id: 123 }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
  })

  it('returns 400 for invalid JSON body', async () => {
    const { POST } = await import('../../app/api/telegram-webhook/route')
    const badReq = { json: async () => { throw new Error('bad json') } } as unknown as import('next/server').NextRequest
    const res = await POST(badReq)
    expect(res.status).toBe(400)
  })

  it('ignores messages with no text', async () => {
    const { POST } = await import('../../app/api/telegram-webhook/route')
    const res = await POST(makePostReq({ message: { chat: { id: 42 } } }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('handles /qr command and calls sendPhoto', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })

    const { POST } = await import('../../app/api/telegram-webhook/route')
    const res = await POST(
      makePostReq({
        message: { chat: { id: 100 }, text: '/qr usdc-vault' },
      })
    )
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sendPhoto'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('handles /qr with default market when no arg given', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })

    const { POST } = await import('../../app/api/telegram-webhook/route')
    await POST(makePostReq({ message: { chat: { id: 100 }, text: '/qr' } }))
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sendPhoto'),
      expect.any(Object)
    )
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(callBody.photo).toContain('usdc-vault')
  })

  it('rejects invalid market slug in /qr command', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })

    const { POST } = await import('../../app/api/telegram-webhook/route')
    await POST(
      makePostReq({ message: { chat: { id: 100 }, text: '/qr ../evil' } })
    )
    // Should send error text message instead of photo
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sendMessage'),
      expect.any(Object)
    )
  })

  it('handles /start command', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })

    const { POST } = await import('../../app/api/telegram-webhook/route')
    await POST(
      makePostReq({ message: { chat: { id: 99 }, text: '/start' } })
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/sendMessage'),
      expect.any(Object)
    )
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(callBody.text).toContain('Welcome')
  })

  it('does not call fetch when TELEGRAM_BOT_TOKEN is empty', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN

    const { POST } = await import('../../app/api/telegram-webhook/route')
    const res = await POST(
      makePostReq({ message: { chat: { id: 1 }, text: '/start' } })
    )
    expect(res.status).toBe(200)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
