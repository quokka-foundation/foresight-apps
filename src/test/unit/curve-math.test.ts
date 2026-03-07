/**
 * @jest-environment node
 */
import {
  calculatePayout,
  calculateCost,
  calculatePnL,
  estimateSlippage,
  estimateGas,
  calculateSafetyScore,
  generateCurvePath,
  generateAreaPath,
} from '../../lib/curve-math';

describe('curve-math', () => {
  describe('calculatePayout', () => {
    it('calculates correct payout at 50%', () => {
      expect(calculatePayout(100, 50, 1)).toBe(200);
    });

    it('calculates higher payout at lower probability', () => {
      const payout = calculatePayout(100, 20, 1);
      expect(payout).toBe(500);
    });

    it('applies leverage multiplier', () => {
      const base = calculatePayout(100, 50, 1);
      const leveraged = calculatePayout(100, 50, 3);
      expect(leveraged).toBe(base * 3);
    });

    it('returns 0 for edge probabilities', () => {
      expect(calculatePayout(100, 0, 1)).toBe(0);
      expect(calculatePayout(100, 100, 1)).toBe(0);
    });
  });

  describe('calculateCost', () => {
    it('calculates cost basis correctly', () => {
      expect(calculateCost(100, 50)).toBe(50);
      expect(calculateCost(100, 25)).toBe(25);
    });
  });

  describe('calculatePnL', () => {
    it('returns positive PnL when probability moves in favor (YES)', () => {
      const result = calculatePnL(100, 40, 50, 1, 'yes');
      expect(result.pnl).toBeGreaterThan(0);
      expect(result.pnlPercent).toBeGreaterThan(0);
      expect(result.currentValue).toBeGreaterThan(100);
    });

    it('returns negative PnL when probability moves against (YES)', () => {
      const result = calculatePnL(100, 50, 40, 1, 'yes');
      expect(result.pnl).toBeLessThan(0);
      expect(result.currentValue).toBeLessThan(100);
    });

    it('NO direction benefits from probability decrease', () => {
      const result = calculatePnL(100, 60, 50, 1, 'no');
      expect(result.pnl).toBeGreaterThan(0);
    });

    it('leverage amplifies PnL', () => {
      const base = calculatePnL(100, 40, 50, 1, 'yes');
      const leveraged = calculatePnL(100, 40, 50, 3, 'yes');
      expect(Math.abs(leveraged.pnlPercent)).toBeGreaterThan(Math.abs(base.pnlPercent));
    });
  });

  describe('estimateSlippage', () => {
    it('returns low slippage for small trades', () => {
      expect(estimateSlippage(100, 1_000_000)).toBeLessThan(1);
    });

    it('returns higher slippage for large trades', () => {
      const small = estimateSlippage(100, 1_000_000);
      const large = estimateSlippage(100_000, 1_000_000);
      expect(large).toBeGreaterThan(small);
    });

    it('caps at 5%', () => {
      expect(estimateSlippage(1_000_000, 100)).toBe(5);
    });

    it('returns 5% for zero liquidity', () => {
      expect(estimateSlippage(100, 0)).toBe(5);
    });
  });

  describe('estimateGas', () => {
    it('returns estimated gas cost', () => {
      expect(estimateGas()).toBe(0.15);
    });
  });

  describe('calculateSafetyScore', () => {
    it('returns 95 for 1x leverage', () => {
      expect(calculateSafetyScore(1)).toBe(95);
    });

    it('returns 88 for 3x leverage', () => {
      expect(calculateSafetyScore(3)).toBe(88);
    });

    it('returns 72 for 5x leverage', () => {
      expect(calculateSafetyScore(5)).toBe(72);
    });

    it('returns lower scores for higher leverage', () => {
      const low = calculateSafetyScore(1);
      const high = calculateSafetyScore(10);
      expect(high).toBeLessThan(low);
    });

    it('never goes below 50', () => {
      expect(calculateSafetyScore(100)).toBeGreaterThanOrEqual(50);
    });
  });

  describe('generateCurvePath', () => {
    const points = [
      { x: 0, y: 30 },
      { x: 1, y: 50 },
      { x: 2, y: 45 },
      { x: 3, y: 60 },
    ];

    it('returns empty string for less than 2 points', () => {
      expect(generateCurvePath([{ x: 0, y: 50 }], 100, 100)).toBe('');
    });

    it('generates valid SVG path', () => {
      const path = generateCurvePath(points, 380, 200, 8);
      expect(path).toMatch(/^M /);
      expect(path).toContain('C ');
    });

    it('respects dimensions', () => {
      const path = generateCurvePath(points, 380, 200, 8);
      expect(path).toBeTruthy();
    });
  });

  describe('generateAreaPath', () => {
    it('returns empty string for empty curve', () => {
      expect(generateAreaPath('', 100, 100)).toBe('');
    });

    it('appends closing path to curve', () => {
      const curve = 'M 0,50 C 25,50 25,30 50,30';
      const area = generateAreaPath(curve, 100, 100, 8);
      expect(area).toContain(curve);
      expect(area).toContain('L ');
      expect(area).toContain('Z');
    });
  });
});
