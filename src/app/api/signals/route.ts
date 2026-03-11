// GET /api/signals — paginated alpha signal list
// Query params: limit, cursor, type (SignalType filter), minConfidence

import { NextResponse } from "next/server";
import { MOCK_SIGNALS } from "@/lib/mock-data";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
  const cursor = searchParams.get("cursor"); // ISO timestamp — used for keyset pagination
  const type = searchParams.get("type");
  const minConfidence = Number(searchParams.get("minConfidence") ?? "0");

  // Fall back to mock data if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    let results = MOCK_SIGNALS;
    if (type) results = results.filter((s) => s.signalType === type);
    if (minConfidence) results = results.filter((s) => s.confidenceScore >= minConfidence);
    return NextResponse.json(results.slice(0, limit));
  }

  const supabase = createServerClient();
  let query = supabase
    .from("alpha_signals")
    .select(
      "id, signal_type, token_address, token_symbol, confidence_score, wallet_addresses, block_number, value_usd, description, ai_summary, social_mentions, metadata, detected_at",
    )
    .order("detected_at", { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt("detected_at", cursor);
  if (type) query = query.eq("signal_type", type);
  if (minConfidence) query = query.gte("confidence_score", minConfidence);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const signals = (data ?? []).map((r) => ({
    id: r.id,
    signalType: r.signal_type,
    tokenAddress: r.token_address,
    tokenSymbol: r.token_symbol,
    confidenceScore: r.confidence_score,
    walletAddresses: r.wallet_addresses ?? [],
    blockNumber: r.block_number,
    valueUSD: r.value_usd,
    description: r.description,
    aiSummary: r.ai_summary,
    socialMentions: r.social_mentions,
    metadata: r.metadata ?? {},
    detectedAt: r.detected_at,
  }));

  return NextResponse.json(signals);
}
