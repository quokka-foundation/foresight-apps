"use client";

import { useParams, useRouter } from "next/navigation";
import { InsightCard } from "@/components/InsightCard";
import { SignalCard } from "@/components/SignalCard";
import { TopBar } from "@/components/TopBar";
import { useTokenDetail } from "@/hooks/useTokens";
import { MOCK_TOKENS } from "@/lib/mock-data";
import type { AiInsight, AlphaSignal, TokenDetail } from "@/lib/types";
import { formatCompactUSD, formatPercent } from "@/lib/utils";

export default function TokenDetailPage() {
  const params = useParams<{ address: string }>();
  const router = useRouter();

  const { data, isLoading } = useTokenDetail(params.address);
  const detail = data as TokenDetail | null | undefined;

  // Fall back to mock while loading
  const mockToken = MOCK_TOKENS.find((t) => t.address === params.address) ?? null;
  const token = detail ?? mockToken;

  const researchSignals: AlphaSignal[] = (detail?.signals ?? []).slice(0, 3);
  const researchInsight: AiInsight | null = detail?.aiInsight ?? null;
  const liveLiquidity = detail?.liquidityUSD ?? token?.totalLiquidityUSD ?? 0;

  if (isLoading && !token) {
    return (
      <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
        <TopBar title="Token" back={() => router.back()} />
        <div className="flex-1 px-4 py-4 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-ios-bg-secondary animate-pulse" />
            <div className="h-8 w-32 rounded bg-ios-bg-secondary animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              <div key={i} className="h-[72px] rounded-xl bg-ios-bg-secondary animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen max-w-[430px] mx-auto bg-white">
        <div className="text-center p-8">
          <p className="text-[1rem] font-medium text-ios-text mb-3">Token not found</p>
          <button
            onClick={() => router.push("/tokens")}
            className="text-ios-blue text-sm font-medium"
          >
            Back to Tokens
          </button>
        </div>
      </div>
    );
  }

  const isPositive = (token.change24h ?? 0) >= 0;

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title={token.symbol} back={() => router.back()} />

      <div className="flex-1 px-4 py-4 space-y-6">
        {/* Hero */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-ios-card rounded-full flex items-center justify-center mb-3">
            <span className="text-[1rem] font-mono font-medium text-white">
              {token.symbol.slice(0, 4)}
            </span>
          </div>
          <p className="text-[0.875rem] text-ios-text-secondary">{token.name}</p>
          <p className="text-[2rem] font-mono tabular-nums font-medium text-ios-text mt-2">
            ${token.priceUSD?.toFixed((token.priceUSD ?? 0) >= 1 ? 2 : 4) ?? "—"}
          </p>
          <p
            className={`text-[0.875rem] font-mono tabular-nums mt-1 ${
              isPositive ? "text-ios-green" : "text-ios-red"
            }`}
          >
            {formatPercent(token.change24h ?? 0)}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ios-bg-secondary rounded-xl p-3">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              24h Volume
            </p>
            <p className="text-[0.875rem] font-mono tabular-nums text-ios-text mt-1">
              {formatCompactUSD(token.volume24hUSD ?? 0)}
            </p>
          </div>
          <div className="bg-ios-bg-secondary rounded-xl p-3">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              Liquidity
            </p>
            <p className="text-[0.875rem] font-mono tabular-nums text-ios-text mt-1">
              {formatCompactUSD(liveLiquidity)}
            </p>
          </div>
          <div className="bg-ios-bg-secondary rounded-xl p-3">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              Transactions
            </p>
            <p className="text-[0.875rem] font-mono tabular-nums text-ios-text mt-1">
              {(token.txCount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-ios-bg-secondary rounded-xl p-3">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              First Seen
            </p>
            <p className="text-[0.875rem] text-ios-text mt-1">
              {new Date(token.firstSeenAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* AI Insight */}
        {researchInsight && (
          <div>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-ios-text-secondary mb-2">
              AI Insight
            </p>
            <InsightCard insight={researchInsight} />
          </div>
        )}

        {/* Alpha Signals */}
        {researchSignals.length > 0 && (
          <div>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-ios-text-secondary mb-2">
              Alpha Signals
            </p>
            <div className="space-y-3">
              {researchSignals.map((s) => (
                <SignalCard key={s.id} signal={s} />
              ))}
            </div>
          </div>
        )}

        {/* Contract */}
        <div className="bg-ios-card rounded-xl p-4">
          <p className="text-[0.6875rem] text-white/50 uppercase tracking-[0.05em] mb-1">
            Contract Address
          </p>
          <p className="font-mono text-[0.75rem] text-white/80 break-all">{token.address}</p>
        </div>
      </div>
    </div>
  );
}
