"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { TabBar } from "@/components/TabBar";
import { TokenRow } from "@/components/TokenRow";
import { TopBar } from "@/components/TopBar";
import { useTokens } from "@/hooks/useTokens";
import { MOCK_TOKENS } from "@/lib/mock-data";
import type { Token } from "@/lib/types";

const SORT_OPTIONS = ["Volume", "Price", "Change", "Liquidity"];

const SORT_KEY_MAP: Record<string, keyof Token> = {
  Volume: "volume24hUSD",
  Price: "priceUSD",
  Change: "change24h",
  Liquidity: "totalLiquidityUSD",
};

export default function TokensPage() {
  const [sortBy, setSortBy] = useState("Volume");

  const { data: tokens, isLoading } = useTokens({ sort: sortBy.toLowerCase() });
  const displayTokens = tokens ?? MOCK_TOKENS;

  const sortedTokens = useMemo(() => {
    const key = SORT_KEY_MAP[sortBy] ?? "volume24hUSD";
    return [...displayTokens].sort((a, b) => ((b[key] as number) ?? 0) - ((a[key] as number) ?? 0));
  }, [sortBy, displayTokens]);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Tokens" />

      <FilterChips options={SORT_OPTIONS} active={sortBy} onSelect={setSortBy} />

      <div className="flex-1 pb-24">
        <div className="divide-y divide-ios-separator">
          {isLoading
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
