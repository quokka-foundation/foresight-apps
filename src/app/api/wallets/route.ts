// GET /api/wallets — proxy to foresight-machine GET /wallets/smart
import { NextResponse } from "next/server";
import { MOCK_WALLETS } from "@/lib/mock-data";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  if (!MACHINE_URL) {
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
    const minScore = Number(searchParams.get("minScore") ?? "0");
    let results = MOCK_WALLETS;
    if (minScore) results = results.filter((w) => w.smartScore >= minScore);
    return NextResponse.json(results.slice(0, limit));
  }

  const upstream = await fetch(`${MACHINE_URL}/wallets/smart?${searchParams}`, {
    headers: { "x-api-key": process.env.MACHINE_API_KEY ?? "" },
  });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}
