"use client";

import { useParams, useRouter } from "next/navigation";
import { SmartScoreBadge } from "@/components/SmartScoreBadge";
import { TopBar } from "@/components/TopBar";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";
import { getWalletByAddress } from "@/lib/mock-data";
import type { WalletDetail } from "@/lib/types";
import { formatCompactUSD, truncateAddress } from "@/lib/utils";

export default function WalletDetailPage() {
  const params = useParams<{ address: string }>();
  const router = useRouter();

  const { data: wallet, loading } = useApiData<WalletDetail | null>(
    () => api.wallet(params.address),
    (getWalletByAddress(params.address) as WalletDetail) ?? null,
    [params.address],
  );

  const { data: portfolio } = useApiData<{
    tokens: { address: string; symbol: string; valueUSD: number }[];
  } | null>(
    () => (params.address ? api.walletPortfolio(params.address) : Promise.resolve(null)),
    null,
    [params.address],
  );

  if (loading) {
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

  if (!wallet) {
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
              {wallet.clusterType?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <p className="font-mono text-[0.875rem] text-ios-text">
            {truncateAddress(wallet.address)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {wallet.labels?.map((label) => (
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
              <SmartScoreBadge score={wallet.smartScore} />
            </div>
          </div>
          <div className="bg-ios-bg-secondary rounded-xl p-3 text-center">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              Volume
            </p>
            <p className="text-[0.875rem] font-mono tabular-nums text-ios-text mt-1">
              {formatCompactUSD(wallet.totalVolumeUSD ?? 0)}
            </p>
          </div>
          <div className="bg-ios-bg-secondary rounded-xl p-3 text-center">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              Trades
            </p>
            <p className="text-[0.875rem] font-mono tabular-nums text-ios-text mt-1">
              {(wallet.tradeCount ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Cluster type */}
        <div className="border border-ios-separator rounded-xl p-4">
          <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em] mb-1">
            Cluster Type
          </p>
          <p className="text-[0.875rem] font-medium text-ios-text capitalize">
            {wallet.clusterType ?? "Unknown"}
          </p>
        </div>

        {/* Recent transactions (WalletDetail-only field) */}
        {wallet.recentTransactions && wallet.recentTransactions.length > 0 && (
          <div>
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em] mb-2">
              Recent Transactions
            </p>
            <div className="space-y-2">
              {wallet.recentTransactions.map((tx) => (
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

        {/* Portfolio holdings */}
        {portfolio && portfolio.tokens.length > 0 && (
          <div>
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em] mb-2">
              Portfolio
            </p>
            <div className="space-y-2">
              {portfolio.tokens.slice(0, 5).map((holding) => (
                <div
                  key={holding.address}
                  className="bg-ios-bg-secondary rounded-xl p-3 flex items-center justify-between"
                >
                  <span className="text-[0.875rem] font-medium text-ios-text">
                    {holding.symbol}
                  </span>
                  <span className="font-mono tabular-nums text-[0.875rem] text-ios-text">
                    {formatCompactUSD(holding.valueUSD)}
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
          <p className="font-mono text-[0.75rem] text-white/80 break-all">{wallet.address}</p>
        </div>
      </div>
    </div>
  );
}
