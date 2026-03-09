export const APP_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://foresight-apps.vercel.app");

export const APP_ID = process.env.NEXT_PUBLIC_BASE_APP_ID;

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const CHAIN_ID = 8453; // Base mainnet

export const ADDRESSES = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
} as const;
