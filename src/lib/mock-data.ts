// ========================================
// Foresight Alpha Intelligence — Mock Data
// ========================================
import type {
  AiInsight,
  AlertHistoryItem,
  AlphaSignal,
  SignalType,
  SmartWallet,
  Token,
} from "./types";

// ---- Signal Type Config ----
export const SIGNAL_TYPE_CONFIG: Record<
  SignalType,
  { label: string; color: string; bgColor: string }
> = {
  SMART_MONEY_ENTRY: {
    label: "Smart Money",
    color: "#BF5AF2",
    bgColor: "rgba(191, 90, 242, 0.15)",
  },
  WHALE_ENTRY: {
    label: "Whale",
    color: "#FF9F0A",
    bgColor: "rgba(255, 159, 10, 0.15)",
  },
  LIQUIDITY_SURGE: {
    label: "Liquidity Surge",
    color: "#0052FF",
    bgColor: "rgba(0, 82, 255, 0.15)",
  },
  EARLY_MOMENTUM: {
    label: "Early Momentum",
    color: "#00D395",
    bgColor: "rgba(0, 211, 149, 0.15)",
  },
  COORDINATED_CLUSTER: {
    label: "Coordinated",
    color: "#FF375F",
    bgColor: "rgba(255, 55, 95, 0.15)",
  },
};

// ---- Mock Signals ----
export const MOCK_SIGNALS: AlphaSignal[] = [
  {
    id: "sig-1",
    signalType: "SMART_MONEY_ENTRY",
    tokenAddress: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    tokenSymbol: "DEGEN",
    description: "3 known fund wallets accumulated $420K DEGEN in the last 2 hours",
    confidenceScore: 87,
    valueUSD: 420_000,
    walletAddresses: [
      "0x1234567890abcdef1234567890abcdef12345678",
      "0xabcdef1234567890abcdef1234567890abcdef12",
      "0x9876543210fedcba9876543210fedcba98765432",
    ],
    blockNumber: 28_451_200,
    metadata: {},
    detectedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    id: "sig-2",
    signalType: "WHALE_ENTRY",
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    tokenSymbol: "USDC",
    description: "Whale wallet deposited $2.1M USDC into Aerodrome LP",
    confidenceScore: 92,
    valueUSD: 2_100_000,
    walletAddresses: ["0xfedcba9876543210fedcba9876543210fedcba98"],
    blockNumber: 28_451_180,
    metadata: {},
    detectedAt: new Date(Date.now() - 25 * 60_000).toISOString(),
  },
  {
    id: "sig-3",
    signalType: "LIQUIDITY_SURGE",
    tokenAddress: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
    tokenSymbol: "HIGHER",
    description: "Liquidity doubled in HIGHER/WETH pool — $1.8M added in 30 min",
    confidenceScore: 78,
    valueUSD: 1_800_000,
    walletAddresses: [
      "0x1111222233334444555566667777888899990000",
      "0x2222333344445555666677778888999900001111",
      "0x3333444455556666777788889999000011112222",
      "0x4444555566667777888899990000111122223333",
      "0x5555666677778888999900001111222233334444",
      "0x6666777788889999000011112222333344445555",
      "0x7777888899990000111122223333444455556666",
      "0x8888999900001111222233334444555566667777",
    ],
    blockNumber: 28_451_150,
    metadata: {},
    detectedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    id: "sig-4",
    signalType: "EARLY_MOMENTUM",
    tokenAddress: "0x532f27101965dd16442E59d40670FaF5eBB142E4",
    tokenSymbol: "BRETT",
    description: "BRETT showing early accumulation pattern — 14 wallets buying under $0.08",
    confidenceScore: 71,
    valueUSD: 89_000,
    walletAddresses: Array.from({ length: 14 }, (_, i) => `0x${String(i + 1).padStart(40, "0")}`),
    blockNumber: 28_451_100,
    metadata: {},
    detectedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "sig-5",
    signalType: "COORDINATED_CLUSTER",
    tokenAddress: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    tokenSymbol: "cbETH",
    description: "5 wallets from same cluster bought $890K cbETH within 3 blocks",
    confidenceScore: 94,
    valueUSD: 890_000,
    walletAddresses: [
      "0xaaaa000011112222333344445555666677778888",
      "0xbbbb000011112222333344445555666677778888",
      "0xcccc000011112222333344445555666677778888",
      "0xdddd000011112222333344445555666677778888",
      "0xeeee000011112222333344445555666677778888",
    ],
    blockNumber: 28_451_050,
    metadata: {},
    detectedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: "sig-6",
    signalType: "SMART_MONEY_ENTRY",
    tokenAddress: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    tokenSymbol: "AERO",
    description: "Smart money wallet with 94 score bought $310K AERO — first buy in 2 weeks",
    confidenceScore: 83,
    valueUSD: 310_000,
    walletAddresses: ["0xffff000011112222333344445555666677778888"],
    blockNumber: 28_450_900,
    metadata: {},
    detectedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
];

// ---- Mock Smart Wallets ----
export const MOCK_WALLETS: SmartWallet[] = [
  {
    id: "w-1",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    smartScore: 94,
    clusterType: "fund",
    labels: ["DeFi Whale", "Aerodrome LP"],
    totalVolumeUSD: 48_200_000,
    tradeCount: 312,
  },
  {
    id: "w-2",
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    smartScore: 91,
    clusterType: "whale",
    labels: ["Early Base Adopter"],
    totalVolumeUSD: 22_500_000,
    tradeCount: 187,
  },
  {
    id: "w-3",
    address: "0x9876543210fedcba9876543210fedcba98765432",
    smartScore: 88,
    clusterType: "market_maker",
    labels: ["MM", "High Frequency"],
    totalVolumeUSD: 120_000_000,
    tradeCount: 4_521,
  },
  {
    id: "w-4",
    address: "0xfedcba9876543210fedcba9876543210fedcba98",
    smartScore: 85,
    clusterType: "fund",
    labels: ["VC Fund"],
    totalVolumeUSD: 15_800_000,
    tradeCount: 89,
  },
  {
    id: "w-5",
    address: "0x1111222233334444555566667777888899990000",
    smartScore: 79,
    clusterType: "bot",
    labels: ["Arb Bot", "MEV"],
    totalVolumeUSD: 95_000_000,
    tradeCount: 12_430,
  },
];

// ---- Mock Tokens ----
export const MOCK_TOKENS: Token[] = [
  {
    id: "t-1",
    address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    symbol: "DEGEN",
    name: "Degen",
    decimals: 18,
    firstSeenAt: "2024-01-15T00:00:00Z",
    totalLiquidityUSD: 8_200_000,
    priceUSD: 0.012,
    change24h: 14.2,
    volume24hUSD: 3_400_000,
    txCount: 12_450,
  },
  {
    id: "t-2",
    address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    symbol: "AERO",
    name: "Aerodrome Finance",
    decimals: 18,
    firstSeenAt: "2023-08-28T00:00:00Z",
    totalLiquidityUSD: 45_000_000,
    priceUSD: 1.42,
    change24h: 5.8,
    volume24hUSD: 12_000_000,
    txCount: 8_900,
  },
  {
    id: "t-3",
    address: "0x532f27101965dd16442E59d40670FaF5eBB142E4",
    symbol: "BRETT",
    name: "Brett",
    decimals: 18,
    firstSeenAt: "2024-02-20T00:00:00Z",
    totalLiquidityUSD: 6_100_000,
    priceUSD: 0.078,
    change24h: -3.1,
    volume24hUSD: 2_100_000,
    txCount: 7_200,
  },
  {
    id: "t-4",
    address: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
    symbol: "HIGHER",
    name: "Higher",
    decimals: 18,
    firstSeenAt: "2024-03-10T00:00:00Z",
    totalLiquidityUSD: 3_800_000,
    priceUSD: 0.032,
    change24h: 22.4,
    volume24hUSD: 1_900_000,
    txCount: 4_300,
  },
  {
    id: "t-5",
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    decimals: 18,
    firstSeenAt: "2023-06-01T00:00:00Z",
    totalLiquidityUSD: 120_000_000,
    priceUSD: 3_280.0,
    change24h: 1.2,
    volume24hUSD: 28_000_000,
    txCount: 15_600,
  },
];

// ---- Mock AI Insights ----
export const MOCK_INSIGHTS: AiInsight[] = [
  {
    id: "ins-1",
    summary:
      "Coordinated accumulation of DEGEN by 3 fund wallets suggests imminent catalyst. Historical pattern accuracy: 78%.",
    keyDrivers: [
      "Multiple fund wallets buying simultaneously",
      "Volume 3x above 7-day average",
      "Social sentiment turning positive",
    ],
    riskFactors: ["Low liquidity relative to position sizes", "High concentration risk"],
    confidenceScore: 82,
    timeHorizon: "24-48 hours",
    signalId: "sig-1",
    tokenAddress: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    generatedAt: new Date(Date.now() - 10 * 60_000).toISOString(),
  },
  {
    id: "ins-2",
    summary:
      "Base DeFi ecosystem showing strong growth signals. TVL up 18% this week with smart money rotating into AERO.",
    keyDrivers: [
      "Rising TVL across Base protocols",
      "Smart money inflows increasing",
      "New protocol launches driving activity",
    ],
    riskFactors: ["Market-wide correlation risk", "Regulatory uncertainty"],
    confidenceScore: 75,
    timeHorizon: "1-2 weeks",
    generatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
];

// ---- Mock Alert History ----
export const MOCK_ALERT_HISTORY: AlertHistoryItem[] = [
  {
    id: "ah-1",
    signalType: "COORDINATED_CLUSTER",
    message: "Coordinated cluster detected: 5 wallets bought $890K cbETH",
    triggeredAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: "ah-2",
    signalType: "WHALE_ENTRY",
    message: "Whale deposited $2.1M USDC into Aerodrome",
    triggeredAt: new Date(Date.now() - 25 * 60_000).toISOString(),
  },
  {
    id: "ah-3",
    signalType: "SMART_MONEY_ENTRY",
    message: "Smart money wallet bought $310K AERO",
    triggeredAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
];

// ---- Helpers ----
export function getSignalById(id: string): AlphaSignal | undefined {
  return MOCK_SIGNALS.find((s) => s.id === id);
}

export function getWalletByAddress(address: string): SmartWallet | undefined {
  return MOCK_WALLETS.find((w) => w.address === address);
}

export function getTokenByAddress(address: string): Token | undefined {
  return MOCK_TOKENS.find((t) => t.address === address);
}
