'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PillCTA } from './PillCTA';
import { formatUSD } from '@/lib/mock-data';
import { calculatePayout, estimateSlippage, estimateGas } from '@/lib/curve-math';

interface TradeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  marketTitle: string;
  probability: number;
  amount: number;
  leverage: number;
  direction: 'yes' | 'no';
  liquidity: number;
  loading?: boolean;
}

export function TradeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  marketTitle,
  probability,
  amount,
  leverage,
  direction,
  liquidity,
  loading = false,
}: TradeConfirmModalProps) {
  const potentialPayout = calculatePayout(amount, probability, leverage);
  const slippage = estimateSlippage(amount * leverage, liquidity);
  const gas = estimateGas();
  const totalCost = amount + gas;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto"
          >
            <div className="bg-white rounded-t-[32px] p-6 shadow-2xl safe-area-bottom">
              {/* Handle */}
              <div className="w-10 h-1 bg-ios-bg-secondary rounded-full mx-auto mb-6" />

              {/* Title */}
              <h3 className="text-lg font-bold text-ios-text mb-1">Confirm Trade</h3>
              <p className="text-sm text-ios-text-secondary mb-6">{marketTitle}</p>

              {/* Big payout display */}
              <div className="bg-ios-bg-secondary rounded-3xl p-6 mb-6 text-center">
                <p className="text-ios-text-tertiary text-xs font-medium mb-1">
                  {leverage}x Leverage | {direction.toUpperCase()} @ {probability.toFixed(1)}%
                </p>
                <div className="flex items-center justify-center gap-3 my-4">
                  <span className="text-xl font-mono text-ios-text-secondary">{formatUSD(amount)}</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="1.5">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                  <span className="text-3xl font-extrabold font-mono text-ios-green tracking-tight">{formatUSD(potentialPayout)}</span>
                </div>
                <p className="text-xs text-ios-text-tertiary">Potential payout if resolved {direction.toUpperCase()}</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3.5 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-ios-text-secondary">Trade Amount</span>
                  <span className="font-mono font-semibold text-ios-text">{formatUSD(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ios-text-secondary">Leverage</span>
                  <span className="font-mono font-semibold text-ios-text">{leverage}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ios-text-secondary">Est. Gas</span>
                  <span className="font-mono text-ios-text-tertiary">{formatUSD(gas)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ios-text-secondary">Max Slippage</span>
                  <span className="font-mono text-ios-text-tertiary">{slippage.toFixed(2)}%</span>
                </div>
                <div className="border-t border-ios-bg-secondary my-1" />
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-ios-text">Total Cost</span>
                  <span className="font-mono text-ios-text">{formatUSD(totalCost)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <PillCTA
                  label="Confirm Trade"
                  sublabel={`${leverage}x ${formatUSD(amount)} → ${formatUSD(potentialPayout)}`}
                  onClick={onConfirm}
                  variant="blue"
                  loading={loading}
                />
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm font-medium text-ios-text-secondary hover:text-ios-text transition-colors rounded-pill"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
