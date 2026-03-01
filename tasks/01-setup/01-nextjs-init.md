# Task #1: Next.js 15 + Tailwind + TypeScript Setup

**Status:** ✅ Complete
**Est:** 0.5h
**Priority:** P1
**Phase:** Setup

## Acceptance Criteria

- [x] `npx create-next-app@15 foresight-apps --ts --tailwind --app` (or this repo is already init'd)
- [x] TypeScript strict mode enabled in `tsconfig.json`
- [x] Tailwind config includes Farcaster colors (`#1DA1F2` blue, `#8A63D2` purple)
- [x] `npm run lint` passes with zero errors
- [x] `npm run dev` starts on `localhost:3000`

## Commands

```bash
npx create-next-app@15 foresight-apps --ts --tailwind --app --src-dir --import-alias "@/*"
cd foresight-apps
npm pkg set scripts.lint="next lint"
npm pkg set scripts.type-check="tsc --noEmit"
git add . && git commit -m "chore: init Next.js 15 + Tailwind"
```

## Key Files

- `tailwind.config.js` — Farcaster color tokens
- `tsconfig.json` — `"strict": true`
- `app/globals.css` — `@tailwind base/components/utilities`
- `app/layout.tsx` — Root layout with Inter font

## Verification

```bash
npm run dev    # localhost:3000 shows Next.js default
npm run lint   # zero warnings
npm run type-check  # zero errors after npm install
```

## Notes

- Use `moduleResolution: "bundler"` in tsconfig for Next.js 15 compatibility
- Set `reactStrictMode: true` in `next.config.js`
- Next.js 15: dynamic route `params` must be typed as `Promise<{ ... }>` and awaited

**Next:** Task #2 — Install Core Dependencies
