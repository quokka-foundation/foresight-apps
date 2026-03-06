/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLDivElement>) =>
      React.createElement('div', { ...props, ref }, children)),
    button: React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLButtonElement>) =>
      React.createElement('button', { ...props, ref }, children)),
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) {
    return React.createElement('a', { href, ...props }, children);
  };
});

import { PortfolioCard } from '@/components/PortfolioCard';
import type { Position } from '@/lib/types';

const profitPosition: Position = {
  id: 'pos-1',
  marketId: 'btc-150k',
  marketTitle: 'BTC > $150K by July',
  direction: 'yes',
  entryProbability: 58.3,
  currentProbability: 62.1,
  amount: 50,
  leverage: 5,
  currentValue: 82.6,
  pnl: 32.6,
  pnlPercent: 10.87,
  entryDate: '2026-02-20T14:15:00Z',
  status: 'open',
};

const lossPosition: Position = {
  id: 'pos-4',
  marketId: 'eth-10k',
  marketTitle: 'ETH > $10K by EOY',
  direction: 'yes',
  entryProbability: 31.2,
  currentProbability: 28.7,
  amount: 25,
  leverage: 3,
  currentValue: 18.95,
  pnl: -6.05,
  pnlPercent: -24.2,
  entryDate: '2026-03-01T11:45:00Z',
  status: 'open',
};

describe('PortfolioCard', () => {
  it('renders market title', () => {
    render(<PortfolioCard position={profitPosition} />);
    expect(screen.getByText('BTC > $150K by July')).toBeInTheDocument();
  });

  it('shows direction badge', () => {
    render(<PortfolioCard position={profitPosition} />);
    expect(screen.getByText('YES')).toBeInTheDocument();
  });

  it('shows leverage info', () => {
    render(<PortfolioCard position={profitPosition} />);
    expect(screen.getByText('5x')).toBeInTheDocument();
  });

  it('shows positive PnL with correct formatting', () => {
    render(<PortfolioCard position={profitPosition} />);
    expect(screen.getByText('+10.9%')).toBeInTheDocument();
  });

  it('shows negative PnL for loss positions', () => {
    render(<PortfolioCard position={lossPosition} />);
    expect(screen.getByText('-24.2%')).toBeInTheDocument();
  });

  it('shows invested and current value', () => {
    render(<PortfolioCard position={profitPosition} />);
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$82.60')).toBeInTheDocument();
  });

  it('shows entry probability', () => {
    render(<PortfolioCard position={profitPosition} />);
    expect(screen.getByText('58.3%')).toBeInTheDocument();
  });

  it('links to curve detail page', () => {
    render(<PortfolioCard position={profitPosition} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/curve/btc-150k');
  });
});
