# Foresight Apps - Implementation Plans

**Current Sprint:** 2 days (Mar 5–6, 2026)
**Demo Goal:** Live Farcaster Frame deposit by Day 6

## Plans Index

| Plan | Status | Priority | Days |
|------|--------|----------|------|
| [Frame Architecture](./frame-architecture.md) | ⏳ Planned | P1 | 1 |
| [Wallet Integration](./wallet-integration.md) | ⏳ Planned | P1 | 1–2 |
| [Testing Plan](./testing-plan.md) | ⏳ Planned | P2 | 2 |
| [Deployment Checklist](./deployment-checklist.md) | ⏳ Planned | P2 | 2 |
| [Analytics Setup](./analytics-setup.md) | ⏳ Planned | P3 | 2 |

**Progress: 0/18 tasks complete**

## Sprint Timeline

```
Mar 5 (Day 1)
├── Setup (Tasks #1–2):  Next.js 15 + deps
├── Frame Core (Tasks #3–5):  Frame routes, deposit, preview
└── Wallet (Task #6):  Coinbase Smart Wallet

Mar 6 (Day 2)
├── Charts+UI (Tasks #7–12): yield image, Mantine, error UX
├── Testing (Tasks #13–14): 80% coverage + Playwright E2E
└── Deploy (Tasks #15–18): Vercel, PostHog, Loom, SEO
```

## Key Milestones

- [ ] Frame validates on framescan.com
- [ ] `/frame/usdc-vault` POST → vault.deposit(100e6, user) on Base
- [ ] `previewRedeem` displays "$100→$112" in 30 days
- [ ] Vercel deploy live at `foresight-apps.vercel.app`
- [ ] PostHog tracking Frame button clicks
- [ ] Loom video: "$100→$112" demo for Batch 003
