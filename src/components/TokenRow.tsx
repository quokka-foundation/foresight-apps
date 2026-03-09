"use client";

import Link from "next/link";
import type { Token } from "@/lib/types";
import { formatCompactUSD, formatPercent } from "@/lib/utils";

interface TokenRowProps {
  token: Token;
}

export function TokenRow({ token }: TokenRowProps) {
  const isPositive = (token.change24h ?? 0) >= 0;

  return (
    <Link href={`/token/${token.address}`}>
      <div className="flex items-center justify-between py-3 px-4 hover:bg-ios-bg-secondary rounded-xl transition-colors">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-ios-card flex items-center justify-center flex-shrink-0">
            <span className="text-[0.6875rem] font-mono font-medium text-white">
              {token.symbol.slice(0, 3)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[0.875rem] font-medium text-ios-text truncate">{token.symbol}</p>
            <p className="text-[0.6875rem] text-ios-text-secondary truncate">{token.name}</p>
          </div>
        </div>

        {/* Right */}
        <div className="text-right flex-shrink-0">
          <p className="text-[0.875rem] font-mono tabular-nums text-ios-text">
            ${token.priceUSD?.toFixed(token.priceUSD >= 1 ? 2 : 4) ?? "—"}
          </p>
          <p
            className={`text-[0.6875rem] font-mono tabular-nums ${
              isPositive ? "text-ios-green" : "text-ios-red"
            }`}
          >
            {formatPercent(token.change24h ?? 0)}
          </p>
        </div>
      </div>
    </Link>
  );
}
