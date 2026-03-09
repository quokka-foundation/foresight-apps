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
export type SubscriptionTier = "FREE" | "PRO_TRADER" | "QUANT_RESEARCH" | "INSTITUTIONAL";
export type WalletClusterType = "whale" | "fund" | "bot" | "market_maker" | "unknown";

export interface AlphaSignal {
  id: string;
  type: SignalType;
  tokenAddress: string;
  tokenSymbol?: string;
  description: string;
  confidenceScore: number; // 0-100
  valueUSD?: number;
  walletCount?: number;
  blockNumber?: number;
  detectedAt: string; // ISO 8601
  chain: "base";
}

export interface SmartWallet {
  id: string;
  address: string;
  smartScore: number; // 0-100
  clusterType?: WalletClusterType;
  labels?: string[];
  totalVolumeUSD?: number;
  tradeCount?: number;
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
