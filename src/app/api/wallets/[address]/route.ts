// GET /api/wallets/[address] — wallet detail with recent signals

import { NextResponse } from "next/server";
import { MOCK_WALLETS } from "@/lib/mock-data";
import { fetchUserByWallet } from "@/lib/neynar";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const addr = address.toLowerCase();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const wallet = MOCK_WALLETS.find((w) => w.address.toLowerCase() === addr);
    if (!wallet) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(wallet);
  }

  const supabase = createServerClient();

  const [{ data: wallet, error }, { data: signals }, farcasterUser] = await Promise.all([
    supabase.from("smart_wallets").select("*").eq("address", addr).maybeSingle(),
    supabase
      .from("alpha_signals")
      .select(
        "id, signal_type, token_address, token_symbol, confidence_score, value_usd, description, detected_at",
      )
      .contains("wallet_addresses", [addr])
      .order("detected_at", { ascending: false })
      .limit(20),
    fetchUserByWallet(addr).catch(() => null),
  ]);

  if (error || !wallet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: wallet.address,
    address: wallet.address,
    smartScore: wallet.smart_score,
    clusterType: wallet.cluster_type,
    labels: wallet.labels ?? [],
    totalVolumeUSD: wallet.total_volume_usd,
    tradeCount: wallet.trade_count,
    winRate: wallet.win_rate,
    avgPnlPercent: wallet.avg_pnl_percent,
    farcaster: farcasterUser,
    recentSignals: (signals ?? []).map((s) => ({
      id: s.id,
      signalType: s.signal_type,
      tokenAddress: s.token_address,
      tokenSymbol: s.token_symbol,
      confidenceScore: s.confidence_score,
      valueUSD: s.value_usd,
      description: s.description,
      detectedAt: s.detected_at,
    })),
  });
}
