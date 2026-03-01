# Task #2: Install Core Dependencies

**Status:** ✅ Complete
**Est:** 0.25h
**Priority:** P1
**Phase:** Setup

## Acceptance Criteria

- [x] All production deps installed (`viem@2`, `@farcaster/frame-sdk`, `@mantine/core`, etc.)
- [x] All dev deps installed (`@playwright/test`, `ts-jest`, `@testing-library/react`)
- [x] `npm run build` succeeds
- [x] No peer dependency conflicts

## Commands

```bash
# Production dependencies
npm i viem@2 @farcaster/frame-sdk@0.1.2 @mantine/core@7 @mantine/hooks@7
npm i clsx tailwind-merge lucide-react posthog-js

# Dev dependencies
npm i -D @types/node @playwright/test
npm i -D @testing-library/react @testing-library/jest-dom
npm i -D jest jest-environment-jsdom ts-jest @types/jest
npm i -D autoprefixer postcss
```

## Core Config Files

### `lib/viem.ts`
```ts
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})
```

### `jest.config.ts`
```ts
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageThreshold: { global: { lines: 80 } },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}
export default config
```

## Verification

```bash
npm run build    # Should complete without errors
npm run lint     # Zero warnings
```

## Notes

- Added `@types/jest` to devDependencies (missing from initial package.json)
- Updated `tsconfig.json` target to `ES2020` for BigInt literal support
- Added `"types": ["node", "jest", "@testing-library/jest-dom"]` to tsconfig
- Created `.env.local` with placeholder env vars for local dev
- Created `playwright.config.ts` with Chromium setup pointing to localhost:3000

**Next:** Task #3 — Farcaster Frame Dynamic Routes
