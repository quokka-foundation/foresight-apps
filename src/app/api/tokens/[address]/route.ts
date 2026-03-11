// GET /api/tokens/[address] — token detail with signals + AI insight

import { NextResponse } from "next/server";
import { MOCK_SIGNALS, MOCK_TOKENS } from "@/lib/mock-data";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const addr = address.toLowerCase();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const token = MOCK_TOKENS.find((t) => t.address.toLowerCase() === addr);
    if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const signals = MOCK_SIGNALS.filter((s) => s.tokenAddress.toLowerCase() === addr);
    return NextResponse.json({ ...token, signals });
  }

  const supabase = createServerClient();

  const [{ data: token, error }, { data: signals }, { data: insight }] = await Promise.all([
    supabase.from("tokens").select("*").eq("address", addr).maybeSingle(),
    supabase
      .from("alpha_signals")
      .select(
        "id, signal_type, confidence_score, value_usd, description, detected_at, wallet_addresses",
      )
      .eq("token_address", addr)
      .order("detected_at", { ascending: false })
      .limit(10),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("token_address", addr)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (error || !token) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: token.address,
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals ?? 18,
    priceUSD: token.price_usd,
    volume24hUSD: token.volume_24h_usd,
    change24h: token.change_24h,
    txCount: token.tx_count,
    totalLiquidityUSD: token.total_liquidity_usd,
    firstSeenAt: token.first_seen_at ?? new Date().toISOString(),
    isClanker: token.is_clanker ?? false,
    poolAddress: token.pool_address ?? null,
    signals: (signals ?? []).map((s) => ({
      id: s.id,
      signalType: s.signal_type,
      confidenceScore: s.confidence_score,
      valueUSD: s.value_usd,
      description: s.description,
      detectedAt: s.detected_at,
      walletCount: (s.wallet_addresses ?? []).length,
    })),
    aiInsight: insight
      ? {
          id: insight.id,
          summary: insight.summary,
          keyDrivers: insight.key_drivers,
          riskFactors: insight.risk_factors,
          confidenceScore: insight.confidence_score,
          timeHorizon: insight.time_horizon,
          generatedAt: insight.generated_at,
        }
      : null,
  });
}
