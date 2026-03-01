# Task #10: Error Boundaries + X.com Redirect

**Status:** ✅ Complete
**Est:** 0.5h
**Priority:** P2
**Phase:** UI/UX Polish

## Acceptance Criteria

- [x] `<ErrorBoundary>` catches React render errors
- [x] Error state shows "Get help on X.com/foresight" link
- [x] API errors return structured JSON `{ error: string, code: number }`
- [x] Frame errors redirect to error frame (not blank screen)
- [x] No unhandled promise rejections in production

## Implementation

### React Error Boundary (`components/ErrorBoundary.tsx`)

Class component with `getDerivedStateFromError` + `componentDidCatch`. Wraps all frame pages:

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

Fallback UI shows error message + `https://x.com/foresight` link.

### API Error Handling

All 3 API routes (`/api/deposit`, `/api/preview`, `/api/frame/action`) use the same helper:

```ts
function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message, code: status, support: 'https://x.com/foresight' },
    { status }
  )
}
```

### Tests

`test/unit/components/ErrorBoundary.test.tsx` — 5 tests covering:
- Renders children when no error
- Shows fallback UI on throw
- Shows error message in fallback
- Shows X.com/foresight link
- Custom fallback prop works

All 5 tests pass.

**Next:** Task #11 — Mantine Skeletons + Loading States
