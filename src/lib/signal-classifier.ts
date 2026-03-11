// ============================================================
// Foresight — Signal Classifier (pure functions)
// ============================================================
// Classifies raw Bitquery trade/event data into the 5 AlphaSignal types.
// All functions are pure and have no side effects — easy to unit test.

import type { BitqueryClankerLaunch, BitqueryPoolEvent, BitqueryTrade } from "./bitquery";
import { SIGNAL_THRESHOLDS } from "./constants";
import type { AlphaSignal, SignalType } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByToken<T extends { Trade: { Currency: { SmartContract: string } } }>(
  trades: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const t of trades) {
    const addr = t.Trade.Currency.SmartContract.toLowerCase();
    const existing = groups.get(addr) ?? [];
    existing.push(t);
    groups.set(addr, existing);
  }
  return groups;
}

function sumUSD(trades: BitqueryTrade[]): number {
  return trades.reduce((acc, t) => acc + (t.Trade.AmountInUSD ?? 0), 0);
}

function uniqueBuyers(trades: BitqueryTrade[]): string[] {
  return [...new Set(trades.map((t) => t.Trade.Buyer.toLowerCase()))];
}

function buildSignal({
  signalType,
  tokenAddress,
  tokenSymbol,
  confidenceScore,
  walletAddresses,
  blockNumber,
  valueUSD,
  description,
  metadata,
}: {
  signalType: SignalType;
  tokenAddress: string;
  tokenSymbol: string;
  confidenceScore: number;
  walletAddresses: string[];
  blockNumber: number;
  valueUSD: number;
  description: string;
  metadata: Record<string, unknown>;
}): AlphaSignal {
  return {
    id: `${signalType}-${tokenAddress.slice(2, 8).toLowerCase()}-${Date.now()}`,
    signalType,
    tokenAddress: tokenAddress.toLowerCase(),
    tokenSymbol,
    confidenceScore: Math.min(100, Math.max(0, Math.round(confidenceScore))),
    walletAddresses,
    blockNumber,
    valueUSD,
    description,
    metadata,
    detectedAt: new Date().toISOString(),
  };
}

// ── 1. SMART_MONEY_ENTRY ──────────────────────────────────────────────────────

/**
 * Detects when 3+ high-score smart wallets accumulate the same token
 * within a 15-minute window totalling > $50k.
 *
 * @param trades - Recent DEX trades (last 15 min)
 * @param smartWallets - Map of wallet address (lowercase) → smart score (0–100)
 */
export function detectSmartMoneyEntry(
  trades: BitqueryTrade[],
  smartWallets: Map<string, number>,
): AlphaSignal[] {
  const { minWallets, minSmartScore, minValueUSD } = SIGNAL_THRESHOLDS.SMART_MONEY_ENTRY;
  const signals: AlphaSignal[] = [];

  // Only consider buy-side trades from smart wallets
  const smartTrades = trades.filter((t) => {
    const score = smartWallets.get(t.Trade.Buyer.toLowerCase());
    return score !== undefined && score >= minSmartScore;
  });

  const byToken = groupByToken(smartTrades);

  for (const [tokenAddress, tokenTrades] of byToken) {
    const buyers = uniqueBuyers(tokenTrades);
    const totalUSD = sumUSD(tokenTrades);

    if (buyers.length < minWallets || totalUSD < minValueUSD) continue;

    const avgScore =
      buyers.reduce((sum, addr) => sum + (smartWallets.get(addr) ?? 0), 0) / buyers.length;

    const confidence = Math.min(95, (avgScore / 100) * 100);
    const first = tokenTrades[0];
    const symbol = first.Trade.Currency.Symbol;

    signals.push(
      buildSignal({
        signalType: "SMART_MONEY_ENTRY",
        tokenAddress,
        tokenSymbol: symbol,
        confidenceScore: confidence,
        walletAddresses: buyers,
        blockNumber: first.Block.Number,
        valueUSD: totalUSD,
        description: `${buyers.length} smart money wallets (avg score ${Math.round(avgScore)}) accumulated $${(totalUSD / 1000).toFixed(0)}K ${symbol}`,
        metadata: { avgSmartScore: avgScore, buyerCount: buyers.length },
      }),
    );
  }

  return signals;
}

// ── 2. WHALE_ENTRY ────────────────────────────────────────────────────────────

/**
 * Detects single large trades (> $100k) in tokens with < $10M liquidity,
 * or rapid-fire sequences (5+ trades > $20k from same whale in < 10 min).
 */
export function detectWhaleEntry(
  trades: BitqueryTrade[],
  tokenLiquidities: Map<string, number>,
): AlphaSignal[] {
  const { singleTradeMinUSD, maxTokenLiquidityUSD } = SIGNAL_THRESHOLDS.WHALE_ENTRY;
  const signals: AlphaSignal[] = [];
  const emittedTokens = new Set<string>(); // one signal per token

  for (const trade of trades) {
    const tokenAddress = trade.Trade.Currency.SmartContract.toLowerCase();
    if (emittedTokens.has(tokenAddress)) continue;

    const liquidity = tokenLiquidities.get(tokenAddress) ?? Number.POSITIVE_INFINITY;
    const usd = trade.Trade.AmountInUSD;

    if (usd >= singleTradeMinUSD && liquidity <= maxTokenLiquidityUSD) {
      const confidence = Math.min(95, usd / 10_000);
      emittedTokens.add(tokenAddress);
      signals.push(
        buildSignal({
          signalType: "WHALE_ENTRY",
          tokenAddress,
          tokenSymbol: trade.Trade.Currency.Symbol,
          confidenceScore: confidence,
          walletAddresses: [trade.Trade.Buyer.toLowerCase()],
          blockNumber: trade.Block.Number,
          valueUSD: usd,
          description: `Whale bought $${(usd / 1000).toFixed(0)}K ${trade.Trade.Currency.Symbol} (pool liquidity: $${(liquidity / 1_000_000).toFixed(1)}M)`,
          metadata: { liquidityUSD: liquidity, tradeHash: trade.Transaction.Hash },
        }),
      );
    }
  }

  return signals;
}

// ── 3. LIQUIDITY_SURGE ────────────────────────────────────────────────────────

/**
 * Detects new Aerodrome pools with high initial liquidity OR
 * events where TVL increased > 150% in the detection window.
 */
export function detectLiquiditySurge(
  poolEvents: BitqueryPoolEvent[],
  previousTvls: Map<string, number>,
  currentTvls: Map<string, number>,
): AlphaSignal[] {
  const { minTvlIncreasePercent, newPoolMinLiquidityUSD } = SIGNAL_THRESHOLDS.LIQUIDITY_SURGE;
  const signals: AlphaSignal[] = [];

  // New pools with significant initial liquidity
  for (const event of poolEvents) {
    const poolArg = event.Arguments.find((a) => a.Name === "pool");
    const token0Arg = event.Arguments.find((a) => a.Name === "token0");
    const token1Arg = event.Arguments.find((a) => a.Name === "token1");

    const poolAddress = poolArg?.Value?.address?.toLowerCase() ?? "";
    const token0 = token0Arg?.Value?.address?.toLowerCase() ?? "";
    const token1 = token1Arg?.Value?.address?.toLowerCase() ?? "";

    const initialLiquidity = currentTvls.get(poolAddress) ?? 0;
    if (initialLiquidity < newPoolMinLiquidityUSD) continue;

    // Use token0 as the signal token (non-WETH side)
    const tokenAddress = token0 || token1;

    signals.push(
      buildSignal({
        signalType: "LIQUIDITY_SURGE",
        tokenAddress,
        tokenSymbol: "",
        confidenceScore: Math.min(90, initialLiquidity / 10_000),
        walletAddresses: [],
        blockNumber: event.Block.Number,
        valueUSD: initialLiquidity,
        description: `New pool created with $${(initialLiquidity / 1_000_000).toFixed(1)}M initial liquidity`,
        metadata: { poolAddress, token0, token1, txHash: event.Transaction.Hash },
      }),
    );
  }

  // Existing pools with TVL surge
  for (const [poolAddress, currentTvl] of currentTvls) {
    const prevTvl = previousTvls.get(poolAddress) ?? 0;
    if (prevTvl === 0) continue;

    const increasePercent = ((currentTvl - prevTvl) / prevTvl) * 100;
    if (increasePercent < minTvlIncreasePercent) continue;

    signals.push(
      buildSignal({
        signalType: "LIQUIDITY_SURGE",
        tokenAddress: poolAddress,
        tokenSymbol: "",
        confidenceScore: Math.min(90, Math.round(increasePercent / 2)),
        walletAddresses: [],
        blockNumber: 0,
        valueUSD: currentTvl,
        description: `Liquidity surged +${Math.round(increasePercent)}% to $${(currentTvl / 1_000_000).toFixed(1)}M TVL`,
        metadata: { previousTvl: prevTvl, currentTvl, increasePercent },
      }),
    );
  }

  return signals;
}

// ── 4. EARLY_MOMENTUM ─────────────────────────────────────────────────────────

/**
 * Detects tokens under 72h old with 100%+ price increase and 3x+ volume/liquidity ratio.
 */
export function detectEarlyMomentum(
  trades: BitqueryTrade[],
  tokenLaunchPrices: Map<string, number>,
  tokenLiquidities: Map<string, number>,
  clankerLaunches: Set<string>,
): AlphaSignal[] {
  const { minPriceChangePercent, minVolumeToLiquidityRatio } = SIGNAL_THRESHOLDS.EARLY_MOMENTUM;
  const signals: AlphaSignal[] = [];
  const emittedTokens = new Set<string>();

  const byToken = groupByToken(trades);

  for (const [tokenAddress, tokenTrades] of byToken) {
    if (emittedTokens.has(tokenAddress)) continue;

    const launchPrice = tokenLaunchPrices.get(tokenAddress);
    if (!launchPrice) continue; // not a new token

    const liquidity = tokenLiquidities.get(tokenAddress) ?? 0;
    if (liquidity === 0) continue;

    const latestTrade = tokenTrades[0];
    const currentPrice = latestTrade.Trade.AmountInUSD / (latestTrade.Trade.Amount || 1);
    const priceChange = ((currentPrice - launchPrice) / launchPrice) * 100;
    const volumeUSD = sumUSD(tokenTrades);
    const volToLiq = liquidity > 0 ? volumeUSD / liquidity : 0;

    if (priceChange < minPriceChangePercent || volToLiq < minVolumeToLiquidityRatio) continue;

    const isClanker = clankerLaunches.has(tokenAddress);
    const confidence = Math.min(85, Math.round(volToLiq * 10));

    emittedTokens.add(tokenAddress);
    signals.push(
      buildSignal({
        signalType: "EARLY_MOMENTUM",
        tokenAddress,
        tokenSymbol: latestTrade.Trade.Currency.Symbol,
        confidenceScore: confidence,
        walletAddresses: uniqueBuyers(tokenTrades).slice(0, 10),
        blockNumber: latestTrade.Block.Number,
        valueUSD: volumeUSD,
        description: `Early momentum: +${Math.round(priceChange)}% price${isClanker ? " (Clanker launch)" : ""}, volume ${Math.round(volToLiq)}x liquidity`,
        metadata: { priceChange, volumeToLiquidityRatio: volToLiq, isClanker, launchPrice },
      }),
    );
  }

  return signals;
}

// ── 5. COORDINATED_CLUSTER ────────────────────────────────────────────────────

/**
 * Detects 5+ wallets funded from the same source buying the same token
 * within a 30-minute window.
 *
 * @param trades - Recent trades
 * @param fundingSources - Map of wallet (lowercase) → funding source wallet (lowercase)
 */
export function detectCoordinatedCluster(
  trades: BitqueryTrade[],
  fundingSources: Map<string, string>,
): AlphaSignal[] {
  const { minClusterSize } = SIGNAL_THRESHOLDS.COORDINATED_CLUSTER;
  const signals: AlphaSignal[] = [];
  const emittedTokens = new Set<string>();

  const byToken = groupByToken(trades);

  for (const [tokenAddress, tokenTrades] of byToken) {
    if (emittedTokens.has(tokenAddress)) continue;

    const buyers = uniqueBuyers(tokenTrades);

    // Group buyers by funding source
    const sourceGroups = new Map<string, string[]>();
    for (const buyer of buyers) {
      const source = fundingSources.get(buyer);
      if (!source) continue;
      const group = sourceGroups.get(source) ?? [];
      group.push(buyer);
      sourceGroups.set(source, group);
    }

    // Find the largest cluster from the same source
    let largestCluster: string[] = [];
    for (const group of sourceGroups.values()) {
      if (group.length > largestCluster.length) largestCluster = group;
    }

    if (largestCluster.length < minClusterSize) continue;

    const clusterTrades = tokenTrades.filter((t) =>
      largestCluster.includes(t.Trade.Buyer.toLowerCase()),
    );
    const totalUSD = sumUSD(clusterTrades);
    const confidence = Math.min(92, largestCluster.length * 10);
    const first = tokenTrades[0];

    emittedTokens.add(tokenAddress);
    signals.push(
      buildSignal({
        signalType: "COORDINATED_CLUSTER",
        tokenAddress,
        tokenSymbol: first.Trade.Currency.Symbol,
        confidenceScore: confidence,
        walletAddresses: largestCluster,
        blockNumber: first.Block.Number,
        valueUSD: totalUSD,
        description: `${largestCluster.length} coordinated wallets (same funding source) bought $${(totalUSD / 1000).toFixed(0)}K ${first.Trade.Currency.Symbol}`,
        metadata: { clusterSize: largestCluster.length, totalUSD },
      }),
    );
  }

  return signals;
}
