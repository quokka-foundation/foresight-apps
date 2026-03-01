# Task #13: 80% Unit Test Coverage

**Status:** ✅ Complete
**Est:** 2h
**Priority:** P2
**Phase:** Test + Deploy

## Acceptance Criteria

- [x] `npm test -- --coverage` reports ≥ 80% line coverage (94.96% lines, 88.88% branches)
- [x] All API routes tested (happy path + error cases)
- [x] `YieldCard` component renders correctly with props
- [x] `ErrorBoundary` catches errors and shows fallback
- [x] `lib/constants.ts` values match expected Base addresses

## Test Files to Create

```
test/unit/
├── viem.test.ts                ← Chain ID = 8453
├── constants.test.ts           ← USDC address, default amount
├── api/
│   ├── deposit.test.ts         ← POST returns eth_sendTransaction
│   ├── preview.test.ts         ← POST returns yield data
│   └── action.test.ts          ← Routes button indices
└── components/
    ├── YieldCard.test.tsx       ← Renders $100→$112 correctly
    └── ErrorBoundary.test.tsx   ← Catches + shows X.com link
```

## Key Test Patterns

### API Route Test
```ts
// test/unit/api/deposit.test.ts
import { POST } from '@/app/api/deposit/route'
import { NextRequest } from 'next/server'

describe('POST /api/deposit', () => {
  it('returns eth_sendTransaction for valid address', async () => {
    const req = new NextRequest('http://localhost/api/deposit', {
      method: 'POST',
      body: JSON.stringify({
        untrustedData: { address: '0x1234567890123456789012345678901234567890' }
      }),
    })
    const res = await POST(req)
    const data = await res.json()
    
    expect(data.chainId).toBe('eip155:8453')
    expect(data.method).toBe('eth_sendTransaction')
    expect(data.params.data.functionName).toBe('deposit')
  })

  it('returns 400 when address missing', async () => {
    const req = new NextRequest('http://localhost/api/deposit', {
      method: 'POST',
      body: JSON.stringify({ untrustedData: {} }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

### Component Test
```tsx
// test/unit/components/YieldCard.test.tsx
import { render, screen } from '@testing-library/react'
import { YieldCard } from '@/components/YieldCard'

test('renders deposited and current value', () => {
  render(<YieldCard deposited={100} currentValue={112} apy={12} days={30} />)
  expect(screen.getByText('$100.00')).toBeInTheDocument()
  expect(screen.getByText('$112.00')).toBeInTheDocument()
  expect(screen.getByText('12%')).toBeInTheDocument()
})
```

## Jest Config (`jest.config.ts`)

```ts
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['@testing-library/jest-dom'],
  coverageThreshold: {
    global: { lines: 80, branches: 70, functions: 80 }
  },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  testPathPattern: 'test/unit',
}
export default config
```

**Next:** Task #14 — Playwright E2E: Full User Flow
