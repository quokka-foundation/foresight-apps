# Analytics Setup Plan

## Tool: PostHog

PostHog tracks Farcaster-native events — Frame impressions, button clicks, deposits, and yield previews.

## Events to Track

| Event | When | Properties |
|-------|------|------------|
| `frame_viewed` | Frame page loaded | `{market, fid, timestamp}` |
| `frame_button_clicked` | Any button pressed | `{button_index, market, fid}` |
| `deposit_initiated` | Deposit tx sent | `{amount_usdc, market, fid}` |
| `deposit_confirmed` | Tx confirmed on Base | `{amount_usdc, shares, tx_hash}` |
| `preview_viewed` | Preview yield shown | `{deposited, current_value, apy}` |
| `dashboard_opened` | Dashboard link clicked | `{fid}` |

## Implementation

### 1. Install PostHog

```bash
npm i posthog-js
```

### 2. Client-side Init (`lib/analytics.ts`)

```ts
import posthog from 'posthog-js'

export function initAnalytics() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // Manual for Frame pages
    })
  }
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties)
}
```

### 3. Server-side Frame Events (`app/api/frame/action/route.ts`)

```ts
import { PostHog } from 'posthog-node'

const phClient = new PostHog(process.env.POSTHOG_KEY!)

// In POST handler:
await phClient.capture({
  distinctId: body.untrustedData?.fid?.toString() ?? 'anonymous',
  event: 'frame_button_clicked',
  properties: { button_index: buttonIndex, market },
})
```

## Dashboard Setup (PostHog)

Create these dashboards in PostHog:

1. **Frame Funnel:** frame_viewed → frame_button_clicked → deposit_initiated → deposit_confirmed
2. **Yield Preview:** preview_viewed with avg current_value
3. **Farcaster FIDs:** unique users by FID
4. **Daily Active:** frame_viewed count per day

## Environment Variables

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_<your_key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_KEY=phc_<your_key>  # Server-side (no NEXT_PUBLIC_)
```

## KPIs for Batch 003 Demo

| Metric | Target |
|--------|--------|
| Frame impressions | 100+ |
| Deposit clicks | 10+ |
| Confirmed deposits | 1+ (live demo) |
| Unique FIDs | 5+ |
