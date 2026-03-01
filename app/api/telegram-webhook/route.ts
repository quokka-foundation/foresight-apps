// app/api/telegram-webhook/route.ts
// Telegram bot webhook handler.
// Responds to /qr <market> commands by sending the QR code image.
// Setup: POST https://api.telegram.org/bot<TOKEN>/setWebhook?url=<BASE_URL>/api/telegram-webhook

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://foresight-apps.vercel.app'

interface TelegramMessage {
  chat: { id: number }
  text?: string
}

interface TelegramUpdate {
  message?: TelegramMessage
}

async function sendTelegramPhoto(
  chatId: number,
  photoUrl: string,
  caption: string
): Promise<void> {
  if (!TELEGRAM_TOKEN) return

  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
      }),
    }
  )
}

async function sendTelegramMessage(
  chatId: number,
  text: string
): Promise<void> {
  if (!TELEGRAM_TOKEN) return

  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    }
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let update: TelegramUpdate

  try {
    update = (await req.json()) as TelegramUpdate
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const message = update?.message
  if (!message || !message.text) {
    // Non-message updates (e.g. channel posts) — ignore gracefully
    return NextResponse.json({ ok: true })
  }

  const { chat, text } = message

  if (text.startsWith('/qr')) {
    const parts = text.trim().split(/\s+/)
    const market = parts[1] ?? 'usdc-vault'

    // Validate market slug
    if (!/^[a-z0-9-]+$/.test(market)) {
      await sendTelegramMessage(chat.id, 'Invalid market name.')
      return NextResponse.json({ ok: true })
    }

    const qrUrl = `${BASE_URL}/api/telegram-qr?market=${market}`
    const caption = `Scan to open Foresight Frame: ${BASE_URL}/frame/${market}\nEarn 12% APY on Base.`

    await sendTelegramPhoto(chat.id, qrUrl, caption)
  } else if (text.startsWith('/start')) {
    await sendTelegramMessage(
      chat.id,
      'Welcome to Foresight! Use /qr usdc-vault to get a QR code linking to our Farcaster Frame.'
    )
  }

  return NextResponse.json({ ok: true })
}
