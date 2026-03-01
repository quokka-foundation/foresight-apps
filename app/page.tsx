import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-farcaster-blue mb-4">
        Foresight Apps
      </h1>
      <p className="text-xl text-gray-300 mb-8 text-center max-w-md">
        Earn yield on Base — directly from Farcaster Frames.
        Deposit USDC, earn 12% APY.
      </p>
      <div className="flex gap-4">
        <Link
          href="/frame/usdc-vault"
          className="px-6 py-3 bg-farcaster-blue rounded-lg font-semibold hover:opacity-90 transition"
        >
          Open Frame
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-farcaster-blue rounded-lg font-semibold hover:bg-farcaster-blue/10 transition"
        >
          Dashboard
        </Link>
      </div>
    </main>
  )
}
