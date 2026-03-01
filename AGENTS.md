## Token Efficiency

- Never re-read files you just wrote. You know the contents.
- Never re-run commands to verify unless outcome was uncertain.
- Batch related edits. Don't make 5 edits when 1 handles it.
- Skip confirmations like "I'll continue..." — just do it.
- If a task needs 1 tool call, don't use 3.

## Project: Foresight Apps

**Goal:** Farcaster Frame + "$100→$112" yield vault demo by Mar 6, 2026.
**Sprint:** 18 tasks across 5 phases.

### Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript strict + Tailwind
- **Chain:** Base L2 (chainId 8453), viem@2 for contract reads
- **Wallet:** Coinbase Smart Wallet via Farcaster Frame SDK
- **UI:** Mantine v7 + Tailwind (mobile-first, 400px frame width)
- **Testing:** Jest + ts-jest + @testing-library/react (unit), Playwright (E2E)
- **Analytics:** PostHog (client + server-side)
- **Deploy:** Vercel → foresight-apps.vercel.app

### Key Constants
- USDC on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Vault: `process.env.NEXT_PUBLIC_VAULT_ADDRESS` (TBD after deploy)
- Demo: deposit 100 USDC → 112 USDC in 30 days @ 12% APY

### File Structure
```
app/
├── frame/[market]/page.tsx        ← Farcaster Frame (fc:frame meta tags)
├── frame/[market]/loading.tsx     ← Tailwind skeleton
├── api/deposit/route.ts           ← Returns eth_sendTransaction for vault.deposit
├── api/preview/route.ts           ← previewRedeem from viem + demo fallback
├── api/frame/action/route.ts      ← Proxies frame button POSTs to deposit/preview
└── dashboard/page.tsx             ← Yield metrics dashboard
lib/
├── viem.ts      ← publicClient for Base mainnet
├── constants.ts ← ADDRESSES, CHAIN_ID, DEFAULT_DEPOSIT_AMOUNT (100e6n)
└── abis/vault.ts ← ERC-4626 ABI (deposit, redeem, previewRedeem, etc.)
components/
├── YieldCard.tsx        ← Shows deposited/currentValue/apy/days
├── YieldCountdown.tsx   ← Client component: days until full yield cycle
├── ErrorBoundary.tsx    ← Fallback → x.com/foresight
└── FrameContainer.tsx   ← max-w-[400px] wrapper
public/
└── yield-chart.png      ← 1200×630 PNG (bar chart: $100 → $112)
test/unit/
├── viem.test.ts            ← publicClient chain/id check (@jest-environment node)
├── api-deposit.test.ts     ← POST /api/deposit tests
├── api-preview.test.ts     ← POST /api/preview tests (demo + live vault paths)
└── api-frame-action.test.ts ← POST /api/frame/action routing tests
```

### Key Gotchas (Next.js 15)
- Dynamic route `params` must be `Promise<{ market: string }>` and awaited
- tsconfig `target` must be `ES2020` for BigInt literals (`100_000_000n`)
- All API routes use `export const runtime = 'edge'`
- Edge runtime disables static generation for those pages (expected warning)
- BigInt CANNOT be JSON.stringify'd — convert to `.toString()` before returning from API
- `fc:frame:post_url` must be absolute URL (`https://foresight-apps.vercel.app/api/frame/action`)
- Frame action handler must **proxy** POST body (not redirect) — Frame clients don't follow 302
- viem tests need `@jest-environment node` docblock (jsdom lacks TextEncoder)
- ts-node devDependency required for `jest.config.ts` to be parsed by Jest

### Sprint Progress
- **Phase 1 (Setup):** ✅ 2/2 complete
  - Task 1: Next.js 15 + Tailwind + TypeScript (strict, Farcaster colors)
  - Task 2: Dependencies installed, jest.config.ts + playwright.config.ts created
- **Phase 2 (Frame Core):** ✅ 3/3 complete
  - Task 3: `/frame/[market]` page with correct fc:frame meta tags + skeleton loading
  - Task 4: `POST /api/deposit` → `eth_sendTransaction` for vault.deposit (BigInt serialized as string)
  - Task 5: `POST /api/preview` → viem previewRedeem + demo fallback + YieldCountdown component
- **Phase 3 (Wallet):** ⏳ 0/4 — Tasks 6, 7, 8, 9
- **Phase 4 (UI/UX):** ⏳ 0/3 — Tasks 10, 11, 12
- **Phase 5 (Deploy/Test):** ⏳ 0/6 — Tasks 13–18

### Config Files Created
- `jest.config.ts` — ts-jest, jsdom, 80% coverage threshold, `@/*` alias
- `playwright.config.ts` — Chromium, baseURL localhost:3000, webServer auto-start
- `.env.local` — placeholder env vars (RPC, vault address, PostHog key)
- `.eslintrc.json` — `extends: ["next/core-web-vitals"]`
- `tsconfig.json` — types: ["node", "jest", "@testing-library/jest-dom"]
- `ts-node` — added to devDependencies (required by Jest for jest.config.ts)

### Test Results (Phase 2 complete)
- 14/14 unit tests pass
- Coverage: 90% lines, 80% branches (above 80% threshold)
- TypeScript: 0 errors (`tsc --noEmit` clean)
