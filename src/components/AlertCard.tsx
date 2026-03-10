"use client";

import type { AlertHistoryItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { SignalTypeBadge } from "./SignalTypeBadge";

interface AlertCardProps {
  alert: AlertHistoryItem;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-ios-bg-secondary rounded-xl transition-colors">
      {/* Dot */}
      <div className="w-2 h-2 rounded-full bg-ios-blue mt-1.5 flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <SignalTypeBadge type={alert.signalType} />
          <span className="text-[0.6875rem] text-ios-text-tertiary font-mono tabular-nums">
            {timeAgo(alert.triggeredAt)}
          </span>
        </div>
        <p className="text-[0.8125rem] text-ios-text leading-[140%]">{alert.message}</p>
      </div>
    </div>
  );
}
