export const APP_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://foresight-apps.vercel.app");

export const APP_ID = process.env.NEXT_PUBLIC_BASE_APP_ID;
export const CHAIN_ID = 8453; // Base mainnet

export const ADDRESSES = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  FORESIGHT_MARKET: (process.env.NEXT_PUBLIC_FORESIGHT_MARKET_ADDRESS ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
} as const;

// Default trade amount in USDC (6 decimals)
export const DEFAULT_TRADE_AMOUNT = 10; // $10 USDC
export const MAX_TRADE_AMOUNT = 10_000; // $10K USDC
export const MIN_TRADE_AMOUNT = 1; // $1 USDC

// Leverage limits
export const MAX_LEVERAGE = 5;
export const SAFE_LEVERAGE_THRESHOLD = 85; // safety score >= 85 = "safe"

// Category dot-matrix SVG patterns
export const CATEGORY_PATTERNS: Record<string, string> = {
  politics: "/patterns/cat-politics.svg",
  crypto: "/patterns/cat-crypto.svg",
  economics: "/patterns/cat-economics.svg",
  sports: "/patterns/cat-sports.svg",
  tech: "/patterns/cat-tech.svg",
  culture: "/patterns/cat-culture.svg",
};

// Demo mode flag
export const IS_DEMO =
  !process.env.NEXT_PUBLIC_FORESIGHT_MARKET_ADDRESS ||
  process.env.NEXT_PUBLIC_FORESIGHT_MARKET_ADDRESS === "0x0000000000000000000000000000000000000000";
