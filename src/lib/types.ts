// ========================================
// Foresight Mini App — Type Definitions
// ========================================

/** Continuous Outcome Market */
export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  probability: number; // 0-100
  volume24h: number; // USD
  totalVolume: number; // USD
  liquidity: number; // USD
  change24h: number; // percentage change
  createdAt: string; // ISO date
  resolutionDate: string; // ISO date
  status: MarketStatus;
  imageUrl?: string;
  tags: string[];
}

export type MarketCategory =
  | 'politics'
  | 'crypto'
  | 'economics'
  | 'sports'
  | 'tech'
  | 'culture';

export type MarketStatus = 'active' | 'resolved' | 'paused';

/** Curve data point for chart rendering */
export interface CurvePoint {
  timestamp: number; // unix ms
  probability: number; // 0-100
  volume: number;
}

/** Leverage option */
export interface LeverageOption {
  multiplier: number; // 1, 3, 5
  label: string;
  risk: 'safe' | 'moderate' | 'high';
  safetyScore: number; // 0-100
}

/** Trade parameters */
export interface TradeParams {
  marketId: string;
  probability: number;
  amount: number; // USD
  leverage: number;
  direction: 'yes' | 'no';
  slippage: number; // percentage
}

/** Trade result */
export interface TradeResult {
  hash: string;
  tradeId: number;
  entryPrice: number;
  potentialPayout: number;
  gasUsed: number;
  timestamp: number;
}

/** Portfolio position */
export interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  direction: 'yes' | 'no';
  entryProbability: number;
  currentProbability: number;
  amount: number; // USD invested
  leverage: number;
  currentValue: number;
  pnl: number; // absolute
  pnlPercent: number;
  entryDate: string;
  status: PositionStatus;
}

export type PositionStatus = 'open' | 'closed' | 'liquidated';

/** Portfolio summary */
export interface PortfolioSummary {
  totalInvested: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  openPositions: number;
  winRate: number; // 0-100
}

/** Notification for P&L alerts */
export interface PnlNotification {
  marketId: string;
  marketTitle: string;
  pnlPercent: number;
  timestamp: number;
}

/** Safe area insets from Farcaster client */
export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Tab navigation items */
export type TabId = 'home' | 'portfolio' | 'wallet' | 'create';

export interface TabItem {
  id: TabId;
  label: string;
  href: string;
}

/** Contract call interface (pluggable for real contracts) */
export interface ForesightContract {
  tradeCurve: (params: TradeParams) => Promise<TradeResult>;
  getMarketData: (marketId: string) => Promise<Market>;
  getCurveHistory: (marketId: string) => Promise<CurvePoint[]>;
  getPositions: (address: string) => Promise<Position[]>;
  getPortfolioSummary: (address: string) => Promise<PortfolioSummary>;
}
