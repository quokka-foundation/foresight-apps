/**
 * @jest-environment node
 */

export {};

describe("GET /api/signals proxy route", () => {
  let GET: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    jest.resetModules();
    // No API URL → mock data fallback
    delete process.env.NEXT_PUBLIC_API_URL;
    const mod = await import("../../app/api/signals/route");
    GET = mod.GET as unknown as (req: Request) => Promise<Response>;
  });

  it("returns 200 with an array of signals from mock data", async () => {
    const req = new Request("http://localhost/api/signals");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("respects limit param in mock mode", async () => {
    const req = new Request("http://localhost/api/signals?limit=2");
    const res = await GET(req);
    const data = await res.json();
    expect(data.length).toBeLessThanOrEqual(2);
  });

  it("filters by type in mock mode", async () => {
    const req = new Request("http://localhost/api/signals?type=WHALE_ENTRY");
    const res = await GET(req);
    const data = await res.json();
    for (const signal of data) {
      expect(signal.signalType).toBe("WHALE_ENTRY");
    }
  });

  it("filters by minConfidence in mock mode", async () => {
    const req = new Request("http://localhost/api/signals?minConfidence=80");
    const res = await GET(req);
    const data = await res.json();
    for (const signal of data) {
      expect(signal.confidenceScore).toBeGreaterThanOrEqual(80);
    }
  });

  it("returns valid AlphaSignal shape from mock data", async () => {
    const req = new Request("http://localhost/api/signals?limit=1");
    const res = await GET(req);
    const data = await res.json();
    const signal = data[0];
    if (signal) {
      expect(typeof signal.id).toBe("string");
      expect(typeof signal.signalType).toBe("string");
      expect(typeof signal.tokenAddress).toBe("string");
      expect(typeof signal.confidenceScore).toBe("number");
      expect(Array.isArray(signal.walletAddresses)).toBe(true);
    }
  });

  it("proxies to MACHINE_URL when NEXT_PUBLIC_API_URL is set", async () => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_API_URL = "http://machine.test";
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "proxied-1", signalType: "WHALE_ENTRY" }],
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const mod = await import("../../app/api/signals/route");
    const ProxiedGET = mod.GET as unknown as (req: Request) => Promise<Response>;
    const req = new Request("http://localhost/api/signals?limit=5");
    const res = await ProxiedGET(req);
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("http://machine.test/alpha/feed"),
      expect.objectContaining({ headers: expect.objectContaining({ "x-api-key": "" }) }),
    );
    delete process.env.NEXT_PUBLIC_API_URL;
  });
});
