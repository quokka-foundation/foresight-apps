# Task #11: Mantine Skeletons + Loading States

**Status:** ⏳ Not Started
**Est:** 0.5h
**Priority:** P2
**Phase:** UI/UX Polish

## Acceptance Criteria

- [ ] Frame page shows skeleton while data loads
- [ ] Dashboard metrics show skeleton for first 200ms
- [ ] Mantine `Skeleton` component used (not raw CSS)
- [ ] No layout shift when content loads (CLS < 0.1)
- [ ] Loading state matches final layout dimensions

## Frame Loading Skeleton (`app/frame/[market]/loading.tsx`)

```tsx
import { Skeleton, Stack } from '@mantine/core'

export default function FrameLoading() {
  return (
    <Stack p="md" maw={400} mx="auto">
      <Skeleton height={28} width="60%" mb="sm" />
      <Skeleton height={16} width="40%" mb="lg" />
      
      {/* Frame image skeleton */}
      <Skeleton height={209} radius="md" mb="md" />
      
      {/* Button skeletons */}
      <Stack gap="xs">
        <Skeleton height={40} radius="sm" />
        <Skeleton height={40} radius="sm" />
        <Skeleton height={40} radius="sm" />
      </Stack>
    </Stack>
  )
}
```

## Dashboard Loading State

```tsx
// app/dashboard/loading.tsx
import { Skeleton, Stack, Card } from '@mantine/core'

export default function DashboardLoading() {
  return (
    <Stack p="md" maw={400} mx="auto">
      <Skeleton height={32} width="50%" mb="lg" />
      {[1, 2, 3, 4].map(i => (
        <Card key={i} withBorder>
          <Skeleton height={20} width="30%" mb="xs" />
          <Skeleton height={28} width="50%" />
        </Card>
      ))}
    </Stack>
  )
}
```

## Suspense Boundaries

```tsx
import { Suspense } from 'react'
import { FrameLoading } from './loading'

export default function Page() {
  return (
    <Suspense fallback={<FrameLoading />}>
      <AsyncFrameContent />
    </Suspense>
  )
}
```

**Next:** Task #12 — Frame Image Optimization (WebP)
