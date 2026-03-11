"use client";

// LiveDot — animated green indicator showing Realtime connection status.
// Green + pulse = connected. Grey = disconnected/dev mock.

interface LiveDotProps {
  connected: boolean;
  className?: string;
}

export function LiveDot({ connected, className = "" }: LiveDotProps) {
  return (
    <span
      title={connected ? "Live" : "Offline"}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-ios-green animate-pulse" : "bg-ios-text-tertiary"
        }`}
      />
      {connected && (
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.06em] text-ios-green">
          Live
        </span>
      )}
    </span>
  );
}
