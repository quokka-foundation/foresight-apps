/**
 * @jest-environment node
 */

jest.mock('../../lib/mock-data', () => ({
  getMarketById: jest.fn(),
}));

import { NextRequest } from 'next/server';

describe('GET /api/og/curve/[id]', () => {
  let GET: (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import('../../app/api/og/curve/[id]/route');
    GET = mod.GET;
  });

  it('returns 404 for unknown market', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue(undefined);

    const req = new NextRequest('http://localhost/api/og/curve/nonexistent');
    const res = await GET(req, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });

  it('returns SVG image for valid market', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue({
      id: 'btc-150k',
      title: 'BTC > $150K by July',
      description: 'Will Bitcoin exceed $150,000 USD before July 1, 2026?',
      probability: 62.1,
      volume24h: 890_000,
      liquidity: 2_800_000,
    });

    const req = new NextRequest('http://localhost/api/og/curve/btc-150k');
    const res = await GET(req, { params: Promise.resolve({ id: 'btc-150k' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml');

    const svg = await res.text();
    expect(svg).toContain('BTC');
    expect(svg).toContain('62');
    expect(svg).toContain('FORESIGHT');
    expect(svg).toContain('LIVE');
  });

  it('sets cache headers', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue({
      id: 'test',
      title: 'Test',
      description: 'Test market',
      probability: 50,
      volume24h: 100_000,
      liquidity: 500_000,
    });

    const req = new NextRequest('http://localhost/api/og/curve/test');
    const res = await GET(req, { params: Promise.resolve({ id: 'test' }) });
    expect(res.headers.get('Cache-Control')).toContain('public');
  });

  it('calculates correct payouts', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue({
      id: 'test',
      title: 'Test',
      description: 'Test market',
      probability: 50,
      volume24h: 100_000,
      liquidity: 500_000,
    });

    const req = new NextRequest('http://localhost/api/og/curve/test');
    const res = await GET(req, { params: Promise.resolve({ id: 'test' }) });
    const svg = await res.text();
    // At 50%, YES payout = $100/0.5 = $200, NO payout = $100/0.5 = $200
    expect(svg).toContain('$200');
  });

  it('escapes XML special characters in market title', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue({
      id: 'test',
      title: 'Will BTC > $150K & ETH > $10K?',
      description: 'Test <script> injection',
      probability: 50,
      volume24h: 100_000,
      liquidity: 500_000,
    });

    const req = new NextRequest('http://localhost/api/og/curve/test');
    const res = await GET(req, { params: Promise.resolve({ id: 'test' }) });
    const svg = await res.text();
    expect(svg).toContain('&amp;');
    expect(svg).toContain('&gt;');
    expect(svg).toContain('&lt;');
    expect(svg).not.toContain('<script>');
  });
});
