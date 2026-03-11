// GET /api/signals/[id] — single signal detail with AI insight

import { NextResponse } from "next/server";
import { MOCK_SIGNALS } from "@/lib/mock-data";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const signal = MOCK_SIGNALS.find((s) => s.id === id);
    if (!signal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(signal);
  }

  const supabase = createServerClient();

  const [{ data: signal, error }, { data: insight }] = await Promise.all([
    supabase.from("alpha_signals").select("*").eq("id", id).maybeSingle(),
    supabase.from("ai_insights").select("*").eq("signal_id", id).maybeSingle(),
  ]);

  if (error || !signal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: signal.id,
    signalType: signal.signal_type,
    tokenAddress: signal.token_address,
    tokenSymbol: signal.token_symbol,
    confidenceScore: signal.confidence_score,
    walletAddresses: signal.wallet_addresses ?? [],
    blockNumber: signal.block_number,
    valueUSD: signal.value_usd,
    description: signal.description,
    aiSummary: signal.ai_summary,
    socialMentions: signal.social_mentions,
    metadata: signal.metadata ?? {},
    detectedAt: signal.detected_at,
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
