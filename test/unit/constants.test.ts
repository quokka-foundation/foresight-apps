/**
 * @jest-environment node
 */
// test/unit/constants.test.ts
// Validates lib/constants.ts values match expected Base mainnet addresses

import { ADDRESSES, CHAIN_ID, DEFAULT_DEPOSIT_AMOUNT, TARGET_APY, DEMO_PROJECTION } from '../../lib/constants'

describe('constants', () => {
  describe('ADDRESSES', () => {
    it('USDC address matches Base mainnet contract', () => {
      expect(ADDRESSES.USDC).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
    })

    it('USDC address starts with 0x', () => {
      expect(ADDRESSES.USDC).toMatch(/^0x[0-9a-fA-F]{40}$/)
    })

    it('VAULT address is a valid hex address', () => {
      expect(ADDRESSES.VAULT).toMatch(/^0x[0-9a-fA-F]{40}$/)
    })
  })

  describe('CHAIN_ID', () => {
    it('is Base mainnet (8453)', () => {
      expect(CHAIN_ID).toBe(8453)
    })
  })

  describe('DEFAULT_DEPOSIT_AMOUNT', () => {
    it('is 100 USDC in 6-decimal units', () => {
      expect(DEFAULT_DEPOSIT_AMOUNT).toBe(100_000_000n)
    })

    it('is a BigInt', () => {
      expect(typeof DEFAULT_DEPOSIT_AMOUNT).toBe('bigint')
    })
  })

  describe('TARGET_APY', () => {
    it('is 12 percent', () => {
      expect(TARGET_APY).toBe(12)
    })
  })

  describe('DEMO_PROJECTION', () => {
    it('deposited is 100', () => {
      expect(DEMO_PROJECTION.deposited).toBe(100)
    })

    it('after30Days is 112', () => {
      expect(DEMO_PROJECTION.after30Days).toBe(112)
    })

    it('days is 30', () => {
      expect(DEMO_PROJECTION.days).toBe(30)
    })

    it('apy matches TARGET_APY', () => {
      expect(DEMO_PROJECTION.apy).toBe(TARGET_APY)
    })

    it('yield math is consistent (100 * 1.12 = 112)', () => {
      const { deposited, after30Days } = DEMO_PROJECTION
      // Demo uses simplified flat 12% on 100 = 112 (hardcoded, not floating-point)
      expect(after30Days).toBe(112)
      expect(after30Days / deposited).toBeCloseTo(1.12, 5)
    })
  })
})
