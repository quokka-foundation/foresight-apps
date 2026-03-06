'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Market } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/mock-data';
import { StatusBadge } from './StatusBadge';

// Dynamic import CardScene to avoid SSR issues with Three.js / R3F
const CardScene = dynamic(
  () => import('./CardScene').then((m) => m.CardScene),
  { ssr: false },
);

interface MarketCardProps {
  market: Market;
  index?: number;
  variant?: 'featured' | 'default';
}

export function MarketCard({ market, index = 0 }: MarketCardProps) {
  const noProb = 100 - market.probability;
  const yesPayout = Math.round(100 / (market.probability / 100));
  const noPayout = Math.round(100 / (noProb / 100));
  const category = CATEGORY_CONFIG[market.category] || {
    label: market.category,
    color: '#0052FF',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link href={`/curve/${market.id}`}>
        <div className="bg-illoblack rounded-2xl p-6 hover:bg-ios-card-hover transition-all duration-200 active:scale-[0.98] overflow-hidden">
          {/* Title */}
          <div className="text-center mb-4">
            <h3 className="font-sans text-xl font-medium text-white leading-tight tracking-[-0.02em]">
              {market.title}
            </h3>
          </div>

          {/* LIVE badge */}
          <div className="flex justify-center mb-5">
            <StatusBadge label="LIVE" variant="green" pulse glow onDark />
          </div>

          {/* Dot-matrix 3D artwork — per-card Canvas (Base website pattern) */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden relative bg-illoblack">
              <CardScene
                color={category.color}
                dotScale={6}
                width={96}
                height={96}
                className="rounded-2xl overflow-hidden"
              />
            </div>
            <div className="w-24 h-24 rounded-2xl overflow-hidden relative bg-illoblack">
              <CardScene
                color="#6B7280"
                dotScale={6}
                width={96}
                height={96}
                className="rounded-2xl overflow-hidden opacity-50"
              />
            </div>
          </div>

          {/* Outcome indicators */}
          <div className="flex gap-2.5 mb-2.5">
            <div className="flex-1 py-3 bg-white/10 rounded-xl text-center transition-colors hover:bg-white/15">
              <span className="text-[0.8125rem] font-medium text-white tracking-[-0.01em]">
                YES <span className="text-white/30 mx-0.5">&middot;</span>
                <span className="font-mono">{market.probability.toFixed(0)}%</span>
              </span>
            </div>
            <div className="flex-1 py-3 bg-white/10 rounded-xl text-center transition-colors hover:bg-white/15">
              <span className="text-[0.8125rem] font-medium text-white tracking-[-0.01em]">
                NO <span className="text-white/30 mx-0.5">&middot;</span>
                <span className="font-mono">{noProb.toFixed(0)}%</span>
              </span>
            </div>
          </div>

          {/* Payout info */}
          <div className="flex gap-2.5">
            <div className="flex-1 text-center">
              <span className="font-mono text-[0.6875rem] text-white/30 tracking-[0.02em]">$100</span>
              <span className="font-mono text-[0.6875rem] text-white/20 mx-1">&rarr;</span>
              <span className="font-mono text-[0.6875rem] font-medium text-ios-green">${yesPayout}</span>
            </div>
            <div className="flex-1 text-center">
              <span className="font-mono text-[0.6875rem] text-white/30 tracking-[0.02em]">$100</span>
              <span className="font-mono text-[0.6875rem] text-white/20 mx-1">&rarr;</span>
              <span className="font-mono text-[0.6875rem] font-medium text-ios-green">${noPayout}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
