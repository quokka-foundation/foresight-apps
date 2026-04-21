"use client";

import type { AiInsight } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface InsightCardProps {
  insight: AiInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className="bg-ios-card border border-ios-card-border rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ color: "#0052FF", background: "rgba(0,82,255,0.15)" }}
          >
            AI
          </span>
          <span className="text-[0.6875rem] font-medium text-ios-text-secondary">
            Foresight Insight
          </span>
        </div>
        <span className="text-[0.6875rem] text-ios-text-tertiary font-mono tabular-nums">
          {timeAgo(insight.generatedAt)}
        </span>
      </div>

      {/* Summary */}
      <p className="text-[0.875rem] text-ios-text leading-[140%] font-sans">{insight.summary}</p>

      {/* Key drivers */}
      {insight.keyDrivers && insight.keyDrivers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {insight.keyDrivers.map((driver) => (
            <span
              key={driver}
              className="text-[0.6875rem] px-2.5 py-1 rounded-full bg-ios-bg-tertiary border border-ios-card-border text-ios-text-secondary leading-none"
            >
              {driver}
            </span>
          ))}
        </div>
      )}

      {/* Risk factors */}
      {insight.riskFactors && insight.riskFactors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {insight.riskFactors.map((risk) => (
            <span
              key={risk}
              className="text-[0.6875rem] px-2.5 py-1 rounded-full leading-none"
              style={{
                color: "#FF6B6B",
                background: "rgba(255,107,107,0.12)",
                border: "1px solid rgba(255,107,107,0.2)",
              }}
            >
              ⚠ {risk}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[0.6875rem] text-ios-text-tertiary">{insight.timeHorizon}</span>
        <ConfidenceBadge score={insight.confidenceScore} />
      </div>
    </div>
  );
}
