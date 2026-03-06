/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Coinbase Predictions Design System — Premium Light
        ios: {
          blue: '#0052FF',
          'blue-light': '#3377FF',
          'blue-dark': '#0043D6',
          green: '#00D395',
          'green-dark': '#00B37E',
          red: '#FF6B6B',
          'red-muted': '#C4C4C4',
          orange: '#FF9F0A',
          yellow: '#FFD60A',
          purple: '#BF5AF2',
          pink: '#FF375F',
          teal: '#64D2FF',
          // Light theme backgrounds
          bg: '#FFFFFF',
          'bg-secondary': '#F5F8FA',
          'bg-tertiary': '#EDF0F4',
          // Deep dark market cards (accent contrast)
          card: '#0A0B0D',
          'card-hover': '#1A1B1F',
          'card-border': '#2A2B2F',
          'card-border-light': '#3A3B3F',
          // Light cards (portfolio, wallet, promo)
          'card-light': '#F5F8FA',
          'card-light-hover': '#EDF0F4',
          'card-light-border': '#E8ECF0',
          // Text on light bg
          text: '#000000',
          'text-secondary': '#6B7280',
          'text-tertiary': '#9CA3AF',
          // Text on dark cards
          'text-on-dark': '#FFFFFF',
          'text-on-dark-secondary': '#9CA3AF',
          'text-on-dark-tertiary': '#6B7280',
          // Separators
          separator: '#E8ECF0',
          'separator-light': '#F0F3F7',
        },
        // Legacy aliases for backward compat in tests
        base: {
          blue: '#0052FF',
          'blue-light': '#3377FF',
          'blue-dark': '#0043D6',
        },
        foresight: {
          bg: '#FFFFFF',
          'bg-alt': '#F5F8FA',
          surface: '#FFFFFF',
          'surface-hover': '#F5F8FA',
          border: '#E8ECF0',
          'border-light': '#F0F3F7',
          text: '#000000',
          'text-secondary': '#6B7280',
          'text-tertiary': '#9CA3AF',
          accent: '#0052FF',
          success: '#00D395',
          danger: '#FF6B6B',
          warning: '#FF9F0A',
          // Dark market cards
          'card-dark': '#0A0B0D',
          'card-dark-inner': '#1A1B1F',
          'card-dark-border': '#2A2B2F',
          'card-dark-border-light': '#3A3B3F',
        },
        // Category colors
        politics: '#FF6B6B',
        crypto: '#0052FF',
        economics: '#FF9F0A',
        sports: '#00D395',
        tech: '#BF5AF2',
        culture: '#FF375F',
        // Base website gray scale
        'base-gray': {
          25: '#FAFAFA',
          50: '#F2F2F2',
          100: '#D1D5DB',
          200: 'rgba(113, 120, 134, 1)',
        },
        illoblack: '#0A0B0D',
      },
      fontFamily: {
        display: ['var(--font-coinbase-display)', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        sans: ['var(--font-coinbase-sans)', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'sans-text': ['var(--font-coinbase-sans)', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['var(--font-coinbase-mono)', 'SF Mono', 'JetBrains Mono', 'monospace'],
        inter: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 82, 255, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(0, 82, 255, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 6px 2px rgba(0, 211, 149, 0.3)' },
          '50%': { boxShadow: '0 0 14px 4px rgba(0, 211, 149, 0.5)' },
        },
      },
      screens: {
        miniapp: '400px',
        'miniapp-lg': '430px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
        'pill': '50px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0, 0, 0, 0.06)',
        'card-row': '0 2px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 24px rgba(0, 0, 0, 0.10)',
        'card-lg': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'blue-glow': '0 4px 20px rgba(0, 82, 255, 0.25)',
        'green-glow': '0 4px 20px rgba(0, 211, 149, 0.25)',
      },
    },
  },
  plugins: [],
};
