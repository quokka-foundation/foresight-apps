'use client';

interface BackArrowProps {
  onClick?: () => void;
  className?: string;
}

export function BackArrow({ onClick, className = '' }: BackArrowProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 -ml-1 text-ios-text hover:text-ios-text-secondary transition-colors rounded-full hover:bg-ios-bg-secondary ${className}`}
      aria-label="Go back"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
