// GET /api/wallets/[address] — proxy to foresight-machine GET /wallets/:address
import { NextResponse } from "next/server";
import { MOCK_WALLETS } from "@/lib/mock-data";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const addr = address.toLowerCase();

  if (!MACHINE_URL) {
    const wallet = MOCK_WALLETS.find((w) => w.address.toLowerCase() === addr);
    if (!wallet) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(wallet);
  }

  const upstream = await fetch(`${MACHINE_URL}/wallets/${addr}`, {
    headers: { "x-api-key": process.env.MACHINE_API_KEY ?? "" },
  });
  if (upstream.status === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}
