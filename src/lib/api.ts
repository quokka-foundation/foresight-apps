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
  // ── Auth ─────────────────────────────────────────────────────────────────
  /** GET /auth/nonce → { nonce: string } */
  nonce: () => apiFetch<{ nonce: string }>("/auth/nonce"),
  /** POST /auth/siwe/verify → { token: string, userId: string, walletAddress: string } */
  siweVerify: (body: { message: string; signature: string }) =>
    apiFetch<{ token: string; userId: string; walletAddress: string }>("/auth/siwe/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ── Alpha ─────────────────────────────────────────────────────────────────
  /** GET /alpha/feed?limit=N */
  feed: (limit = 20) => apiFetch<AlphaSignal[]>(`/alpha/feed?limit=${limit}`),
  /** GET /alpha/token/:address */
  tokenSignals: (address: string) => apiFetch<AlphaSignal[]>(`/alpha/token/${address}`),
  /** GET /alpha/live?limit=N */
  liveSignals: (limit = 20) => apiFetch<AlphaSignal[]>(`/alpha/live?limit=${limit}`),

  // ── Wallets ───────────────────────────────────────────────────────────────
  /** GET /wallets/smart?limit=N */
  wallets: (limit = 50) => apiFetch<SmartWallet[]>(`/wallets/smart?limit=${limit}`),
  /** GET /wallets/:address */
  wallet: (address: string) => apiFetch<WalletDetail>(`/wallets/${address}`),
  /** GET /wallets/smart/activity?limit=N */
  walletActivity: (limit = 10) => apiFetch<AlphaSignal[]>(`/wallets/smart/activity?limit=${limit}`),

  // ── Tokens ────────────────────────────────────────────────────────────────
  /** GET /tokens/new?limit=N */
  newTokens: (limit = 50) => apiFetch<Token[]>(`/tokens/new?limit=${limit}`),

  // ── Liquidity ─────────────────────────────────────────────────────────────
  /** GET /liquidity/recent?limit=N */
  recentLiquidity: (limit = 20) => apiFetch<Token[]>(`/liquidity/recent?limit=${limit}`),
  /** GET /liquidity/tokens/:address/liquidity */
  tokenLiquidity: (address: string) =>
    apiFetch<{ liquidityUSD: number; dataPoints: { timestamp: string; value: number }[] }>(
      `/liquidity/tokens/${address}/liquidity`,
    ),

  // ── AI ────────────────────────────────────────────────────────────────────
  /** GET /ai/insights?limit=N */
  insights: (limit = 10) => apiFetch<AiInsight[]>(`/ai/insights?limit=${limit}`),
  /** GET /ai/token/:address */
  tokenInsight: (address: string) => apiFetch<AiInsight>(`/ai/token/${address}`),
  /** GET /ai/narratives?limit=N */
  narratives: (limit = 10) =>
    apiFetch<{ id: string; title: string; summary: string }[]>(`/ai/narratives?limit=${limit}`),

  // ── Alerts (require auth) ─────────────────────────────────────────────────
  /** POST /alerts/subscribe */
  subscribe: (body: AlertSubscriptionInput) =>
    apiFetch<{ id: string }>("/alerts/subscribe", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** PUT /alerts/settings */
  updateAlertSettings: (body: Partial<AlertSubscriptionInput>) =>
    apiFetch<{ id: string }>("/alerts/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  /** GET /alerts/history?userId=X&limit=N */
  alertHistory: (userId: string, limit = 20) =>
    apiFetch<AlertHistoryItem[]>(`/alerts/history?userId=${userId}&limit=${limit}`),
  /** POST /alerts/test */
  testAlert: () => apiFetch<{ sent: boolean }>("/alerts/test", { method: "POST" }),

  // ── Research ──────────────────────────────────────────────────────────────
  /** GET /research/wallets/top?limit=N */
  topWallets: (limit = 10) => apiFetch<SmartWallet[]>(`/research/wallets/top?limit=${limit}`),
  /** GET /research/wallets/:address/portfolio */
  walletPortfolio: (address: string) =>
    apiFetch<{ tokens: { address: string; symbol: string; valueUSD: number }[] }>(
      `/research/wallets/${address}/portfolio`,
    ),
  /** GET /research/token/:address */
  researchToken: (address: string) =>
    apiFetch<{ address: string; signals: AlphaSignal[]; insight: AiInsight }>(
      `/research/token/${address}`,
    ),
  /** GET /research/narratives?limit=N */
  researchNarratives: (limit = 10) =>
    apiFetch<{ id: string; title: string; summary: string }[]>(
      `/research/narratives?limit=${limit}`,
    ),
  /** GET /research/market */
  marketResearch: () =>
    apiFetch<{ summary: string; topTokens: Token[]; sentiment: string }>("/research/market"),

  // ── Billing ───────────────────────────────────────────────────────────────
  /** GET /billing/plans */
  plans: () =>
    apiFetch<{ id: string; name: string; price: number; limits: Record<string, number> }[]>(
      "/billing/plans",
    ),
  /** GET /billing/access */
  billingAccess: () => apiFetch<{ tier: string; requestsRemaining: number }>("/billing/access"),

  // ── Marketplace ───────────────────────────────────────────────────────────
  /** POST /marketplace/keys */
  createApiKey: () => apiFetch<{ key: string }>("/marketplace/keys", { method: "POST" }),
  /** GET /marketplace/keys/:userId */
  apiKeys: (userId: string) =>
    apiFetch<{ key: string; createdAt: string }[]>(`/marketplace/keys/${userId}`),
  /** GET /marketplace/alpha?limit=N */
  marketplaceAlpha: (limit = 20) => apiFetch<AlphaSignal[]>(`/marketplace/alpha?limit=${limit}`),

  // ── Ecosystem ─────────────────────────────────────────────────────────────
  /** GET /ecosystem/trending */
  ecosystemTrending: () =>
    apiFetch<{ tokens: Token[]; wallets: SmartWallet[] }>("/ecosystem/trending"),

  // ── Growth ────────────────────────────────────────────────────────────────
  /** GET /growth/leaderboard?limit=N */
  leaderboard: (limit = 20) =>
    apiFetch<{ userId: string; score: number; rank: number }[]>(
      `/growth/leaderboard?limit=${limit}`,
    ),
  /** POST /growth/referral */
  createReferral: () => apiFetch<{ code: string }>("/growth/referral", { method: "POST" }),

  // ── Users ─────────────────────────────────────────────────────────────────
  /** GET /users/:id */
  user: (id: string) =>
    apiFetch<{ id: string; walletAddress: string; tier: string }>(`/users/${id}`),
  /** GET /users/wallet/:address */
  userByWallet: (address: string) =>
    apiFetch<{ id: string; walletAddress: string; tier: string }>(`/users/wallet/${address}`),
};
