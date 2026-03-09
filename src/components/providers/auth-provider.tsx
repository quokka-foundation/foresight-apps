"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccount, useSignMessage } from "wagmi";
import { clearJwt, decodeJwt, getStoredJwt, isJwtExpired, performSiweAuth } from "@/lib/auth";
import type { AuthState } from "@/lib/types";

interface AuthContextValue extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  userId: null,
  walletAddress: null,
  jwt: null,
  signIn: async () => {},
  signOut: () => {},
  isLoading: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Restore JWT from localStorage on mount
  useEffect(() => {
    const stored = getStoredJwt();
    if (stored && !isJwtExpired(stored)) {
      setJwt(stored);
    } else if (stored) {
      clearJwt();
    }
  }, []);

  // Clear JWT if wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setJwt(null);
      clearJwt();
    }
  }, [isConnected]);

  const signIn = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const token = await performSiweAuth(address, signMessageAsync);
      setJwt(token);
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync]);

  const signOut = useCallback(() => {
    setJwt(null);
    clearJwt();
  }, []);

  const decoded = jwt ? decodeJwt(jwt) : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!jwt && !isJwtExpired(jwt),
      userId: decoded?.sub ?? null,
      walletAddress: decoded?.walletAddress ?? null,
      jwt,
      signIn,
      signOut,
      isLoading,
    }),
    [jwt, decoded, signIn, signOut, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
