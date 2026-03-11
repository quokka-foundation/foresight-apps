"use client";

// ============================================================
// useInfiniteSignals — TanStack Query infinite scroll
// ============================================================
// Fetches signals from /api/signals with keyset pagination.
// Uses detectedAt timestamp as cursor.

import { useInfiniteQuery } from "@tanstack/react-query";
import type { AlphaSignal } from "@/lib/types";

const PAGE_SIZE = 20;

async function fetchSignalPage({
  cursor,
  type,
  minConfidence,
}: {
  cursor?: string;
  type?: string;
  minConfidence?: number;
}): Promise<{ signals: AlphaSignal[]; nextCursor: string | null }> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) params.set("cursor", cursor);
  if (type) params.set("type", type);
  if (minConfidence) params.set("minConfidence", String(minConfidence));

  const res = await fetch(`/api/signals?${params}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const signals: AlphaSignal[] = await res.json();

  // Use the last item's detectedAt as the cursor for the next page
  const nextCursor =
    signals.length === PAGE_SIZE ? (signals[signals.length - 1]?.detectedAt ?? null) : null;

  return { signals, nextCursor };
}

export function useInfiniteSignals(
  opts: { type?: AlphaSignal["signalType"] | null; minConfidence?: number } = {},
) {
  const { type, minConfidence } = opts;

  return useInfiniteQuery({
    queryKey: ["signals", "infinite", type ?? "all", minConfidence ?? 0],
    queryFn: ({ pageParam }) =>
      fetchSignalPage({
        cursor: pageParam as string | undefined,
        type: type ?? undefined,
        minConfidence,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}
