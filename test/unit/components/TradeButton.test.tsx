/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLButtonElement>) =>
      React.createElement('button', { ...props, ref }, children)),
  },
}));

import { TradeButton } from '@/components/TradeButton';

describe('TradeButton', () => {
  it('renders label text', () => {
    render(<TradeButton label="Trade $10" onClick={() => {}} />);
    expect(screen.getByText('Trade $10')).toBeInTheDocument();
  });

  it('renders sublabel when provided', () => {
    render(<TradeButton label="Trade" sublabel="3x → $200 potential" onClick={() => {}} />);
    expect(screen.getByText('3x → $200 potential')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<TradeButton label="Trade" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<TradeButton label="Trade" onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<TradeButton label="Trade" onClick={() => {}} loading />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled during loading', () => {
    const handleClick = jest.fn();
    render(<TradeButton label="Trade" onClick={handleClick} loading />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
