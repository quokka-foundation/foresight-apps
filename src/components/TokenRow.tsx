"use client";

import Link from "next/link";
import type { Token } from "@/lib/types";
import { formatCompactUSD, formatPercent } from "@/lib/utils";

interface TokenRowProps {
  token: Token;
  rank?: number;
}

export function TokenRow({ token, rank }: TokenRowProps) {
  const change = token.change24h ?? 0;
  const isPositive = change >= 0;
  const priceUSD = token.priceUSD ?? 0;

  const priceStr =
    priceUSD >= 1000
      ? `$${priceUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
      : priceUSD >= 1
        ? `$${priceUSD.toFixed(2)}`
        : priceUSD >= 0.0001
          ? `$${priceUSD.toFixed(4)}`
          : `$${priceUSD.toFixed(8)}`;

  return (
    <Link href={`/token/${token.address}`} className="block">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ios-separator hover:bg-ios-bg-secondary transition-colors duration-150 group">
        {/* Rank */}
        {rank != null && (
          <span className="w-5 text-[0.6875rem] text-ios-text-tertiary font-mono text-right flex-shrink-0">
            {rank}
          </span>
        )}

        {/* Token avatar */}
        <div className="w-9 h-9 rounded-full bg-ios-card-hover border border-ios-card-border flex items-center justify-center flex-shrink-0">
          <span className="text-[0.625rem] font-mono font-medium text-white/80">
            {token.symbol.slice(0, 4)}
          </span>
        </div>

        {/* Name + meta row */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[0.875rem] font-medium text-ios-text truncate">
              {token.symbol}
            </span>
            <span className="text-[0.6875rem] text-ios-text-tertiary truncate hidden">
              {token.name}
            </span>
          </div>
          {/* MCap · Vol line */}
          <div className="flex items-center gap-2 mt-0.5">
            {token.marketCapUSD != null && (
              <span className="text-[0.625rem] text-ios-text-tertiary font-mono tabular-nums">
                MC {formatCompactUSD(token.marketCapUSD)}
              </span>
            )}
            {token.volume24hUSD != null && (
              <span className="text-[0.625rem] text-ios-text-tertiary font-mono tabular-nums">
                · Vol {formatCompactUSD(token.volume24hUSD)}
              </span>
            )}
            {token.totalLiquidityUSD != null && (
              <span className="text-[0.625rem] text-ios-text-tertiary font-mono tabular-nums">
                · Liq {formatCompactUSD(token.totalLiquidityUSD)}
              </span>
            )}
          </div>
        </div>

        {/* Price + change */}
        <div className="text-right flex-shrink-0 min-w-[70px]">
          <p className="text-[0.875rem] font-mono tabular-nums text-ios-text">{priceStr}</p>
          <p
            className={`text-[0.6875rem] font-mono tabular-nums font-medium ${
              isPositive ? "text-ios-green" : "text-ios-red"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatPercent(change)}
          </p>
        </div>

        {/* Buy button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/token/${token.address}`;
          }}
          className="flex-shrink-0 ml-1 px-3 py-1.5 rounded-lg bg-ios-blue text-white text-[0.6875rem] font-medium transition-all duration-150 hover:bg-ios-blue-light active:scale-95 shadow-blue-glow opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          Buy
        </button>
      </div>
    </Link>
  );
}
