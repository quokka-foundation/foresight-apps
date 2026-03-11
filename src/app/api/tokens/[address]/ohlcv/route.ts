// GET /api/tokens/[address]/ohlcv — OHLCV bars for TradingView chart
// Query params: resolution (1H|1D|1W|1M|ALL), limit

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { OHLCVBar } from "@/lib/types";

// Generate mock OHLCV bars for dev (when Supabase is not configured)
function generateMockOHLCV(resolution: string, count: number): OHLCVBar[] {
  const bars: OHLCVBar[] = [];
  const intervalSeconds: Record<string, number> = {
    "1H": 3600,
    "1D": 86400,
    "1W": 604800,
    "1M": 2592000,
    ALL: 86400,
  };
  const interval = intervalSeconds[resolution] ?? 3600;
  let price = 0.0001 + Math.random() * 0.01;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count; i > 0; i--) {
    const change = (Math.random() - 0.48) * 0.1;
    const open = price;
    const close = Math.max(0.000001, price * (1 + change));
    const high = Math.max(open, close) * (1 + Math.random() * 0.05);
    const low = Math.min(open, close) * (1 - Math.random() * 0.05);
    bars.push({
      time: now - i * interval,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1_000_000,
    });
    price = close;
  }
  return bars;
}

export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const addr = address.toLowerCase();
  const { searchParams } = new URL(req.url);
  const resolution = searchParams.get("resolution") ?? "1D";
  const limit = Math.min(Number(searchParams.get("limit") ?? "100"), 500);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(generateMockOHLCV(resolution, limit));
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("ohlcv_bars")
    .select("time, open, high, low, close, volume")
    .eq("token_address", addr)
    .eq("resolution", resolution)
    .order("time", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fall back to mock if no data yet
  if (!data?.length) {
    return NextResponse.json(generateMockOHLCV(resolution, limit));
  }

  return NextResponse.json(data);
}
