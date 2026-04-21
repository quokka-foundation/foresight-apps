// GET /api/tokens/[address] — proxy to foresight-machine GET /tokens/:address
import { NextResponse } from "next/server";
import { MOCK_TOKENS } from "@/lib/mock-data";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const addr = address.toLowerCase();

  if (!MACHINE_URL) {
    const token = MOCK_TOKENS.find((t) => t.address.toLowerCase() === addr);
    if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(token);
  }

  const upstream = await fetch(`${MACHINE_URL}/tokens/${addr}`, {
    headers: { "x-api-key": process.env.MACHINE_API_KEY ?? "" },
  });
  if (upstream.status === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}
