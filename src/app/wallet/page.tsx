'use client';

import { motion } from 'framer-motion';
import { TabBar } from '@/components/TabBar';
import { PillCTA } from '@/components/PillCTA';
import { AssetRow } from '@/components/AssetRow';
import { AnimatedText } from '@/components/AnimatedText';
import Title, { Text, TitleLevel, TextVariant } from '@/components/Typography';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { base } from 'wagmi/chains';
import { formatEther } from 'viem';

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

export default function WalletPage() {
  const { isConnected, address, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const isOnBase = chainId === base.id;
  const formattedBalance = balance
    ? parseFloat(formatEther(balance.value)).toFixed(4)
    : '0.0000';

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg safe-area-top border-b border-base-gray-50">
        <div className="px-5 py-4">
          <Title level={TitleLevel.H2Medium} className="text-illoblack">Wallet</Title>
        </div>
      </header>

      <div className="flex-1 px-5 pb-24">
        {isConnected ? (
          <>
            {/* Balance hero */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 text-center"
            >
              <motion.div variants={itemVariants}>
                <Text variant={TextVariant.CaptionMono} className="text-base-gray-200 mb-3">
                  Balance
                </Text>
              </motion.div>
              <motion.div variants={itemVariants} className="flex justify-center">
                <AnimatedText
                  text={`$${formattedBalance}`}
                  titleLevel={TitleLevel.H0Medium}
                  delay={0.1}
                />
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center justify-center gap-1.5 mt-3">
                <div className={`w-1.5 h-1.5 rounded-full ${isOnBase ? 'bg-ios-green' : 'bg-ios-orange'}`} />
                <Text variant={TextVariant.CaptionMono} className="text-base-gray-200">
                  {isOnBase ? 'Base Mainnet' : `Chain ${chainId}`}
                </Text>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Text variant={TextVariant.Caption} className="text-base-gray-100 mt-1">
                  USDC on Base
                </Text>
              </motion.div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6 flex gap-3"
            >
              <PillCTA label="Transfer" variant="outline" size="md" />
              <PillCTA label="Buy & sell" variant="blue" size="md" />
            </motion.div>

            {/* Asset list */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 space-y-2.5"
            >
              <motion.div variants={itemVariants}>
                <AssetRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  }
                  label="Crypto"
                  value={`$${formattedBalance}`}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <AssetRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v12M8 10h8M8 14h8" />
                    </svg>
                  }
                  label="Cash"
                  value="$0.00"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <AssetRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                    </svg>
                  }
                  label="Predictions"
                  value="$0.00"
                />
              </motion.div>
            </motion.div>

            {/* Wallet info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 bg-illoblack rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-mono text-sm text-white font-medium">{shortAddress}</p>
                    <Text variant={TextVariant.CaptionMono} className="text-white/50 mt-0.5">
                      {isOnBase ? 'Base Mainnet' : `Chain ${chainId}`}
                    </Text>
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-xs text-white/50 hover:text-white/70 font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          </>
        ) : (
          /* Not connected */
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="mt-20 text-center"
          >
            <motion.div variants={itemVariants}>
              <div className="w-20 h-20 mx-auto bg-base-gray-25 rounded-3xl flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth="1.5">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Title level={TitleLevel.H3Medium} className="text-illoblack mb-2">Connect Wallet</Title>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Text variant={TextVariant.Body} className="text-base-gray-200 max-w-[280px] mx-auto mb-8 leading-relaxed">
                Connect your wallet to view balances and start trading prediction markets.
              </Text>
            </motion.div>
            <motion.div variants={itemVariants}>
              <PillCTA
                label="Connect Wallet"
                variant="blue"
                onClick={() => connectors[0] && connect({ connector: connectors[0] })}
              />
            </motion.div>
          </motion.div>
        )}
      </div>

      <TabBar />
    </div>
  );
}
