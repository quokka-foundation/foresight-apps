"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { TabBar } from "@/components/TabBar";
import { TokenRow } from "@/components/TokenRow";
import { TopBar } from "@/components/TopBar";
import { MOCK_TOKENS } from "@/lib/mock-data";

const SORT_OPTIONS = ["Volume", "Price", "Change", "Liquidity"];

export default function TokensPage() {
  const [sortBy, setSortBy] = useState("Volume");

  const sortedTokens = useMemo(() => {
    const tokens = [...MOCK_TOKENS];
    switch (sortBy) {
      case "Volume":
        return tokens.sort((a, b) => (b.volume24hUSD ?? 0) - (a.volume24hUSD ?? 0));
      case "Price":
        return tokens.sort((a, b) => (b.priceUSD ?? 0) - (a.priceUSD ?? 0));
      case "Change":
        return tokens.sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
      case "Liquidity":
        return tokens.sort((a, b) => (b.totalLiquidityUSD ?? 0) - (a.totalLiquidityUSD ?? 0));
      default:
        return tokens;
    }
  }, [sortBy]);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Tokens" />

      <FilterChips options={SORT_OPTIONS} active={sortBy} onSelect={setSortBy} />

      <div className="flex-1 pb-24">
        <div className="divide-y divide-ios-separator">
          {sortedTokens.map((token) => (
            <TokenRow key={token.id} token={token} />
          ))}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
