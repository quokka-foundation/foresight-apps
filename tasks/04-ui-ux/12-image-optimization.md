# Task #12: Frame Image Optimization (WebP)

**Status:** ⏳ Not Started
**Est:** 0.25h
**Priority:** P2
**Phase:** UI/UX Polish

## Acceptance Criteria

- [ ] `yield-chart.png` served as WebP for web browsers
- [ ] Farcaster Frame still receives PNG (required by spec)
- [ ] Image loads in < 1s on mobile
- [ ] `next/image` handles format conversion automatically
- [ ] `Cache-Control: public, max-age=86400` set

## Next.js Image Config (`next.config.js`)

```js
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    // WebP served to browsers, PNG for frame meta tags
    domains: ['foresight-apps.vercel.app'],
  },
}
```

## Frame Meta Tag (PNG, not WebP)

```tsx
// Always use PNG for fc:frame:image — Farcaster requires it
'fc:frame:image': 'https://foresight-apps.vercel.app/yield-chart.png',
// NOT: /api/optimized-image (would serve WebP, breaks some clients)
```

## Component Usage

```tsx
import Image from 'next/image'

// Web use: next/image auto-serves WebP to browsers
<Image
  src="/yield-chart.png"
  width={1200}
  height={630}
  alt="$100 → $112 yield projection"
  priority  // LCP image — preload it
/>
```

## Performance Target

| Metric | Target |
|--------|--------|
| LCP | < 1.5s |
| Image size (PNG) | < 100KB |
| Image size (WebP) | < 50KB |
| Frame load | < 500ms |

**Next:** Task #13 — 80% Unit Test Coverage
