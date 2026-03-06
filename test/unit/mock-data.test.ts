/**
 * @jest-environment node
 */
import { MOCK_MARKETS, getMarketById, formatUSD, formatPercent, generateCurveHistory, MOCK_POSITIONS, MOCK_PORTFOLIO, CATEGORY_CONFIG, curveToChartData, curveToVolumeData, generatePnlOverlay, generatePositionMarkers, filterByTimeRange } from '../../lib/mock-data';

describe('mock-data', () => {
  describe('MOCK_MARKETS', () => {
    it('has at least 5 markets', () => {
      expect(MOCK_MARKETS.length).toBeGreaterThanOrEqual(5);
    });

    it('all markets have required fields', () => {
      for (const m of MOCK_MARKETS) {
        expect(m.id).toBeTruthy();
        expect(m.title).toBeTruthy();
        expect(m.description).toBeTruthy();
        expect(m.category).toBeTruthy();
        expect(m.probability).toBeGreaterThan(0);
        expect(m.probability).toBeLessThan(100);
        expect(m.status).toBe('active');
        expect(Array.isArray(m.tags)).toBe(true);
      }
    });

    it('all market IDs are unique', () => {
      const ids = MOCK_MARKETS.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('getMarketById', () => {
    it('returns market for valid ID', () => {
      const market = getMarketById('btc-150k');
      expect(market).toBeDefined();
      expect(market?.title).toBe('BTC > $150K by July');
    });

    it('returns undefined for invalid ID', () => {
      expect(getMarketById('nonexistent')).toBeUndefined();
    });
  });

  describe('formatUSD', () => {
    it('formats millions', () => {
      expect(formatUSD(1_200_000)).toBe('$1.2M');
    });

    it('formats thousands', () => {
      expect(formatUSD(890_000)).toBe('$890.0K');
    });

    it('formats small amounts', () => {
      expect(formatUSD(100)).toBe('$100.00');
    });

    it('formats decimals', () => {
      expect(formatUSD(54.6)).toBe('$54.60');
    });
  });

  describe('formatPercent', () => {
    it('shows + sign for positive', () => {
      expect(formatPercent(3.2)).toBe('+3.2%');
    });

    it('shows - sign for negative', () => {
      expect(formatPercent(-2.1)).toBe('-2.1%');
    });

    it('hides sign when showSign is false', () => {
      expect(formatPercent(3.2, false)).toBe('3.2%');
    });
  });

  describe('generateCurveHistory', () => {
    it('generates correct number of points', () => {
      const points = generateCurveHistory('test', 50, 30);
      expect(points).toHaveLength(31); // 30 days + today
    });

    it('last point matches target probability', () => {
      const points = generateCurveHistory('test', 62.1, 30);
      expect(points[points.length - 1].probability).toBe(62.1);
    });

    it('all points have valid probabilities', () => {
      const points = generateCurveHistory('test', 50, 30);
      for (const p of points) {
        expect(p.probability).toBeGreaterThanOrEqual(1);
        expect(p.probability).toBeLessThanOrEqual(99);
        expect(p.volume).toBeGreaterThan(0);
        expect(p.timestamp).toBeGreaterThan(0);
      }
    });
  });

  describe('MOCK_POSITIONS', () => {
    it('has positions with valid data', () => {
      expect(MOCK_POSITIONS.length).toBeGreaterThan(0);
      for (const pos of MOCK_POSITIONS) {
        expect(pos.id).toBeTruthy();
        expect(pos.marketId).toBeTruthy();
        expect(pos.amount).toBeGreaterThan(0);
        expect(['yes', 'no']).toContain(pos.direction);
        expect(['open', 'closed', 'liquidated']).toContain(pos.status);
      }
    });
  });

  describe('MOCK_PORTFOLIO', () => {
    it('has valid portfolio summary', () => {
      expect(MOCK_PORTFOLIO.totalInvested).toBeGreaterThan(0);
      expect(MOCK_PORTFOLIO.totalValue).toBeGreaterThan(0);
      expect(MOCK_PORTFOLIO.openPositions).toBeGreaterThan(0);
      expect(MOCK_PORTFOLIO.winRate).toBeGreaterThanOrEqual(0);
      expect(MOCK_PORTFOLIO.winRate).toBeLessThanOrEqual(100);
    });
  });

  describe('CATEGORY_CONFIG', () => {
    it('has config for all market categories', () => {
      const categories = new Set(MOCK_MARKETS.map((m) => m.category));
      for (const cat of categories) {
        expect(CATEGORY_CONFIG[cat]).toBeDefined();
        expect(CATEGORY_CONFIG[cat].label).toBeTruthy();
        expect(CATEGORY_CONFIG[cat].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });

  // ---- Chart data generator tests ----

  describe('curveToChartData', () => {
    it('converts CurvePoint[] to ChartDataPoint[] with seconds timestamps', () => {
      const points = generateCurveHistory('test', 50, 5);
      const chartData = curveToChartData(points);
      expect(chartData).toHaveLength(points.length);
      for (let i = 0; i < chartData.length; i++) {
        // Time should be in seconds (not ms)
        expect(chartData[i].time as unknown as number).toBe(Math.floor(points[i].timestamp / 1000));
        expect(chartData[i].value).toBe(points[i].probability);
      }
    });

    it('returns empty array for empty input', () => {
      expect(curveToChartData([])).toEqual([]);
    });
  });

  describe('curveToVolumeData', () => {
    it('converts CurvePoint[] to VolumeDataPoint[] with color coding', () => {
      const points = generateCurveHistory('test', 50, 10);
      const volData = curveToVolumeData(points);
      expect(volData).toHaveLength(points.length);
      for (const v of volData) {
        expect(v.value).toBeGreaterThan(0);
        expect(v.color).toMatch(/^rgba\(/);
      }
    });

    it('uses green for above-average volume', () => {
      const points = generateCurveHistory('test', 50, 10);
      const avgVol = points.reduce((sum, p) => sum + p.volume, 0) / points.length;
      const volData = curveToVolumeData(points);
      for (let i = 0; i < points.length; i++) {
        if (points[i].volume >= avgVol) {
          expect(volData[i].color).toContain('0, 211, 149');
        } else {
          expect(volData[i].color).toContain('0, 82, 255');
        }
      }
    });
  });

  describe('generatePnlOverlay', () => {
    it('generates P&L data starting from entry date', () => {
      const position = MOCK_POSITIONS[0]; // entryDate: 2026-02-15
      const points = generateCurveHistory('trump-2026', 47.3, 30);
      const pnl = generatePnlOverlay(points, position);

      // Should only include points at or after entry date
      const entryTs = new Date(position.entryDate).getTime();
      const eligiblePoints = points.filter((p) => p.timestamp >= entryTs);
      expect(pnl).toHaveLength(eligiblePoints.length);
    });

    it('returns empty for position with future entry date', () => {
      const futurePos = { ...MOCK_POSITIONS[0], entryDate: '2099-01-01T00:00:00Z' };
      const points = generateCurveHistory('test', 50, 5);
      const pnl = generatePnlOverlay(points, futurePos);
      expect(pnl).toHaveLength(0);
    });

    it('calculates positive P&L for favorable YES move', () => {
      const now = Date.now();
      const points = [
        { timestamp: now - 86400000, probability: 40, volume: 100000 },
        { timestamp: now, probability: 50, volume: 100000 },
      ];
      const position = {
        ...MOCK_POSITIONS[0],
        direction: 'yes' as const,
        entryProbability: 40,
        amount: 100,
        leverage: 1,
        entryDate: new Date(now - 86400000 * 2).toISOString(),
      };
      const pnl = generatePnlOverlay(points, position);
      expect(pnl[1].value).toBe(10); // (50-40) * 100 * 1 / 100 = 10
    });
  });

  describe('generatePositionMarkers', () => {
    it('creates an entry marker for open positions', () => {
      const markers = generatePositionMarkers(MOCK_POSITIONS[0]);
      expect(markers).toHaveLength(1);
      expect(markers[0].position).toBe('belowBar');
      expect(markers[0].text).toContain('BUY');
    });

    it('creates entry + exit markers for closed positions', () => {
      const closedPos = { ...MOCK_POSITIONS[0], status: 'closed' as const, pnl: 15 };
      const markers = generatePositionMarkers(closedPos);
      expect(markers).toHaveLength(2);
      expect(markers[1].text).toContain('EXIT');
      expect(markers[1].color).toBe('#00D395'); // positive P&L = green
    });

    it('uses red for negative closed P&L', () => {
      const closedPos = { ...MOCK_POSITIONS[3], status: 'closed' as const, pnl: -6.05 };
      const markers = generatePositionMarkers(closedPos);
      expect(markers[1].color).toBe('#FF6B6B');
    });

    it('uses arrowDown for NO direction', () => {
      const noPos = MOCK_POSITIONS[2]; // direction: 'no'
      const markers = generatePositionMarkers(noPos);
      expect(markers[0].shape).toBe('arrowDown');
      expect(markers[0].text).toContain('SELL');
    });
  });

  describe('filterByTimeRange', () => {
    it('returns all data for ALL range', () => {
      const points = generateCurveHistory('test', 50, 30);
      const chartData = curveToChartData(points);
      const filtered = filterByTimeRange(chartData, 'ALL');
      expect(filtered).toHaveLength(chartData.length);
    });

    it('filters to recent data for 1D range', () => {
      const points = generateCurveHistory('test', 50, 30);
      const chartData = curveToChartData(points);
      const filtered = filterByTimeRange(chartData, '1D');
      // Should have 1-2 points (today and possibly yesterday)
      expect(filtered.length).toBeLessThanOrEqual(2);
      expect(filtered.length).toBeGreaterThanOrEqual(1);
    });

    it('filters to ~7 days for 1W range', () => {
      const points = generateCurveHistory('test', 50, 30);
      const chartData = curveToChartData(points);
      const filtered = filterByTimeRange(chartData, '1W');
      expect(filtered.length).toBeLessThanOrEqual(8);
      expect(filtered.length).toBeGreaterThanOrEqual(6);
    });

    it('returns empty for empty input', () => {
      expect(filterByTimeRange([], '1M')).toEqual([]);
    });
  });
});
