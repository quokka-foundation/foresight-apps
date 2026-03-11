"use client";

// SocialSignalBadge — shows Farcaster mention count for a token.
// Only renders when mentionCount > 0.

interface SocialSignalBadgeProps {
  mentionCount: number;
  className?: string;
}

export function SocialSignalBadge({ mentionCount, className = "" }: SocialSignalBadgeProps) {
  if (!mentionCount) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#8A63D2]/15 text-[#8A63D2] ${className}`}
    >
      {/* Farcaster purple icon */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 2h16v5h-2V4H6v3H4V2zm0 8h16v12H4V10zm4 2v8h2v-4h4v4h2v-8H8z" />
      </svg>
      <span className="text-[0.625rem] font-medium tabular-nums">{mentionCount}</span>
    </span>
  );
}
