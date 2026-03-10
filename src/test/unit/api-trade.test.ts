/**
 * @jest-environment node
 */

export {};

describe("POST /api/trade", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import("../../app/api/trade/route");
    POST = mod.POST as unknown as (req: Request) => Promise<Response>;
  });

  it("returns 400 for missing required fields", async () => {
    const req = new Request("http://localhost/api/trade", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing required fields");
  });

  it("returns 400 for invalid amount", async () => {
    const req = new Request("http://localhost/api/trade", {
      method: "POST",
      body: JSON.stringify({ signalId: "test", action: "buy", amount: -1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Amount");
  });

  it("returns 400 for amount exceeding max", async () => {
    const req = new Request("http://localhost/api/trade", {
      method: "POST",
      body: JSON.stringify({ signalId: "test", action: "buy", amount: 99999 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns demo trade result for valid request", async () => {
    const req = new Request("http://localhost/api/trade", {
      method: "POST",
      body: JSON.stringify({
        signalId: "sig-001",
        action: "buy",
        amount: 100,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.demo).toBe(true);
    expect(data.trade.signalId).toBe("sig-001");
    expect(data.trade.action).toBe("buy");
    expect(data.trade.hash).toMatch(/^0x[0-9a-f]{64}$/);
  });
});
