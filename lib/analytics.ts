// lib/analytics.ts
// PostHog analytics — client-side init + typed event helpers.
// Server-side events (Frame button clicks) are fired from API routes via posthog-node.
// See plans/analytics-setup.md for full event taxonomy.

import posthog from 'posthog-js'

let initialized = false

/**
 * Initialize PostHog on the client (safe to call multiple times).
 * Must be called before any trackEvent() call.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || initialized) return

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return // Silently skip in dev when key not set

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: false, // Manual for Frame pages
    capture_pageleave: false,
  })
  initialized = true
}

/**
 * Track a raw PostHog event. Safe to call server-side (no-ops).
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !initialized) return
  posthog.capture(event, properties)
}

/** Typed event helpers */
export const analytics = {
  frameViewed(market: string, fid?: number): void {
    trackEvent('frame_viewed', { market, fid })
  },

  frameButtonClicked(buttonIndex: number, market: string, fid?: number): void {
    trackEvent('frame_button_clicked', { button_index: buttonIndex, market, fid })
  },

  depositInitiated(amountUsdc: number, market: string): void {
    trackEvent('deposit_initiated', { amount_usdc: amountUsdc, market })
  },

  previewViewed(deposited: number, currentValue: number, apy: number): void {
    trackEvent('preview_viewed', { deposited, current_value: currentValue, apy })
  },

  dashboardOpened(fid?: number): void {
    trackEvent('dashboard_opened', { fid })
  },
}
