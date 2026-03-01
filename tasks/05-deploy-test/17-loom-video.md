# Task #17: Loom "$100→$112" Video Demo

**Status:** ⏳ Manual step (requires live Vercel deploy first)
**Est:** 1h
**Priority:** P2
**Phase:** Test + Deploy

## Acceptance Criteria

- [ ] Loom video recorded (< 3 min)
- [ ] Shows: Farcaster cast → Frame → "$100→$112" deposit flow
- [ ] `public/loom.mp4` placeholder in repo (link in README)
- [ ] Video embedded in README with thumbnail
- [ ] Demo ready for Batch 003 presentation

## Demo Script

```
0:00 - 0:20: Intro
"Hi, this is Foresight Apps — deposit USDC into yield vaults
directly from Farcaster, no app switching required."

0:20 - 0:50: Frame Demo
- Open Warpcast on mobile
- Find/post cast with frame URL
- Show: Frame renders with "$100→$112" image
- Click "Deposit $100 → Earn 12% APY" button
- Show: Coinbase Wallet prompts transaction
- Confirm tx (use testnet/small amount for safety)

0:50 - 1:20: Preview Yield
- Click "Preview Yield" button in frame
- Show: Updated frame with "$100 → $112 in 30 days"
- Show: 12% APY callout

1:20 - 1:50: Dashboard
- Open /dashboard
- Show: Portfolio value, APY, yield accruing
- Show: PostHog dashboard (optional) with frame events

1:50 - 2:10: Outro
"Built on Base, powered by Farcaster Frames.
Live at foresight-apps.vercel.app"
```

## README Embed

```markdown
## Demo

[![$100→$112 Demo](https://cdn.loom.com/sessions/<id>/thumbnail.gif)](https://loom.com/share/<id>)

Watch the 2-min demo: deposit $100 USDC → earn 12% APY via Farcaster Frame.
```

## Recording Setup

```bash
# Loom desktop app
# Resolution: 1920×1080
# Microphone: On
# Webcam: Optional (face cam adds trust)

# Test environment before recording:
# - Warpcast on phone (mirrored to screen)
# - Testnet USDC in wallet
# - Frame URL bookmarked
```

**Next:** Task #18 — Farcaster SEO Metadata
