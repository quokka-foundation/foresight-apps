# Task #7: Static "$100→$112" PNG Embed

**Status:** ⏳ Not Started
**Est:** 0.5h
**Priority:** P2
**Phase:** Wallet Features

## Acceptance Criteria

- [ ] `public/yield-chart.png` exists at exactly 1200×630px
- [ ] Image shows "$100 → $112" bar chart with 12% APY callout
- [ ] Next.js `<Image>` serves it with WebP optimization
- [ ] Frame meta tags reference `/yield-chart.png`

## Image Spec

```
Dimensions: 1200 × 630px (Farcaster 1.91:1 required)
Format: PNG (source), WebP (served by Next.js)
Background: Dark (#0a0b1e)
Content:
  - Left bar: $100 (gray)
  - Right bar: $112 (green)
  - Label: "+12% APY in 30 days"
  - Foresight logo top-left
  - Base chain badge bottom-right
```

## Create Placeholder (Day 1)

```bash
# Quick placeholder using ImageMagick
convert -size 1200x630 xc:#0a0b1e \
  -fill '#1DA1F2' -font Arial-Bold -pointsize 72 \
  -annotate +100+315 '$100 → $112' \
  -fill '#00C851' -pointsize 36 \
  -annotate +100+400 '12% APY in 30 days' \
  public/yield-chart.png
```

## Next.js Image Component (`components/YieldImage.tsx`)

```tsx
import Image from 'next/image'

export function YieldImage() {
  return (
    <div className="relative w-full aspect-[1.91/1]">
      <Image
        src="/yield-chart.png"
        alt="$100 → $112 yield projection at 12% APY"
        fill
        priority
        className="object-cover rounded-lg"
      />
    </div>
  )
}
```

## Dynamic OG Image (Future)

Use `next/og` to generate the image dynamically with live yield data:
```ts
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'
export async function GET(req) {
  return new ImageResponse(<YieldOGImage />, { width: 1200, height: 630 })
}
```

**Next:** Task #8 — Mantine Mobile-First UI
