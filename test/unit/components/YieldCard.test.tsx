// test/unit/components/YieldCard.test.tsx
// Renders deposit/value/APY/days correctly

import { render, screen } from '@testing-library/react'
import { YieldCard } from '@/components/YieldCard'

describe('YieldCard', () => {
  it('renders deposited amount', () => {
    render(<YieldCard deposited={100} currentValue={112} apy={12} days={30} />)
    expect(screen.getByText('$100.00')).toBeInTheDocument()
  })

  it('renders current value', () => {
    render(<YieldCard deposited={100} currentValue={112} apy={12} days={30} />)
    expect(screen.getByText('$112.00')).toBeInTheDocument()
  })

  it('renders APY percentage', () => {
    render(<YieldCard deposited={100} currentValue={112} apy={12} days={30} />)
    expect(screen.getByText('12%')).toBeInTheDocument()
  })

  it('renders days active', () => {
    render(<YieldCard deposited={100} currentValue={112} apy={12} days={30} />)
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('calculates and renders gain correctly', () => {
    render(<YieldCard deposited={100} currentValue={112} apy={12} days={30} />)
    // Gain = $12.00, percentage = 12.00%
    expect(screen.getByText('+$12.00 (+12.00%)')).toBeInTheDocument()
  })

  it('renders with different values', () => {
    render(<YieldCard deposited={200} currentValue={220} apy={10} days={60} />)
    expect(screen.getByText('$200.00')).toBeInTheDocument()
    expect(screen.getByText('$220.00')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
  })
})
