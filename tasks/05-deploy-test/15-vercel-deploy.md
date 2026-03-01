# Task #15: Vercel Production Deploy

**Status:** ✅ CI/CD automated — manual prod deploy pending (set Vercel secrets)
**Est:** 0.5h
**Priority:** P1
**Phase:** Test + Deploy

## Acceptance Criteria

- [x] `npm run build` succeeds locally before deploying
- [ ] `vercel --prod` deploys to `foresight-apps.vercel.app` (manual — requires Vercel account)
- [ ] All env vars set in Vercel dashboard (manual)
- [ ] Frame validates at framescan.com with production URL (manual post-deploy)
- [x] GitHub Actions CI/CD configured via `.github/workflows/ci.yml` — auto-deploys `main` → Vercel when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets are set

## Deploy Steps

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link repo (first time)
vercel link

# 4. Set environment variables
vercel env add NEXT_PUBLIC_VAULT_ADDRESS production
# Enter: 0x<your_vault_address>

vercel env add NEXT_PUBLIC_RPC_URL production
# Enter: https://mainnet.base.org

vercel env add NEXT_PUBLIC_POSTHOG_KEY production
# Enter: phc_<your_key>

# 5. Deploy to production
vercel --prod
```

## GitHub Actions Auto-Deploy (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deploy Verification

```bash
# Check frame meta tags
curl https://foresight-apps.vercel.app/frame/usdc-vault | grep "fc:frame"

# Check API
curl -X POST https://foresight-apps.vercel.app/api/deposit \
  -H "Content-Type: application/json" \
  -d '{"untrustedData": {"address": "0x1234..."}}'
```

**Next:** Task #16 — PostHog Farcaster Analytics
