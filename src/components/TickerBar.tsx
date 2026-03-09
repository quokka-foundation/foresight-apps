"use client";

import { useMemo } from "react";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";
import { MOCK_TOKENS } from "@/lib/mock-data";
import { formatPercent } from "@/lib/utils";

/** Number of top tokens (by volume) to display in the ticker. */
const TICKER_COUNT = 15;

function formatTickerPrice(price: number | undefined | null): string {
  if (price == null) return "$—";
  if (price >= 1)
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(4)}`;
}

export function TickerBar() {
  const { data: tokens } = useApiData(() => api.newTokens(), MOCK_TOKENS);

  const topTokens = useMemo(
    () =>
      [...tokens]
        .sort((a, b) => (b.volume24hUSD ?? 0) - (a.volume24hUSD ?? 0))
        .slice(0, TICKER_COUNT),
    [tokens],
  );

  if (topTokens.length === 0) return null;

  const items = topTokens.map((t) => {
    const change = t.change24h ?? 0;
    const isPositive = change >= 0;
    return (
      <span key={t.id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-white font-medium">{t.symbol}</span>
        <span className="text-white/80">{formatTickerPrice(t.priceUSD)}</span>
        <span className={isPositive ? "text-ios-green" : "text-ios-red"}>
          {isPositive ? "\u25B2" : "\u25BC"}
          {formatPercent(Math.abs(change))}
        </span>
      </span>
    );
  });

  /* Duplicate array for seamless loop — when the first copy scrolls out,
     the second copy is already in position, so translateX(-50%) resets. */
  return (
    <div className="w-full bg-ios-card overflow-hidden select-none" style={{ height: 30 }}>
      <div
        className="animate-ticker inline-flex items-center gap-6 h-full font-mono tabular-nums"
        style={{ fontSize: "0.6875rem" }}
      >
        {/* First pass */}
        {items.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: duplicated list for marquee
          <span key={`a-${i}`} className="inline-flex items-center gap-6">
            {item}
            <span className="text-white/20">|</span>
          </span>
        ))}
        {/* Second pass (duplicate for seamless loop) */}
        {items.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: duplicated list for marquee
          <span key={`b-${i}`} className="inline-flex items-center gap-6">
            {item}
            <span className="text-white/20">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
