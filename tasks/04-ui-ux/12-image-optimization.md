# Task #12: Frame Image Optimization (WebP)

**Status:** ✅ Complete
**Est:** 0.25h
**Priority:** P2
**Phase:** UI/UX Polish

## Acceptance Criteria

- [x] `yield-chart.png` served as WebP for web browsers
- [x] Farcaster Frame still receives PNG (required by spec)
- [x] Image loads in < 1s on mobile
- [x] `next/image` handles format conversion automatically
- [x] `Cache-Control: public, max-age=86400` set

## Implementation

### Next.js Image Config (`next.config.js`)

```js
images: {
  domains: ['foresight-apps.vercel.app', 'base.org'],
  formats: ['image/webp', 'image/avif'],
},
async headers() {
  return [
    {
      source: '/:file(yield-chart\\.png|.*\\.png|.*\\.jpg|.*\\.webp)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
      ],
    },
  ]
}
```

### Frame Meta Tag (PNG, not WebP)

```tsx
// Always use PNG for fc:frame:image — Farcaster requires it
'fc:frame:image': 'https://foresight-apps.vercel.app/yield-chart.png',
```

### Component (`components/YieldImage.tsx`)

```tsx
import Image from 'next/image'

export function YieldImage({ alt, className, priority = true }) {
  return (
    <div className={`relative w-full aspect-[1.91/1] overflow-hidden rounded-lg ${className}`}>
      <Image
        src="/yield-chart.png"
        alt={alt}
        fill
        priority={priority}  // LCP image — preloaded
        sizes="(max-width: 400px) 400px, 1200px"
        className="object-cover"
      />
    </div>
  )
}
```

`next/image` auto-serves WebP to browsers; PNG URL in fc:frame meta tags stays unchanged.

**Next:** Task #13 — 80% Unit Test Coverage
