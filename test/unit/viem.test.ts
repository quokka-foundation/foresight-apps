/**
 * @jest-environment node
 */
// test/unit/viem.test.ts
// Unit tests for viem client configuration

describe('viem publicClient', () => {
  it('is configured for Base mainnet', async () => {
    const { publicClient } = await import('../../lib/viem')
    expect(publicClient.chain.id).toBe(8453)
    expect(publicClient.chain.name).toBe('Base')
  })
})
