"use client";

import { type DependencyList, useEffect, useState } from "react";
import { API_URL } from "@/lib/constants";

export interface ApiState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useApiData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: DependencyList = [],
): ApiState<T> {
  const isConfigured = !!API_URL;
  const [state, setState] = useState<ApiState<T>>({
    data: fallback,
    loading: isConfigured,
    error: null,
  });

  useEffect(
    () => {
      if (!isConfigured) return;
      let cancelled = false;
      setState((s) => ({ ...s, loading: true, error: null }));
      fetcher()
        .then((data) => {
          if (!cancelled) setState({ data, loading: false, error: null });
        })
        .catch((err: unknown) => {
          if (!cancelled)
            setState({
              data: fallback,
              loading: false,
              error: err instanceof Error ? err.message : "Request failed",
            });
        });
      return () => {
        cancelled = true;
      };
    },
    // deps intentionally managed by caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  return state;
}
