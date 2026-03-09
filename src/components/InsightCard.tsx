"use client";

import type { AiInsight } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface InsightCardProps {
  insight: AiInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className="bg-ios-card rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-mono uppercase tracking-[0.05em] text-white/50">
          AI Insight
        </span>
        <span className="text-[0.6875rem] text-white/40 font-mono tabular-nums">
          {timeAgo(insight.generatedAt)}
        </span>
      </div>

      {/* Summary */}
      <p className="text-[0.875rem] text-white/90 leading-[140%] font-sans">{insight.summary}</p>

      {/* Meta */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[0.6875rem] text-white/50">{insight.timeHorizon}</span>
        </div>
        <ConfidenceBadge score={insight.confidenceScore} />
      </div>
    </div>
  );
}
