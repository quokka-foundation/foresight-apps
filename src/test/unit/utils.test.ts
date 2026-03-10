/**
 * @jest-environment node
 */
import {
  cn,
  formatCompactUSD,
  formatPercent,
  formatUSD,
  METADATA,
  timeAgo,
  truncateAddress,
} from "../../lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
      expect(cn("base", false && "hidden", "extra")).toBe("base extra");
    });

    it("resolves Tailwind conflicts via twMerge", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("handles empty inputs", () => {
      expect(cn()).toBe("");
    });

    it("handles undefined and null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });
  });

  describe("METADATA", () => {
    it("has required fields", () => {
      expect(METADATA.name).toBe("Foresight");
      expect(METADATA.description).toBeTruthy();
      expect(METADATA.homeUrl).toMatch(/^https:\/\//);
      expect(METADATA.bannerImageUrl).toMatch(/^https:\/\//);
      expect(METADATA.iconImageUrl).toMatch(/^https:\/\//);
      expect(METADATA.splashBackgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe("formatUSD", () => {
    it("formats whole numbers", () => {
      expect(formatUSD(1000)).toBe("$1,000");
    });

    it("formats decimals", () => {
      expect(formatUSD(1234.56)).toBe("$1,234.56");
    });

    it("formats zero", () => {
      expect(formatUSD(0)).toBe("$0");
    });

    it("formats negative values", () => {
      expect(formatUSD(-500)).toBe("-$500");
    });

    it("formats large values", () => {
      expect(formatUSD(1000000)).toBe("$1,000,000");
    });

    it("truncates beyond 2 decimal places", () => {
      const result = formatUSD(1.999);
      // Intl rounds, so 1.999 → $2
      expect(result).toBe("$2");
    });
  });

  describe("formatCompactUSD", () => {
    it("formats millions", () => {
      expect(formatCompactUSD(2100000)).toBe("$2.1M");
    });

    it("formats thousands", () => {
      expect(formatCompactUSD(420000)).toBe("$420k");
    });

    it("formats small values", () => {
      expect(formatCompactUSD(50)).toBe("$50");
    });

    it("formats exactly 1M", () => {
      expect(formatCompactUSD(1000000)).toBe("$1.0M");
    });

    it("formats exactly 1K", () => {
      expect(formatCompactUSD(1000)).toBe("$1k");
    });

    it("formats zero", () => {
      expect(formatCompactUSD(0)).toBe("$0");
    });
  });

  describe("formatPercent", () => {
    it("formats positive with plus sign", () => {
      expect(formatPercent(14.2)).toBe("+14.2%");
    });

    it("formats negative with minus sign", () => {
      expect(formatPercent(-3.1)).toBe("-3.1%");
    });

    it("formats zero with plus sign", () => {
      expect(formatPercent(0)).toBe("+0.0%");
    });

    it("formats with one decimal place", () => {
      expect(formatPercent(5.678)).toBe("+5.7%");
    });
  });

  describe("timeAgo", () => {
    it("returns seconds for recent timestamps", () => {
      const now = new Date(Date.now() - 30_000).toISOString();
      expect(timeAgo(now)).toBe("30s ago");
    });

    it("returns minutes", () => {
      const now = new Date(Date.now() - 5 * 60_000).toISOString();
      expect(timeAgo(now)).toBe("5m ago");
    });

    it("returns hours", () => {
      const now = new Date(Date.now() - 3 * 3600_000).toISOString();
      expect(timeAgo(now)).toBe("3h ago");
    });

    it("returns days", () => {
      const now = new Date(Date.now() - 2 * 86400_000).toISOString();
      expect(timeAgo(now)).toBe("2d ago");
    });

    it("returns 0s ago for current time", () => {
      const now = new Date().toISOString();
      expect(timeAgo(now)).toBe("0s ago");
    });
  });

  describe("truncateAddress", () => {
    it("truncates a standard Ethereum address", () => {
      expect(truncateAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234...5678");
    });

    it("preserves first 6 and last 4 characters", () => {
      const addr = "0xabcdef1234567890abcdef1234567890abcdef12";
      const result = truncateAddress(addr);
      expect(result).toMatch(/^0xabcd/);
      expect(result).toMatch(/ef12$/);
      expect(result).toContain("...");
    });
  });
});
