/**
 * @jest-environment node
 */

export {};

describe("GET /api/signals", () => {
  let GET: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    jest.resetModules();
    // Unset Supabase so the route falls back to mock data
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const mod = await import("../../app/api/signals/route");
    GET = mod.GET as unknown as (req: Request) => Promise<Response>;
  });

  it("returns 200 with an array of signals", async () => {
    const req = new Request("http://localhost/api/signals");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("respects limit param", async () => {
    const req = new Request("http://localhost/api/signals?limit=2");
    const res = await GET(req);
    const data = await res.json();
    expect(data.length).toBeLessThanOrEqual(2);
  });

  it("filters by type", async () => {
    const req = new Request("http://localhost/api/signals?type=WHALE_ENTRY");
    const res = await GET(req);
    const data = await res.json();
    for (const signal of data) {
      expect(signal.signalType).toBe("WHALE_ENTRY");
    }
  });

  it("filters by minConfidence", async () => {
    const req = new Request("http://localhost/api/signals?minConfidence=80");
    const res = await GET(req);
    const data = await res.json();
    for (const signal of data) {
      expect(signal.confidenceScore).toBeGreaterThanOrEqual(80);
    }
  });

  it("returns valid AlphaSignal shape", async () => {
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
      expect(typeof signal.detectedAt).toBe("string");
    }
  });
});
