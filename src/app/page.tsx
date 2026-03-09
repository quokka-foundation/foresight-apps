"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { InsightCard } from "@/components/InsightCard";
import { Section } from "@/components/Section";
import { SignalCard } from "@/components/SignalCard";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
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

  const filteredSignals = useMemo(() => {
    const filterType = FILTER_MAP[activeFilter];
    if (!filterType) return MOCK_SIGNALS;
    return MOCK_SIGNALS.filter((s) => s.type === filterType);
  }, [activeFilter]);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar
        title="Foresight"
        action={<div className="w-2 h-2 rounded-full bg-ios-green animate-pulse" />}
      />

      {/* AI Insight banner */}
      {MOCK_INSIGHTS[0] && (
        <Section title="AI Insight">
          <InsightCard insight={MOCK_INSIGHTS[0]} />
        </Section>
      )}

      {/* Filters */}
      <FilterChips options={FILTER_OPTIONS} active={activeFilter} onSelect={setActiveFilter} />

      {/* Signal feed */}
      <div className="flex-1 px-4 pb-24 space-y-3">
        {filteredSignals.map((signal, i) => (
          <SignalCard key={signal.id} signal={signal} index={i} />
        ))}

        {filteredSignals.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-ios-text-secondary text-[0.875rem]">No signals match this filter</p>
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}
