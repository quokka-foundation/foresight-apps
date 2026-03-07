/**
 * Manual mock for lightweight-charts v5
 * Used by Jest since lightweight-charts is ESM-only
 */

const mockSetData = jest.fn();
const mockPriceScale = jest.fn(() => ({ applyOptions: jest.fn() }));
const mockSetMarkers = jest.fn();

const mockSeries = {
  setData: mockSetData,
  priceScale: mockPriceScale,
};

export const createChart = jest.fn(() => ({
  addSeries: jest.fn(() => mockSeries),
  subscribeCrosshairMove: jest.fn(),
  timeScale: jest.fn(() => ({ fitContent: jest.fn() })),
  applyOptions: jest.fn(),
  remove: jest.fn(),
}));

export const createSeriesMarkers = jest.fn(() => ({
  setMarkers: mockSetMarkers,
}));

export const AreaSeries = 'AreaSeries';
export const LineSeries = 'LineSeries';
export const HistogramSeries = 'HistogramSeries';

export const ColorType = { Solid: 'Solid' } as const;
export const LineStyle = { Solid: 0, Dashed: 2 } as const;

// Type exports (no runtime value needed)
export type IChartApi = unknown;
export type ISeriesApi<T extends string> = typeof mockSeries & { __type?: T };
export type ISeriesMarkersPluginApi<T> = { setMarkers: jest.Mock; __type?: T };
export type Time = number;
export type SeriesMarker<T> = {
  time: T;
  position: string;
  color: string;
  shape: string;
  text?: string;
  size?: number;
};
