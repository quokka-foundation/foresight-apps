"use client";

// useTokens — TanStack Query hook for token list + detail

import { useQuery } from "@tanstack/react-query";
import type { OHLCVBar, OHLCVResolution, Token } from "@/lib/types";

async function fetchTokens(limit: number, sort: string): Promise<Token[]> {
  const res = await fetch(`/api/tokens?limit=${limit}&sort=${sort}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function useTokens(opts: { limit?: number; sort?: string } = {}) {
  const { limit = 50, sort = "volume" } = opts;

  return useQuery({
    queryKey: ["tokens", limit, sort],
    queryFn: () => fetchTokens(limit, sort),
    staleTime: 30_000,
  });
}

async function fetchTokenDetail(address: string): Promise<unknown> {
  const res = await fetch(`/api/tokens/${address}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function useTokenDetail(address: string | undefined) {
  return useQuery({
    queryKey: ["token", address],
    queryFn: () => fetchTokenDetail(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

async function fetchOHLCV(
  address: string,
  resolution: OHLCVResolution,
  limit: number,
): Promise<OHLCVBar[]> {
  const res = await fetch(`/api/tokens/${address}/ohlcv?resolution=${resolution}&limit=${limit}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function useOHLCV(
  address: string | undefined,
  resolution: OHLCVResolution = "1D",
  limit = 100,
) {
  return useQuery({
    queryKey: ["ohlcv", address, resolution, limit],
    queryFn: () => fetchOHLCV(address!, resolution, limit),
    enabled: !!address,
    staleTime: 60_000,
  });
}
