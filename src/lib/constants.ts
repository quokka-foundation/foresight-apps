export const APP_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://foresight-apps.vercel.app");

export const APP_ID = process.env.NEXT_PUBLIC_BASE_APP_ID;

/** Legacy external API URL — leave empty to use internal Next.js API routes */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const CHAIN_ID = 8453; // Base mainnet

// ── Contract Addresses ────────────────────────────────────────────────────────
export const ADDRESSES = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  WETH: "0x4200000000000000000000000000000000000006" as `0x${string}`,
  AERO: "0x940181a94A35A4569E4529A3CDfB74e38FD98631" as `0x${string}`,
} as const;

// ── Aerodrome / DEX ────────────────────────────────────────────────────────────
export const AERODROME_FACTORY = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da" as `0x${string}`;

/**
 * Clanker factory contract on Base.
 * Set via NEXT_PUBLIC_CLANKER_FACTORY env var or falls back to known v2 address.
 * Verify at https://basescan.org before production use.
 */
export const CLANKER_FACTORY = (process.env.NEXT_PUBLIC_CLANKER_FACTORY ??
  "0x7c1bdb18Ae1b5f1D82d1B98f7dA9a14AD8A8bDDf") as `0x${string}`;

// ── Bitquery ──────────────────────────────────────────────────────────────────
/**
 * Bitquery streaming endpoint. Uses EAP (Early Access Program) for Base real-time data.
 * Standard fallback: https://streaming.bitquery.io/graphql
 */
export const BITQUERY_API_URL = process.env.BITQUERY_API_URL ?? "https://streaming.bitquery.io/eap";

// ── Subscription Tiers ────────────────────────────────────────────────────────
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    signalDelayMinutes: 5,
    aiSummariesPerDay: 3,
    walletDetailLocked: false,
    ohlcvRanges: ["1D"] as string[],
  },
  pro: {
    name: "Pro",
    price: 29,
    signalDelayMinutes: 0,
    aiSummariesPerDay: -1, // unlimited
    walletDetailLocked: false,
    ohlcvRanges: ["1H", "1D", "1W", "1M", "ALL"] as string[],
  },
  elite: {
    name: "Elite",
    price: 49,
    signalDelayMinutes: 0,
    aiSummariesPerDay: -1,
    walletDetailLocked: false,
    ohlcvRanges: ["1H", "1D", "1W", "1M", "ALL"] as string[],
  },
} as const;

// ── Signal Detection Thresholds ───────────────────────────────────────────────
export const SIGNAL_THRESHOLDS = {
  SMART_MONEY_ENTRY: {
    minWallets: 3,
    minSmartScore: 80,
    minValueUSD: 50_000,
    windowMinutes: 15,
  },
  WHALE_ENTRY: {
    singleTradeMinUSD: 100_000,
    maxTokenLiquidityUSD: 10_000_000,
    rapidFireMinTrades: 5,
    rapidFireMinUSD: 20_000,
    rapidFireWindowMinutes: 10,
  },
  LIQUIDITY_SURGE: {
    minTvlIncreasePercent: 150,
    windowMinutes: 60,
    newPoolMinLiquidityUSD: 200_000,
  },
  EARLY_MOMENTUM: {
    maxTokenAgeHours: 72,
    minPriceChangePercent: 100,
    minVolumeToLiquidityRatio: 3,
  },
  COORDINATED_CLUSTER: {
    minClusterSize: 5,
    windowMinutes: 30,
    fundingLookbackDays: 7,
  },
} as const;
