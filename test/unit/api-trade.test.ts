/**
 * @jest-environment node
 */

// Mock the getMarketById and calculatePayout functions
jest.mock('../../lib/mock-data', () => ({
  getMarketById: jest.fn(),
  formatUSD: jest.fn((n: number) => `$${n.toFixed(2)}`),
}));

jest.mock('../../lib/curve-math', () => ({
  calculatePayout: jest.fn(() => 200),
}));

jest.mock('../../lib/constants', () => ({
  IS_DEMO: true,
}));

import { NextRequest } from 'next/server';

describe('POST /api/trade', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import('../../app/api/trade/route');
    POST = mod.POST;
  });

  it('returns 400 for missing required fields', async () => {
    const req = new NextRequest('http://localhost/api/trade', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing required fields');
  });

  it('returns 400 for invalid probability', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue({ id: 'test', status: 'active' });

    const req = new NextRequest('http://localhost/api/trade', {
      method: 'POST',
      body: JSON.stringify({ marketId: 'test', probability: 0, amount: 10 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Probability');
  });

  it('returns 404 for unknown market', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue(undefined);

    const req = new NextRequest('http://localhost/api/trade', {
      method: 'POST',
      body: JSON.stringify({ marketId: 'unknown', probability: 50, amount: 10 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('returns demo trade result for valid request', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue({ id: 'btc-150k', status: 'active' });

    const req = new NextRequest('http://localhost/api/trade', {
      method: 'POST',
      body: JSON.stringify({
        marketId: 'btc-150k',
        probability: 62,
        amount: 10,
        leverage: 3,
        direction: 'yes',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.demo).toBe(true);
    expect(data.trade.marketId).toBe('btc-150k');
    expect(data.trade.direction).toBe('yes');
    expect(data.trade.leverage).toBe(3);
    expect(data.trade.hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('returns 400 for inactive market', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue({ id: 'resolved', status: 'resolved' });

    const req = new NextRequest('http://localhost/api/trade', {
      method: 'POST',
      body: JSON.stringify({ marketId: 'resolved', probability: 50, amount: 10 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('not active');
  });

  it('returns 400 for amount exceeding max', async () => {
    const { getMarketById } = require('../../lib/mock-data');
    getMarketById.mockReturnValue({ id: 'test', status: 'active' });

    const req = new NextRequest('http://localhost/api/trade', {
      method: 'POST',
      body: JSON.stringify({ marketId: 'test', probability: 50, amount: 99999 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
