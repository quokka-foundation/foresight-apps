'use client';

import {
  createPortal,
  type RootState,
  useFrame,
  useThree,
} from '@react-three/fiber';
import { saveGlState } from '@/lib/webgl/saveGlState';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';

/**
 * RenderTexture — renders children into an off-screen FBO via createPortal.
 *
 * Pattern ported from Base website: renders a 3D scene into a WebGLRenderTarget,
 * then exposes that texture (via <primitive attach="map">) for use in a
 * post-processing shader (e.g., halftone dot-matrix).
 *
 * Usage:
 *   <RenderTexture fbo={fbo} width={512} height={512}>
 *     <MyScene />
 *   </RenderTexture>
 */

type RenderTextureContextType = {
  isInsideRenderTexture: boolean;
  width: number;
  height: number;
  aspect: number;
  isPlaying: boolean;
};

const renderTextureContext = createContext<RenderTextureContextType>({
  isInsideRenderTexture: false,
  width: 1024,
  height: 1024,
  aspect: 1,
  isPlaying: true,
});

export const useRenderTexture = () => useContext(renderTextureContext);

export type RenderTextureProps = {
  isPlaying?: boolean;
  width?: number;
  height?: number;
  attach?: string | null;
  fbo: THREE.WebGLRenderTarget;
  containerScene?: THREE.Scene;
  renderPriority?: number;
  camera?: THREE.Camera;
};

export function RenderTexture({
  isPlaying: _playing = true,
  width = 1024,
  height = 1024,
  attach,
  fbo,
  containerScene,
  renderPriority,
  camera,
  children,
}: PropsWithChildren<RenderTextureProps>) {
  const portalScene = useMemo(
    () => containerScene ?? new THREE.Scene(),
    [containerScene],
  );

  const isPlayingRef = useRef(_playing);
  const [isPlaying, setIsPlaying] = useState(_playing);

  useEffect(() => {
    fbo.setSize(width, height);
    setIsPlaying(true);
    isPlayingRef.current = true;

    if (_playing) return;

    const timer = setTimeout(() => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }, 100);

    return () => clearTimeout(timer);
  }, [fbo, _playing, width, height]);

  const contextValue = useMemo(
    () => ({
      isInsideRenderTexture: true,
      width,
      height,
      aspect: width / height,
      isPlaying,
    }),
    [width, height, isPlaying],
  );

  return (
    <>
      <renderTextureContext.Provider value={contextValue}>
        {createPortal(
          <SceneContainer
            fbo={fbo}
            renderPriority={renderPriority}
            camera={camera}
            isPlayingRef={isPlayingRef}
          >
            {children}
          </SceneContainer>,
          portalScene,
        )}
      </renderTextureContext.Provider>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <primitive object={fbo.texture} attach={attach} />
    </>
  );
}

// ---- SceneContainer: renders portal scene into FBO each frame ----

type SceneContainerProps = {
  fbo: THREE.WebGLRenderTarget;
  renderPriority?: number;
  camera?: THREE.Camera;
  isPlayingRef: React.RefObject<boolean>;
};

function SceneContainer({
  fbo,
  renderPriority,
  camera,
  isPlayingRef,
  children,
}: PropsWithChildren<SceneContainerProps>) {
  const elapsedRef = useRef(0);

  useFrame((state, delta) => {
    if (!isPlayingRef.current) return;
    elapsedRef.current += delta;

    const restoreGlState = saveGlState(state);

    state.gl.setRenderTarget(fbo);
    state.gl.clear();
    state.gl.render(state.scene, camera ?? state.camera);

    restoreGlState();
  }, renderPriority);

  return <>{children}</>;
}
