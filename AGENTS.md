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
├── frame/[market]/page.tsx   ← Farcaster Frame with fc:frame meta tags
├── api/deposit/route.ts      ← Returns eth_sendTransaction for vault.deposit
├── api/preview/route.ts      ← Returns previewRedeem yield data
├── api/frame/action/route.ts ← Routes frame button clicks (buttonIndex 1,2)
└── dashboard/page.tsx        ← Yield metrics dashboard
lib/
├── viem.ts      ← publicClient for Base mainnet
├── constants.ts ← ADDRESSES, CHAIN_ID, DEFAULT_DEPOSIT_AMOUNT (100e6n)
└── abis/vault.ts ← ERC-4626 ABI (deposit, redeem, previewRedeem, etc.)
components/
├── YieldCard.tsx        ← Shows deposited/currentValue/apy/days
├── ErrorBoundary.tsx    ← Fallback → x.com/foresight
└── FrameContainer.tsx   ← max-w-[400px] wrapper
```

### Key Gotchas (Next.js 15)
- Dynamic route `params` must be `Promise<{ market: string }>` and awaited
- tsconfig `target` must be `ES2020` for BigInt literals (`100_000_000n`)
- All API routes use `export const runtime = 'edge'`
- Edge runtime disables static generation for those pages (expected warning)

### Sprint Progress
- **Phase 1 (Setup):** ✅ 2/2 complete
  - Task 1: Next.js 15 + Tailwind + TypeScript (strict, Farcaster colors)
  - Task 2: Dependencies installed, jest.config.ts + playwright.config.ts created
- **Phase 2 (Frame Core):** ⏳ 0/3 — Tasks 3, 4, 5
- **Phase 3 (Wallet):** ⏳ 0/4 — Tasks 6, 7, 8, 9
- **Phase 4 (UI/UX):** ⏳ 0/3 — Tasks 10, 11, 12
- **Phase 5 (Deploy/Test):** ⏳ 0/6 — Tasks 13–18

### Config Files Created
- `jest.config.ts` — ts-jest, jsdom, 80% coverage threshold, `@/*` alias
- `playwright.config.ts` — Chromium, baseURL localhost:3000, webServer auto-start
- `.env.local` — placeholder env vars (RPC, vault address, PostHog key)
- `.eslintrc.json` — `extends: ["next/core-web-vitals"]`
- `tsconfig.json` — types: ["node", "jest", "@testing-library/jest-dom"]
