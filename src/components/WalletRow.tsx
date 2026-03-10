"use client";

import Link from "next/link";
import type { SmartWallet } from "@/lib/types";
import { formatCompactUSD, truncateAddress } from "@/lib/utils";
import { SmartScoreBadge } from "./SmartScoreBadge";

interface WalletRowProps {
  wallet: SmartWallet;
}

export function WalletRow({ wallet }: WalletRowProps) {
  return (
    <Link href={`/wallet/${wallet.address}`}>
      <div className="flex items-center justify-between py-3 px-4 hover:bg-ios-bg-secondary rounded-xl transition-colors">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-ios-card flex items-center justify-center flex-shrink-0">
            <span className="text-[0.6875rem] font-mono text-white/70">
              {wallet.clusterType?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[0.875rem] font-medium text-ios-text truncate">
              {truncateAddress(wallet.address)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {wallet.labels?.slice(0, 2).map((label) => (
                <span key={label} className="text-[0.6875rem] text-ios-text-secondary">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-[0.75rem] font-mono tabular-nums text-ios-text">
              {formatCompactUSD(wallet.totalVolumeUSD ?? 0)}
            </p>
            <p className="text-[0.6875rem] text-ios-text-tertiary">
              {wallet.tradeCount ?? 0} trades
            </p>
          </div>
          <SmartScoreBadge score={wallet.smartScore} />
        </div>
      </div>
    </Link>
  );
}
