// GET /api/alerts/history — proxy to foresight-machine GET /alerts/history
import { NextResponse } from "next/server";
import { MOCK_ALERT_HISTORY } from "@/lib/mock-data";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  if (!MACHINE_URL) {
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
    return NextResponse.json(MOCK_ALERT_HISTORY.slice(0, limit));
  }

  const upstream = await fetch(`${MACHINE_URL}/alerts/history?${searchParams}`, {
    headers: { "x-api-key": process.env.MACHINE_API_KEY ?? "" },
  });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}
