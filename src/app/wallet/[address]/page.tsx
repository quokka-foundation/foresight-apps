"use client";

import { useParams, useRouter } from "next/navigation";
import { SmartScoreBadge } from "@/components/SmartScoreBadge";
import { TopBar } from "@/components/TopBar";
import { useWalletDetail } from "@/hooks/useWallets";
import { getWalletByAddress } from "@/lib/mock-data";
import type { WalletDetail } from "@/lib/types";
import { formatCompactUSD, truncateAddress } from "@/lib/utils";

export default function WalletDetailPage() {
  const params = useParams<{ address: string }>();
  const router = useRouter();

  const { data: wallet, isLoading } = useWalletDetail(params.address);

  // Fall back to mock data if API hasn't returned yet or is unavailable
  const displayWallet =
    (wallet as WalletDetail | null | undefined) ??
    (getWalletByAddress(params.address) as WalletDetail) ??
    null;

  if (isLoading && !displayWallet) {
    return (
      <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
        <TopBar title="Wallet" back={() => router.back()} />
        <div className="flex-1 px-4 py-4 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-ios-bg-secondary animate-pulse" />
            <div className="h-4 w-40 rounded bg-ios-bg-secondary animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              <div key={i} className="h-[72px] rounded-xl bg-ios-bg-secondary animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!displayWallet) {
    return (
      <div className="flex items-center justify-center min-h-screen max-w-[430px] mx-auto bg-white">
        <div className="text-center p-8">
          <p className="text-[1rem] font-medium text-ios-text mb-3">Wallet not found</p>
          <button
            onClick={() => router.push("/wallets")}
            className="text-ios-blue text-sm font-medium"
          >
            Back to Wallets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Wallet" back={() => router.back()} />

      <div className="flex-1 px-4 py-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-ios-card rounded-full flex items-center justify-center mb-3">
            <span className="text-[1.25rem] font-mono text-white/70">
              {displayWallet.clusterType?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <p className="font-mono text-[0.875rem] text-ios-text">
            {truncateAddress(displayWallet.address)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {displayWallet.labels?.map((label) => (
              <span
                key={label}
                className="text-[0.6875rem] bg-ios-bg-secondary px-2 py-0.5 rounded-md text-ios-text-secondary"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-ios-bg-secondary rounded-xl p-3 text-center">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              Score
            </p>
            <div className="mt-1 flex justify-center">
              <SmartScoreBadge score={displayWallet.smartScore} />
            </div>
          </div>
          <div className="bg-ios-bg-secondary rounded-xl p-3 text-center">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              Volume
            </p>
            <p className="text-[0.875rem] font-mono tabular-nums text-ios-text mt-1">
              {formatCompactUSD(displayWallet.totalVolumeUSD ?? 0)}
            </p>
          </div>
          <div className="bg-ios-bg-secondary rounded-xl p-3 text-center">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              Trades
            </p>
            <p className="text-[0.875rem] font-mono tabular-nums text-ios-text mt-1">
              {(displayWallet.tradeCount ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Cluster type */}
        <div className="border border-ios-separator rounded-xl p-4">
          <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em] mb-1">
            Cluster Type
          </p>
          <p className="text-[0.875rem] font-medium text-ios-text capitalize">
            {displayWallet.clusterType ?? "Unknown"}
          </p>
        </div>

        {/* Recent transactions (WalletDetail-only field) */}
        {displayWallet.recentTransactions && displayWallet.recentTransactions.length > 0 && (
          <div>
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em] mb-2">
              Recent Transactions
            </p>
            <div className="space-y-2">
              {displayWallet.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-ios-bg-secondary rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[0.75rem] font-medium text-ios-text capitalize">
                      {tx.type}
                    </span>
                    {tx.tokenSymbol && (
                      <span className="text-[0.75rem] text-ios-text-secondary ml-1">
                        {tx.tokenSymbol}
                      </span>
                    )}
                  </div>
                  <span className="font-mono tabular-nums text-[0.75rem] text-ios-text">
                    {formatCompactUSD(tx.amountUSD)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full address */}
        <div className="bg-ios-card rounded-xl p-4">
          <p className="text-[0.6875rem] text-white/50 uppercase tracking-[0.05em] mb-1">
            Full Address
          </p>
          <p className="font-mono text-[0.75rem] text-white/80 break-all">
            {displayWallet.address}
          </p>
        </div>
      </div>
    </div>
  );
}
