"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { AlphaSignal } from "@/lib/types";
import { formatCompactUSD, timeAgo, truncateAddress } from "@/lib/utils";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { SignalTypeBadge } from "./SignalTypeBadge";

interface SignalCardProps {
  signal: AlphaSignal;
  index?: number;
}

export function SignalCard({ signal, index = 0 }: SignalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link href={`/signal/${signal.id}`}>
        <div className="bg-ios-card border border-ios-card-border rounded-2xl p-4 space-y-3 hover:bg-ios-card-hover hover:border-ios-card-border/60 transition-all duration-150 active:scale-[0.99]">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SignalTypeBadge type={signal.signalType} />
              {signal.tokenSymbol && (
                <span className="text-[0.75rem] font-semibold text-ios-text font-mono">
                  {signal.tokenSymbol}
                </span>
              )}
            </div>
            <span className="text-[0.6875rem] text-ios-text-tertiary font-mono tabular-nums">
              {timeAgo(signal.detectedAt)}
            </span>
          </div>

          {/* Description */}
          <p className="text-[0.875rem] text-ios-text leading-[140%] font-sans">
            {signal.description}
          </p>

          {/* AI Summary pill */}
          {signal.aiSummary && (
            <div className="flex items-start gap-2 bg-ios-bg-tertiary rounded-xl px-3 py-2">
              <span className="text-[0.625rem] font-semibold text-ios-blue uppercase tracking-wide flex-shrink-0 mt-0.5">
                AI
              </span>
              <p className="text-[0.75rem] text-ios-text-secondary leading-snug">
                {signal.aiSummary}
              </p>
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-3">
              {signal.valueUSD != null && (
                <span className="text-[0.75rem] font-mono tabular-nums font-semibold text-ios-green">
                  {formatCompactUSD(signal.valueUSD)}
                </span>
              )}
              {signal.walletAddresses != null && signal.walletAddresses.length > 0 && (
                <div className="flex items-center gap-1">
                  {/* Mini wallet avatars — show up to 3 */}
                  {signal.walletAddresses.slice(0, 3).map((addr) => (
                    <span
                      key={addr}
                      className="w-5 h-5 rounded-full bg-ios-bg-tertiary border border-ios-card-border text-[0.5rem] font-mono text-ios-text-tertiary flex items-center justify-center"
                    >
                      {truncateAddress(addr).slice(0, 2)}
                    </span>
                  ))}
                  {signal.walletAddresses.length > 3 && (
                    <span className="text-[0.6875rem] text-ios-text-tertiary ml-0.5">
                      +{signal.walletAddresses.length - 3}
                    </span>
                  )}
                </div>
              )}
              {signal.socialMentions != null && signal.socialMentions > 0 && (
                <span className="text-[0.6875rem] text-ios-text-tertiary flex items-center gap-1">
                  <span>💬</span>
                  {signal.socialMentions}
                </span>
              )}
            </div>
            <ConfidenceBadge score={signal.confidenceScore} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
