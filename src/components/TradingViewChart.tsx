'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  createChart,
  AreaSeries,
  LineSeries,
  HistogramSeries,
  createSeriesMarkers,
  ColorType,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type Time,
  type SeriesMarker,
} from 'lightweight-charts';

// ---- Types ----

export interface ChartDataPoint {
  time: Time;
  value: number;
}

export interface VolumeDataPoint {
  time: Time;
  value: number;
  color: string;
}

export type TimeRange = '1H' | '1D' | '1W' | '1M' | 'ALL';

export interface ChartMarker {
  time: Time;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle';
  text?: string;
  size?: number;
}

interface TradingViewChartProps {
  /** Probability line data */
  probabilityData: ChartDataPoint[];
  /** Volume histogram data */
  volumeData?: VolumeDataPoint[];
  /** P&L overlay line data */
  pnlData?: ChartDataPoint[];
  /** Entry/exit position markers */
  markers?: ChartMarker[];
  /** Currently selected time range */
  activeRange?: TimeRange;
  /** Callback when time range changes */
  onRangeChange?: (range: TimeRange) => void;
  /** Chart height in pixels */
  height?: number;
  /** Whether the probability trend is positive */
  isPositive?: boolean;
}

const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: '1H', label: '1H' },
  { id: '1D', label: '1D' },
  { id: '1W', label: '1W' },
  { id: '1M', label: '1M' },
  { id: 'ALL', label: 'ALL' },
];

export function TradingViewChart({
  probabilityData,
  volumeData,
  pnlData,
  markers,
  activeRange = '1M',
  onRangeChange,
  height = 300,
  isPositive = true,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const probSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const pnlSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const [currentValue, setCurrentValue] = useState<{ prob: number; pnl?: number; time?: string } | null>(null);

  // Colors from design system
  const lineColor = isPositive ? '#00D395' : '#0052FF';
  const pnlColor = isPositive ? '#00D395' : '#FF6B6B';

  // Create chart on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
        fontFamily: '-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      width: container.clientWidth,
      height,
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#F0F3F7', style: LineStyle.Solid },
      },
      crosshair: {
        vertLine: {
          color: '#E8ECF0',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: '#0052FF',
        },
        horzLine: {
          color: '#E8ECF0',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0052FF',
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: { vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: false },
    });

    chartRef.current = chart;

    // ---- Probability Area Series ----
    const probSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: `${lineColor}26`,
      bottomColor: `${lineColor}05`,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: '#FFFFFF',
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: lineColor,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `${price.toFixed(1)}%`,
      },
    });
    probSeries.setData(probabilityData);
    probSeriesRef.current = probSeries;

    // ---- Markers (entry/exit) via createSeriesMarkers plugin ----
    if (markers && markers.length > 0) {
      const seriesMarkers = markers.map<SeriesMarker<Time>>((m) => ({
        time: m.time,
        position: m.position,
        color: m.color,
        shape: m.shape,
        text: m.text,
        size: m.size ?? 1,
      }));
      markersRef.current = createSeriesMarkers(probSeries, seriesMarkers);
    }

    // ---- Volume Histogram ----
    if (volumeData && volumeData.length > 0) {
      const volSeries = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => {
            if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
            if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
            return `$${price.toFixed(0)}`;
          },
        },
        priceScaleId: 'volume',
      });
      volSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });
      volSeries.setData(volumeData);
      volumeSeriesRef.current = volSeries;
    }

    // ---- P&L Overlay Line ----
    if (pnlData && pnlData.length > 0) {
      const pnlSeries = chart.addSeries(LineSeries, {
        color: pnlColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => `${price >= 0 ? '+' : ''}$${price.toFixed(2)}`,
        },
        priceScaleId: 'pnl',
      });
      pnlSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.1, bottom: 0.25 },
      });
      pnlSeries.setData(pnlData);
      pnlSeriesRef.current = pnlSeries;
    }

    // ---- Crosshair move handler ----
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setCurrentValue(null);
        return;
      }

      const probPoint = param.seriesData.get(probSeries);
      const pnlPoint = pnlSeriesRef.current ? param.seriesData.get(pnlSeriesRef.current) : undefined;

      if (probPoint && 'value' in probPoint) {
        const timeStr = typeof param.time === 'number'
          ? new Date(param.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : String(param.time);

        setCurrentValue({
          prob: probPoint.value as number,
          pnl: pnlPoint && 'value' in pnlPoint ? (pnlPoint.value as number) : undefined,
          time: timeStr,
        });
      }
    });

    // Fit content
    chart.timeScale().fitContent();

    // ---- Resize observer ----
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        chart.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      probSeriesRef.current = null;
      volumeSeriesRef.current = null;
      pnlSeriesRef.current = null;
      markersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when props change (without recreating chart)
  useEffect(() => {
    if (probSeriesRef.current) {
      probSeriesRef.current.setData(probabilityData);
    }
    if (volumeSeriesRef.current && volumeData) {
      volumeSeriesRef.current.setData(volumeData);
    }
    if (pnlSeriesRef.current && pnlData) {
      pnlSeriesRef.current.setData(pnlData);
    }
    if (markersRef.current && markers && markers.length > 0) {
      const seriesMarkers = markers.map<SeriesMarker<Time>>((m) => ({
        time: m.time,
        position: m.position,
        color: m.color,
        shape: m.shape,
        text: m.text,
        size: m.size ?? 1,
      }));
      markersRef.current.setMarkers(seriesMarkers);
    }
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [probabilityData, volumeData, pnlData, markers]);

  const handleRangeChange = useCallback(
    (range: TimeRange) => {
      onRangeChange?.(range);
    },
    [onRangeChange]
  );

  return (
    <div className="w-full">
      {/* Hover info bar */}
      <div className="flex items-center justify-between px-5 mb-2 h-6">
        {currentValue ? (
          <>
            <span className="text-xs text-ios-text-tertiary">{currentValue.time}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold font-mono text-ios-text">
                {currentValue.prob.toFixed(1)}%
              </span>
              {currentValue.pnl !== undefined && (
                <span className={`text-xs font-bold font-mono ${currentValue.pnl >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                  {currentValue.pnl >= 0 ? '+' : ''}${currentValue.pnl.toFixed(2)}
                </span>
              )}
            </div>
          </>
        ) : (
          <span className="text-xs text-ios-text-tertiary">Hover to inspect</span>
        )}
      </div>

      {/* Chart container */}
      <div ref={chartContainerRef} className="w-full" />

      {/* Time range selector — pill segmented control */}
      <div className="flex justify-center mt-4 px-5">
        <div className="inline-flex bg-ios-bg-secondary rounded-pill p-1 gap-0.5">
          {TIME_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => handleRangeChange(range.id)}
              className={`px-4 py-2 rounded-pill text-xs font-bold transition-all duration-200 ${
                activeRange === range.id
                  ? 'bg-white text-ios-blue shadow-card'
                  : 'text-ios-text-tertiary hover:text-ios-text-secondary'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
