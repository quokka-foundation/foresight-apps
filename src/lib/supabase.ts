// ============================================================
// Foresight — Supabase Browser Client
// ============================================================
// Use this in Client Components ("use client") and browser-side code.
// Uses the public anon key — safe to expose.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Single browser-side client instance (module-level singleton)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});
