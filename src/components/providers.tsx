"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import AuthProvider from "./providers/auth-provider";
import ErudaProvider from "./providers/eruda-provider";
import FrameProvider from "./providers/frame-provider";
import WagmiProvider from "./providers/wagmi-provider";

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient per component instance to avoid shared state across requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30s — signals update via Realtime anyway
            gcTime: 5 * 60_000, // 5 min cache
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider>
        <FrameProvider>
          <AuthProvider>
            {process.env.NODE_ENV === "development" && <ErudaProvider />}
            {children}
          </AuthProvider>
        </FrameProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
