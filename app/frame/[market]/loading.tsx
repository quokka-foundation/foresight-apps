// app/frame/[market]/loading.tsx
// Mantine Skeleton loading state for Frame pages — prevents layout shift

import { Skeleton, Stack } from '@mantine/core'

export default function FrameLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0b1e]">
      <Stack p="md" maw={400} w="100%" gap="md">
        {/* Title skeleton */}
        <Skeleton height={28} width="65%" radius="sm" />
        <Skeleton height={16} width="80%" radius="sm" />

        {/* Frame image skeleton — matches 1.91:1 aspect ratio at 400px wide */}
        <Skeleton height={209} radius="md" />

        {/* Button row skeleton */}
        <div className="grid grid-cols-3 gap-2">
          <Skeleton height={40} radius="sm" />
          <Skeleton height={40} radius="sm" />
          <Skeleton height={40} radius="sm" />
        </div>
      </Stack>
    </div>
  )
}
