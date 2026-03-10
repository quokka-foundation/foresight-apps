"use client";

import { useParams, useRouter } from "next/navigation";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { InsightCard } from "@/components/InsightCard";
import { SignalCard } from "@/components/SignalCard";
import { SignalTypeBadge } from "@/components/SignalTypeBadge";
import { TopBar } from "@/components/TopBar";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";
import { MOCK_INSIGHTS, MOCK_SIGNALS } from "@/lib/mock-data";
import type { AiInsight, AlphaSignal } from "@/lib/types";
import { formatCompactUSD, timeAgo, truncateAddress } from "@/lib/utils";

export default function SignalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: signals, loading } = useApiData(() => api.feed(100), MOCK_SIGNALS);
  const signal = signals.find((s) => s.id === params.id);

  // Once we know the token address, fetch related signals and an AI insight
  const tokenAddress = signal?.tokenAddress ?? "";
  const { data: relatedSignals } = useApiData<AlphaSignal[]>(
    () => (tokenAddress ? api.tokenSignals(tokenAddress) : Promise.resolve([])),
    [],
    [tokenAddress],
  );
  const { data: insight } = useApiData<AiInsight | null>(
    () => (tokenAddress ? api.tokenInsight(tokenAddress) : Promise.resolve(null)),
    MOCK_INSIGHTS[0] ?? null,
    [tokenAddress],
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
        <TopBar title="Signal" back={() => router.back()} />
        <div className="flex-1 px-4 py-4 space-y-4">
          <div className="h-6 w-32 rounded-lg bg-ios-bg-secondary animate-pulse" />
          <div className="h-20 rounded-xl bg-ios-bg-secondary animate-pulse" />
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

  if (!signal) {
    return (
      <div className="flex items-center justify-center min-h-screen max-w-[430px] mx-auto bg-white">
        <div className="text-center p-8">
          <p className="text-[1rem] font-medium text-ios-text mb-3">Signal not found</p>
          <button onClick={() => router.push("/")} className="text-ios-blue text-sm font-medium">
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  // Other signals for the same token, excluding the current one
  const otherSignals = relatedSignals.filter((s) => s.id !== signal.id).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Signal" back={() => router.back()} />

      <div className="flex-1 px-4 py-4 space-y-6">
        {/* Type + time */}
        <div className="flex items-center justify-between">
          <SignalTypeBadge type={signal.signalType} />
          <span className="text-[0.6875rem] text-ios-text-tertiary font-mono tabular-nums">
            {timeAgo(signal.detectedAt)}
          </span>
        </div>

        {/* Description */}
        {signal.description && (
          <p className="text-[1rem] text-ios-text leading-[150%] font-sans">{signal.description}</p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ios-bg-secondary rounded-xl p-3">
            <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
              Confidence
            </p>
            <div className="mt-1">
              <ConfidenceBadge score={signal.confidenceScore} className="text-[1.25rem]" />
            </div>
          </div>
          {signal.valueUSD != null && (
            <div className="bg-ios-bg-secondary rounded-xl p-3">
              <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
                Value
              </p>
              <p className="text-[1.25rem] font-mono tabular-nums text-ios-text mt-1">
                {formatCompactUSD(signal.valueUSD)}
              </p>
            </div>
          )}
          {signal.tokenSymbol && (
            <div className="bg-ios-bg-secondary rounded-xl p-3">
              <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
                Token
              </p>
              <p className="text-[1rem] font-medium text-ios-text mt-1">{signal.tokenSymbol}</p>
            </div>
          )}
          {signal.walletAddresses != null && signal.walletAddresses.length > 0 && (
            <div className="bg-ios-bg-secondary rounded-xl p-3">
              <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
                Wallets
              </p>
              <p className="text-[1rem] font-mono tabular-nums text-ios-text mt-1">
                {signal.walletAddresses.length}
              </p>
            </div>
          )}
        </div>

        {/* Token address */}
        <div className="bg-ios-card rounded-xl p-4">
          <p className="text-[0.6875rem] text-white/50 uppercase tracking-[0.05em] mb-1">
            Token Contract
          </p>
          <p className="font-mono text-[0.75rem] text-white/80 break-all">
            {truncateAddress(signal.tokenAddress)}
          </p>
        </div>

        {/* Block info */}
        {signal.blockNumber && (
          <div className="flex items-center justify-between py-3 border-t border-ios-separator">
            <span className="text-[0.75rem] text-ios-text-secondary">Block</span>
            <span className="text-[0.75rem] font-mono tabular-nums text-ios-text">
              {signal.blockNumber.toLocaleString()}
            </span>
          </div>
        )}

        {/* AI Insight for this token */}
        {insight && (
          <div>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-ios-text-secondary mb-2">
              AI Insight
            </p>
            <InsightCard insight={insight} />
          </div>
        )}

        {/* Other signals for this token */}
        {otherSignals.length > 0 && (
          <div>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-ios-text-secondary mb-2">
              More Signals for This Token
            </p>
            <div className="space-y-3">
              {otherSignals.map((s) => (
                <SignalCard key={s.id} signal={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
