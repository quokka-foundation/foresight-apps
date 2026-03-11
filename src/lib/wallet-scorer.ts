// ============================================================
// Foresight — Wallet Scorer (pure functions)
// ============================================================
// Computes the smart score (0-100) from a wallet's trade history.

export interface WalletTradeRecord {
  tokenAddress: string;
  type: "buy" | "sell";
  amountUSD: number;
  timestamp: string; // ISO 8601
  /** Price at the time of the trade */
  priceAtTrade: number;
  /** Peak price within 48h after the buy (used for timing score) */
  peakPriceAfter?: number;
}

export interface WalletScoreBreakdown {
  smartScore: number;
  winRate: number; // 0–100
  avgPnlPercent: number; // can be negative
  timingScore: number; // 0–100: how early relative to peak
  networkScore: number; // 0–100: placeholder until clustering data available
}

// ── Component Calculators ─────────────────────────────────────────────────────

/**
 * Win rate: percentage of round-trip trades (buy → sell) that were profitable.
 * Only considers completed trades (have a matching sell).
 */
export function calculateWinRate(trades: WalletTradeRecord[]): number {
  // Match buys and sells by token address in chronological order
  const buys = trades
    .filter((t) => t.type === "buy")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const sells = trades
    .filter((t) => t.type === "sell")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  let wins = 0;
  let total = 0;

  for (const buy of buys) {
    const matchingSell = sells.find(
      (s) => s.tokenAddress === buy.tokenAddress && new Date(s.timestamp) > new Date(buy.timestamp),
    );
    if (!matchingSell) continue; // open position, skip

    total++;
    if (matchingSell.priceAtTrade > buy.priceAtTrade) wins++;
  }

  return total === 0 ? 50 : Math.round((wins / total) * 100);
}

/**
 * Average P&L percent on completed trades (buy→sell pairs).
 */
export function calculateAvgPnl(trades: WalletTradeRecord[]): number {
  const buys = trades
    .filter((t) => t.type === "buy")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const sells = trades
    .filter((t) => t.type === "sell")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const pnls: number[] = [];

  for (const buy of buys) {
    const matchingSell = sells.find(
      (s) => s.tokenAddress === buy.tokenAddress && new Date(s.timestamp) > new Date(buy.timestamp),
    );
    if (!matchingSell || buy.priceAtTrade === 0) continue;

    const pnl = ((matchingSell.priceAtTrade - buy.priceAtTrade) / buy.priceAtTrade) * 100;
    pnls.push(pnl);
  }

  if (!pnls.length) return 0;
  return Math.round(pnls.reduce((a, b) => a + b, 0) / pnls.length);
}

/**
 * Timing score: on average, how close to the bottom did this wallet buy?
 * 100 = perfect bottom, 0 = bought at the peak.
 * Uses peakPriceAfter if available; otherwise uses priceAtTrade as proxy.
 */
export function calculateTimingScore(trades: WalletTradeRecord[]): number {
  const buys = trades.filter((t) => t.type === "buy" && t.peakPriceAfter !== undefined);

  if (!buys.length) return 50; // default neutral

  const scores = buys.map((b) => {
    const peak = b.peakPriceAfter ?? b.priceAtTrade;
    if (peak === 0 || b.priceAtTrade === 0) return 50;
    // Score = how much upside was captured relative to peak
    const upside = ((peak - b.priceAtTrade) / peak) * 100;
    return Math.min(100, Math.max(0, upside));
  });

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Composite smart score:
 *   40% win rate
 *   30% avg return (normalised 0–100, capped at 200% return = 100 score)
 *   20% timing score
 *   10% network score (placeholder = 50 until clustering is live)
 */
export function calculateSmartScore(trades: WalletTradeRecord[]): WalletScoreBreakdown {
  if (!trades.length) {
    return { smartScore: 0, winRate: 0, avgPnlPercent: 0, timingScore: 0, networkScore: 50 };
  }

  const winRate = calculateWinRate(trades);
  const avgPnlPercent = calculateAvgPnl(trades);
  const timingScore = calculateTimingScore(trades);
  const networkScore = 50; // placeholder

  // Normalize avgPnl to 0–100 (0% return = 0 pts, 200%+ return = 100 pts)
  const avgReturnScore = Math.min(100, Math.max(0, (avgPnlPercent / 200) * 100));

  const smartScore = Math.round(
    winRate * 0.4 + avgReturnScore * 0.3 + timingScore * 0.2 + networkScore * 0.1,
  );

  return {
    smartScore: Math.min(100, Math.max(0, smartScore)),
    winRate,
    avgPnlPercent,
    timingScore,
    networkScore,
  };
}

/**
 * Classify a wallet's trading behaviour into a cluster type.
 */
export function classifyWallet(
  trades: WalletTradeRecord[],
): "whale" | "fund" | "bot" | "market_maker" | "unknown" {
  if (!trades.length) return "unknown";

  const avgTradeUSD = trades.reduce((s, t) => s + t.amountUSD, 0) / trades.length;

  const tradesPerDay = trades.length / 30; // assumes 30-day window

  if (tradesPerDay > 50) return "bot";
  if (tradesPerDay > 10 && avgTradeUSD < 5_000) return "market_maker";
  if (avgTradeUSD > 500_000) return "whale";
  if (avgTradeUSD > 50_000) return "fund";
  return "unknown";
}
