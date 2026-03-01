// test/e2e/frame.spec.ts
// Playwright E2E tests — full Farcaster Frame user journey
// Run with: npm run test:e2e

import { test, expect } from '@playwright/test'

test.describe('Farcaster Frame', () => {
  test('renders frame page for usdc-vault market', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    await expect(page.locator('h1')).toContainText('Foresight')
    await expect(page.locator('h1')).toContainText('USDC')
  })

  test('frame page has fc:frame vNext meta tag', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    const fcFrame = await page.$('meta[property="fc:frame"]')
    expect(fcFrame).not.toBeNull()
    const content = await fcFrame?.getAttribute('content')
    expect(content).toBe('vNext')
  })

  test('frame page has correct image meta tag', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    const imageTag = await page.$eval(
      'meta[property="fc:frame:image"]',
      (el) => el.getAttribute('content')
    ).catch(() => null)
    expect(imageTag).toBeTruthy()
    expect(imageTag).toContain('yield-chart.png')
  })

  test('frame page has post_url pointing to /api/frame/action', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    const postUrl = await page.$eval(
      'meta[property="fc:frame:post_url"]',
      (el) => el.getAttribute('content')
    ).catch(() => null)
    expect(postUrl).toBeTruthy()
    expect(postUrl).toContain('/api/frame/action')
  })

  test('deposit button renders', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    await expect(page.locator('text=Deposit')).toBeVisible()
  })

  test('preview yield button renders', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    await expect(page.locator('text=Preview Yield')).toBeVisible()
  })

  test('dashboard shows APY metric', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=APY')).toBeVisible()
    await expect(page.locator('text=12')).toBeVisible()
  })

  test('dashboard shows deposited and projected value', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=$100.00').first()).toBeVisible()
    await expect(page.locator('text=$112.00').first()).toBeVisible()
  })

  test('mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/frame/usdc-vault')
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    )
    expect(scrollWidth).toBeLessThanOrEqual(400)
  })

  test('API deposit returns structured JSON', async ({ request }) => {
    const res = await request.post('/api/deposit', {
      data: {
        untrustedData: {
          address: '0x1234567890123456789012345678901234567890',
        },
      },
    })
    const body = await res.json()
    // Vault not configured in test env → 503 with support link
    if (res.status() === 200) {
      expect(body.chainId).toBe('eip155:8453')
      expect(body.method).toBe('eth_sendTransaction')
    } else {
      expect(body.error).toBeTruthy()
      expect(body.support).toBe('https://x.com/foresight')
    }
  })

  test('API preview returns yield data', async ({ request }) => {
    const res = await request.post('/api/preview', {
      data: { untrustedData: { shares: '100000000' } },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.deposited).toBe(100)
    expect(body.projection30Days).toBe(112)
  })

  test('frame shows yield chart image', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    const img = page.locator('img[alt*="$100"]')
    await expect(img).toBeVisible()
  })
})
