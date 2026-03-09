"use client";

import { cn } from "@/lib/utils";

interface SmartScoreBadgeProps {
  score: number;
  className?: string;
}

export function SmartScoreBadge({ score, className }: SmartScoreBadgeProps) {
  const color =
    score >= 90
      ? "text-ios-green bg-ios-green/10"
      : score >= 75
        ? "text-ios-blue bg-ios-blue/10"
        : score >= 50
          ? "text-ios-orange bg-ios-orange/10"
          : "text-ios-red bg-ios-red/10";

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-md font-mono text-[0.6875rem] tabular-nums font-medium",
        color,
        className,
      )}
    >
      {score}
    </span>
  );
}
