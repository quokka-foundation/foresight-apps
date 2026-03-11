"use client";

// SubscriptionGate — blurs content and shows an upgrade CTA for locked features.
// Pass `locked={false}` to render children normally (tier allows it).

import type { ReactNode } from "react";
import type { SubscriptionTierKey } from "@/lib/types";

interface SubscriptionGateProps {
  locked: boolean;
  /** Minimum tier required to unlock (used in CTA copy). */
  requiredTier?: SubscriptionTierKey;
  children: ReactNode;
}

const TIER_LABELS: Record<SubscriptionTierKey, string> = {
  free: "Free",
  pro: "Pro",
  elite: "Elite",
};

export function SubscriptionGate({
  locked,
  requiredTier = "pro",
  children,
}: SubscriptionGateProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="select-none pointer-events-none blur-sm opacity-60 saturate-50">
        {children}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 backdrop-blur-[2px] rounded-2xl">
        <span className="text-[0.75rem] font-medium text-ios-text text-center px-4">
          Upgrade to {TIER_LABELS[requiredTier]} to unlock
        </span>
        <a
          href="/profile"
          className="px-4 py-1.5 rounded-full bg-ios-blue text-white text-[0.75rem] font-semibold"
        >
          Upgrade
        </a>
      </div>
    </div>
  );
}
