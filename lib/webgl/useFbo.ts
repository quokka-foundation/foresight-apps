import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { RenderTargetOptions } from 'three';

export function useFBO(
  width: number,
  height: number,
  options: RenderTargetOptions,
): THREE.WebGLRenderTarget {
  const target = useMemo(() => {
    return new THREE.WebGLRenderTarget(width, height, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    target.setSize(width, height);
  }, [width, height, target]);

  useEffect(() => {
    return () => { target.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return target;
}
