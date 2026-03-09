/**
 * @jest-environment node
 */
import {
  getSignalById,
  getTokenByAddress,
  getWalletByAddress,
  MOCK_ALERT_HISTORY,
  MOCK_INSIGHTS,
  MOCK_SIGNALS,
  MOCK_TOKENS,
  MOCK_WALLETS,
  SIGNAL_TYPE_CONFIG,
} from "../../lib/mock-data";

describe("mock-data", () => {
  describe("MOCK_SIGNALS", () => {
    it("has at least 5 signals", () => {
      expect(MOCK_SIGNALS.length).toBeGreaterThanOrEqual(5);
    });

    it("all signals have required fields", () => {
      for (const s of MOCK_SIGNALS) {
        expect(s.id).toBeTruthy();
        expect(s.type).toBeTruthy();
        expect(s.tokenAddress).toBeTruthy();
        expect(s.description).toBeTruthy();
        expect(s.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(s.confidenceScore).toBeLessThanOrEqual(100);
        expect(s.chain).toBe("base");
        expect(s.detectedAt).toBeTruthy();
      }
    });

    it("all signal IDs are unique", () => {
      const ids = MOCK_SIGNALS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("getSignalById", () => {
    it("returns signal for valid ID", () => {
      const signal = getSignalById(MOCK_SIGNALS[0].id);
      expect(signal).toBeDefined();
      expect(signal?.id).toBe(MOCK_SIGNALS[0].id);
    });

    it("returns undefined for invalid ID", () => {
      expect(getSignalById("nonexistent")).toBeUndefined();
    });
  });

  describe("MOCK_WALLETS", () => {
    it("has wallets with valid data", () => {
      expect(MOCK_WALLETS.length).toBeGreaterThan(0);
      for (const w of MOCK_WALLETS) {
        expect(w.id).toBeTruthy();
        expect(w.address).toMatch(/^0x/);
        expect(w.smartScore).toBeGreaterThanOrEqual(0);
        expect(w.smartScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("getWalletByAddress", () => {
    it("returns wallet for valid address", () => {
      const wallet = getWalletByAddress(MOCK_WALLETS[0].address);
      expect(wallet).toBeDefined();
      expect(wallet?.address).toBe(MOCK_WALLETS[0].address);
    });

    it("returns undefined for invalid address", () => {
      expect(getWalletByAddress("0xdead")).toBeUndefined();
    });
  });

  describe("MOCK_TOKENS", () => {
    it("has tokens with valid data", () => {
      expect(MOCK_TOKENS.length).toBeGreaterThan(0);
      for (const t of MOCK_TOKENS) {
        expect(t.address).toMatch(/^0x/);
        expect(t.symbol).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.priceUSD).toBeGreaterThan(0);
      }
    });
  });

  describe("getTokenByAddress", () => {
    it("returns token for valid address", () => {
      const token = getTokenByAddress(MOCK_TOKENS[0].address);
      expect(token).toBeDefined();
      expect(token?.address).toBe(MOCK_TOKENS[0].address);
    });

    it("returns undefined for invalid address", () => {
      expect(getTokenByAddress("0xdead")).toBeUndefined();
    });
  });

  describe("MOCK_INSIGHTS", () => {
    it("has insights with valid data", () => {
      expect(MOCK_INSIGHTS.length).toBeGreaterThan(0);
      for (const i of MOCK_INSIGHTS) {
        expect(i.id).toBeTruthy();
        expect(i.summary).toBeTruthy();
      }
    });
  });

  describe("MOCK_ALERT_HISTORY", () => {
    it("has alert history items", () => {
      expect(MOCK_ALERT_HISTORY.length).toBeGreaterThan(0);
      for (const a of MOCK_ALERT_HISTORY) {
        expect(a.id).toBeTruthy();
        expect(a.message).toBeTruthy();
      }
    });
  });

  describe("SIGNAL_TYPE_CONFIG", () => {
    it("has config for all signal types used in mock data", () => {
      const types = new Set(MOCK_SIGNALS.map((s) => s.type));
      for (const t of types) {
        expect(SIGNAL_TYPE_CONFIG[t]).toBeDefined();
        expect(SIGNAL_TYPE_CONFIG[t].label).toBeTruthy();
        expect(SIGNAL_TYPE_CONFIG[t].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });
});
