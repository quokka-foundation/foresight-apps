"use client";

import { useEffect, useState } from "react";
import { AiChatWidget } from "@/components/AiChatWidget";
import { FilterChips } from "@/components/FilterChips";
import { InsightCard } from "@/components/InsightCard";
import { Section } from "@/components/Section";
import { SignalFeed } from "@/components/SignalFeed";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { useSignalInsight } from "@/hooks/useAiSummary";
import { useEarthquake } from "@/hooks/useEarthquake";
import { MOCK_INSIGHTS } from "@/lib/mock-data";
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

  // Fetch the latest AI insight — use mock while Supabase not configured
  const { data: insight, isLoading: insightLoading } = useSignalInsight(undefined);
  const displayInsight = insight ?? (insightLoading ? null : (MOCK_INSIGHTS[0] ?? null));

  const filterType = FILTER_MAP[activeFilter];

  return (
    <div
      className={`flex flex-col min-h-screen max-w-[430px] mx-auto bg-ios-bg ${shaking ? "animate-earthquake" : ""}`}
    >
      <TopBar title="Foresight" />

      {/* AI Insight banner */}
      <Section title="AI Insight">
        {insightLoading ? (
          <div className="mx-4 h-[88px] rounded-2xl bg-ios-bg-secondary animate-pulse" />
        ) : displayInsight ? (
          <InsightCard insight={displayInsight} />
        ) : null}
      </Section>

      {/* Filters */}
      <FilterChips options={FILTER_OPTIONS} active={activeFilter} onSelect={setActiveFilter} />

      {/* Live signal feed */}
      <div className="flex-1 pb-24">
        <SignalFeed filterType={filterType} />
      </div>

      <TabBar />
      <AiChatWidget />
    </div>
  );
}
