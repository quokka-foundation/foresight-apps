'use client';

import { type ReactNode } from 'react';
import WagmiProvider from './providers/wagmi-provider';
import FrameProvider from './providers/frame-provider';
import ErudaProvider from './providers/eruda-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider>
      <FrameProvider>
        {process.env.NODE_ENV === 'development' && <ErudaProvider />}
        {children}
      </FrameProvider>
    </WagmiProvider>
  );
}
