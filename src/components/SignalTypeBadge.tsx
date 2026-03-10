"use client";

import { SIGNAL_TYPE_CONFIG } from "@/lib/mock-data";
import type { SignalType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SignalTypeBadgeProps {
  type: SignalType;
  className?: string;
}

export function SignalTypeBadge({ type, className }: SignalTypeBadgeProps) {
  const config = SIGNAL_TYPE_CONFIG[type];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-medium tracking-[0.01em]",
        className,
      )}
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      {config.label}
    </span>
  );
}
