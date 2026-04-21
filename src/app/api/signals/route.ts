// GET /api/signals — proxy to foresight-machine GET /alpha/feed
import { NextResponse } from "next/server";
import { MOCK_SIGNALS } from "@/lib/mock-data";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  if (!MACHINE_URL) {
    let results = MOCK_SIGNALS;
    const type = searchParams.get("type");
    const minConfidence = Number(searchParams.get("minConfidence") ?? "0");
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
    if (type) results = results.filter((s) => s.signalType === type);
    if (minConfidence) results = results.filter((s) => s.confidenceScore >= minConfidence);
    return NextResponse.json(results.slice(0, limit));
  }

  const upstream = await fetch(`${MACHINE_URL}/alpha/feed?${searchParams}`, {
    headers: { "x-api-key": process.env.MACHINE_API_KEY ?? "" },
  });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}
