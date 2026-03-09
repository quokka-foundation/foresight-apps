"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { InsightCard } from "@/components/InsightCard";
import { Section } from "@/components/Section";
import { SignalCard } from "@/components/SignalCard";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { useApiData } from "@/hooks/useApiData";
import { useEarthquake } from "@/hooks/useEarthquake";
import { api } from "@/lib/api";
import { MOCK_INSIGHTS, MOCK_SIGNALS } from "@/lib/mock-data";
import type { SignalType } from "@/lib/types";

const FILTER_OPTIONS = ["All", "Smart Money", "Whale", "Liquidity", "Momentum", "Cluster"];

const FILTER_MAP: Record<string, SignalType | null> = {
  All: null,
  "Smart Money": "SMART_MONEY_ENTRY",
  Whale: "WHALE_ENTRY",
  Liquidity: "LIQUIDITY_SURGE",
  Momentum: "EARLY_MOMENTUM",
  Cluster: "COORDINATED_CLUSTER",
};

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const { shaking, triggerEarthquake } = useEarthquake();

  // Fire earthquake once on mount after a brief delay
  useEffect(() => {
    const t = setTimeout(triggerEarthquake, 300);
    return () => clearTimeout(t);
  }, [triggerEarthquake]);

  const { data: signals, loading: signalsLoading } = useApiData(() => api.feed(), MOCK_SIGNALS);
  const { data: insights, loading: insightsLoading } = useApiData(
    () => api.insights(1),
    MOCK_INSIGHTS,
  );

  const filteredSignals = useMemo(() => {
    const filterType = FILTER_MAP[activeFilter];
    if (!filterType) return signals;
    return signals.filter((s) => s.type === filterType);
  }, [activeFilter, signals]);

  return (
    <div
      className={`flex flex-col min-h-screen max-w-[430px] mx-auto bg-white ${shaking ? "animate-earthquake" : ""}`}
    >
      <TopBar
        title="Foresight"
        action={<div className="w-2 h-2 rounded-full bg-ios-green animate-pulse" />}
      />

      {/* AI Insight banner */}
      <Section title="AI Insight">
        {insightsLoading ? (
          <div className="mx-4 h-[88px] rounded-2xl bg-ios-bg-secondary animate-pulse" />
        ) : insights[0] ? (
          <InsightCard insight={insights[0]} />
        ) : null}
      </Section>

      {/* Filters */}
      <FilterChips options={FILTER_OPTIONS} active={activeFilter} onSelect={setActiveFilter} />

      {/* Signal feed */}
      <div className="flex-1 px-4 pb-24 space-y-3">
        {signalsLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              <div key={i} className="h-[120px] rounded-2xl bg-ios-bg-secondary animate-pulse" />
            ))}
          </>
        ) : (
          <>
            {filteredSignals.map((signal, i) => (
              <SignalCard key={signal.id} signal={signal} index={i} />
            ))}
            {filteredSignals.length === 0 && (
              <div className="text-center mt-20">
                <p className="text-ios-text-secondary text-[0.875rem]">
                  No signals match this filter
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <TabBar />
    </div>
  );
}
