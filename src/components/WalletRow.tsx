"use client";

import Link from "next/link";
import type { SmartWallet, WalletClusterType } from "@/lib/types";
import { formatCompactUSD, truncateAddress } from "@/lib/utils";
import { SmartScoreBadge } from "./SmartScoreBadge";

interface WalletRowProps {
  wallet: SmartWallet;
  rank?: number;
}

const CLUSTER_CONFIG: Record<WalletClusterType, { label: string; color: string; bg: string }> = {
  fund: { label: "Fund", color: "#BF5AF2", bg: "rgba(191,90,242,0.15)" },
  whale: { label: "Whale", color: "#FF9F0A", bg: "rgba(255,159,10,0.15)" },
  market_maker: { label: "MM", color: "#0052FF", bg: "rgba(0,82,255,0.15)" },
  bot: { label: "Bot", color: "#7A8DA6", bg: "rgba(122,141,166,0.12)" },
  unknown: { label: "?", color: "#485A70", bg: "rgba(72,90,112,0.12)" },
};

export function WalletRow({ wallet, rank }: WalletRowProps) {
  const cluster = wallet.clusterType ? CLUSTER_CONFIG[wallet.clusterType] : null;

  const winPct = wallet.winRate != null ? Math.round(wallet.winRate * 100) : null;
  const winColor =
    winPct == null
      ? "text-ios-text-tertiary"
      : winPct >= 70
        ? "text-ios-green"
        : winPct >= 55
          ? "text-ios-text"
          : "text-ios-red";

  return (
    <Link href={`/wallet/${wallet.address}`}>
      <div className="group flex items-center gap-3 py-3 px-4 hover:bg-ios-bg-secondary transition-colors">
        {/* Rank */}
        {rank != null && (
          <span className="w-5 text-center text-[0.6875rem] font-mono text-ios-text-tertiary flex-shrink-0">
            {rank}
          </span>
        )}

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[0.6875rem] font-bold"
          style={{
            background: cluster?.bg ?? "rgba(72,90,112,0.12)",
            color: cluster?.color ?? "#485A70",
            border: `1px solid ${cluster?.color ?? "#485A70"}33`,
          }}
        >
          {wallet.address.slice(2, 4).toUpperCase()}
        </div>

        {/* Address + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[0.875rem] font-medium text-ios-text font-mono">
              {truncateAddress(wallet.address)}
            </p>
            {cluster && (
              <span
                className="text-[0.625rem] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                style={{ color: cluster.color, background: cluster.bg }}
              >
                {cluster.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {wallet.labels?.slice(0, 2).map((label) => (
              <span key={label} className="text-[0.6875rem] text-ios-text-tertiary">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Win rate */}
          {winPct != null && (
            <div className="text-right hidden xs:block">
              <p className={`text-[0.75rem] font-mono tabular-nums font-semibold ${winColor}`}>
                {winPct}%
              </p>
              <p className="text-[0.625rem] text-ios-text-tertiary">win rate</p>
            </div>
          )}

          {/* Volume + trades */}
          <div className="text-right">
            <p className="text-[0.75rem] font-mono tabular-nums text-ios-text">
              {formatCompactUSD(wallet.totalVolumeUSD ?? 0)}
            </p>
            <p className="text-[0.625rem] text-ios-text-tertiary tabular-nums">
              {(wallet.tradeCount ?? 0).toLocaleString()} trades
            </p>
          </div>

          <SmartScoreBadge score={wallet.smartScore} />
        </div>
      </div>
    </Link>
  );
}
