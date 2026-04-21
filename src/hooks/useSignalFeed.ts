"use client";

// ============================================================
// useSignalFeed — TanStack Query polling for live signals
// ============================================================
// Polls /api/signals every 10 seconds.
// New signals are prepended to the list (max 100 kept in memory).

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { MOCK_SIGNALS } from "@/lib/mock-data";
import type { AlphaSignal } from "@/lib/types";

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

  const isMockMode = !process.env.NEXT_PUBLIC_API_URL;

  const [signals, setSignals] = useState<AlphaSignal[]>(isMockMode ? MOCK_SIGNALS : []);
  const seenIds = useRef(new Set<string>());

  const params = new URLSearchParams();
  params.set("limit", String(maxItems));
  if (signalTypes.length) params.set("type", signalTypes[0]);
  if (minConfidence) params.set("minConfidence", String(minConfidence));

  const { data } = useQuery<AlphaSignal[]>({
    queryKey: ["signals", "feed", signalTypes.join(","), minConfidence],
    queryFn: async () => {
      const res = await fetch(`/api/signals?${params}`);
      if (!res.ok) throw new Error("Failed to fetch signals");
      return res.json();
    },
    refetchInterval: 10_000,
    enabled: !isMockMode,
  });

  useEffect(() => {
    if (!data) return;
    const fresh = data.filter((s) => !seenIds.current.has(s.id));
    if (fresh.length === 0) return;
    for (const s of fresh) seenIds.current.add(s.id);
    setSignals((prev) => [...fresh, ...prev].slice(0, maxItems));
  }, [data, maxItems]);

  return { signals, connected: !isMockMode };
}
