// GET /api/wallets — top smart wallets ordered by smart score

import { NextResponse } from "next/server";
import { MOCK_WALLETS } from "@/lib/mock-data";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
  const minScore = Number(searchParams.get("minScore") ?? "0");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    let results = MOCK_WALLETS;
    if (minScore) results = results.filter((w) => w.smartScore >= minScore);
    return NextResponse.json(results.slice(0, limit));
  }

  const supabase = createServerClient();
  let query = supabase
    .from("smart_wallets")
    .select(
      "address, smart_score, cluster_type, labels, total_volume_usd, trade_count, win_rate, avg_pnl_percent",
    )
    .order("smart_score", { ascending: false })
    .limit(limit);

  if (minScore) query = query.gte("smart_score", minScore);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    (data ?? []).map((w) => ({
      id: w.address,
      address: w.address,
      smartScore: w.smart_score,
      clusterType: w.cluster_type,
      labels: w.labels ?? [],
      totalVolumeUSD: w.total_volume_usd,
      tradeCount: w.trade_count,
      winRate: w.win_rate,
      avgPnlPercent: w.avg_pnl_percent,
    })),
  );
}
