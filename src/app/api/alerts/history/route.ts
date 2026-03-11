// GET /api/alerts/history — alert history for the authenticated user
// Query params: userId (required), limit (default 50)

import { NextResponse } from "next/server";
import { MOCK_ALERT_HISTORY } from "@/lib/mock-data";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  // Fall back to mock data if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(MOCK_ALERT_HISTORY.slice(0, limit));
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("alert_history")
    .select("id, signal_type, message, triggered_at")
    .eq("user_id", userId)
    .order("triggered_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r) => ({
    id: r.id,
    signalType: r.signal_type,
    message: r.message,
    triggeredAt: r.triggered_at,
  }));

  return NextResponse.json(items);
}
