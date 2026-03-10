"use client";

import {
  AreaSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  LineSeries,
  LineStyle,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";
import { useCallback, useEffect, useRef, useState } from "react";

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

export type TimeRange = "1H" | "1D" | "1W" | "1M" | "ALL";

export interface ChartMarker {
  time: Time;
  position: "aboveBar" | "belowBar" | "inBar";
  color: string;
  shape: "arrowUp" | "arrowDown" | "circle";
  text?: string;
  size?: number;
}

interface TradingViewChartProps {
  /** Primary line data (price or metric over time) */
  priceData: ChartDataPoint[];
  /** Volume histogram data */
  volumeData?: VolumeDataPoint[];
  /** Secondary overlay line data */
  overlayData?: ChartDataPoint[];
  /** Data point markers */
  markers?: ChartMarker[];
  /** Currently selected time range */
  activeRange?: TimeRange;
  /** Callback when time range changes */
  onRangeChange?: (range: TimeRange) => void;
  /** Chart height in pixels */
  height?: number;
  /** Whether the trend is positive */
  isPositive?: boolean;
}

const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: "1H", label: "1H" },
  { id: "1D", label: "1D" },
  { id: "1W", label: "1W" },
  { id: "1M", label: "1M" },
  { id: "ALL", label: "ALL" },
];

export function TradingViewChart({
  priceData,
  volumeData,
  overlayData,
  markers,
  activeRange = "1M",
  onRangeChange,
  height = 300,
  isPositive = true,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const overlaySeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const [currentValue, setCurrentValue] = useState<{
    price: number;
    overlay?: number;
    time?: string;
  } | null>(null);

  // Colors from design system
  const lineColor = isPositive ? "#00D395" : "#0052FF";
  const overlayColor = isPositive ? "#00D395" : "#FF6B6B";

  // Create chart on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9CA3AF",
        fontFamily: "-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      width: container.clientWidth,
      height,
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#F0F3F7", style: LineStyle.Solid },
      },
      crosshair: {
        vertLine: {
          color: "#E8ECF0",
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: "#0052FF",
        },
        horzLine: {
          color: "#E8ECF0",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0052FF",
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

    // ---- Primary Area Series ----
    const priceSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: `${lineColor}26`,
      bottomColor: `${lineColor}05`,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: "#FFFFFF",
      crosshairMarkerBorderWidth: 2,
      crosshairMarkerBackgroundColor: lineColor,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${price.toFixed(1)}%`,
      },
    });
    priceSeries.setData(priceData);
    priceSeriesRef.current = priceSeries;

    // ---- Markers via createSeriesMarkers plugin ----
    if (markers && markers.length > 0) {
      const seriesMarkers = markers.map<SeriesMarker<Time>>((m) => ({
        time: m.time,
        position: m.position,
        color: m.color,
        shape: m.shape,
        text: m.text,
        size: m.size ?? 1,
      }));
      markersRef.current = createSeriesMarkers(priceSeries, seriesMarkers);
    }

    // ---- Volume Histogram ----
    if (volumeData && volumeData.length > 0) {
      const volSeries = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: "custom",
          formatter: (price: number) => {
            if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
            if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
            return `$${price.toFixed(0)}`;
          },
        },
        priceScaleId: "volume",
      });
      volSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });
      volSeries.setData(volumeData);
      volumeSeriesRef.current = volSeries;
    }

    // ---- Overlay Line ----
    if (overlayData && overlayData.length > 0) {
      const overlaySeries = chart.addSeries(LineSeries, {
        color: overlayColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        priceFormat: {
          type: "custom",
          formatter: (price: number) => `${price >= 0 ? "+" : ""}$${price.toFixed(2)}`,
        },
        priceScaleId: "overlay",
      });
      overlaySeries.priceScale().applyOptions({
        scaleMargins: { top: 0.1, bottom: 0.25 },
      });
      overlaySeries.setData(overlayData);
      overlaySeriesRef.current = overlaySeries;
    }

    // ---- Crosshair move handler ----
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setCurrentValue(null);
        return;
      }

      const pricePoint = param.seriesData.get(priceSeries);
      const overlayPoint = overlaySeriesRef.current
        ? param.seriesData.get(overlaySeriesRef.current)
        : undefined;

      if (pricePoint && "value" in pricePoint) {
        const timeStr =
          typeof param.time === "number"
            ? new Date(param.time * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : String(param.time);

        setCurrentValue({
          price: pricePoint.value as number,
          overlay:
            overlayPoint && "value" in overlayPoint ? (overlayPoint.value as number) : undefined,
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
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
      overlaySeriesRef.current = null;
      markersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when props change (without recreating chart)
  useEffect(() => {
    if (priceSeriesRef.current) {
      priceSeriesRef.current.setData(priceData);
    }
    if (volumeSeriesRef.current && volumeData) {
      volumeSeriesRef.current.setData(volumeData);
    }
    if (overlaySeriesRef.current && overlayData) {
      overlaySeriesRef.current.setData(overlayData);
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
  }, [priceData, volumeData, overlayData, markers]);

  const handleRangeChange = useCallback(
    (range: TimeRange) => {
      onRangeChange?.(range);
    },
    [onRangeChange],
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
                {currentValue.price.toFixed(1)}%
              </span>
              {currentValue.overlay !== undefined && (
                <span
                  className={`text-xs font-bold font-mono ${currentValue.overlay >= 0 ? "text-ios-green" : "text-ios-red"}`}
                >
                  {currentValue.overlay >= 0 ? "+" : ""}${currentValue.overlay.toFixed(2)}
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
                  ? "bg-white text-ios-blue shadow-card"
                  : "text-ios-text-tertiary hover:text-ios-text-secondary"
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
