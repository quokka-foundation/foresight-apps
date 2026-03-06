'use client';

import { motion } from 'framer-motion';
import { TabBar } from '@/components/TabBar';
import { PortfolioCard } from '@/components/PortfolioCard';
import { PillCTA } from '@/components/PillCTA';
import { AnimatedText } from '@/components/AnimatedText';
import Title, { Text, TitleLevel, TextVariant } from '@/components/Typography';
import { MOCK_POSITIONS, MOCK_PORTFOLIO, formatUSD, formatPercent } from '@/lib/mock-data';

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function PortfolioPage() {
  const portfolio = MOCK_PORTFOLIO;
  const positions = MOCK_POSITIONS;
  const isProfit = portfolio.totalPnl >= 0;

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg safe-area-top border-b border-base-gray-50">
        <div className="px-5 py-4">
          <Title level={TitleLevel.H2Medium} className="text-illoblack">Portfolio</Title>
        </div>
      </header>

      <div className="flex-1 px-5 pb-24">
        {/* Portfolio hero */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 text-center"
        >
          <motion.div variants={itemVariants}>
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-200 mb-3">
              Total Value
            </Text>
          </motion.div>
          <motion.div variants={itemVariants} className="flex justify-center">
            <AnimatedText
              text={formatUSD(portfolio.totalValue)}
              titleLevel={TitleLevel.H0Medium}
              delay={0.1}
            />
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mt-3">
            <span className={`font-mono text-lg font-medium ${isProfit ? 'text-ios-green' : 'text-ios-red'}`}>
              {formatPercent(portfolio.totalPnlPercent)}
            </span>
            <span className={`font-mono text-sm ${isProfit ? 'text-ios-green/70' : 'text-ios-red/70'}`}>
              ({isProfit ? '+' : ''}{formatUSD(portfolio.totalPnl)})
            </span>
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-8 flex gap-3"
        >
          <PillCTA label="Transfer" variant="outline" size="md" />
          <PillCTA label="Buy & sell" variant="blue" size="md" />
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mt-6 grid grid-cols-3 gap-2.5"
        >
          <motion.div variants={itemVariants} className="bg-base-gray-25 rounded-xl p-3.5 text-center">
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">Invested</Text>
            <Text variant={TextVariant.BodyMono} className="text-illoblack mt-1">{formatUSD(portfolio.totalInvested)}</Text>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-base-gray-25 rounded-xl p-3.5 text-center">
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">Positions</Text>
            <Text variant={TextVariant.BodyMono} className="text-illoblack mt-1">{portfolio.openPositions}</Text>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-base-gray-25 rounded-xl p-3.5 text-center">
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">Win Rate</Text>
            <Text variant={TextVariant.BodyMono} className="text-ios-green mt-1">{portfolio.winRate}%</Text>
          </motion.div>
        </motion.div>

        {/* Yield info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-4 bg-illoblack rounded-xl p-4 flex items-center justify-between"
        >
          <Text variant={TextVariant.Body} className="text-white/70">Daily Yield</Text>
          <span className="font-mono text-sm font-medium text-ios-green">$0.31</span>
        </motion.div>

        {/* Positions */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
              Open Positions ({positions.length})
            </Text>
          </div>

          <div className="space-y-2.5">
            {positions.map((position, i) => (
              <PortfolioCard key={position.id} position={position} index={i} />
            ))}
          </div>
        </div>

        {/* Empty state */}
        {positions.length === 0 && (
          <div className="mt-16 text-center">
            <div className="w-14 h-14 mx-auto bg-base-gray-25 rounded-2xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <Title level={TitleLevel.H6Regular} className="text-base-gray-200">No positions yet</Title>
            <Text variant={TextVariant.Caption} className="text-base-gray-100 mt-1.5">
              Start trading curves to build your portfolio
            </Text>
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}
