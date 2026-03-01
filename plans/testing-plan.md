# Testing Plan

## Goal

80%+ code coverage across Frame routes, API handlers, and wallet interactions. Full E2E coverage of the deposit flow.

## Test Stack

| Type | Tool | Config |
|------|------|--------|
| Unit | Jest + ts-jest | `jest.config.ts` |
| Component | @testing-library/react | jsdom env |
| E2E | Playwright | `playwright.config.ts` |
| Coverage | Jest --coverage | 80% threshold |

## Coverage Targets

| File | Target | Notes |
|------|--------|-------|
| `lib/viem.ts` | 90% | Public client config |
| `lib/constants.ts` | 100% | Static values |
| `app/api/deposit/route.ts` | 80% | Happy path + error |
| `app/api/preview/route.ts` | 80% | Happy path + error |
| `app/api/frame/action/route.ts` | 80% | All button indices |
| `components/YieldCard.tsx` | 90% | Render + props |
| `components/ErrorBoundary.tsx` | 85% | Error state |

## Unit Test Structure

```
test/
├── unit/
│   ├── viem.test.ts           ← Chain config validation
│   ├── constants.test.ts      ← Address + value assertions
│   ├── api/
│   │   ├── deposit.test.ts    ← POST /api/deposit
│   │   ├── preview.test.ts    ← POST /api/preview
│   │   └── action.test.ts     ← POST /api/frame/action
│   └── components/
│       ├── YieldCard.test.tsx ← Render + number formatting
│       └── ErrorBoundary.test.tsx
└── e2e/
    └── frame.spec.ts          ← Full user journey
```

## E2E Scenarios (Playwright)

1. **Frame renders** — `/frame/usdc-vault` has fc:frame meta tags
2. **Deposit button visible** — Button 1 text matches spec
3. **Preview yields data** — Button 2 shows "$100→$112"
4. **Dashboard shows APY** — `/dashboard` shows 12%
5. **Error boundary** — Broken route shows X.com/foresight link

## Running Tests

```bash
npm test                # Unit tests with coverage
npm run test:e2e        # Playwright E2E
npm run test:watch      # Unit tests in watch mode
```

## CI Gate

Tests run on every push. PR merge blocked if:
- Coverage < 80%
- Any E2E test fails
- TypeScript errors present
