// POST /api/ai/summarize — on-demand AI insight generation
// Body: { signalId: string } or { tokenAddress: string }
// Requires valid JWT (auth header)

import { NextResponse } from "next/server";
import { generateSignalInsight } from "@/lib/openai";
import { createServerClient } from "@/lib/supabase-server";
import type { AlphaSignal } from "@/lib/types";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI summaries not configured" }, { status: 503 });
  }

  let body: { signalId?: string; tokenAddress?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { signalId, tokenAddress } = body;
  if (!signalId && !tokenAddress) {
    return NextResponse.json({ error: "Provide signalId or tokenAddress" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Resolve the signal to summarise
  let signal: AlphaSignal | null = null;

  if (signalId) {
    const { data } = await supabase
      .from("alpha_signals")
      .select("*")
      .eq("id", signalId)
      .maybeSingle();
    if (data) {
      signal = {
        id: data.id,
        signalType: data.signal_type,
        tokenAddress: data.token_address,
        tokenSymbol: data.token_symbol ?? undefined,
        confidenceScore: data.confidence_score,
        walletAddresses: data.wallet_addresses ?? [],
        blockNumber: data.block_number,
        valueUSD: data.value_usd ?? undefined,
        description: data.description ?? undefined,
        socialMentions: data.social_mentions ?? 0,
        metadata: data.metadata ?? {},
        detectedAt: data.detected_at,
      };
    }
  } else if (tokenAddress) {
    // Use the most recent signal for this token
    const { data } = await supabase
      .from("alpha_signals")
      .select("*")
      .eq("token_address", tokenAddress.toLowerCase())
      .order("detected_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      signal = {
        id: data.id,
        signalType: data.signal_type,
        tokenAddress: data.token_address,
        tokenSymbol: data.token_symbol ?? undefined,
        confidenceScore: data.confidence_score,
        walletAddresses: data.wallet_addresses ?? [],
        blockNumber: data.block_number,
        valueUSD: data.value_usd ?? undefined,
        description: data.description ?? undefined,
        socialMentions: data.social_mentions ?? 0,
        metadata: data.metadata ?? {},
        detectedAt: data.detected_at,
      };
    }
  }

  if (!signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  try {
    const insight = await generateSignalInsight(signal);

    // Persist
    await supabase.from("ai_insights").upsert(
      {
        id: insight.id,
        signal_id: insight.signalId ?? null,
        token_address: insight.tokenAddress ?? null,
        summary: insight.summary,
        key_drivers: insight.keyDrivers,
        risk_factors: insight.riskFactors,
        confidence_score: insight.confidenceScore,
        time_horizon: insight.timeHorizon,
        generated_at: insight.generatedAt,
      },
      { onConflict: "id" },
    );

    return NextResponse.json(insight);
  } catch (err) {
    console.error("[ai/summarize]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
