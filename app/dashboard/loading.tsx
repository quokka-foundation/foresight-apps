// app/dashboard/loading.tsx
// Mantine Skeleton loading state for the dashboard — matches final layout

import { Skeleton, Stack, Card } from '@mantine/core'

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#0a0b1e] py-8">
      <Stack p="md" maw={400} mx="auto" gap="md">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Skeleton height={32} width="45%" radius="sm" />
          <Skeleton height={24} width={60} radius="xl" />
        </div>

        {/* Yield chart image skeleton */}
        <Skeleton height={209} radius="md" />

        <Skeleton height={1} />

        {/* Stats cards */}
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} withBorder bg="dark.8" radius="md" p="md">
            <div className="flex justify-between items-center">
              <Skeleton height={16} width="30%" radius="sm" />
              <Skeleton height={24} width="25%" radius="sm" />
            </div>
          </Card>
        ))}

        {/* CTA button */}
        <Skeleton height={44} radius="md" />
      </Stack>
    </main>
  )
}
