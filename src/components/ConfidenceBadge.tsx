"use client";

import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number;
  className?: string;
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  const color =
    score >= 85
      ? "text-ios-green"
      : score >= 70
        ? "text-ios-blue"
        : score >= 50
          ? "text-ios-orange"
          : "text-ios-red";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[0.75rem] tabular-nums font-medium",
        color,
        className,
      )}
    >
      {score}%
    </span>
  );
}
