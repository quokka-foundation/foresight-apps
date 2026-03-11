/**
 * @jest-environment node
 */

import type { BitqueryPoolEvent, BitqueryTrade } from "@/lib/bitquery";
import {
  detectCoordinatedCluster,
  detectEarlyMomentum,
  detectLiquiditySurge,
  detectSmartMoneyEntry,
  detectWhaleEntry,
} from "@/lib/signal-classifier";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeTrade(
  buyer: string,
  tokenAddress: string,
  tokenSymbol: string,
  amountUSD: number,
  blockNumber = 1000,
): BitqueryTrade {
  return {
    Block: { Number: blockNumber, Time: new Date().toISOString() },
    Transaction: { Hash: `0xhash_${buyer}_${tokenAddress}` },
    Trade: {
      Buyer: buyer,
      Seller: "0xselleraddr",
      Amount: amountUSD / 1000,
      AmountInUSD: amountUSD,
      Currency: {
        SmartContract: tokenAddress,
        Symbol: tokenSymbol,
        Name: tokenSymbol,
      },
    },
  };
}

// ── detectSmartMoneyEntry ────────────────────────────────────────────────────

describe("detectSmartMoneyEntry", () => {
  const TOKEN = "0xtoken001";
  const smartWallets = new Map<string, number>([
    ["0xwallet01", 85],
    ["0xwallet02", 90],
    ["0xwallet03", 88],
  ]);

  it("returns empty for no smart wallet trades", () => {
    const trades = [makeTrade("0xdumb", TOKEN, "TKN", 10_000)];
    expect(detectSmartMoneyEntry(trades, smartWallets)).toHaveLength(0);
  });

  it("returns empty if fewer than 3 smart wallets", () => {
    const trades = [
      makeTrade("0xwallet01", TOKEN, "TKN", 20_000),
      makeTrade("0xwallet02", TOKEN, "TKN", 20_000),
    ];
    expect(detectSmartMoneyEntry(trades, smartWallets)).toHaveLength(0);
  });

  it("returns empty if total USD below threshold ($50k)", () => {
    const trades = [
      makeTrade("0xwallet01", TOKEN, "TKN", 10_000),
      makeTrade("0xwallet02", TOKEN, "TKN", 10_000),
      makeTrade("0xwallet03", TOKEN, "TKN", 10_000),
    ];
    expect(detectSmartMoneyEntry(trades, smartWallets)).toHaveLength(0);
  });

  it("fires a signal when 3+ smart wallets accumulate > $50k", () => {
    const trades = [
      makeTrade("0xwallet01", TOKEN, "TKN", 20_000),
      makeTrade("0xwallet02", TOKEN, "TKN", 20_000),
      makeTrade("0xwallet03", TOKEN, "TKN", 20_000),
    ];
    const signals = detectSmartMoneyEntry(trades, smartWallets);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.signalType).toBe("SMART_MONEY_ENTRY");
    expect(signals[0]?.walletAddresses).toHaveLength(3);
    expect(signals[0]?.confidenceScore).toBeGreaterThan(0);
    expect(signals[0]?.confidenceScore).toBeLessThanOrEqual(100);
  });

  it("emits one signal per token", () => {
    const TOKEN2 = "0xtoken002";
    const trades = [
      makeTrade("0xwallet01", TOKEN, "TKN", 20_000),
      makeTrade("0xwallet02", TOKEN, "TKN", 20_000),
      makeTrade("0xwallet03", TOKEN, "TKN", 20_000),
      makeTrade("0xwallet01", TOKEN2, "TK2", 20_000),
      makeTrade("0xwallet02", TOKEN2, "TK2", 20_000),
      makeTrade("0xwallet03", TOKEN2, "TK2", 20_000),
    ];
    const signals = detectSmartMoneyEntry(trades, smartWallets);
    expect(signals).toHaveLength(2);
  });
});

// ── detectWhaleEntry ─────────────────────────────────────────────────────────

describe("detectWhaleEntry", () => {
  const TOKEN = "0xwhaletoken";
  const lowLiquidity = new Map([[TOKEN, 5_000_000]]);

  it("returns empty if trade is below $100k", () => {
    const trades = [makeTrade("0xwhale", TOKEN, "BIG", 50_000)];
    expect(detectWhaleEntry(trades, lowLiquidity)).toHaveLength(0);
  });

  it("returns empty if token liquidity > $10M", () => {
    const highLiq = new Map([[TOKEN, 20_000_000]]);
    const trades = [makeTrade("0xwhale", TOKEN, "BIG", 200_000)];
    expect(detectWhaleEntry(trades, highLiq)).toHaveLength(0);
  });

  it("fires a signal for large trade in low-liquidity token", () => {
    const trades = [makeTrade("0xwhale", TOKEN, "BIG", 150_000)];
    const signals = detectWhaleEntry(trades, lowLiquidity);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.signalType).toBe("WHALE_ENTRY");
    expect(signals[0]?.valueUSD).toBe(150_000);
  });

  it("emits only one signal per token even with multiple big trades", () => {
    const trades = [
      makeTrade("0xwhale1", TOKEN, "BIG", 150_000),
      makeTrade("0xwhale2", TOKEN, "BIG", 200_000),
    ];
    expect(detectWhaleEntry(trades, lowLiquidity)).toHaveLength(1);
  });
});

// ── detectLiquiditySurge ─────────────────────────────────────────────────────

describe("detectLiquiditySurge", () => {
  function makePoolEvent(
    poolAddress: string,
    token0: string,
    token1: string,
    blockNumber = 500,
  ): BitqueryPoolEvent {
    return {
      Block: { Number: blockNumber, Time: new Date().toISOString() },
      Transaction: { Hash: "0xtxhash" },
      Log: { SmartContract: poolAddress, Signature: { Name: "PoolCreated" } },
      Arguments: [
        { Name: "pool", Value: { address: poolAddress } },
        { Name: "token0", Value: { address: token0 } },
        { Name: "token1", Value: { address: token1 } },
      ],
    };
  }

  it("returns empty if new pool liquidity is below threshold", () => {
    const event = makePoolEvent("0xpool", "0xtok0", "0xtok1");
    const currentTvls = new Map([["0xpool", 100_000]]);
    expect(detectLiquiditySurge([event], new Map(), currentTvls)).toHaveLength(0);
  });

  it("fires for new pool with high initial liquidity", () => {
    const event = makePoolEvent("0xpool", "0xtok0", "0xtok1");
    const currentTvls = new Map([["0xpool", 500_000]]);
    const signals = detectLiquiditySurge([event], new Map(), currentTvls);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.signalType).toBe("LIQUIDITY_SURGE");
  });

  it("fires for existing pool with >150% TVL surge", () => {
    const previousTvls = new Map([["0xexistingpool", 1_000_000]]);
    const currentTvls = new Map([["0xexistingpool", 3_000_000]]);
    const signals = detectLiquiditySurge([], previousTvls, currentTvls);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.signalType).toBe("LIQUIDITY_SURGE");
  });

  it("does not fire for pool with <150% TVL increase", () => {
    const previousTvls = new Map([["0xpool", 1_000_000]]);
    const currentTvls = new Map([["0xpool", 2_000_000]]); // 100% increase
    const signals = detectLiquiditySurge([], previousTvls, currentTvls);
    expect(signals).toHaveLength(0);
  });
});

// ── detectEarlyMomentum ──────────────────────────────────────────────────────

describe("detectEarlyMomentum", () => {
  const TOKEN = "0xnewtoken";
  const launchPrices = new Map([[TOKEN, 0.001]]);
  const highLiquidity = new Map([[TOKEN, 50_000]]);
  const clankerLaunches = new Set<string>();

  it("returns empty if token has no launch price (not new)", () => {
    const trades = [makeTrade("0xbuyer", TOKEN, "NEW", 100)];
    expect(detectEarlyMomentum(trades, new Map(), highLiquidity, clankerLaunches)).toHaveLength(0);
  });

  it("returns empty if liquidity is zero", () => {
    const trades = [makeTrade("0xbuyer", TOKEN, "NEW", 100)];
    expect(detectEarlyMomentum(trades, launchPrices, new Map(), clankerLaunches)).toHaveLength(0);
  });

  it("fires when price doubled and vol/liq >= 3x", () => {
    // We need volume high enough vs liquidity for the ratio
    // 50k liquidity × 3 = 150k min volume
    const trades = Array.from({ length: 10 }, (_, i) =>
      makeTrade(`0xbuyer${i}`, TOKEN, "NEW", 20_000),
    );
    // priceAtTrade = amountUSD / amount = 20000 / 20 = 1000, vs launch 0.001 → huge gain
    const signals = detectEarlyMomentum(trades, launchPrices, highLiquidity, clankerLaunches);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.signalType).toBe("EARLY_MOMENTUM");
  });
});

// ── detectCoordinatedCluster ─────────────────────────────────────────────────

describe("detectCoordinatedCluster", () => {
  const TOKEN = "0xclustertoken";
  const SOURCE = "0xsource";

  const fundingSources = new Map<string, string>([
    ["0xcw1", SOURCE],
    ["0xcw2", SOURCE],
    ["0xcw3", SOURCE],
    ["0xcw4", SOURCE],
    ["0xcw5", SOURCE],
  ]);

  it("returns empty if cluster size < 5", () => {
    const smallSources = new Map([
      ["0xcw1", SOURCE],
      ["0xcw2", SOURCE],
      ["0xcw3", SOURCE],
    ]);
    const trades = [
      makeTrade("0xcw1", TOKEN, "CLT", 5_000),
      makeTrade("0xcw2", TOKEN, "CLT", 5_000),
      makeTrade("0xcw3", TOKEN, "CLT", 5_000),
    ];
    expect(detectCoordinatedCluster(trades, smallSources)).toHaveLength(0);
  });

  it("fires when 5+ wallets from same source buy same token", () => {
    const trades = [
      makeTrade("0xcw1", TOKEN, "CLT", 5_000),
      makeTrade("0xcw2", TOKEN, "CLT", 5_000),
      makeTrade("0xcw3", TOKEN, "CLT", 5_000),
      makeTrade("0xcw4", TOKEN, "CLT", 5_000),
      makeTrade("0xcw5", TOKEN, "CLT", 5_000),
    ];
    const signals = detectCoordinatedCluster(trades, fundingSources);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.signalType).toBe("COORDINATED_CLUSTER");
    expect(signals[0]?.walletAddresses).toHaveLength(5);
    expect(signals[0]?.confidenceScore).toBeLessThanOrEqual(100);
  });

  it("emits one signal per token", () => {
    const TOKEN2 = "0xclustertoken2";
    const trades = [
      makeTrade("0xcw1", TOKEN, "CLT", 5_000),
      makeTrade("0xcw2", TOKEN, "CLT", 5_000),
      makeTrade("0xcw3", TOKEN, "CLT", 5_000),
      makeTrade("0xcw4", TOKEN, "CLT", 5_000),
      makeTrade("0xcw5", TOKEN, "CLT", 5_000),
      makeTrade("0xcw1", TOKEN2, "CL2", 5_000),
      makeTrade("0xcw2", TOKEN2, "CL2", 5_000),
      makeTrade("0xcw3", TOKEN2, "CL2", 5_000),
      makeTrade("0xcw4", TOKEN2, "CL2", 5_000),
      makeTrade("0xcw5", TOKEN2, "CL2", 5_000),
    ];
    expect(detectCoordinatedCluster(trades, fundingSources)).toHaveLength(2);
  });
});
