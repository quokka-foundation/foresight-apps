# Foresight

Real-time on-chain alpha intelligence, delivered inside Farcaster.

## What it does

Foresight watches Base L2 24/7 and surfaces the signals that matter before they hit the crowd:

- **Smart Money Tracking** — follow wallets with a proven edge. See what they're buying, their cluster type, and their all-time volume in one tap.
- **Live Alpha Feed** — every signal (whale entries, liquidity surges, early momentum, coordinated clusters) scored by confidence and ranked by value. Tap any signal for the full breakdown.
- **Token Intelligence** — new tokens on Base ranked by volume, price change, and liquidity. Spot what's moving before it trends.
- **AI Insights** — a single-sentence take on the current market narrative, updated continuously by the AI layer.
- **Live Ticker** — a persistent price ribbon at the top of the app showing real-time prices and 24h changes for the top tokens. The app shakes to life when you open the feed.
- **Alert Subscriptions** — get Farcaster push notifications when a signal matches your criteria.

## Who it's for

Farcaster users who trade on Base and want an edge without leaving their feed. Foresight is a Mini App — it opens inside Farcaster with no install, no wallet setup friction, and Base wallet support built in.

## Key screens

| Screen | What you see |
|--------|-------------|
| Feed | Live alpha signals with type badges, confidence scores, and USD values |
| Wallets | Smart wallet leaderboard with smart scores and cluster labels |
| Tokens | New tokens on Base, sortable by volume / price / change / liquidity |
| Alerts | Notification history and alert setup |
| Profile | Wallet connection and subscription tier |

## Quick start

```bash
cp .env.example .env.local   # add your API URL + Upstash credentials
bun install
bun dev                       # http://localhost:3000
```

The app works offline-first — every screen falls back to curated mock data when `NEXT_PUBLIC_API_URL` is not set, so you can develop without a backend.

## Environment

See `.env.example` for all variables. The only one required to go live with real data is `NEXT_PUBLIC_API_URL`.

## Deployment

Deploys to Vercel. Set env vars in the Vercel dashboard. The Farcaster manifest is auto-served at `/.well-known/farcaster.json`.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind · Framer Motion · wagmi v3 · viem v2 · Base L2 · Upstash Redis · Bun
