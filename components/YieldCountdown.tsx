// components/YieldCountdown.tsx
// Shows days remaining until full yield cycle completes
// Used in Frame preview and dashboard

'use client'
import { useState, useEffect } from 'react'

interface YieldCountdownProps {
  /** Target number of days in the yield cycle (default 30) */
  targetDays?: number
  /** Days already elapsed (used to compute remaining days) */
  daysElapsed?: number
}

export function YieldCountdown({ targetDays = 30, daysElapsed = 0 }: YieldCountdownProps) {
  const initial = Math.max(0, targetDays - daysElapsed)
  const [daysLeft, setDaysLeft] = useState(initial)

  useEffect(() => {
    if (daysLeft <= 0) return
    // Tick once per day — real deployments would derive from block timestamps
    const timer = setInterval(() => {
      setDaysLeft(d => Math.max(0, d - 1))
    }, 86_400_000) // 24h in ms
    return () => clearInterval(timer)
  }, [daysLeft])

  if (daysLeft === 0) {
    return (
      <span className="text-foresight-success font-semibold">
        Full yield reached! Ready to redeem.
      </span>
    )
  }

  return (
    <span className="text-gray-300">
      <span className="text-farcaster-blue font-bold">{daysLeft}</span>
      {daysLeft === 1 ? ' day' : ' days'} until full yield
    </span>
  )
}
