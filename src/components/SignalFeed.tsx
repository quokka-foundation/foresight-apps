"use client";

// ============================================================
// SignalFeed — live Realtime feed + infinite scroll fallback
// ============================================================
// Uses useSignalFeed for Supabase Realtime (dev falls back to MOCK).
// Loads more via useInfiniteSignals (TanStack Query keyset pagination).
// Shows LiveDot connection indicator.

import { useCallback, useEffect, useMemo, useRef } from "react";
import { LiveDot } from "@/components/LiveDot";
import { SignalCard } from "@/components/SignalCard";
import { useInfiniteSignals } from "@/hooks/useInfiniteSignals";
import { useSignalFeed } from "@/hooks/useSignalFeed";
import type { AlphaSignal, SignalType } from "@/lib/types";

interface SignalFeedProps {
  /** Active signal type filter. null = show all. */
  filterType?: SignalType | null;
  minConfidence?: number;
}

export function SignalFeed({ filterType, minConfidence = 0 }: SignalFeedProps) {
  const { signals: realtimeSignals, connected } = useSignalFeed({
    signalTypes: filterType ? [filterType] : [],
    minConfidence,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteSignals({
    type: filterType,
    minConfidence,
  });

  // Deduplicate: realtime signals take precedence (may overlap with first page)
  const pagedSignals = useMemo(() => (data?.pages ?? []).flatMap((p) => p.signals), [data]);

  const allSignals = useMemo(() => {
    const seen = new Set<string>(realtimeSignals.map((s) => s.id));
    const merged: AlphaSignal[] = [...realtimeSignals];
    for (const s of pagedSignals) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        merged.push(s);
      }
    }
    return merged;
  }, [realtimeSignals, pagedSignals]);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(onIntersect, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <div className="flex flex-col">
      {/* Live status row */}
      <div className="flex items-center justify-end px-4 py-1">
        <LiveDot connected={connected} />
      </div>

      {/* Cards */}
      <div className="px-4 pb-4 space-y-3">
        {isLoading && !realtimeSignals.length ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <div key={i} className="h-[120px] rounded-2xl bg-ios-bg-secondary animate-pulse" />
            ))}
          </>
        ) : (
          <>
            {allSignals.map((signal, i) => (
              <SignalCard key={signal.id} signal={signal} index={i} />
            ))}

            {allSignals.length === 0 && (
              <div className="text-center mt-20">
                <p className="text-ios-text-secondary text-[0.875rem]">
                  No signals match this filter
                </p>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 rounded-full border-2 border-ios-blue/30 border-t-ios-blue animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
