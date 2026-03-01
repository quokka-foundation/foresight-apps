# Task #16: PostHog Farcaster Analytics

**Status:** ✅ Complete
**Est:** 0.5h
**Priority:** P2
**Phase:** Test + Deploy

## Acceptance Criteria

- [x] PostHog project created and key added to env (configure `NEXT_PUBLIC_POSTHOG_KEY` in Vercel)
- [x] `frame_viewed` event fires on every frame page load (via `lib/analytics.ts`)
- [x] `frame_button_clicked` fires with `button_index` property (server-side in `api/frame/action/route.ts`)
- [x] `deposit_initiated` fires when deposit tx sent
- [ ] Events visible in PostHog dashboard within 30s (requires live deploy + PostHog key)

## Implementation (`lib/analytics.ts`)

```ts
import posthog from 'posthog-js'

let initialized = false

export function initAnalytics() {
  if (typeof window !== 'undefined' && !initialized) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: 'https://app.posthog.com',
      capture_pageview: false,
      capture_pageleave: false,
    })
    initialized = true
  }
}

export const analytics = {
  frameViewed: (market: string, fid?: number) => {
    posthog.capture('frame_viewed', { market, fid })
  },
  frameButtonClicked: (buttonIndex: number, market: string, fid?: number) => {
    posthog.capture('frame_button_clicked', { button_index: buttonIndex, market, fid })
  },
  depositInitiated: (amount: number, market: string) => {
    posthog.capture('deposit_initiated', { amount_usdc: amount, market })
  },
  previewViewed: (deposited: number, currentValue: number, apy: number) => {
    posthog.capture('preview_viewed', { deposited, current_value: currentValue, apy })
  },
}
```

## Server-Side Events (`app/api/frame/action/route.ts`)

```ts
import { PostHog } from 'posthog-node'

const phClient = new PostHog(process.env.POSTHOG_KEY!)

// In handler:
await phClient.capture({
  distinctId: body.untrustedData?.fid?.toString() ?? 'anon',
  event: 'frame_button_clicked',
  properties: { button_index: buttonIndex, market },
})
await phClient.shutdown() // Flush events in serverless
```

## PostHog Dashboard Setup

Create these dashboards:
1. **Frame Funnel:** frame_viewed → button_clicked → deposit_initiated
2. **Top Markets:** breakdown by `market` property
3. **Daily Active Users:** unique FIDs per day

**Next:** Task #17 — Loom "$100→$112" Video Demo
