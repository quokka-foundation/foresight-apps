"use client";

import { AnimatedButton } from "@/components/AnimatedButton";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Profile" />

      <div className="flex-1 pb-24 px-4">
        {/* Connect wallet CTA */}
        <div className="mt-8 text-center">
          <div className="w-16 h-16 mx-auto bg-ios-bg-secondary rounded-full flex items-center justify-center mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
          </div>
          <h2 className="font-sans text-[1.25rem] font-medium text-ios-text mb-2">
            Connect Wallet
          </h2>
          <p className="text-[0.875rem] text-ios-text-secondary mb-6 max-w-[280px] mx-auto">
            Sign in with your wallet to access premium features and manage your subscription.
          </p>
          <AnimatedButton variant="primary" size="lg">
            Connect Wallet
          </AnimatedButton>
        </div>

        {/* Subscription tiers */}
        <div className="mt-10">
          <h3 className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-ios-text-secondary mb-3">
            Plans
          </h3>
          <div className="space-y-3">
            {[
              { name: "Free", price: "$0", features: ["5 signals/day", "Basic filters"] },
              {
                name: "Pro Trader",
                price: "$29/mo",
                features: ["Unlimited signals", "AI insights", "Alert customization"],
              },
              {
                name: "Quant Research",
                price: "$99/mo",
                features: [
                  "Everything in Pro",
                  "API access",
                  "Cluster analysis",
                  "Priority support",
                ],
              },
            ].map((plan) => (
              <div key={plan.name} className="border border-ios-separator rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.875rem] font-medium text-ios-text">{plan.name}</span>
                  <span className="text-[0.875rem] font-mono tabular-nums text-ios-blue">
                    {plan.price}
                  </span>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="text-[0.75rem] text-ios-text-secondary flex items-center gap-2"
                    >
                      <span className="text-ios-green">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
