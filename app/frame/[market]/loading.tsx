// app/frame/[market]/loading.tsx
// Skeleton loading state for Frame pages

export default function FrameLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-base-navy">
      <div className="max-w-lg w-full animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-3 w-3/4" />
        <div className="h-4 bg-gray-800 rounded mb-6 w-1/2" />
        <div className="border border-gray-700 rounded-xl p-6">
          <div className="aspect-video bg-gray-800 rounded-lg mb-4" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-9 bg-gray-700 rounded" />
            <div className="h-9 bg-gray-700 rounded" />
            <div className="h-9 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
