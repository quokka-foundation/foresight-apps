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
- `jest.config.ts` key for jest-dom is `setupFilesAfterEnv` (NOT `setupFilesAfterFramework`)
- Floating-point: `100 * 1.12 === 112.00000000000001` — always compare to literal `112`, use `toBeCloseTo` for ratio
- Tests run slow (~60s) due to viem publicClient open handles — use `--forceExit` when needed

### Sprint Progress
- **Phase 1 (Setup):** ✅ 2/2 complete
  - Task 1: Next.js 15 + Tailwind + TypeScript (strict, Farcaster colors)
  - Task 2: Dependencies installed, jest.config.ts + playwright.config.ts created
- **Phase 2 (Frame Core):** ✅ 3/3 complete
  - Task 3: `/frame/[market]` page with correct fc:frame meta tags + skeleton loading
  - Task 4: `POST /api/deposit` → `eth_sendTransaction` for vault.deposit (BigInt serialized as string)
  - Task 5: `POST /api/preview` → viem previewRedeem + demo fallback + YieldCountdown component
- **Phase 3 (Wallet):** ✅ 4/4 complete
  - Task 6: `lib/wallet.ts` — `connectWallet()` + `depositToVault()` + `getChainId()` + `switchToBase()` via viem@2
  - Task 7: `components/YieldImage.tsx` — Next.js `<Image>` with WebP optimization, 1.91:1 aspect ratio
  - Task 8: Mantine v7 Provider in `app/layout.tsx` + `ColorSchemeScript` (no FOUC) + Mantine dashboard with Card/Badge/Stack
  - Task 9: `app/api/telegram-qr/route.ts` + `app/api/telegram-webhook/route.ts` — QR proxy + /qr + /start bot commands
- **Phase 4 (UI/UX):** ✅ 3/3 complete
  - Task 10: `ErrorBoundary` wraps frame page; all API routes use `errorResponse()` helper with `support: 'https://x.com/foresight'`
  - Task 11: `app/frame/[market]/loading.tsx` + `app/dashboard/loading.tsx` rebuilt with Mantine `<Skeleton>`
  - Task 12: `next.config.js` updated with `Cache-Control: public, max-age=86400` for static images + WebP/AVIF formats
- **Phase 5 (Deploy/Test):** ✅ 5/6 complete (Task 15 is manual Vercel deploy)
  - Task 13: All 10 unit test suites pass (60 tests); `jest.config.ts` wired `setupFilesAfterEnv`
  - Task 14: `test/e2e/frame.spec.ts` — 12 Playwright scenarios written
  - Task 15: Vercel deploy — **manual step** (push to main, set env vars in Vercel dashboard)
  - Task 16: `lib/analytics.ts` + PostHog fire-and-forget in `app/api/frame/action/route.ts`
  - Task 17: Loom recording — **manual step**
  - Task 18: `app/sitemap.ts` + `app/robots.ts` + full OG/Twitter/fc:frame metadata in `app/layout.tsx`

### Config Files Created
- `jest.config.ts` — ts-jest, jsdom, 80% coverage threshold, `@/*` alias, `setupFilesAfterEnv: ['@testing-library/jest-dom']`
- `playwright.config.ts` — Chromium, baseURL localhost:3000, webServer auto-start
- `.env.local` — placeholder env vars (RPC, vault address, PostHog key)
- `.eslintrc.json` — `extends: ["next/core-web-vitals"]`
- `tsconfig.json` — types: ["node", "jest", "@testing-library/jest-dom"]
- `ts-node` — added to devDependencies (required by Jest for jest.config.ts)

### Test Results (All phases complete)
- 60/60 unit tests pass (10 test suites)
- TypeScript: 0 errors (`tsc --noEmit` clean)
- Remaining manual steps: Vercel deploy (Task 15), Loom recording (Task 17)
