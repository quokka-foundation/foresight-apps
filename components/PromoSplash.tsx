'use client';

import { motion } from 'framer-motion';

interface PromoSplashProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
  onClose: () => void;
  onExploreAll?: () => void;
}

export function PromoSplash({
  title,
  subtitle,
  ctaLabel,
  onCta,
  onClose,
  onExploreAll,
}: PromoSplashProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-ios-blue flex flex-col items-center justify-center"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-12 right-5 p-2 text-white/80 hover:text-white transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="max-w-[340px] mx-auto text-center px-6">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-extrabold text-white leading-tight mb-2 tracking-tight"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-extrabold text-white leading-tight tracking-tight"
        >
          {subtitle}
        </motion.p>

        {/* Dot-matrix artwork */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="my-14 w-48 h-48 mx-auto"
        >
          <div className="w-full h-full rounded-full relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-12 gap-[2px] p-2">
              {Array.from({ length: 144 }).map((_, i) => {
                const dist = Math.sqrt(
                  Math.pow((i % 12) - 5.5, 2) + Math.pow(Math.floor(i / 12) - 5.5, 2)
                );
                const opacity = dist < 5 ? 0.4 + (5 - dist) * 0.12 : 0;
                return (
                  <div
                    key={i}
                    className="rounded-full bg-white"
                    style={{ opacity, width: '100%', aspectRatio: '1' }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CTA — pill-shaped */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCta}
          className="w-full py-4 px-8 bg-white text-ios-blue font-bold text-lg rounded-pill shadow-lg hover:bg-white/95 transition-colors"
        >
          {ctaLabel}
        </motion.button>

        {/* Explore All link */}
        {onExploreAll && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onExploreAll}
            className="mt-5 text-white/90 hover:text-white text-base font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Explore All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
