/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import type { Time } from "lightweight-charts";
import { createChart } from "lightweight-charts";
import { TradingViewChart } from "../../../components/TradingViewChart";

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

const mockPriceData = [
  { time: 1709251200 as Time, value: 45.5 },
  { time: 1709337600 as Time, value: 47.3 },
  { time: 1709424000 as Time, value: 48.1 },
];

const mockVolData = [
  { time: 1709251200 as Time, value: 120000, color: "rgba(0, 211, 149, 0.35)" },
  { time: 1709337600 as Time, value: 85000, color: "rgba(0, 82, 255, 0.15)" },
];

const mockMarkers = [
  {
    time: 1709251200 as Time,
    position: "belowBar" as const,
    color: "#0052FF",
    shape: "arrowUp" as const,
    text: "BUY 3x",
    size: 2,
  },
];

describe("TradingViewChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the chart container", () => {
    const { container } = render(<TradingViewChart priceData={mockPriceData} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders all 5 time range pills", () => {
    render(<TradingViewChart priceData={mockPriceData} />);
    expect(screen.getByText("1H")).toBeInTheDocument();
    expect(screen.getByText("1D")).toBeInTheDocument();
    expect(screen.getByText("1W")).toBeInTheDocument();
    expect(screen.getByText("1M")).toBeInTheDocument();
    expect(screen.getByText("ALL")).toBeInTheDocument();
  });

  it("highlights the active time range", () => {
    render(<TradingViewChart priceData={mockPriceData} activeRange="1W" />);
    const weekBtn = screen.getByText("1W");
    expect(weekBtn.className).toContain("bg-white");
    expect(weekBtn.className).toContain("text-ios-blue");
  });

  it("calls onRangeChange when a time pill is clicked", () => {
    const onRangeChange = jest.fn();
    render(<TradingViewChart priceData={mockPriceData} onRangeChange={onRangeChange} />);
    fireEvent.click(screen.getByText("1W"));
    expect(onRangeChange).toHaveBeenCalledWith("1W");
  });

  it("shows hover-to-inspect text when no crosshair active", () => {
    render(<TradingViewChart priceData={mockPriceData} />);
    expect(screen.getByText("Hover to inspect")).toBeInTheDocument();
  });

  it("calls createChart on mount", () => {
    render(<TradingViewChart priceData={mockPriceData} />);
    expect(createChart).toHaveBeenCalled();
  });

  it("renders with volume data without errors", () => {
    const { container } = render(
      <TradingViewChart priceData={mockPriceData} volumeData={mockVolData} />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with markers without errors", () => {
    const { container } = render(
      <TradingViewChart priceData={mockPriceData} markers={mockMarkers} />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with overlay data without errors", () => {
    const overlayData = [
      { time: 1709251200 as Time, value: 0 },
      { time: 1709337600 as Time, value: 5.2 },
    ];
    const { container } = render(
      <TradingViewChart priceData={mockPriceData} overlayData={overlayData} />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies positive colors by default", () => {
    const { container } = render(<TradingViewChart priceData={mockPriceData} isPositive={true} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies negative colors when isPositive=false", () => {
    const { container } = render(<TradingViewChart priceData={mockPriceData} isPositive={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("cleans up chart on unmount", () => {
    const { unmount } = render(<TradingViewChart priceData={mockPriceData} />);
    const chartInstance = (createChart as jest.Mock).mock.results[
      (createChart as jest.Mock).mock.results.length - 1
    ].value;
    unmount();
    expect(chartInstance.remove).toHaveBeenCalled();
  });

  it("renders with custom height", () => {
    const { container } = render(<TradingViewChart priceData={mockPriceData} height={400} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
