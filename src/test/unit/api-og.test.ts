/**
 * @jest-environment node
 */

jest.mock("../../lib/mock-data", () => ({
  getSignalById: jest.fn(),
}));

import { NextRequest } from "next/server";

describe("GET /api/og/signal/[id]", () => {
  let GET: (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import("../../app/api/og/signal/[id]/route");
    GET = mod.GET;
  });

  it("returns 404 for unknown signal", async () => {
    const { getSignalById } = require("../../lib/mock-data");
    getSignalById.mockReturnValue(undefined);

    const req = new NextRequest("http://localhost/api/og/signal/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(res.status).toBe(404);
  });

  it("returns SVG image for valid signal", async () => {
    const { getSignalById } = require("../../lib/mock-data");
    getSignalById.mockReturnValue({
      id: "sig-001",
      signalType: "WHALE_ENTRY",
      tokenAddress: "0x1234",
      tokenSymbol: "USDC",
      description: "Large USDC transfer detected",
      confidenceScore: 85,
      valueUSD: 500000,
      walletAddresses: ["0xabc"],
      blockNumber: 12345678,
      metadata: {},
      detectedAt: "2026-03-01T12:00:00Z",
    });

    const req = new NextRequest("http://localhost/api/og/signal/sig-001");
    const res = await GET(req, { params: Promise.resolve({ id: "sig-001" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");

    const svg = await res.text();
    expect(svg).toContain("FORESIGHT ALPHA");
    expect(svg).toContain("85");
    expect(svg).toContain("USDC");
  });

  it("sets cache headers", async () => {
    const { getSignalById } = require("../../lib/mock-data");
    getSignalById.mockReturnValue({
      id: "sig-001",
      signalType: "SMART_MONEY_ENTRY",
      tokenAddress: "0x1234",
      description: "Test signal",
      confidenceScore: 50,
      walletAddresses: [],
      blockNumber: 12345678,
      metadata: {},
      detectedAt: "2026-03-01T12:00:00Z",
    });

    const req = new NextRequest("http://localhost/api/og/signal/sig-001");
    const res = await GET(req, { params: Promise.resolve({ id: "sig-001" }) });
    expect(res.headers.get("Cache-Control")).toContain("public");
  });

  it("escapes XML special characters in description", async () => {
    const { getSignalById } = require("../../lib/mock-data");
    getSignalById.mockReturnValue({
      id: "sig-001",
      signalType: "EARLY_MOMENTUM",
      tokenAddress: "0x1234",
      description: "Transfer > $1M & <script>",
      confidenceScore: 50,
      walletAddresses: [],
      blockNumber: 12345678,
      metadata: {},
      detectedAt: "2026-03-01T12:00:00Z",
    });

    const req = new NextRequest("http://localhost/api/og/signal/sig-001");
    const res = await GET(req, { params: Promise.resolve({ id: "sig-001" }) });
    const svg = await res.text();
    expect(svg).toContain("&amp;");
    expect(svg).toContain("&gt;");
    expect(svg).toContain("&lt;");
    expect(svg).not.toContain("<script>");
  });
});
