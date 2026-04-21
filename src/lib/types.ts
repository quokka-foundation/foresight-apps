// ========================================
// Foresight Alpha Intelligence — Type Definitions
// ========================================

export type SignalType =
  | "SMART_MONEY_ENTRY"
  | "WHALE_ENTRY"
  | "LIQUIDITY_SURGE"
  | "EARLY_MOMENTUM"
  | "COORDINATED_CLUSTER";

export type AlertPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
/** @deprecated Use SubscriptionTierKey instead */
export type SubscriptionTier = "FREE" | "PRO_TRADER" | "QUANT_RESEARCH" | "INSTITUTIONAL";
export type WalletClusterType = "whale" | "fund" | "bot" | "market_maker" | "unknown";

export interface AlphaSignal {
  id: string;
  tokenAddress: string;
  signalType: SignalType;
  confidenceScore: number; // 0-100
  walletAddresses: string[];
  blockNumber: number;
  metadata: Record<string, unknown>;
  detectedAt: string; // ISO 8601
  // Optional enriched fields — may be returned directly by the API or extracted from metadata
  description?: string;
  tokenSymbol?: string;
  valueUSD?: number;
  /** Farcaster mention count for this token in the detection window */
  socialMentions?: number;
  /** AI-generated plain-English summary */
  aiSummary?: string;
}

export interface SmartWallet {
  id: string;
  address: string;
  smartScore: number; // 0-100
  clusterType?: WalletClusterType;
  labels?: string[];
  totalVolumeUSD?: number;
  tradeCount?: number;
  winRate?: number; // 0-1 fraction
}

export interface WalletDetail extends SmartWallet {
  recentTransactions?: WalletTransaction[];
  clusterSize?: number;
}

export interface WalletTransaction {
  id: string;
  tokenAddress: string;
  tokenSymbol?: string;
  type: "buy" | "sell";
  amountUSD: number;
  blockNumber: number;
  timestamp: string;
}

export interface Token {
  id: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  firstSeenAt: string;
  totalLiquidityUSD?: number;
  priceUSD?: number;
  change24h?: number;
  volume24hUSD?: number;
  txCount?: number;
  marketCapUSD?: number;
  holders?: number;
}

export interface AlertSubscription {
  id: string;
  userId: string;
  signalTypes: SignalType[];
  minConfidence: number;
  isActive: boolean;
  triggeredCount: number;
}

export interface AlertSubscriptionInput {
  signalTypes: SignalType[];
  minConfidence: number;
}

export interface AlertHistoryItem {
  id: string;
  signalType: SignalType;
  message: string;
  triggeredAt: string;
}

export interface AiInsight {
  id: string;
  summary: string;
  keyDrivers: string[];
  riskFactors: string[];
  confidenceScore: number;
  timeHorizon: string;
  signalId?: string;
  tokenAddress?: string;
  generatedAt: string;
}

// ── New Types ─────────────────────────────────────────────

export interface OHLCVBar {
  /** Unix timestamp in SECONDS (required by lightweight-charts) */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type OHLCVResolution = "1H" | "1D" | "1W" | "1M" | "ALL";

export interface SocialSignal {
  id: string;
  tokenAddress: string | null;
  tokenSymbol: string | null;
  mentionCount: number;
  castHashes: string[];
  sentiment: "positive" | "neutral" | "negative" | null;
  windowStart: string | null;
  windowEnd: string | null;
  createdAt: string;
}

export type SubscriptionTierKey = "free" | "pro" | "elite";

export interface UserProfile {
  id: string;
  fid: number | null;
  walletAddress: string | null;
  subscriptionTier: SubscriptionTierKey;
  createdAt: string;
}

/** Extended Token with real-time fields from database */
export interface TokenDetail extends Token {
  liquidityUSD?: number;
  isClanker?: boolean;
  poolAddress?: string;
  signals?: AlphaSignal[];
  aiInsight?: AiInsight | null;
  socialMentions?: number;
}

/** Wallet with win rate + avg PnL from database */
export interface WalletStats extends SmartWallet {
  winRate?: number;
  avgPnlPercent?: number;
}

export type TabId = "feed" | "wallets" | "tokens" | "alerts" | "profile";

export interface TabItem {
  id: TabId;
  label: string;
  href: string;
}

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  walletAddress: string | null;
  jwt: string | null;
}
