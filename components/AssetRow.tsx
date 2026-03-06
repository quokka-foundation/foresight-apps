'use client';

interface AssetRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
}

export function AssetRow({ icon, label, value, onClick }: AssetRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full py-4 px-4 hover:bg-ios-bg-secondary transition-all duration-200 rounded-3xl text-left"
    >
      {/* Icon — enclosed in circular light bg */}
      <div className="flex-shrink-0 w-11 h-11 rounded-full bg-ios-blue/8 flex items-center justify-center text-ios-blue">
        {icon}
      </div>

      {/* Label */}
      <span className="flex-1 text-base font-semibold text-ios-text">{label}</span>

      {/* Value */}
      <span className="text-base font-bold font-mono text-ios-text">{value}</span>

      {/* Chevron */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
