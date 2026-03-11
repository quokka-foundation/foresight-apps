/**
 * @jest-environment node
 */

import type { WalletTradeRecord } from "@/lib/wallet-scorer";
import {
  calculateAvgPnl,
  calculateSmartScore,
  calculateTimingScore,
  calculateWinRate,
  classifyWallet,
} from "@/lib/wallet-scorer";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTrade(
  type: "buy" | "sell",
  tokenAddress: string,
  priceAtTrade: number,
  amountUSD = 1000,
  offsetMs = 0,
  peakPriceAfter?: number,
): WalletTradeRecord {
  return {
    tokenAddress,
    type,
    amountUSD,
    timestamp: new Date(Date.now() + offsetMs).toISOString(),
    priceAtTrade,
    peakPriceAfter,
  };
}

// ── calculateWinRate ─────────────────────────────────────────────────────────

describe("calculateWinRate", () => {
  it("returns 50 for empty trades", () => {
    expect(calculateWinRate([])).toBe(50);
  });

  it("returns 100 for all winning round trips", () => {
    const trades = [
      makeTrade("buy", "0xtok", 1.0, 1000, 0),
      makeTrade("sell", "0xtok", 2.0, 2000, 1000), // profitable
    ];
    expect(calculateWinRate(trades)).toBe(100);
  });

  it("returns 0 for all losing round trips", () => {
    const trades = [
      makeTrade("buy", "0xtok", 2.0, 1000, 0),
      makeTrade("sell", "0xtok", 1.0, 500, 1000), // loss
    ];
    expect(calculateWinRate(trades)).toBe(0);
  });

  it("calculates 50% for mixed results", () => {
    const trades = [
      makeTrade("buy", "0xtok1", 1.0, 1000, 0),
      makeTrade("sell", "0xtok1", 2.0, 2000, 1000), // win
      makeTrade("buy", "0xtok2", 2.0, 1000, 2000),
      makeTrade("sell", "0xtok2", 1.0, 500, 3000), // loss
    ];
    expect(calculateWinRate(trades)).toBe(50);
  });

  it("ignores open positions (buy without matching sell)", () => {
    const trades = [
      makeTrade("buy", "0xtok", 1.0, 1000, 0),
      // no sell
    ];
    expect(calculateWinRate(trades)).toBe(50); // default neutral
  });
});

// ── calculateAvgPnl ──────────────────────────────────────────────────────────

describe("calculateAvgPnl", () => {
  it("returns 0 for empty trades", () => {
    expect(calculateAvgPnl([])).toBe(0);
  });

  it("returns 0 for all buys (no sells)", () => {
    const trades = [makeTrade("buy", "0xtok", 1.0, 1000, 0)];
    expect(calculateAvgPnl(trades)).toBe(0);
  });

  it("calculates correct positive P&L", () => {
    const trades = [
      makeTrade("buy", "0xtok", 1.0, 1000, 0),
      makeTrade("sell", "0xtok", 3.0, 3000, 1000), // +200%
    ];
    expect(calculateAvgPnl(trades)).toBe(200);
  });

  it("calculates correct negative P&L", () => {
    const trades = [
      makeTrade("buy", "0xtok", 4.0, 4000, 0),
      makeTrade("sell", "0xtok", 2.0, 2000, 1000), // -50%
    ];
    expect(calculateAvgPnl(trades)).toBe(-50);
  });
});

// ── calculateTimingScore ─────────────────────────────────────────────────────

describe("calculateTimingScore", () => {
  it("returns 50 for no buys with peak price data", () => {
    expect(calculateTimingScore([])).toBe(50);
  });

  it("returns 50 for buys without peakPriceAfter", () => {
    const trades = [makeTrade("buy", "0xtok", 1.0, 1000, 0)];
    expect(calculateTimingScore(trades)).toBe(50);
  });

  it("returns high score when bought near bottom", () => {
    // Bought at 1, peak was 10 → 90% upside captured
    const trades = [makeTrade("buy", "0xtok", 1.0, 1000, 0, 10.0)];
    const score = calculateTimingScore(trades);
    expect(score).toBeGreaterThan(80);
  });

  it("returns low score when bought near peak", () => {
    // Bought at 9.5, peak was 10 → only 5% upside
    const trades = [makeTrade("buy", "0xtok", 9.5, 1000, 0, 10.0)];
    const score = calculateTimingScore(trades);
    expect(score).toBeLessThan(10);
  });
});

// ── calculateSmartScore ──────────────────────────────────────────────────────

describe("calculateSmartScore", () => {
  it("returns zero breakdown for empty trades", () => {
    const result = calculateSmartScore([]);
    expect(result.smartScore).toBe(0);
    expect(result.winRate).toBe(0);
  });

  it("produces score between 0 and 100", () => {
    const trades = [
      makeTrade("buy", "0xtok", 1.0, 1000, 0, 5.0),
      makeTrade("sell", "0xtok", 4.0, 4000, 1000),
    ];
    const result = calculateSmartScore(trades);
    expect(result.smartScore).toBeGreaterThanOrEqual(0);
    expect(result.smartScore).toBeLessThanOrEqual(100);
  });

  it("networkScore is always 50 (placeholder)", () => {
    const trades = [makeTrade("buy", "0xtok", 1.0, 1000, 0)];
    expect(calculateSmartScore(trades).networkScore).toBe(50);
  });
});

// ── classifyWallet ────────────────────────────────────────────────────────────

describe("classifyWallet", () => {
  it("returns unknown for empty trades", () => {
    expect(classifyWallet([])).toBe("unknown");
  });

  it("classifies high-frequency low-value as bot (>50 trades/day proxy)", () => {
    // 30-day window assumed; >50/day = >1500 trades
    const trades = Array.from({ length: 1600 }, () => makeTrade("buy", "0xtok", 1.0, 1000));
    expect(classifyWallet(trades)).toBe("bot");
  });

  it("classifies large avg trade size as whale (>$500k)", () => {
    const trades = [makeTrade("buy", "0xtok", 1.0, 600_000)];
    expect(classifyWallet(trades)).toBe("whale");
  });

  it("classifies mid-range as fund ($50k-$500k avg)", () => {
    const trades = [makeTrade("buy", "0xtok", 1.0, 100_000)];
    expect(classifyWallet(trades)).toBe("fund");
  });

  it("returns unknown for small casual trades", () => {
    const trades = [makeTrade("buy", "0xtok", 1.0, 1000), makeTrade("buy", "0xtok2", 1.0, 500)];
    expect(classifyWallet(trades)).toBe("unknown");
  });
});
