// ============================================================
// Foresight — OpenAI Client
// ============================================================
// Server-side only. Generates AI summaries for alpha signals
// and market narratives. Uses gpt-4o-mini for cost efficiency.

import OpenAI from "openai";
import type { AiInsight, AlphaSignal, Token } from "./types";

// Module-level singleton — lazily initialised on first call.
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const SIGNAL_SYSTEM_PROMPT = `You are a sharp, concise on-chain analyst for a Farcaster mini-app. 
Your audience is crypto-native traders who value speed and precision.
Respond ONLY with a JSON object matching the exact schema requested.
No markdown, no code fences, no commentary outside the JSON.`;

const MARKET_SYSTEM_PROMPT = `You are a senior on-chain market analyst. 
Be concise, data-driven, and avoid hype. 
Respond ONLY with a JSON object matching the exact schema requested.`;

// ── Signal Summary ────────────────────────────────────────────────────────────

/**
 * Generate an AI insight for a single alpha signal.
 * Returns a full AiInsight object.
 */
export async function generateSignalInsight(signal: AlphaSignal): Promise<AiInsight> {
  const client = getClient();

  const prompt = `Generate an AI insight for this on-chain signal detected on Base L2:

Signal Type: ${signal.signalType}
Token: ${signal.tokenSymbol ?? signal.tokenAddress}
Value: $${signal.valueUSD?.toLocaleString() ?? "unknown"}
Confidence: ${signal.confidenceScore}%
Description: ${signal.description ?? "N/A"}
Wallets involved: ${signal.walletAddresses.length}
Social mentions: ${signal.socialMentions ?? 0}
Metadata: ${JSON.stringify(signal.metadata)}

Return JSON with this exact schema:
{
  "summary": "2-3 sentence plain-English explanation of what this signal means for traders",
  "keyDrivers": ["driver 1", "driver 2", "driver 3"],
  "riskFactors": ["risk 1", "risk 2"],
  "confidenceScore": <integer 0-100>,
  "timeHorizon": "<1H|4H|1D|3D>"
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SIGNAL_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 400,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  let parsed: {
    summary?: string;
    keyDrivers?: string[];
    riskFactors?: string[];
    confidenceScore?: number;
    timeHorizon?: string;
  };

  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  return {
    id: `insight-${signal.id}`,
    summary:
      parsed.summary ??
      `${signal.signalType} detected for ${signal.tokenSymbol ?? signal.tokenAddress}`,
    keyDrivers: parsed.keyDrivers ?? [],
    riskFactors: parsed.riskFactors ?? ["Limited data available"],
    confidenceScore: parsed.confidenceScore ?? signal.confidenceScore,
    timeHorizon: parsed.timeHorizon ?? "1D",
    signalId: signal.id,
    tokenAddress: signal.tokenAddress,
    generatedAt: new Date().toISOString(),
  };
}

// ── Batch Signal Summaries ────────────────────────────────────────────────────

/**
 * Generate short one-liner descriptions for a batch of signals.
 * Used to backfill the `description` field on newly detected signals.
 * Returns a map of signalId → description string.
 */
export async function generateSignalDescriptions(
  signals: AlphaSignal[],
): Promise<Map<string, string>> {
  if (!signals.length) return new Map();
  const client = getClient();

  const prompt = `For each of these on-chain signals on Base L2, write a single crisp sentence (max 120 chars) suitable for a push notification.

Signals:
${signals
  .map(
    (s, i) =>
      `${i + 1}. [${s.id}] ${s.signalType} | ${s.tokenSymbol ?? s.tokenAddress} | $${s.valueUSD?.toLocaleString() ?? "?"} | ${s.walletAddresses.length} wallets`,
  )
  .join("\n")}

Return JSON:
{
  "descriptions": { "<signalId>": "<one-line description>" }
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SIGNAL_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 600,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  let parsed: { descriptions?: Record<string, string> };

  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const map = new Map<string, string>();
  for (const [id, desc] of Object.entries(parsed.descriptions ?? {})) {
    map.set(id, desc);
  }
  return map;
}

// ── Market Narrative ──────────────────────────────────────────────────────────

export interface MarketNarrative {
  title: string;
  summary: string;
  sentiment: "bullish" | "neutral" | "bearish";
  topThemes: string[];
  generatedAt: string;
}

/**
 * Generate a market-wide narrative from top tokens and recent signals.
 */
export async function generateMarketNarrative(
  topTokens: Token[],
  recentSignalCount: number,
  dominantSignalType: string,
): Promise<MarketNarrative> {
  const client = getClient();

  const tokenList = topTokens
    .slice(0, 10)
    .map(
      (t) =>
        `${t.symbol} (${t.change24h != null ? `${t.change24h > 0 ? "+" : ""}${t.change24h.toFixed(1)}% 24h` : "??"})`,
    )
    .join(", ");

  const prompt = `Summarise the current market narrative on Base L2 based on:
- Top tokens by 24h volume: ${tokenList || "N/A"}
- Recent signal detections: ${recentSignalCount} in last hour
- Dominant signal type: ${dominantSignalType}

Return JSON:
{
  "title": "<6-8 word headline>",
  "summary": "<2-3 sentences describing current market conditions on Base>",
  "sentiment": "<bullish|neutral|bearish>",
  "topThemes": ["theme1", "theme2", "theme3"]
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: MARKET_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  let parsed: {
    title?: string;
    summary?: string;
    sentiment?: "bullish" | "neutral" | "bearish";
    topThemes?: string[];
  };

  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  return {
    title: parsed.title ?? "Base L2 Market Update",
    summary: parsed.summary ?? "Market activity is ongoing on Base L2.",
    sentiment: parsed.sentiment ?? "neutral",
    topThemes: parsed.topThemes ?? [],
    generatedAt: new Date().toISOString(),
  };
}
