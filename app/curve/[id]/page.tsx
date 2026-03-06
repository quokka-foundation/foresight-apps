'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { TradingViewChart, type TimeRange } from '@/components/TradingViewChart';
import { ProbabilitySlider } from '@/components/ProbabilitySlider';
import { PillCTA } from '@/components/PillCTA';
import { BackArrow } from '@/components/BackArrow';
import { StatusBadge } from '@/components/StatusBadge';
import { MarketRowCompact } from '@/components/MarketRowCompact';
import { TradeConfirmModal } from '@/components/TradeConfirmModal';
import Title, { Text, TitleLevel, TextVariant } from '@/components/Typography';
import {
  getMarketById,
  generateCurveHistory,
  formatUSD,
  LEVERAGE_OPTIONS,
  CATEGORY_CONFIG,
  MOCK_MARKETS,
  MOCK_POSITIONS,
  curveToChartData,
  curveToVolumeData,
  generatePnlOverlay,
  generatePositionMarkers,
  filterByTimeRange,
} from '@/lib/mock-data';
import { calculatePayout, calculateSafetyScore } from '@/lib/curve-math';
import { DEFAULT_TRADE_AMOUNT, SAFE_LEVERAGE_THRESHOLD, CATEGORY_PATTERNS } from '@/lib/constants';

const CardScene = dynamic(
  () => import('@/components/CardScene').then((m) => m.CardScene),
  { ssr: false },
);

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function CurveDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const market = getMarketById(params.id);

  const [probability, setProbability] = useState(market?.probability ?? 50);
  const [leverage, setLeverage] = useState(1);
  const [amount, setAmount] = useState(DEFAULT_TRADE_AMOUNT);
  const [direction, setDirection] = useState<'yes' | 'no'>('yes');
  const [showConfirm, setShowConfirm] = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  const curveData = useMemo(
    () => market ? generateCurveHistory(market.id, market.probability, 30) : [],
    [market]
  );

  const chartProbData = useMemo(() => curveToChartData(curveData), [curveData]);
  const chartVolData = useMemo(() => curveToVolumeData(curveData), [curveData]);

  const userPosition = useMemo(
    () => MOCK_POSITIONS.find((p) => p.marketId === market?.id),
    [market]
  );

  const chartPnlData = useMemo(
    () => userPosition ? generatePnlOverlay(curveData, userPosition) : undefined,
    [curveData, userPosition]
  );
  const chartMarkers = useMemo(
    () => userPosition ? generatePositionMarkers(userPosition) : undefined,
    [userPosition]
  );

  const filteredProbData = useMemo(
    () => filterByTimeRange(chartProbData, timeRange),
    [chartProbData, timeRange]
  );

  const isPositive = market ? market.change24h >= 0 : true;

  const potentialPayout = useMemo(
    () => calculatePayout(amount, probability, leverage),
    [amount, probability, leverage]
  );

  const safetyScore = useMemo(() => calculateSafetyScore(leverage), [leverage]);
  const isSafe = safetyScore >= SAFE_LEVERAGE_THRESHOLD;

  const relatedMarkets = useMemo(() => {
    if (!market) return [];
    return MOCK_MARKETS.filter((m) => m.category === market.category && m.id !== market.id).slice(0, 3);
  }, [market]);

  const noProb = market ? 100 - market.probability : 50;
  const yesPayout = market ? Math.round(100 / (market.probability / 100)) : 0;
  const noPayout = market ? Math.round(100 / (noProb / 100)) : 0;

  const handleTrade = useCallback(async () => {
    setTradeLoading(true);
    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId: market?.id,
          probability,
          amount,
          leverage,
          direction,
        }),
      });
      if (res.ok) {
        setTradeSuccess(true);
        setTimeout(() => {
          setShowConfirm(false);
          setTradeSuccess(false);
        }, 2000);
      }
    } catch {
      setTradeSuccess(true);
      setTimeout(() => {
        setShowConfirm(false);
        setTradeSuccess(false);
      }, 2000);
    } finally {
      setTradeLoading(false);
    }
  }, [market, probability, amount, leverage, direction]);

  if (!market) {
    return (
      <div className="flex items-center justify-center min-h-screen max-w-[430px] mx-auto bg-white">
        <div className="text-center p-8">
          <Title level={TitleLevel.H5Medium} className="text-illoblack mb-3">Market not found</Title>
          <button onClick={() => router.push('/')} className="text-ios-blue text-sm font-medium">
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  const category = CATEGORY_CONFIG[market.category] || { label: market.category, color: '#6E6E73' };

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      {/* Minimal floating header */}
      <header className="sticky top-0 z-40 safe-area-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <BackArrow onClick={() => router.back()} />
          <StatusBadge label="LIVE" variant="green" pulse glow />
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* CardScene hero — halftone 3D visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
          className="mx-5 mb-4 rounded-2xl overflow-hidden"
        >
          <CardScene
            color={category.color}
            dotScale={7}
            patternSrc={CATEGORY_PATTERNS[market.category]}
            patternColumns={6}
            width={390}
            height={160}
            className="rounded-2xl"
          />
        </motion.div>

        {/* Chart — edge-to-edge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="-mt-14"
        >
          <TradingViewChart
            probabilityData={filteredProbData}
            volumeData={chartVolData}
            pnlData={chartPnlData}
            markers={chartMarkers}
            activeRange={timeRange}
            onRangeChange={setTimeRange}
            height={240}
            isPositive={isPositive}
          />
        </motion.div>

        {/* Market info */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="px-5 pt-5 pb-2"
        >
          <motion.div variants={itemVariants}>
            <Title level={TitleLevel.H5Medium} className="text-illoblack leading-tight">
              {market.title}
            </Title>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Text variant={TextVariant.Body} className="text-base-gray-200 mt-2 leading-relaxed">
              {market.description}
            </Text>
          </motion.div>
        </motion.div>

        {/* Outcome pills */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="px-5 mt-5"
        >
          <motion.div variants={itemVariants} className="flex gap-3 mb-2">
            <button
              onClick={() => setDirection('yes')}
              className={`flex-1 py-3.5 rounded-xl text-center transition-all text-[0.8125rem] font-medium tracking-[-0.01em] ${
                direction === 'yes'
                  ? 'bg-illoblack text-white shadow-md'
                  : 'bg-base-gray-25 text-illoblack hover:bg-base-gray-50'
              }`}
            >
              YES &middot; {market.probability.toFixed(0)}%
            </button>
            <button
              onClick={() => setDirection('no')}
              className={`flex-1 py-3.5 rounded-xl text-center transition-all text-[0.8125rem] font-medium tracking-[-0.01em] ${
                direction === 'no'
                  ? 'bg-illoblack text-white shadow-md'
                  : 'bg-base-gray-25 text-illoblack hover:bg-base-gray-50'
              }`}
            >
              NO &middot; {noProb.toFixed(0)}%
            </button>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-3">
            <div className="flex-1 text-center">
              <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                $100 &rarr;{' '}
                <span className="text-ios-green font-medium">${yesPayout}</span>
              </Text>
            </div>
            <div className="flex-1 text-center">
              <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                $100 &rarr;{' '}
                <span className="text-ios-green font-medium">${noPayout}</span>
              </Text>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-2.5 px-5 mt-7"
        >
          {[
            { label: 'Vol 24h', value: formatUSD(market.volume24h) },
            { label: 'Liquidity', value: formatUSD(market.liquidity) },
            { label: 'Total Vol', value: formatUSD(market.totalVolume) },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-base-gray-25 rounded-xl p-3.5 text-center"
            >
              <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                {stat.label}
              </Text>
              <Text variant={TextVariant.BodyMono} className="text-illoblack mt-1">
                {stat.value}
              </Text>
            </motion.div>
          ))}
        </motion.div>

        {/* Probability Slider */}
        <div className="px-5 mt-7">
          <ProbabilitySlider
            value={probability}
            onChange={setProbability}
          />
        </div>

        {/* Leverage */}
        <div className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
              Leverage
            </Text>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isSafe ? 'bg-ios-green' : 'bg-ios-orange'}`} />
              <Text variant={TextVariant.CaptionMono} className={isSafe ? 'text-ios-green' : 'text-ios-orange'}>
                {safetyScore}% safe
              </Text>
            </div>
          </div>
          <div className="relative bg-base-gray-25 rounded-xl p-1 flex">
            <motion.div
              className="absolute top-1 bottom-1 bg-white rounded-[10px] shadow-card"
              style={{ width: `${100 / LEVERAGE_OPTIONS.length}%` }}
              animate={{
                left: `${(LEVERAGE_OPTIONS.findIndex(o => o.multiplier === leverage) / LEVERAGE_OPTIONS.length) * 100}%`,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
            {LEVERAGE_OPTIONS.map((opt) => (
              <button
                key={opt.multiplier}
                onClick={() => setLeverage(opt.multiplier)}
                className={`relative z-10 flex-1 py-3 rounded-[10px] text-[0.8125rem] font-medium tracking-[-0.01em] transition-colors duration-200 ${
                  leverage === opt.multiplier
                    ? 'text-illoblack'
                    : 'text-base-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
              Amount (USDC)
            </Text>
          </div>
          <div className="relative bg-base-gray-25 rounded-xl p-1 flex">
            <motion.div
              className="absolute top-1 bottom-1 bg-white rounded-[10px] shadow-card"
              style={{ width: '25%' }}
              animate={{
                left: `${([10, 25, 50, 100].indexOf(amount) / 4) * 100}%`,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
            {[10, 25, 50, 100].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`relative z-10 flex-1 py-3 rounded-[10px] text-[0.8125rem] font-medium tracking-[-0.01em] transition-colors duration-200 ${
                  amount === a
                    ? 'text-illoblack'
                    : 'text-base-gray-200'
                }`}
              >
                ${a}
              </button>
            ))}
          </div>
        </div>

        {/* Payout preview */}
        <motion.div
          layout
          className="mx-5 mt-7 bg-illoblack rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <Text variant={TextVariant.CaptionMono} className="text-white/50">
                Your trade
              </Text>
              <Text variant={TextVariant.Body} className="text-white font-medium mt-1">
                {leverage}x {formatUSD(amount)} on {direction.toUpperCase()}
              </Text>
            </div>
            <div className="text-right">
              <Text variant={TextVariant.CaptionMono} className="text-white/50">
                Potential payout
              </Text>
              <p className="text-2xl font-mono font-medium text-ios-green mt-0.5 tracking-tight">
                {formatUSD(potentialPayout)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trade CTA */}
        <div className="px-5 mt-6">
          <PillCTA
            label={`TRADE ${formatUSD(amount)} → ${formatUSD(potentialPayout)}`}
            onClick={() => setShowConfirm(true)}
            variant="blue"
          />
        </div>

        {/* Related markets */}
        {relatedMarkets.length > 0 && (
          <div className="mt-8 px-5">
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-200 mb-3">
              Related Markets
            </Text>
            <div className="space-y-2.5">
              {relatedMarkets.map((m) => (
                <MarketRowCompact key={m.id} market={m} />
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        <div className="px-5 mt-6 mb-4">
          <Text variant={TextVariant.CaptionMono} className="text-base-gray-100">
            Resolution: {new Date(market.resolutionDate).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </Text>
        </div>
      </div>

      {/* Trade Confirm Modal */}
      <TradeConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleTrade}
        marketTitle={market.title}
        probability={probability}
        amount={amount}
        leverage={leverage}
        direction={direction}
        liquidity={market.liquidity}
        loading={tradeLoading}
      />

      {/* Success toast */}
      {tradeSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 max-w-[398px] mx-auto z-50 bg-ios-green/10 border border-ios-green/20 rounded-2xl p-5 text-center shadow-card"
        >
          <Text variant={TextVariant.Body} className="text-ios-green font-medium">
            Trade executed successfully!
          </Text>
          <Text variant={TextVariant.Caption} className="text-base-gray-200 mt-1">
            Check your portfolio for live P&amp;L
          </Text>
        </motion.div>
      )}
    </div>
  );
}
