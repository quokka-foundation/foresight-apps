## Token Efficiency

- Never re-read files you just wrote. You know the contents.
- Never re-run commands to verify unless outcome was uncertain.
- Batch related edits. Don't make 5 edits when 1 handles it.
- Skip confirmations like "I'll continue..." — just do it.
- If a task needs 1 tool call, don't use 3.

## Project: Foresight Apps

**Goal:** Farcaster Mini App for continuous outcome prediction markets on Base L2.
**Product:** Trade probability curves with 1-click leverage; live P&L inside Farcaster.

### Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript strict + Tailwind
- **Runtime:** React 19, `bun` as package manager (NOT npm/pnpm)
- **Chain:** Base L2 (chainId 8453), viem@2 for contract reads
- **Wallet:** wagmi@3 + @farcaster/miniapp-wagmi-connector + @base-org/account
- **UI:** Tailwind + Framer Motion + Three.js/R3F (@react-three/fiber) + @worldcoin/mini-apps-ui-kit-react
- **Charts:** lightweight-charts v5 (TradingView) — ESM-only, requires mock in Jest
- **Linter:** Biome (`@biomejs/biome`) — NOT ESLint
- **Testing:** Jest + ts-jest + @testing-library/react
- **Deploy:** Vercel → foresight-apps.vercel.app

### Key Constants (`src/lib/constants.ts`)
- `APP_URL` — from `NEXT_PUBLIC_URL` env var
- `CHAIN_ID` — `8453` (Base mainnet)
- `ADDRESSES.USDC` — `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- `ADDRESSES.FORESIGHT_MARKET` — from `NEXT_PUBLIC_FORESIGHT_MARKET` env var
- `DEFAULT_TRADE_AMOUNT` — `10`
- `MAX_LEVERAGE` — `5`
- `IS_DEMO` — `true` when `NEXT_PUBLIC_DEMO === 'true'`

### File Structure
```
src/
├── app/
│   ├── layout.tsx                    ← Root layout: localFont (Coinbase fonts), Providers
│   ├── page.tsx                      ← Home feed: HeroNumber + FilterChips + MarketCard list
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── .well-known/farcaster.json/route.ts  ← Farcaster Mini App manifest
│   ├── curve/[id]/page.tsx           ← Market detail: TradingViewChart + ProbabilitySlider + TradeButton
│   ├── portfolio/page.tsx            ← Open positions: PortfolioCard list with P&L
│   ├── wallet/page.tsx               ← Wagmi wallet connect + balance display
│   ├── create/page.tsx               ← Create new prediction market form
│   └── api/
│       ├── trade/route.ts            ← POST: validate & return demo trade result
│       ├── og/curve/[id]/route.ts    ← GET: SVG OG image with probability/payout
│       ├── notify/route.ts           ← POST: send push notification via Farcaster token
│       └── webhook/route.ts          ← POST: frame_added/removed/notifications events → KV
├── components/
│   ├── providers.tsx                 ← Root providers wrapper
│   ├── providers/
│   │   ├── frame-provider.tsx        ← Farcaster Mini App SDK context
│   │   ├── wagmi-provider.tsx        ← WagmiProvider + QueryClientProvider
│   │   └── eruda-provider.tsx        ← Dev-only mobile console
│   ├── MarketCard.tsx                ← Dark card: YES/NO buttons, payout, CardScene 3D art
│   ├── TradingViewChart.tsx          ← lightweight-charts v5: area, volume, P&L overlay
│   ├── CurveChart.tsx                ← SVG probability chart (uses curve-math paths)
│   ├── ProbabilitySlider.tsx         ← Range input for trade sizing
│   ├── TradeButton.tsx               ← Framer Motion animated submit button
│   ├── TradeConfirmModal.tsx         ← Trade confirmation bottom sheet
│   ├── PortfolioCard.tsx             ← Position card: direction, leverage, entry prob, P&L
│   ├── TabBar.tsx                    ← 4-tab bottom nav (Home/Portfolio/Wallet/Create)
│   ├── CardScene.tsx                 ← R3F Canvas: icosahedron → FBO → GLSL halftone shader
│   ├── DynamicWebGLCanvas.tsx        ← Dynamic import of WebGLCanvas (SSR-safe)
│   ├── FilterChips.tsx               ← Market category filter chips
│   ├── HeroNumber.tsx                ← Animated hero stat display
│   ├── AnimatedButton.tsx / AnimatedText.tsx
│   ├── AssetRow.tsx / BackArrow.tsx / MarketRowCompact.tsx
│   ├── PillCTA.tsx / PromoBanner.tsx / PromoSplash.tsx
│   ├── SafeAreaContainer.tsx / Section.tsx / StatusBadge.tsx / Typography.tsx
│   ├── top-bar.tsx / bottom-navigation.tsx
│   ├── wallet-connect-prompt.tsx / wallet-detail.tsx / wallet-list.tsx
│   ├── ui/button.tsx / ui/input.tsx / ui/label.tsx
│   ├── wallet/base-pay.tsx / wallet/sign-manifest.tsx / wallet/wallet-actions.tsx
│   └── actions/                      ← 16 Farcaster SDK demo action components
│       └── (add-miniapp, close-miniapp, compose-cast, get-capabilities,
│            get-chains, haptics, open-miniapp, openurl, quick-auth,
│            request-camera-microphone, send-token, signin, swap-token,
│            view-cast, view-profile, view-token)
├── lib/
│   ├── constants.ts                  ← APP_URL, CHAIN_ID, ADDRESSES, trade params
│   ├── types.ts                      ← Market, Position, TradeDirection, etc.
│   ├── curve-math.ts                 ← calculatePayout/Cost/PnL, estimateSlippage,
│   │                                    generateCurvePath/AreaPath (SVG)
│   ├── mock-data.ts                  ← 7 demo markets, generateCurveHistory,
│   │                                    chart data converters, filterByTimeRange
│   ├── viem.ts                       ← publicClient for Base mainnet
│   ├── foresight-abi.ts              ← Foresight market contract ABI
│   ├── kv.ts                         ← Upstash Redis: notification token CRUD
│   ├── notifs.ts                     ← sendFrameNotification via stored token
│   ├── utils.ts                      ← cn() (clsx + tailwind-merge)
│   ├── truncateAddress.ts
│   └── webgl/                        ← DOM-synchronized WebGL overlay system
│       ├── WebGLCanvas.tsx           ← Single global R3F Canvas (pointer-events:none)
│       ├── WebGLShader.tsx           ← R3F mesh: DOM rect → NDC uniforms
│       ├── WebGLView.tsx             ← Registers DOM div into Zustand store
│       ├── RenderTexture.tsx         ← Off-screen FBO via R3F createPortal
│       ├── store.ts                  ← Zustand: elements[] + setElements
│       ├── useFbo.ts                 ← THREE.WebGLRenderTarget with auto-resize
│       ├── useWebGLInteraction.ts    ← Mouse UV, hover/press/grab uniforms
│       ├── useScrollPosition.ts      ← scroll + resize tracking
│       ├── saveGlState.ts            ← Save/restore WebGL state for multi-pass
│       └── index.ts                  ← Re-exports
└── test/
    ├── __mocks__/lightweight-charts.ts  ← ESM mock: createChart, series types, ColorType
    └── unit/
        ├── constants.test.ts
        ├── curve-math.test.ts
        ├── mock-data.test.ts
        ├── api-trade.test.ts
        ├── api-notify.test.ts
        ├── api-og.test.ts
        ├── api-webhook.test.ts
        └── components/
            ├── MarketCard.test.tsx
            ├── PortfolioCard.test.tsx
            ├── TabBar.test.tsx
            ├── TradeButton.test.tsx
            └── TradingViewChart.test.tsx
public/
└── fonts/
    ├── CoinbaseDisplay-Regular.woff2 / CoinbaseDisplay-Medium.woff2
    ├── CoinbaseSans-Regular.woff2    / CoinbaseSans-Medium.woff2
    └── CoinbaseMono-Regular.woff2    / CoinbaseMono-Medium.woff2
```

### Key Gotchas
- **`bun` only** — never use `npm ci` or `pnpm install`; package manager is `bun@1.3.4`
- **Source root is `src/`** — `@/*` alias maps to `src/*` (tsconfig `paths`)
- **`jest.config.ts` path alias bug** — `moduleNameMapper` currently maps `^@/(.*)$` → `<rootDir>/$1` (wrong); should be `<rootDir>/src/$1` — fix this before running tests
- **`jest.config.ts` testMatch** — `**/test/unit/**/*.test.{ts,tsx}` matches files under `src/test/unit/`
- **`lightweight-charts` is ESM-only** — must be mocked in Jest via `moduleNameMapper` → `src/test/__mocks__/lightweight-charts.ts`
- **`@upstash/redis` missing from package.json** — `lib/kv.ts` imports it; add to dependencies before deploying
- **`WagmiProvider` wiring** — `components/providers/wagmi-provider.tsx` exists but must be included in `components/providers.tsx` root tree for wallet page to work
- **Local fonts use relative paths** — `next/font/local` absolute paths resolve from the project root (NOT `public/`), so from `src/app/layout.tsx` use `../../public/fonts/CoinbaseDisplay-Regular.woff2`
- **Dynamic route `params`** — must be `Promise<{ id: string }>` and awaited (Next.js 15+)
- **`CardScene` / WebGL** — requires `dynamic(() => import(...), { ssr: false })` wrapper; never render R3F Canvas on server
- **Biome linter** — run `bunx biome check .` / `bunx biome format --write .`; no `.eslintrc`
- **No `test` / `type-check` scripts in package.json** — add before running CI; current scripts: `dev`, `build`, `start`, `lint`
- **CI disabled** — `.github/workflows/ci.yml` trigger is `workflow_dispatch` only

### Config Files
- `tsconfig.json` — strict, ES2020 target, `moduleResolution: bundler`, `@/*` → `./src/*`
- `jest.config.ts` — ts-jest, jsdom, 80% coverage threshold, lightweight-charts mock
- `playwright.config.ts` — Chromium, baseURL localhost:3000, webServer auto-start
- `next.config.js` — WebP/AVIF image formats, Cache-Control headers
- `tailwind.config.js` — Coinbase/Farcaster color tokens, custom fonts
- `.github/workflows/ci.yml` — disabled (workflow_dispatch only)
