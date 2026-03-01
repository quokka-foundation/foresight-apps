// components/FrameContainer.tsx
// Wrapper component for Farcaster Frame-optimized layouts
// Mobile-first, 400px max-width

interface FrameContainerProps {
  children: React.ReactNode
  className?: string
}

export function FrameContainer({ children, className = '' }: FrameContainerProps) {
  return (
    <div className={`max-w-[400px] mx-auto min-h-screen bg-base-navy text-white ${className}`}>
      {children}
    </div>
  )
}
