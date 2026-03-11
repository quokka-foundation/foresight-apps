// ============================================================
// Foresight — Neynar Client
// ============================================================
// Server-side only. Fetches Farcaster social signals:
//   - Casts mentioning a token symbol or address
//   - Channel trending tokens
//   - User profile by FID / wallet

import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import type { SocialSignal } from "./types";

// ── Singleton ─────────────────────────────────────────────────────────────────

let _client: NeynarAPIClient | null = null;

function getClient(): NeynarAPIClient {
  if (!_client) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) throw new Error("NEYNAR_API_KEY is not set");
    _client = new NeynarAPIClient({ apiKey });
  }
  return _client;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FarcasterCast {
  hash: string;
  text: string;
  authorFid: number;
  timestamp: string;
  reactions: { likes: number; recasts: number };
}

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  custodyAddress: string;
  verifiedAddresses: string[];
  followerCount: number;
}

// ── Token Mention Scan ────────────────────────────────────────────────────────

/**
 * Search Farcaster casts for mentions of a token (by symbol or address).
 * Returns a SocialSignal aggregating mention counts and sentiment.
 */
export async function fetchTokenSocialSignal(
  tokenAddress: string,
  tokenSymbol: string,
  windowMinutes = 60,
): Promise<SocialSignal> {
  const client = getClient();
  const windowStart = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  // Search by both symbol (e.g. "$DEGEN") and raw address prefix
  const query = tokenSymbol ? `$${tokenSymbol}` : tokenAddress.slice(0, 10);

  let casts: FarcasterCast[] = [];
  try {
    const resp = await client.searchCasts({ q: query, limit: 50 });
    casts = (resp.result.casts ?? []).map((c) => ({
      hash: c.hash,
      text: c.text,
      authorFid: c.author.fid,
      timestamp: c.timestamp,
      reactions: {
        likes: c.reactions.likes_count,
        recasts: c.reactions.recasts_count,
      },
    }));
  } catch {
    // Neynar may rate-limit or be unavailable; return empty signal gracefully
  }

  // Naive sentiment: count positive/negative keywords
  const positiveWords = ["moon", "pump", "buy", "bullish", "gem", "🚀", "up", "win", "alpha"];
  const negativeWords = ["dump", "sell", "rug", "scam", "bearish", "down", "rekt", "red"];

  let posScore = 0;
  let negScore = 0;
  for (const cast of casts) {
    const lower = cast.text.toLowerCase();
    for (const w of positiveWords) if (lower.includes(w)) posScore++;
    for (const w of negativeWords) if (lower.includes(w)) negScore++;
  }

  const sentiment =
    posScore > negScore * 1.5 ? "positive" : negScore > posScore * 1.5 ? "negative" : "neutral";

  return {
    id: `social-${tokenAddress.slice(2, 10)}-${Date.now()}`,
    tokenAddress,
    tokenSymbol: tokenSymbol || null,
    mentionCount: casts.length,
    castHashes: casts.map((c) => c.hash),
    sentiment,
    windowStart,
    windowEnd: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// ── Batch Token Mention Counts ────────────────────────────────────────────────

/**
 * Return a map of tokenAddress → mention count for the last `windowMinutes` minutes.
 * Used by the signal classifier to enrich signals with social context.
 */
export async function fetchBatchMentionCounts(
  tokens: { address: string; symbol: string }[],
  windowMinutes = 60,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  // Fire in batches of 5 to respect rate limits
  for (let i = 0; i < tokens.length; i += 5) {
    const batch = tokens.slice(i, i + 5);
    await Promise.all(
      batch.map(async ({ address, symbol }) => {
        try {
          const signal = await fetchTokenSocialSignal(address, symbol, windowMinutes);
          map.set(address.toLowerCase(), signal.mentionCount);
        } catch {
          map.set(address.toLowerCase(), 0);
        }
      }),
    );
  }
  return map;
}

// ── User / Wallet Lookup ──────────────────────────────────────────────────────

/**
 * Fetch a Farcaster user profile by wallet address.
 * Returns null if the address is not associated with any FID.
 */
export async function fetchUserByWallet(walletAddress: string): Promise<FarcasterUser | null> {
  const client = getClient();
  try {
    const resp = await client.fetchBulkUsersByEthOrSolAddress({
      addresses: [walletAddress.toLowerCase()],
    });
    const users = Object.values(resp);
    if (!users.length || !users[0]?.length) return null;
    const user = users[0][0];
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name ?? user.username,
      pfpUrl: user.pfp_url ?? "",
      custodyAddress: user.custody_address ?? walletAddress,
      verifiedAddresses: user.verified_addresses?.eth_addresses ?? [],
      followerCount: user.follower_count ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch a Farcaster user profile by FID.
 */
export async function fetchUserByFid(fid: number): Promise<FarcasterUser | null> {
  const client = getClient();
  try {
    const resp = await client.fetchBulkUsers({ fids: [fid] });
    const user = resp.users?.[0];
    if (!user) return null;
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name ?? user.username,
      pfpUrl: user.pfp_url ?? "",
      custodyAddress: user.custody_address ?? "",
      verifiedAddresses: user.verified_addresses?.eth_addresses ?? [],
      followerCount: user.follower_count ?? 0,
    };
  } catch {
    return null;
  }
}

// ── Trending Tokens in /base Channel ─────────────────────────────────────────

/**
 * Extract token symbols trending in the /base Farcaster channel.
 * Returns a set of uppercase symbols (e.g. "DEGEN", "BRETT").
 */
export async function fetchTrendingTokenSymbols(): Promise<Set<string>> {
  const client = getClient();
  const symbols = new Set<string>();
  try {
    const resp = await client.fetchFeedByChannelIds({
      channelIds: ["base"],
      limit: 100,
    });
    const tickerRegex = /\$([A-Z]{2,10})/g;
    for (const cast of resp.casts ?? []) {
      for (const match of cast.text.matchAll(tickerRegex)) {
        symbols.add(match[1]);
      }
    }
  } catch {
    // channel unavailable — return empty set
  }
  return symbols;
}
