"use client";

// ============================================================
// useSignalFeed — Supabase Realtime live signal subscription
// ============================================================
// Subscribes to INSERT events on the alpha_signals table.
// New signals are prepended to the list (max 100 kept in memory).
// Falls back to a periodic poll when Supabase is not configured.

import { useEffect, useRef, useState } from "react";
import { MOCK_SIGNALS } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { AlphaSignal } from "@/lib/types";

function dbRowToSignal(r: Record<string, unknown>): AlphaSignal {
  return {
    id: r.id as string,
    signalType: r.signal_type as AlphaSignal["signalType"],
    tokenAddress: r.token_address as string,
    tokenSymbol: (r.token_symbol as string | null) ?? undefined,
    confidenceScore: r.confidence_score as number,
    walletAddresses: (r.wallet_addresses as string[]) ?? [],
    blockNumber: r.block_number as number,
    valueUSD: (r.value_usd as number | null) ?? undefined,
    description: (r.description as string | null) ?? undefined,
    aiSummary: (r.ai_summary as string | null) ?? undefined,
    socialMentions: (r.social_mentions as number | null) ?? 0,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    detectedAt: r.detected_at as string,
  };
}

export interface UseSignalFeedOptions {
  /** Only receive signals of these types. Empty = all. */
  signalTypes?: AlphaSignal["signalType"][];
  /** Minimum confidence score to show (0–100). */
  minConfidence?: number;
  /** Max signals to keep in the list. Default 100. */
  maxItems?: number;
}

export function useSignalFeed(options: UseSignalFeedOptions = {}) {
  const { signalTypes = [], minConfidence = 0, maxItems = 100 } = options;

  const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  const [signals, setSignals] = useState<AlphaSignal[]>(isConfigured ? [] : MOCK_SIGNALS);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!isConfigured) return;

    // Initial fetch
    const fetchInitial = async () => {
      let query = supabase
        .from("alpha_signals")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(maxItems);

      if (signalTypes.length) query = query.in("signal_type", signalTypes);
      if (minConfidence) query = query.gte("confidence_score", minConfidence);

      const { data } = await query;
      if (data) setSignals(data.map(dbRowToSignal));
    };

    fetchInitial();

    // Subscribe to real-time INSERTs
    const channel = supabase
      .channel("alpha_signals_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alpha_signals" },
        (payload) => {
          const newSignal = dbRowToSignal(payload.new as Record<string, unknown>);

          // Apply client-side filters
          if (signalTypes.length && !signalTypes.includes(newSignal.signalType)) return;
          if (newSignal.confidenceScore < minConfidence) return;

          setSignals((prev) => [newSignal, ...prev].slice(0, maxItems));
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, signalTypes.join(","), minConfidence, maxItems]);

  return { signals, connected };
}
