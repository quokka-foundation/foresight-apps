/**
 * @jest-environment node
 */

jest.mock('../../lib/kv', () => ({
  setUserNotificationDetails: jest.fn(),
  deleteUserNotificationDetails: jest.fn(),
}));

import { NextRequest } from 'next/server';

describe('POST /api/webhook', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import('../../app/api/webhook/route');
    POST = mod.POST;
  });

  it('returns 400 for missing event or fid', async () => {
    const req = new NextRequest('http://localhost/api/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('stores notification token on frame_added', async () => {
    const { setUserNotificationDetails } = require('../../lib/kv');

    const req = new NextRequest('http://localhost/api/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'frame_added',
        fid: 12345,
        notificationDetails: {
          token: 'test-token',
          url: 'https://api.farcaster.xyz/v1/send-notification',
        },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(setUserNotificationDetails).toHaveBeenCalledWith(12345, {
      token: 'test-token',
      url: 'https://api.farcaster.xyz/v1/send-notification',
    });
  });

  it('stores token on notifications_enabled', async () => {
    const { setUserNotificationDetails } = require('../../lib/kv');

    const req = new NextRequest('http://localhost/api/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'notifications_enabled',
        fid: 999,
        notificationDetails: { token: 'tok', url: 'https://example.com' },
      }),
    });
    await POST(req);
    expect(setUserNotificationDetails).toHaveBeenCalledWith(999, {
      token: 'tok',
      url: 'https://example.com',
    });
  });

  it('deletes token on frame_removed', async () => {
    const { deleteUserNotificationDetails } = require('../../lib/kv');

    const req = new NextRequest('http://localhost/api/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'frame_removed',
        fid: 12345,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(deleteUserNotificationDetails).toHaveBeenCalledWith(12345);
  });

  it('deletes token on notifications_disabled', async () => {
    const { deleteUserNotificationDetails } = require('../../lib/kv');

    const req = new NextRequest('http://localhost/api/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'notifications_disabled',
        fid: 42,
      }),
    });
    await POST(req);
    expect(deleteUserNotificationDetails).toHaveBeenCalledWith(42);
  });

  it('handles unknown events gracefully', async () => {
    const req = new NextRequest('http://localhost/api/webhook', {
      method: 'POST',
      body: JSON.stringify({
        event: 'unknown_event',
        fid: 1,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
