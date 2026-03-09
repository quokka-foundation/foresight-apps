import type {
  AiInsight,
  AlertHistoryItem,
  AlertSubscriptionInput,
  AlphaSignal,
  SmartWallet,
  Token,
  WalletDetail,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function getJwt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("foresight_jwt");
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const jwt = getJwt();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as T;
}

export const api = {
  // Alpha
  feed: (limit = 20) => apiFetch<AlphaSignal[]>(`/alpha/feed?limit=${limit}`),
  tokenSignals: (address: string) => apiFetch<AlphaSignal[]>(`/alpha/token/${address}`),
  liveSignals: (limit = 20) => apiFetch<AlphaSignal[]>(`/alpha/live?limit=${limit}`),

  // Wallets
  wallets: (limit = 50) => apiFetch<SmartWallet[]>(`/wallets/smart?limit=${limit}`),
  wallet: (address: string) => apiFetch<WalletDetail>(`/wallets/${address}`),
  walletActivity: (limit = 10) => apiFetch<AlphaSignal[]>(`/wallets/smart/activity?limit=${limit}`),

  // Tokens
  newTokens: (limit = 50) => apiFetch<Token[]>(`/tokens/new?limit=${limit}`),
  tokenLiquidity: (address: string) =>
    apiFetch<{ liquidityUSD: number; dataPoints: { timestamp: string; value: number }[] }>(
      `/liquidity/tokens/${address}/liquidity`,
    ),
  recentLiquidity: (limit = 20) => apiFetch<Token[]>(`/liquidity/recent?limit=${limit}`),

  // AI
  insights: (limit = 10) => apiFetch<AiInsight[]>(`/ai/insights?limit=${limit}`),
  narratives: (limit = 10) =>
    apiFetch<{ id: string; title: string; summary: string }[]>(`/ai/narratives?limit=${limit}`),

  // Alerts (require auth)
  alertHistory: (userId: string, limit = 20) =>
    apiFetch<AlertHistoryItem[]>(`/alerts/history?userId=${userId}&limit=${limit}`),
  subscribe: (body: AlertSubscriptionInput) =>
    apiFetch<{ id: string }>("/alerts/subscribe", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Auth
  nonce: () => apiFetch<{ nonce: string }>("/auth/nonce"),
  siweVerify: (body: { message: string; signature: string }) =>
    apiFetch<{ token: string }>("/auth/siwe/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Billing
  plans: () =>
    apiFetch<{ id: string; name: string; price: number; limits: Record<string, number> }[]>(
      "/billing/plans",
    ),
};
