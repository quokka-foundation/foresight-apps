// ============================================================
// Foresight — Supabase Server Client
// ============================================================
// Use this ONLY in API routes, cron handlers, and Server Components.
// Uses the service_role key — NEVER import in client components.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Creates a Supabase client with the service_role key that bypasses RLS.
 * Call this inside each API route handler — do not share the instance across requests.
 */
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
