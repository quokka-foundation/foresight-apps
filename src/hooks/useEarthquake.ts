"use client";

import { useCallback, useRef, useState } from "react";

const SHAKE_DURATION = 700;

/**
 * Returns a boolean `shaking` flag and a `triggerEarthquake` callback.
 * While shaking is true, apply the `animate-earthquake` CSS class.
 */
export function useEarthquake() {
  const [shaking, setShaking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerEarthquake = useCallback(() => {
    if (timer.current) return; // guard against double-trigger
    setShaking(true);
    timer.current = setTimeout(() => {
      setShaking(false);
      timer.current = null;
    }, SHAKE_DURATION);
  }, []);

  return { shaking, triggerEarthquake } as const;
}
