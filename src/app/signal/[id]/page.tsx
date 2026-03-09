"use client";

import { useParams, useRouter } from "next/navigation";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { SignalTypeBadge } from "@/components/SignalTypeBadge";
import { TopBar } from "@/components/TopBar";
import { getSignalById } from "@/lib/mock-data";
import { formatCompactUSD, timeAgo, truncateAddress } from "@/lib/utils";

export default function SignalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const signal = getSignalById(params.id);

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

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Signal" back={() => router.back()} />

      <div className="flex-1 px-4 py-4 space-y-6">
        {/* Type + time */}
        <div className="flex items-center justify-between">
          <SignalTypeBadge type={signal.type} />
          <span className="text-[0.6875rem] text-ios-text-tertiary font-mono tabular-nums">
            {timeAgo(signal.detectedAt)}
          </span>
        </div>

        {/* Description */}
        <p className="text-[1rem] text-ios-text leading-[150%] font-sans">{signal.description}</p>

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
          {signal.walletCount != null && (
            <div className="bg-ios-bg-secondary rounded-xl p-3">
              <p className="text-[0.6875rem] text-ios-text-secondary uppercase tracking-[0.05em]">
                Wallets
              </p>
              <p className="text-[1rem] font-mono tabular-nums text-ios-text mt-1">
                {signal.walletCount}
              </p>
            </div>
          )}
        </div>

        {/* Token address */}
        <div className="bg-ios-card rounded-xl p-4">
          <p className="text-[0.6875rem] text-white/50 uppercase tracking-[0.05em] mb-1">
            Token Contract
          </p>
          <p className="font-mono text-[0.8125rem] text-white/80 break-all">
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
      </div>
    </div>
  );
}
