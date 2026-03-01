// components/ErrorBoundary.tsx
// Error boundary with fallback to X.com/foresight redirect

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Frame error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center p-6 bg-base-navy">
          <div className="text-center max-w-sm">
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4 text-sm">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <a
              href="https://x.com/foresight"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-farcaster-blue rounded-lg text-white text-sm"
            >
              Get help on X.com/foresight
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
