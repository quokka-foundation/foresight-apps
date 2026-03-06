'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import type { CurvePoint } from '@/lib/types';
import { generateCurvePath, generateAreaPath } from '@/lib/curve-math';

interface CurveChartProps {
  data: CurvePoint[];
  width?: number;
  height?: number;
  accentColor?: string;
  showGrid?: boolean;
  interactive?: boolean;
  showPayoutAnnotations?: boolean;
  onHover?: (point: CurvePoint | null) => void;
}

export function CurveChart({
  data,
  width = 380,
  height = 200,
  accentColor = '#0052FF',
  showGrid = false,
  interactive = true,
  showPayoutAnnotations = false,
  onHover,
}: CurveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const padding = { top: 20, right: 8, bottom: 12, left: 8 };

  const points = useMemo(
    () => data.map((d) => ({ x: d.timestamp, y: d.probability })),
    [data]
  );

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const curvePath = useMemo(
    () => generateCurvePath(points, width, height, padding.left),
    [points, width, height]
  );

  const areaPath = useMemo(
    () => generateAreaPath(curvePath, width, height, padding.left),
    [curvePath, width, height]
  );

  // Minimal grid: only show if explicitly enabled
  const gridLines = useMemo(() => {
    if (!showGrid) return [];
    return [0, 50, 100].map((value) => {
      const y = padding.top + chartHeight - (value / 100) * chartHeight;
      return { y, value };
    });
  }, [showGrid, chartHeight]);

  // Payout annotations at sampled data points
  const payoutAnnotations = useMemo(() => {
    if (!showPayoutAnnotations || data.length < 5) return [];
    const sampleCount = 5;
    const step = Math.floor(data.length / sampleCount);
    const xMin = Math.min(...data.map((d) => d.timestamp));
    const xMax = Math.max(...data.map((d) => d.timestamp));

    return Array.from({ length: sampleCount }, (_, i) => {
      const idx = Math.min(i * step + Math.floor(step / 2), data.length - 1);
      const d = data[idx];
      const x = padding.left + ((d.timestamp - xMin) / (xMax - xMin || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.probability / 100) * chartHeight);
      const payout = Math.round(100 / (d.probability / 100)) - 100;
      return { x, y, payout: `+$${payout}`, data: d };
    });
  }, [showPayoutAnnotations, data, chartWidth, chartHeight]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!interactive || !svgRef.current || data.length === 0) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      const index = Math.round(ratio * (data.length - 1));
      const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

      setHoveredIndex(clampedIndex);
      onHover?.(data[clampedIndex]);
    },
    [interactive, data, onHover]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    onHover?.(null);
  }, [onHover]);

  // Hovered point position
  const yMin = 0;
  const yMax = 100;
  const hoveredPoint = useMemo(() => {
    if (hoveredIndex === null || data.length === 0) return null;
    const xMin = Math.min(...data.map((d) => d.timestamp));
    const xMax = Math.max(...data.map((d) => d.timestamp));
    const d = data[hoveredIndex];
    const x = padding.left + ((d.timestamp - xMin) / (xMax - xMin || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.probability - yMin) / (yMax - yMin || 1)) * chartHeight;
    return { x, y, data: d };
  }, [hoveredIndex, data, chartWidth, chartHeight]);

  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];
  const isPositive = lastPoint && firstPoint && lastPoint.probability >= firstPoint.probability;
  const lineColor = isPositive ? '#00D395' : accentColor;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          const svgEl = svgRef.current;
          if (!svgEl) return;
          const rect = svgEl.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const ratio = x / rect.width;
          const index = Math.round(ratio * (data.length - 1));
          const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
          setHoveredIndex(clampedIndex);
          onHover?.(data[clampedIndex]);
        }}
        onTouchEnd={handleMouseLeave}
      >
        <defs>
          {/* Smooth gradient fill — fading to transparent */}
          <linearGradient id="curveGradientFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
            <stop offset="60%" stopColor={lineColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
          {/* Glow filter for hover dot */}
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Glow filter for current value dot */}
          <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Minimal grid lines — thin, no dashes */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={line.y}
              x2={width - padding.right}
              y2={line.y}
              stroke="#F0F0F0"
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Area fill — smooth gradient */}
        {areaPath && (
          <path d={areaPath} fill="url(#curveGradientFill)" />
        )}

        {/* Curve line — single color, smooth */}
        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Payout annotations — minimal pill badges */}
        {payoutAnnotations.map((ann, i) => (
          <g key={i}>
            <rect
              x={ann.x - 20}
              y={ann.y - 24}
              width="40"
              height="18"
              rx="9"
              fill="white"
              opacity="0.9"
            />
            <text
              x={ann.x}
              y={ann.y - 12}
              fill="#00D395"
              fontSize="8"
              fontWeight="bold"
              fontFamily="SF Mono, monospace"
              textAnchor="middle"
            >
              {ann.payout}
            </text>
          </g>
        ))}

        {/* Hover crosshair — subtle */}
        {hoveredPoint && (
          <>
            <line
              x1={hoveredPoint.x}
              y1={padding.top}
              x2={hoveredPoint.x}
              y2={height - padding.bottom}
              stroke="#E0E0E0"
              strokeWidth="0.5"
            />
            {/* Glow dot */}
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="6"
              fill={lineColor}
              opacity="0.3"
              filter="url(#dotGlow)"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="4"
              fill={lineColor}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </>
        )}

        {/* Current value dot — with soft glow */}
        {!hoveredPoint && lastPoint && (
          <>
            <circle
              cx={width - padding.right}
              cy={padding.top + chartHeight - ((lastPoint.probability / 100) * chartHeight)}
              r="8"
              fill={isPositive ? '#00D395' : '#FF6B6B'}
              opacity="0.2"
              filter="url(#pulseGlow)"
            />
            <circle
              cx={width - padding.right}
              cy={padding.top + chartHeight - ((lastPoint.probability / 100) * chartHeight)}
              r="4"
              fill={isPositive ? '#00D395' : '#FF6B6B'}
              stroke="#FFFFFF"
              strokeWidth="2"
              className="animate-pulse"
            />
          </>
        )}
      </svg>

      {/* Hover tooltip — minimal pill */}
      {hoveredPoint && (
        <div
          className="absolute -top-10 transform -translate-x-1/2 bg-white rounded-pill px-3 py-1.5 text-xs pointer-events-none z-10 shadow-card"
          style={{ left: `${(hoveredPoint.x / width) * 100}%` }}
        >
          <span className="font-mono font-bold text-ios-text">{hoveredPoint.data.probability.toFixed(1)}%</span>
          <span className="text-ios-text-tertiary ml-1.5">
            {new Date(hoveredPoint.data.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
}
