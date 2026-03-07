"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabBar } from "@/components/TabBar";
import { MarketCard } from "@/components/MarketCard";
import { MarketRowCompact } from "@/components/MarketRowCompact";
import { FilterChips } from "@/components/FilterChips";
import { AnimatedText } from "@/components/AnimatedText";
import { InteractiveCard } from "@/components/InteractiveCard";
import Title, { Text, TitleLevel, TextVariant } from "@/components/Typography";
import {
  MOCK_MARKETS,
  MOCK_PORTFOLIO,
  formatUSD,
  formatPercent,
} from "@/lib/mock-data";

const CATEGORY_TABS = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "all", label: "All" },
  { id: "politics", label: "Politics" },
  { id: "crypto", label: "Crypto" },
  { id: "economics", label: "Economics" },
  { id: "sports", label: "Sports" },
  { id: "tech", label: "Tech" },
] as const;

const FILTER_CHIPS = [
  "All Markets",
  "Trending",
  "Crypto",
  "Politics",
  "Sports",
];

// Animation variants matching Base website Section pattern
const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("trending");
  const [activeChip, setActiveChip] = useState("All Markets");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMarkets = useMemo(() => {
    let markets = [...MOCK_MARKETS];

    if (
      activeTab !== "trending" &&
      activeTab !== "new" &&
      activeTab !== "all"
    ) {
      markets = markets.filter((m) => m.category === activeTab);
    }

    if (activeChip !== "All Markets" && activeChip !== "Trending") {
      const chipCat = activeChip.toLowerCase();
      markets = markets.filter((m) => m.category === chipCat);
    }

    if (activeTab === "trending" || activeChip === "Trending") {
      markets.sort((a, b) => b.volume24h - a.volume24h);
    }
    if (activeTab === "new") {
      markets.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      markets = markets.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.includes(q)),
      );
    }

    return markets;
  }, [activeTab, activeChip, searchQuery]);

  const featuredMarket = filteredMarkets[0];
  const restMarkets = filteredMarkets.slice(1);

  const pnlPositive = MOCK_PORTFOLIO.totalPnl >= 0;

  return (
    <>
      <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg safe-area-top border-b border-base-gray-50">
          <div className="px-5 pt-5 pb-3">
            {/* Top bar */}
            <div className="flex items-center gap-3 mb-5">
              <button
                className="p-1 text-illoblack hover:opacity-60 transition-opacity"
                aria-label="Menu"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {/* Search */}
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-gray-200"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search markets"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-base-gray-25 rounded-xl pl-9 pr-4 py-2 text-[0.8125rem] font-sans text-illoblack placeholder-base-gray-200 focus:outline-none focus:ring-1 focus:ring-illoblack/10 transition-all"
                />
              </div>

              <button
                className="p-1 text-base-gray-200 hover:text-illoblack transition-colors"
                aria-label="Info"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex overflow-x-auto no-scrollbar px-5 gap-5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap pb-3 text-[0.8125rem] tracking-[-0.01em] transition-all ${
                  activeTab === tab.id
                    ? "text-illoblack font-medium"
                    : "text-base-gray-200 hover:text-base-gray-100"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-illoblack rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Portfolio Summary — Base-style hero with AnimatedText */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="px-5 pt-7 pb-2"
        >
          <motion.div variants={itemVariants}>
            <Text
              variant={TextVariant.CaptionMono}
              className="text-base-gray-200 mb-1"
            >
              Portfolio Value
            </Text>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-baseline gap-3"
          >
            <AnimatedText
              text={formatUSD(MOCK_PORTFOLIO.totalValue)}
              titleLevel={TitleLevel.H1Medium}
              delay={0.1}
            />
            <span
              className={`font-mono text-sm tracking-tight ${
                pnlPositive ? "text-ios-green" : "text-ios-red"
              }`}
            >
              {pnlPositive ? "+" : ""}
              {formatPercent(MOCK_PORTFOLIO.totalPnlPercent)}
            </span>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={itemVariants} className="flex gap-6 mt-5">
            <div>
              <Text
                variant={TextVariant.CaptionMono}
                className="text-base-gray-200"
              >
                Invested
              </Text>
              <Text
                variant={TextVariant.BodyMono}
                className="text-illoblack mt-0.5"
              >
                {formatUSD(MOCK_PORTFOLIO.totalInvested)}
              </Text>
            </div>
            <div>
              <Text
                variant={TextVariant.CaptionMono}
                className="text-base-gray-200"
              >
                Positions
              </Text>
              <Text
                variant={TextVariant.BodyMono}
                className="text-illoblack mt-0.5"
              >
                {MOCK_PORTFOLIO.openPositions}
              </Text>
            </div>
            <div>
              <Text
                variant={TextVariant.CaptionMono}
                className="text-base-gray-200"
              >
                Win Rate
              </Text>
              <Text
                variant={TextVariant.BodyMono}
                className="text-illoblack mt-0.5"
              >
                {MOCK_PORTFOLIO.winRate}%
              </Text>
            </div>
          </motion.div>
        </motion.section>

        {/* Divider */}
        <div className="mx-5 my-4 h-px bg-base-gray-50" />

        {/* Filter chips */}
        <div className="pb-2">
          <FilterChips
            categories={FILTER_CHIPS}
            activeCategory={activeChip}
            onSelect={setActiveChip}
          />
        </div>

        {/* Market feed */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="flex-1 px-5 pb-24"
        >
          {/* Featured market with InteractiveCard WebGL effect */}
          {featuredMarket && (
            <motion.div variants={itemVariants} className="mb-5">
              <InteractiveCard
                imageSrc="/patterns/pat-candles.svg"
                patternSrc="/patterns/pat3.png"
                brightness={0.05}
                contrast={1.1}
                borderRadius={16}
                className="rounded-2xl overflow-hidden"
              >
                <MarketCard
                  market={featuredMarket}
                  index={0}
                  variant="featured"
                />
              </InteractiveCard>
            </motion.div>
          )}

          {/* Section label */}
          {restMarkets.length > 0 && (
            <motion.div variants={itemVariants} className="mb-3">
              <Text
                variant={TextVariant.CaptionMono}
                className="text-base-gray-200"
              >
                Markets
              </Text>
            </motion.div>
          )}

          {/* Compact rows */}
          <div className="space-y-2.5">
            {restMarkets.map((market) => (
              <motion.div key={market.id} variants={itemVariants}>
                <MarketRowCompact market={market} />
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {filteredMarkets.length === 0 && (
            <div className="text-center mt-20">
              <div className="w-14 h-14 mx-auto bg-base-gray-25 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <Title
                level={TitleLevel.H6Regular}
                className="text-base-gray-200"
              >
                No markets found
              </Title>
              <Text
                variant={TextVariant.Caption}
                className="text-base-gray-100 mt-1"
              >
                Try a different search or category
              </Text>
            </div>
          )}
        </motion.div>

        <TabBar />
      </div>
    </>
  );
}
