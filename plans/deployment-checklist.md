# Deployment Checklist

## Target: Vercel Production

**URL:** `https://foresight-apps.vercel.app`
**Branch:** `main` → auto-deploy on push

## Pre-Deploy Checklist

### Code Quality
- [ ] `npm run lint` passes (zero warnings)
- [ ] `npm run type-check` passes (zero errors)
- [ ] `npm test -- --coverage` ≥ 80% coverage
- [ ] `npm run test:e2e` all E2E pass

### Frame Validation
- [ ] `yield-chart.png` is 1200×630px
- [ ] Frame validates at [framescan.com](https://framescan.com)
- [ ] All 3 buttons render correctly in Warpcast
- [ ] `fc:frame:post_url` points to production URL

### Environment Variables (Vercel)
- [ ] `NEXT_PUBLIC_RPC_URL` = Base RPC endpoint
- [ ] `NEXT_PUBLIC_VAULT_ADDRESS` = deployed vault address
- [ ] `NEXT_PUBLIC_CHAIN_ID` = `8453`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` = PostHog project key
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` = `https://app.posthog.com`

### Contract Verification
- [ ] Vault deployed on Base mainnet
- [ ] Vault address verified on Basescan
- [ ] `vault.deposit(100e6, user)` tested on mainnet
- [ ] `vault.previewRedeem(shares)` returns correct value

## Vercel Deploy Steps

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link project
vercel link

# 3. Set env vars
vercel env add NEXT_PUBLIC_VAULT_ADDRESS production
vercel env add NEXT_PUBLIC_RPC_URL production

# 4. Deploy
vercel --prod

# 5. Verify
curl https://foresight-apps.vercel.app/frame/usdc-vault | grep fc:frame
```

## Post-Deploy Verification

- [ ] Homepage loads at production URL
- [ ] `/frame/usdc-vault` returns valid Frame HTML
- [ ] `/api/deposit` POST returns `eth_sendTransaction` JSON
- [ ] `/api/preview` POST returns yield data
- [ ] PostHog receiving events from production
- [ ] No console errors in Vercel logs

## Rollback Plan

If deploy breaks:
1. `vercel rollback` in CLI
2. Check Vercel build logs for errors
3. Fix locally, push to branch, review PR before merging to main
