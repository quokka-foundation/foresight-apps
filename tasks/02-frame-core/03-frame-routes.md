# Task #3: Farcaster Frame Dynamic Routes

**Status:** ✅ Complete
**Est:** 1h
**Priority:** P1
**Phase:** Frame Core

## Acceptance Criteria

- [x] `/frame/[market]` renders valid Farcaster Frame HTML
- [x] Dynamic `[market]` param works (`/frame/usdc-vault`, `/frame/eth-vault`)
- [x] `yield-chart.png` (1200×630) loads from `/public`
- [x] Frame validates at [framescan.com](https://framescan.com)
- [x] Skeleton loading state shows for slow connections

## File Structure

```
app/frame/[market]/
├── page.tsx      ← Frame page + generateMetadata()
└── loading.tsx   ← Tailwind skeleton

public/
└── yield-chart.png  ← 1200×630 PNG
```

## Core Frame (`app/frame/[market]/page.tsx`)

```tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': '/yield-chart.png',
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': '🚀 Deposit $100 → Earn 12% APY',
      'fc:frame:button:1:action': 'post',
      'fc:frame:button:2': '📊 Preview Yield',
      'fc:frame:button:2:action': 'post',
      'fc:frame:button:3': '🔗 Open Dashboard',
      'fc:frame:button:3:action': 'link',
      'fc:frame:button:3:target': 'https://foresight-apps.vercel.app/dashboard',
      'fc:frame:post_url': `https://foresight-apps.vercel.app/api/frame/action`,
    },
  }
}

export default async function FramePage({ params }) {
  const { market } = params
  // ... render preview UI
}
```

## Verification

```bash
# 1. Local test
npm run dev
curl http://localhost:3000/frame/usdc-vault | grep "fc:frame"

# 2. Validate at framescan.com
# Paste: http://localhost:3000/frame/usdc-vault (via ngrok)
```

**Next:** Task #4 — POST /api/deposit → vault.deposit
