/**
 * @jest-environment node
 */

jest.mock("../../lib/notifs", () => ({
  sendFrameNotification: jest.fn(),
}));

import { NextRequest } from "next/server";

describe("POST /api/notify", () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import("../../app/api/notify/route");
    POST = mod.POST;
  });

  it("returns 400 for missing required fields", async () => {
    const req = new NextRequest("http://localhost/api/notify", {
      method: "POST",
      body: JSON.stringify({ fid: "123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing required fields");
  });

  it("sends notification successfully", async () => {
    const { sendFrameNotification } = require("../../lib/notifs");
    sendFrameNotification.mockResolvedValue({ state: "success" });

    const req = new NextRequest("http://localhost/api/notify", {
      method: "POST",
      body: JSON.stringify({
        fid: "12345",
        title: "Signal Alert",
        body: "Whale movement detected: $2.1M USDC deposited",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(sendFrameNotification).toHaveBeenCalledWith({
      fid: 12345,
      title: "Signal Alert",
      body: "Whale movement detected: $2.1M USDC deposited",
    });
  });

  it("returns 404 when user has no token", async () => {
    const { sendFrameNotification } = require("../../lib/notifs");
    sendFrameNotification.mockResolvedValue({ state: "no_token" });

    const req = new NextRequest("http://localhost/api/notify", {
      method: "POST",
      body: JSON.stringify({
        fid: "999",
        title: "Test",
        body: "Test notification",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not enabled");
  });

  it("returns 500 for notification errors", async () => {
    const { sendFrameNotification } = require("../../lib/notifs");
    sendFrameNotification.mockResolvedValue({ state: "error", error: "Network error" });

    const req = new NextRequest("http://localhost/api/notify", {
      method: "POST",
      body: JSON.stringify({
        fid: "123",
        title: "Test",
        body: "Test",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
