// GET /api/signals/[id] — proxy to foresight-machine GET /alpha/:id
import { NextResponse } from "next/server";
import { MOCK_SIGNALS } from "@/lib/mock-data";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!MACHINE_URL) {
    const signal = MOCK_SIGNALS.find((s) => s.id === id);
    if (!signal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(signal);
  }

  const upstream = await fetch(`${MACHINE_URL}/alpha/${id}`, {
    headers: { "x-api-key": process.env.MACHINE_API_KEY ?? "" },
  });
  if (upstream.status === 404) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}
