"use client";

// useAiSummary — on-demand AI insight generation via /api/ai/summarize

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiInsight } from "@/lib/types";

async function fetchInsightForSignal(signalId: string): Promise<AiInsight | null> {
  const res = await fetch(`/api/signals/${signalId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.aiInsight ?? null;
}

/** Read cached AI insight for a signal (from the signal detail endpoint). */
export function useSignalInsight(signalId: string | undefined) {
  return useQuery({
    queryKey: ["insight", "signal", signalId],
    queryFn: () => fetchInsightForSignal(signalId!),
    enabled: !!signalId,
    staleTime: 5 * 60_000,
  });
}

async function generateInsight(body: {
  signalId?: string;
  tokenAddress?: string;
}): Promise<AiInsight> {
  const res = await fetch("/api/ai/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Mutation hook to request a fresh AI summary on demand.
 * Invalidates the cached insight after success.
 */
export function useGenerateInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateInsight,
    onSuccess: (insight) => {
      if (insight.signalId) {
        queryClient.invalidateQueries({ queryKey: ["insight", "signal", insight.signalId] });
      }
      if (insight.tokenAddress) {
        queryClient.invalidateQueries({ queryKey: ["token", insight.tokenAddress] });
      }
    },
  });
}
