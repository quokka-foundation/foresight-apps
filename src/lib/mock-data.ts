// ========================================
// Foresight Mini App — Mock Data
// ========================================
import type {
  Market,
  CurvePoint,
  Position,
  PortfolioSummary,
  LeverageOption,
} from './types';

// ---- Leverage Options ----
export const LEVERAGE_OPTIONS: LeverageOption[] = [
  { multiplier: 1, label: '1x', risk: 'safe', safetyScore: 95 },
  { multiplier: 3, label: '3x', risk: 'moderate', safetyScore: 88 },
  { multiplier: 5, label: '5x', risk: 'high', safetyScore: 72 },
];

// ---- Trending Markets ----
export const MOCK_MARKETS: Market[] = [
  {
    id: 'trump-2026',
    title: 'Trump Wins 2026 Midterms',
    description: 'Will the Republican party win a majority in the 2026 midterm elections?',
    category: 'politics',
    probability: 47.3,
    volume24h: 1_200_000,
    totalVolume: 18_500_000,
    liquidity: 3_200_000,
    change24h: 3.2,
    createdAt: '2025-11-01T00:00:00Z',
    resolutionDate: '2026-11-03T00:00:00Z',
    status: 'active',
    tags: ['politics', 'elections', 'usa'],
  },
  {
    id: 'btc-150k',
    title: 'BTC > $150K by July',
    description: 'Will Bitcoin exceed $150,000 USD before July 1, 2026?',
    category: 'crypto',
    probability: 62.1,
    volume24h: 890_000,
    totalVolume: 12_300_000,
    liquidity: 2_800_000,
    change24h: 1.8,
    createdAt: '2025-12-15T00:00:00Z',
    resolutionDate: '2026-07-01T00:00:00Z',
    status: 'active',
    tags: ['crypto', 'bitcoin', 'price'],
  },
  {
    id: 'fed-rate-cut',
    title: 'Fed Rate Cut March',
    description: 'Will the Federal Reserve cut interest rates at the March 2026 FOMC meeting?',
    category: 'economics',
    probability: 38.5,
    volume24h: 650_000,
    totalVolume: 8_900_000,
    liquidity: 1_900_000,
    change24h: -2.1,
    createdAt: '2026-01-10T00:00:00Z',
    resolutionDate: '2026-03-19T00:00:00Z',
    status: 'active',
    tags: ['economics', 'fed', 'interest-rates'],
  },
  {
    id: 'eth-10k',
    title: 'ETH > $10K by EOY',
    description: 'Will Ethereum exceed $10,000 USD before December 31, 2026?',
    category: 'crypto',
    probability: 28.7,
    volume24h: 420_000,
    totalVolume: 5_600_000,
    liquidity: 1_200_000,
    change24h: -0.5,
    createdAt: '2026-01-01T00:00:00Z',
    resolutionDate: '2026-12-31T00:00:00Z',
    status: 'active',
    tags: ['crypto', 'ethereum', 'price'],
  },
  {
    id: 'base-tvl-50b',
    title: 'Base TVL > $50B',
    description: 'Will Base L2 total value locked exceed $50 billion by end of 2026?',
    category: 'crypto',
    probability: 55.2,
    volume24h: 310_000,
    totalVolume: 4_200_000,
    liquidity: 980_000,
    change24h: 4.7,
    createdAt: '2026-02-01T00:00:00Z',
    resolutionDate: '2026-12-31T00:00:00Z',
    status: 'active',
    tags: ['crypto', 'base', 'defi'],
  },
];

// ---- Generate Curve History Data ----
export function generateCurveHistory(
  marketId: string,
  baseProbability: number,
  days: number = 30
): CurvePoint[] {
  const points: CurvePoint[] = [];
  const now = Date.now();
  const msPerDay = 86_400_000;

  let prob = baseProbability - 15 + Math.random() * 10;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * msPerDay;
    // Random walk toward current probability
    const drift = (baseProbability - prob) * 0.08;
    const noise = (Math.random() - 0.5) * 4;
    prob = Math.max(1, Math.min(99, prob + drift + noise));

    points.push({
      timestamp,
      probability: Math.round(prob * 10) / 10,
      volume: Math.round(50_000 + Math.random() * 200_000),
    });
  }

  // Ensure last point matches current probability
  if (points.length > 0) {
    points[points.length - 1].probability = baseProbability;
  }

  return points;
}

// ---- Mock Positions ----
export const MOCK_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    marketId: 'trump-2026',
    marketTitle: 'Trump Wins 2026 Midterms',
    direction: 'yes',
    entryProbability: 44.1,
    currentProbability: 47.3,
    amount: 100,
    leverage: 3,
    currentValue: 121.8,
    pnl: 21.8,
    pnlPercent: 7.26,
    entryDate: '2026-02-15T10:30:00Z',
    status: 'open',
  },
  {
    id: 'pos-2',
    marketId: 'btc-150k',
    marketTitle: 'BTC > $150K by July',
    direction: 'yes',
    entryProbability: 58.3,
    currentProbability: 62.1,
    amount: 50,
    leverage: 5,
    currentValue: 82.6,
    pnl: 32.6,
    pnlPercent: 10.87,
    entryDate: '2026-02-20T14:15:00Z',
    status: 'open',
  },
  {
    id: 'pos-3',
    marketId: 'fed-rate-cut',
    marketTitle: 'Fed Rate Cut March',
    direction: 'no',
    entryProbability: 42.0,
    currentProbability: 38.5,
    amount: 75,
    leverage: 1,
    currentValue: 81.25,
    pnl: 6.25,
    pnlPercent: 8.33,
    entryDate: '2026-02-25T09:00:00Z',
    status: 'open',
  },
  {
    id: 'pos-4',
    marketId: 'eth-10k',
    marketTitle: 'ETH > $10K by EOY',
    direction: 'yes',
    entryProbability: 31.2,
    currentProbability: 28.7,
    amount: 25,
    leverage: 3,
    currentValue: 18.95,
    pnl: -6.05,
    pnlPercent: -24.2,
    entryDate: '2026-03-01T11:45:00Z',
    status: 'open',
  },
];

// ---- Mock Portfolio Summary ----
export const MOCK_PORTFOLIO: PortfolioSummary = {
  totalInvested: 250,
  totalValue: 304.6,
  totalPnl: 54.6,
  totalPnlPercent: 21.84,
  openPositions: 4,
  winRate: 75,
};

// ---- Helper: Get market by ID ----
export function getMarketById(id: string): Market | undefined {
  return MOCK_MARKETS.find((m) => m.id === id);
}

// ---- Helper: Format currency ----
export function formatUSD(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

// ---- Helper: Format percentage ----
export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// ---- Category config ----
export const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  politics: { label: 'Politics', color: '#EF4444' },
  crypto: { label: 'Crypto', color: '#3B82F6' },
  economics: { label: 'Economics', color: '#F59E0B' },
  sports: { label: 'Sports', color: '#10B981' },
  tech: { label: 'Tech', color: '#8B5CF6' },
  culture: { label: 'Culture', color: '#EC4899' },
};

// ========================================
// Chart Data Generators (lightweight-charts v5 format)
// lightweight-charts uses UTCTimestamp (seconds, not ms)
// ========================================

import type { Time } from 'lightweight-charts';
import type {
  ChartDataPoint,
  VolumeDataPoint,
  ChartMarker,
} from '@/components/TradingViewChart';

/**
 * Convert CurvePoint[] (ms timestamps) → ChartDataPoint[] (UTCTimestamp seconds)
 */
export function curveToChartData(points: CurvePoint[]): ChartDataPoint[] {
  return points.map((p) => ({
    time: Math.floor(p.timestamp / 1000) as unknown as Time,
    value: p.probability,
  }));
}

/**
 * Convert CurvePoint[] → VolumeDataPoint[] with color coding
 * Green for above-average volume, muted blue for below
 */
export function curveToVolumeData(points: CurvePoint[]): VolumeDataPoint[] {
  const avgVol = points.reduce((sum, p) => sum + p.volume, 0) / points.length;
  return points.map((p) => ({
    time: Math.floor(p.timestamp / 1000) as unknown as Time,
    value: p.volume,
    color: p.volume >= avgVol ? 'rgba(0, 211, 149, 0.35)' : 'rgba(0, 82, 255, 0.15)',
  }));
}

/**
 * Generate P&L overlay data given curve points and a position
 * P&L = (currentProb - entryProb) * amount * leverage / 100
 */
export function generatePnlOverlay(
  points: CurvePoint[],
  position: Position,
): ChartDataPoint[] {
  const entryTs = new Date(position.entryDate).getTime();
  return points
    .filter((p) => p.timestamp >= entryTs)
    .map((p) => {
      const delta = position.direction === 'yes'
        ? p.probability - position.entryProbability
        : position.entryProbability - p.probability;
      const pnl = (delta * position.amount * position.leverage) / 100;
      return {
        time: Math.floor(p.timestamp / 1000) as unknown as Time,
        value: Math.round(pnl * 100) / 100,
      };
    });
}

/**
 * Generate entry/exit markers for a position
 */
export function generatePositionMarkers(position: Position): ChartMarker[] {
  const markers: ChartMarker[] = [];
  const entryTs = Math.floor(new Date(position.entryDate).getTime() / 1000);

  markers.push({
    time: entryTs as unknown as Time,
    position: 'belowBar',
    color: '#0052FF',
    shape: position.direction === 'yes' ? 'arrowUp' : 'arrowDown',
    text: `${position.direction === 'yes' ? 'BUY' : 'SELL'} ${position.leverage}x`,
    size: 2,
  });

  if (position.status === 'closed') {
    // For closed positions, place exit marker at the last data point
    // In a real app this would come from trade data
    const exitTs = entryTs + 7 * 86400; // mock: 7 days after entry
    markers.push({
      time: exitTs as unknown as Time,
      position: 'aboveBar',
      color: position.pnl >= 0 ? '#00D395' : '#FF6B6B',
      shape: 'circle',
      text: `EXIT ${position.pnl >= 0 ? '+' : ''}$${position.pnl.toFixed(0)}`,
      size: 2,
    });
  }

  return markers;
}

/**
 * Filter chart data by time range
 */
export function filterByTimeRange(
  data: ChartDataPoint[],
  range: '1H' | '1D' | '1W' | '1M' | 'ALL',
): ChartDataPoint[] {
  if (range === 'ALL' || data.length === 0) return data;

  const nowSec = Math.floor(Date.now() / 1000);
  const rangeSeconds: Record<string, number> = {
    '1H': 3600,
    '1D': 86400,
    '1W': 7 * 86400,
    '1M': 30 * 86400,
  };
  const cutoff = nowSec - (rangeSeconds[range] ?? 0);

  return data.filter((d) => (d.time as unknown as number) >= cutoff);
}
