'use client';

import { motion } from 'framer-motion';

interface PillCTAProps {
  label: string;
  sublabel?: string;
  onClick?: () => void;
  variant?: 'blue' | 'green' | 'red' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  blue: 'bg-ios-blue hover:bg-ios-blue-light active:bg-ios-blue-dark text-white shadow-blue-glow',
  green: 'bg-ios-green hover:brightness-110 active:brightness-90 text-white shadow-green-glow',
  red: 'bg-ios-red hover:bg-ios-red/90 text-white shadow-lg shadow-ios-red/20',
  outline: 'bg-transparent border-2 border-ios-separator text-ios-text hover:bg-ios-bg-secondary',
};

const sizeStyles = {
  sm: 'py-2.5 px-6 text-sm',
  md: 'py-3.5 px-8 text-base',
  lg: 'py-4 px-10 text-lg',
};

export function PillCTA({
  label,
  sublabel,
  onClick,
  variant = 'blue',
  disabled = false,
  loading = false,
  fullWidth = true,
  size = 'lg',
}: PillCTAProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-pill font-bold
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        flex flex-col items-center justify-center gap-0.5
      `}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Processing...</span>
        </div>
      ) : (
        <>
          <span>{label}</span>
          {sublabel && (
            <span className="text-xs font-normal opacity-80">{sublabel}</span>
          )}
        </>
      )}
    </motion.button>
  );
}
