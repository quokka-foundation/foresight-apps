// GET /api/users/[id] — fetch user profile by ID or wallet address
// GET /api/users?wallet=0x... — look up by wallet address

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const id = searchParams.get("id");

  if (!wallet && !id) {
    return NextResponse.json({ error: "Provide id or wallet query param" }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Dev stub
    return NextResponse.json({
      id: "dev-user",
      walletAddress: wallet ?? null,
      subscriptionTier: "free",
      fid: null,
      createdAt: new Date().toISOString(),
    });
  }

  const supabase = createServerClient();

  let query = supabase
    .from("users")
    .select("id, wallet_address, subscription_tier, fid, created_at");

  if (wallet) {
    query = query.eq("wallet_address", wallet.toLowerCase());
  } else if (id) {
    query = query.eq("id", id);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    walletAddress: data.wallet_address,
    subscriptionTier: data.subscription_tier ?? "free",
    fid: data.fid ?? null,
    createdAt: data.created_at,
  });
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ id: "dev-user", subscriptionTier: "free" });
  }

  let body: { walletAddress?: string; fid?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        wallet_address: body.walletAddress?.toLowerCase() ?? null,
        fid: body.fid ?? null,
        subscription_tier: "free",
        created_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" },
    )
    .select("id, wallet_address, subscription_tier, fid, created_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to create user" }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    walletAddress: data.wallet_address,
    subscriptionTier: data.subscription_tier,
    fid: data.fid,
    createdAt: data.created_at,
  });
}
