"use client";

// useAlertHistory — TanStack Query hook for alert history

import { useQuery } from "@tanstack/react-query";
import type { AlertHistoryItem } from "@/lib/types";

async function fetchAlertHistory(userId: string, limit: number): Promise<AlertHistoryItem[]> {
  const params = new URLSearchParams({ userId, limit: String(limit) });
  const res = await fetch(`/api/alerts/history?${params}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function useAlertHistory(userId: string | null, opts: { limit?: number } = {}) {
  const { limit = 50 } = opts;

  return useQuery({
    queryKey: ["alertHistory", userId, limit],
    queryFn: () => fetchAlertHistory(userId!, limit),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
