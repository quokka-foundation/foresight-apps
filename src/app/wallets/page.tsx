"use client";

import { useMemo, useState } from "react";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { WalletRow } from "@/components/WalletRow";
import { useWallets } from "@/hooks/useWallets";
import { MOCK_WALLETS } from "@/lib/mock-data";
import type { SmartWallet } from "@/lib/types";

type SortKey = "score" | "volume" | "trades" | "winrate";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "score", label: "Smart Score" },
  { key: "volume", label: "Volume" },
  { key: "trades", label: "Trades" },
  { key: "winrate", label: "Win Rate" },
];

function sortWallets(wallets: SmartWallet[], key: SortKey): SmartWallet[] {
  return [...wallets].sort((a, b) => {
    switch (key) {
      case "score":
        return (b.smartScore ?? 0) - (a.smartScore ?? 0);
      case "volume":
        return (b.totalVolumeUSD ?? 0) - (a.totalVolumeUSD ?? 0);
      case "trades":
        return (b.tradeCount ?? 0) - (a.tradeCount ?? 0);
      case "winrate":
        return (b.winRate ?? 0) - (a.winRate ?? 0);
      default:
        return 0;
    }
  });
}

export default function WalletsPage() {
  const { data: wallets, isLoading } = useWallets();
  const displayWallets = wallets ?? MOCK_WALLETS;
  const [sortKey, setSortKey] = useState<SortKey>("score");

  const sorted = useMemo(() => sortWallets(displayWallets, sortKey), [displayWallets, sortKey]);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-ios-bg">
      <TopBar title="Smart Wallets" />

      <div className="flex-1 pb-24">
        {/* Header + sort */}
        <div className="px-4 pt-3 pb-3">
          <p className="text-[0.75rem] text-ios-text-secondary mb-3">
            {isLoading ? "—" : displayWallets.length} tracked wallets on Base
          </p>
          {/* Sort chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSortKey(key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[0.75rem] font-medium transition-all ${
                  sortKey === key
                    ? "bg-ios-blue text-white"
                    : "bg-ios-card border border-ios-card-border text-ios-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 pb-1.5 border-b border-ios-separator">
          <div className="w-5 flex-shrink-0" />
          <div className="w-9 flex-shrink-0" />
          <div className="flex-1 text-[0.6875rem] text-ios-text-tertiary">Wallet</div>
          <div className="text-right text-[0.6875rem] text-ios-text-tertiary">Vol · Trades</div>
          <div className="w-10 text-right text-[0.6875rem] text-ios-text-tertiary">Score</div>
        </div>

        <div>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <div key={i} className="px-4 py-3 h-[72px] animate-pulse bg-ios-bg-secondary/40" />
              ))
            : sorted.map((wallet, i) => <WalletRow key={wallet.id} wallet={wallet} rank={i + 1} />)}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
