"use client";

import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useAuth } from "@/components/providers/auth-provider";
import { useFrameContext } from "@/components/providers/frame-provider";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";
import { truncateAddress } from "@/lib/utils";

// Fallback plan list shown when API is unreachable
const FALLBACK_PLANS = [
  { id: "free", name: "Free", price: 0, limits: { signalsPerDay: 5 } },
  { id: "pro", name: "Pro Trader", price: 29, limits: { signalsPerDay: -1 } },
  { id: "quant", name: "Quant Research", price: 99, limits: { signalsPerDay: -1 } },
];

function formatPrice(price: number): string {
  if (price === 0) return "$0";
  return `$${price}/mo`;
}

function planFeatures(plan: { name: string; limits: Record<string, number> }): string[] {
  const features: string[] = [];
  const daily = plan.limits.signalsPerDay;
  if (daily === -1 || daily === undefined) {
    features.push("Unlimited signals");
  } else {
    features.push(`${daily} signals/day`);
  }
  if (plan.name.toLowerCase().includes("pro") || plan.name.toLowerCase().includes("quant")) {
    features.push("AI insights");
    features.push("Alert customization");
  }
  if (plan.name.toLowerCase().includes("quant")) {
    features.push("API access");
    features.push("Cluster analysis");
  }
  return features;
}

export default function ProfilePage() {
  const { data: plans, loading: plansLoading } = useApiData(() => api.plans(), FALLBACK_PLANS);

  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, signIn, signOut, isLoading: authLoading, walletAddress } = useAuth();
  const { isInMiniApp } = useFrameContext();

  // Auto sign-in via SIWE once the wallet is connected
  useEffect(() => {
    if (isConnected && !isAuthenticated && !authLoading) {
      signIn().catch(() => {});
    }
  }, [isConnected, isAuthenticated, authLoading, signIn]);

  function handleConnect() {
    // Inside a Farcaster frame use the miniapp connector; outside use Base (Coinbase) wallet
    const connector = isInMiniApp
      ? (connectors.find((c) => c.id === "farcasterMiniApp") ?? connectors[0])
      : (connectors.find((c) => c.id === "coinbaseWalletSDK") ?? connectors[1]);
    if (connector) connect({ connector });
  }

  function handleDisconnect() {
    signOut();
    disconnect();
  }

  const displayAddress = walletAddress ?? address;

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Profile" />

      <div className="flex-1 pb-24 px-4">
        {isConnected ? (
          <div className="mt-8">
            <div className="bg-ios-card rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.75rem] text-white/50 mb-1">Connected wallet</p>
                  <p className="font-mono text-[0.875rem] text-white">
                    {displayAddress ? truncateAddress(displayAddress) : "-"}
                  </p>
                </div>
                {isAuthenticated ? (
                  <span className="text-[0.75rem] font-medium text-[#00D395]">Signed in</span>
                ) : authLoading ? (
                  <span className="text-[0.75rem] text-white/50">Signing in...</span>
                ) : (
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    onClick={() => signIn().catch(() => {})}
                  >
                    Sign In
                  </AnimatedButton>
                )}
              </div>
            </div>
            <AnimatedButton
              variant="outline"
              size="md"
              className="w-full"
              onClick={handleDisconnect}
            >
              Disconnect
            </AnimatedButton>
          </div>
        ) : (
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
            <AnimatedButton variant="primary" size="lg" onClick={handleConnect}>
              Connect Wallet
            </AnimatedButton>
          </div>
        )}

        {/* Subscription tiers */}
        <div className="mt-10">
          <h3 className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-ios-text-secondary mb-3">
            Plans
          </h3>
          {plansLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="h-[88px] rounded-2xl bg-ios-bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => {
                const features = planFeatures(plan);
                return (
                  <div
                    key={plan.id ?? plan.name}
                    className="border border-ios-separator rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[0.875rem] font-medium text-ios-text">{plan.name}</span>
                      <span className="text-[0.875rem] font-mono tabular-nums text-ios-blue">
                        {formatPrice(plan.price)}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {features.map((f) => (
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
