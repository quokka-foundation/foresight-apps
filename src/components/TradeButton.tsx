'use client';

import { motion } from 'framer-motion';

interface TradeButtonProps {
  label: string;
  sublabel?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TradeButton({
  label,
  sublabel,
  onClick,
  disabled = false,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  size = 'lg',
}: TradeButtonProps) {
  const variantStyles = {
    primary: 'bg-ios-blue hover:bg-ios-blue-light active:bg-ios-blue-dark shadow-blue-glow',
    success: 'bg-ios-green hover:brightness-110 active:brightness-90 shadow-green-glow',
    danger: 'bg-ios-red hover:bg-ios-red/90 active:bg-ios-red/80 shadow-lg shadow-ios-red/20',
  };

  const sizeStyles = {
    sm: 'py-2.5 px-5 text-sm rounded-pill',
    md: 'py-3.5 px-8 text-base rounded-pill',
    lg: 'py-4 px-10 text-lg rounded-pill',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        font-bold text-white
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
