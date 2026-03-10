"use client";

import { motion } from "framer-motion";
import { formatEther } from "viem";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { base } from "wagmi/chains";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useFrameContext } from "@/components/providers/frame-provider";
import { TabBar } from "@/components/TabBar";
import { TopBar } from "@/components/TopBar";
import { formatCompactUSD, truncateAddress } from "@/lib/utils";

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
  const { isInMiniApp } = useFrameContext();
  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  const isOnBase = chainId === base.id;
  const formattedBalance = balance ? parseFloat(formatEther(balance.value)).toFixed(4) : "0.0000";

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <TopBar title="Wallet" />

      <div className="flex-1 px-4 pb-24">
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
                <p className="text-[0.6875rem] font-mono uppercase tracking-[0.05em] text-ios-text-secondary mb-3">
                  Balance
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-[2rem] font-mono tabular-nums font-medium text-ios-text">
                  ${formattedBalance}
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-1.5 mt-3"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isOnBase ? "bg-ios-green" : "bg-ios-orange"}`}
                />
                <span className="text-[0.6875rem] font-mono uppercase tracking-[0.05em] text-ios-text-secondary">
                  {isOnBase ? "Base Mainnet" : `Chain ${chainId}`}
                </span>
              </motion.div>
              <motion.div variants={itemVariants}>
                <span className="text-[0.75rem] text-ios-text-tertiary mt-1 inline-block">
                  ETH on Base
                </span>
              </motion.div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6 flex gap-3"
            >
              <AnimatedButton variant="outline" size="md" className="flex-1">
                Transfer
              </AnimatedButton>
              <AnimatedButton variant="primary" size="md" className="flex-1">
                Buy &amp; sell
              </AnimatedButton>
            </motion.div>

            {/* Asset list */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 space-y-2"
            >
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between py-3 px-4 hover:bg-ios-bg-secondary rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span className="text-[0.875rem] font-medium text-ios-text">Crypto</span>
                  </div>
                  <span className="text-[0.875rem] font-mono tabular-nums text-ios-text">
                    ${formattedBalance}
                  </span>
                </div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between py-3 px-4 hover:bg-ios-bg-secondary rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v12M8 10h8M8 14h8" />
                      </svg>
                    </div>
                    <span className="text-[0.875rem] font-medium text-ios-text">Stablecoins</span>
                  </div>
                  <span className="text-[0.875rem] font-mono tabular-nums text-ios-text">
                    $0.00
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Wallet info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 bg-ios-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                    >
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-mono text-[0.875rem] text-white font-medium">
                      {address ? truncateAddress(address) : "-"}
                    </p>
                    <span className="text-[0.6875rem] font-mono text-white/50 mt-0.5 inline-block">
                      {isOnBase ? "Base Mainnet" : `Chain ${chainId}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-[0.75rem] text-white/50 hover:text-white/70 font-medium transition-colors"
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
              <div className="w-16 h-16 mx-auto bg-ios-bg-secondary rounded-full flex items-center justify-center mb-6">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h2 className="font-sans text-[1.25rem] font-medium text-ios-text mb-2">
                Connect Wallet
              </h2>
            </motion.div>
            <motion.div variants={itemVariants}>
              <p className="text-[0.875rem] text-ios-text-secondary mb-8 max-w-[280px] mx-auto leading-relaxed">
                Connect your wallet to unlock personalized alpha signals and smart wallet tracking.
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={() => {
                  const connector = isInMiniApp
                    ? (connectors.find((c) => c.id === "farcasterMiniApp") ?? connectors[0])
                    : (connectors.find((c) => c.id === "coinbaseWalletSDK") ?? connectors[1]);
                  if (connector) connect({ connector });
                }}
              >
                Connect Wallet
              </AnimatedButton>
            </motion.div>
          </motion.div>
        )}
      </div>

      <TabBar />
    </div>
  );
}
