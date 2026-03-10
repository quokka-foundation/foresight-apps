"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { AlphaSignal } from "@/lib/types";
import { formatCompactUSD, timeAgo } from "@/lib/utils";
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
        <div className="bg-ios-card rounded-2xl p-4 space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <SignalTypeBadge type={signal.signalType} />
            <span className="text-[0.6875rem] text-white/40 font-mono tabular-nums">
              {timeAgo(signal.detectedAt)}
            </span>
          </div>

          {/* Description */}
          <p className="text-[0.875rem] text-white/90 leading-[140%] font-sans">
            {signal.description}
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {signal.tokenSymbol && (
                <span className="text-[0.75rem] font-medium text-white/70">
                  {signal.tokenSymbol}
                </span>
              )}
              {signal.valueUSD != null && (
                <span className="text-[0.75rem] font-mono tabular-nums text-ios-green">
                  {formatCompactUSD(signal.valueUSD)}
                </span>
              )}
              {signal.walletAddresses != null && signal.walletAddresses.length > 0 && (
                <span className="text-[0.6875rem] text-white/50">
                  {signal.walletAddresses.length} wallet
                  {signal.walletAddresses.length !== 1 ? "s" : ""}
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
