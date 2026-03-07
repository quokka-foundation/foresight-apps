'use client';

import { motion } from 'framer-motion';
import type { Position } from '@/lib/types';
import { formatPercent, formatUSD } from '@/lib/mock-data';
import Link from 'next/link';

interface PortfolioCardProps {
  position: Position;
  index?: number;
}

export function PortfolioCard({ position, index = 0 }: PortfolioCardProps) {
  const isProfit = position.pnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Link href={`/curve/${position.marketId}`}>
        <div className="bg-white rounded-xl border border-base-gray-50 p-5 hover:bg-base-gray-25 transition-all duration-200">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-sans text-[0.8125rem] font-medium text-illoblack truncate tracking-[-0.01em]">
                {position.marketTitle}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`font-mono text-[0.6875rem] uppercase tracking-[0.04em] px-2 py-0.5 rounded-md ${
                  position.direction === 'yes'
                    ? 'bg-ios-green/10 text-ios-green'
                    : 'bg-base-gray-50 text-base-gray-200'
                }`}>
                  {position.direction.toUpperCase()}
                </span>
                <span className="font-mono text-[0.6875rem] text-base-gray-200 tracking-[0.02em]">
                  {position.leverage}x
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-mono text-sm font-medium ${
                isProfit ? 'text-ios-green' : 'text-ios-red'
              }`}>
                {formatPercent(position.pnlPercent)}
              </p>
              <p className={`font-mono text-[0.6875rem] ${
                isProfit ? 'text-ios-green/70' : 'text-ios-red/70'
              }`}>
                {isProfit ? '+' : ''}{formatUSD(position.pnl)}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div>
                <span className="font-mono text-[0.6875rem] text-base-gray-200 uppercase tracking-[0.04em]">Invested</span>
                <p className="font-mono text-[0.8125rem] text-illoblack font-medium mt-0.5">{formatUSD(position.amount)}</p>
              </div>
              <div>
                <span className="font-mono text-[0.6875rem] text-base-gray-200 uppercase tracking-[0.04em]">Value</span>
                <p className="font-mono text-[0.8125rem] text-illoblack font-medium mt-0.5">{formatUSD(position.currentValue)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[0.6875rem] text-base-gray-200 uppercase tracking-[0.04em]">Entry</span>
              <p className="font-mono text-[0.8125rem] text-illoblack font-medium mt-0.5">{position.entryProbability}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 bg-base-gray-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isProfit ? 'bg-ios-green' : 'bg-ios-red'
              }`}
              style={{ width: `${Math.min(100, Math.abs(position.pnlPercent) + 50)}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
