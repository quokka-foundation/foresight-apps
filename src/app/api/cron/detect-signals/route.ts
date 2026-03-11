// ============================================================
// Cron: Detect Alpha Signals — runs every minute
// POST /api/cron/detect-signals
// ============================================================
// 1. Fetch recent DEX trades from Bitquery
// 2. Run all 5 signal classifiers
// 3. Enrich with social mention counts from Neynar
// 4. Persist new signals to Supabase
// 5. Broadcast push notifications for high-confidence signals
// ============================================================

import { NextResponse } from "next/server";
import { fetchClankerLaunches, fetchNewPools, fetchRecentTrades } from "@/lib/bitquery";
import { getUserNotificationDetails } from "@/lib/kv";
import { fetchBatchMentionCounts } from "@/lib/neynar";
import { sendFrameNotification } from "@/lib/notifs";
import {
  detectCoordinatedCluster,
  detectEarlyMomentum,
  detectLiquiditySurge,
  detectSmartMoneyEntry,
  detectWhaleEntry,
} from "@/lib/signal-classifier";
import { createServerClient } from "@/lib/supabase-server";
import type { AlphaSignal } from "@/lib/types";

// Verify this is called by Vercel Cron (or dev secret)
function verifyCronSecret(req: Request): boolean {
  const authHeader = req.headers.get("Authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev: allow unauthenticated
  return authHeader === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const started = Date.now();

  try {
    // ── 1. Fetch Data ───────────────────────────────────────────────────────
    const [trades, poolEvents, clankerLaunches] = await Promise.all([
      fetchRecentTrades(5),
      fetchNewPools(10),
      fetchClankerLaunches(10),
    ]);

    // ── 2. Load smart wallets from DB for SMART_MONEY_ENTRY detection ───────
    const { data: dbWallets } = await supabase
      .from("smart_wallets")
      .select("address, smart_score")
      .gte("smart_score", 70)
      .limit(500);

    const smartWalletMap = new Map<string, number>(
      (dbWallets ?? []).map((w: { address: string; smart_score: number }) => [
        w.address.toLowerCase(),
        w.smart_score,
      ]),
    );

    // ── 3. Build helpers needed by classifiers ───────────────────────────────
    const clankerSet = new Set(
      clankerLaunches
        .flatMap((e) => e.Arguments)
        .filter((a) => a.Name === "tokenAddress")
        .map((a) => (a.Value?.address ?? "").toLowerCase()),
    );

    // Empty maps for liquidity / price data — these get populated by update-tokens cron
    const emptyTvls = new Map<string, number>();
    const emptyPrices = new Map<string, number>();

    // ── 4. Run classifiers ───────────────────────────────────────────────────
    const raw: AlphaSignal[] = [
      ...detectSmartMoneyEntry(trades, smartWalletMap),
      ...detectWhaleEntry(trades, emptyTvls),
      ...detectLiquiditySurge(poolEvents, emptyTvls, emptyTvls),
      ...detectEarlyMomentum(trades, emptyPrices, emptyTvls, clankerSet),
      ...detectCoordinatedCluster(trades, new Map()),
    ];

    if (!raw.length) {
      return NextResponse.json({ ok: true, inserted: 0, elapsed: Date.now() - started });
    }

    // ── 5. Enrich with social mention counts ─────────────────────────────────
    const uniqueTokens = [
      ...new Map(
        raw.map((s) => [s.tokenAddress, { address: s.tokenAddress, symbol: s.tokenSymbol ?? "" }]),
      ).values(),
    ];
    const mentionMap = await fetchBatchMentionCounts(uniqueTokens, 60);

    const enriched = raw.map((s) => ({
      ...s,
      socialMentions: mentionMap.get(s.tokenAddress) ?? 0,
    }));

    // ── 6. Dedup: skip signals already in DB for this token + type ──────────
    const { data: recent } = await supabase
      .from("alpha_signals")
      .select("token_address, signal_type")
      .gte("detected_at", new Date(Date.now() - 15 * 60_000).toISOString());

    const existingSet = new Set(
      (recent ?? []).map(
        (r: { token_address: string; signal_type: string }) =>
          `${r.signal_type}:${r.token_address}`,
      ),
    );

    const newSignals = enriched.filter(
      (s) => !existingSet.has(`${s.signalType}:${s.tokenAddress}`),
    );

    if (!newSignals.length) {
      return NextResponse.json({ ok: true, inserted: 0, elapsed: Date.now() - started });
    }

    // ── 7. Insert into Supabase ──────────────────────────────────────────────
    const rows = newSignals.map((s) => ({
      id: s.id,
      signal_type: s.signalType,
      token_address: s.tokenAddress,
      token_symbol: s.tokenSymbol ?? null,
      confidence_score: s.confidenceScore,
      wallet_addresses: s.walletAddresses,
      block_number: s.blockNumber,
      value_usd: s.valueUSD ?? null,
      description: s.description ?? null,
      social_mentions: s.socialMentions ?? 0,
      metadata: s.metadata,
      detected_at: s.detectedAt,
    }));

    const { error: insertError } = await supabase
      .from("alpha_signals")
      .upsert(rows, { onConflict: "id" });

    if (insertError) {
      console.error("[detect-signals] insert error:", insertError.message);
    }

    // ── 8. Push notifications for critical signals (confidence ≥ 80) ────────
    const criticalSignals = newSignals.filter((s) => s.confidenceScore >= 80);
    if (criticalSignals.length) {
      // Get all stored notification tokens
      const { data: subs } = await supabase.from("notification_tokens").select("fid").limit(1000);

      for (const sub of subs ?? []) {
        const details = await getUserNotificationDetails(sub.fid);
        if (!details) continue;
        const signal = criticalSignals[0];
        await sendFrameNotification({
          fid: sub.fid,
          title: `${signal.signalType.replace(/_/g, " ")} — ${signal.tokenSymbol ?? signal.tokenAddress.slice(0, 8)}`,
          body: signal.description ?? `${signal.confidenceScore}% confidence`,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      inserted: newSignals.length,
      elapsed: Date.now() - started,
    });
  } catch (err) {
    console.error("[detect-signals]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
