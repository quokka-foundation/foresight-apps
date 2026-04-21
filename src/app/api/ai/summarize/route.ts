// POST /api/ai/summarize — proxy to foresight-machine POST /ai/generate
import { NextResponse } from "next/server";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!MACHINE_URL) {
    // Dev stub: return a minimal AiInsight shape
    return NextResponse.json({
      id: "mock-insight",
      summary: "Mock AI insight for development",
      keyDrivers: ["Smart money accumulation", "Low float token"],
      riskFactors: ["Early stage token", "Limited liquidity"],
      confidenceScore: 72,
      timeHorizon: "short",
    });
  }

  const upstream = await fetch(`${MACHINE_URL}/ai/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.MACHINE_API_KEY ?? "",
    },
    body: JSON.stringify(body),
  });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}
