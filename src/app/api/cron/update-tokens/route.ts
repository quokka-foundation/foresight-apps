// ============================================================
// Cron: Update Tokens — runs every 2 minutes
// GET /api/cron/update-tokens
// ============================================================
// 1. Fetch top tokens by 24h volume from Bitquery
// 2. Upsert into Supabase `tokens` table with latest price/volume
// 3. Calculate 24h price change vs. stored previous price
// ============================================================

import { NextResponse } from "next/server";
import { fetchTopTokens } from "@/lib/bitquery";
import { createServerClient } from "@/lib/supabase-server";

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
    const metrics = await fetchTopTokens();

    if (!metrics.length) {
      return NextResponse.json({ ok: true, upserted: 0, elapsed: Date.now() - started });
    }

    // Load current stored prices for change calculation
    const addresses = metrics.map((m) => m.Trade.Currency.SmartContract.toLowerCase());
    const { data: existing } = await supabase
      .from("tokens")
      .select("address, price_usd")
      .in("address", addresses);

    const prevPriceMap = new Map(
      (existing ?? []).map((t: { address: string; price_usd: number | null }) => [
        t.address,
        t.price_usd ?? 0,
      ]),
    );

    const rows = metrics.map((m) => {
      const address = m.Trade.Currency.SmartContract.toLowerCase();
      const prevPrice = prevPriceMap.get(address) ?? 0;
      const currentPrice = m.Trade.PriceInUSD;
      const change24h = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : null;

      return {
        address,
        symbol: m.Trade.Currency.Symbol,
        name: m.Trade.Currency.Name || m.Trade.Currency.Symbol,
        decimals: 18, // default; override via on-chain if needed
        price_usd: currentPrice,
        volume_24h_usd: m.volumeUSD,
        tx_count: m.tradeCount,
        change_24h: change24h,
        last_updated_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from("tokens").upsert(rows, { onConflict: "address" });

    if (error) {
      console.error("[update-tokens] upsert error:", error.message);
    }

    return NextResponse.json({
      ok: true,
      upserted: rows.length,
      elapsed: Date.now() - started,
    });
  } catch (err) {
    console.error("[update-tokens]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
