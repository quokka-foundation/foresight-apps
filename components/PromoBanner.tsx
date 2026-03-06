'use client';

import { motion } from 'framer-motion';

interface PromoBannerProps {
  title: string;
  description: string;
  onDismiss?: () => void;
  onClick?: () => void;
}

export function PromoBanner({ title, description, onDismiss, onClick }: PromoBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="relative bg-white rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-shadow shadow-card"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-ios-text">{title}</h3>
        <p className="text-xs text-ios-text-secondary mt-1 leading-relaxed">{description}</p>
      </div>

      {/* Decorative dot-matrix pattern */}
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-ios-blue/10 to-ios-blue/5 flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-4 gap-[2px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-ios-blue"
              style={{ opacity: Math.random() * 0.5 + 0.2 }}
            />
          ))}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-3 right-3 p-1 text-ios-text-tertiary hover:text-ios-text-secondary transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
