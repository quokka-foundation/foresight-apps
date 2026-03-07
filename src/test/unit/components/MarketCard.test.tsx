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
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) {
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useParams: () => ({ id: 'btc-150k' }),
}));

// Mock CardScene (dynamically imported Three.js component)
jest.mock('@/components/CardScene', () => ({
  CardScene: function MockCardScene(props: Record<string, unknown>) {
    return React.createElement('div', { 'data-testid': 'card-scene', 'data-color': props.color });
  },
}));

import { MarketCard } from '@/components/MarketCard';
import type { Market } from '@/lib/types';

const mockMarket: Market = {
  id: 'btc-150k',
  title: 'BTC > $150K by July',
  description: 'Will Bitcoin exceed $150,000 USD before July 1, 2026?',
  category: 'crypto',
  probability: 62.1,
  volume24h: 890_000,
  totalVolume: 12_300_000,
  liquidity: 2_800_000,
  change24h: 1.8,
  createdAt: '2025-12-15T00:00:00Z',
  resolutionDate: '2026-07-01T00:00:00Z',
  status: 'active',
  tags: ['crypto', 'bitcoin'],
};

describe('MarketCard', () => {
  it('renders market title', () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText('BTC > $150K by July')).toBeInTheDocument();
  });

  it('displays LIVE badge', () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('shows YES/NO outcome buttons with percentages', () => {
    render(<MarketCard market={mockMarket} />);
    // YES button shows probability
    expect(screen.getByText(/YES/)).toBeInTheDocument();
    expect(screen.getAllByText('62%').length).toBeGreaterThanOrEqual(1);
    // NO button shows complement
    expect(screen.getByText(/NO/)).toBeInTheDocument();
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('shows payout info in $100 → $XXX format', () => {
    render(<MarketCard market={mockMarket} />);
    // YES payout: 100 / 0.621 ≈ $161
    // NO payout: 100 / 0.379 ≈ $264
    const payouts = screen.getAllByText(/\$100/);
    expect(payouts.length).toBeGreaterThanOrEqual(2);
    // Green payout amounts should be present
    expect(screen.getByText('$161')).toBeInTheDocument();
    expect(screen.getByText('$264')).toBeInTheDocument();
  });

  it('renders halftone artwork areas', () => {
    const { container } = render(<MarketCard market={mockMarket} />);
    // Two CardScene instances for dot-matrix 3D artwork
    const scenes = container.querySelectorAll('[data-testid="card-scene"]');
    expect(scenes.length).toBe(2);
  });

  it('links to curve detail page', () => {
    render(<MarketCard market={mockMarket} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/curve/btc-150k');
  });

  it('renders on dark card background', () => {
    const { container } = render(<MarketCard market={mockMarket} />);
    const card = container.querySelector('.bg-illoblack');
    expect(card).toBeInTheDocument();
  });
});
