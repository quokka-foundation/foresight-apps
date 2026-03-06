'use client';

import { motion } from 'framer-motion';
import { TabBar } from '@/components/TabBar';
import { PillCTA } from '@/components/PillCTA';
import Title, { Text, TitleLevel, TextVariant } from '@/components/Typography';
import { APP_URL } from '@/lib/constants';

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

export default function CreateMarketPage() {
  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg safe-area-top border-b border-base-gray-50">
        <div className="px-5 py-4">
          <Title level={TitleLevel.H2Medium} className="text-illoblack">Create Market</Title>
        </div>
      </header>

      <div className="flex-1 px-5 pb-24">
        {/* Hero */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 text-center"
        >
          <motion.div variants={itemVariants}>
            <div className="w-16 h-16 mx-auto bg-base-gray-25 rounded-2xl flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Title level={TitleLevel.H3Medium} className="text-illoblack mb-2">Create a Curve Market</Title>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Text variant={TextVariant.Body} className="text-base-gray-200 max-w-[300px] mx-auto leading-relaxed">
              Launch a continuous outcome market for any real-world event.
              Markets go live instantly on Base.
            </Text>
          </motion.div>
        </motion.div>

        {/* Form */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 space-y-5"
        >
          {/* Question */}
          <motion.div variants={itemVariants}>
            <label className="block mb-2">
              <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                Market Question
              </Text>
            </label>
            <input
              type="text"
              placeholder="Will BTC reach $200K by December 2026?"
              className="w-full bg-base-gray-25 rounded-xl px-4 py-3 text-[0.8125rem] font-sans text-illoblack placeholder-base-gray-100 focus:ring-1 focus:ring-illoblack/10 focus:outline-none transition-all"
            />
          </motion.div>

          {/* Category */}
          <motion.div variants={itemVariants}>
            <label className="block mb-2">
              <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                Category
              </Text>
            </label>
            <div className="flex flex-wrap gap-2">
              {['Crypto', 'Politics', 'Economics', 'Sports', 'Tech', 'Culture'].map((cat) => (
                <button
                  key={cat}
                  className="py-2 px-4 bg-base-gray-25 rounded-lg text-[0.75rem] font-medium text-base-gray-200 hover:bg-illoblack hover:text-white transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Outcomes */}
          <motion.div variants={itemVariants}>
            <label className="block mb-2">
              <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                Outcomes
              </Text>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Trump', 'Harris', 'RFK', 'Other'].map((outcome) => (
                <div
                  key={outcome}
                  className="py-2.5 bg-base-gray-25 rounded-xl text-[0.75rem] font-medium text-base-gray-200 text-center"
                >
                  {outcome}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Resolution date */}
          <motion.div variants={itemVariants}>
            <label className="block mb-2">
              <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                Resolution Date
              </Text>
            </label>
            <input
              type="date"
              className="w-full bg-base-gray-25 rounded-xl px-4 py-3 text-[0.8125rem] text-base-gray-200 focus:ring-1 focus:ring-illoblack/10 focus:outline-none transition-all"
            />
          </motion.div>

          {/* Initial liquidity */}
          <motion.div variants={itemVariants}>
            <label className="block mb-2">
              <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                Initial Liquidity (USDC)
              </Text>
            </label>
            <input
              type="number"
              placeholder="1000"
              className="w-full bg-base-gray-25 rounded-xl px-4 py-3 text-[0.8125rem] font-sans text-illoblack placeholder-base-gray-100 focus:ring-1 focus:ring-illoblack/10 focus:outline-none transition-all"
            />
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants} className="pt-2">
            <PillCTA
              label="Launch via Frame"
              variant="blue"
              disabled
            />
            <Text variant={TextVariant.CaptionMono} className="text-base-gray-100 text-center mt-3">
              Coming Soon
            </Text>
          </motion.div>
        </motion.div>

        {/* Frame bridge info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-illoblack rounded-2xl p-5"
        >
          <Text variant={TextVariant.CaptionMono} className="text-white/50 mb-2">
            Frame Bridge
          </Text>
          <Text variant={TextVariant.Body} className="text-white/70 leading-relaxed">
            Share your market as a Farcaster Frame for maximum reach.
            Cast your market URL to let anyone trade directly from their feed.
          </Text>
          <div className="mt-4 bg-white/10 rounded-xl p-3 text-center">
            <code className="font-mono text-[0.6875rem] text-ios-blue break-all font-medium tracking-[0.02em]">
              {APP_URL}/curve/your-market-id
            </code>
          </div>
        </motion.div>
      </div>

      <TabBar />
    </div>
  );
}
