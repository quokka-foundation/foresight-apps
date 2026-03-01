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
        // Farcaster brand colors
        farcaster: {
          blue: '#1DA1F2',
          purple: '#8A63D2',
          dark: '#17101F',
        },
        // Base L2 brand colors
        base: {
          blue: '#0052FF',
          navy: '#0A0B1E',
        },
        // Foresight brand
        foresight: {
          primary: '#1DA1F2',
          accent: '#00D4AA',
          warning: '#FFB800',
          success: '#00C851',
          danger: '#FF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      screens: {
        // Mobile-first for Farcaster embedded frames
        'frame': '400px',
        'frame-lg': '600px',
      },
    },
  },
  plugins: [],
}
