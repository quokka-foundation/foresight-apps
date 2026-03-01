// components/YieldCard.tsx
// Displays yield metrics: deposited, current value, APY, days
// Used in Frame previews and dashboard

interface YieldCardProps {
  deposited: number
  currentValue: number
  apy: number
  days: number
}

export function YieldCard({ deposited, currentValue, apy, days }: YieldCardProps) {
  const gain = currentValue - deposited
  const gainPct = ((gain / deposited) * 100).toFixed(2)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Deposited</span>
        <span className="text-white font-semibold">${deposited.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Current Value</span>
        <span className="text-foresight-success font-bold text-lg">
          ${currentValue.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Gain</span>
        <span className="text-foresight-accent font-semibold">
          +${gain.toFixed(2)} (+{gainPct}%)
        </span>
      </div>
      <div className="flex justify-between items-center border-t border-gray-800 pt-2">
        <span className="text-gray-400 text-sm">APY</span>
        <span className="text-farcaster-blue font-bold">{apy}%</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Days Active</span>
        <span className="text-white">{days}</span>
      </div>
    </div>
  )
}
