// app/dashboard/page.tsx
// Yield dashboard — shows portfolio positions and APY

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 bg-base-navy">
      <h1 className="text-2xl font-bold text-farcaster-blue mb-6">
        Yield Dashboard
      </h1>

      {/* Portfolio summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Deposited</p>
          <p className="text-2xl font-bold text-white">$100.00</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Current Value</p>
          <p className="text-2xl font-bold text-foresight-success">$112.00</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">APY</p>
          <p className="text-2xl font-bold text-foresight-accent">12.00%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Days Active</p>
          <p className="text-2xl font-bold text-white">30</p>
        </div>
      </div>

      {/* TODO: Position list + withdrawal UI */}
      <div className="text-gray-500 text-sm">
        Position management coming in Task #6–9
      </div>
    </main>
  )
}
