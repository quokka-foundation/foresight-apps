## Project: Foresight Apps

Farcaster Mini App for real-time on-chain alpha intelligence on Base L2.
Surfaces smart wallet movements, token analytics, and AI-powered insights inside Farcaster.

## Commands

```bash
bun dev                          # start dev server → localhost:3000
bun run build                    # production build (must pass before merging)
bun run test                     # Jest unit tests (83 tests, 9 suites)
bunx biome check .               # lint with Biome (NOT ESLint)
bunx biome format --write .      # auto-format
tsc --noEmit                     # type-check only
```

## Architecture

- **Source root:** `src/` — `@/*` alias maps to `src/*`
- **Pages:** App Router under `src/app/` (all `"use client"`)
- **Components:** `src/components/`
- **Hooks:** `src/hooks/` — data-fetching and UI effect hooks
- **Business logic:** `src/lib/`
- **Tests:** `src/test/unit/` (Jest + ts-jest + @testing-library/react)

## Data fetching pattern

Every page fetches live data from `NEXT_PUBLIC_API_URL` and falls back to mock data when the variable is absent or the request fails. The hook is:

```ts
// src/hooks/useApiData.ts
const { data, loading, error } = useApiData(fetcher, fallback, deps?);
```

- `loading` is `false` immediately when `API_URL` is not configured — mock data renders with no delay
- Pages render `animate-pulse` skeleton divs while `loading === true`
- `deps` array triggers a re-fetch (e.g. `[userId]` for auth-gated endpoints)

## Key files

| File | Purpose |
|------|---------|
| `src/hooks/useApiData.ts` | Generic fetch hook with mock fallback |
| `src/hooks/useEarthquake.ts` | Shake animation hook (700ms, double-trigger guard) |
| `src/lib/api.ts` | Full API client — all endpoint methods |
| `src/lib/mock-data.ts` | Mock data + `SIGNAL_TYPE_CONFIG` (stays as fallback, do not delete) |
| `src/lib/types.ts` | All TypeScript types |
| `src/lib/constants.ts` | `APP_URL`, `APP_ID`, `API_URL`, `CHAIN_ID`, `ADDRESSES` |
| `src/components/TickerBar.tsx` | Global dark ticker bar — live token prices, CSS marquee |
| `src/components/providers.tsx` | Root provider tree: Wagmi → Frame → Auth |
| `src/components/providers/auth-provider.tsx` | SIWE auth context — exports `useAuth()` |

## Key Gotchas

### Package manager
`bun` only (`bun@1.3.4`). Never run `npm ci` or `pnpm install`.

### Path aliases
`tsconfig.json` maps `@/*` → `./src/*`. `jest.config.ts` maps `^@/(.*)$` → `<rootDir>/src/$1`.

### Fonts
`next/font/local` paths resolve from the calling file, not the project root:
```ts
path: '../../public/fonts/CoinbaseDisplay-Regular.woff2'  // correct (from src/app/)
```

### Dynamic route params (Next.js 15+)
Params must be a `Promise` and awaited:
```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### lightweight-charts
ESM-only — crashes Jest without the mock. Wired via `moduleNameMapper` in `jest.config.ts` to `src/test/__mocks__/lightweight-charts.ts`.

### WebGL / Three.js
`CardScene` and all R3F components must use `dynamic(() => import(...), { ssr: false })`. Never render an R3F `<Canvas>` server-side.

### TickerBar
Rendered in `src/app/layout.tsx` above `{children}`. It is a `"use client"` component and is safe to import in the server-layout because Next.js handles the boundary automatically.

### Earthquake animation
`useEarthquake` returns `{ shaking, triggerEarthquake }`. Apply `animate-earthquake` class to the target element while `shaking === true`. The animation lasts 700ms and the hook self-resets. The CSS keyframe lives in `globals.css`; the Tailwind utility lives in `tailwind.config.ts`.

### Missing dependency (install before deploy)
`@upstash/redis` — imported by `src/lib/kv.ts`, not in package.json. Add before deploying notification routes.

## CI
`.github/workflows/ci.yml` is disabled — trigger is `workflow_dispatch` only.
