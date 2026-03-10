import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message, support: "https://x.com/foresight" }, { status });
}

/**
 * Stub trade route for the alpha intelligence platform.
 * In the future this will handle signal-based trade execution.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signalId, action, amount } = body;

    if (!signalId || !action || !amount) {
      return errorResponse("Missing required fields: signalId, action, amount", 400);
    }

    if (amount <= 0 || amount > 10_000) {
      return errorResponse("Amount must be between $1 and $10,000", 400);
    }

    // Demo mode: return simulated trade result
    const hash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("")}`;

    return NextResponse.json({
      success: true,
      demo: true,
      trade: {
        hash,
        tradeId: Math.floor(Math.random() * 100000),
        signalId,
        action,
        amount,
        timestamp: Date.now(),
      },
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
