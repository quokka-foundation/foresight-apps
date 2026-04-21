// GET /api/users — proxy to foresight-machine GET /users/:id or GET /users/wallet/:address
// POST /api/users — proxy to foresight-machine POST /users
import { NextResponse } from "next/server";

const MACHINE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const id = searchParams.get("id");

  if (!wallet && !id) {
    return NextResponse.json({ error: "Provide id or wallet query param" }, { status: 400 });
  }

  if (!MACHINE_URL) {
    return NextResponse.json({
      id: "dev-user",
      walletAddress: wallet ?? null,
      subscriptionTier: "free",
      fid: null,
      createdAt: new Date().toISOString(),
    });
  }

  const url = wallet
    ? `${MACHINE_URL}/users/wallet/${wallet.toLowerCase()}`
    : `${MACHINE_URL}/users/${id}`;

  const upstream = await fetch(url, {
    headers: { "x-api-key": process.env.MACHINE_API_KEY ?? "" },
  });
  if (upstream.status === 404)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!upstream.ok)
    return NextResponse.json({ error: "upstream error" }, { status: upstream.status });
  return NextResponse.json(await upstream.json());
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!MACHINE_URL) {
    return NextResponse.json({ id: "dev-user", subscriptionTier: "free" });
  }

  const upstream = await fetch(`${MACHINE_URL}/users`, {
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
