// ============================================================
// Cron: Score Wallets — runs every 5 minutes
// GET /api/cron/score-wallets
// ============================================================
// For each wallet that appeared in recent signals, fetch their
// trade history from Bitquery and (re)calculate the smart score.
// ============================================================

import { NextResponse } from "next/server";
import { fetchWalletTrades } from "@/lib/bitquery";
import { createServerClient } from "@/lib/supabase-server";
import { calculateSmartScore, classifyWallet, type WalletTradeRecord } from "@/lib/wallet-scorer";

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

  const supabase = createServerClient();
  const started = Date.now();

  try {
    // Collect wallet addresses from signals in the last 30 min
    const { data: recentSignals } = await supabase
      .from("alpha_signals")
      .select("wallet_addresses")
      .gte("detected_at", new Date(Date.now() - 30 * 60_000).toISOString())
      .limit(200);

    // Flatten and deduplicate
    const walletSet = new Set<string>();
    for (const row of recentSignals ?? []) {
      for (const addr of row.wallet_addresses ?? []) {
        walletSet.add((addr as string).toLowerCase());
      }
    }

    // Also include any wallets due for re-scoring (not updated in 6h)
    const { data: staleWallets } = await supabase
      .from("smart_wallets")
      .select("address")
      .or(
        `last_scored_at.is.null,last_scored_at.lt.${new Date(Date.now() - 6 * 60 * 60_000).toISOString()}`,
      )
      .limit(20);

    for (const w of staleWallets ?? []) {
      walletSet.add((w.address as string).toLowerCase());
    }

    if (!walletSet.size) {
      return NextResponse.json({ ok: true, scored: 0, elapsed: Date.now() - started });
    }

    const wallets = [...walletSet].slice(0, 30); // cap per run to avoid timeout

    let scored = 0;
    await Promise.all(
      wallets.map(async (address) => {
        try {
          const rawTrades = await fetchWalletTrades(address, 30);

          const records: WalletTradeRecord[] = rawTrades.map((t) => ({
            tokenAddress: t.Trade.Currency.SmartContract.toLowerCase(),
            type: t.Trade.Buyer.toLowerCase() === address ? "buy" : "sell",
            amountUSD: t.Trade.AmountInUSD,
            timestamp: t.Block.Time,
            priceAtTrade: t.Trade.Amount > 0 ? t.Trade.AmountInUSD / t.Trade.Amount : 0,
          }));

          const { smartScore, winRate, avgPnlPercent } = calculateSmartScore(records);
          const clusterType = classifyWallet(records);
          const totalVolumeUSD = records.reduce((s, r) => s + r.amountUSD, 0);

          await supabase.from("smart_wallets").upsert(
            {
              address,
              smart_score: smartScore,
              win_rate: winRate,
              avg_pnl_percent: avgPnlPercent,
              cluster_type: clusterType,
              total_volume_usd: totalVolumeUSD,
              trade_count: records.length,
              last_scored_at: new Date().toISOString(),
            },
            { onConflict: "address" },
          );

          scored++;
        } catch (err) {
          console.warn(`[score-wallets] failed for ${address}:`, err);
        }
      }),
    );

    return NextResponse.json({ ok: true, scored, elapsed: Date.now() - started });
  } catch (err) {
    console.error("[score-wallets]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
