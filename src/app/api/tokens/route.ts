// GET /api/tokens — top tokens list

import { NextResponse } from "next/server";
import { MOCK_TOKENS } from "@/lib/mock-data";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
  const sort = searchParams.get("sort") ?? "volume"; // volume | price | change | new

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(MOCK_TOKENS.slice(0, limit));
  }

  const supabase = createServerClient();

  const orderCol =
    sort === "price"
      ? "price_usd"
      : sort === "change"
        ? "change_24h"
        : sort === "new"
          ? "first_seen_at"
          : "volume_24h_usd";

  const { data, error } = await supabase
    .from("tokens")
    .select(
      "address, symbol, name, decimals, price_usd, volume_24h_usd, change_24h, tx_count, total_liquidity_usd, first_seen_at",
    )
    .order(orderCol, { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    (data ?? []).map((t) => ({
      id: t.address,
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals ?? 18,
      priceUSD: t.price_usd,
      volume24hUSD: t.volume_24h_usd,
      change24h: t.change_24h,
      txCount: t.tx_count,
      totalLiquidityUSD: t.total_liquidity_usd,
      firstSeenAt: t.first_seen_at ?? new Date().toISOString(),
    })),
  );
}
