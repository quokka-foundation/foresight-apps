# Frame Specification

## Farcaster Frame v2 Implementation

### Frame Routes

| Route | Purpose |
|-------|---------|
| `/frame/[market]` | Entry frame for a yield market |
| `/api/frame/action` | POST handler for frame button clicks |
| `/api/deposit` | Initiates vault.deposit transaction |
| `/api/preview` | Returns previewRedeem data |

### Frame Meta Tags

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="/yield-chart.png" />
<meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
<meta property="fc:frame:button:1" content="🚀 Deposit $100 → Earn 12% APY" />
<meta property="fc:frame:button:1:action" content="post" />
<meta property="fc:frame:button:2" content="📊 Preview Yield" />
<meta property="fc:frame:button:2:action" content="post" />
<meta property="fc:frame:button:3" content="🔗 Open Dashboard" />
<meta property="fc:frame:button:3:action" content="link" />
<meta property="fc:frame:post_url" content="https://foresight-apps.vercel.app/api/frame/action" />
```

### Image Spec

- **Dimensions:** 1200×630px (1.91:1 ratio)
- **Format:** PNG (WebP fallback)
- **Content:** "$100→$112" yield chart with APY callout

### Button Actions

| Button | Action | Target |
|--------|--------|--------|
| Deposit $100 | `post` | `/api/deposit` |
| Preview Yield | `post` | `/api/preview` |
| Open Dashboard | `link` | `/dashboard` |

### Validation

Test frames at [framescan.com](https://framescan.com) before publishing.

### Frame Message Validation

Frames from Farcaster include `trustedData.messageBytes` — verify using `@farcaster/hub-nodejs` in production.
