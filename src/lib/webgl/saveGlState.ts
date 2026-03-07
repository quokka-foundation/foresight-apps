import type { RootState } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Saves the current WebGL renderer state (render target, clear color, viewport, autoClear)
 * and returns a restore function. Used for multi-pass rendering where we need to
 * render to an FBO without clobbering the main render pass state.
 *
 * Ported from Base website: apps/web/src/hooks/useSaveGlState.ts
 */
export function saveGlState(state: RootState) {
  const prevTarget = state.gl.getRenderTarget();
  const prevClearColor = new THREE.Color();
  state.gl.getClearColor(prevClearColor);
  const prevClearAlpha = state.gl.getClearAlpha();
  const prevViewport = new THREE.Vector4();
  state.gl.getViewport(prevViewport);
  const prevAutoClear = state.gl.autoClear;

  return () => {
    state.gl.setRenderTarget(prevTarget);
    state.gl.setClearColor(prevClearColor, prevClearAlpha);
    state.gl.setViewport(prevViewport);
    state.gl.autoClear = prevAutoClear;
  };
}
