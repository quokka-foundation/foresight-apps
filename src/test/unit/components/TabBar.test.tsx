/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: React.PropsWithChildren<{ href: string } & Record<string, unknown>>) {
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { TabBar } from '@/components/TabBar';

describe('TabBar', () => {
  beforeEach(() => {
    const { usePathname } = require('next/navigation');
    usePathname.mockReturnValue('/');
  });

  it('renders all 4 tabs with aria-labels', () => {
    render(<TabBar />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Predictions')).toBeInTheDocument();
    expect(screen.getByLabelText('Wallet')).toBeInTheDocument();
    expect(screen.getByLabelText('Create')).toBeInTheDocument();
  });

  it('renders correct links', () => {
    render(<TabBar />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute('href', '/');
    expect(links[1]).toHaveAttribute('href', '/portfolio');
    expect(links[2]).toHaveAttribute('href', '/wallet');
    expect(links[3]).toHaveAttribute('href', '/create');
  });

  it('highlights Home tab on home page', () => {
    const { usePathname } = require('next/navigation');
    usePathname.mockReturnValue('/');
    render(<TabBar />);
    const homeLink = screen.getByLabelText('Home');
    expect(homeLink.className).toContain('text-illoblack');
  });

  it('highlights Predictions tab on portfolio page', () => {
    const { usePathname } = require('next/navigation');
    usePathname.mockReturnValue('/portfolio');
    render(<TabBar />);
    const predictionsLink = screen.getByLabelText('Predictions');
    expect(predictionsLink.className).toContain('text-illoblack');
  });

  it('highlights Wallet tab on wallet page', () => {
    const { usePathname } = require('next/navigation');
    usePathname.mockReturnValue('/wallet');
    render(<TabBar />);
    const walletLink = screen.getByLabelText('Wallet');
    expect(walletLink.className).toContain('text-illoblack');
  });
});
