// GET /api/tokens/[address]/ohlcv — proxy to foresight-machine GET /tokens/:address/ohlcv
import { NextResponse } from "next/server";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  if (!MACHINE_URL) {
    return NextResponse.json([]);
  }

  const upstream = await fetch(`${MACHINE_URL}/tokens/${address}/ohlcv`, {
    headers: { "x-api-key": process.env.MACHINE_API_KEY ?? "" },
  });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}
