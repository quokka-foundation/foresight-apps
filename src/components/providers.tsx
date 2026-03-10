"use client";

import { type ReactNode } from "react";
import AuthProvider from "./providers/auth-provider";
import ErudaProvider from "./providers/eruda-provider";
import FrameProvider from "./providers/frame-provider";
import WagmiProvider from "./providers/wagmi-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider>
      <FrameProvider>
        <AuthProvider>
          {process.env.NODE_ENV === "development" && <ErudaProvider />}
          {children}
        </AuthProvider>
      </FrameProvider>
    </WagmiProvider>
  );
}
