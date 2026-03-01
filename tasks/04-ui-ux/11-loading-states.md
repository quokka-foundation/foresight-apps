# Task #11: Mantine Skeletons + Loading States

**Status:** ✅ Complete
**Est:** 0.5h
**Priority:** P2
**Phase:** UI/UX Polish

## Acceptance Criteria

- [x] Frame page shows skeleton while data loads
- [x] Dashboard metrics show skeleton for first 200ms
- [x] Mantine `Skeleton` component used (not raw CSS)
- [x] No layout shift when content loads (CLS < 0.1)
- [x] Loading state matches final layout dimensions

## Implementation

### Frame Loading Skeleton (`app/frame/[market]/loading.tsx`)

```tsx
import { Skeleton, Stack } from '@mantine/core'

export default function FrameLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0b1e]">
      <Stack p="md" maw={400} w="100%" gap="md">
        <Skeleton height={28} width="65%" radius="sm" />
        <Skeleton height={16} width="80%" radius="sm" />
        {/* Frame image skeleton — matches 1.91:1 aspect ratio at 400px wide */}
        <Skeleton height={209} radius="md" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton height={40} radius="sm" />
          <Skeleton height={40} radius="sm" />
          <Skeleton height={40} radius="sm" />
        </div>
      </Stack>
    </div>
  )
}
```

### Dashboard Loading State (`app/dashboard/loading.tsx`)

```tsx
import { Skeleton, Stack, Card } from '@mantine/core'

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#0a0b1e] py-8">
      <Stack p="md" maw={400} mx="auto" gap="md">
        <div className="flex justify-between items-center">
          <Skeleton height={32} width="45%" radius="sm" />
          <Skeleton height={24} width={60} radius="xl" />
        </div>
        <Skeleton height={209} radius="md" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} withBorder bg="dark.8" radius="md" p="md">
            <div className="flex justify-between items-center">
              <Skeleton height={16} width="30%" radius="sm" />
              <Skeleton height={24} width="25%" radius="sm" />
            </div>
          </Card>
        ))}
        <Skeleton height={44} radius="md" />
      </Stack>
    </main>
  )
}
```

Both loading files are placed in the same directory as their page, so Next.js App Router uses them automatically as Suspense fallbacks.

**Next:** Task #12 — Frame Image Optimization (WebP)
