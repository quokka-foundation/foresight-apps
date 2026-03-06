// ========================================
// Foresight Mini App — Curve AMM Math
// ========================================

/**
 * Calculate payout for a given probability and leverage.
 * In a continuous outcome market, the payout is inversely proportional
 * to the probability — buying at lower probability = higher payout.
 */
export function calculatePayout(
  amount: number,
  probability: number,
  leverage: number = 1
): number {
  if (probability <= 0 || probability >= 100) return 0;
  const odds = 100 / probability;
  return amount * odds * leverage;
}

/**
 * Calculate the cost basis for a curve position.
 */
export function calculateCost(
  amount: number,
  probability: number
): number {
  return amount * (probability / 100);
}

/**
 * Estimate P&L based on entry and current probability.
 */
export function calculatePnL(
  amount: number,
  entryProbability: number,
  currentProbability: number,
  leverage: number = 1,
  direction: 'yes' | 'no' = 'yes'
): { pnl: number; pnlPercent: number; currentValue: number } {
  const entryPrice = direction === 'yes'
    ? entryProbability / 100
    : 1 - entryProbability / 100;

  const currentPrice = direction === 'yes'
    ? currentProbability / 100
    : 1 - currentProbability / 100;

  const priceChange = (currentPrice - entryPrice) / entryPrice;
  const leveragedChange = priceChange * leverage;
  const currentValue = amount * (1 + leveragedChange);
  const pnl = currentValue - amount;
  const pnlPercent = leveragedChange * 100;

  return { pnl, pnlPercent, currentValue };
}

/**
 * Calculate estimated slippage based on trade size and liquidity.
 */
export function estimateSlippage(
  tradeAmount: number,
  liquidity: number
): number {
  if (liquidity <= 0) return 5; // max slippage
  const impact = (tradeAmount / liquidity) * 100;
  return Math.min(impact, 5); // cap at 5%
}

/**
 * Estimate gas cost on Base (very low).
 */
export function estimateGas(): number {
  return 0.15; // ~$0.15 on Base
}

/**
 * Calculate safety score for a leverage level.
 * Higher leverage = lower safety.
 */
export function calculateSafetyScore(leverage: number): number {
  if (leverage <= 1) return 95;
  if (leverage <= 3) return 88;
  if (leverage <= 5) return 72;
  return Math.max(50, 95 - leverage * 5);
}

/**
 * Generate SVG path data for a curve from probability points.
 * Uses cubic bezier for smooth curves.
 */
export function generateCurvePath(
  points: { x: number; y: number }[],
  width: number,
  height: number,
  padding: number = 0
): string {
  if (points.length < 2) return '';

  const xMin = Math.min(...points.map((p) => p.x));
  const xMax = Math.max(...points.map((p) => p.x));
  const yMin = Math.min(...points.map((p) => p.y));
  const yMax = Math.max(...points.map((p) => p.y));

  const scaleX = (x: number) =>
    padding + ((x - xMin) / (xMax - xMin || 1)) * (width - 2 * padding);
  const scaleY = (y: number) =>
    height - padding - ((y - yMin) / (yMax - yMin || 1)) * (height - 2 * padding);

  const scaled = points.map((p) => ({ x: scaleX(p.x), y: scaleY(p.y) }));

  let d = `M ${scaled[0].x},${scaled[0].y}`;

  for (let i = 1; i < scaled.length; i++) {
    const prev = scaled[i - 1];
    const curr = scaled[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }

  return d;
}

/**
 * Generate area path (for gradient fill under the curve).
 */
export function generateAreaPath(
  curvePath: string,
  width: number,
  height: number,
  padding: number = 0
): string {
  if (!curvePath) return '';
  return `${curvePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
}
