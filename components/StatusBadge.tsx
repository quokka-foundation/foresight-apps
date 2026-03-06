'use client';

interface StatusBadgeProps {
  label: string;
  variant?: 'green' | 'blue' | 'red' | 'orange' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
  /** Add a glowing effect around the badge */
  glow?: boolean;
  /** Use on-dark styling (for dark market cards) */
  onDark?: boolean;
}

const variantColors = {
  green: { bg: 'bg-ios-green/15', text: 'text-ios-green', dot: 'bg-ios-green', bgDark: 'bg-ios-green/25', textDark: 'text-ios-green' },
  blue: { bg: 'bg-ios-blue/15', text: 'text-ios-blue', dot: 'bg-ios-blue', bgDark: 'bg-ios-blue/25', textDark: 'text-ios-blue' },
  red: { bg: 'bg-ios-red/15', text: 'text-ios-red', dot: 'bg-ios-red', bgDark: 'bg-ios-red/25', textDark: 'text-ios-red' },
  orange: { bg: 'bg-ios-orange/15', text: 'text-ios-orange', dot: 'bg-ios-orange', bgDark: 'bg-ios-orange/25', textDark: 'text-ios-orange' },
  purple: { bg: 'bg-ios-purple/15', text: 'text-ios-purple', dot: 'bg-ios-purple', bgDark: 'bg-ios-purple/25', textDark: 'text-ios-purple' },
};

export function StatusBadge({
  label,
  variant = 'green',
  size = 'sm',
  pulse = false,
  glow = false,
  onDark = false,
}: StatusBadgeProps) {
  const colors = variantColors[variant];
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-xs';
  const bgClass = onDark ? colors.bgDark : colors.bg;
  const textClass = onDark ? colors.textDark : colors.text;

  return (
    <span className={`inline-flex items-center gap-1.5 ${bgClass} ${textClass} ${sizeClasses} rounded-pill font-bold uppercase tracking-wider ${glow ? 'animate-glow' : ''}`}>
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse ${glow ? 'dot-glow' : ''}`} />
      )}
      {label}
    </span>
  );
}
