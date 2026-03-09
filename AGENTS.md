## Token Efficiency

- Never re-read files you just wrote. You know the contents.
- Never re-run commands to verify unless outcome was uncertain.
- Batch related edits. Don't make 5 edits when 1 handles it.
- Skip confirmations like "I'll continue..." — just do it.
- If a task needs 1 tool call, don't use 3.

## Project: Foresight Apps

**Goal:** Farcaster Mini App for real-time on-chain alpha intelligence on Base L2.
**Product:** Surface smart wallet movements, token analytics, and AI-powered insights inside Farcaster.

### Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript strict + Tailwind
- **Runtime:** React 19, `bun` as package manager (NOT npm/pnpm)
- **Chain:** Base L2 (chainId 8453), viem@2 for contract reads
- **Wallet:** wagmi@3 + @farcaster/miniapp-wagmi-connector + @base-org/account
- **Auth:** SIWE (Sign-In With Ethereum) — `src/lib/auth.ts` + `AuthProvider` context
- **UI:** Tailwind + Framer Motion + Three.js/R3F (@react-three/fiber) + @worldcoin/mini-apps-ui-kit-react
- **Charts:** lightweight-charts v5 (TradingView) — ESM-only, requires mock in Jest
- **Linter:** Biome (`@biomejs/biome`) — NOT ESLint
- **Testing:** Jest + ts-jest + @testing-library/react
- **Deploy:** Vercel → foresight-apps.vercel.app

### Key Constants (`src/lib/constants.ts`)
- `APP_URL` — from `NEXT_PUBLIC_URL` env var
- `APP_ID` — from `NEXT_PUBLIC_BASE_APP_ID` env var
- `API_URL` — from `NEXT_PUBLIC_API_URL` env var
- `CHAIN_ID` — `8453` (Base mainnet)
- `ADDRESSES.USDC` — `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### Core Types (`src/lib/types.ts`)
- `SignalType` — `SMART_MONEY_ENTRY | WHALE_ENTRY | LIQUIDITY_SURGE | EARLY_MOMENTUM | COORDINATED_CLUSTER`
- `AlphaSignal` — id, type, tokenAddress, tokenSymbol, description, confidenceScore, valueUSD, walletCount, detectedAt
- `SmartWallet` — id, address, smartScore, clusterType, labels, totalVolumeUSD, tradeCount
- `Token` — id, address, symbol, name, decimals, priceUSD, change24h, volume24hUSD
- `AiInsight` — id, summary, keyDrivers, riskFactors, confidenceScore, timeHorizon
- `AlertHistoryItem` — id, signalType, message, triggeredAt
- `AuthState` — isAuthenticated, userId, walletAddress, jwt
- `TabId` — `feed | wallets | tokens | alerts | profile`

### File Structure
```
src/
├── app/
│   ├── layout.tsx                    ← Root layout: localFont (Coinbase fonts), Providers
│   ├── page.tsx                      ← Alpha signal feed: AI insight banner + FilterChips + SignalCards
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── .well-known/farcaster.json/route.ts  ← Farcaster Mini App manifest
│   ├── wallets/page.tsx              ← Smart wallets list
│   ├── tokens/page.tsx               ← Token list with sort options
│   ├── alerts/page.tsx               ← Alert subscriptions + history
│   ├── profile/page.tsx              ← Profile / connect wallet + subscription tiers
│   ├── wallet/page.tsx               ← Wagmi wallet connect + balance display
│   ├── signal/[id]/page.tsx          ← Signal detail page
│   ├── wallet/[address]/page.tsx     ← Smart wallet detail page
│   ├── token/[address]/page.tsx      ← Token detail page
│   └── api/
│       ├── trade/route.ts            ← POST: validate & return demo trade result
│       ├── og/signal/[id]/route.ts   ← GET: SVG OG image for alpha signal
│       ├── notify/route.ts           ← POST: send push notification via Farcaster token
│       └── webhook/route.ts          ← POST: frame_added/removed/notifications events → KV
├── components/
│   ├── providers.tsx                 ← Root providers: Wagmi → Frame → Auth → children
│   ├── providers/
│   │   ├── frame-provider.tsx        ← Farcaster Mini App SDK context
│   │   ├── wagmi-provider.tsx        ← WagmiProvider + QueryClientProvider
│   │   ├── auth-provider.tsx         ← SIWE auth context (useAuth hook)
│   │   └── eruda-provider.tsx        ← Dev-only mobile console
│   ├── TopBar.tsx                    ← Sticky glass header with back arrow, title, action slot
│   ├── TabBar.tsx                    ← 5-tab bottom nav (Feed/Wallets/Tokens/Alerts/Profile)
│   ├── SignalCard.tsx                ← Dark card: signal type badge, description, value, confidence
│   ├── SignalTypeBadge.tsx           ← Color-coded badge per signal type
│   ├── ConfidenceBadge.tsx           ← Color-tiered confidence percentage
│   ├── SmartScoreBadge.tsx           ← Color-tiered smart score
│   ├── WalletRow.tsx                 ← Row: avatar, address, labels, volume, smart score
│   ├── TokenRow.tsx                  ← Row: symbol, name, price, 24h change
│   ├── AlertCard.tsx                 ← Alert history item with dot, badge, time, message
│   ├── InsightCard.tsx               ← Dark card: AI insight summary, time horizon, confidence
│   ├── TradingViewChart.tsx          ← lightweight-charts v5: area, volume, overlay
│   ├── FilterChips.tsx               ← Horizontal scroll filter chips
│   ├── Section.tsx                   ← Title + optional action link
│   ├── AnimatedButton.tsx            ← Framer Motion button with variants
│   ├── StatusBadge.tsx               ← Color-variant badge with pulse/glow
│   ├── CardScene.tsx                 ← R3F Canvas: icosahedron → FBO → GLSL halftone shader
│   ├── DynamicWebGLCanvas.tsx        ← Dynamic import of WebGLCanvas (SSR-safe)
│   ├── HeroNumber.tsx / AnimatedText.tsx
│   ├── AssetRow.tsx / BackArrow.tsx
│   ├── PillCTA.tsx / PromoBanner.tsx / PromoSplash.tsx
│   ├── SafeAreaContainer.tsx / Typography.tsx
│   └── ui/button.tsx / ui/input.tsx / ui/label.tsx
├── lib/
│   ├── constants.ts                  ← APP_URL, APP_ID, API_URL, CHAIN_ID, ADDRESSES
│   ├── types.ts                      ← AlphaSignal, SmartWallet, Token, AiInsight, etc.
│   ├── api.ts                        ← API client: apiFetch wrapper + endpoint methods
│   ├── auth.ts                       ← SIWE helpers: buildSiweMessage, performSiweAuth, JWT utils
│   ├── mock-data.ts                  ← Mock signals, wallets, tokens, insights, alert history
│   ├── utils.ts                      ← cn(), METADATA, formatUSD, formatCompactUSD, formatPercent, timeAgo, truncateAddress
│   ├── viem.ts                       ← publicClient for Base mainnet
│   ├── kv.ts                         ← Upstash Redis: notification token CRUD
│   ├── notifs.ts                     ← sendFrameNotification via stored token
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
        ├── utils.test.ts
        ├── mock-data.test.ts
        ├── api-trade.test.ts
        ├── api-notify.test.ts
        ├── api-og.test.ts
        ├── api-webhook.test.ts
        └── components/
            ├── TabBar.test.tsx
            └── TradingViewChart.test.tsx
public/
└── fonts/
    ├── CoinbaseDisplay-Regular.woff2 / CoinbaseDisplay-Medium.woff2
    ├── CoinbaseSans-Regular.woff2    / CoinbaseSans-Medium.woff2
    └── CoinbaseMono-Regular.woff2    / CoinbaseMono-Medium.woff2
```

### Signal Type → Color Mapping (`SIGNAL_TYPE_CONFIG` in mock-data.ts)
| Type | Label | Color |
|------|-------|-------|
| `SMART_MONEY_ENTRY` | Smart Money | `#0052FF` (Base Blue) |
| `WHALE_ENTRY` | Whale Entry | `#00D395` (Green) |
| `LIQUIDITY_SURGE` | Liquidity Surge | `#FF9F0A` (Orange) |
| `EARLY_MOMENTUM` | Early Momentum | `#AF52DE` (Purple) |
| `COORDINATED_CLUSTER` | Coordinated | `#FF6B6B` (Red) |

### Key Gotchas
- **`bun` only** — never use `npm ci` or `pnpm install`; package manager is `bun@1.3.4`
- **Source root is `src/`** — `@/*` alias maps to `src/*` (tsconfig `paths`)
- **`jest.config.ts`** — `moduleNameMapper` maps `@/` to `<rootDir>/src/`, `lightweight-charts` to mock
- **`jest.config.ts` testMatch** — `**/test/unit/**/*.test.{ts,tsx}` matches files under `src/test/unit/`
- **80% coverage threshold** — jest.config.ts enforces 80% on branches/functions/lines/statements
- **`lightweight-charts` is ESM-only** — must be mocked in Jest via `moduleNameMapper` → `src/test/__mocks__/lightweight-charts.ts`
- **`@upstash/redis` missing from package.json** — `lib/kv.ts` imports it; add to dependencies before deploying
- **Local fonts use relative paths** — `next/font/local` paths resolve from the file location, so from `src/app/layout.tsx` use `../../public/fonts/...`
- **Dynamic route `params`** — must be `Promise<{ id: string }>` and awaited (Next.js 15+)
- **`CardScene` / WebGL** — requires `dynamic(() => import(...), { ssr: false })` wrapper; never render R3F Canvas on server
- **Biome linter** — run `bunx biome check .` / `bunx biome format --write .`; no `.eslintrc`
- **CI disabled** — `.github/workflows/ci.yml` trigger is `workflow_dispatch` only
- **All financial figures** — use `font-mono` with `tabular-nums`
- **Design language** — Premium light UI: white page bg (#FFFFFF), dark cards (#0A0B0D), Base Blue (#0052FF) accent

### Config Files
- `tsconfig.json` — strict, ES2020 target, `moduleResolution: bundler`, `@/*` → `./src/*`
- `jest.config.ts` — ts-jest, jsdom, 80% coverage threshold, lightweight-charts mock
- `playwright.config.ts` — Chromium, baseURL localhost:3000, webServer auto-start
- `next.config.js` — WebP/AVIF image formats, Cache-Control headers
- `tailwind.config.ts` — Full design token set: Coinbase/Farcaster colors, iOS palette, custom fonts
- `.github/workflows/ci.yml` — disabled (workflow_dispatch only)
