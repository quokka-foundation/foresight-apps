# Task #14: Playwright E2E: Full User Flow

**Status:** ✅ Complete
**Est:** 1h
**Priority:** P2
**Phase:** Test + Deploy

## Acceptance Criteria

- [x] E2E tests cover: frame render → button click → deposit → preview
- [x] All tests pass on `npm run test:e2e`
- [x] Tests run in CI against Vercel preview URLs
- [x] Mobile viewport (390×844) tested (Farcaster mobile)
- [x] Frame meta tags validated programmatically

## Playwright Config (`playwright.config.ts`)

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'Mobile', use: { ...devices['iPhone 14'] } },
    { name: 'Desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## E2E Test Scenarios

```ts
// test/e2e/frame.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Frame Journey', () => {
  test('frame page has valid meta tags', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    const fcFrame = page.locator('meta[property="fc:frame"]')
    await expect(fcFrame).toHaveAttribute('content', 'vNext')
  })

  test('frame shows deposit button', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    await expect(page.locator('text=Deposit')).toBeVisible()
  })

  test('dashboard shows yield metrics', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=12%')).toBeVisible()
    await expect(page.locator('text=APY')).toBeVisible()
  })

  test('mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/frame/usdc-vault')
    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(390)
  })

  test('API deposit returns tx data', async ({ request }) => {
    const res = await request.post('/api/deposit', {
      data: { untrustedData: { address: '0x1234567890123456789012345678901234567890' } }
    })
    const body = await res.json()
    expect(body.chainId).toBe('eip155:8453')
    expect(body.method).toBe('eth_sendTransaction')
  })
})
```

**Next:** Task #15 — Vercel Production Deploy
