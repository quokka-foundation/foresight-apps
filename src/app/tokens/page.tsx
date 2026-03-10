"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { TabBar } from "@/components/TabBar";
import { TokenRow } from "@/components/TokenRow";
import { TopBar } from "@/components/TopBar";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";
import { MOCK_TOKENS } from "@/lib/mock-data";

const SORT_OPTIONS = ["Volume", "Price", "Change", "Liquidity"];

export default function TokensPage() {
  const [sortBy, setSortBy] = useState("Volume");

  const { data: tokens, loading } = useApiData(() => api.newTokens(), MOCK_TOKENS);

  const sortedTokens = useMemo(() => {
    const list = [...tokens];
    switch (sortBy) {
      case "Volume":
        return list.sort((a, b) => (b.volume24hUSD ?? 0) - (a.volume24hUSD ?? 0));
      case "Price":
        return list.sort((a, b) => (b.priceUSD ?? 0) - (a.priceUSD ?? 0));
      case "Change":
        return list.sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
      case "Liquidity":
        return list.sort((a, b) => (b.totalLiquidityUSD ?? 0) - (a.totalLiquidityUSD ?? 0));
      default:
        return list;
    }
  }, [sortBy, tokens]);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Tokens" />

      <FilterChips options={SORT_OPTIONS} active={sortBy} onSelect={setSortBy} />

      <div className="flex-1 pb-24">
        <div className="divide-y divide-ios-separator">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="px-4 py-3 h-[64px] animate-pulse bg-ios-bg-secondary/50" />
              ))
            : sortedTokens.map((token) => <TokenRow key={token.id} token={token} />)}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
