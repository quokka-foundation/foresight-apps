/**
 * @jest-environment node
 */
import { APP_URL, CHAIN_ID, ADDRESSES, DEFAULT_TRADE_AMOUNT, MAX_TRADE_AMOUNT, MIN_TRADE_AMOUNT, MAX_LEVERAGE, SAFE_LEVERAGE_THRESHOLD, IS_DEMO } from '../../lib/constants';

describe('constants', () => {
  it('APP_URL is a valid HTTPS URL', () => {
    expect(APP_URL).toMatch(/^https:\/\//);
  });

  it('CHAIN_ID is Base mainnet', () => {
    expect(CHAIN_ID).toBe(8453);
  });

  it('USDC address is correct', () => {
    expect(ADDRESSES.USDC).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
  });

  it('FORESIGHT_MARKET address is a valid hex address', () => {
    expect(ADDRESSES.FORESIGHT_MARKET).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('trade amount limits are sensible', () => {
    expect(DEFAULT_TRADE_AMOUNT).toBe(10);
    expect(MIN_TRADE_AMOUNT).toBe(1);
    expect(MAX_TRADE_AMOUNT).toBe(10_000);
    expect(MIN_TRADE_AMOUNT).toBeLessThan(DEFAULT_TRADE_AMOUNT);
    expect(DEFAULT_TRADE_AMOUNT).toBeLessThan(MAX_TRADE_AMOUNT);
  });

  it('leverage limits are set', () => {
    expect(MAX_LEVERAGE).toBe(5);
    expect(SAFE_LEVERAGE_THRESHOLD).toBe(85);
  });

  it('IS_DEMO is true when no market address is set', () => {
    // In test env, NEXT_PUBLIC_FORESIGHT_MARKET_ADDRESS is not set or is zero address
    expect(IS_DEMO).toBe(true);
  });
});
