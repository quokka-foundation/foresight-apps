// ============================================================
// Foresight Mini App — Notification Token Store (Supabase)
// ============================================================
// Replaces in-memory Map with persistent Supabase storage.
// Compatible with Edge Runtime — uses fetch-based Supabase JS client.

import { createClient } from "@supabase/supabase-js";

interface NotificationDetails {
  url: string;
  token: string;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    // Service role bypasses RLS — safe in server/edge API routes only
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function getUserNotificationDetails(fid: number): Promise<NotificationDetails | null> {
  // Graceful no-op when Supabase is not configured (dev without .env)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const { data } = await getSupabase()
    .from("notification_tokens")
    .select("url, token")
    .eq("fid", fid)
    .maybeSingle();

  if (!data) return null;
  return { url: data.url, token: data.token };
}

export async function setUserNotificationDetails(
  fid: number,
  details: NotificationDetails,
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  await getSupabase()
    .from("notification_tokens")
    .upsert({ fid, url: details.url, token: details.token }, { onConflict: "fid" });
}

export async function deleteUserNotificationDetails(fid: number): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  await getSupabase().from("notification_tokens").delete().eq("fid", fid);
}
