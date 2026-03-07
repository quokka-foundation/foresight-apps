## Project: Foresight Apps

Farcaster Mini App for continuous outcome prediction markets on Base L2.
Trade probability curves with 1-click leverage; live P&L inside Farcaster.

## Commands

```bash
bun dev          # start dev server
bun run build    # production build
bun run lint     # next lint (ESLint wrapper — Biome is separate)
bunx biome check .              # lint with Biome
bunx biome format --write .     # auto-format with Biome
```

Tests and type-check scripts are not in package.json yet — add them before CI:
```bash
# add to package.json scripts:
"test": "jest --forceExit",
"type-check": "tsc --noEmit"
```

## Architecture

- **Source root:** `src/` — all app code lives here; `@/*` alias maps to `src/*`
- **Pages:** App Router under `src/app/`
- **Components:** `src/components/`
- **Business logic:** `src/lib/`
- **Tests:** `src/test/unit/` (Jest) — no E2E tests yet

## Key Gotchas

### Path aliases
`tsconfig.json` maps `@/*` → `./src/*`. The `jest.config.ts` moduleNameMapper
currently maps `^@/(.*)$` → `<rootDir>/$1` (missing `src/`) — fix before running tests:
```ts
'^@/(.*)$': '<rootDir>/src/$1'
```

### Fonts
`next/font/local` absolute paths (e.g. `/fonts/`) resolve from the project root, NOT
from `public/`. Always use a relative path from the calling file:
```ts
path: '../../public/fonts/CoinbaseDisplay-Regular.woff2'  // correct (from src/app/)
path: '/fonts/CoinbaseDisplay-Regular.woff2'               // wrong — looks in <root>/fonts/
```

### WebGL / Three.js
`CardScene` and all R3F components must be dynamically imported with `{ ssr: false }`.
Never render an R3F `<Canvas>` on the server.

### lightweight-charts
ESM-only package — crashes Jest without the mock. All test files that import
anything touching charts must go through the mock at
`src/test/__mocks__/lightweight-charts.ts` (wired via `moduleNameMapper`).

### Missing dependencies (install before deploy)
- `@upstash/redis` — imported by `src/lib/kv.ts`, not in package.json
- `@types/three` — Three.js type declarations missing from devDependencies
- `jest`, `ts-jest`, `@testing-library/react`, `@testing-library/jest-dom` — needed for tests
- `@playwright/test` — needed for E2E

### Dynamic route params (Next.js 15+)
```ts
// correct
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### Package manager
`bun` only (`bun@1.3.4`). Never run `npm ci` or `pnpm install`.

## CI
`.github/workflows/ci.yml` is disabled — trigger is `workflow_dispatch` only.
Re-enable by restoring `push`/`pull_request` triggers when ready.
