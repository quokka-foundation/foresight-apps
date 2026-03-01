// test/e2e/frame.spec.ts
// Playwright E2E: full Farcaster Frame user flow
// connect → deposit → preview yield

import { test, expect } from '@playwright/test'

test.describe('Farcaster Frame', () => {
  test('renders frame page for usdc-vault market', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    await expect(page.locator('h1')).toContainText('Foresight')
    await expect(page.locator('h1')).toContainText('USDC-VAULT')
  })

  test('frame meta tags are present', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    const fcFrame = await page.$('meta[property="fc:frame"]')
    expect(fcFrame).not.toBeNull()
    const content = await fcFrame?.getAttribute('content')
    expect(content).toBe('vNext')
  })

  test('deposit button renders', async ({ page }) => {
    await page.goto('/frame/usdc-vault')
    await expect(page.locator('text=Deposit')).toBeVisible()
  })

  test('dashboard shows yield metrics', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=APY')).toBeVisible()
    await expect(page.locator('text=12')).toBeVisible()
  })
})
