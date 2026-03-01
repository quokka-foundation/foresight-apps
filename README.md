# Foresight Apps

A Farcaster-first dApp enabling users to deposit USDC into yield-bearing vaults directly from Farcaster Frames on Base.

## Overview

Foresight Apps is a Farcaster-native DeFi interface built with Next.js 15. Users interact with ERC-4626 vaults entirely within the Farcaster social feed — no app switching required.

**Demo Goal:** Live Frame → deposit $100 USDC → earn 12% APY → show "$100→$112" in 30 days.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| UI | Mantine UI v7 + Tailwind CSS |
| Chain | Base (L2) |
| Wallet | Coinbase Smart Wallet via viem@2 |
| Frame SDK | @farcaster/frame-sdk@0.1.2 |
| Testing | Playwright E2E + Jest |
| Deploy | Vercel |
| Analytics | PostHog (Farcaster events) |

## Quick Start

```bash
npm install
npm run dev       # localhost:3000
npm run build     # production build
npm test          # unit + E2E
```

## Structure

```
foresight-apps/
├── app/              # Next.js App Router
│   ├── frame/        # Farcaster Frame routes
│   ├── dashboard/    # Yield dashboard
│   └── api/          # Edge API routes
├── components/       # Mantine UI + Frame components
├── lib/              # viem config, ABIs, utilities
├── public/           # Static assets (yield-chart.png, loom.mp4)
├── test/             # Unit + E2E tests
├── tasks/            # Sprint task breakdowns (18 tasks)
├── plans/            # Strategic implementation plans
├── docs/             # Frame spec, ABI documentation
└── .github/          # CI/CD workflows
```

## Sprint

**Sprint:** Mar 5–6, 2026 (2 days)

- Day 1 (Mar 5): Frame live on Farcaster
- Day 2 (Mar 6): "$100→$112" demo ready for Batch 003

See [tasks/index.md](./tasks/index.md) and [plans/index.md](./plans/index.md) for full breakdown.

## Frame URL

```
https://foresight-apps.vercel.app/frame/[market]
```

Validate at [framescan.com](https://framescan.com)

## License

MIT
