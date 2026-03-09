/**
 * @jest-environment node
 */
import { ADDRESSES, APP_URL, CHAIN_ID } from "../../lib/constants";

describe("constants", () => {
  it("APP_URL is a valid HTTPS URL", () => {
    expect(APP_URL).toMatch(/^https:\/\//);
  });

  it("CHAIN_ID is Base mainnet", () => {
    expect(CHAIN_ID).toBe(8453);
  });

  it("USDC address is correct", () => {
    expect(ADDRESSES.USDC).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
  });
});
