# Task #9: Telegram Bot QR Proxy

**Status:** ⏳ Not Started
**Est:** 1h
**Priority:** P3
**Phase:** Wallet Features

## Acceptance Criteria

- [ ] `/api/telegram-qr` generates QR code linking to Frame URL
- [ ] QR image embeds in Telegram messages via bot
- [ ] Frame URL is correctly encoded in QR
- [ ] QR is 400×400px PNG

## Use Case

Users who discover Foresight via Telegram can scan a QR code to open the Farcaster Frame directly in Warpcast.

## Implementation

```ts
// app/api/telegram-qr/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const market = searchParams.get('market') ?? 'usdc-vault'
  const frameUrl = `https://foresight-apps.vercel.app/frame/${market}`
  
  // Use QR code API (free tier)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(frameUrl)}`
  
  const qrResponse = await fetch(qrUrl)
  const qrBuffer = await qrResponse.arrayBuffer()
  
  return new NextResponse(qrBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
```

## Telegram Bot Setup (Manual)

```bash
# 1. Create bot via @BotFather
# 2. Set webhook: POST /api/telegram-webhook
# 3. Bot responds to /qr command with QR image

# Bot command: /qr usdc-vault
# Bot response: [QR image] + "Scan to deposit on Foresight"
```

## Telegram Webhook Handler

```ts
// app/api/telegram-webhook/route.ts
export async function POST(req: NextRequest) {
  const { message } = await req.json()
  
  if (message?.text?.startsWith('/qr')) {
    const market = message.text.split(' ')[1] ?? 'usdc-vault'
    const qrUrl = `https://foresight-apps.vercel.app/api/telegram-qr?market=${market}`
    
    await sendTelegramPhoto(message.chat.id, qrUrl, '📊 Scan to open Foresight Frame')
  }
}
```

**Next:** Task #10 — Error Boundaries + X.com Redirect
