# Task #10: Error Boundaries + X.com Redirect

**Status:** ⏳ Not Started
**Est:** 0.5h
**Priority:** P2
**Phase:** UI/UX Polish

## Acceptance Criteria

- [ ] `<ErrorBoundary>` catches React render errors
- [ ] Error state shows "Get help on X.com/foresight" link
- [ ] API errors return structured JSON `{ error: string, code: number }`
- [ ] Frame errors redirect to error frame (not blank screen)
- [ ] No unhandled promise rejections in production

## React Error Boundary (`components/ErrorBoundary.tsx`)

Already created in this repo. Wraps app sections:

```tsx
// app/frame/[market]/page.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function FramePage({ params }) {
  return (
    <ErrorBoundary>
      <FrameContent market={params.market} />
    </ErrorBoundary>
  )
}
```

## API Error Handling

```ts
// Consistent error response format
function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message, code: status, support: 'https://x.com/foresight' },
    { status }
  )
}

// Usage:
if (!userAddress) return errorResponse('Missing address', 400)
if (!VAULT_ADDRESS) return errorResponse('Vault not configured', 503)
```

## Frame Error State

```tsx
// Return error frame instead of crashing
const errorFrame = {
  'fc:frame': 'vNext',
  'fc:frame:image': '/error-frame.png',
  'fc:frame:button:1': '🐦 Get Help on X.com',
  'fc:frame:button:1:action': 'link',
  'fc:frame:button:1:target': 'https://x.com/foresight',
}
```

## Sentry Integration (Optional P3)

```bash
npm i @sentry/nextjs
# sentry.config.ts: capture unhandled errors
```

**Next:** Task #11 — Mantine Skeletons + Loading States
