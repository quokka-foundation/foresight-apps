// ============================================================
// Cron: Generate AI Summaries — runs every minute
// GET /api/cron/generate-summaries
// ============================================================
// Picks the latest unsummarised high-confidence signals and
// generates AI insights + updates the description field.
// ============================================================

import { NextResponse } from "next/server";
import { generateSignalDescriptions, generateSignalInsight } from "@/lib/openai";
import { createServerClient } from "@/lib/supabase-server";
import type { AlphaSignal } from "@/lib/types";

function verifyCronSecret(req: Request): boolean {
  const authHeader = req.headers.get("Authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return authHeader === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Skip if no OpenAI key — don't fail the cron
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ok: true, skipped: "no OPENAI_API_KEY", processed: 0 });
  }

  const supabase = createServerClient();
  const started = Date.now();

  try {
    // ── 1. Find signals without AI summaries ─────────────────────────────────
    const { data: rawSignals } = await supabase
      .from("alpha_signals")
      .select("*")
      .is("ai_summary", null)
      .gte("confidence_score", 60)
      .order("detected_at", { ascending: false })
      .limit(10);

    if (!rawSignals?.length) {
      return NextResponse.json({ ok: true, processed: 0, elapsed: Date.now() - started });
    }

    // Map DB rows to AlphaSignal type
    const signals: AlphaSignal[] = rawSignals.map(
      (r: {
        id: string;
        signal_type: string;
        token_address: string;
        token_symbol: string | null;
        confidence_score: number;
        wallet_addresses: string[];
        block_number: number;
        value_usd: number | null;
        description: string | null;
        social_mentions: number | null;
        metadata: Record<string, unknown>;
        detected_at: string;
      }) => ({
        id: r.id,
        signalType: r.signal_type as AlphaSignal["signalType"],
        tokenAddress: r.token_address,
        tokenSymbol: r.token_symbol ?? undefined,
        confidenceScore: r.confidence_score,
        walletAddresses: r.wallet_addresses ?? [],
        blockNumber: r.block_number,
        valueUSD: r.value_usd ?? undefined,
        description: r.description ?? undefined,
        socialMentions: r.social_mentions ?? 0,
        metadata: r.metadata ?? {},
        detectedAt: r.detected_at,
      }),
    );

    // ── 2. Generate one-liner descriptions for any missing ───────────────────
    const missingDesc = signals.filter((s) => !s.description);
    if (missingDesc.length) {
      const descMap = await generateSignalDescriptions(missingDesc);
      for (const [id, description] of descMap) {
        await supabase.from("alpha_signals").update({ description }).eq("id", id);
      }
      // Patch local copy for full insight generation below
      for (const s of missingDesc) {
        const d = descMap.get(s.id);
        if (d) s.description = d;
      }
    }

    // ── 3. Generate full AI insights (store in ai_insights table) ───────────
    let processed = 0;
    for (const signal of signals) {
      try {
        const insight = await generateSignalInsight(signal);

        // Persist insight
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

        // Mark signal as having a summary
        await supabase
          .from("alpha_signals")
          .update({ ai_summary: insight.summary })
          .eq("id", signal.id);

        processed++;
      } catch (err) {
        console.warn(`[generate-summaries] failed for signal ${signal.id}:`, err);
      }
    }

    return NextResponse.json({ ok: true, processed, elapsed: Date.now() - started });
  } catch (err) {
    console.error("[generate-summaries]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
