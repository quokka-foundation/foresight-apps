'use client';

import Link from 'next/link';
import type { Market } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/mock-data';

interface MarketRowCompactProps {
  market: Market;
}

export function MarketRowCompact({ market }: MarketRowCompactProps) {
  const category = CATEGORY_CONFIG[market.category] || { color: '#0052FF' };

  return (
    <Link href={`/curve/${market.id}`}>
      <div className="flex items-center gap-3 py-3.5 px-4 hover:bg-base-gray-25 transition-all duration-200 bg-white rounded-xl border border-base-gray-50">
        {/* Dot-matrix avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-base-gray-25 flex items-center justify-center overflow-hidden">
          <div className="grid grid-cols-4 gap-[1px]">
            {Array.from({ length: 16 }).map((_, i) => {
              const dist = Math.sqrt(Math.pow((i % 4) - 1.5, 2) + Math.pow(Math.floor(i / 4) - 1.5, 2));
              const opacity = dist < 2 ? 0.3 + (2 - dist) * 0.25 : 0.1;
              return (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: category.color, opacity }}
                />
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[0.8125rem] font-medium text-illoblack truncate tracking-[-0.01em]">{market.title}</p>
        </div>

        {/* Probability */}
        <span className="font-mono text-[0.8125rem] font-medium text-illoblack tracking-[-0.02em]">
          {market.probability.toFixed(0)}%
        </span>

        {/* Chevron */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}
