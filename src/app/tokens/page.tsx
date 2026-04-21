"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { TabBar } from "@/components/TabBar";
import { TokenRow } from "@/components/TokenRow";
import { TopBar } from "@/components/TopBar";
import { useTokens } from "@/hooks/useTokens";
import { MOCK_TOKENS } from "@/lib/mock-data";
import type { Token } from "@/lib/types";

const FILTER_OPTIONS = ["Trending", "Volume", "Gainers", "New", "MCap"];

const SORT_KEY_MAP: Record<string, keyof Token> = {
  Trending: "txCount",
  Volume: "volume24hUSD",
  Gainers: "change24h",
  New: "firstSeenAt",
  MCap: "marketCapUSD",
};

export default function TokensPage() {
  const [activeFilter, setActiveFilter] = useState("Trending");

  const { data: tokens, isLoading } = useTokens({ sort: activeFilter.toLowerCase() });
  const displayTokens = tokens ?? MOCK_TOKENS;

  const sortedTokens = useMemo(() => {
    const key = SORT_KEY_MAP[activeFilter] ?? "txCount";
    if (key === "firstSeenAt") {
      return [...displayTokens].sort(
        (a, b) => new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime(),
      );
    }
    return [...displayTokens].sort((a, b) => ((b[key] as number) ?? 0) - ((a[key] as number) ?? 0));
  }, [activeFilter, displayTokens]);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-ios-bg">
      <TopBar title="Tokens" />

      <FilterChips options={FILTER_OPTIONS} active={activeFilter} onSelect={setActiveFilter} />

      {/* Column header row */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-ios-separator">
        <div className="w-5 flex-shrink-0" />
        <div className="w-9 flex-shrink-0" />
        <div className="flex-1 text-[0.625rem] font-medium text-ios-text-tertiary uppercase tracking-wide">
          Token
        </div>
        <div className="text-[0.625rem] font-medium text-ios-text-tertiary uppercase tracking-wide min-w-[70px] text-right">
          Price / 24h
        </div>
        <div className="w-10 flex-shrink-0" />
      </div>

      <div className="flex-1 pb-24">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              <div
                key={i}
                className="px-4 py-3 h-[64px] border-b border-ios-separator animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-3 rounded bg-ios-bg-secondary" />
                  <div className="w-9 h-9 rounded-full bg-ios-bg-secondary" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-16 rounded bg-ios-bg-secondary" />
                    <div className="h-2.5 w-28 rounded bg-ios-bg-secondary" />
                  </div>
                  <div className="text-right space-y-1">
                    <div className="h-3 w-14 rounded bg-ios-bg-secondary ml-auto" />
                    <div className="h-2.5 w-10 rounded bg-ios-bg-secondary ml-auto" />
                  </div>
                </div>
              </div>
            ))
          : sortedTokens.map((token, idx) => (
              <TokenRow key={token.id} token={token} rank={idx + 1} />
            ))}
      </div>

      <TabBar />
    </div>
  );
}
