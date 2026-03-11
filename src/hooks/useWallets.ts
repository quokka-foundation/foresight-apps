"use client";

// useWallets — TanStack Query hook for smart wallet list

import { useQuery } from "@tanstack/react-query";
import type { WalletStats } from "@/lib/types";

async function fetchWallets(limit: number, minScore: number): Promise<WalletStats[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (minScore) params.set("minScore", String(minScore));
  const res = await fetch(`/api/wallets?${params}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function useWallets(opts: { limit?: number; minScore?: number } = {}) {
  const { limit = 50, minScore = 0 } = opts;

  return useQuery({
    queryKey: ["wallets", limit, minScore],
    queryFn: () => fetchWallets(limit, minScore),
    staleTime: 60_000,
  });
}

async function fetchWalletDetail(address: string): Promise<unknown> {
  const res = await fetch(`/api/wallets/${address}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function useWalletDetail(address: string | undefined) {
  return useQuery({
    queryKey: ["wallet", address],
    queryFn: () => fetchWalletDetail(address!),
    enabled: !!address,
    staleTime: 60_000,
  });
}
